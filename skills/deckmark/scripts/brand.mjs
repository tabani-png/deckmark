#!/usr/bin/env node
// Deckmark brand: read a client's own deck (PDF or PNG pages), find its paper, ink and brand colours by
// area, and print a token override block that re-skins a theme in the client's colours.
// usage: node brand.mjs <deck.pdf | page.png | https://site ...> [--pages 1-8] [--json]
//   PDF pages are rendered with pdftoppm (poppler) into a temp folder outside the project.
//   A website URL is opened in headless Chromium (Playwright): the page is screenshotted at 1280 wide
//   (top 4800px) and measured like a deck page, and the computed heading and body fonts are read.
//   A URL is a public page: fine for a client's own site. Never pass a data-room or intranet URL.
// Pure node: a small PNG decoder over zlib, a 15-bit colour histogram, and a greedy hue clustering that
// scores a cluster by its peak bins, so flat brand fills (panels, bars, headers) beat photographs.
import { readFileSync, readdirSync, mkdtempSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve, extname, basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { inflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// ---------- PNG decode (8-bit, non-interlaced: what pdftoppm and most tools write) ----------
export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8, w = 0, h = 0, depth = 0, type = 0, interlace = 0, palette = null; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), kind = buf.toString('latin1', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (kind === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; type = data[9]; interlace = data[12]; }
    else if (kind === 'PLTE') palette = data;
    else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    pos += 12 + len;
  }
  if (depth !== 8 || interlace) throw new Error(`PNG with bit depth ${depth}${interlace ? ', interlaced' : ''} is not supported; re-export as 8-bit`);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type]; if (!ch) throw new Error(`PNG colour type ${type} not supported`);
  const raw = inflateSync(Buffer.concat(idat)), stride = w * ch, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), o = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[o + x - ch] : 0, b = y ? px[o - stride + x] : 0, c = x >= ch && y ? px[o - stride + x - ch] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[o + x] = v & 255;
    }
  }
  const rgb = (i) => {
    if (type === 2 || type === 6) return [px[i * ch], px[i * ch + 1], px[i * ch + 2], type === 6 ? px[i * ch + 3] : 255];
    if (type === 3) { const k = px[i] * 3; return [palette[k], palette[k + 1], palette[k + 2], 255]; }
    return [px[i * ch], px[i * ch], px[i * ch], type === 4 ? px[i * ch + 1] : 255];
  };
  return { w, h, rgb };
}

// ---------- colour maths (sRGB 0-255) ----------
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
export const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
export const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => a.slice(0, 3).map((v, i) => v + (b[i] - v) * t);
export function hsl(c) { const [r, g, b] = c.slice(0, 3).map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return [h, s, l]; }
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
// Move a colour toward black (light paper) or white (dark paper) until it reaches `min` against paper.
function reach(c, paper, min) {
  const to = lum(paper) > 0.18 ? [0, 0, 0] : [255, 255, 255];
  for (let t = 0; t <= 1.0001; t += 0.02) { const x = mix(c, to, t); if (ratio(x, paper) >= min) return { c: x, moved: t > 0 }; }
  return { c: to, moved: true };
}

// ---------- extraction ----------
export function histogram(images) {
  const bins = new Map(); let total = 0;
  for (const im of images) {
    const step = Math.max(1, Math.floor(Math.sqrt((im.w * im.h) / 250000)));
    for (let y = 0; y < im.h; y += step) for (let x = 0; x < im.w; x += step) {
      const [r, g, b, a] = im.rgb(y * im.w + x); if (a < 128) continue;
      const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      let e = bins.get(k); if (!e) bins.set(k, (e = { n: 0, r: 0, g: 0, b: 0 }));
      e.n++; e.r += r; e.g += g; e.b += b; total++;
    }
  }
  return { total, bins: [...bins.values()].map((e) => ({ n: e.n, c: [e.r / e.n, e.g / e.n, e.b / e.n] })).sort((a, b) => b.n - a.n) };
}

export function palette(images) {
  const { total, bins } = histogram(images);
  if (!total) throw new Error('no pixels read');
  const paper = bins[0].c, light = lum(paper) > 0.18;
  const chroma = bins.filter((b) => { const [, s, l] = hsl(b.c); return s > 0.28 && l > 0.07 && l < 0.93 && ratio(b.c, paper) > 1.3; });
  const clusters = [];
  for (const b of chroma) {
    const [h, , l] = hsl(b.c);
    let k = clusters.find((q) => hueGap(q.h, h) < 22 && Math.abs(q.l - l) < 0.2);
    if (!k) clusters.push((k = { h, l, n: 0, peak: 0, top: 0, c: b.c }));
    k.n += b.n; if (k.top < 3) { k.peak += b.n; k.top++; }
  }
  // A cluster's colour is its commonest bin, the flat fill itself, not a mean pulled toward the paper
  // by anti-aliased edges and photographs.
  const all = clusters.map((k) => ({ c: k.c, share: k.n / total, peak: k.peak / total }));
  const brand = all.filter((k) => k.peak >= 0.002).sort((a, b) => b.peak - a.peak);
  const first = brand[0] || null;
  // The accent is often thin: a red rule, a tick, a short bar on a navy-and-white deck. Area alone
  // misses it, so a saturated hue far from the field (over 40 degrees) wins the accent role from a
  // small minimum area (0.04% of the pages), the largest such cluster first; anti-aliased blends of
  // the two colours stay below that floor. Otherwise the next colour by area, as before.
  const sat = (k) => hsl(k.c)[1];
  const distinct = first ? all.filter((k) => k !== first && hueGap(hsl(k.c)[0], hsl(first.c)[0]) > 40 && sat(k) >= 0.45 && k.share >= 0.0004).sort((a, b) => b.share - a.share) : [];
  const second = first ? distinct[0] || brand.find((k) => k !== first && (hueGap(hsl(k.c)[0], hsl(first.c)[0]) >= 30 || Math.abs(hsl(k.c)[2] - hsl(first.c)[2]) > 0.3)) || null : null;
  if (second && !brand.includes(second)) brand.push(second);
  // ink: the commonest strong-contrast colour that is not a brand fill (titles and body copy)
  const inkBin = bins.find((b) => ratio(b.c, paper) >= 7 && hsl(b.c)[1] < 0.5 && b.n / total > 0.001);
  return { paper, light, ink: inkBin ? inkBin.c : (light ? [20, 20, 24] : [240, 240, 240]), brand: brand.slice(0, 5), first, second };
}

// Map the palette onto the token names base.css and the themes read. Every pair is contrast-checked:
// body ink and muted text 4.5:1, accent text 4.5:1, accent fills and series 3:1 against paper.
export function tokens(p) {
  const notes = [], paper = p.paper;
  let ink = p.ink; if (ratio(ink, paper) < 7) { ink = reach(ink, paper, 7).c; notes.push('ink darkened to 7:1'); }
  const dark = (k) => k && hsl(k.c)[2] < 0.38;
  // A light deck with a dark brand colour (navy, forest, oxblood) uses it for fields and table heads,
  // and the brighter brand colour for the highlight. Otherwise the first brand colour is the highlight.
  let field, accent;
  if (p.light && dark(p.first) && p.second && !dark(p.second)) { field = p.first.c; accent = p.second.c; }
  else if (p.light && dark(p.second) && p.first && !dark(p.first)) { field = p.second.c; accent = p.first.c; }
  // Both brand colours dark (navy and oxblood): the one with more area is the field, the other the highlight.
  else if (p.light && dark(p.first) && dark(p.second)) { const [big, small] = p.first.share >= p.second.share ? [p.first, p.second] : [p.second, p.first]; field = big.c; accent = small.c; }
  else { accent = p.first ? p.first.c : ink; field = p.second ? p.second.c : p.first ? p.first.c : ink; }
  const a3 = reach(accent, paper, 3); if (a3.moved) notes.push(`accent moved to ${hex(a3.c)} for 3:1 on paper`);
  const aText = reach(accent, paper, 4.5); if (aText.moved) notes.push(`accent text ${hex(aText.c)} for 4.5:1 on paper`);
  const fieldInk = ratio([255, 255, 255], field) >= ratio(ink, field) ? [255, 255, 255] : ink;
  if (ratio(fieldInk, field) < 4.5) notes.push(`text on the brand field is ${ratio(fieldInk, field).toFixed(2)}:1, under 4.5:1; keep body text off it`);
  const accentInk = ratio([255, 255, 255], a3.c) >= ratio([17, 17, 17], a3.c) ? [255, 255, 255] : [17, 17, 17];
  const ink2 = reach(mix(ink, paper, 0.18), paper, 7).c;
  const muted = reach(mix(ink, paper, 0.45), paper, 4.6).c;
  const series2 = reach(mix(field, paper, 0.45), paper, 3).c;
  const t = {
    '--paper': paper, '--paper-2': mix(paper, ink, 0.045), '--paper-3': mix(paper, ink, 0.09),
    '--ink': ink, '--ink-2': ink2, '--muted': muted, '--rule': mix(paper, ink, 0.16), '--rule-2': mix(paper, ink, 0.32),
    '--accent': a3.c, '--accent-hi': a3.c, '--accent-text': aText.c, '--accent-ink': accentInk, '--accent-2': field,
    '--hl': a3.c, '--hl-text': aText.c, '--field': field, '--field-ink': fieldInk,
    '--cover-bg': field, '--cover-ink': fieldInk, '--cover-accent': reach(a3.c, field, 4.5).c, '--divider-bg': field, '--divider-ink': fieldInk,
    '--series-1': field, '--series-2': series2, '--series-3': mix(paper, ink, 0.32), '--series-4': mix(paper, ink, 0.2),
    '--pos': field, '--neg': ink2,
  };
  const check = { 'ink on paper': ratio(ink, paper), 'muted on paper': ratio(muted, paper), 'accent text on paper': ratio(aText.c, paper), 'accent fill on paper': ratio(a3.c, paper), 'field ink on field': ratio(fieldInk, field) };
  return { tokens: Object.fromEntries(Object.entries(t).map(([k, v]) => [k, hex(v)])), check, notes };
}

export function cssBlock(t, source) {
  return `/* brand override from ${source} (brand.mjs); after the theme tokens, so it wins */\n:root{\n${Object.entries(t.tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n`;
}

// Read a PDF (rendered with pdftoppm) or PNG files into decoded images.
export function readSource(files, pages = '1-8') {
  const out = []; let tmp = null;
  try {
    for (const f of files) {
      if (!existsSync(f)) throw new Error(`${f} not found`);
      if (extname(f).toLowerCase() === '.pdf') {
        tmp = tmp || mkdtempSync(join(tmpdir(), 'deckmark-brand-'));
        const [a, b] = String(pages).split('-').map(Number);
        try { execFileSync('pdftoppm', ['-r', '40', '-png', '-f', String(a || 1), '-l', String(b || a || 8), f, join(tmp, basename(f, '.pdf').replace(/\W+/g, '_'))], { stdio: 'pipe' }); }
        catch (e) { throw new Error(`pdftoppm failed on ${f} (${e.code === 'ENOENT' ? 'poppler not installed: brew install poppler, or pass PNG pages' : e.message})`); }
      } else out.push(decodePng(readFileSync(f)));
    }
    if (tmp) for (const p of readdirSync(tmp).filter((x) => x.endsWith('.png')).sort()) out.push(decodePng(readFileSync(join(tmp, p))));
  } finally { if (tmp) rmSync(tmp, { recursive: true, force: true }); }
  if (!out.length) throw new Error('no pages read');
  return out;
}

export function brandFrom(files, pages) {
  const p = palette(readSource(files, pages));
  const t = tokens(p);
  return { palette: p, ...t, css: cssBlock(t, files.map((f) => basename(f)).join(', ')) };
}

export const isUrl = (s) => /^https?:\/\//i.test(String(s));
const GENERIC = /^(serif|sans-serif|monospace|system-ui|cursive|fantasy|ui-sans-serif|ui-serif|-apple-system|blinkmacsystemfont|inherit|initial)$/i;
// First named family of a computed font-family stack, or null for a generic one.
export function firstFamily(stack) {
  const f = String(stack || '').split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).find(Boolean);
  return f && !GENERIC.test(f) ? f : null;
}

// Open each URL in headless Chromium, screenshot it, and read its heading and body fonts.
export async function readUrls(urls, { width = 1280, maxHeight = 4800 } = {}) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const images = [], fonts = [];
  try {
    for (const url of urls) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => { await page.waitForLoadState('load', { timeout: 15000 }); });
        await page.waitForTimeout(1200);
        fonts.push(await page.evaluate(() => {
          const fam = (sel) => { for (const el of document.querySelectorAll(sel)) { if (el.offsetHeight && el.textContent.trim()) return getComputedStyle(el).fontFamily; } return null; };
          return { display: fam('h1') || fam('h2') || fam('h3'), body: fam('p') || fam('li') || getComputedStyle(document.body).fontFamily };
        }));
        const h = Math.min(maxHeight, await page.evaluate(() => document.documentElement.scrollHeight));
        images.push(decodePng(await page.screenshot({ clip: { x: 0, y: 0, width, height: Math.max(900, h) }, fullPage: true })));
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
  const pick = (k) => fonts.map((f) => firstFamily(f[k])).find(Boolean) || null;
  return { images, fonts: { display: pick('display'), body: pick('body') } };
}

// Any mix of files and URLs. Async because a URL needs a browser.
export async function brandFromAny(sources, pages) {
  const urls = sources.filter(isUrl), files = sources.filter((s) => !isUrl(s));
  const images = files.length ? readSource(files, pages) : [];
  let fonts = null;
  if (urls.length) { const r = await readUrls(urls); images.push(...r.images); fonts = r.fonts; }
  const p = palette(images);
  const t = tokens(p);
  const label = sources.map((s) => (isUrl(s) ? s : basename(s))).join(', ');
  return { palette: p, ...t, fonts, css: cssBlock(t, label) };
}

const IS_MAIN = (() => { try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (IS_MAIN) {
  const a = process.argv.slice(2);
  const pi = a.indexOf('--pages');
  const files = a.filter((x, i) => !x.startsWith('--') && a[i - 1] !== '--pages');
  if (!files.length) { console.error('usage: node brand.mjs <deck.pdf | page.png | https://site ...> [--pages 1-8] [--json]'); process.exit(2); }
  try {
    const r = await brandFromAny(files.map((f) => (isUrl(f) ? f : resolve(f))), pi >= 0 ? a[pi + 1] : '1-8');
    const P = r.palette;
    if (a.includes('--json')) { console.log(JSON.stringify({ paper: hex(P.paper), light: P.light, ink: hex(P.ink), brand: P.brand.map((b) => ({ hex: hex(b.c), share: +b.share.toFixed(4), peak: +b.peak.toFixed(4) })), fonts: r.fonts, tokens: r.tokens, check: r.check, notes: r.notes }, null, 1)); process.exit(0); }
    if (r.fonts) console.log(`site fonts: headings ${r.fonts.display || 'generic'} · body ${r.fonts.body || 'generic'} (scaffold --brand puts them first in the theme's font stacks; the theme's fonts stay as fallback)`);
    console.log(`paper ${hex(P.paper)} (${P.light ? 'light' : 'dark'}) · ink ${hex(P.ink)}`);
    console.log(`brand colours by flat area: ${P.brand.map((b) => `${hex(b.c)} ${(b.share * 100).toFixed(1)}%`).join(' · ') || 'none found'}`);
    console.log(`roles: field ${r.tokens['--field']} · accent ${r.tokens['--accent']} (text ${r.tokens['--accent-text']})`);
    console.log(`contrast: ${Object.entries(r.check).map(([k, v]) => `${k} ${v.toFixed(2)}:1`).join(' · ')}`);
    for (const n of r.notes) console.log(`note: ${n}`);
    console.log(`\npick a ${P.light ? 'light' : 'dark'}-paper theme (theme.mjs list; the deal shows paper), then: theme.mjs scaffold <slug> --brand ${files[0]} ...\n`);
    console.log(r.css);
  } catch (e) { console.error(`brand: ${e.message}`); process.exit(1); }
}
