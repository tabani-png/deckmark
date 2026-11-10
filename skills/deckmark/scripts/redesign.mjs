#!/usr/bin/env node
// Deckmark redesign: take an existing deck (PDF, PPTX or HTML), record what it says, and check that a
// rebuilt deck kept every figure. The record plays the part of Hallmark's before.json (MIT, Copyright (c)
// 2026 Hallmark contributors): what the page had, so the sweep can fail anything that went missing.
//
//   node redesign.mjs extract <deck.pdf|deck.pptx|deck.html> [--out .deckmark/redesign] [--no-images]
//       writes record.json (every page: title, text, words, figures), facts.draft.json (one candidate
//       fact per figure, with its page as the source), STORYBOARD.draft.md (one ghost line per source
//       page) and before/page-NN.png (PDF and HTML; PPTX has no renderer here).
//   node redesign.mjs kept <record.json> <new deck.html> [--facts facts.json] [--dropped dropped.json] [--json]
//       every figure in the record must print in the new deck (or in facts.json), or sit in dropped.json
//       with a reason: [{ "figure": "14.2", "page": 17, "reason": "duplicate of p16 total" }]. Exit 1 on a loss.
//   node redesign.mjs audit <deck.pdf|deck.pptx|deck.html> [--cap 80] [--json]
//       report only: words, figures, source line and title length per page. An HTML deck of
//       section.slide pages goes through decklint --render instead. Writes nothing.
//   node redesign.mjs compare <before dir> <after dir> [--out compare.html]
//       before and after page PNGs side by side in one HTML file.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, mkdtempSync, rmSync, realpathSync } from 'node:fs';
import { resolve, join, basename, extname, dirname, relative } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------- figures ----------
// A figure is a number with its sign, currency and unit; years, small counts and page numbers are not.
const NUM = /(?<![A-Za-z\d.#/-])([-+−(]?)([$€£]?)(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)(\)?)(\s?(?:%|x|X|bn|BN|B|MM|M|mm|m|K|k|pp|bps)\b|%)?(\+?)/g;
const MONTH = /^\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
export function figuresIn(text, { page = null } = {}) {
  const out = [];
  for (const m of String(text).matchAll(NUM)) {
    const [, sign, cur, digits, close, unitRaw = '', plus] = m;
    const unit = unitRaw.trim();
    const v = Number(digits.replace(/,/g, ''));
    if (!Number.isFinite(v)) continue;
    const bare = !cur && !unit && !/[.,]/.test(digits);
    if (bare && ((v >= 1900 && v <= 2100) || v <= 12 || v === page)) continue;
    if (bare && MONTH.test(text.slice(m.index + m[0].length))) continue;
    // A comma-less 4+ digit run followed by a dash is a range like 2024-2037, already skipped as years.
    const neg = sign === '(' && close === ')' || sign === '-' || sign === '−';
    out.push({ text: m[0].trim(), display: digits, value: neg ? -v : v, prefix: cur, unit, plus: !!plus, at: m.index });
  }
  return out;
}
const words = (s) => String(s).split(/\s+/).filter((w) => /[A-Za-z]/.test(w) && !/^[-+−(]*[$€£]?\d/.test(w)).length;
const decode = (s) => String(s).replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;|&rsquo;|&#8217;/g, '’').replace(/&ndash;|&#8211;/g, '–').replace(/&mdash;|&#8212;/g, ', ').replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));

// ---------- zip (PPTX) ----------
export function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not a zip file (no end of central directory)');
  const count = buf.readUInt16LE(eocd + 10); let p = buf.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let k = 0; k < count; k++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const method = buf.readUInt16LE(p + 10), size = buf.readUInt32LE(p + 20), nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    const lnlen = buf.readUInt16LE(local + 26), lxlen = buf.readUInt16LE(local + 28), start = local + 30 + lnlen + lxlen;
    const data = buf.subarray(start, start + size);
    files.set(name, () => (method === 0 ? data : method === 8 ? inflateRawSync(data) : (() => { throw new Error(`${name}: zip method ${method} not supported`); })()));
    p += 46 + nlen + xlen + clen;
  }
  return files;
}

// ---------- readers: each returns [{ n, text, lines }] ----------
function fromPptx(file) {
  const zip = readZip(readFileSync(file));
  const slides = [...zip.keys()].map((k) => /^ppt\/slides\/slide(\d+)\.xml$/.exec(k)).filter(Boolean).map((m) => Number(m[1])).sort((a, b) => a - b);
  return slides.map((n, i) => {
    const xml = zip.get(`ppt/slides/slide${n}.xml`)().toString('utf8');
    const lines = xml.split(/<\/a:p>/).map((p) => decode([...p.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]).join(''))).map((s) => s.trim()).filter(Boolean);
    // Chart values live in ppt/charts/chartK.xml, linked from the slide's rels; they are figures too.
    const rels = zip.get(`ppt/slides/_rels/slide${n}.xml.rels`);
    const chartVals = [];
    if (rels) for (const m of rels().toString('utf8').matchAll(/Target="\.\.\/charts\/(chart\d+\.xml)"/g)) {
      const c = zip.get(`ppt/charts/${m[1]}`); if (!c) continue;
      const cx = c().toString('utf8');
      const vals = [...cx.matchAll(/<c:val>[\s\S]*?<\/c:val>/g)].flatMap((v) => [...v[0].matchAll(/<c:v>([^<]*)<\/c:v>/g)].map((x) => x[1]));
      if (vals.length) chartVals.push(`chart ${m[1]}: ${vals.join(' ')}`);
    }
    return { n: i + 1, lines: [...lines, ...chartVals], text: [...lines, ...chartVals].join('\n') };
  });
}
function fromPdf(file) {
  let txt;
  try { txt = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', file, '-'], { encoding: 'utf8', maxBuffer: 64 << 20 }); }
  catch (e) { throw new Error(`pdftotext failed (${e.code === 'ENOENT' ? 'install poppler: brew install poppler, apt install poppler-utils' : e.message})`); }
  const pages = txt.split('\f'); if (pages.length && !pages[pages.length - 1].trim()) pages.pop();
  return pages.map((t, i) => { const lines = t.split('\n').map((l) => l.replace(/\s{2,}/g, '  ').trim()).filter(Boolean); return { n: i + 1, lines, text: lines.join('\n') }; });
}
// Inline tags close up (so $<span>9</span>B reads $9B); block ends become line breaks.
const htmlText = (h) => decode(h.replace(/<!--[\s\S]*?-->/g, '').replace(/<(style|script|title)[\s\S]*?<\/\1>/gi, '').replace(/<aside class="speaker-notes"[\s\S]*?<\/aside>/gi, '').replace(/<(br|\/p|\/h[1-6]|\/li|\/tr|\/div|\/figcaption|\/td|\/th|\/text|\/section)\b[^>]*>/gi, '\n').replace(/<[^>]+>/g, ''));
function fromHtml(file) {
  const html = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/<(style|script|title|aside class="speaker-notes")[\s\S]*?<\/(style|script|title|aside)>/gi, '');
  const starts = [...html.matchAll(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>/g)].map((m) => m.index);
  const chunks = starts.length ? starts.map((s, i) => html.slice(s, starts[i + 1] ?? html.length)) : [(/<body[\s\S]*<\/body>/i.exec(html) || [html])[0]];
  return chunks.map((c, i) => {
    const lines = htmlText(c).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    return { n: i + 1, lines, text: lines.join('\n') };
  });
}
export function readDeck(file) {
  const ext = extname(file).toLowerCase();
  if (ext === '.pptx') return { kind: 'pptx', pages: fromPptx(file) };
  if (ext === '.pdf') return { kind: 'pdf', pages: fromPdf(file) };
  if (ext === '.html' || ext === '.htm') return { kind: 'html', pages: fromHtml(file) };
  throw new Error(`${basename(file)}: redesign reads .pdf, .pptx or .html`);
}

// ---------- the record ----------
const SOURCE_LINE = /^\s*(sources?|note|notes)\s*:/i;
function guessArchetype(p) {
  const nums = p.figures.length, w = p.words;
  const rowsWithNums = p.lines.filter((l) => figuresIn(l, { page: p.n }).length >= 3).length;
  if (p.n === 1) return 'cover';
  if (/disclaimer|forward-looking|not an offer|confidentiality|safe harbo/i.test(p.text) && w > 120) return 'disclaimer';
  if (rowsWithNums >= 4) return 'financial-summary-table';
  if (/^chart /m.test(p.text)) return 'chart-takeaway';
  if (nums >= 3 && nums <= 6 && w <= 70) return 'col-row';
  if (nums <= 1 && w <= 25) return 'statement';
  if (w > 120) return 'chart-takeaway (cut the prose)';
  return 'chart-takeaway';
}
export function record(file, deck) {
  const src = basename(file);
  // Running heads, trackers and footers repeat on most pages: they are furniture, never a title.
  const seen = new Map(); for (const p of deck.pages) for (const l of new Set(p.lines)) seen.set(l, (seen.get(l) || 0) + 1);
  const furniture = (l) => deck.pages.length >= 4 && seen.get(l) >= Math.max(3, deck.pages.length * 0.4);
  const pages = deck.pages.map((p) => {
    const body = p.lines.filter((l) => !SOURCE_LINE.test(l) && !furniture(l));
    const figures = figuresIn(p.text, { page: p.n }).map(({ at, ...f }) => f);
    const title = (body.find((l) => words(l) >= 2) || body[0] || '').slice(0, 140);
    return { n: p.n, title, words: words(body.join(' ')), source_line: p.lines.some((l) => SOURCE_LINE.test(l)), figures, lines: p.lines, text: p.text };
  });
  for (const p of pages) p.archetype_guess = guessArchetype(p);
  return { source: src, path: resolve(file), kind: deck.kind, extracted: new Date().toISOString().slice(0, 10), pages };
}
export function draftFacts(rec) {
  const facts = {};
  for (const p of rec.pages) p.figures.forEach((f, k) => {
    const id = `p${String(p.n).padStart(2, '0')}_${String(k + 1).padStart(2, '0')}`;
    const line = (p.lines.find((l) => l.includes(f.text)) || '').slice(0, 120);
    facts[id] = { value: f.value, display: f.display, unit: `${f.prefix}${f.unit}${f.plus ? '+' : ''}`, source: `${rec.source} p${p.n}`, context: line, status: 'extracted' };
  });
  return { _schema: 'Draft facts from redesign.mjs extract. Every figure the source deck prints, one per entry. Confirm each against the source, rename the id, set unit and any formula, delete "context" and "status", then move it to deck/facts.json. A figure you leave out goes in dropped.json with a reason.', facts };
}
function draftStoryboard(rec) {
  const pad = (n) => String(n).padStart(2, '0');
  const lines = rec.pages.map((p) => `${pad(p.n)} · in progress · ${p.title.replace(/·/g, ',') || '(no text)'} · ${p.archetype_guess} · ${p.figures.slice(0, 6).map((f) => f.text).join(', ')}${p.figures.length > 6 ? `, +${p.figures.length - 6} more` : ''} · ${rec.source} p${p.n}`);
  return `# Storyboard draft: redesign of ${rec.source}\n\nOne line per SOURCE page, as found. Rewrite it before building: an action title per slide, merge thin pages that make one point, cut prose to an exhibit, keep every figure (redesign.mjs kept checks). Statuses become confirmed once each figure is in facts.json.\n\nGoverning thought: <one sentence the source deck proves>\n\n${lines.join('\n')}\n`;
}

function images(file, kind, outDir) {
  const dir = join(outDir, 'before'); mkdirSync(dir, { recursive: true });
  if (kind === 'pdf') {
    try { execFileSync('pdftoppm', ['-png', '-r', '50', file, join(dir, 'page')], { stdio: 'ignore' }); } catch { return 'pdftoppm not available; no before images'; }
    // pdftoppm names pages page-1.png or page-01.png by page count; normalise to page-NN.png.
    for (const f of readdirSync(dir)) { const m = /^page-0*(\d+)\.png$/.exec(f); if (m) { const to = `page-${m[1].padStart(2, '0')}.png`; if (to !== f) execFileSync('mv', [join(dir, f), join(dir, to)]); } }
    return `${readdirSync(dir).filter((f) => f.endsWith('.png')).length} page images`;
  }
  if (kind === 'html') {
    try { execFileSync(process.execPath, [join(HERE, 'render.mjs'), file, '--out', dir, '--pages', '1-999'], { stdio: 'ignore' }); return `${readdirSync(dir).filter((f) => f.endsWith('.png')).length} page images`; } catch { return 'render failed; no before images'; }
  }
  return 'PPTX: no renderer here; export the deck to PDF and run extract on the PDF for images and the brand';
}

// ---------- kept ----------
const normNum = (s) => String(s).replace(/,/g, '').replace(/^0+(?=\d)/, '');
export function kept(rec, html, facts = null, dropped = []) {
  const text = htmlText(html);
  const have = new Set(figuresIn(text).map((f) => normNum(f.display)));
  // A figure also counts as kept when a fact the deck prints holds it (rounded or reformatted display).
  if (facts) for (const f of Object.values(facts.facts || facts)) if (f && typeof f === 'object') { have.add(normNum(f.display ?? f.value)); if (Number.isFinite(Number(f.value))) have.add(normNum(String(Math.abs(Number(f.value))))); }
  const drop = new Map(); for (const d of dropped || []) if (d && d.figure != null && String(d.reason || '').split(/\s+/).length >= 2) drop.set(`${normNum(d.figure)}@${d.page ?? '*'}`, d.reason);
  const lost = [], droppedHit = [];
  for (const p of rec.pages) for (const f of p.figures) {
    const k = normNum(f.display);
    if (have.has(k)) continue;
    const why = drop.get(`${k}@${p.n}`) ?? drop.get(`${k}@*`);
    if (why) droppedHit.push({ page: p.n, figure: f.text, reason: why }); else lost.push({ page: p.n, figure: f.text, context: (p.lines.find((l) => l.includes(f.text)) || '').slice(0, 90) });
  }
  const total = rec.pages.reduce((a, p) => a + p.figures.length, 0);
  return { ok: !lost.length, total, kept: total - lost.length - droppedHit.length, dropped: droppedHit, lost };
}

// ---------- audit ----------
export function audit(rec, cap = 80) {
  const rows = rec.pages.map((p) => {
    const flags = [];
    if (p.n > 1 && p.words > cap) flags.push(`wordy: ${p.words} words (cap ${cap})`);
    if (p.n > 1 && p.figures.length && !p.source_line) flags.push('figures with no source line');
    const tw = words(p.title);
    if (p.n > 1 && tw && tw < 5) flags.push(`topic title? "${p.title.slice(0, 50)}" (${tw} words; an action title states the conclusion in 8 to 20)`);
    if (tw > 22) flags.push(`long title (${tw} words)`);
    if (p.figures.length >= 25) flags.push(`${p.figures.length} figures: a dense table, check it reads at 10px or splits`);
    return { page: p.n, words: p.words, figures: p.figures.length, source_line: p.source_line, title: p.title, flags };
  });
  const flagged = rows.filter((r) => r.flags.length);
  return { source: rec.source, kind: rec.kind, pages: rows.length, words_median: [...rows].map((r) => r.words).sort((a, b) => a - b)[Math.floor(rows.length / 2)] || 0, figures: rows.reduce((a, r) => a + r.figures, 0), flagged: flagged.length, rows };
}

// ---------- compare ----------
function compare(before, after, out) {
  const pngs = (d) => (existsSync(d) ? readdirSync(d).filter((f) => /^page-\d+\.png$/.test(f)).sort() : []);
  const b = pngs(before), a = pngs(after), n = Math.max(b.length, a.length);
  const rel = (d, f) => relative(dirname(resolve(out)), join(resolve(d), f));
  const rows = Array.from({ length: n }, (_, i) => `<tr><td>${b[i] ? `<img src="${rel(before, b[i])}" alt="before ${i + 1}">` : ''}</td><td>${a[i] ? `<img src="${rel(after, a[i])}" alt="after ${i + 1}">` : ''}</td></tr>`).join('\n');
  writeFileSync(out, `<!doctype html><html lang="en"><meta charset="utf-8"><title>Before and after</title><style>body{font:14px system-ui,sans-serif;margin:24px}table{border-collapse:collapse;width:100%}td{vertical-align:top;padding:8px;width:50%}img{width:100%;border:1px solid #ccc}th{text-align:left;padding:8px}</style><table><tr><th>Before (${b.length} pages)</th><th>After (${a.length} pages)</th></tr>\n${rows}\n</table></html>\n`);
  return { before: b.length, after: a.length, out: resolve(out) };
}

// ---------- CLI ----------
const IS_MAIN = (() => { try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (IS_MAIN) {
  const a = process.argv.slice(2), cmd = a[0];
  const opt = (k, d = null) => { const i = a.indexOf(k); return i >= 0 && a[i + 1] && !a[i + 1].startsWith('--') ? a[i + 1] : d; };
  const pos = a.slice(1).filter((x, i, arr) => !x.startsWith('--') && !['--out', '--facts', '--dropped', '--cap'].includes(arr[i - 1]));
  const json = a.includes('--json');
  const fail = (m, code = 2) => { console.error(m); process.exit(code); };
  try {
    if (cmd === 'extract') {
      const file = pos[0]; if (!file || !existsSync(file)) fail('usage: node redesign.mjs extract <deck.pdf|deck.pptx|deck.html> [--out .deckmark/redesign] [--no-images]');
      const out = resolve(opt('--out', '.deckmark/redesign'));
      const skill = realpathSync(join(HERE, '..'));
      let d = out; while (!existsSync(d) && dirname(d) !== d) d = dirname(d);
      if (realpathSync(d).startsWith(skill)) fail(`--out ${out} is inside the skill folder; run from your deck project's root`);
      mkdirSync(out, { recursive: true });
      const rec = record(file, readDeck(file));
      writeFileSync(join(out, 'record.json'), JSON.stringify(rec, null, 1) + '\n');
      const facts = draftFacts(rec);
      writeFileSync(join(out, 'facts.draft.json'), JSON.stringify(facts, null, 1) + '\n');
      writeFileSync(join(out, 'STORYBOARD.draft.md'), draftStoryboard(rec));
      if (!existsSync(join(out, 'dropped.json'))) writeFileSync(join(out, 'dropped.json'), '[]\n');
      const img = a.includes('--no-images') ? 'images skipped' : images(resolve(file), rec.kind, out);
      const nf = Object.keys(facts.facts).length;
      if (json) console.log(JSON.stringify({ out, pages: rec.pages.length, figures: nf, images: img }));
      else {
        console.log(`redesign extract · ${rec.source} (${rec.kind}) · ${rec.pages.length} pages · ${nf} figures`);
        console.log(`wrote ${join(out, 'record.json')} (what the deck says, page by page: the kept check reads it)`);
        console.log(`wrote ${join(out, 'facts.draft.json')} (${nf} candidate facts; confirm each, then move it to deck/facts.json)`);
        console.log(`wrote ${join(out, 'STORYBOARD.draft.md')} (one line per source page; rewrite as the new spine)`);
        console.log(`wrote ${join(out, 'dropped.json')} (every figure you leave out, with a reason)`);
        console.log(`before: ${img}`);
        if (rec.kind === 'pdf') console.log(`brand: node ${HERE}/brand.mjs ${resolve(file)} --pages 1-8  (keeps the client's paper and colours; scaffold --brand <the same file>)`);
        console.log(`after the build: node ${HERE}/redesign.mjs kept ${join(out, 'record.json')} <deck-dir>/deck.html --facts <deck-dir>/facts.json --dropped ${join(out, 'dropped.json')}`);
      }
    } else if (cmd === 'kept') {
      const [recFile, deck] = pos; if (!recFile || !deck) fail('usage: node redesign.mjs kept <record.json> <deck.html> [--facts facts.json] [--dropped dropped.json] [--json]');
      const rec = JSON.parse(readFileSync(recFile, 'utf8'));
      const factsFile = opt('--facts'), dropFile = opt('--dropped', join(dirname(recFile), 'dropped.json'));
      const r = kept(rec, readFileSync(deck, 'utf8'), factsFile ? JSON.parse(readFileSync(factsFile, 'utf8')) : null, existsSync(dropFile) ? JSON.parse(readFileSync(dropFile, 'utf8')) : []);
      if (json) console.log(JSON.stringify(r, null, 1));
      else {
        console.log(`redesign kept · ${rec.source} -> ${basename(deck)} · ${r.kept}/${r.total} figures kept · ${r.dropped.length} dropped on the record · ${r.lost.length} lost`);
        for (const d of r.dropped) console.log(`  dropped p${d.page} ${d.figure}: ${d.reason}`);
        for (const l of r.lost) console.log(`  FAIL kept  p${l.page} ${l.figure}  (${l.context})`);
        console.log(r.ok ? 'PASS' : 'FAIL: restore each lost figure, or add it to dropped.json with a reason');
      }
      process.exit(r.ok ? 0 : 1);
    } else if (cmd === 'audit') {
      const file = pos[0]; if (!file || !existsSync(file)) fail('usage: node redesign.mjs audit <deck.pdf|deck.pptx|deck.html> [--cap 80] [--json]');
      if (/\.html?$/i.test(file) && /<section\b[^>]*class="[^"]*\bslide\b/.test(readFileSync(file, 'utf8'))) {
        console.log('an HTML deck of section.slide pages: auditing with decklint --render (report only)');
        try { execFileSync(process.execPath, [join(HERE, 'decklint.mjs'), file, '--render', ...(json ? ['--json'] : [])], { stdio: 'inherit' }); } catch { /* decklint exits 1 on FAIL; the report is the output */ }
        process.exit(0);
      }
      const r = audit(record(file, readDeck(file)), Number(opt('--cap', 80)));
      if (json) console.log(JSON.stringify(r, null, 1));
      else {
        console.log(`audit ${r.source} (${r.kind}) · ${r.pages} pages · median ${r.words_median} words a page · ${r.figures} figures · ${r.flagged} pages flagged`);
        for (const row of r.rows) if (row.flags.length) console.log(`  p${row.page}  ${row.flags.join(' · ')}`);
        console.log('report only: nothing was changed. The structural read (story, titles, exhibits) is the judged half: read gates.md § 5 against the page images.');
      }
    } else if (cmd === 'compare') {
      const [b, af] = pos; if (!b || !af) fail('usage: node redesign.mjs compare <before dir> <after dir> [--out compare.html]');
      const r = compare(b, af, opt('--out', join(dirname(resolve(b)), 'compare.html')));
      console.log(`wrote ${r.out} (before ${r.before} pages, after ${r.after})`);
    } else fail('usage: node redesign.mjs <extract|kept|audit|compare> ... (see the header of this file)');
  } catch (e) { fail(`redesign ${cmd}: ${e.message}`, 1); }
}
