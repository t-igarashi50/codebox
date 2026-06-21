"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CodeBoxWordmark } from "../components/CodeBoxLogo";
import { formatBytes, formatTime, getPostImages, hasLikedPost, hasSharedCode, likePost, listPosts } from "../lib/store";
import { buildCodePreviewSrcDoc } from "../lib/preview";
import { allAiTools } from "../lib/aiTools";
import { FileThumbnail } from "../components/FileThumbnail";
import type { CodePost, SortMode } from "../lib/types";

const sortItems: { key: SortMode; label: string }[] = [
  { key: "new", label: "新着" },
  { key: "today", label: "今日" },
  { key: "week", label: "今週" },
  { key: "month", label: "今月" },
  { key: "all", label: "累計" },
  { key: "rising", label: "急上昇" }
];

export default function HomePage() {
  const [posts, setPosts] = useState<CodePost[]>([]);
  const [sort, setSort] = useState<SortMode>("new");
  const [query, setQuery] = useState("");
  const [aiTool, setAiTool] = useState("すべて");

  useEffect(() => {
    listPosts(sort, query).then((items) => {
      setPosts(aiTool === "すべて" ? items : items.filter((post) => post.aiTool === aiTool));
    });
  }, [sort, query, aiTool]);

  const hot = useMemo(() => [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5), [posts]);
  const currentSortLabel = sortItems.find((item) => item.key === sort)?.label ?? "新着";
  const isRanking = sort !== "new";

  async function handleLike(id: string) {
    const changed = await likePost(id);
    if (!changed) return;
    setPosts(await listPosts(sort, query));
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <CodeBoxWordmark />
            <span className="flex flex-col leading-none">
              <span className="mt-1 hidden text-xs font-bold text-slate-500 sm:inline">AI MADE SHOWCASE</span>
            </span>
          </Link>
          <p className="hidden text-sm font-bold text-slate-600 md:block">AIで作る。みんなで育てる。</p>
          <div className="ml-auto flex flex-1 items-center justify-end gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="作品やコードを検索..."
              className="hidden w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blueprint md:block"
            />
            <Link href="/new" className="rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white shadow-soft hover:bg-slate-800">
              投稿
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-2 text-sm">
            <p className="px-4 pb-1 text-xs font-black text-slate-400">ランキング</p>
            {sortItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setSort(item.key)}
                className={`w-full rounded-lg px-4 py-3 text-left font-bold ${sort === item.key ? "bg-orange-50 text-bolt" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {item.label}
              </button>
            ))}
            <p className="px-4 pb-1 pt-5 text-xs font-black text-slate-400">AI</p>
            <div className="space-y-2">
              {allAiTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => setAiTool(tool)}
                  className={`w-full rounded-lg px-4 py-3 text-left font-bold ${aiTool === tool ? "bg-blue-50 text-blueprint" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-black">こんなの作れた！を貼ろう。</h1>
                <p className="mt-2 text-sm text-slate-600">AIで作ったアプリ、サイト、ツールを気軽に自慢。スクショだけでもOK。コードは貼れる人だけ。</p>
              </div>
              <Link href="/new" className="sm:ml-auto rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-ink hover:border-bolt">
                投稿
              </Link>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="作品やコードを検索..."
              className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blueprint md:hidden"
            />
            <p className="mt-4 text-xs font-black text-slate-400 lg:hidden">ランキング</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {sortItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSort(item.key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${sort === item.key ? "bg-ink text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs font-black text-slate-400 lg:hidden">AI</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {allAiTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => setAiTool(tool)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${aiTool === tool ? "bg-blueprint text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">{isRanking ? `${currentSortLabel}ランキング` : "新着投稿"}</h2>
            {isRanking || aiTool !== "すべて" ? (
              <p className="text-xs font-bold text-slate-500">{aiTool === "すべて" ? "👍 とコメントの反響順" : aiTool}</p>
            ) : null}
          </div>

          {posts.map((post, index) => (
            <article key={post.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
              <div className="flex gap-3">
                {isRanking ? (
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black ${index < 3 ? "bg-orange-100 text-bolt" : "bg-slate-100 text-slate-600"}`}>
                    {index + 1}
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 font-bold text-white">A</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-500">{isRanking ? `${currentSortLabel}ランキング ${index + 1}位 ・ ` : ""}anon ・ {formatTime(post.createdAt)}</p>
                      <Link href={`/post/${post.id}`} className="mt-2 block text-lg font-black hover:text-bolt">{post.title}</Link>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {post.aiTool ? <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{post.aiTool}</p> : null}
                        {post.archiveUrl ? <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blueprint">ZIP {formatBytes(post.archiveSize)}</p> : null}
                        <XAccountLink account={post.xAccount} />
                      </div>
                    </div>
                  </div>
                  {post.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p> : null}
                  {query.trim() && !post.title.toLowerCase().includes(query.toLowerCase()) && post.code.toLowerCase().includes(query.toLowerCase()) ? (
                    <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blueprint">コード内に一致</p>
                  ) : null}
                  <ThumbnailGrid post={post} />
                  <Link href={`/post/${post.id}`} className="mt-4 block rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-bolt hover:text-bolt">
                    {post.archiveUrl ? "作品を見る / ZIPをダウンロード" : hasSharedCode(post) ? "作品とコードを見る" : "作品を見る"}
                  </Link>
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => handleLike(post.id)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold hover:border-bolt disabled:bg-slate-50 disabled:text-slate-400" disabled={hasLikedPost(post.id)}>👍 {post.likes}</button>
                    <Link href={`/post/${post.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold hover:border-blueprint">コメント {post.comments.length}</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-black">反響ランキング</h2>
              <button onClick={() => setSort("all")} className="text-sm font-bold text-blueprint">もっと見る</button>
            </div>
            <ol className="mt-4 space-y-4">
              {hot.map((post, index) => (
                <li key={post.id} className="flex gap-3 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 font-black text-bolt">{index + 1}</span>
                  <Link href={`/post/${post.id}`} className="line-clamp-2 font-bold hover:text-bolt">{post.title}</Link>
                  <span className="ml-auto text-xs text-slate-400">👍 {post.likes}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-black">codeboxとは？</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">AIで作ったものを見せ合う場所です。スクショだけ、未完成、思いつきでもOK。</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function XAccountLink({ account }: { account?: string }) {
  if (!account) return null;
  const handle = account.replace(/^@/, "");
  if (!handle) return null;
  return (
    <a
      href={`https://x.com/${handle}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white hover:bg-slate-700"
    >
      {account}
    </a>
  );
}

function ThumbnailGrid({ post }: { post: CodePost }) {
  const images = getPostImages(post);
  const previewSrcDoc = images.length || !hasSharedCode(post) ? "" : buildCodePreviewSrcDoc(post.code, post.language);
  if (!images.length && !previewSrcDoc && !post.archiveUrl) return null;

  const gridClass = images.length === 1
    ? "grid-cols-1"
    : images.length === 2
      ? "grid-cols-2"
      : "grid-cols-2";

  if (previewSrcDoc) {
    return (
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <iframe
          title={`${post.title} プレビュー`}
          srcDoc={previewSrcDoc}
          sandbox=""
          className="h-56 w-full pointer-events-none"
        />
      </div>
    );
  }

  if (!images.length && post.archiveUrl) {
    return (
      <div className="mt-4">
        <FileThumbnail name={post.archiveName} size={post.archiveSize} compact />
      </div>
    );
  }

  return (
    <div className={`mt-4 grid ${gridClass} overflow-hidden rounded-lg border border-slate-200 bg-slate-100`}>
      {images.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt={`${post.title} ${index + 1}`}
          className={`h-full min-h-40 w-full object-cover ${images.length === 3 && index === 0 ? "row-span-2" : ""}`}
        />
      ))}
    </div>
  );
}
