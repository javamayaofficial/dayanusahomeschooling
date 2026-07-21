"use client";

import React from "react";

/**
 * Markdown minimal → elemen React (aman: teks di-escape otomatis oleh React).
 * Mendukung: heading (#/##/###), **bold**, *italic*, `code`, [teks](url),
 * blok kode ```…```, list (- / 1.), dan paragraf.
 *
 * Catatan: dibuat mandiri agar build pasti berhasil tanpa dependensi eksternal.
 * Bila ingin fitur Markdown penuh, ganti komponen ini dengan `react-markdown`.
 */

let keySeq = 0;
const nextKey = () => `md-${keySeq++}`;

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex: link | bold | italic | code
  const pattern = /(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) nodes.push(<a key={nextKey()} href={m[3]} target="_blank" rel="noreferrer">{m[2]}</a>);
    else if (m[4]) nodes.push(<strong key={nextKey()}>{m[5]}</strong>);
    else if (m[6]) nodes.push(<em key={nextKey()}>{m[7]}</em>);
    else if (m[8]) nodes.push(<code key={nextKey()}>{m[9]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blok kode
    if (line.trim().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { buf.push(lines[i]); i++; }
      i++; // lewati penutup
      blocks.push(<pre key={nextKey()}><code>{buf.join("\n")}</code></pre>);
      continue;
    }

    // heading
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const inner = renderInline(h[2]);
      blocks.push(level === 1 ? <h1 key={nextKey()}>{inner}</h1> : level === 2 ? <h2 key={nextKey()}>{inner}</h2> : <h3 key={nextKey()}>{inner}</h3>);
      i++; continue;
    }

    // list (unordered / ordered)
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        const text = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, "");
        items.push(<li key={nextKey()}>{renderInline(text)}</li>);
        i++;
      }
      blocks.push(ordered ? <ol key={nextKey()}>{items}</ol> : <ul key={nextKey()}>{items}</ul>);
      continue;
    }

    // baris kosong
    if (line.trim() === "") { i++; continue; }

    // paragraf (gabung baris berturut sampai kosong / blok lain)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^\s*([-*]|\d+\.)\s+/.test(lines[i]) && !/^#{1,3}\s/.test(lines[i]) && !lines[i].trim().startsWith("```")) {
      para.push(lines[i]); i++;
    }
    blocks.push(<p key={nextKey()}>{renderInline(para.join(" "))}</p>);
  }

  return <div className="md">{blocks}</div>;
}
