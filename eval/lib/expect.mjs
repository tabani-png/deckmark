import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Machine checks for a brief's `expect` block, run against the deck a cell built.
// Regex HTML reading on purpose: the decks are generated from a known component set, and the
// checks must run in CI without a browser. decklint does the layout-true checks.

export const GAP = '⟦GAP⟧';

const decode = (s) => s.replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&minus;|&#8722;/g, '-').replace(/&middot;/g, '·');

export function stripNonVisible(html) {
  return String(html || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(style|script|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<aside\b[^>]*class="[^"]*speaker-notes[^"]*"[\s\S]*?<\/aside>/gi, ' ');
}

// Visible text with every gap marker replaced by one GAP token, so "NRR GAP" can be found.
export function visibleText(html) {
  return decode(stripNonVisible(html)
    .replace(/<([a-z0-9]+)\b[^>]*class="[^"]*\bgap\b[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, ` ${GAP} `)
    .replace(/DATA NEEDED/g, ` ${GAP} DATA NEEDED`)
    .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function slidesOf(html) {
  const src = stripNonVisible(html);
  const out = [];
  const re = /<section\b([^>]*)class="([^"]*\bslide\b[^"]*)"([^>]*)>([\s\S]*?)(?=<section\b[^>]*class="[^"]*\bslide\b|<\/body>|$)/gi;
  let m;
  while ((m = re.exec(src))) {
    const attrs = `${m[1]} ${m[3]}`;
    out.push({ classes: m[2], archetype: (/data-archetype="([^"]+)"/.exec(attrs) || [])[1] || null, exec: /data-exec\b/.test(attrs), html: m[4] });
  }
  return out;
}

export const deckFormat = (html) => (/<body\b[^>]*data-format="([^"]+)"/i.exec(html || '') || [])[1] || 'slides-16x9';

const NON_CONTENT = new Set(['cover', 'section-divider', 'disclaimer', 'open-items', 'appendix', 'statement', 'quote', 'close']);
const isNum = (w) => /^[-+(]?[$€£]?\d[\d,.]*[%x)MBKmbk]*[.,;:)]*$/.test(w);

// Body words per content slide, as decklint's `wordy` counts them (approximately): below the title,
// without tracker, kicker, source, footnote, page furniture or numbers.
export function wordsPerSlide(html) {
  return slidesOf(html).map((s, i) => {
    const body = s.html
      .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<(h1|h2)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<([a-z0-9]+)\b[^>]*class="[^"]*\b(tracker|kicker|source|footnote|confid|pageno|notes)\b[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, ' ');
    const words = decode(body.replace(/<[^>]+>/g, ' ')).split(/\s+/).filter((w) => /[A-Za-z]/.test(w) && !isNum(w)).length;
    const content = !(s.archetype && NON_CONTENT.has(s.archetype)) && !/\b(cover|divider|statement)\b/.test(s.classes);
    return { slide: i + 1, archetype: s.archetype, content, words };
  });
}

export function wordStats(html) {
  const rows = wordsPerSlide(html).filter((r) => r.content);
  if (!rows.length) return { contentSlides: 0, mean: null, max: null };
  const total = rows.reduce((a, r) => a + r.words, 0);
  return { contentSlides: rows.length, mean: +(total / rows.length).toFixed(1), max: Math.max(...rows.map((r) => r.words)) };
}

export function factEntries(facts) {
  const f = (facts && (facts.facts || facts)) || {};
  return Object.entries(f).filter(([k, v]) => !k.startsWith('_') && v && typeof v === 'object');
}

export function materialNumbers(text) {
  return [...String(text || '').matchAll(/-?\d[\d,]*(?:\.\d+)?/g)].map((m) => Number(m[0].replace(/,/g, ''))).filter(Number.isFinite);
}

// A non-derived fact traces to the material when its value equals, or rounds from, a number in it,
// at the same scale or a thousand either way ($48,300k printed as 48.3).
export function factTraces(fact, nums) {
  const v = Number(fact.value);
  if (!Number.isFinite(v)) return true;
  const shown = String(fact.display ?? fact.value);
  const dp = ((/\d[\d,]*\.(\d+)/.exec(shown) || [])[1] || '').length;
  const tol = 0.5 * 10 ** -dp + 1e-9;
  const av = Math.abs(v);
  return nums.some((n) => [1, 1000, 0.001].some((s) => Math.abs(Math.abs(n) * s - av) <= tol));
}

function cssToken(css, name) {
  const re = new RegExp(`${name.replace(/[-]/g, '\\-')}\\s*:\\s*([^;}]+)`, 'g');
  let m, last = null;
  while ((m = re.exec(css || ''))) last = m[1].trim();
  return last;
}
export function hexRgb(h) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})\b/i.exec(String(h || '').trim());
  if (!m) return null;
  const x = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16));
}
const dist = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };

function sourcesTables(html) {
  return [...stripNonVisible(html).matchAll(/<table\b[^>]*data-sources\b[^>]*>[\s\S]*?<\/table>/gi)].map((m) => visibleText(m[0]));
}

const has = (text, display) => new RegExp(`(^|[^\\d.])${String(display).replace('.', '\\.')}(?![\\d])`).test(text);

// ctx: { html, tokensCss, facts, materialText }
export const CHECKS = {
  format: (c, ctx) => { const f = deckFormat(ctx.html); return [f === c.value, `format ${f}`]; },
  storyline: (c, ctx) => { const s = ctx.stamp?.storyline || null; return [!!s && c.anyOf.includes(s), `storyline ${s ?? 'none (no stamp)'}`]; },
  slides: (c, ctx) => { const n = slidesOf(ctx.html).length; return [n >= (c.min ?? 1) && n <= (c.max ?? 1e9), `${n} slides`]; },
  stamp: (c, ctx) => { const raw = ctx.stamp?.raw || ''; const miss = c.includes.filter((s) => !raw.toLowerCase().includes(s.toLowerCase())); return [!!raw && !miss.length, raw ? (miss.length ? `stamp lacks ${miss.join(', ')}` : 'stamp ok') : 'no stamp']; },
  textIncludes: (c, ctx) => { const ok = new RegExp(c.pattern, 'i').test(visibleText(ctx.html)); return [ok, ok ? `found /${c.pattern}/` : `missing /${c.pattern}/`]; },
  textExcludes: (c, ctx) => { const m = new RegExp(c.pattern, 'i').exec(visibleText(ctx.html)); return [!m, m ? `found "${m[0]}"` : 'absent']; },
  openItems: (c, ctx) => {
    const s = slidesOf(ctx.html).find((x) => x.archetype === 'open-items' || /open items/i.test(visibleText(x.html).slice(0, 200)));
    if (!s) return [false, 'no open-items slide'];
    const t = visibleText(s.html);
    const miss = (c.mentions || []).filter((m) => !new RegExp(m, 'i').test(t));
    return [!miss.length, miss.length ? `open items do not mention ${miss.join(', ')}` : 'open-items slide present'];
  },
  gapNear: (c, ctx) => {
    const t = visibleText(ctx.html), w = c.window ?? 160, re = new RegExp(c.term, 'gi');
    let m, n = 0;
    while ((m = re.exec(t))) { n++; if (t.slice(Math.max(0, m.index - w), m.index + m[0].length + w).includes(GAP)) return [true, `gap marker beside "${m[0]}"`]; }
    return [false, n ? `"${c.term}" printed ${n}x, never beside a gap marker` : `"${c.term}" not printed`];
  },
  noFigureNear: (c, ctx) => {
    const t = visibleText(ctx.html), w = c.window ?? 60, re = new RegExp(c.term, 'gi'), fig = new RegExp(c.figure || '\\d+(?:\\.\\d+)?\\s?(?:%|x|months?\\b)', 'i');
    let m;
    while ((m = re.exec(t))) { const after = t.slice(m.index + m[0].length, m.index + m[0].length + w); const f = fig.exec(after.split(GAP)[0]); if (f) return [false, `"${m[0]}" followed by "${f[0]}"`]; }
    return [true, 'no figure printed against it'];
  },
  factsNoKey: (c, ctx) => {
    const re = new RegExp(c.pattern, 'i');
    const hit = factEntries(ctx.facts).filter(([k, v]) => (re.test(k) || re.test(String(v.label || ''))) && Number.isFinite(Number(v.value)) && !/gap|n\/a/i.test(String(v.display || '')));
    return [!hit.length, hit.length ? `facts carry ${hit.map(([k]) => k).join(', ')}` : 'no such fact'];
  },
  factDisplay: (c, ctx) => { const ok = factEntries(ctx.facts).some(([, v]) => String(v.display ?? v.value) === String(c.display)); return [ok, ok ? `fact ${c.display} present` : `no fact displays ${c.display}`]; },
  factsInMaterial: (c, ctx) => {
    const nums = materialNumbers(ctx.materialText);
    const base = factEntries(ctx.facts).filter(([, v]) => !v.formula);
    const miss = base.filter(([, v]) => !factTraces(v, nums)).map(([k, v]) => `${k}=${v.display ?? v.value}`);
    const allowed = c.maxUnmatched ?? 0;
    if (!base.length) return [false, 'no facts'];
    return [miss.length <= allowed, miss.length ? `${miss.length} of ${base.length} not in material: ${miss.slice(0, 8).join(', ')}` : `${base.length} facts trace to the material`];
  },
  sourcesNet: (c, ctx) => {
    const tabs = sourcesTables(ctx.html);
    if (!tabs.length) return [false, 'no data-sources table'];
    const t = tabs.join(' ');
    const oid = (Number(c.face) - Number(c.net)).toFixed(1);
    if (has(t, Number(c.net).toFixed(1))) return [true, `sources show net ${c.net}`];
    if (has(t, Number(c.face).toFixed(1)) && has(t, oid)) return [true, `sources show face ${c.face} less OID ${oid}`];
    return [false, `sources show neither net ${c.net} nor face less OID ${oid}`];
  },
  hasTotals: (c, ctx) => { const n = (stripNonVisible(ctx.html).match(/<tr\b[^>]*data-total\b/gi) || []).length; return [n >= (c.min ?? 1), `${n} data-total rows`]; },
  paper: (c, ctx) => { const rgb = hexRgb(cssToken(ctx.tokensCss, '--paper')); if (!rgb) return [false, 'no --paper token']; const band = lum(rgb) > 0.18 ? 'light' : 'dark'; return [band === c.band, `paper ${band}`]; },
  tokenNear: (c, ctx) => {
    const want = hexRgb(c.hex);
    const got = (c.tokens || [c.token]).map((t) => [t, cssToken(ctx.tokensCss, t)]).filter(([, v]) => hexRgb(v));
    const best = got.map(([t, v]) => [t, v, dist(hexRgb(v), want)]).sort((a, b) => a[2] - b[2])[0];
    if (!best) return [false, `no ${(c.tokens || [c.token]).join('/')} token`];
    return [best[2] <= (c.maxDist ?? 60), `${best[0]} ${best[1]} is ${best[2].toFixed(0)} from ${c.hex}`];
  },
  fileExists: (c, ctx) => { const ok = !!ctx.work && existsSync(join(ctx.work, c.path)); return [ok, `${c.path} ${ok ? 'written' : 'missing'}`]; },
  wordsMeanMax: (c, ctx) => { const s = wordStats(ctx.html); return [s.mean != null && s.mean <= c.max, `mean ${s.mean ?? 'n/a'} words a content slide`]; },
};

export function runExpect(checks, ctx) {
  if (!ctx.html) return (checks || []).map((c) => ({ id: c.id, type: c.type, pass: false, detail: 'no deck' }));
  return (checks || []).map((c) => {
    const fn = CHECKS[c.type];
    if (!fn) return { id: c.id, type: c.type, pass: false, detail: `unknown check type ${c.type}` };
    try { const [pass, detail] = fn(c, ctx); return { id: c.id, type: c.type, pass: !!pass, detail }; }
    catch (e) { return { id: c.id, type: c.type, pass: false, detail: `check error: ${e.message}` }; }
  });
}

// score.json from a decklint JSON result, the expect results and the word stats.
export function buildScore({ lint, expect, words, deck, stamp = null }) {
  const s = lint && !lint.unavailable ? lint.summary : null;
  const passed = expect.filter((e) => e.pass).length;
  return {
    deck: !!deck,
    stamp: !!stamp,
    lint: s ? { fail: s.fail, reflex: s.reflex, waived: s.waived, notes: s.notes, slides: s.slides, budget: s.budget } : { unavailable: true, reason: lint?.reason ?? 'no lint' },
    floorClean: s ? s.fail === 0 : false,
    strictClean: s ? s.fail === 0 && s.reflex === 0 : false,
    reflexCount: s ? s.reflex : null,
    failRules: lint?.findings ? [...new Set(lint.findings.filter((f) => f.grade === 'FAIL').map((f) => f.rule))] : [],
    reflexRules: lint?.findings ? [...new Set(lint.findings.filter((f) => f.grade === 'REFLEX').map((f) => f.rule))] : [],
    expect: { passed, total: expect.length, results: expect },
    words,
  };
}
