const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function highlightCode(code: string, language: string) {
  const escaped = escapeHtml(code);
  const tokenPattern = /(&lt;\/?[a-zA-Z][^&]*?&gt;|\/\/.*|#.*|"[^"]*"|'[^']*'|`[^`]*`|\b(?:const|let|var|function|return|import|from|export|type|if|else|async|await|class|def|for|while|try|catch|new|in|as)\b|\b\d+\b)/g;

  return escaped.replace(tokenPattern, (token) => {
    if (token.startsWith("&lt;")) return `<span class="token-tag">${token}</span>`;
    if (token.startsWith("//") || token.startsWith("#")) return `<span class="token-comment">${token}</span>`;
    if (token.startsWith("\"") || token.startsWith("'") || token.startsWith("`")) return `<span class="token-string">${token}</span>`;
    if (/^\d+$/.test(token)) return `<span class="token-number">${token}</span>`;
    return `<span class="token-keyword">${token}</span>`;
  });
}

export function detectLanguage(code: string) {
  const text = code.trim();
  if (text.includes("<?php")) return "php";
  if (text.startsWith("import ") && text.includes("from ")) return "python";
  if (text.includes("use client") || text.includes("export default function")) return "react";
  if (text.includes("<html") || text.includes("<script")) return "html";
  if (text.includes("{") && text.includes(":") && text.includes(";")) return "css";
  if (text.includes("type ") || text.includes(": string")) return "typescript";
  return "javascript";
}
