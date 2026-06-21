import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "codebox - AIで作ったものを見せ合う場所",
  description: "作ったら貼れ。未完成歓迎のコード共有広場。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
