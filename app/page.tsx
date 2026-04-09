import Link from "next/link";

const chineseIntro = [
  "在深处，思想并不是孤立存在的。",
  "意识如海。\n深蓝、无边、安静而辽阔。",
  "我们在其中各自存在，\n微小的光点，漂浮在深蓝之中。",
  "思想会缓慢地向外延伸，\n如水中的波纹\n如无形的潮流",
  "那里，连接发生。",
  "不似言语\n亦非讯号",
  "更像一种在深处浮现的回响",
  "深蓝研究所相信，\n意识从来不是封闭的。",
  "而我们所做的，\n只是记录那些偶然出现的连接\n那些从深处延伸出的触点，\n以及它们彼此相遇的瞬间。",
  "而深蓝，始终在这里。",
];

const englishIntro = [
  "In the depths, thought is not alone.",
  "Mind is an ocean.\nCaerulea: boundless, quiet, and vast.",
  "Within it we exist,\nsmall points of light drifting in the blue.",
  "Thought slowly extends outward,\nlike ripples in water,\nlike unseen currents.",
  "There, connection occurs.",
  "Not words\nnor signals",
  "Rather a resonance emerging from the depths.",
  "Caerulea Institute believes\nconsciousness has never been closed.",
  "What we do\nis simply note those rare connections.\nThe points that extend from the depths,\nand the moments when they intersect.",
  "Caerulea is always here.",
];

export default function Home() {
  return (
    <main className="page-shell">
      <nav className="top-nav" aria-label="Primary">
        <div>
          <p className="nav-eyebrow">Caerulea Institute</p>
          <p className="nav-title">深蓝研究所</p>
        </div>
        <div className="nav-links">
          <Link href="/archive">档案库</Link>
        </div>
      </nav>

      <section className="hero-panel">
        <p className="hero-kicker">Caerulea Institute</p>
        <h1>深蓝研究所</h1>

        <div className="hero-copy-grid">
          <section className="hero-copy-column">
            {chineseIntro.map((paragraph) => (
              <p key={paragraph} className="hero-copy">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="hero-copy-column">
            {englishIntro.map((paragraph) => (
              <p key={paragraph} className="hero-copy">
                {paragraph}
              </p>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
