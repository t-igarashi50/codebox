import Link from "next/link";
import { CodeBoxLogo, CodeBoxWordmark } from "../../components/CodeBoxLogo";

const logos = [
  {
    name: "オープンボックス",
    note: "おすすめ。Dropbox風のシンプルな箱で、投稿が集まる場所に見える",
    mark: <CodeBoxWordmark />
  },
  {
    name: "ステッカー箱",
    note: "少しくだけた案。かっこつけすぎず投稿しやすい",
    mark: (
      <div className="grid h-20 w-24 -rotate-2 place-items-center rounded-xl border-[3px] border-ink bg-orange-50">
        <div className="rotate-2 rounded-lg bg-white px-3 py-2 text-center font-black leading-none text-ink shadow-sm">
          <span className="block text-xl">box</span>
          <span className="text-xs text-bolt">code</span>
        </div>
      </div>
    )
  },
  {
    name: "コード箱",
    note: "小さくても見やすい。アプリアイコン向き",
    mark: (
      <div className="relative h-20 w-24 rounded-xl border-[3px] border-ink bg-blue-50">
        <div className="absolute inset-x-4 top-4 h-3 rounded-full bg-blueprint" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-ink px-3 py-2 font-mono text-sm font-black text-white">&lt;/&gt;</div>
      </div>
    )
  },
  {
    name: "文字箱",
    note: "名前をそのまま覚えてもらう案。説明不要で強い",
    mark: (
      <div className="grid h-20 w-28 place-items-center rounded-xl bg-ink px-3 text-white">
        <div className="text-center font-black leading-none">
          <span className="block text-lg">codebox</span>
          <span className="text-xs text-orange-300">share</span>
        </div>
      </div>
    )
  }
];

export default function LogoPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">codebox</p>
            <h1 className="mt-1 text-2xl font-black">ロゴ案</h1>
          </div>
          <Link href="/" className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-ink hover:border-bolt">
            ホームへ
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-32 w-72 shrink-0 place-items-center rounded-lg bg-slate-50">
              {logos[0].mark}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">おすすめ</p>
              <h2 className="mt-1 text-3xl font-black text-ink">CodeBox</h2>
              <p className="mt-2 text-sm font-black tracking-wide text-slate-400">AI MADE SHOWCASE</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
                作品を箱に入れて置く感じです。かっこつけすぎず、AIで作ったものを気軽に並べる場所として伝わります。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {logos.map((logo) => (
            <section key={logo.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <div className="grid min-h-28 place-items-center rounded-lg bg-slate-50">
                {logo.mark}
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-black text-ink">codebox</h2>
                <p className="mt-1 text-xs font-black tracking-wide text-slate-400">AI MADE SHOWCASE</p>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="font-black">{logo.name}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{logo.note}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
