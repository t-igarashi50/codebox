import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <p className="font-black">投稿が見つかりません</p>
        <Link href="/" className="mt-4 inline-block text-sm font-bold text-bolt">
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}
