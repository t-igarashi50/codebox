import type { CodePost } from "./types";

const image = (label: string, color: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 520'%3E%3Crect width='800' height='520' fill='${color}'/%3E%3Crect x='60' y='70' width='680' height='360' rx='24' fill='white' fill-opacity='.88'/%3E%3Ctext x='90' y='145' font-size='42' font-family='Arial' font-weight='700' fill='%23111827'%3E${label}%3C/text%3E%3Ctext x='90' y='215' font-size='28' font-family='Arial' fill='%23475569'%3EAI code sketch%3C/text%3E%3C/svg%3E`;

export const seedPosts: CodePost[] = [
  {
    id: "seed-voice",
    title: "テキストを音声に変換するシンプルなWebアプリ",
    description: "Web Speech APIを使った読み上げアプリ。日本語にも対応。",
    language: "html",
    aiTool: "Claude Code",
    xAccount: "@codegarage",
    screenshotUrls: [image("Voice Web App", "%23dbeafe")],
    createdAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    likes: 128,
    comments: [
      { id: "c1", body: "すごくシンプルで使いやすい！", createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
      { id: "c2", body: "改造して使わせてもらいます！", createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString() }
    ],
    code: `<textarea id="text" placeholder="読み上げたいテキストを入力"></textarea>
<button onclick="speak()">読み上げる</button>
<audio id="audio" controls></audio>

<script>
  function speak() {
    const text = document.getElementById("text").value;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
</script>`
  },
  {
    id: "seed-bg",
    title: "画像の背景をワンクリックで削除するツール",
    description: "rembgを使った実験。ドラッグ&ドロップで画像を選ぶだけ。",
    language: "python",
    aiTool: "Codex",
    xAccount: "@codegarage",
    screenshotUrls: [image("Drop Image", "%23dcfce7"), image("Remove BG", "%23ffedd5")],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 84,
    comments: [{ id: "c3", body: "Windowsでも動作しました。", createdAt: new Date(Date.now() - 1000 * 60 * 100).toISOString() }],
    code: `import streamlit as st
from rembg import remove
from PIL import Image

uploaded = st.file_uploader("画像をドロップ", type=["png", "jpg"])

if uploaded:
    image = Image.open(uploaded)
    result = remove(image)
    st.image(result)
    st.download_button("保存", result.tobytes())`
  },
  {
    id: "seed-todo",
    title: "Todoリストを自動整理するAI",
    description: "雑に貼ったタスクを今日やる順番に並べるだけの小物。",
    language: "typescript",
    aiTool: "Cursor",
    xAccount: "@codegarage",
    screenshotUrls: [image("Todo Sorter", "%23ede9fe")],
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    likes: 342,
    comments: [],
    code: `type Todo = { title: string; urgent: boolean; minutes: number };

export function sortTodos(todos: Todo[]) {
  return todos.sort((a, b) => {
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    return a.minutes - b.minutes;
  });
}`
  }
];
