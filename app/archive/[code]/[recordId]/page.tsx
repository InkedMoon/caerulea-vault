import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  stageLabels,
  statusLabels,
  type RecordGalleryKey,
} from "../../data";
import RecordItemsPanel from "../../RecordItemsPanel";
import { getArchiveRecordDetailPageData } from "@/lib/supabase/archive";

type ArchiveRecordDetailPageProps = {
  params: Promise<{
    code: string;
    recordId: string;
  }>;
  searchParams: Promise<{
    view?: string;
  }>;
};

// 这里是单条档案记录详情页。
// 作用：从分类页点进来后，查看 AK-000 这一条记录的完整信息。
export default async function ArchiveRecordDetailPage({
  params,
  searchParams,
}: ArchiveRecordDetailPageProps) {
  const { code, recordId } = await params;
  const { view } = await searchParams;

  const pageData = await getArchiveRecordDetailPageData(code, recordId);

  if (!pageData) {
    notFound();
  }

  const { section, record } = pageData;

  const currentView = (view as RecordGalleryKey | undefined) ?? "promo";
  const currentGallery = record.gallery[currentView] ?? record.gallery.promo;
  const shareDrop =
    record.shareRound2 !== undefined ? record.shareRound1 - record.shareRound2 : null;

  const galleryTabs: RecordGalleryKey[] = ["promo", "sample", "bulk", "result"];

  return (
    <main className="page-shell">
      <section className="archive-header">
        <p className="hero-kicker">
          Record / {section.code} / {record.id}
        </p>
        <h1>{record.title}</h1>
        <p className="archive-intro">{record.teaser}</p>
      </section>

      <section className="record-detail-layout">
        <div className="record-detail-main">
          <section className="record-gallery-panel">
            <div className="record-gallery-tabs" aria-label="Gallery views">
              {galleryTabs.map((tab) => (
                <Link
                  key={tab}
                  href={`/archive/${section.slug}/${record.id}?view=${tab}`}
                  className={tab === currentView ? "is-active" : ""}
                >
                  {record.gallery[tab].label}
                </Link>
              ))}
            </div>

            <div className="record-hero-image">
              {currentGallery.image ? (
                <Image
                  src={currentGallery.image}
                  alt={`${record.title} ${currentGallery.label}`}
                  fill
                  className="record-hero-image-content"
                  sizes="(max-width: 720px) 100vw, 70vw"
                />
              ) : (
                <p className="record-gallery-empty">未能查询到该研究对象</p>
              )}
            </div>
          </section>

          <section className="archive-overview">
            <div className="record-header">
              <div>
                <p className="archive-category">{record.id}</p>
                <h2>{record.title}</h2>
              </div>
              <div className="record-status-row">
                <span className={`status-pill status-${record.status}`}>
                  {statusLabels[record.status]}
                </span>
                <span className="stage-pill">{stageLabels[record.stage]}</span>
              </div>
            </div>

            <div className="tag-block">
              <p className="metric-label">标签</p>
              <div className="tag-row">
                {record.characterTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/archive/tags/${encodeURIComponent(tag)}`}
                    className="tag-chip tag-character"
                  >
                    {tag}
                  </Link>
                ))}
                <Link
                  href={`/archive/tags/${encodeURIComponent(
                    `${statusLabels[record.status]}-${stageLabels[record.stage]}`,
                  )}`}
                  className="tag-chip"
                >
                  {statusLabels[record.status]}-{stageLabels[record.stage]}
                </Link>
              </div>
            </div>

            <div className="record-metrics">
              <article className="metric-card metric-span-2">
                <p className="metric-label">均摊</p>
                <p className="metric-value">
                  {record.shareType === "count" ? "个数摊" : "人头摊"}
                </p>
                <p className="metric-detail">
                  一宣均摊 {record.shareRound1.toFixed(2)}
                  {record.shareRound2 !== undefined
                    ? `，二宣均摊 ${record.shareRound2.toFixed(2)}`
                    : ""}
                  {shareDrop !== null ? `，下降 ${shareDrop.toFixed(2)}` : ""}
                </p>
              </article>

              <article className="metric-card">
                <p className="metric-label">单价</p>
                <p className="metric-value">
                  {record.items.length === 1 ? record.items[0]?.unitPrice.toFixed(2) : "多种"}
                </p>
              </article>

              <article className="metric-card">
                <p className="metric-label">邮费</p>
                <p className="metric-value">{record.shipping.toFixed(2)}</p>
              </article>
            </div>

            <div className="tag-block">
              <p className="metric-label">备注</p>
              <p className="record-notes">{record.notes}</p>
            </div>

            <div className="tag-block">
              <p className="metric-label">单价条目</p>
              <RecordItemsPanel items={record.items} />
            </div>
          </section>
        </div>

        <aside className="archive-sidebar">
          <p className="archive-sidebar-title">导航</p>
          <nav aria-label="Record navigation">
            <ul className="archive-index-list">
              <li>
                <Link href={`/archive/${section.slug}`} className="is-active">
                  返回{section.label}
                </Link>
              </li>
              <li>
                <Link href="/archive">返回总档案库</Link>
              </li>
            </ul>
          </nav>
        </aside>
      </section>

      <Link
        href={`/archive/${section.slug}/${record.id}/edit`}
        className="edit-record-button"
        aria-label="Edit record"
      >
        ✎
      </Link>
    </main>
  );
}
