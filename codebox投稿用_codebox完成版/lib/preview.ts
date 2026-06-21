"use client";

const previewCsp = [
  "default-src 'none'",
  "img-src https: data:",
  "style-src 'unsafe-inline' https:",
  "font-src https: data:",
  "script-src 'none'",
  "connect-src 'none'",
  "frame-src 'none'",
  "form-action 'none'"
].join("; ");

const baseStyles = `
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; font-family: Arial, Helvetica, sans-serif; }
    body { background: #ffffff; color: #08131a; overflow: hidden; }
    a, button, input, textarea, select { pointer-events: none; }
    img, video, canvas, svg { max-width: 100%; }
  </style>
`;

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function canShowCodePreview(code: string, language: string) {
  const normalized = code.trim().toLowerCase();
  return Boolean(normalized || language);
}

export function buildCodePreviewSrcDoc(code: string, language: string) {
  if (!canShowCodePreview(code, language)) return "";
  if (language === "css") return buildCssPreview(code);
  if (language === "html" || /<\/?(html|body|main|section|header|div|h1|button|img|style)\b/i.test(code)) {
    return buildHtmlPreview(code);
  }
  return buildLaunchScreenPreview(language);
}

function buildHtmlPreview(code: string) {
  const safeCode = code.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const meta = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${previewCsp}">`;

  if (/<html[\s>]/i.test(safeCode)) {
    return safeCode.replace(/<head[^>]*>/i, (head) => `${head}${meta}${baseStyles}`);
  }

  return `<!doctype html><html><head>${meta}${baseStyles}</head><body>${safeCode}</body></html>`;
}

function buildCssPreview(code: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="${previewCsp}">
    ${baseStyles}
    <style>${code.replace(/<\/style>/gi, "")}</style>
  </head>
  <body>
    <main class="preview-page">
      <section class="hero">
        <p class="eyebrow">codebox</p>
        <h1>AIで作る。みんなで育てる。</h1>
        <p>貼ったCSSの雰囲気をここに表示します。</p>
        <button>プレビュー</button>
      </section>
    </main>
  </body>
</html>`;
}

function buildLaunchScreenPreview(language: string) {
  const label = language === "python" ? "PYTHON" : language.toUpperCase();
  const command = language === "python" ? "python3 app.py" : "起動コマンド";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="${previewCsp}">
    ${baseStyles}
    <style>
      body {
        background:
          radial-gradient(circle at 80% 10%, rgba(37, 99, 235, 0.24), transparent 34%),
          linear-gradient(135deg, #08131a 0%, #101b26 55%, #172332 100%);
        color: #f8fafc;
      }
      .wrap { height: 100vh; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
      .top { display: flex; justify-content: space-between; align-items: center; }
      .badge { border: 1px solid rgba(255,255,255,.24); border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 900; letter-spacing: .06em; }
      .dots { display: flex; gap: 6px; }
      .dots span { width: 10px; height: 10px; border-radius: 999px; background: #f97316; opacity: .9; }
      .dots span:nth-child(2) { background: #2563eb; }
      .dots span:nth-child(3) { background: #72d4ae; }
      .terminal { margin: 0; flex: 1; border-radius: 12px; background: rgba(0,0,0,.3); padding: 18px; font: 800 13px/1.8 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .prompt { color: #72d4ae; }
      .command { color: #f8fafc; }
      .hint { margin-top: 18px; color: rgba(248,250,252,.7); font-family: Arial, Helvetica, sans-serif; font-weight: 800; line-height: 1.6; }
      .screen { margin-top: 12px; height: 66px; border: 1px solid rgba(255,255,255,.18); border-radius: 10px; background: linear-gradient(90deg, rgba(37,99,235,.25), rgba(249,115,22,.18)); display: grid; place-items: center; color: rgba(248,250,252,.72); font-family: Arial, Helvetica, sans-serif; font-weight: 900; }
    </style>
  </head>
  <body>
    <main class="wrap">
      <div class="top">
        <div class="dots"><span></span><span></span><span></span></div>
        <div class="badge">${escapeHtml(label)}</div>
      </div>
      <section class="terminal">
        <span class="prompt">$</span> <span class="command">${escapeHtml(command)}</span>
        <p class="hint">起動後の画面スクショを貼ると、ここに表示されます。</p>
        <div class="screen">APP SCREENSHOT</div>
      </section>
    </main>
  </body>
</html>`;
}
