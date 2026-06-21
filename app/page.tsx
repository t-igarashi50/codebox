"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CodeBoxWordmark } from "../components/CodeBoxLogo";
import { formatTime, getPostImages, hasLikedPost, hasSharedCode, likePost, listPosts } from "../lib/store";
import { buildCodePreviewSrcDoc } from "../lib/preview";
import { allAiTools } from "../lib/aiTools";
import { getCurrentUser } from "../lib/auth";
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
  const [view, setView] = useState<"works" | "themes">("works");
  const [query, setQuery] = useState("");
  const [aiTool, setAiTool] = useState("すべて");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    listPosts(sort, query).then((items) => {
      setPosts(aiTool === "すべて" ? items : items.filter((post) => post.aiTool === aiTool));
    });
  }, [sort, query, aiTool]);

  useEffect(() => {
    getCurrentUser().then((user) => setIsLoggedIn(Boolean(user)));
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    function handleScroll() {
      const currentY = window.scrollY;
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        setHideHeader(false);
        return;
      }
      setHideHeader(currentY > lastY && currentY > 80);
      if (menuOpen) setMenuOpen(false);
      lastY = currentY;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  const works = useMemo(() => posts.filter((post) => (post.kind ?? "work") === "work"), [posts]);
  const themes = useMemo(() => posts.filter((post) => post.kind === "theme").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [posts]);
  const visiblePosts = view === "works" ? works : themes;
  const hot = useMemo(() => [...works].sort((a, b) => b.likes - a.likes).slice(0, 5), [works]);
  const currentSortLabel = sortItems.find((item) => item.key === sort)?.label ?? "新着";
  const isRanking = sort !== "new";

  async function handleLike(id: string) {
    const changed = await likePost(id);
    if (!changed) return;
    setPosts(await listPosts(sort, query));
  }

  return (
    <main className="min-h-screen">
      <header className={`sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur transition-transform duration-200 ${hideHeader ? "-translate-y-full md:translate-y-0" : "translate-y-0"}`}>
        <div className="relative mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#7C6BFF] hover:bg-violet-50"
            aria-label="メニュー"
            aria-expanded={menuOpen}
          >
            <span className="h-0.5 w-5 rounded-full bg-ink" />
            <span className="h-0.5 w-5 rounded-full bg-ink" />
            <span className="h-0.5 w-5 rounded-full bg-ink" />
          </button>
          {menuOpen ? (
            <div className="absolute left-4 top-[58px] z-30 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-soft">
              <Link onClick={() => setMenuOpen(false)} href={isLoggedIn ? "/mypage" : "/login"} className="block rounded-md px-4 py-3 text-sm font-black text-ink hover:bg-violet-50 hover:text-[#7C6BFF]">
                {isLoggedIn ? "マイページ" : "ログイン"}
              </Link>
            </div>
          ) : null}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <CodeBoxWordmark />
            <span className="flex flex-col leading-none">
              <span className="mt-1 hidden text-xs font-bold text-slate-500 sm:inline">AI MADE SHOWCASE</span>
            </span>
          </Link>
          <p className="hidden text-sm font-bold text-slate-600 md:block">次世代AIクリエイターの登竜門</p>
          <div className="ml-auto flex flex-1 items-center justify-end gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="作品やコードを検索..."
              className="hidden w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blueprint md:block"
            />
            <Link href="/new" className="rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-slate-800">
              投稿
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-2 text-sm">
            <p className="px-4 pb-1 text-xs font-black text-slate-400">{view === "works" ? "ランキング" : "コンテスト"}</p>
            {view === "works" ? sortItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setSort(item.key)}
                className={`w-full rounded-lg px-4 py-3 text-left font-bold ${sort === item.key ? "bg-violet-50 text-[#7C6BFF]" : "text-slate-600 hover:bg-violet-50 hover:text-[#7C6BFF]"}`}
              >
                {item.label}
              </button>
            )) : (
              <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold leading-6 text-slate-600">管理人が決めたコンテストだけを表示しています。</p>
            )}
            {view === "works" ? <p className="px-4 pb-1 pt-5 text-xs font-black text-slate-400">AI</p> : null}
            {view === "works" ? <div className="space-y-2">
              {allAiTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => setAiTool(tool)}
                  className={`w-full rounded-lg px-4 py-3 text-left font-bold ${aiTool === tool ? "bg-violet-50 text-[#7C6BFF]" : "text-slate-600 hover:bg-violet-50 hover:text-[#7C6BFF]"}`}
                >
                  {tool}
                </button>
              ))}
            </div> : null}
          </nav>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              <button onClick={() => setView("works")} className={`rounded-md px-4 py-3 text-sm font-black ${view === "works" ? "bg-white text-ink shadow-soft" : "text-slate-500"}`}>アイデア</button>
              <button onClick={() => setView("themes")} className={`rounded-md px-4 py-3 text-sm font-black ${view === "themes" ? "bg-white text-ink shadow-soft" : "text-slate-500"}`}>コンテスト</button>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black text-blueprint">AIクリエイター発掘プラットフォーム</p>
                <h1 className="mt-2 text-2xl font-black">{view === "themes" ? "今月のお題から挑戦しよう。" : "AIで作ったものを発表しよう。"}</h1>
                {view === "works" ? <p className="mt-2 text-sm text-slate-600">アプリ、ゲーム、イラスト、動画、漫画、UI、アイデア。完成前でもOK。成長がプロフィールに残ります。</p> : null}
              </div>
              <Link href="/new" className={`sm:ml-auto rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-ink hover:border-[#7C6BFF] hover:text-[#7C6BFF] ${view === "themes" ? "hidden" : ""}`}>
                投稿
              </Link>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="作品やコードを検索..."
              className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blueprint md:hidden"
            />
            {view === "works" ? <p className="mt-4 text-xs font-black text-slate-400 lg:hidden">ランキング</p> : null}
            {view === "works" ? <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {sortItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSort(item.key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${sort === item.key ? "bg-[#7C6BFF] text-white" : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-[#7C6BFF]"}`}
                >
                  {item.label}
                </button>
              ))}
            </div> : null}
            {view === "works" ? <p className="mt-4 text-xs font-black text-slate-400 lg:hidden">AI</p> : null}
            {view === "works" ? <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {allAiTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => setAiTool(tool)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${aiTool === tool ? "bg-[#7C6BFF] text-white" : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-[#7C6BFF]"}`}
                >
                  {tool}
                </button>
              ))}
            </div> : null}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">{view === "themes" ? "コンテスト一覧" : isRanking ? `${currentSortLabel}ランキング` : "新着投稿"}</h2>
            {view === "works" && (isRanking || aiTool !== "すべて") ? (
              <p className="text-xs font-bold text-slate-500">{aiTool === "すべて" ? "👍 とコメントの反響順" : aiTool}</p>
            ) : null}
          </div>

          {visiblePosts.map((post, index) => (
            <article key={post.id} className="rounded-lg border border-slate-200 bg-white shadow-soft transition hover:border-[#7C6BFF] hover:shadow-lg">
              <Link href={`/post/${post.id}`} className="block p-4 sm:p-5">
              <div className="flex gap-3">
                {view === "themes" ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-black text-bolt">募</div>
                ) : isRanking ? (
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black ${index < 3 ? "bg-orange-100 text-bolt" : "bg-slate-100 text-slate-600"}`}>
                    {index + 1}
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 font-bold text-white">A</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      {view === "works" ? <CreatorLine post={post} rankingLabel={isRanking ? `${currentSortLabel}ランキング ${index + 1}位` : ""} /> : <p className="text-xs font-bold text-slate-500">anon ・ {formatMonth(post.createdAt)}</p>}
                      <h3 className="mt-2 block text-lg font-black hover:text-[#7C6BFF]">{post.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {view === "themes" ? <p className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-bolt">コンテスト</p> : null}
                        {post.reward ? <p className="inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">賞金 {post.reward}</p> : null}
                        <XAccountLink account={post.xAccount} />
                      </div>
                    </div>
                  </div>
                  {post.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p> : null}
                  {view === "themes" ? <ThemeSummary post={post} /> : null}
                  {query.trim() && !post.title.toLowerCase().includes(query.toLowerCase()) && post.code.toLowerCase().includes(query.toLowerCase()) ? (
                    <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blueprint">コード内に一致</p>
                  ) : null}
                  {view === "works" ? <ThumbnailGrid post={post} /> : null}
                  {view === "themes" ? (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">投稿数 {(post.completedWorks ?? []).length}</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleLike(post.id);
                        }}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold hover:border-[#7C6BFF] hover:text-[#7C6BFF] disabled:bg-slate-50 disabled:text-slate-400"
                        disabled={hasLikedPost(post.id)}
                      >
                        👍 {post.likes}
                      </button>
                      <span className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">コメント {post.comments.length}</span>
                      {post.aiTool ? <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">{post.aiTool}</span> : null}
                    </div>
                  )}
                </div>
              </div>
              </Link>
            </article>
          ))}
        </section>

        <aside className="hidden space-y-5 lg:block">
          {view === "works" ? (
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-5 shadow-soft">
              <p className="text-xs font-black text-bolt">今月のコンテスト</p>
              <h2 className="mt-2 font-black">学校生活 × AI</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-700">賞金枠、新人賞、アイデア賞、成長賞を準備中。</p>
            </div>
          ) : null}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-black">{view === "themes" ? "コンテストの見方" : "反響ランキング"}</h2>
              {view === "works" ? <button onClick={() => setSort("all")} className="text-sm font-bold text-blueprint">もっと見る</button> : null}
            </div>
            {view === "themes" ? (
              <p className="mt-4 text-sm font-bold leading-6 text-slate-600">気になるテーマを開いて「このテーマを作る」を押すと開発中になります。完成したら完成報告を追加できます。</p>
            ) : (
            <ol className="mt-4 space-y-4">
              {hot.map((post, index) => (
                <li key={post.id} className="flex gap-3 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 font-black text-bolt">{index + 1}</span>
                  <Link href={`/post/${post.id}`} className="line-clamp-2 font-bold hover:text-bolt">{post.title}</Link>
                  <span className="ml-auto text-xs text-slate-400">👍 {post.likes}</span>
                </li>
              ))}
            </ol>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-black">codeboxとは？</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">若いAIクリエイターが作品、挑戦、実績を積み上げる場所です。</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CreatorLine({ post, rankingLabel }: { post: CodePost; rankingLabel: string }) {
  const rank = creatorRank(post);
  return (
    <p className="text-xs font-bold text-slate-500">
      {rankingLabel ? `${rankingLabel} ・ ` : ""}anon ・ Lv.{creatorLevel(post)} ・ <span className={rank.className}>{rank.label}</span> ・ {formatTime(post.createdAt)}
    </p>
  );
}

function ThemeSummary({ post }: { post: CodePost }) {
  const items = [
    post.problem ? `困りごと: ${post.problem}` : "",
    post.targetUser ? `想定ユーザー: ${post.targetUser}` : "",
    post.deadline ? `期限: ${post.deadline}` : ""
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="mt-3 grid gap-2 rounded-lg bg-orange-50 p-3 text-xs font-bold leading-5 text-slate-700 sm:grid-cols-2">
      {items.map((item) => <p key={item}>{item}</p>)}
    </div>
  );
}

function formatMonth(value: string) {
  return `${new Date(value).getMonth() + 1}月`;
}

function creatorLevel(post: CodePost) {
  return Math.max(1, Math.min(99, Math.floor((post.likes + post.comments.length * 8) / 25) + 1));
}

function creatorRank(post: CodePost) {
  const score = post.likes + post.comments.length * 10;
  if (score >= 320) return { label: "Diamond", className: "text-blueprint" };
  if (score >= 180) return { label: "Gold", className: "text-yellow-700" };
  if (score >= 80) return { label: "Silver", className: "text-slate-500" };
  return { label: "Bronze", className: "text-bolt" };
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

  if (!images.length && post.archiveUrl) return null;

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
