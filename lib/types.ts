export type SortMode = "new" | "today" | "week" | "month" | "all" | "rising";
export type PostKind = "work" | "theme";
export type ThemeStatus = "open" | "building" | "completed" | "improving";

export type CodePost = {
  id: string;
  kind?: PostKind;
  title: string;
  code: string;
  description?: string;
  problem?: string;
  targetUser?: string;
  budget?: string;
  reward?: string;
  deadline?: string;
  themeStatus?: ThemeStatus;
  completedWorks?: CompletedWork[];
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

export type CompletedWork = {
  id: string;
  title: string;
  url?: string;
  createdAt: string;
};

export type NewPostInput = {
  kind?: PostKind;
  title: string;
  code: string;
  description?: string;
  problem?: string;
  targetUser?: string;
  budget?: string;
  reward?: string;
  deadline?: string;
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
  kind?: PostKind | null;
  title: string;
  code: string;
  description: string | null;
  problem?: string | null;
  target_user?: string | null;
  budget?: string | null;
  reward?: string | null;
  deadline?: string | null;
  theme_status?: ThemeStatus | null;
  completed_works?: CompletedWork[] | null;
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
