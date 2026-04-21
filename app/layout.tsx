import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_JP, Space_Grotesk } from "next/font/google";

import "./globals.css";

const bodyFont = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "PaperFlow",
  description:
    "arXiv の公開論文を X ライクなタイムラインで読み、保存と共有まで行える研究フィード。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
