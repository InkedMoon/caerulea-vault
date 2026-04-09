import { NextResponse } from "next/server";

import { renumberSectionRecordCodes } from "@/lib/supabase/record-codes";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type CreateRecordPayload = {
  sectionSlug: string;
  title: string;
  teaser: string;
  recordDate: string;
  status: string;
  stage: string;
  shareType: "count" | "headcount";
  shareRound1: string;
  shareRound2: string;
  shipping: string;
  notes: string;
  characterTags: string;
  tags: string;
  gallery: {
    promo: string;
    sample: string;
    bulk: string;
    result: string;
  };
  items: Array<{
    id: string;
    title: string;
    unitPrice: string;
    image: string;
  }>;
};

const galleryLabels = {
  promo: "宣图",
  sample: "打样",
  bulk: "大货",
  result: "返图",
} as const;

function makeTagSlug(tagType: string, name: string) {
  return Buffer.from(`${tagType}:${name}`).toString("hex");
}

function splitTags(value: string) {
  return value
    .split("，")
    .flatMap((part) => part.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateRecordPayload;
    const supabase = createSupabaseAdminClient();

    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("id, code, slug")
      .eq("slug", payload.sectionSlug)
      .single();

    if (sectionError || !section) {
      return NextResponse.json({ error: "未找到对应分类。" }, { status: 400 });
    }

    // 新记录先用临时代码写入，真正的顺序编号会在创建完成后按日期统一重排。
    const tempRecordCode = `${section.code}-tmp-${crypto.randomUUID().slice(0, 8)}`;

    const { data: newRecord, error: insertRecordError } = await supabase
      .from("records")
      .insert({
        record_code: tempRecordCode,
        section_id: section.id,
        title: payload.title,
        teaser: payload.teaser,
        record_date: payload.recordDate || null,
        share_type: payload.shareType,
        share_round_1: payload.shareRound1 === "" ? 0 : Number(payload.shareRound1),
        share_round_2: payload.shareRound2 === "" ? null : Number(payload.shareRound2),
        shipping: payload.shipping === "" ? 0 : Number(payload.shipping),
        status: payload.status,
        stage: payload.stage,
        notes: payload.notes,
      })
      .select("id, record_code")
      .single();

    if (insertRecordError || !newRecord) {
      return NextResponse.json(
        { error: `创建档案失败：${insertRecordError?.message ?? "未知错误"}` },
        { status: 500 },
      );
    }

    const galleryEntries = Object.entries(payload.gallery) as Array<
      [keyof typeof galleryLabels, string]
    >;

    for (const [kind, imagePath] of galleryEntries) {
      if (imagePath.trim() === "") {
        continue;
      }

      const { error } = await supabase.from("record_images").insert({
        record_id: newRecord.id,
        image_kind: kind,
        label: galleryLabels[kind],
        image_path: imagePath,
        sort_order: 0,
      });

      if (error) {
        return NextResponse.json(
          { error: `创建图库失败：${error.message}` },
          { status: 500 },
        );
      }
    }

    for (const [index, item] of payload.items.entries()) {
      const itemCode = `${tempRecordCode}-${index + 1}`;

      const { error } = await supabase.from("items").insert({
        item_code: itemCode,
        record_id: newRecord.id,
        title: item.title,
        note: "",
        unit_price: item.unitPrice === "" ? 0 : Number(item.unitPrice),
        image_path: item.image.trim() || null,
        image_fit: "cover",
        sort_order: index + 1,
      });

      if (error) {
        return NextResponse.json(
          { error: `创建物品失败：${error.message}` },
          { status: 500 },
        );
      }
    }

    const characterTags = splitTags(payload.characterTags);
    const genericTags = splitTags(payload.tags);

    const normalizedTags = [
      ...characterTags.map((name) => ({ name, tag_type: "character" as const })),
      ...genericTags.map((name) => ({ name, tag_type: "generic" as const })),
    ];

    for (const tag of normalizedTags) {
      const { error } = await supabase.from("tags").upsert(
        {
          name: tag.name,
          slug: makeTagSlug(tag.tag_type, tag.name),
          tag_type: tag.tag_type,
        },
        { onConflict: "name" },
      );

      if (error) {
        return NextResponse.json(
          { error: `创建标签失败：${error.message}` },
          { status: 500 },
        );
      }
    }

    if (normalizedTags.length > 0) {
      const { data: tagRows, error: tagRowsError } = await supabase
        .from("tags")
        .select("id")
        .in(
          "name",
          normalizedTags.map((tag) => tag.name),
        );

      if (tagRowsError) {
        return NextResponse.json(
          { error: `读取标签失败：${tagRowsError.message}` },
          { status: 500 },
        );
      }

      const relations = (tagRows ?? []).map((tag) => ({
        record_id: newRecord.id,
        tag_id: tag.id,
      }));

      if (relations.length > 0) {
        const { error } = await supabase.from("record_tags").insert(relations);

        if (error) {
          return NextResponse.json(
            { error: `写入标签失败：${error.message}` },
            { status: 500 },
          );
        }
      }
    }

    const desiredCodes = await renumberSectionRecordCodes(
      supabase,
      section.id,
      section.code,
    );
    const recordCode = desiredCodes.get(newRecord.id) ?? tempRecordCode;

    return NextResponse.json({
      ok: true,
      recordCode,
      sectionSlug: section.slug,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "创建档案时发生未知错误。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
