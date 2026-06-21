export type SortMode = "new" | "today" | "week" | "month" | "all" | "rising";

export type CodePost = {
  id: string;
  title: string;
  code: string;
  description?: string;
  screenshotUrl?: string;
  screenshotUrls?: string[];
  archiveUrl?: string;
  archiveName?: string;
  archiveSize?: number;
  language: string;
  aiTool?: string;
  xAccount?: string;
  createdAt: string;
  likes: number;
  comments: CommentItem[];
  deletePasswordHash?: string;
};

export type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
};

export type NewPostInput = {
  title: string;
  code: string;
  description?: string;
  screenshotUrls?: string[];
  archiveUrl?: string;
  archiveName?: string;
  archiveSize?: number;
  language: string;
  aiTool?: string;
  xAccount?: string;
  deletePassword: string;
};

export type SupabaseCommentRow = {
  id: string;
  body: string;
  created_at: string;
};

export type SupabasePostRow = {
  id: string;
  title: string;
  code: string;
  description: string | null;
  screenshot_url: string | null;
  screenshot_urls?: string[] | null;
  archive_url?: string | null;
  archive_name?: string | null;
  archive_size?: number | null;
  language: string | null;
  ai_tool?: string | null;
  x_account?: string | null;
  created_at: string;
  likes_count: number | null;
  comments?: SupabaseCommentRow[] | null;
};
