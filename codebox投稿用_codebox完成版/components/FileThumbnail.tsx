import { formatBytes } from "../lib/store";

type FileThumbnailProps = {
  name?: string;
  size?: number;
  compact?: boolean;
};

export function FileThumbnail({ name, size, compact = false }: FileThumbnailProps) {
  return (
    <div className={`flex w-full items-center justify-center overflow-hidden rounded-lg border border-blue-100 bg-blue-50 ${compact ? "min-h-40 p-4" : "min-h-64 p-6"}`}>
      <div className="flex max-w-full flex-col items-center text-center">
        <div className="relative h-20 w-16 rounded-lg border-2 border-blueprint bg-white shadow-soft">
          <div className="absolute right-0 top-0 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-blueprint bg-blue-100" />
          <div className="absolute inset-x-3 top-9 h-2 rounded-full bg-blueprint" />
          <div className="absolute inset-x-3 top-14 h-2 rounded-full bg-violet-400" />
        </div>
        <p className="mt-4 max-w-full truncate text-sm font-black text-ink">{name || "作品.zip"}</p>
        <p className="mt-1 text-xs font-bold text-blueprint">ZIP {formatBytes(size)}</p>
      </div>
    </div>
  );
}
