import Link from "next/link";

export default function ArchiveSubjectsPage() {
  return (
    <main className="page-shell">
      <section className="archive-header">
        <p className="hero-kicker">ARCHIVE / SUBJECTS</p>
        <h1>研究对象</h1>
        <p className="archive-intro">这里会逐步整理研究对象索引与对象记录。当前页面先作为独立入口保留。</p>
      </section>

      <section className="archive-directory-grid">
        <div className="archive-directory-card">
          <p className="archive-category">Subject / Index</p>
          <h2>对象索引待添加</h2>
          <p>后续可以在这里按角色、物件类别或研究方向展开，不再与金属徽章主界面混用。</p>
        </div>
      </section>

      <p className="archive-back-link">
        <Link href="/archive">返回档案库</Link>
      </p>
    </main>
  );
}
