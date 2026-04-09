import { NextResponse } from "next/server";

import { renumberSectionRecordCodes } from "@/lib/supabase/record-codes";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type UpdateRecordPayload = {
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ recordId: string }> },
) {
  try {
    const { recordId } = await context.params;
    const payload = (await request.json()) as UpdateRecordPayload;
    const supabase = createSupabaseAdminClient();

    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("id, code")
      .eq("slug", payload.sectionSlug)
      .single();

    if (sectionError || !section) {
      return NextResponse.json({ error: "未找到对应分类。" }, { status: 400 });
    }

    const { data: existingRecord, error: recordError } = await supabase
      .from("records")
      .select("id")
      .eq("record_code", recordId)
      .single();

    if (recordError || !existingRecord) {
      return NextResponse.json({ error: "未找到对应档案。" }, { status: 404 });
    }

    const { error: updateRecordError } = await supabase
      .from("records")
      .update({
        section_id: section.id,
        title: payload.title,
        teaser: payload.teaser,
        record_date: payload.recordDate || null,
        share_type: payload.shareType,
        share_round_1: payload.shareRound1 === "" ? 0 : Number(payload.shareRound1),
        share_round_2:
          payload.shareRound2 === "" ? null : Number(payload.shareRound2),
        shipping: payload.shipping === "" ? 0 : Number(payload.shipping),
        status: payload.status,
        stage: payload.stage,
        notes: payload.notes,
      })
      .eq("id", existingRecord.id);

    if (updateRecordError) {
      return NextResponse.json(
        { error: `更新档案失败：${updateRecordError.message}` },
        { status: 500 },
      );
    }

    const galleryEntries = Object.entries(payload.gallery) as Array<
      [keyof typeof galleryLabels, string]
    >;

    for (const [kind, imagePath] of galleryEntries) {
      if (imagePath.trim() === "") {
        const { error } = await supabase
          .from("record_images")
          .delete()
          .eq("record_id", existingRecord.id)
          .eq("image_kind", kind);

        if (error) {
          return NextResponse.json(
            { error: `更新图库失败：${error.message}` },
            { status: 500 },
          );
        }

        continue;
      }

      const { error } = await supabase.from("record_images").upsert(
        {
          record_id: existingRecord.id,
          image_kind: kind,
          label: galleryLabels[kind],
          image_path: imagePath,
          sort_order: 0,
        },
        { onConflict: "record_id,image_kind,sort_order" },
      );

      if (error) {
        return NextResponse.json(
          { error: `更新图库失败：${error.message}` },
          { status: 500 },
        );
      }
    }

    const { data: existingItems, error: existingItemsError } = await supabase
      .from("items")
      .select("id, item_code, note, image_fit")
      .eq("record_id", existingRecord.id);

    if (existingItemsError) {
      return NextResponse.json(
        { error: `读取物品失败：${existingItemsError.message}` },
        { status: 500 },
      );
    }

    const existingItemsByCode = new Map(
      (existingItems ?? []).map((item) => [item.item_code, item]),
    );
    const incomingItemCodes = new Set(payload.items.map((item) => item.id));
    const removedItemIds = (existingItems ?? [])
      .filter((item) => !incomingItemCodes.has(item.item_code))
      .map((item) => item.id);

    if (removedItemIds.length > 0) {
      const { error: deleteItemsError } = await supabase
        .from("items")
        .delete()
        .in("id", removedItemIds);

      if (deleteItemsError) {
        return NextResponse.json(
          { error: `删除物品失败：${deleteItemsError.message}` },
          { status: 500 },
        );
      }
    }

    for (const [index, item] of payload.items.entries()) {
      const existingItem = existingItemsByCode.get(item.id);

      const { error } = await supabase.from("items").upsert(
        {
          id: existingItem?.id,
          item_code: item.id,
          record_id: existingRecord.id,
          title: item.title,
          note: existingItem?.note ?? "",
          unit_price: item.unitPrice === "" ? 0 : Number(item.unitPrice),
          image_path: item.image.trim() || null,
          image_fit: existingItem?.image_fit ?? "cover",
          sort_order: index + 1,
        },
        { onConflict: "item_code" },
      );

      if (error) {
        return NextResponse.json(
          { error: `更新物品失败：${error.message}` },
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
          { error: `更新标签失败：${error.message}` },
          { status: 500 },
        );
      }
    }

    const { error: deleteRelationsError } = await supabase
      .from("record_tags")
      .delete()
      .eq("record_id", existingRecord.id);

    if (deleteRelationsError) {
      return NextResponse.json(
        { error: `清理旧标签失败：${deleteRelationsError.message}` },
        { status: 500 },
      );
    }

    if (normalizedTags.length > 0) {
      const { data: tagRows, error: tagRowsError } = await supabase
        .from("tags")
        .select("id, name")
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
        record_id: existingRecord.id,
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
    const nextRecordCode = desiredCodes.get(existingRecord.id) ?? recordId;

    return NextResponse.json({
      ok: true,
      recordCode: nextRecordCode,
      sectionSlug: payload.sectionSlug,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "保存时发生未知错误。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
