import "server-only";

type AdminClient = {
  from: (table: string) => {
    select: (query: string) => any;
    update: (values: Record<string, unknown>) => any;
  };
};

type RecordCodeRow = {
  id: string;
  record_code: string;
  record_date: string | null;
  created_at: string;
};

type ItemCodeRow = {
  id: string;
  record_id: string;
  sort_order: number;
};

// 这里统一管理“按日期重排 record 编号”的逻辑。
// 规则：
// 1. 以 section 为单位排序
// 2. `-000` 永远保留，不参与重排
// 3. 其他记录按日期升序排序，从 001 开始连续编号
// 4. 物品 item_code 也会跟着 record_code 一起重排
export async function renumberSectionRecordCodes(
  supabase: AdminClient,
  sectionId: string,
  sectionCode: string,
) {
  const { data: recordRows, error: recordError } = await supabase
    .from("records")
    .select("id, record_code, record_date, created_at")
    .eq("section_id", sectionId);

  if (recordError) {
    throw new Error(`读取编号排序失败：${recordError.message}`);
  }

  const records = ((recordRows ?? []) as RecordCodeRow[]).filter(
    (record) => !record.record_code.endsWith("-000"),
  );

  records.sort((a, b) => {
    if (a.record_date && b.record_date) {
      if (a.record_date !== b.record_date) {
        return a.record_date.localeCompare(b.record_date);
      }
    } else if (a.record_date && !b.record_date) {
      return -1;
    } else if (!a.record_date && b.record_date) {
      return 1;
    }

    if (a.created_at !== b.created_at) {
      return a.created_at.localeCompare(b.created_at);
    }

    return a.id.localeCompare(b.id);
  });

  const desiredCodes = new Map<string, string>();

  records.forEach((record, index) => {
    desiredCodes.set(
      record.id,
      `${sectionCode}-${String(index + 1).padStart(3, "0")}`,
    );
  });

  const { data: itemRows, error: itemError } = await supabase
    .from("items")
    .select("id, record_id, sort_order")
    .in(
      "record_id",
      records.map((record) => record.id),
    );

  if (itemError) {
    throw new Error(`读取物品编号失败：${itemError.message}`);
  }

  const items = (itemRows ?? []) as ItemCodeRow[];

  // 第一阶段：先把所有会参与重排的 record / item 改成临时代码，避免 unique 冲突。
  for (const record of records) {
    await supabase
      .from("records")
      .update({ record_code: `tmp-${record.id}` })
      .eq("id", record.id);
  }

  for (const item of items) {
    await supabase
      .from("items")
      .update({ item_code: `tmp-${item.id}` })
      .eq("id", item.id);
  }

  // 第二阶段：写回最终 record_code。
  for (const record of records) {
    const nextCode = desiredCodes.get(record.id);

    if (!nextCode) {
      continue;
    }

    await supabase
      .from("records")
      .update({ record_code: nextCode })
      .eq("id", record.id);
  }

  // 第三阶段：按每条 record 里的 sort_order，重写 item_code。
  for (const record of records) {
    const nextCode = desiredCodes.get(record.id);

    if (!nextCode) {
      continue;
    }

    const recordItems = items
      .filter((item) => item.record_id === record.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    for (const [index, item] of recordItems.entries()) {
      await supabase
        .from("items")
        .update({ item_code: `${nextCode}-${index + 1}` })
        .eq("id", item.id);
    }
  }

  return desiredCodes;
}
