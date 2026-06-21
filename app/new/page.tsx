"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost, formatBytes, saveArchive, saveScreenshots } from "../../lib/store";
import { detectLanguage } from "../../lib/highlight";
import { aiTools } from "../../lib/aiTools";
import { FileThumbnail } from "../../components/FileThumbnail";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [archive, setArchive] = useState<{ archiveUrl: string; archiveName: string; archiveSize: number } | null>(null);
  const [aiTool, setAiTool] = useState("Codex");
  const [xAccount, setXAccount] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const hasWorkContent = code.trim() || description.trim() || screenshotUrls.length || archive;
    if (!title.trim() || !deletePassword.trim() || !hasWorkContent) {
      setMessage("タイトル、見せたい内容、削除用パスワードを入れてください。");
      return;
    }
    if (!/^[\x21-\x7e]{4,10}$/.test(deletePassword.trim())) {
      setMessage("削除用パスワードは半角英数・半角記号のみ 4～10字以内で入れてください。");
      return;
    }
    try {
      const id = await createPost({
        kind: "work",
        title: title.trim(),
        code,
        description: description.trim(),
        screenshotUrls,
        archiveUrl: archive?.archiveUrl,
        archiveName: archive?.archiveName,
        archiveSize: archive?.archiveSize,
        language: detectLanguage(code),
        aiTool,
        xAccount,
        deletePassword: deletePassword.trim()
      });
      router.push(`/post/${id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "投稿に失敗しました。");
    }
  }

  async function readImages(files?: FileList | null) {
    if (!files?.length) return;
    setMessage("");
    try {
      setScreenshotUrls(await saveScreenshots(Array.from(files)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "画像を読み込めませんでした。");
    }
  }

  async function readArchive(files?: FileList | null) {
    const file = Array.from(files ?? []).find((item) => item.name.toLowerCase().endsWith(".zip"));
    if (!file) return;
    setMessage("");
    try {
      setArchive(await saveArchive(file));
      if (!title.trim()) {
        setTitle(file.name.replace(/\.zip$/i, ""));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ZIPを読み込めませんでした。");
    }
  }

  function removeImage(index: number) {
    setScreenshotUrls(screenshotUrls.filter((_, currentIndex) => currentIndex !== index));
  }

  async function dropImages(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (Array.from(files).some((file) => file.name.toLowerCase().endsWith(".zip"))) {
      await readArchive(files);
      return;
    }
    await readImages(files);
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <form onSubmit={submit} className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-bolt">← ホーム</Link>
          <h1 className="ml-auto text-xl font-black">投稿</h1>
        </div>

        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-black text-blueprint">AIで作ったものなら何でもOK</p>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-700">アプリ、ゲーム、待受画像、イラスト、動画、漫画、UI、アイデア。制作途中でも投稿できます。</p>
        </div>

        <label className="mt-6 block text-sm font-black">タイトル *</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="AIで作った待受画像 / ゲーム / 便利ツール" />

        <label className="mt-5 block text-sm font-black">作ったAI</label>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {aiTools.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => setAiTool(tool)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${aiTool === tool ? "bg-ink text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {tool}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <label className="block text-sm font-black">作品画像（最大4枚）</label>
          <span className="text-xs font-bold text-slate-500">{screenshotUrls.length}/4枚</span>
        </div>
        <label
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={dropImages}
          className={`mt-2 flex cursor-pointer items-center justify-center rounded-lg border border-dashed px-4 py-4 text-sm font-black hover:border-bolt hover:text-bolt ${isDragging ? "border-bolt bg-orange-50 text-bolt" : "border-slate-300 bg-slate-50 text-slate-600"}`}
        >
          画像を選ぶ / ドロップ
          <input type="file" accept="image/*" multiple onChange={(event) => readImages(event.target.files)} className="sr-only" />
        </label>

        <div className="mt-5 flex items-center justify-between gap-3">
          <label className="block text-sm font-black">配布ファイルZIP（任意）</label>
          {archive ? <button type="button" onClick={() => setArchive(null)} className="text-xs font-black text-bolt">削除</button> : null}
        </div>
        <label
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={dropImages}
          className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-4 text-center text-sm font-black hover:border-blueprint hover:text-blueprint ${isDragging ? "border-blueprint bg-blue-50 text-blueprint" : "border-slate-300 bg-slate-50 text-slate-600"}`}
        >
          {archive ? (
            <>
              <span>{archive.archiveName}</span>
              <span className="mt-1 text-xs text-slate-500">{formatBytes(archive.archiveSize)}</span>
            </>
          ) : (
            <>
                  <span>配布したいファイルをZIPにしてドロップ</span>
                  <span className="mt-1 text-xs text-slate-500">見る人がそのままダウンロードできます</span>
            </>
          )}
          <input type="file" accept=".zip,application/zip,application/x-zip-compressed" onChange={(event) => readArchive(event.target.files)} className="sr-only" />
        </label>
        {archive ? (
          <div className="mt-3">
            <FileThumbnail name={archive.archiveName} size={archive.archiveSize} compact />
          </div>
        ) : null}

        <label className="mt-5 block text-sm font-black">作品紹介</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 h-24 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="例: 初めてAIで作ったゲームです。まだ途中だけど見てほしいです。" />

        <label className="mt-5 block text-sm font-black">Xアカウント（任意）</label>
        <input value={xAccount} onChange={(event) => setXAccount(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="@code_garage" />

        <label className="mt-5 block text-sm font-black">コード・メモ（任意）</label>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} className="code-scroll mt-2 h-44 w-full rounded-lg border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-bolt sm:h-56" placeholder="コードがある人だけ貼る。作り方メモでもOK。" />

        <label className="mt-5 block text-sm font-black">削除用パスワード *</label>
        <input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="あとで投稿を消す時に使います" />
        <p className="mt-2 text-xs font-bold text-slate-500">※半角英数・半角記号のみ 4～10字以内</p>

        {screenshotUrls.length ? (
          <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {screenshotUrls.map((url, index) => (
              <div key={url} className={`relative ${screenshotUrls.length === 1 ? "col-span-2" : ""} ${screenshotUrls.length === 3 && index === 0 ? "row-span-2" : ""}`}>
                <img src={url} alt={`プレビュー ${index + 1}`} className="h-full min-h-36 w-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} className="absolute right-2 top-2 rounded-full bg-ink px-3 py-1 text-xs font-black text-white">
                  削除
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {message ? <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-bolt">{message}</p> : null}

        <button className="mt-6 w-full rounded-lg bg-ink px-5 py-4 font-black text-white hover:bg-slate-800">投稿</button>
      </form>
    </main>
  );
}
