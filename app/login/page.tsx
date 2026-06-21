"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, signInWithProvider, signOut } from "../../lib/auth";

type LoginUser = {
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
};

export default function LoginPage() {
  const [user, setUser] = useState<LoginUser | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setUser(await getCurrentUser());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(provider: "google" | "twitter") {
    setMessage("");
    try {
      await signInWithProvider(provider);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ログインに失敗しました。");
    }
  }

  async function logout() {
    await signOut();
    await refresh();
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-[#7C6BFF]">← ホーム</Link>
        <h1 className="mt-6 text-2xl font-black">ログイン</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-600">Google / Xログインを後からプロフィール、投稿者、フォローに紐付けられる構造です。</p>

        {user ? (
          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-black text-blueprint">ログイン中</p>
            <p className="mt-2 text-sm font-bold text-ink">{user.user_metadata?.name || user.user_metadata?.full_name || user.email || "ユーザー"}</p>
            <button onClick={logout} className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-black text-ink hover:border-[#7C6BFF] hover:text-[#7C6BFF]">ログアウト</button>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            <button onClick={() => login("google")} className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-black text-ink hover:border-[#7C6BFF] hover:text-[#7C6BFF]">
              Googleでログイン
            </button>
            <button onClick={() => login("twitter")} className="rounded-lg bg-ink px-4 py-3 font-black text-white hover:bg-[#5B5CF6]">
              Xでログイン
            </button>
          </div>
        )}

        {message ? <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-bolt">{message}</p> : null}
      </section>
    </main>
  );
}
