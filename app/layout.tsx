import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caerulea Vault",
  description: "Archive of the Caerulea Institute",
  icons: {
    icon: "/Caerulea.PNG",
    shortcut: "/Caerulea.PNG",
    apple: "/Caerulea.PNG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        id="page-top"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Link href="/" className="home-link-button" aria-label="Back to institute home">
          <Image src="/Caerulea.PNG" alt="Caerulea" width={28} height={28} />
        </Link>
        {children}
        {/* 这是全站通用的“回到顶部”按钮。
            因为它写在 layout 里，所以首页、档案页和未来新页面都会自动拥有它。 */}
        <a href="#page-top" className="back-to-top" aria-label="Back to top">
          ↑
        </a>
        {/* 这是进入编辑页的临时入口。
            先放在右下角，后面再把真正的编辑表单页面接上。 */}
        <Link href="/archive/new" className="add-record-button" aria-label="Add record">
          +
        </Link>
      </body>
    </html>
  );
}
