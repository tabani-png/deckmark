#!/usr/bin/env node
// Deckmark decklint: a static tier (the file's text and CSS) and a render tier (real Chromium layout).
// usage: node decklint.mjs deck.html [--render] [--facts facts.json] [--json] [--strict]
//   --facts implies --render. Exit 1 on any FAIL (and on unwaived REFLEX with --strict).
// FAIL rules are fixed, never waived. REFLEX rules can be waived on the record with a comment:
//   /* waive: <rule> <reason> */  in a <style> block (whole deck) or  <!-- waive: <rule> <reason> -->
//   inside a slide's <section> (that slide only).
// Tiering and waivers mirror Hallmark's sloplint (MIT, Copyright (c) 2026 Hallmark contributors).
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RULES = {
  'literal-colour': ['FAIL', 'a literal colour outside the token block; use a token'],
  'literal-font': ['FAIL', 'a literal font-family outside the token block; use --font-display / --font-body / --font-figures'],
  overflow: ['FAIL', 'text runs outside its box or the page'],
  overlap: ['FAIL', 'two text boxes overlap'],
  'min-font': ['FAIL', 'text below the minimum size in gates.md § 1 (16:9: body 14px, table cells and chart/exhibit labels 10px, source/footnote/furniture 9px; A4: body 11px, table and labels 8pt, furniture 7pt)'],
  source: ['FAIL', 'a slide with an exhibit (svg, table, chart) and no .source line'],
  'title-length': ['FAIL', 'action title over 2 lines, or outside 8 to 20 words'],
  totals: ['FAIL', 'a [data-total] row does not equal the sum of its [data-part] rows within half the last shown digit'],
  'sources-uses': ['FAIL', 'a [data-sources] table total does not equal its [data-uses] table total, or one is missing'],
  formula: ['FAIL', 'a facts.json entry with a "formula" does not recompute to its value within rounding'],
  tieout: ['FAIL', 'a [data-fact] figure does not match facts.json'],
  untraced: ['FAIL', 'a printed number with no data-src / data-fact and not in facts.json'],
  contrast: ['FAIL', 'body text contrast under 4.5:1 (3:1 for large text)'],
  'accent-colours': ['REFLEX', 'more than two accent hues on one slide (tints and greys of a hue count once; gates R1)'],
  'empty-slide': ['REFLEX', 'the ink below the title (text glyphs, chart marks, filled shapes; never empty containers or rules) covers under 60% of the body area, or ends above 70% of the body height (waivable on cover, divider and quote slides only)'],
  'dead-band': ['REFLEX', 'a full-width empty band over 25% of the body height between two blocks of content (a KPI or column row floating mid-slide above a takeaway bar); give the height to the exhibit or merge the slide'],
  'stretched-rows': ['REFLEX', 'table rows stretched far past their text (a short table pulled to fill the body); keep rows at their natural height (about 40px at most at 16:9) and pair the short table with a chart or a takeaway sidebar'],
  'stat-only': ['REFLEX', 'big-number tiles with no exhibit or takeaway on the slide to explain them (allowed only on the exec summary: data-archetype exec-summary or data-exec)'],
  'numbered-cards': ['REFLEX', 'three or more boxes labelled "Claim 1", "Point 2", "Highlight 3": a template, not an argument; label each box with what it says (gates R7)'],
  'gap-sprawl': ['REFLEX', 'over 30% of a slide\'s table cells are gaps (n/a, DATA NEEDED), or more than 3 slides carry gap cells; gaps live on one open-items page plus a one-line marker where the number would go'],
  wordy: ['REFLEX', 'a content slide carries more body words than its storyline\'s cap (the **Words.** line; body = visible words below the title, not tracker, source, footnote, page number, speaker notes or numbers), or, in a lean deck, a takeaway sidebar with over 3 bullets or a bullet over 15 words. Show it, do not say it: one exhibit carries the slide, the takeaway is one line, detail goes to the appendix or the speaker notes'],
  'prose-table': ['REFLEX', 'in a lean deck (storyline marked "no prose tables"), a table or .summary-rows whose text cells average over 12 words or hold one over 20: a label | paragraph table is a memo set in a grid. Make it a diagram, a 3-4 tile row (one number, a label of 8 words or fewer), or cut it'],
  bullets: ['REFLEX', 'more than 6 bullets on one slide'],
  'centred-text': ['REFLEX', 'centred body text'],
  'no-exhibit': ['REFLEX', 'three content slides in a row with no exhibit'],
  'archetype-repeat': ['REFLEX', 'the same archetype twice in a row'],
  emoji: ['REFLEX', 'emoji in the deck'],
  gradient: ['REFLEX', 'a purple-to-blue gradient'],
  'chart-shadow': ['REFLEX', 'a drop shadow on a chart or table'],
};

const COLOUR_FN = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const NAMED = /\b(white|black|red|green|blue|gray|grey|navy|orange|yellow|purple|silver|teal|maroon|olive|lime|aqua|fuchsia|pink|gold|beige|brown|crimson|indigo|violet|tomato|coral|salmon|khaki|ivory|lavender|turquoise|cyan|magenta|darkblue|lightgray|lightgrey|darkgray|darkgrey|whitesmoke|gainsboro)\b/i;
const COLOUR_PROPS = /^(color|background(-color)?|border(-(top|right|bottom|left|block|inline))?(-color)?|outline(-color)?|fill|stroke|stop-color|flood-color|box-shadow|text-shadow|text-decoration(-color)?|column-rule(-color)?|caret-color|accent-color|filter|background-image|border-image|list-style|scrollbar-color)$/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}\u{FE0F}]/u;
const TOKEN_SEL = /^\s*(:root|html|body)(\[[^\]]*\])?\s*$/;

const lineOf = (src, i) => src.slice(0, i).split('\n').length;
const blankComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
// ---------- text budget: the storyline's **Words.** line ----------
// "**Words.** 16:9 target 40-60, cap 80 · A4 cap 300 · no prose tables."
export const WORDS_DEFAULT = { 'slides-16x9': 90, 'report-a4': 350 };
const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function parseWords(md, format = 'slides-16x9') {
  const line = (/^\*\*Words\.\*\*([^\n]*)/m.exec(md || '') || [])[1];
  if (!line) return null;
  const a4 = format === 'report-a4';
  const m16 = /16:9 target (\d+)\s*-\s*(\d+),\s*cap (\d+)/.exec(line), mA4 = /A4 cap (\d+)/.exec(line);
  const cap = a4 ? (mA4 && Number(mA4[1])) : (m16 && Number(m16[3]));
  if (!cap) return null;
  return { cap, target: !a4 && m16 ? `${m16[1]}-${m16[2]}` : null, lean: /no prose tables/.test(line) };
}
export function storylineWords(slug, format) {
  if (!/^[a-z0-9-]+$/.test(slug || '')) return null;
  const f = join(SKILL_DIR, 'references', 'storylines', `${slug}.md`);
  return existsSync(f) ? parseWords(readFileSync(f, 'utf8'), format) : null;
}
// The budget a deck lints against: <body data-words-cap data-lean> (written by scaffold), else the
// storyline named in the Deckmark stamp, else the default for the format.
export function deckBudget(html) {
  const body = (/<body\b[^>]*>/i.exec(html) || [''])[0];
  const format = (/data-format=["']([^"']+)/.exec(body) || [])[1] || 'slides-16x9';
  const cap = (/data-words-cap=["'](\d+)/.exec(body) || [])[1];
  const story = (/storyline:\s*([a-z0-9-]+)/.exec((/<!--\s*Deckmark[\s\S]*?-->/.exec(html) || [''])[0]) || [])[1];
  const fromStory = storylineWords(story, format);
  if (cap) return { cap: Number(cap), lean: /\sdata-lean\b/.test(body) || !!(fromStory && fromStory.lean), from: 'body data-words-cap', format };
  if (fromStory) return { ...fromStory, from: `storyline ${story}`, format };
  return { cap: WORDS_DEFAULT[format] || 90, lean: /\sdata-lean\b/.test(body), from: 'default', format };
}

const decls = (body) => body.split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((d) => /^\s*([-a-zA-Z]+)\s*:\s*([\s\S]*?)\s*$/.exec(d)).filter(Boolean).map((m) => [m[1].toLowerCase(), m[2]]);
const hasColour = (prop, v) => COLOUR_FN.test(v) || (COLOUR_PROPS.test(prop) && NAMED.test(v.replace(/var\([^)]*\)/g, '')));
const badFont = (prop, v) => (prop === 'font-family' && !/^\s*(var\(|inherit|initial|unset)/.test(v)) || (prop === 'font' && /["']|\b(serif|sans-serif|monospace|arial|helvetica|georgia)\b/i.test(v.replace(/var\([^)]*\)/g, '')));

function checkCss(css, where, out, opts = {}) {
  const base = opts.line || 1;
  const src = blankComments(css);
  const re = /([^{}]*)\{([^{}]*)\}/g; let m;
  while ((m = re.exec(src))) {
    const sel = m[1].trim(), body = m[2], ds = decls(body);
    if (/^@font-face/i.test(sel)) continue;
    const tokenBlock = opts.tokensFile || (TOKEN_SEL.test(sel) && ds.every(([p]) => p.startsWith('--')));
    if (tokenBlock) continue;
    for (const [p, v] of ds) {
      const at = `${where}:${base - 1 + lineOf(src, m.index + m[0].indexOf(p))}`;
      if (hasColour(p, v)) out.push({ rule: 'literal-colour', at, msg: `${sel} { ${p}: ${v} }` });
      if (badFont(p, v)) out.push({ rule: 'literal-font', at, msg: `${sel} { ${p}: ${v} }` });
    }
  }
}

function waiversIn(html, slideSpans) {
  const found = [];
  const re = /(?:\/\*|<!--)\s*waive:\s*([a-z0-9-]+)\s+([\s\S]*?)\s*(?:\*\/|-->)/gi; let m;
  while ((m = re.exec(html))) {
    const inStyle = html.lastIndexOf('<style', m.index) > html.lastIndexOf('</style', m.index);
    const slide = inStyle ? null : slideSpans.findIndex(([a, b]) => m.index >= a && m.index < b);
    found.push({ rule: m[1].toLowerCase(), reason: m[2].trim(), slide: slide == null || slide < 0 ? null : slide + 1 });
  }
  return found;
}

// ---------- static tier ----------
export function staticTier(file) {
  const html = readFileSync(file, 'utf8'), dir = dirname(resolve(file)), out = [];
  const starts = [...html.matchAll(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"/g)].map((m) => m.index);
  const spans = starts.map((s, i) => [s, starts[i + 1] ?? html.length]);
  const slideAt = (i) => { const k = spans.findIndex(([a, b]) => i >= a && i < b); return k < 0 ? null : k + 1; };
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) checkCss(m[1], basename(file), out, { line: lineOf(html, m.index) });
  for (const m of html.matchAll(/<link\b[^>]*rel=["']?stylesheet[^>]*>/gi)) {
    const href = (/href=["']([^"']+)["']/.exec(m[0]) || [])[1];
    if (!href || /^(https?:)?\/\//.test(href)) continue;
    const p = join(dir, href.split('?')[0]);
    if (existsSync(p)) checkCss(readFileSync(p, 'utf8'), href, out, { tokensFile: basename(p) === 'tokens.css' });
  }
  for (const m of html.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const [p, v] of decls(m[1] ?? m[2] ?? '')) {
      const at = `${basename(file)}:${lineOf(html, m.index)}`, slide = slideAt(m.index);
      if (hasColour(p, v)) out.push({ rule: 'literal-colour', at, slide, msg: `style="${p}: ${v}"` });
      if (badFont(p, v)) out.push({ rule: 'literal-font', at, slide, msg: `style="${p}: ${v}"` });
    }
  }
  for (const m of html.matchAll(/\s(fill|stroke|stop-color|flood-color|color|bgcolor)\s*=\s*["']([^"']*)["']/gi)) {
    const v = m[2].trim();
    if (/^(none|currentcolor|transparent|inherit|url\()/i.test(v) || !v) continue;
    if (COLOUR_FN.test(v) || NAMED.test(v)) out.push({ rule: 'literal-colour', at: `${basename(file)}:${lineOf(html, m.index)}`, slide: slideAt(m.index), msg: `${m[1]}="${v}"` });
  }
  for (const m of html.matchAll(/\s(font-family|face)\s*=\s*["']([^"']*)["']/gi)) out.push({ rule: 'literal-font', at: `${basename(file)}:${lineOf(html, m.index)}`, slide: slideAt(m.index), msg: `${m[1]}="${m[2]}"` });
  const text = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/gi, (s) => s.replace(/[^\n]/g, ' ')).replace(/<[^>]+>/g, (s) => s.replace(/[^\n]/g, ' '));
  for (const m of text.matchAll(new RegExp(EMOJI.source, 'gu'))) out.push({ rule: 'emoji', at: `${basename(file)}:${lineOf(html, m.index)}`, slide: slideAt(m.index), msg: `"${m[0]}"` });
  if (!starts.length) out.push({ rule: 'overflow', at: basename(file), msg: 'no <section class="slide"> pages found' });
  return { findings: out, waivers: waiversIn(html, spans), slides: starts.length };
}

// ---------- render tier (runs inside the page) ----------
function domChecks({ facts, budget }) {
  const F = [];
  const add = (rule, slide, msg) => F.push({ rule, slide, msg });
  const slides = [...document.querySelectorAll('section.slide')];
  const a4 = document.body.dataset.format === 'report-a4';
  const PT = 96 / 72;
  // gates.md § 1, exactly: body / table cells and exhibit labels / furniture.
  const MIN = a4 ? { body: 11, table: 8 * PT, furn: 7 * PT } : { body: 14, table: 10, furn: 9 };
  const FURN = '.source, .footnote, .pageno, .confid, .tracker, .stamp, sup, .slide-foot';
  const LABEL = 'table, figcaption, .exhibit-head, .exhibit-no, .label, .kicker, .cover-kicker, .delta, .k, .tl-date, .takeaway h3, .hb-legend, .axis-x, .axis-y, .tomb-meta, caption, .unit-row, .gap, .divider-no, .sources-uses h4, .section-band, .bc-k, .cr-head, .br-k';
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const over = (top, under) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1); };
  const hsl = (c) => { const [r, g, b] = c.slice(0, 3).map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return [h, s, l]; };
  const chromatic = (c) => { if (!c || c[3] < 0.3) return false; const [, s, l] = hsl(c); return s > 0.25 && l > 0.12 && l < 0.92; };
  const visible = (el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0; };
  const bgOf = (el) => {
    const layers = []; let opacity = 1, unknown = false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = getComputedStyle(e); opacity *= Number(s.opacity);
      if (s.backgroundImage !== 'none' && !e.classList.contains('hb')) unknown = true;
      const c = rgba(s.backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    }
    let bg = [255, 255, 255, 1]; for (const l of layers.reverse()) bg = over(l, bg);
    return { bg, opacity, unknown };
  };
  const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const blockOf = (el) => { for (let e = el; e; e = e.parentElement) { const d = getComputedStyle(e).display; if (!/^inline/.test(d) || e.tagName === 'svg') return e; } return el; };
  const EXHIBIT = 'svg.dm-chart:not(.dm-harvey):not(.dm-spark), table, .chart, .exhibit, figure, .big-compare, .col-row, .ring-pair';
  const EXHIBITISH = `${EXHIBIT}, .bracket, .kpi-strip, .matrix-2x2, .timeline, .chevrons, .tombstones, .sources-uses, .callout.big, svg[viewBox]`;
  const norm = (s) => String(s).replace(/[\s   ]+/g, '').replace(/−/g, '-');
  const numOf = (s) => { const m = /[-(]?\d[\d,]*(?:\.\d+)?/.exec(String(s)); if (!m) return null; let v = Number(m[0].replace(/[(),]/g, '')); if (/^\(/.test(m[0])) v = -Math.abs(v); return v; };
  const factMap = facts ? Object.fromEntries(Object.entries(facts.facts || facts).map(([k, v]) => [k, typeof v === 'object' && v ? v : { display: String(v) }])) : null;
  const factNums = new Set(); if (factMap) for (const v of Object.values(factMap)) for (const t of String(v.display ?? v.value).matchAll(/\d[\d,]*(?:\.\d+)?/g)) factNums.add(Number(t[0].replace(/,/g, '')));
  const NUM = /(?<![A-Za-z\d.#-])[-+−]?\(?[$€£]?\d[\d,]*(?:\.\d+)?\)?(?:%|x|bn|m|k|M|B|K|pp|bps)?(?![A-Za-z\d])/g;
  const MONTH = /^\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
  const usedFacts = new Set();
  const DEAD_BAND = 0.25;   // an empty full-width band over a quarter of the body height between blocks
  let runNoExhibit = 0, prevArch = null;
  const gapSlides = [];

  slides.forEach((slide, si) => {
    const n = si + 1, sr = slide.getBoundingClientRect();
    const special = slide.matches('.cover, .divider, .statement');
    const boxes = [];
    const small = new Map(), lowc = new Map(), untraced = [];
    const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT, { acceptNode: (t) => (t.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const el = t.parentElement; if (!el || !visible(el) || el.closest('title, style, script')) continue;
      const svg = el.closest('svg');
      const cs = getComputedStyle(el);
      let rects;
      if (svg) { const r = el.getBoundingClientRect(); rects = r.width ? [r] : []; } else { const rg = document.createRange(); rg.selectNodeContents(t); rects = [...rg.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5); }
      if (!rects.length) continue;
      const label = `"${t.data.trim().slice(0, 48)}"`;
      // overflow: off the page, clipped by an overflow box, or spilling out of its own block
      for (const r of rects) {
        if (r.right > sr.right + 1 || r.bottom > sr.bottom + 1 || r.left < sr.left - 1 || r.top < sr.top - 1) { add('overflow', n, `${label} runs off the page`); break; }
      }
      const footEl = slide.querySelector(':scope > .slide-foot');
      if (footEl && !el.closest('.slide-foot')) { const fr = footEl.getBoundingClientRect(); if (rects.some((r) => r.bottom > fr.top + 2 && r.top < fr.bottom)) add('overflow', n, `${label} runs into the footer`); }
      const host = svg ? svg.parentElement : blockOf(el);
      const hr = host.getBoundingClientRect();
      if (rects.some((r) => r.right > hr.right + 2 || r.bottom > hr.bottom + 2 || r.left < hr.left - 2)) add('overflow', n, `${label} spills out of its <${host.tagName.toLowerCase()}${host.className && typeof host.className === 'string' ? '.' + host.className.trim().split(/\s+/)[0] : ''}> box`);
      for (let e = el.parentElement; e && e !== slide; e = e.parentElement) {
        const s = getComputedStyle(e); if (s.overflow === 'visible' && s.overflowX === 'visible' && s.overflowY === 'visible') continue;
        const er = e.getBoundingClientRect();
        if (rects.some((r) => r.bottom > er.bottom + 1 || r.right > er.right + 1)) add('overflow', n, `${label} is clipped by <${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}>`);
        break;
      }
      for (const r of rects) boxes.push({ el, r });
      // size
      const scale = svg && svg.getScreenCTM() ? svg.getScreenCTM().a : 1;
      const fs = parseFloat(cs.fontSize) * scale;
      const furn = !!el.closest(FURN);
      const lab = !furn && (!!svg || !!el.closest(LABEL));
      const min = furn ? MIN.furn : lab ? MIN.table : MIN.body;
      if (fs < min - 0.05 && !small.has(el)) small.set(el, `${label} at ${fs.toFixed(1)}px (min ${min.toFixed(1)}px, ${furn ? 'furniture' : svg ? 'chart label' : lab ? 'table cell or exhibit label' : 'body text'})`);
      // contrast (body text only)
      if (!svg && !furn) {
        const { bg, opacity, unknown } = bgOf(el);
        if (!unknown) {
          const fg = rgba(cs.color); const eff = over([fg[0], fg[1], fg[2], fg[3] * opacity], bg);
          const large = fs >= 24 || (fs >= 18.66 && Number(cs.fontWeight) >= 700);
          const r = ratio(eff, bg);
          if (r < (large ? 3 : 4.5) && !lowc.has(el)) lowc.set(el, `${label} ${r.toFixed(2)}:1`);
        }
      }
      // numbers
      if (factMap && !furn && !el.closest('[data-fact], [data-src], [data-ref], .exhibit-no, .divider-no')) {
        for (const m of t.data.matchAll(NUM)) {
          const tok = m[0], v = numOf(tok), bare = /^\d+$/.test(tok);
          if (v == null || (bare && ((v >= 1900 && v <= 2100) || v <= 12))) continue;
          if (bare && MONTH.test(t.data.slice(m.index + tok.length))) continue;
          if (!factNums.has(Math.abs(v))) untraced.push(tok);
        }
      }
    }
    for (const msg of small.values()) add('min-font', n, msg);
    for (const msg of lowc.values()) add('contrast', n, msg);
    if (untraced.length) add('untraced', n, `${untraced.length} number(s) with no data-src / data-fact and not in facts.json: ${[...new Set(untraced)].slice(0, 6).join(', ')}`);
    // overlap
    const seen = new Set();
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j]; if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const ov = inter(a.r, b.r), minA = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ov > 4 && ov > minA * 0.08 && oy > Math.min(a.r.height, b.r.height) * 0.3) {
        const key = `${a.el.textContent.slice(0, 20)}|${b.el.textContent.slice(0, 20)}`; if (seen.has(key)) continue; seen.add(key);
        add('overlap', n, `"${a.el.textContent.trim().slice(0, 30)}" overlaps "${b.el.textContent.trim().slice(0, 30)}"`);
      }
    }
    // exhibits need a source line
    const exhibits = [...slide.querySelectorAll(EXHIBIT)].filter((e) => e.getBoundingClientRect().width >= 60 && !e.closest('.slide-foot'));
    const src = [...slide.querySelectorAll('.source')].some((s) => s.textContent.replace(/^\s*sources?:?\s*/i, '').trim().length > 3);
    if (exhibits.length && !src && !special) add('source', n, `${exhibits.length} exhibit(s) (${[...new Set(exhibits.map((e) => e.tagName.toLowerCase()))].join(', ')}) and no .source line`);
    // action title
    for (const tEl of slide.querySelectorAll('.action-title')) {
      const words = tEl.textContent.trim().split(/\s+/).filter(Boolean).length;
      const rg = document.createRange(); rg.selectNodeContents(tEl);
      const lines = new Set([...rg.getClientRects()].filter((r) => r.width > 1).map((r) => Math.round(r.bottom / 4))).size;
      if (words > 20) add('title-length', n, `${words} words (max 20)`);
      if (words < 8) add('title-length', n, `${words} words (min 8: a title states the conclusion, not the topic)`);
      if (lines > 2) add('title-length', n, `${lines} lines (max 2)`);
    }
    // tie-out
    if (factMap) for (const e of slide.querySelectorAll('[data-fact]')) {
      const k = e.dataset.fact, f = factMap[k]; usedFacts.add(k);
      if (!f) { add('tieout', n, `data-fact="${k}" is not in facts.json`); continue; }
      const shown = norm(e.textContent);
      const want = f.display != null ? norm(f.display) : null;
      const ok = want != null ? shown === want : numOf(shown) === Number(f.value);
      if (!ok) add('tieout', n, `${k}: printed "${e.textContent.trim()}", facts.json says "${f.display ?? f.value}"`);
    }
    // totals: [data-total] rows equal the sum of [data-part] rows in the same table (and same group name)
    const decimals = (txt) => { const m = /\d[\d,]*(?:\.(\d+))?/.exec(String(txt)); return m && m[1] ? m[1].length : 0; };
    const cellsOf = (tr) => { const out = []; let c = 0; for (const td of tr.cells) { out[c] = td; c += td.colSpan || 1; } return out; };
    const numCell = (td) => (!td || td.hasAttribute('data-nosum') ? null : numOf(td.textContent.replace(/[−–]/g, '-')));
    for (const table of slide.querySelectorAll('table')) {
      const totals = [...table.querySelectorAll('tr[data-total]')];
      for (const tot of totals) {
        const grp = tot.getAttribute('data-total') || '';
        const parts = [...table.querySelectorAll('tr[data-part]')].filter((r) => (r.getAttribute('data-part') || '') === grp);
        if (!parts.length) { add('totals', n, `a data-total${grp ? `="${grp}"` : ''} row has no data-part${grp ? `="${grp}"` : ''} rows in its table`); continue; }
        const tc = cellsOf(tot);
        tc.forEach((td, ci) => {
          const want = numCell(td); if (want == null || ci === 0) return;
          const vals = parts.map((r) => numCell(cellsOf(r)[ci])).filter((v) => v != null);
          if (!vals.length) return;
          const sum = vals.reduce((a, b) => a + b, 0), tol = 0.5 * 10 ** -decimals(td.textContent) + 1e-9;
          if (Math.abs(sum - want) > tol) add('totals', n, `"${(tot.cells[0] || td).textContent.trim().slice(0, 30)}" column ${ci + 1} prints ${td.textContent.trim()}, its ${vals.length} part(s) sum to ${+sum.toFixed(6)}`);
        });
      }
    }
    // sources = uses: table[data-sources] and table[data-uses] on the slide, paired by attribute value
    const suTotal = (t) => {
      const tot = t.querySelector('tr[data-total]');
      const first = (tr) => { const c = cellsOf(tr); for (let i = 1; i < c.length; i++) { const v = numCell(c[i]); if (v != null) return [v, c[i].textContent]; } return null; };
      if (tot) return first(tot);
      const rows = [...t.querySelectorAll('tr[data-part]')].length ? [...t.querySelectorAll('tr[data-part]')] : [...t.querySelectorAll('tbody tr')];
      const vs = rows.map(first).filter(Boolean); if (!vs.length) return null;
      return [vs.reduce((a, [v]) => a + v, 0), vs.map(([, x]) => x).sort((a, b) => decimals(b) - decimals(a))[0]];
    };
    const su = {};
    for (const t of slide.querySelectorAll('table[data-sources], table[data-uses]')) {
      const side = t.hasAttribute('data-sources') ? 'sources' : 'uses', key = t.getAttribute(`data-${side}`) || '';
      (su[key] ||= {})[side] = t;
    }
    for (const [key, p] of Object.entries(su)) {
      if (!p.sources || !p.uses) { add('sources-uses', n, `a data-${p.sources ? 'sources' : 'uses'}${key ? `="${key}"` : ''} table has no matching data-${p.sources ? 'uses' : 'sources'} table on this slide`); continue; }
      const a = suTotal(p.sources), b = suTotal(p.uses);
      if (!a || !b) { add('sources-uses', n, 'a sources or uses table has no numeric total'); continue; }
      const tol = 0.5 * 10 ** -Math.min(decimals(a[1]), decimals(b[1])) + 1e-9;
      if (Math.abs(a[0] - b[0]) > tol) add('sources-uses', n, `sources total ${+a[0].toFixed(6)} vs uses total ${+b[0].toFixed(6)}`);
    }
    // gap cells: n/a, DATA NEEDED, source needed, or a .gap marker inside a table cell
    const GAP = /\bn\/a\b|data needed|source needed|not (?:yet )?(?:provided|available)/i;
    const openItems = slide.matches('.open-items, [data-archetype="open-items"]') || !!slide.querySelector('.open-items');
    const tds = [...slide.querySelectorAll('td')].filter((td) => td.textContent.trim() || td.querySelector('.gap'));
    const gaps = tds.filter((td) => GAP.test(td.textContent) || td.querySelector('.gap'));
    if (!openItems) {
      if (gaps.length) gapSlides.push(n);
      if (tds.length && gaps.length / tds.length > 0.3) add('gap-sprawl', n, `${gaps.length} of ${tds.length} table cells are gaps; move the gaps to the open-items page and keep a one-line marker here`);
    }
    // empty slide: the union box of the INK below the title, inside the body area. Ink is text glyph boxes,
    // SVG marks and filled shapes (a background that differs from the slide). Container boxes, borders and
    // rules never count, so a stretched box or a tall rule cannot make a thin slide look full.
    if (!special) {
      const cs0 = getComputedStyle(slide), head = slide.querySelector(':scope > .slide-head'), foot = slide.querySelector(':scope > .slide-foot');
      const body = { left: sr.left + parseFloat(cs0.paddingLeft), right: sr.right - parseFloat(cs0.paddingRight), top: head ? head.getBoundingClientRect().bottom : sr.top + parseFloat(cs0.paddingTop), bottom: foot ? foot.getBoundingClientRect().top : sr.bottom - parseFloat(cs0.paddingBottom) };
      const bw = body.right - body.left, bh = body.bottom - body.top;
      const slideBg = rgba(cs0.backgroundColor).join(',');
      let u = null; const bands = [];
      const take = (r) => {
        const l = Math.max(r.left, body.left), rt = Math.min(r.right, body.right), t = Math.max(r.top, body.top), b = Math.min(r.bottom, body.bottom);
        if (rt - l < 1 || b - t < 1) return;
        bands.push([t, b]);
        u = u ? { left: Math.min(u.left, l), right: Math.max(u.right, rt), top: Math.min(u.top, t), bottom: Math.max(u.bottom, b) } : { left: l, right: rt, top: t, bottom: b };
      };
      const skip = (e) => e.closest('.slide-head, .slide-foot, .stamp');
      const inkExtent = (root) => {
        let top = Infinity, bot = -Infinity;
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (t) => (t.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
        for (let t = w.nextNode(); t; t = w.nextNode()) { const rg = document.createRange(); rg.selectNodeContents(t); for (const r of rg.getClientRects()) { if (r.height < 1) continue; top = Math.min(top, r.top); bot = Math.max(bot, r.bottom); } }
        for (const m of root.querySelectorAll('svg rect, svg path, svg line, svg polyline, svg circle, img')) { const r = m.getBoundingClientRect(); if (r.height < 1 && r.width < 1) continue; top = Math.min(top, r.top); bot = Math.max(bot, r.bottom); }
        return bot > top ? { top, bottom: bot } : null;
      };
      const tw = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT, { acceptNode: (t) => (t.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
      for (let t = tw.nextNode(); t; t = tw.nextNode()) {
        const el = t.parentElement; if (!el || skip(el) || !visible(el) || el.closest('svg')) continue;
        const rg = document.createRange(); rg.selectNodeContents(t); for (const r of rg.getClientRects()) take(r);
      }
      for (const e of slide.querySelectorAll('*')) {
        if (skip(e) || !visible(e)) continue;
        const s = getComputedStyle(e);
        if (e.closest('svg')) {
          if (/^(rect|path|line|polyline|polygon|circle|ellipse|text)$/.test(e.tagName) && (s.fill !== 'none' || s.stroke !== 'none')) take(e.getBoundingClientRect());
          continue;
        }
        const bg = rgba(s.backgroundColor);
        const filled = (bg[3] > 0.05 && bg.join(',') !== slideBg) || s.backgroundImage !== 'none' || e.tagName === 'IMG';
        if (!filled) continue;
        const er = e.getBoundingClientRect();
        // A filled panel that holds content counts only when its content spans most of it: a panel
        // stretched far below its text is a stretched container, and its text already counts.
        const ext = inkExtent(e);
        // A filled panel is still visible mass for the dead-band check, even when it is too stretched to count as ink.
        if (ext && er.height > 40 && (ext.bottom - ext.top) < 0.5 * er.height) { const t = Math.max(er.top, body.top), b = Math.min(er.bottom, body.bottom); if (b - t >= 1) bands.push([t, b]); continue; }
        take(er);
      }
      const arch = slide.dataset.archetype || '';
      const waivable = /^(quote|quote-callout|section-divider|divider|cover|statement)$/.test(arch) || slide.matches('.quote');
      if (bw > 0 && bh > 0) {
        const cover = u ? ((u.right - u.left) * (u.bottom - u.top)) / (bw * bh) : 0;
        const depth = u ? (u.bottom - body.top) / bh : 0;
        if (cover < 0.6 || depth < 0.7) F.push({ rule: 'empty-slide', slide: n, waivable, msg: `ink covers ${Math.round(cover * 100)}% of the body area and ends at ${Math.round(depth * 100)}% of its height (need 60% and 70%): scale the chart to the body, pair a short table or KPI row with a chart or the takeaway sidebar, or merge with the next thin slide on the same message` });
      }
      // dead band: a full-width strip with no ink between two blocks of content (a KPI or column row
      // floating mid-slide with empty space above or below it before the takeaway bar).
      if (bh > 0 && bands.length > 1) {
        bands.sort((a, b) => a[0] - b[0]);
        let reach = bands[0][1], worst = null;
        for (const [t, b] of bands.slice(1)) { if (t - reach > (worst ? worst.h : 0)) worst = { top: reach, h: t - reach }; reach = Math.max(reach, b); }
        if (worst && worst.h > DEAD_BAND * bh) add('dead-band', n, `an empty band ${Math.round(worst.h)}px tall (${Math.round(worst.h / bh * 100)}% of the body, max ${Math.round(DEAD_BAND * 100)}%) from ${Math.round(((worst.top - body.top) / bh) * 100)}% down the body: let the exhibit take the height (a chart under the row, .col-row.big, a .two-exhibits pair) or merge the slide; never pad it`);
      }
    }
    // stretched rows: a table row far taller than the text in it
    const slackMax = a4 ? 22 : 30;   // about 40-44px rows at 16:9 for one line of table text
    for (const table of slide.querySelectorAll('table')) {
      let bad = 0, worst = 0;
      for (const tr of table.querySelectorAll('tbody tr')) {
        const rh = tr.getBoundingClientRect().height; if (!rh) continue;
        let top = Infinity, bot = -Infinity;
        for (const td of tr.cells) { const rg = document.createRange(); rg.selectNodeContents(td); for (const r of rg.getClientRects()) { if (r.height < 1) continue; top = Math.min(top, r.top); bot = Math.max(bot, r.bottom); } }
        if (bot < top) continue;
        if (rh - (bot - top) > slackMax) { bad++; worst = Math.max(worst, rh); }
      }
      if (bad) add('stretched-rows', n, `${bad} row(s) stretched past their text (tallest ${Math.round(worst)}px); let the table keep its natural height and give the space to a chart or a takeaway sidebar`);
    }
    // stat-only: big-number tiles with nothing that explains them (the exec summary is exempt)
    if (!special) {
      const arch0 = slide.dataset.archetype || '';
      const exec = slide.hasAttribute('data-exec') || /exec|summary|recommendation/.test(arch0);
      const stats = [...slide.querySelectorAll('.kpi-strip, .callout.big, .callout-figure')].filter((e) => !e.closest('.slide-foot'));
      if (stats.length && !exec) {
        const SUPPORT = 'svg.dm-chart:not(.dm-harvey):not(.dm-spark), table, .takeaway, .takeaway-bar, .big-compare, .col-row, .ring-pair, .bracket, .summary-rows, .callout:not(.big), .matrix-2x2, .timeline, .chevrons, .tombstones, .sources-uses, .body-copy, .slide-body ul, .slide-body ol';
        const sup = [...slide.querySelectorAll(SUPPORT)].filter((e) => !stats.some((k) => k.contains(e)) && e.getBoundingClientRect().width >= 60);
        if (!sup.length) add('stat-only', n, `${slide.querySelectorAll('.kpi').length || stats.length} big number(s) and no chart, table or takeaway that explains them; add the exhibit the numbers come from or a takeaway sidebar, or fold them into the exec summary`);
      }
    }
    // numbered cards: "Claim 1", "Point 2", "Highlight 3" as box labels
    {
      const CARD = /^(claim|point|reason|pillar|lever|highlight|card|insight|takeaway|key point|feature|benefit|strength|argument|message)\s*(\d{1,2}|[ivx]{1,4})\s*[.:]?$/i;
      const hits = [...slide.querySelectorAll('.slide-body *')].filter((e) => !e.closest('td, th, svg, .tl-item, .chev, .chevrons, .exhibit-no') && e.children.length === 0 && CARD.test(e.textContent.trim()));
      if (hits.length >= 3) add('numbered-cards', n, `${hits.length} boxes labelled like "${hits[0].textContent.trim()}"; name each box by its point`);
    }
    // reflex: accent colours
    const hues = new Set();
    for (const e of slide.querySelectorAll('*')) {
      if (!visible(e)) continue; const s = getComputedStyle(e);
      const cs2 = [s.backgroundColor, e.closest('svg') ? s.fill : null, e.closest('svg') ? s.stroke : null, e.childNodes.length && [...e.childNodes].some((c) => c.nodeType === 3 && c.data.trim()) ? s.color : null, s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none' ? s.borderTopColor : null, s.borderLeftWidth !== '0px' && s.borderLeftStyle !== 'none' ? s.borderLeftColor : null];
      for (const c of cs2) { if (!c || c === 'none' || /url\(/.test(c)) continue; const v = rgba(c); if (chromatic(v)) hues.add(Math.round(hsl(v)[0])); }
      if (s.backgroundImage !== 'none' && /gradient/.test(s.backgroundImage)) {
        const stops = (s.backgroundImage.match(/(?:rgba?|oklch|oklab|lab|lch|color|hsla?)\([^()]*\)|#[0-9a-f]{3,8}/gi) || []).map(rgba).filter(chromatic).map((c) => hsl(c)[0]);
        if (stops.length >= 2 && stops.every((h) => h >= 190 && h <= 320) && Math.max(...stops) - Math.min(...stops) >= 25) add('gradient', n, `purple-blue gradient on <${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}>`);
      }
      if (e.matches('svg, table, figure, .exhibit, .chart') || e.closest('svg.dm-chart')) {
        if (s.boxShadow !== 'none' || /drop-shadow/.test(s.filter) || e.hasAttribute('filter')) add('chart-shadow', n, `shadow on <${e.tagName.toLowerCase()}>`);
      }
    }
    // R1: two hues plus their tints and greys. Hues within 30 degrees are one hue (a tint shifts hue a little).
    const hs = [...hues].sort((a, b) => a - b); let clusters = 0;
    for (let i = 0; i < hs.length; i++) if (i === 0 || hs[i] - hs[i - 1] > 30) clusters++;
    if (clusters > 1 && hs.length && 360 - hs[hs.length - 1] + hs[0] <= 30) clusters--;
    if (clusters > 2) add('accent-colours', n, `${clusters} distinct accent hues (max 2 plus tints and greys)`);
    // text budget: body words (letters, not numbers) below the title, outside furniture and speaker notes
    const arch1 = slide.dataset.archetype || '';
    const exempt = special || /^(cover|section-divider|divider|disclaimer|open-items|appendix.*)$/.test(arch1) || slide.hasAttribute('data-appendix') || slide.matches('.open-items');
    const SKIPW = '.slide-head, .slide-foot, .speaker-notes, .exhibit-no, .exhibit-unit, .unit-row, .hb-legend, .stamp, ' + FURN;
    const isNumTok = (w) => /^[-+−(]*[$€£]?\d[\d,.]*\)?(?:%|x|bn|mm|m|k|b|pp|bps|[ae])?[)%,.;:]*$/i.test(w) || /^(?:fy|cy|h[12]|q[1-4])?'?\d{2,4}[ae]?[,.;:]?$/i.test(w);
    const wordsIn = (txt) => String(txt).split(/[\s   ]+/).filter((w) => /[A-Za-z]/.test(w) && !isNumTok(w)).length;
    const textOf = (root) => { let n = 0; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (t) => (t.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) }); for (let t = w.nextNode(); t; t = w.nextNode()) { const el = t.parentElement; if (!el || el.closest(SKIPW) || !visible(el) || el.closest('title, style, script')) continue; n += wordsIn(t.data); } return n; };
    if (!exempt && budget) {
      const words = textOf(slide);
      if (words > budget.cap) add('wordy', n, `${words} body words (cap ${budget.cap}, ${budget.from}${budget.target ? `, target ${budget.target}` : ''}): show it, do not say it; one exhibit carries the slide, cut the takeaway to one line, move detail to the appendix or <aside class="speaker-notes">`);
      if (budget.lean) for (const tk of slide.querySelectorAll('.takeaway')) {
        const [maxB, maxW] = budget.cap > 100 ? [5, 25] : [3, 15];
        const bl = [...tk.querySelectorAll('li')].filter(visible), long = bl.map((li) => wordsIn(li.textContent)).filter((w) => w > maxW);
        if (bl.length > maxB || long.length) add('wordy', n, `takeaway sidebar: ${bl.length} bullet(s)${long.length ? `, ${long.length} over ${maxW} words (longest ${Math.max(...long)})` : ''}; max ${maxB} bullets of about ${maxW - 3} words at this cap, and only when the chart needs them`);
      }
    }
    // prose tables: text cells that are paragraphs (lean decks only)
    if (!exempt && budget && budget.lean) {
      const groups = [...slide.querySelectorAll('table')].filter((t) => !t.closest('.speaker-notes')).map((t) => ({ what: 'table', cells: [...t.querySelectorAll('tbody td, tbody th')] }));
      for (const sr of slide.querySelectorAll('.summary-rows')) groups.push({ what: '.summary-rows', cells: [...sr.querySelectorAll('.row > p, .row > div:not(:first-child)')] });
      for (const g of groups) {
        const counts = g.cells.filter(visible).map((c) => wordsIn(c.textContent)).filter((w) => w > 0);
        if (!counts.length) continue;
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length, max = Math.max(...counts);
        if (avg > 12 || max > 20) add('prose-table', n, `${g.what} text cells average ${avg.toFixed(1)} words, longest ${max} (lean deck: average 12, any cell 20): turn label | paragraph rows into a diagram or a 3-4 tile row (one number, label of 8 words or fewer), or cut them`);
      }
    }
    const lis = [...slide.querySelectorAll('li')].filter((li) => !li.closest('.divider-list, .tracker, .timeline, .chevrons'));
    if (lis.length > 6) add('bullets', n, `${lis.length} bullets`);
    for (const e of slide.querySelectorAll('p, li, h2, h3, h4, blockquote')) {
      if (e.closest('.cover, .divider, .kpi, svg, td, th, .tl-item, .chev, .tomb, figcaption, .matrix-2x2 .axis-x')) continue;
      if (getComputedStyle(e).textAlign === 'center' && e.textContent.trim().length >= 60) { add('centred-text', n, `"${e.textContent.trim().slice(0, 40)}"`); break; }
    }
    if (!special) {
      const hasEx = [...slide.querySelectorAll(EXHIBITISH)].some((e) => e.getBoundingClientRect().width >= 60);
      runNoExhibit = hasEx ? 0 : runNoExhibit + 1;
      if (runNoExhibit === 3) add('no-exhibit', n, 'this and the two content slides before it carry no exhibit');
      const arch = slide.dataset.archetype || null;
      if (!arch) add('note', n, 'no data-archetype on this slide; archetype rotation cannot see it');
      if (arch && arch === prevArch) add('archetype-repeat', n, `"${arch}" again`);
      prevArch = arch;
    }
  });
  if (gapSlides.length > 3) add('gap-sprawl', null, `${gapSlides.length} slides carry gap cells (slides ${gapSlides.join(', ')}); keep gaps on one open-items page and a one-line marker where the number would go`);
  const unused = factMap ? Object.keys(factMap).filter((k) => !usedFacts.has(k)) : [];
  if (unused.length) add('note', null, `${unused.length} fact(s) never printed with data-fact: ${unused.slice(0, 8).join(', ')}`);
  return F;
}

// ---------- derived facts: "formula": "a / b" over other fact ids, recomputed and compared ----------
// The formula's result is in the same unit as the fact's value (a CAGR printed as 5.6% is written
// "((rev_fy24 / rev_fy22) ^ (1 / 2) - 1) * 100"). Tolerance: half the last digit the fact displays.
export function checkFormulas(factsJson) {
  const out = [];
  const facts = (factsJson && (factsJson.facts || factsJson)) || {};
  const val = (k) => { const f = facts[k]; return f && typeof f === 'object' ? Number(f.value) : Number(f); };
  for (const [id, f] of Object.entries(facts)) {
    if (!f || typeof f !== 'object' || !f.formula) continue;
    const expr = String(f.formula);
    if (!/^[\w\s.+\-*/^()]+$/.test(expr)) { out.push({ rule: 'formula', slide: null, msg: `${id}: formula "${expr}" uses characters outside ids, numbers and + - * / ^ ( )` }); continue; }
    const ids = [...new Set(expr.match(/[A-Za-z_][\w]*/g) || [])];
    const missing = ids.filter((k) => !(k in facts) || !Number.isFinite(val(k)));
    if (missing.length) { out.push({ rule: 'formula', slide: null, msg: `${id}: formula names ${missing.join(', ')}, not a fact with a numeric value` }); continue; }
    let got;
    try {
      const js = expr.replace(/\^/g, '**').replace(/[A-Za-z_][\w]*/g, (k) => `(${val(k)})`);
      got = Function(`"use strict"; return (${js});`)();
    } catch (e) { out.push({ rule: 'formula', slide: null, msg: `${id}: formula "${expr}" does not evaluate (${e.message})` }); continue; }
    const want = Number(f.value);
    if (!Number.isFinite(got) || !Number.isFinite(want)) { out.push({ rule: 'formula', slide: null, msg: `${id}: formula gives ${got}, value is ${f.value}` }); continue; }
    const shown = f.display != null ? String(f.display) : String(f.value);
    const m = /\d[\d,]*(?:\.(\d+))?/.exec(shown); const dp = m && m[1] ? m[1].length : 0;
    const tol = 0.5 * 10 ** -dp + 1e-9;
    if (Math.abs(got - want) > tol) out.push({ rule: 'formula', slide: null, msg: `${id}: ${expr} = ${+got.toFixed(6)}, which rounds to ${got.toFixed(dp)}; facts.json says ${shown}` });
  }
  return out;
}

export async function renderTier(file, facts, budget = null) {
  const { chromium } = await import('playwright');
  const { openDeck } = await import('./render.mjs');
  const browser = await chromium.launch();
  try { const { page } = await openDeck(browser, file, 1); return await page.evaluate(domChecks, { facts, budget: budget || deckBudget(readFileSync(file, 'utf8')) }); } finally { await browser.close(); }
}

export async function lint(file, { render = false, facts = null, strict = false } = {}) {
  const st = staticTier(file);
  const factsJson = facts ? JSON.parse(readFileSync(facts, 'utf8')) : null;
  const budget = deckBudget(readFileSync(file, 'utf8'));
  const dom = render || facts ? await renderTier(file, factsJson, budget) : [];
  if (factsJson) dom.push(...checkFormulas(factsJson));
  const waived = (f) => (f.rule === 'empty-slide' && !f.waivable ? null : st.waivers.find((w) => w.rule === f.rule && w.reason.split(/\s+/).length >= 2 && (w.slide == null || w.slide === f.slide)));
  const findings = [...st.findings, ...dom].map((f) => {
    const tier = RULES[f.rule] ? RULES[f.rule][0] : 'NOTE';
    const w = tier === 'REFLEX' ? waived(f) : null;
    return { grade: w ? 'WAIVED' : tier, ...f, ...(w ? { reason: w.reason } : {}) };
  });
  for (const w of st.waivers) {
    if (!RULES[w.rule]) findings.push({ grade: 'NOTE', rule: 'waive', slide: w.slide, msg: `waiver names unknown rule "${w.rule}"` });
    else if (RULES[w.rule][0] === 'FAIL') findings.push({ grade: 'NOTE', rule: 'waive', slide: w.slide, msg: `waiver on ${w.rule} rejected: FAIL rules are fixed, not waived` });
    else if (w.rule === 'empty-slide' && !findings.some((f) => f.rule === 'empty-slide' && f.waivable && (w.slide == null || f.slide === w.slide))) findings.push({ grade: 'NOTE', rule: 'waive', slide: w.slide, msg: 'waiver on empty-slide ignored: only cover, divider and quote slides may waive it; fill the slide or merge it' });
    else if (w.reason.split(/\s+/).length < 2) findings.push({ grade: 'NOTE', rule: 'waive', slide: w.slide, msg: `waiver on ${w.rule} has no reason; ignored` });
  }
  const count = (g) => findings.filter((f) => f.grade === g).length;
  const summary = { file: resolve(file), budget: { cap: budget.cap, lean: budget.lean, from: budget.from }, slides: st.slides, tiers: render || facts ? ['static', 'render'] : ['static'], fail: count('FAIL'), reflex: count('REFLEX'), waived: count('WAIVED'), notes: count('NOTE') };
  const ok = !summary.fail && !(strict && summary.reflex);
  return { ok, summary, findings };
}

function report(r) {
  const s = r.summary, lines = [`decklint ${basename(s.file)} · ${s.slides} slides · tiers: ${s.tiers.join(' + ')} · words cap ${s.budget.cap}${s.budget.lean ? ', lean' : ''} (${s.budget.from})`];
  const order = { FAIL: 0, REFLEX: 1, WAIVED: 2, NOTE: 3 };
  const bySlide = new Map();
  for (const f of [...r.findings].sort((a, b) => (a.slide ?? 0) - (b.slide ?? 0) || order[a.grade] - order[b.grade])) { const k = f.slide ?? 0; if (!bySlide.has(k)) bySlide.set(k, []); bySlide.get(k).push(f); }
  for (const [k, fs] of bySlide) {
    lines.push(k ? `\nslide ${k}` : '\ndeck');
    for (const f of fs) lines.push(`  ${f.grade.padEnd(6)} ${f.rule.padEnd(16)} ${f.msg}${f.at ? `  (${f.at})` : ''}${f.reason ? `  [waived: ${f.reason}]` : ''}`);
  }
  if (!r.findings.length) lines.push('\nclean');
  if (s.tiers.length === 1) lines.push('\n(static tier only: add --render for overflow, overlap, size, contrast, source and title checks)');
  lines.push(`\n${r.ok ? 'PASS' : 'FAIL'} · ${s.fail} fail · ${s.reflex} reflex · ${s.waived} waived · ${s.notes} notes`);
  return lines.join('\n');
}

// Compare realpaths: called through the ~/.claude/skills/deckmark symlink, argv[1] is the link path.
const IS_MAIN = (() => { try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (IS_MAIN) {
  const a = process.argv.slice(2);
  const file = a.find((x, i) => !x.startsWith('--') && a[i - 1] !== '--facts');
  if (!file) { console.error('usage: node decklint.mjs deck.html [--render] [--facts facts.json] [--json] [--strict]'); process.exit(2); }
  const fi = a.indexOf('--facts');
  lint(file, { render: a.includes('--render'), facts: fi >= 0 ? a[fi + 1] : null, strict: a.includes('--strict') })
    .then((r) => { console.log(a.includes('--json') ? JSON.stringify(r, null, 1) : report(r)); process.exit(r.ok ? 0 : 1); })
    .catch((e) => { console.error(`decklint failed: ${e.stack || e.message}`); process.exit(2); });
}
