// Item 代表一个档案记录里的具体物品。
// 比如 AK-000 这条记录下面，可能会有 AK-000-1、AK-000-2 这种不同款式的徽章。
export type ArchiveItem = {
  id: string;
  title: string;
  note: string;
  image?: string;
  imageFit?: "cover" | "contain";
  unitPrice: number;
  characterTags: string[];
  tags: string[];
};

export type RecordGalleryKey = "promo" | "sample" | "bulk" | "result";

export type RecordGalleryImage = {
  label: string;
  image?: string;
};

// 这两个字段用来拆分“状态”：
// status 是大类，stage 是更细的流程阶段。
export type RecordStatus =
  | "planned"
  | "active"
  | "archived"
  | "restart_planned";

export type RecordStage =
  | "draft_ready"
  | "promo_round_1"
  | "sample_locked"
  | "sampling"
  | "transfer"
  | "promo_round_2"
  | "bulk_payment"
  | "waiting_bulk"
  | "shipping_adjustment"
  | "shipping_collection"
  | "stocking"
  | "shipping"
  | "after_sales"
  | "completed"
  | "burned";

// 一个档案记录就是你说的一“团”。
// 这里保存团级信息：均摊、邮费、备注、状态，以及不公示的内部记录。
export type ArchiveRecord = {
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
  privateMeta: {
    totalQuantity?: number;
    advancePaid?: number;
    remainingStock?: number;
    profitLoss?: number;
    note?: string;
  };
};

export type ArchiveSection = {
  label: string;
  code: string;
  slug: string;
  description: string;
  records: ArchiveRecord[];
};

// 这些映射专门用来控制“代码里保存稳定值，页面上显示中文标签”。
export const statusLabels: Record<RecordStatus, string> = {
  planned: "未展开研究",
  active: "研究中",
  archived: "已归档",
  restart_planned: "计划重启",
};

export const stageLabels: Record<RecordStage, string> = {
  draft_ready: "已出稿",
  promo_round_1: "一宣 / 宣车中",
  sample_locked: "锁车收打样",
  sampling: "打样",
  transfer: "转单",
  promo_round_2: "二宣",
  bulk_payment: "收大货",
  waiting_bulk: "等大货",
  shipping_adjustment: "补邮转",
  shipping_collection: "补邮 / 合邮",
  stocking: "囤货",
  shipping: "发货中",
  after_sales: "售后",
  completed: "完车",
  burned: "烧车",
};

// 这里集中存放档案库分类数据。
// 总索引页和分类详情页都共用这一份数据。
export const archiveSections: ArchiveSection[] = [
  {
    label: "明日方舟",
    code: "AK",
    slug: "ak",
    description: "明日方舟相关的收藏、图像记录和研究所档案条目。",
    records: [
      {
        id: "AK-000",
        title: "水月0322爱心",
        teaser: "深蓝研究所金属徽章",
        date: "2026-03-22",
        shareType: "count",
        shareRound1: 5.2,
        shareRound2: 3.22,
        shipping: 5.2,
        notes: "水月是世界上最可爱的小水母，本车有赠送无料噢",
        tags: ["研究中-等大货"],
        characterTags: ["水月"],
        status: "archived",
        stage: "waiting_bulk",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-000.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-000-1",
            title: "水月0322爱心金属徽章",
            note: "当前先按单物品样板展示，后续可继续补更多同团物品。",
            image: "/archive/ak/AK-000.PNG",
            unitPrice: 32.2,
            characterTags: ["水月"],
            tags: ["爱心", "金属徽章"],
          },
        ],
        privateMeta: {
          totalQuantity: 120,
          advancePaid: 560.00,
          remainingStock: 14,
          profitLoss: -36.50,
          note: "内部记录：二宣下降后需要重新核对差额。",
        },
      },
      {
        id: "AK-001",
        title: "博士的红黄蓝小目标",
        teaser: "深蓝研究所金属徽章",
        date: "2026-04-01",
        shareType: "count",
        shareRound1: 6.8,
        shipping: 5.2,
        notes: "这条记录主要用于测试多物品录入、不同单价，以及点击物品名后弹出的小框。",
        tags: ["未展开研究-已出稿", "金属徽章"],
        characterTags: ["博士"],
        status: "archived",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-001.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-001-1",
            title: "合成玉镀黑ffl",
            note: "ffl 系列，默认单独展示。",
            image: "/archive/ak/AK-001.PNG",
            imageFit: "contain",
            unitPrice: 12,
            characterTags: ["博士"],
            tags: ["ffl", "合成玉"],
          },
          {
            id: "AK-001-2",
            title: "源石镀黑ffl",
            note: "ffl 系列，默认单独展示。",
            unitPrice: 12,
            characterTags: ["博士"],
            tags: ["ffl", "源石"],
          },
          {
            id: "AK-001-3",
            title: "龙门币镀黑ffl",
            note: "ffl 系列，默认单独展示。",
            unitPrice: 12,
            characterTags: ["博士"],
            tags: ["ffl", "龙门币"],
          },
          {
            id: "AK-001-4",
            title: "合成玉镀玫瑰金ffl",
            note: "ffl 系列，默认单独展示。",
            unitPrice: 12,
            characterTags: ["博士"],
            tags: ["ffl", "合成玉"],
          },
          {
            id: "AK-001-5",
            title: "源石镀金ffl",
            note: "ffl 系列，默认单独展示。",
            unitPrice: 12,
            characterTags: ["博士"],
            tags: ["ffl", "源石"],
          },
          {
            id: "AK-001-6",
            title: "龙门币镀银ffl",
            note: "ffl 系列，默认单独展示。",
            unitPrice: 12,
            characterTags: ["博士"],
            tags: ["ffl", "龙门币"],
          },
          {
            id: "AK-001-7",
            title: "合成玉镀黑kq",
            note: "kq 系列，默认单独展示。",
            unitPrice: 10,
            characterTags: ["博士"],
            tags: ["kq", "合成玉"],
          },
          {
            id: "AK-001-8",
            title: "源石镀黑kq",
            note: "kq 系列，默认单独展示。",
            unitPrice: 10,
            characterTags: ["博士"],
            tags: ["kq", "源石"],
          },
          {
            id: "AK-001-9",
            title: "龙门币镀黑kq",
            note: "kq 系列，默认单独展示。",
            unitPrice: 10,
            characterTags: ["博士"],
            tags: ["kq", "龙门币"],
          },
          {
            id: "AK-001-10",
            title: "合成玉镀玫瑰金kq",
            note: "kq 系列，默认单独展示。",
            unitPrice: 10,
            characterTags: ["博士"],
            tags: ["kq", "合成玉"],
          },
          {
            id: "AK-001-11",
            title: "源石镀金kq",
            note: "kq 系列，默认单独展示。",
            unitPrice: 10,
            characterTags: ["博士"],
            tags: ["kq", "源石"],
          },
          {
            id: "AK-001-12",
            title: "龙门币镀银kq",
            note: "kq 系列，默认单独展示。",
            unitPrice: 10,
            characterTags: ["博士"],
            tags: ["kq", "龙门币"],
          },
          {
            id: "AK-001-13",
            title: "特典：合成玉喷红kq",
            note: "特典条目。",
            unitPrice: 6,
            characterTags: ["博士"],
            tags: ["特典", "kq", "合成玉"],
          },
          {
            id: "AK-001-14",
            title: "特典：源石喷橙kq",
            note: "特典条目。",
            unitPrice: 6,
            characterTags: ["博士"],
            tags: ["特典", "kq", "源石"],
          },
          {
            id: "AK-001-15",
            title: "特典：龙门币喷蓝kq",
            note: "特典条目。",
            unitPrice: 6,
            characterTags: ["博士"],
            tags: ["特典", "kq", "龙门币"],
          },
        ],
        privateMeta: {},
      },
      {
        id: "AK-002",
        title: "兔兔博士QQ人",
        teaser: "深蓝研究所金属徽章",
        date: "2026-04-02",
        shareType: "headcount",
        shareRound1: 7.4,
        shipping: 6.0,
        notes: "目前已经锁车收打样，后续根据打样情况决定是否进入下一轮。",
        tags: ["研究中-打样", "金属徽章"],
        characterTags: ["W"],
        status: "archived",
        stage: "sampling",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-002.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-002-1",
            title: "兔兔博士QQ人金属徽章",
            note: "用于测试研究中但不同小阶段的标签效果。",
            image: "/archive/ak/AK-002.PNG",
            imageFit: "contain",
            unitPrice: 30.0,
            characterTags: ["W"],
            tags: ["金属徽章", "打样中"],
          },
        ],
        privateMeta: {},
      },
      {
        id: "AK-003",
        title: "深海圆圆",
        teaser: "深蓝研究所金属徽章",
        date: "2026-03-10",
        shareType: "count",
        shareRound1: 4.6,
        shareRound2: 4.1,
        shipping: 4.8,
        notes: "该记录用于测试已归档状态与完车标签。",
        tags: ["已归档-完车", "金属徽章"],
        characterTags: ["陈"],
        status: "archived",
        stage: "completed",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-003.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-003-1",
            title: "深海圆圆金属徽章",
            note: "用于测试归档状态展示。",
            image: "/archive/ak/AK-003.PNG",
            unitPrice: 26.0,
            characterTags: ["陈"],
            tags: ["金属徽章", "完车"],
          },
        ],
        privateMeta: {},
      },
      {
        id: "AK-004",
        title: "余圆圆",
        teaser: "深蓝研究所金属徽章",
        date: "2026-04-04",
        shareType: "count",
        shareRound1: 5.9,
        shipping: 5.0,
        notes: "这条主要用于测试计划重启状态的颜色和标签。",
        tags: ["计划重启", "金属徽章"],
        characterTags: ["艾雅法拉"],
        status: "archived",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-004.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-004-1",
            title: "余圆圆金属徽章",
            note: "用于测试计划重启状态展示。",
            image: "/archive/ak/AK-004.PNG",
            unitPrice: 29.9,
            characterTags: ["艾雅法拉"],
            tags: ["金属徽章", "二开预备"],
          },
        ],
        privateMeta: {},
      },
      {
        id: "AK-005",
        title: "黍圆圆",
        teaser: "深蓝研究所金属徽章",
        date: "2026-04-07",
        shareType: "count",
        shareRound1: 0,
        shipping: 0,
        notes: "占位记录，用于承接新导入的图片素材。",
        tags: ["待整理", "金属徽章"],
        characterTags: [],
        status: "archived",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-005.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-005-1",
            title: "黍圆圆金属徽章",
            note: "等待补充具体物品信息。",
            image: "/archive/ak/AK-005.PNG",
            unitPrice: 0,
            characterTags: [],
            tags: ["待整理"],
          },
        ],
        privateMeta: {},
      },
      {
        id: "AK-006",
        title: "净罪作战图标",
        teaser: "深蓝研究所金属徽章",
        date: "2026-04-07",
        shareType: "count",
        shareRound1: 0,
        shipping: 0,
        notes: "占位记录，用于承接新导入的图片素材。",
        tags: ["待整理", "金属徽章"],
        characterTags: [],
        status: "archived",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-006.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-006-1",
            title: "净罪作战图标金属徽章",
            note: "等待补充具体物品信息。",
            image: "/archive/ak/AK-006.PNG",
            unitPrice: 0,
            characterTags: [],
            tags: ["待整理"],
          },
        ],
        privateMeta: {},
      },
      {
        id: "AK-007",
        title: "相见欢蚀刻章",
        teaser: "深蓝研究所金属徽章",
        date: "2026-04-07",
        shareType: "count",
        shareRound1: 0,
        shipping: 0,
        notes: "占位记录，用于承接新导入的图片素材。",
        tags: ["待整理", "金属徽章"],
        characterTags: [],
        status: "archived",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-007.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-007-1",
            title: "相见欢蚀刻章金属徽章",
            note: "等待补充具体物品信息。",
            image: "/archive/ak/AK-007.PNG",
            unitPrice: 0,
            characterTags: [],
            tags: ["待整理"],
          },
        ],
        privateMeta: {},
      },
      {
        id: "AK-008",
        title: "净罪蚀刻章",
        teaser: "深蓝研究所金属徽章",
        date: "2026-04-07",
        shareType: "count",
        shareRound1: 0,
        shipping: 0,
        notes: "占位记录，用于承接新导入的图片素材。",
        tags: ["待整理", "金属徽章"],
        characterTags: [],
        status: "archived",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图", image: "/archive/ak/AK-008.PNG" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "AK-008-1",
            title: "净罪蚀刻章金属徽章",
            note: "等待补充具体物品信息。",
            image: "/archive/ak/AK-008.PNG",
            unitPrice: 0,
            characterTags: [],
            tags: ["待整理"],
          },
        ],
        privateMeta: {},
      },
    ],
  },
  {
    label: "空洞骑士",
    code: "HK",
    slug: "hk",
    description: "空洞骑士相关的馆藏记录、物件说明和图像档案。",
    records: [
      {
        id: "HK-000",
        title: "空洞骑士金属徽章预备记录",
        teaser: "深蓝研究所金属徽章",
        shareType: "headcount",
        shareRound1: 0,
        shipping: 0,
        notes: "当前仍为未展开研究状态，后续确定开团后再补价格与流程。",
        tags: ["金属徽章", "预备"],
        characterTags: ["小骑士"],
        status: "planned",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "HK-000-1",
            title: "空洞骑士占位物品",
            note: "这里将展示空洞骑士相关的图片、标题和简要说明。",
            unitPrice: 0,
            characterTags: ["小骑士"],
            tags: ["占位"],
          },
        ],
        privateMeta: {},
      },
    ],
  },
  {
    label: "星露谷",
    code: "SV",
    slug: "sv",
    description: "星露谷相关的展示内容、收藏记录和视觉档案。",
    records: [
      {
        id: "SV-000",
        title: "星露谷预备记录",
        teaser: "深蓝研究所金属徽章",
        shareType: "count",
        shareRound1: 0,
        shipping: 0,
        notes: "暂为占位记录。",
        tags: ["占位"],
        characterTags: ["农夫"],
        status: "planned",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "SV-000-1",
            title: "星露谷占位物品",
            note: "这里将展示星露谷相关的图片、标题和简要说明。",
            unitPrice: 0,
            characterTags: ["农夫"],
            tags: ["占位"],
          },
        ],
        privateMeta: {},
      },
    ],
  },
  {
    label: "终末地",
    code: "EF",
    slug: "ef",
    description: "终末地相关的档案条目、图像样本和研究记录。",
    records: [
      {
        id: "EF-000",
        title: "终末地预备记录",
        teaser: "深蓝研究所金属徽章",
        shareType: "count",
        shareRound1: 0,
        shipping: 0,
        notes: "暂为占位记录。",
        tags: ["占位"],
        characterTags: ["待定角色"],
        status: "planned",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "EF-000-1",
            title: "终末地占位物品",
            note: "这里将展示终末地相关的图片、标题和简要说明。",
            unitPrice: 0,
            characterTags: ["待定角色"],
            tags: ["占位"],
          },
        ],
        privateMeta: {},
      },
    ],
  },
  {
    label: "哪吒",
    code: "NZ",
    slug: "nz",
    description: "哪吒相关的图像资料、藏品记录和档案说明。",
    records: [
      {
        id: "NZ-000",
        title: "哪吒预备记录",
        teaser: "深蓝研究所金属徽章",
        shareType: "count",
        shareRound1: 0,
        shipping: 0,
        notes: "暂为占位记录。",
        tags: ["占位"],
        characterTags: ["哪吒"],
        status: "planned",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "NZ-000-1",
            title: "哪吒占位物品",
            note: "这里将展示哪吒相关的图片、标题和简要说明。",
            unitPrice: 0,
            characterTags: ["哪吒"],
            tags: ["占位"],
          },
        ],
        privateMeta: {},
      },
    ],
  },
  {
    label: "其他",
    code: "ZZ",
    slug: "zz",
    description: "暂未归类的补充内容，作为研究所档案的扩展区。",
    records: [
      {
        id: "ZZ-000",
        title: "其他预备记录",
        teaser: "深蓝研究所金属徽章",
        shareType: "count",
        shareRound1: 0,
        shipping: 0,
        notes: "暂为占位记录。",
        tags: ["占位"],
        characterTags: ["待定"],
        status: "planned",
        stage: "draft_ready",
        gallery: {
          promo: { label: "宣图" },
          sample: { label: "打样" },
          bulk: { label: "大货" },
          result: { label: "返图" },
        },
        items: [
          {
            id: "ZZ-000-1",
            title: "其他占位物品",
            note: "这里将展示暂未归类的图片、标题和简要说明。",
            unitPrice: 0,
            characterTags: ["待定"],
            tags: ["占位"],
          },
        ],
        privateMeta: {},
      },
    ],
  },
];

// 下面几个辅助函数用于不同页面按需查找数据。
export function findSectionBySlug(code: string) {
  return archiveSections.find((section) => section.slug === code);
}

export function findRecord(sectionCode: string, recordId: string) {
  const section = findSectionBySlug(sectionCode);
  return section?.records.find((record) => record.id === recordId);
}

export function findRecordsByTag(tag: string) {
  return archiveSections.flatMap((section) =>
    section.records
      .filter(
        (record) =>
          record.tags.includes(tag) || record.characterTags.includes(tag),
      )
      .map((record) => ({ section, record })),
  );
}
