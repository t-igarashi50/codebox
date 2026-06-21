const projects = [
  "ASMR音声編集ツール",
  "家族共有カレンダーサイト",
  "クラブディオス女性求人LP",
  "PSD文字入れデザインツール",
  "AIコード共有コミュニティMVP"
];

function makePostText(items) {
  return `AIで作ったもの: ${items.length}件\n` + items.map((name) => `- ${name}`).join("\n");
}

console.log(makePostText(projects));
