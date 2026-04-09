import Link from "next/link";
import { notFound } from "next/navigation";

import { findRecordsByTag, stageLabels, statusLabels } from "../../data";

type ArchiveTagPageProps = {
  params: Promise<{
    tag: string;
  }>;
};

// 标签页：
// 点击标签后，会列出所有带这个标签的记录。
export default async function ArchiveTagPage({ params }: ArchiveTagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const matches = findRecordsByTag(decodedTag);

  if (matches.length === 0) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="archive-header">
        <p className="hero-kicker">Tag Search</p>
        <h1>{decodedTag}</h1>
        <p className="archive-intro">以下是带有这个标签的其他档案记录。</p>
      </section>

      <section className="record-list">
        {matches.map(({ section, record }) => (
          <Link
            key={`${section.code}-${record.id}`}
            href={`/archive/${section.slug}/${record.id}`}
            className="record-list-card"
          >
            <div className="record-list-top">
              <div>
                <p className="archive-category">{record.id}</p>
                <h2>{record.title}</h2>
              </div>
              <span className={`status-pill status-${record.status}`}>
                {statusLabels[record.status]}
              </span>
            </div>
            <p className="record-list-note">{record.teaser}</p>
            <p className="record-list-stage">{stageLabels[record.stage]}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
