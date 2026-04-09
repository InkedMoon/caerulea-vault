"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { archiveSections, stageLabels, statusLabels } from "../data";

type DraftItem = {
  id: string;
  title: string;
  unitPrice: string;
  image: string;
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// 这是新增记录页的可交互骨架版本。
// 目标：先把 Record 的基础属性做成能操作的表单，再去接真正的保存逻辑。
export default function NewArchiveRecordPage() {
  const router = useRouter();
  const [sectionSlug, setSectionSlug] = useState("ak");
  const [recordDate, setRecordDate] = useState(todayString());
  const [title, setTitle] = useState("");
  const [teaser, setTeaser] = useState("");
  const [status, setStatus] = useState<keyof typeof statusLabels>("active");
  const [stage, setStage] = useState<keyof typeof stageLabels>("waiting_bulk");
  const [shareType, setShareType] = useState<"count" | "headcount">("count");
  const [shareRound1, setShareRound1] = useState("");
  const [shareRound2, setShareRound2] = useState("");
  const [shipping, setShipping] = useState("");
  const [notes, setNotes] = useState("");
  const [characterTags, setCharacterTags] = useState("");
  const [tags, setTags] = useState("");
  const [promoImage, setPromoImage] = useState("");
  const [sampleImage, setSampleImage] = useState("");
  const [bulkImage, setBulkImage] = useState("");
  const [resultImage, setResultImage] = useState("");
  const [itemNamesInput, setItemNamesInput] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const section = useMemo(
    () => archiveSections.find((entry) => entry.slug === sectionSlug) ?? archiveSections[0],
    [sectionSlug],
  );

  // 这里先按“当前分类已有记录数 + 1”给出一个预览编号。
  // 真正接数据库之后，再用数据库里的自增顺序或日期排序规则来生成。
  const generatedRecordId = `${section.code}-${String(section.records.length + 1).padStart(
    3,
    "0",
  )}`;

  function syncItemsFromInput(source: string) {
    const names = source
      .split("，")
      .flatMap((part) => part.split(","))
      .map((name) => name.trim())
      .filter(Boolean);

    setDraftItems((current) =>
      names.map((name, index) => {
        const existing = current.find((item) => item.title === name);
        return {
          id: `${generatedRecordId}-${index + 1}`,
          title: name,
          unitPrice: existing?.unitPrice ?? "",
          image: existing?.image ?? "",
        };
      }),
    );
  }

  function updateDraftItemPrice(index: number, value: string) {
    setDraftItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, unitPrice: value } : item,
      ),
    );
  }

  function updateDraftItemImage(index: number, value: string) {
    setDraftItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, image: value } : item,
      ),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const response = await fetch("/api/archive/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionSlug,
          title,
          teaser,
          recordDate,
          status,
          stage,
          shareType,
          shareRound1,
          shareRound2,
          shipping,
          notes,
          characterTags,
          tags,
          gallery: {
            promo: promoImage,
            sample: sampleImage,
            bulk: bulkImage,
            result: resultImage,
          },
          items: draftItems,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        recordCode?: string;
        sectionSlug?: string;
      };

      if (!response.ok || !result.recordCode || !result.sectionSlug) {
        throw new Error(result.error || "保存失败。");
      }

      setSaveMessage("已创建新档案。");
      router.push(`/archive/${result.sectionSlug}/${result.recordCode}`);
      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="archive-header">
        <p className="hero-kicker">New Record</p>
        <h1>新增档案记录</h1>
        <p className="archive-intro">
          这是编辑页的可交互骨架版本。现在已经可以预览自动编号、设置日期，并生成多条 item 输入框。
        </p>
      </section>

      <section className="record-editor-layout">
        <section className="record-editor-panel">
          <div className="editor-section">
            <p className="archive-category">基础信息</p>
            <div className="editor-grid">
              <label className="editor-field">
                <span>所属分类</span>
                <select value={sectionSlug} onChange={(event) => setSectionSlug(event.target.value)}>
                  {archiveSections.map((sectionOption) => (
                    <option key={sectionOption.code} value={sectionOption.slug}>
                      {sectionOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="editor-field">
                <span>日期</span>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(event) => setRecordDate(event.target.value)}
                />
              </label>

              <label className="editor-field">
                <span>自动编号预览</span>
                <input type="text" value={generatedRecordId} readOnly />
              </label>

              <label className="editor-field editor-span-2">
                <span>名称</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="例如：博士的红黄蓝小目标"
                />
              </label>

              <label className="editor-field editor-span-2">
                <span>档案标记</span>
                <input
                  type="text"
                  value={teaser}
                  onChange={(event) => setTeaser(event.target.value)}
                  placeholder="例如：IM个人私图仅作为测试使用"
                />
              </label>
            </div>
          </div>

          <div className="editor-section">
            <p className="archive-category">状态信息</p>
            <div className="editor-grid">
              <label className="editor-field">
                <span>状态</span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as keyof typeof statusLabels)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="editor-field">
                <span>阶段</span>
                <select
                  value={stage}
                  onChange={(event) => setStage(event.target.value as keyof typeof stageLabels)}
                >
                  {Object.entries(stageLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="editor-section">
            <p className="archive-category">价格与备注</p>
            <div className="editor-grid">
              <label className="editor-field">
                <span>均摊方式</span>
                <select
                  value={shareType}
                  onChange={(event) => setShareType(event.target.value as "count" | "headcount")}
                >
                  <option value="count">个数摊</option>
                  <option value="headcount">人头摊</option>
                </select>
              </label>

              <label className="editor-field">
                <span>一宣均摊</span>
                <input
                  type="number"
                  step="0.01"
                  value={shareRound1}
                  onChange={(event) => setShareRound1(event.target.value)}
                  placeholder="5.20"
                />
              </label>

              <label className="editor-field">
                <span>二宣均摊</span>
                <input
                  type="number"
                  step="0.01"
                  value={shareRound2}
                  onChange={(event) => setShareRound2(event.target.value)}
                  placeholder="3.22"
                />
              </label>

              <label className="editor-field">
                <span>邮费</span>
                <input
                  type="number"
                  step="0.01"
                  value={shipping}
                  onChange={(event) => setShipping(event.target.value)}
                  placeholder="5.20"
                />
              </label>

              <label className="editor-field editor-span-2">
                <span>公开备注</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="例如：水月是世界上最可爱的小水母，本车有赠送无料噢"
                />
              </label>
            </div>
          </div>

          <div className="editor-section">
            <p className="archive-category">标签</p>
            <div className="editor-grid">
              <label className="editor-field editor-span-2">
                <span>角色标签</span>
                <input
                  type="text"
                  value={characterTags}
                  onChange={(event) => setCharacterTags(event.target.value)}
                  placeholder="用逗号分隔，例如：水月, 能天使"
                />
              </label>

              <label className="editor-field editor-span-2">
                <span>普通标签</span>
                <input
                  type="text"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="用逗号分隔，例如：金属徽章, 爱心, 研究中-等大货"
                />
              </label>
            </div>
          </div>

          <div className="editor-section">
            <p className="archive-category">图库按钮</p>
            <div className="editor-grid">
              <label className="editor-field">
                <span>宣图</span>
                <input value={promoImage} onChange={(event) => setPromoImage(event.target.value)} />
              </label>
              <label className="editor-field">
                <span>打样</span>
                <input
                  value={sampleImage}
                  onChange={(event) => setSampleImage(event.target.value)}
                />
              </label>
              <label className="editor-field">
                <span>大货</span>
                <input value={bulkImage} onChange={(event) => setBulkImage(event.target.value)} />
              </label>
              <label className="editor-field">
                <span>返图</span>
                <input
                  value={resultImage}
                  onChange={(event) => setResultImage(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="editor-section">
            <div className="editor-section-header">
              <p className="archive-category">单价条目</p>
              <button
                type="button"
                className="editor-add-button"
                onClick={() => syncItemsFromInput(itemNamesInput)}
              >
                +
              </button>
            </div>

            <div className="editor-grid">
              <label className="editor-field editor-span-2">
                <span>物品名称列表</span>
                <input
                  type="text"
                  value={itemNamesInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setItemNamesInput(nextValue);
                    syncItemsFromInput(nextValue);
                  }}
                  placeholder="用逗号分隔，例如：xxx，xxx，xxx"
                />
              </label>
            </div>

            {draftItems.length > 0 && (
              <div className="editor-generated-items">
                {draftItems.map((item, index) => (
                  <div key={item.id} className="generated-item-card">
                    <div>
                      <p className="generated-item-title">{item.title}</p>
                      <p className="generated-item-id">{item.id}</p>
                    </div>

                    <label className="editor-field">
                      <span>名称</span>
                      <input type="text" value={item.title} readOnly />
                    </label>

                    <label className="editor-field">
                      <span>单价</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) => updateDraftItemPrice(index, event.target.value)}
                        placeholder="12.00"
                      />
                    </label>

                    <label className="editor-field">
                      <span>图片</span>
                      <input
                        type="text"
                        value={item.image}
                        onChange={(event) => updateDraftItemImage(index, event.target.value)}
                        placeholder="图片路径或未来上传地址"
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="editor-actions">
            <button
              type="button"
              className="editor-action-button primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
            <button type="button" className="editor-action-button">
              存草稿
            </button>
          </div>

          {(saveMessage || saveError) && (
            <p className={`editor-feedback ${saveError ? "is-error" : "is-success"}`}>
              {saveError ?? saveMessage}
            </p>
          )}
        </section>

        <aside className="archive-sidebar">
          <p className="archive-sidebar-title">预览信息</p>
          <p className="editor-help">
            当前自动编号预览：{generatedRecordId}
            <br />
            日期：{recordDate || "未设置"}
            <br />
            状态 / 阶段：{statusLabels[status]} / {stageLabels[stage]}
          </p>
          <Link href="/archive" className="archive-back-link">
            返回档案总索引
          </Link>
        </aside>
      </section>
    </main>
  );
}
