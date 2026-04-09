import "server-only";

import type {
  ArchiveItem,
  RecordGalleryImage,
  RecordGalleryKey,
  RecordStage,
  RecordStatus,
} from "@/app/archive/data";

import { createSupabaseServerClient } from "./server";

type SectionRow = {
  id: string;
  code: string;
  slug: string;
  label: string;
  description: string;
  sort_order: number;
};

type RecordRow = {
  id: string;
  record_code: string;
  title: string;
  teaser: string;
  status: RecordStatus;
  items: ItemRow[] | null;
};

type ItemRow = {
  id?: string;
  item_code?: string;
  record_id: string;
  title?: string;
  note?: string;
  unit_price?: number;
  image_path: string | null;
  image_fit: "cover" | "contain";
  sort_order: number;
};

type RecordDetailRow = {
  id: string;
  record_code: string;
  title: string;
  teaser: string;
  record_date: string | null;
  share_type: "count" | "headcount";
  share_round_1: number;
  share_round_2: number | null;
  shipping: number;
  status: RecordStatus;
  stage: RecordStage;
  notes: string;
};

type RecordImageRow = {
  image_kind: RecordGalleryKey;
  label: string;
  image_path: string | null;
  sort_order: number;
};

type RecordTagRow = {
  tags: {
    name: string;
    tag_type: "generic" | "character" | "status";
  } | null;
};

type ItemTagRow = {
  item_id: string;
  tags: {
    name: string;
    tag_type: "generic" | "character" | "status";
  } | null;
};

export type ArchiveSectionNav = {
  id: string;
  code: string;
  slug: string;
  label: string;
  description: string;
};

export type ArchiveRecordCard = {
  id: string;
  title: string;
  teaser: string;
  status: RecordStatus;
  previewImage?: string;
  previewImageFit?: "cover" | "contain";
};

export type ArchiveRecordDetail = {
  section: ArchiveSectionNav;
  record: {
    id: string;
    title: string;
    teaser: string;
    date?: string;
    shareType: "count" | "headcount";
    shareRound1: number;
    shareRound2?: number;
    shipping: number;
    notes: string;
    tags: string[];
    characterTags: string[];
    status: RecordStatus;
    stage: RecordStage;
    gallery: Record<RecordGalleryKey, RecordGalleryImage>;
    items: ArchiveItem[];
  };
};

export async function getArchiveSections() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("sections")
    .select("id, code, slug, label, description, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load sections: ${error.message}`);
  }

  return (data satisfies SectionRow[]).map((section) => ({
    id: section.id,
    code: section.code,
    slug: section.slug,
    label: section.label,
    description: section.description,
  })) satisfies ArchiveSectionNav[];
}

export async function getArchiveSectionPageData(slug: string) {
  const supabase = createSupabaseServerClient();
  const sections = await getArchiveSections();
  const activeSection = sections.find((section) => section.slug === slug);

  if (!activeSection) {
    return null;
  }

  const { data: recordsData, error: recordsError } = await supabase
    .from("records")
    .select(
      "id, record_code, title, teaser, status, items(record_id, image_path, image_fit, sort_order)",
    )
    .eq("section_id", activeSection.id)
    .order("record_code", { ascending: true });

  if (recordsError) {
    throw new Error(`Failed to load records: ${recordsError.message}`);
  }

  const records = (recordsData ?? []) as RecordRow[];

  return {
    sections,
    activeSection,
    records: records.map((record) => {
      const sortedItems = [...(record.items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      const preview =
        sortedItems.find((item) => Boolean(item.image_path)) ?? sortedItems[0];

      return {
        id: record.record_code,
        title: record.title,
        teaser: record.teaser,
        status: record.status,
        previewImage: preview?.image_path ?? undefined,
        previewImageFit: preview?.image_fit ?? undefined,
      };
    }) satisfies ArchiveRecordCard[],
  };
}

export async function getArchiveRecordDetailPageData(
  slug: string,
  recordCode: string,
) {
  const supabase = createSupabaseServerClient();
  const sections = await getArchiveSections();
  const activeSection = sections.find((section) => section.slug === slug);

  if (!activeSection) {
    return null;
  }

  const { data: recordData, error: recordError } = await supabase
    .from("records")
    .select(
      "id, record_code, title, teaser, record_date, share_type, share_round_1, share_round_2, shipping, status, stage, notes",
    )
    .eq("section_id", activeSection.id)
    .eq("record_code", recordCode)
    .single();

  if (recordError || !recordData) {
    return null;
  }

  const record = recordData as RecordDetailRow;

  const [
    { data: recordImagesData, error: recordImagesError },
    { data: itemsData, error: itemsError },
    { data: recordTagsData, error: recordTagsError },
  ] = await Promise.all([
    supabase
      .from("record_images")
      .select("image_kind, label, image_path, sort_order")
      .eq("record_id", record.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("items")
      .select("id, item_code, record_id, title, note, unit_price, image_path, image_fit, sort_order")
      .eq("record_id", record.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("record_tags")
      .select("tags(name, tag_type)")
      .eq("record_id", record.id),
  ]);

  if (recordImagesError) {
    throw new Error(`Failed to load record images: ${recordImagesError.message}`);
  }

  if (itemsError) {
    throw new Error(`Failed to load items: ${itemsError.message}`);
  }

  if (recordTagsError) {
    throw new Error(`Failed to load record tags: ${recordTagsError.message}`);
  }

  const items = (itemsData ?? []) as ItemRow[];
  const itemIds = items.flatMap((item) => (item.id ? [item.id] : []));

  let itemTags: ItemTagRow[] = [];

  if (itemIds.length > 0) {
    const { data, error } = await supabase
      .from("item_tags")
      .select("item_id, tags(name, tag_type)")
      .in("item_id", itemIds);

    if (error) {
      throw new Error(`Failed to load item tags: ${error.message}`);
    }

    itemTags = (data ?? []) as ItemTagRow[];
  }

  const gallery: Record<RecordGalleryKey, RecordGalleryImage> = {
    promo: { label: "宣图" },
    sample: { label: "打样" },
    bulk: { label: "大货" },
    result: { label: "返图" },
  };

  for (const image of (recordImagesData ?? []) as RecordImageRow[]) {
    gallery[image.image_kind] = {
      label: image.label,
      image: image.image_path ?? undefined,
    };
  }

  const recordTags = ((recordTagsData ?? []) as RecordTagRow[])
    .map((entry) => entry.tags)
    .filter(Boolean);

  const itemTagsByItemId = new Map<string, { name: string; tag_type: string }[]>();

  for (const entry of itemTags) {
    const tag = entry.tags;

    if (!tag) {
      continue;
    }

    const current = itemTagsByItemId.get(entry.item_id) ?? [];
    current.push(tag);
    itemTagsByItemId.set(entry.item_id, current);
  }

  return {
    section: activeSection,
    record: {
      id: record.record_code,
      title: record.title,
      teaser: record.teaser,
      date: record.record_date ?? undefined,
      shareType: record.share_type,
      shareRound1: Number(record.share_round_1),
      shareRound2:
        record.share_round_2 !== null ? Number(record.share_round_2) : undefined,
      shipping: Number(record.shipping),
      notes: record.notes,
      tags: recordTags
        .filter((tag) => tag.tag_type === "generic" || tag.tag_type === "status")
        .map((tag) => tag.name),
      characterTags: recordTags
        .filter((tag) => tag.tag_type === "character")
        .map((tag) => tag.name),
      status: record.status,
      stage: record.stage,
      gallery,
      items: items.map((item) => {
        const tags = item.id ? itemTagsByItemId.get(item.id) ?? [] : [];

        return {
          id: item.item_code ?? "",
          title: item.title ?? "",
          note: item.note ?? "",
          image: item.image_path ?? undefined,
          imageFit: item.image_fit,
          unitPrice: Number(item.unit_price ?? 0),
          characterTags: tags
            .filter((tag) => tag.tag_type === "character")
            .map((tag) => tag.name),
          tags: tags
            .filter((tag) => tag.tag_type !== "character")
            .map((tag) => tag.name),
        };
      }),
    },
  } satisfies ArchiveRecordDetail;
}
