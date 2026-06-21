"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost, saveScreenshots } from "../../lib/store";

const MASTER_PASSWORD = "codebox";

export default function MasterPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [budget, setBudget] = useState("");
  const [reward, setReward] = useState("");
  const [deadline, setDeadline] = useState("");
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  function login(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (password !== MASTER_PASSWORD) {
      setMessage("マスターパスワードが違います。");
      return;
    }
    setUnlocked(true);
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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!title.trim() || !description.trim()) {
      setMessage("タイトルとやりたいことを入れてください。");
      return;
    }

    const id = await createPost({
      kind: "theme",
      title: title.trim(),
      code: "",
      description: description.trim(),
      problem: problem.trim(),
      targetUser: targetUser.trim(),
      budget: budget.trim(),
      reward: reward.trim(),
      deadline,
      screenshotUrls,
      language: "text",
      aiTool: "",
      xAccount: "",
      deletePassword: MASTER_PASSWORD
    });
    router.push(`/post/${id}`);
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen px-4 py-6">
        <form onSubmit={login} className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-bolt">← ホーム</Link>
          <h1 className="mt-6 text-2xl font-black">マスター画面</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">管理人だけがテーマを決める画面です。</p>
          <label className="mt-5 block text-sm font-black">マスターパスワード</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="パスワード" />
          {message ? <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-bolt">{message}</p> : null}
          <button className="mt-5 w-full rounded-lg bg-ink px-5 py-4 font-black text-white hover:bg-slate-800">入る</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <form onSubmit={submit} className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-bolt">← ホーム</Link>
          <h1 className="ml-auto text-xl font-black">マスター画面</h1>
        </div>

        <div className="mt-6 rounded-lg border border-orange-100 bg-orange-50 p-4">
          <p className="text-sm font-black text-bolt">テーマを決める</p>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-700">ここで作ったテーマだけが、トップのテーマタブに表示されます。</p>
        </div>

        <label className="mt-6 block text-sm font-black">タイトル *</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="美容室の予約管理をAIで簡単にしたい" />

        <label className="mt-5 block text-sm font-black">やりたいこと *</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 h-24 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="例: 予約、変更、キャンセルをAIでまとめて管理したい" />

        <label className="mt-5 block text-sm font-black">困っていること</label>
        <textarea value={problem} onChange={(event) => setProblem(event.target.value)} className="mt-2 h-24 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="例: 電話とLINEと紙メモがバラバラで予約ミスが起きる" />

        <label className="mt-5 block text-sm font-black">想定ユーザー</label>
        <input value={targetUser} onChange={(event) => setTargetUser(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-bolt" placeholder="例: 個人美容室、少人数サロン" />

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-black">
            予算
            <input value={budget} onChange={(event) => setBudget(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 font-normal outline-none focus:border-bolt" placeholder="相談したい" />
          </label>
          <label className="block text-sm font-black">
            賞金
            <input value={reward} onChange={(event) => setReward(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 font-normal outline-none focus:border-bolt" placeholder="1万円" />
          </label>
          <label className="block text-sm font-black">
            募集期限
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 font-normal outline-none focus:border-bolt" />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <label className="block text-sm font-black">参考画像（任意）</label>
          <span className="text-xs font-bold text-slate-500">{screenshotUrls.length}/4枚</span>
        </div>
        <label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-black text-slate-600 hover:border-bolt hover:text-bolt">
          画像を選ぶ
          <input type="file" accept="image/*" multiple onChange={(event) => readImages(event.target.files)} className="sr-only" />
        </label>

        {screenshotUrls.length ? (
          <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {screenshotUrls.map((url, index) => (
              <img key={url} src={url} alt={`参考画像 ${index + 1}`} className="h-full min-h-36 w-full object-cover" />
            ))}
          </div>
        ) : null}

        {message ? <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-bolt">{message}</p> : null}

        <button className="mt-6 w-full rounded-lg bg-bolt px-5 py-4 font-black text-white hover:bg-orange-600">テーマを公開</button>
      </form>
    </main>
  );
}
