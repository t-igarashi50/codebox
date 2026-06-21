"use client";

import { seedPosts } from "./mockData";
import { supabase } from "./supabase";
import type { CodePost, CommentItem, NewPostInput, SortMode, SupabasePostRow } from "./types";

const STORAGE_KEY = "happa.posts.v1";
const LIKED_STORAGE_KEY = "code-garage.liked-posts.v1";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_ARCHIVE_BYTES = 3 * 1024 * 1024;
const EMPTY_CODE_MESSAGE = "コードはまだ貼られていません。";

function readLocal(): CodePost[] {
  if (typeof window === "undefined") return seedPosts;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return seedPosts;
  }
  return (JSON.parse(raw) as CodePost[]).map(normalizePost);
}

function writeLocal(posts: CodePost[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    throw new Error("ファイルが大きすぎて保存できません。画像やZIPを小さくしてください。");
  }
}

export async function listPosts(sort: SortMode, query = "") {
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("id,title,code,description,screenshot_url,screenshot_urls,archive_url,archive_name,archive_size,language,ai_tool,x_account,created_at,likes_count,comments:comments(id,body,created_at)")
      .order("created_at", { ascending: false });

    if (data) {
      return sortPosts(
        (data as SupabasePostRow[]).map((item) => normalizePost({
          id: item.id,
          title: item.title,
          code: item.code,
          description: item.description ?? "",
          screenshotUrl: item.screenshot_url ?? "",
          screenshotUrls: item.screenshot_urls ?? [],
          archiveUrl: item.archive_url ?? "",
          archiveName: item.archive_name ?? "",
          archiveSize: item.archive_size ?? 0,
          language: item.language ?? "javascript",
          aiTool: item.ai_tool ?? "",
          xAccount: item.x_account ?? "",
          createdAt: item.created_at,
          likes: item.likes_count ?? 0,
          comments: (item.comments ?? []).map((comment) => ({
            id: comment.id,
            body: comment.body,
            createdAt: comment.created_at
          }))
        })),
        sort,
        query
      );
    }
  }

  return sortPosts(readLocal(), sort, query);
}

export async function getPost(id: string) {
  const posts = await listPosts("new");
  return posts.find((post) => post.id === id) ?? null;
}

export async function createPost(input: NewPostInput) {
  const code = input.code.trim() || EMPTY_CODE_MESSAGE;
  const language = input.code.trim() ? input.language : "text";

  if (supabase) {
    const { data } = await supabase
      .rpc("create_post_with_password", {
        post_title: input.title,
        post_code: code,
        post_description: input.description || null,
        post_screenshot_url: input.screenshotUrls?.[0] || null,
        post_screenshot_urls: input.screenshotUrls?.slice(0, 4) ?? [],
        post_archive_url: input.archiveUrl || null,
        post_archive_name: input.archiveName || null,
        post_archive_size: input.archiveSize || null,
        post_language: language,
        post_ai_tool: input.aiTool || null,
        post_x_account: normalizeXAccount(input.xAccount),
        delete_password: input.deletePassword
      })
      .single();
    if (data) return data as string;
  }

  const posts = readLocal();
  const post: CodePost = {
    id: `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: [],
    title: input.title,
    code,
    description: input.description,
    screenshotUrls: input.screenshotUrls,
    archiveUrl: input.archiveUrl,
    archiveName: input.archiveName,
    archiveSize: input.archiveSize,
    language,
    aiTool: input.aiTool,
    xAccount: normalizeXAccount(input.xAccount),
    deletePasswordHash: await hashPassword(input.deletePassword)
  };
  writeLocal([post, ...posts]);
  return post.id;
}

export async function deletePost(id: string, deletePassword: string) {
  if (supabase) {
    const { data, error } = await supabase.rpc("delete_post_with_password", {
      post_id: id,
      password: deletePassword
    });
    if (error) throw new Error("削除に失敗しました。");
    return Boolean(data);
  }

  const posts = readLocal();
  const target = posts.find((post) => post.id === id);
  if (!target || target.deletePasswordHash !== await hashPassword(deletePassword)) return false;
  writeLocal(posts.filter((post) => post.id !== id));
  return true;
}

export async function likePost(id: string) {
  if (hasLikedPost(id)) return false;
  if (supabase) {
    await supabase.rpc("increment_like", { post_id: id });
  }
  const posts = readLocal().map((post) => post.id === id ? { ...post, likes: post.likes + 1 } : post);
  writeLocal(posts);
  rememberLikedPost(id);
  return true;
}

export async function addComment(postId: string, body: string) {
  if (supabase) {
    await supabase.from("comments").insert({ post_id: postId, body });
  }
  const comment: CommentItem = { id: `comment-${Date.now()}`, body, createdAt: new Date().toISOString() };
  const posts = readLocal().map((post) =>
    post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
  );
  writeLocal(posts);
}

export async function saveScreenshot(file: File) {
  if (supabase) {
    const extension = file.name.split(".").pop() || "png";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("screenshots").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (!error) {
      const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
      return data.publicUrl;
    }
  }

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export async function saveScreenshots(files: File[]) {
  const limited = files.slice(0, 4);
  const tooLarge = limited.find((file) => file.size > MAX_IMAGE_BYTES);
  if (tooLarge) {
    throw new Error("1枚2MBまでの画像を選んでください。");
  }
  const totalSize = limited.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_IMAGE_BYTES) {
    throw new Error("画像の合計は6MBまでにしてください。");
  }
  return Promise.all(limited.map((file) => saveScreenshot(file)));
}

export async function saveArchive(file: File) {
  if (!file.name.toLowerCase().endsWith(".zip")) {
    throw new Error("作品フォルダはZIPにして選んでください。");
  }
  if (file.size > MAX_ARCHIVE_BYTES) {
    throw new Error("ZIPは3MBまでにしてください。");
  }

  if (supabase) {
    const safeName = file.name.replace(/[^\w.\-()[\]ぁ-んァ-ン一-龥]/g, "_");
    const path = `${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("archives").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (!error) {
      const { data } = supabase.storage.from("archives").getPublicUrl(path);
      return {
        archiveUrl: data.publicUrl,
        archiveName: file.name,
        archiveSize: file.size
      };
    }
  }

  return new Promise<{ archiveUrl: string; archiveName: string; archiveSize: number }>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      archiveUrl: String(reader.result),
      archiveName: file.name,
      archiveSize: file.size
    });
    reader.readAsDataURL(file);
  });
}

export function getPostImages(post: CodePost) {
  return (post.screenshotUrls?.length ? post.screenshotUrls : post.screenshotUrl ? [post.screenshotUrl] : []).slice(0, 4);
}

export function hasSharedCode(post: CodePost) {
  return post.code.trim() && post.code.trim() !== EMPTY_CODE_MESSAGE;
}

function sortPosts(posts: CodePost[], sort: SortMode, query: string) {
  const now = Date.now();
  const filtered = posts.filter((post) => {
    const target = `${post.title} ${post.description ?? ""} ${post.aiTool ?? ""} ${post.xAccount ?? ""} ${post.archiveName ?? ""} ${post.code}`.toLowerCase();
    return target.includes(query.toLowerCase());
  });

  const period = sort === "today" ? 1 : sort === "week" ? 7 : sort === "month" ? 30 : 9999;
  const active = ["today", "week", "month"].includes(sort)
    ? filtered.filter((post) => now - new Date(post.createdAt).getTime() < period * 86400000)
    : filtered;

  if (sort === "rising") {
    return [...active].sort((a, b) => trendScore(b) - trendScore(a));
  }

  if (sort === "all" || sort === "today" || sort === "week" || sort === "month") {
    return [...active].sort((a, b) => b.likes + b.comments.length * 2 - (a.likes + a.comments.length * 2));
  }

  return [...active].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

function trendScore(post: CodePost) {
  const hours = Math.max(1, (Date.now() - new Date(post.createdAt).getTime()) / 3600000);
  return (post.likes + post.comments.length * 3) / hours;
}

export function formatTime(value: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

function normalizePost(post: CodePost): CodePost {
  const seedPost = seedPosts.find((item) => item.id === post.id);
  const screenshotUrls = getPostImages(post);
  const fallbackUrls = seedPost ? getPostImages(seedPost) : [];
  const normalizedUrls = screenshotUrls.length ? screenshotUrls : fallbackUrls;
  return {
    ...post,
    screenshotUrls: normalizedUrls,
    screenshotUrl: normalizedUrls[0] ?? "",
    archiveUrl: post.archiveUrl ?? "",
    archiveName: post.archiveName ?? "",
    archiveSize: post.archiveSize ?? 0
  };
}

export function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function readLikedPostIds() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LIKED_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export function hasLikedPost(id: string) {
  return readLikedPostIds().includes(id);
}

function rememberLikedPost(id: string) {
  const liked = new Set(readLikedPostIds());
  liked.add(id);
  window.localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(Array.from(liked)));
}

function normalizeXAccount(value?: string) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withoutUrl = trimmed
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  return withoutUrl ? `@${withoutUrl}` : "";
}

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
