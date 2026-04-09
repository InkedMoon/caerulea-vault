import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { statusLabels } from "../data";
import { getArchiveSectionPageData } from "@/lib/supabase/archive";

// 这里是“分类页”：
// 作用是先列出当前分类下有哪些档案记录，再点击进入某一条记录的详情。
type ArchiveSectionPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function ArchiveSectionPage({
  params,
}: ArchiveSectionPageProps) {
  const { code } = await params;
  const pageData = await getArchiveSectionPageData(code);

  if (!pageData) {
    notFound();
  }

  const { activeSection, records, sections } = pageData;

  return (
    <main className="page-shell">
      <section className="archive-header">
        <p className="hero-kicker">ARCHIVE / METAL PINS</p>
        <h1>金属徽章</h1>
        <p className="archive-intro">文字待添加。</p>
      </section>

      <section className="archive-layout">
        <aside className="archive-sidebar">
          <p className="archive-sidebar-title">索引</p>
          <nav aria-label="Archive index">
            <ul className="archive-index-list">
              {sections.map((section) => (
                <li key={section.code}>
                  <Link
                    href={`/archive/${section.slug}`}
                    className={section.slug === activeSection.slug ? "is-active" : ""}
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/archive" className="archive-back-link">
            返回档案总索引
          </Link>
        </aside>

        <div className="archive-content">
          <section className="archive-overview">
            <p className="archive-category">{activeSection.code}</p>
            <h2>{activeSection.label}</h2>
            <p>当前页面展示这个分类下的档案记录。点击下方卡片后，再进入单条记录详情页查看大图、标签和价格信息。</p>
          </section>

          <section className="archive-grid">
            {records.map((record) => (
              <Link
                key={record.id}
                href={`/archive/${activeSection.slug}/${record.id}`}
                className="archive-card record-card-link"
              >
                <div className="archive-image record-card-image">
                  {record.previewImage ? (
                    <Image
                      src={record.previewImage}
                      alt={record.title}
                      fill
                      className="archive-image-content"
                      sizes="220px"
                      style={{
                        objectFit: record.previewImageFit === "contain" ? "contain" : "cover",
                        padding: record.previewImageFit === "contain" ? "6px" : "0",
                      }}
                    />
                  ) : (
                    <span className="record-list-preview-empty">No Preview</span>
                  )}
                  <div className="record-card-image-overlay">
                    <span className="archive-image-code">{record.id}</span>
                  </div>
                </div>
                <div className="archive-meta">
                  <div className="record-card-meta-top">
                    <h2>{record.title}</h2>
                    <p className={`record-card-status status-text status-${record.status}`}>
                      {statusLabels[record.status]}
                    </p>
                  </div>
                  <p>{record.teaser}</p>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
