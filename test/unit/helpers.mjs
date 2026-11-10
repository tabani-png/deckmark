// Shared helpers for the node --test unit suites. Each test works in its own temp folder.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SKILL = join(REPO, 'skills', 'deckmark');
export const S = join(SKILL, 'scripts');
export const FX = join(REPO, 'test', 'fixtures');

export function run(script, args = [], opts = {}) {
  return spawnSync(process.execPath, [join(S, script), ...args], { encoding: 'utf8', timeout: 120000, ...opts });
}
export function tmp(prefix = 'deckmark-') { return mkdtempSync(join(tmpdir(), prefix)); }
export function withTmp(fn) { const d = tmp(); try { return fn(d); } finally { rmSync(d, { recursive: true, force: true }); } }
export async function withTmpAsync(fn) { const d = tmp(); try { return await fn(d); } finally { rmSync(d, { recursive: true, force: true }); } }

// A deck in its own folder: meridian tokens and base.css from the scaffold, then the given slides.
export function makeDeck(dir, slides, { body = '', style = '', theme = 'meridian', facts = null } = {}) {
  const out = join(dir, 'deck');
  const r = run('theme.mjs', ['scaffold', theme, '--out', out, '--offline', '--force'], { cwd: dir });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  const html = `<!doctype html>
<!-- Deckmark · theme: test · storyline: none -->
<html lang="en"><head><meta charset="utf-8"><title>t</title><link rel="stylesheet" href="base.css"><link rel="stylesheet" href="tokens.css">${style ? `<style>${style}</style>` : ''}</head>
<body data-format="slides-16x9" ${body}><main class="deck">
${slides.join('\n')}
</main></body></html>`;
  writeFileSync(join(out, 'deck.html'), html);
  if (facts) writeFileSync(join(out, 'facts.json'), JSON.stringify({ facts }));
  return { dir: out, file: join(out, 'deck.html'), facts: join(out, 'facts.json') };
}

// One content slide in the standard frame.
export function slide({ arch, title = 'Revenue grew every year since FY21 on contract wins and pricing', body = '', source = 'Source: fictional test material p1', attrs = '' }) {
  return `<section class="slide" data-archetype="${arch}" ${attrs}>
  <header class="slide-head"><h2 class="action-title">${title}</h2></header>
  <div class="slide-body">${body}</div>
  <footer class="slide-foot"><div class="notes">${source ? `<p class="source">${source}</p>` : ''}</div><span class="pageno">1</span></footer>
</section>`;
}
export const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); return p; };

// A minimal RGB PNG encoder (8-bit, filter 0), for synthetic brand fixtures.
import { deflateSync } from 'node:zlib';
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'latin1'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };
export function png(w, h, colourAt) {
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const [r, g, b] = colourAt(x, y); const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
