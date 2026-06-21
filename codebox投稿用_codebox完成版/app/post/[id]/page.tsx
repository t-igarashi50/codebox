"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addComment, deletePost, formatBytes, formatTime, getPost, getPostImages, hasSharedCode, likePost } from "../../../lib/store";
import type { CodePost } from "../../../lib/types";
import { highlightCode } from "../../../lib/highlight";
import { buildCodePreviewSrcDoc } from "../../../lib/preview";
import { FileThumbnail } from "../../../components/FileThumbnail";

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<CodePost | null>(null);
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  async function refresh() {
    setPost(await getPost(params.id));
  }

  useEffect(() => {
    refresh();
  }, [params.id]);

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
          <p className="font-black">投稿が見つかりません</p>
          <Link href="/" className="mt-4 inline-block text-sm font-bold text-bolt">ホームへ戻る</Link>
        </div>
      </main>
    );
  }

  const currentPost = post;

  async function copy() {
    await navigator.clipboard.writeText(currentPost.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    await addComment(currentPost.id, comment.trim());
    setComment("");
    await refresh();
  }

  async function handleLike() {
    await likePost(currentPost.id);
    await refresh();
  }

  async function handleDelete(event: React.FormEvent) {
    event.preventDefault();
    setDeleteMessage("");
    if (!deletePassword.trim()) {
      setDeleteMessage("削除用パスワードを入れてください。");
      return;
    }
    const deleted = await deletePost(currentPost.id, deletePassword.trim());
    if (!deleted) {
      setDeleteMessage("削除用パスワードが違います。");
      return;
    }
    router.push("/");
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <article className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-bolt">← ホーム</Link>
          <Link href="/new" className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white">投稿</Link>
        </div>

        <p className="mt-6 text-sm font-bold text-slate-500">anon ・ {formatTime(currentPost.createdAt)}</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">{currentPost.title}</h1>
        {currentPost.xAccount ? <XAccountLink account={currentPost.xAccount} /> : null}
        {currentPost.description ? <p className="mt-4 leading-7 text-slate-600">{currentPost.description}</p> : null}
        <ImageGrid post={currentPost} />
        <ArchiveDownload post={currentPost} />

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-slate-300 sm:px-4 sm:py-3">
            <span>{hasSharedCode(currentPost) ? "コード" : "コード未掲載"}</span>
            {hasSharedCode(currentPost) ? <button onClick={copy} className="rounded-md bg-white px-3 py-2 font-bold text-ink hover:bg-orange-50 sm:px-4">{copied ? "コピー済み" : "全文コピー"}</button> : null}
          </div>
          {hasSharedCode(currentPost) ? (
            <pre className="code-scroll max-h-[42vh] overflow-auto p-3 text-xs leading-5 text-slate-100 sm:max-h-[54vh] sm:p-4 sm:text-sm sm:leading-6"><code dangerouslySetInnerHTML={{ __html: highlightCode(currentPost.code, currentPost.language) }} /></pre>
          ) : (
            <p className="p-4 text-sm font-bold leading-6 text-slate-300">この投稿はスクショと説明だけで共有されています。</p>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button onClick={handleLike} className="rounded-full border border-slate-200 px-5 py-3 font-bold hover:border-bolt">👍 {currentPost.likes}</button>
          <span className="rounded-full border border-slate-200 px-5 py-3 font-bold">コメント {currentPost.comments.length}</span>
        </div>
      </article>

      <section className="mx-auto mt-6 max-w-5xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-black">コメント</h2>
        <form onSubmit={submitComment} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input value={comment} onChange={(event) => setComment(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blueprint" placeholder="匿名でコメント" />
          <button className="rounded-lg bg-bolt px-5 py-3 font-bold text-white">投稿</button>
        </form>
        <div className="mt-5 divide-y divide-slate-100">
          {currentPost.comments.map((item) => (
            <div key={item.id} className="py-4">
              <p className="text-sm font-bold text-slate-500">anon ・ {formatTime(item.createdAt)}</p>
              <p className="mt-2 text-slate-700">{item.body}</p>
            </div>
          ))}
          {!currentPost.comments.length ? <p className="py-5 text-sm text-slate-500">まだコメントはありません。</p> : null}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-black">投稿を削除</h2>
        <form onSubmit={handleDelete} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="削除用パスワード" />
          <button className="rounded-lg border border-bolt px-5 py-3 font-bold text-bolt hover:bg-orange-50">削除</button>
        </form>
        {deleteMessage ? <p className="mt-3 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-bolt">{deleteMessage}</p> : null}
      </section>
    </main>
  );
}

function ArchiveDownload({ post }: { post: CodePost }) {
  if (!post.archiveUrl) return null;
  return (
    <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
      <p className="text-sm font-black text-blueprint">作品ZIP</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-ink">{post.archiveName || "作品.zip"}</p>
          {post.archiveSize ? <p className="mt-1 text-xs font-bold text-slate-500">{formatBytes(post.archiveSize)}</p> : null}
        </div>
        <a
          href={post.archiveUrl}
          download={post.archiveName || "codebox-work.zip"}
          className="rounded-lg bg-blueprint px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-700"
        >
          ダウンロード
        </a>
      </div>
    </div>
  );
}

function ImageGrid({ post }: { post: CodePost }) {
  const images = getPostImages(post);
  const previewSrcDoc = images.length || !hasSharedCode(post) ? "" : buildCodePreviewSrcDoc(post.code, post.language);
  if (!images.length && !previewSrcDoc && !post.archiveUrl) return null;

  if (previewSrcDoc) {
    return (
      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <iframe
          title={`${post.title} プレビュー`}
          srcDoc={previewSrcDoc}
          sandbox=""
          className="h-80 w-full pointer-events-none"
        />
      </div>
    );
  }

  if (!images.length && post.archiveUrl) {
    return (
      <div className="mt-5">
        <FileThumbnail name={post.archiveName} size={post.archiveSize} />
      </div>
    );
  }

  return (
    <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {images.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt={`${post.title} ${index + 1}`}
          className={`h-full min-h-44 w-full object-cover sm:min-h-64 ${images.length === 1 ? "col-span-2" : ""} ${images.length === 3 && index === 0 ? "row-span-2" : ""}`}
        />
      ))}
    </div>
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
      className="mt-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white hover:bg-slate-700"
    >
      {account}
    </a>
  );
}
