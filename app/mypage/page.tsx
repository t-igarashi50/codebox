import Link from "next/link";

const achievements = ["初投稿", "3日連続制作", "新人賞候補", "AIゲーム挑戦"];
const works = ["AI待受画像", "Todo整理AI", "音声編集ツール"];

export default function MyPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <section className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-bolt">← ホーム</Link>
          <p className="ml-auto rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-bolt">デモプロフィール</p>
        </div>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-orange-400 text-4xl font-black text-white">C</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-blueprint">AIクリエイター</p>
            <h1 className="mt-2 text-3xl font-black">anon</h1>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-600">AIで作ったものを少しずつ増やして、実績を育てていくページです。</p>
          </div>
          <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4 text-center">
            <p className="text-xs font-black text-yellow-700">RANK</p>
            <p className="mt-1 text-2xl font-black text-yellow-700">Gold</p>
            <p className="mt-1 text-sm font-black text-ink">Lv.12</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          <Stat label="投稿作品" value="3" />
          <Stat label="DL数" value="24" />
          <Stat label="いいね" value="554" />
          <Stat label="コメント" value="8" />
          <Stat label="フォロワー" value="19" />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="font-black">実績</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {achievements.map((item) => (
                <span key={item} className="rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700">{item}</span>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="font-black">投稿作品</h2>
            <div className="mt-3 grid gap-2">
              {works.map((item) => (
                <div key={item} className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-ink">{item}</div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
  );
}
