"use client";

export async function downloadFile(url: string, fileName: string) {
  if (!url) return;

  const href = url.startsWith("data:") ? URL.createObjectURL(await (await fetch(url)).blob()) : url;
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName || "codebox-work.zip";
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (href !== url) {
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
}
