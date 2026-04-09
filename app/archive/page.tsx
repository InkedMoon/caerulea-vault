import Link from "next/link";

export default function ArchivePage() {
  return (
    <main className="page-shell">
      <section className="archive-header">
        <p className="hero-kicker">Index / Archive</p>
        <h1>档案库</h1>
        <p className="archive-intro">
          目前研究所的展示内容以金属徽章为主，入口先统一收束到金属研究记录。
        </p>
      </section>

      <section className="archive-directory-grid">
        <Link href="/archive/ak" className="archive-directory-card">
          <p className="archive-category">Archive / Metal</p>
          <h2>金属研究记录</h2>
          <p>进入金属徽章主档案页，并在其中继续通过左侧索引查看各分类记录。</p>
        </Link>
        <Link href="/archive/subjects" className="archive-directory-card">
          <p className="archive-category">Archive / Subject</p>
          <h2>研究对象</h2>
          <p>进入研究对象入口页，后续在这里继续拆分对象索引与具体记录。</p>
        </Link>
      </section>
    </main>
  );
}
