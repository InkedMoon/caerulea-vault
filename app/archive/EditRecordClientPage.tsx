"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { archiveSections, stageLabels, statusLabels } from "./data";

type EditableItem = {
  id: string;
  title: string;
  unitPrice: string;
  image: string;
};

type EditRecordClientPageProps = {
  sectionSlug: string;
  recordId: string;
  title: string;
  teaser: string;
  recordDate: string;
  status: keyof typeof statusLabels;
  stage: keyof typeof stageLabels;
  shareType: "count" | "headcount";
  shareRound1: string;
  shareRound2: string;
  shipping: string;
  notes: string;
  characterTags: string;
  tags: string;
  promoImage: string;
  sampleImage: string;
  bulkImage: string;
  resultImage: string;
  items: EditableItem[];
};

// 这是“编辑已有档案”的客户端表单。
// 目前先把所有字段预填进来，保存按钮先保留界面位置，下一步再接真正的写库逻辑。
export default function EditRecordClientPage({
  sectionSlug: initialSectionSlug,
  recordId,
  title: initialTitle,
  teaser: initialTeaser,
  recordDate: initialRecordDate,
  status: initialStatus,
  stage: initialStage,
  shareType: initialShareType,
  shareRound1: initialShareRound1,
  shareRound2: initialShareRound2,
  shipping: initialShipping,
  notes: initialNotes,
  characterTags: initialCharacterTags,
  tags: initialTags,
  promoImage: initialPromoImage,
  sampleImage: initialSampleImage,
  bulkImage: initialBulkImage,
  resultImage: initialResultImage,
  items: initialItems,
}: EditRecordClientPageProps) {
  const router = useRouter();
  const [sectionSlug, setSectionSlug] = useState(initialSectionSlug);
  const [recordDate, setRecordDate] = useState(initialRecordDate);
  const [title, setTitle] = useState(initialTitle);
  const [teaser, setTeaser] = useState(initialTeaser);
  const [status, setStatus] = useState<keyof typeof statusLabels>(initialStatus);
  const [stage, setStage] = useState<keyof typeof stageLabels>(initialStage);
  const [shareType, setShareType] = useState<"count" | "headcount">(initialShareType);
  const [shareRound1, setShareRound1] = useState(initialShareRound1);
  const [shareRound2, setShareRound2] = useState(initialShareRound2);
  const [shipping, setShipping] = useState(initialShipping);
  const [notes, setNotes] = useState(initialNotes);
  const [characterTags, setCharacterTags] = useState(initialCharacterTags);
  const [tags, setTags] = useState(initialTags);
  const [promoImage, setPromoImage] = useState(initialPromoImage);
  const [sampleImage, setSampleImage] = useState(initialSampleImage);
  const [bulkImage, setBulkImage] = useState(initialBulkImage);
  const [resultImage, setResultImage] = useState(initialResultImage);
  const [draftItems, setDraftItems] = useState(initialItems);
  const [itemNamesInput, setItemNamesInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const section = useMemo(
    () => archiveSections.find((entry) => entry.slug === sectionSlug) ?? archiveSections[0],
    [sectionSlug],
  );

  function updateDraftItem(index: number, field: "title" | "unitPrice" | "image", value: string) {
    setDraftItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function removeDraftItem(index: number) {
    setDraftItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function appendDraftItemsFromInput(source: string) {
    const names = source
      .split("，")
      .flatMap((part) => part.split(","))
      .map((name) => name.trim())
      .filter(Boolean);

    if (names.length === 0) {
      return;
    }

    setDraftItems((current) => {
      const nextItems = [...current];
      const existingIds = new Set(current.map((item) => item.id));
      const maxSuffix = current.reduce((max, item) => {
        const match = item.id.match(/-(\d+)$/);
        const suffix = match ? Number(match[1]) : 0;
        return Math.max(max, suffix);
      }, 0);

      let nextSuffix = maxSuffix;

      for (const name of names) {
        nextSuffix += 1;
        const nextId = `${recordId}-${nextSuffix}`;

        if (existingIds.has(nextId)) {
          continue;
        }

        nextItems.push({
          id: nextId,
          title: name,
          unitPrice: "",
          image: "",
        });
        existingIds.add(nextId);
      }

      return nextItems;
    });

    setItemNamesInput("");
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const response = await fetch(`/api/archive/records/${recordId}`, {
        method: "PATCH",
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

      if (!response.ok) {
        throw new Error(result.error || "保存失败。");
      }

      setSaveMessage("已保存到数据库。");
      if (result.recordCode && result.sectionSlug) {
        router.push(`/archive/${result.sectionSlug}/${result.recordCode}/edit`);
      }
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
        <p className="hero-kicker">Edit Record</p>
        <h1>编辑档案记录</h1>
        <p className="archive-intro">
          这里先把当前档案的字段全部铺开。保存按钮已经预留在页面底部，下一步再接真正的写库权限。
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
                <span>档案编号</span>
                <input type="text" value={recordId} readOnly />
              </label>

              <label className="editor-field editor-span-2">
                <span>名称</span>
                <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>

              <label className="editor-field editor-span-2">
                <span>档案标记</span>
                <input
                  type="text"
                  value={teaser}
                  onChange={(event) => setTeaser(event.target.value)}
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
                />
              </label>

              <label className="editor-field">
                <span>二宣均摊</span>
                <input
                  type="number"
                  step="0.01"
                  value={shareRound2}
                  onChange={(event) => setShareRound2(event.target.value)}
                />
              </label>

              <label className="editor-field">
                <span>邮费</span>
                <input
                  type="number"
                  step="0.01"
                  value={shipping}
                  onChange={(event) => setShipping(event.target.value)}
                />
              </label>

              <label className="editor-field editor-span-2">
                <span>公开备注</span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
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
                />
              </label>

              <label className="editor-field editor-span-2">
                <span>普通标签</span>
                <input type="text" value={tags} onChange={(event) => setTags(event.target.value)} />
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
                onClick={() => appendDraftItemsFromInput(itemNamesInput)}
              >
                +
              </button>
            </div>

            <div className="editor-grid">
              <label className="editor-field editor-span-2">
                <span>新增物品名称列表</span>
                <input
                  type="text"
                  value={itemNamesInput}
                  onChange={(event) => setItemNamesInput(event.target.value)}
                  placeholder="用逗号分隔，例如：xxx，xxx，xxx"
                />
              </label>
            </div>

            {draftItems.length > 0 && (
              <div className="editor-generated-items">
                {draftItems.map((item, index) => (
                  <div key={item.id} className="generated-item-card">
                    <div className="generated-item-header">
                      <div>
                      <p className="generated-item-title">{item.title}</p>
                      <p className="generated-item-id">{item.id}</p>
                      </div>
                      <button
                        type="button"
                        className="generated-item-remove"
                        onClick={() => removeDraftItem(index)}
                        aria-label={`Delete ${item.title}`}
                      >
                        ×
                      </button>
                    </div>

                    <label className="editor-field">
                      <span>名称</span>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(event) => updateDraftItem(index, "title", event.target.value)}
                      />
                    </label>

                    <label className="editor-field">
                      <span>单价</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateDraftItem(index, "unitPrice", event.target.value)
                        }
                      />
                    </label>

                    <label className="editor-field">
                      <span>图片</span>
                      <input
                        type="text"
                        value={item.image}
                        onChange={(event) => updateDraftItem(index, "image", event.target.value)}
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
            <button type="button" className="editor-action-button" disabled>
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
          <p className="archive-sidebar-title">编辑预览</p>
          <p className="editor-help">
            当前档案：{recordId}
            <br />
            所属分类：{section.label}
            <br />
            状态 / 阶段：{statusLabels[status]} / {stageLabels[stage]}
            <br />
            当前页面已经接入保存接口，真正写入仍依赖服务端 secret key。
          </p>
          <Link href={`/archive/${sectionSlug}/${recordId}`} className="archive-back-link">
            返回当前档案
          </Link>
        </aside>
      </section>
    </main>
  );
}
