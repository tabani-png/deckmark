#!/usr/bin/env node
// Deckmark theme tool: index, list, deal, draw, scaffold, log, check.
// Design mirrors Hallmark's theme.mjs (MIT, Copyright (c) 2026 Hallmark contributors): frontmatter
// themes, a keyword-and-fit dealer seeded per prompt and rotated against a project log, and a draw
// that deals the structural choices a model converges on when left alone.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, renameSync, copyFileSync, realpathSync } from 'node:fs';
import { join, dirname, resolve, basename, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes } from 'node:crypto';
import { parseWords, WORDS_DEFAULT } from './decklint.mjs';
import { brandFromAny, isUrl, lum } from './brand.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = join(HERE, '..');
const args = process.argv.slice(2);
const cmd = args[0];
const flag = (k, d = null) => { const i = args.indexOf('--' + k); const v = i >= 0 ? args[i + 1] : undefined; return v !== undefined && !String(v).startsWith('--') ? v : d; };
const has = (k) => args.includes('--' + k);
const VALUED = new Set(['field', 'prompt', 'format', 'log', 'reroll', 'n', 'storyline', 'seed', 'out', 'entry', 'themes', 'dealt', 'draw', 'theme', 'slides', 'brand', 'pages']);
const positional = () => { const out = []; for (let i = 1; i < args.length; i++) { if (args[i].startsWith('--')) { if (VALUED.has(args[i].slice(2))) i++; continue; } out.push(args[i]); } return out; };
const THEMES = resolve(flag('themes', join(SKILL, 'references', 'themes')));
const STORYLINES = join(SKILL, 'references', 'storylines');
const INDEX = join(THEMES, 'index.json');
const LOG = () => resolve(flag('log', '.deckmark/log.json'));
const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
const SKILL_REAL = real(SKILL);
// Inside the skill folder? Then a log, salt or deck written here would land in the shared skill.
const inSkill = (p) => { let d = resolve(p); while (!existsSync(d) && dirname(d) !== d) d = dirname(d); const r = real(d); return r === SKILL_REAL || r.startsWith(SKILL_REAL + sep); };
// The path to print for the scripts: the canonical ~/.claude/skills/deckmark when that is this skill.
const CANON = join(homedir(), '.claude', 'skills', 'deckmark');
const SHOWN = existsSync(CANON) && real(CANON) === SKILL_REAL ? '~/.claude/skills/deckmark/scripts' : HERE;
function guardSkill(p, what) { if (inSkill(p)) { console.error(`${what} ${p} is inside the skill folder (${SKILL_REAL}). Run from your deck project's root, or pass --log <deck project>/.deckmark/log.json; never write into the skill.`); process.exit(2); } }
const isSlug = (s) => /^[a-z0-9][a-z0-9-]*$/.test(s || '');

const FIELDS = ['consulting', 'banking', 'asset-mgmt', 'credit', 'pe', 'public-sector', 'editorial', 'dashboard'];
// Reader fields with no theme field of their own deal through the theme fields that fit them.
const READER_FIELDS = { cfo: { dashboard: 4, consulting: 3, editorial: 1, 'asset-mgmt': 1, banking: -2 }, wealth: { 'asset-mgmt': 4, editorial: 3, pe: 1, banking: 1 } };
const DEAL_FIELDS = [...FIELDS, ...Object.keys(READER_FIELDS)];
const ADJACENT = { consulting: ['public-sector', 'editorial', 'dashboard'], banking: ['pe', 'credit'], pe: ['banking', 'credit', 'asset-mgmt'], credit: ['banking', 'pe'], 'asset-mgmt': ['pe', 'editorial'], 'public-sector': ['consulting'], editorial: ['consulting', 'asset-mgmt'], dashboard: ['consulting', 'asset-mgmt'] };
const FORMATS = ['slides-16x9', 'report-a4', 'both'];
const DENSITY = ['sparse', 'medium', 'dense'];
const NEED_HEADER = ['name', 'slug', 'field', 'format', 'paper', 'display', 'accent', 'density', 'keywords', 'inspired_by', 'pictured'];
const NEED_TOKENS = ['--paper', '--ink', '--accent', '--muted', '--rule', '--font-display', '--font-body'];
const NICE_TOKENS = ['--ink-2', '--font-figures', '--radius', '--rule-w', '--m-x', '--m-top', '--gutter'];
const FIRMS = /\b(mckinsey|bcg|boston consulting|bain|deloitte|kpmg|pwc|pricewaterhouse|ernst|accenture|oliver wyman|kearney|roland berger|goldman|morgan stanley|jp ?morgan|lazard|evercore|rothschild|citi(group)?|barclays|ubs|blackrock|blackstone|kkr|carlyle|apollo|ares|vanguard|fidelity|pimco)\b/i;

function usage() {
  console.error(`usage:
  node theme.mjs index | list [--themes <dir>]
  node theme.mjs deal --field <${DEAL_FIELDS.join('|')}> --prompt "<prompt>" [--format slides-16x9|report-a4] [--log .deckmark/log.json] [--reroll n] [--json]
  node theme.mjs draw --storyline <slug> --slides <n> [--theme <slug>] [--log .deckmark/log.json] [--seed <hex>] [--json]
  node theme.mjs scaffold <slug> --out <dir> [--format slides-16x9|report-a4] [--storyline <slug>] [--dealt "<n>/3, seed <s>"] [--draw <seed>] [--brand <client deck.pdf|page.png|https://their-site> [--pages 1-8]] [--offline] [--force]
  node theme.mjs log --entry '<json>' [--log .deckmark/log.json]
  node theme.mjs check [--themes <dir>]`);
}

// ---------- parsing ----------
export function parseHeader(src, file) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  if (!m) throw new Error(`${file}: no --- header block`);
  const h = {};
  for (const line of m[1].split('\n')) { const mm = /^([a-z_]+):\s*(.*?)\s*(#.*)?$/.exec(line.trim()); if (mm) h[mm[1]] = mm[2]; }
  const [pband, pL, phue] = (h.paper || '').split(/\s+/);
  const dparts = (h.display || '').replace(/\(.*?\)/g, '').trim().split(/\s+/);
  const [aband, ahue] = (h.accent || '').split(/\s+/);
  return {
    raw: h, name: h.name, slug: h.slug, field: h.field, format: h.format, density: h.density,
    paper: { band: pband, L: Number(pL), hue: Number(phue) },
    display: { class: dparts.slice(0, /^(geometric|high|slab|roman|grotesk)/.test(dparts[0]) ? 2 : 1).join(' '), face: dparts.slice(/^(geometric|high|slab|roman|grotesk)/.test(dparts[0]) ? 2 : 1).join(' ') },
    accent: { band: aband, hue: Number(ahue) },
    keywords: (h.keywords || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    inspired_by: h.inspired_by, pictured: h.pictured, file: `references/themes/${basename(file)}`,
  };
}

export function tokenBlock(src, file) {
  const fences = [...src.matchAll(/```css\s*\n([\s\S]*?)```/g)].map((m) => m[1]);
  const css = fences.find((f) => /:root\s*\{/.test(f));
  if (!css) throw new Error(`${file}: no :root block in a css fence under ## Tokens`);
  const body = /:root\s*\{([\s\S]*)\}/.exec(css)[1];
  const decls = {};
  for (const d of body.replace(/\/\*[\s\S]*?\*\//g, '').split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/)) {
    const mm = /^\s*(--[a-z0-9-]+)\s*:\s*([\s\S]+?)\s*$/.exec(d);
    if (mm) decls[mm[1]] = mm[2];
  }
  return { css: css.trim(), decls };
}

function themeFiles() { return existsSync(THEMES) ? readdirSync(THEMES).filter((f) => f.endsWith('.md') && !/^(readme|index)\.md$/i.test(f)).sort() : []; }

function buildIndex() {
  const out = [];
  for (const f of themeFiles()) {
    try { out.push(parseHeader(readFileSync(join(THEMES, f), 'utf8'), f)); } catch (e) { console.error(`skipped ${f}: ${e.message}`); }
  }
  for (const t of out) delete t.raw;
  writeFileSync(INDEX, JSON.stringify({ themes: out }, null, 1) + '\n');
  return out;
}
function loadIndex() {
  // Rebuild when any theme file is newer or the count changed, so a new theme is dealt at once.
  if (existsSync(INDEX)) { try { const j = JSON.parse(readFileSync(INDEX, 'utf8')).themes; if (j.length === themeFiles().length) return j; } catch { /* rebuild */ } }
  return buildIndex();
}

function readLog(p) { if (!p || !existsSync(p)) return []; try { const j = JSON.parse(readFileSync(p, 'utf8')); return Array.isArray(j) ? j : []; } catch { return []; } }

function seededRand(key) {
  let h = createHash('sha256').update(key).digest(), i = 0;
  return () => { if (i >= h.length - 4) { h = createHash('sha256').update(h).digest(); i = 0; } const v = h.readUInt32BE(i); i += 4; return v / 0xffffffff; };
}
function projectSalt() {
  const f = join(dirname(LOG()), 'salt');
  try { if (existsSync(f)) return readFileSync(f, 'utf8').trim(); mkdirSync(dirname(f), { recursive: true }); const s = randomBytes(4).toString('hex'); writeFileSync(f, s + '\n'); return s; } catch { return 'nosalt'; }
}
const STOP = new Set(['deck', 'make', 'build', 'create', 'need', 'want', 'please', 'for', 'and', 'the', 'with', 'that', 'this', 'our', 'their', 'from', 'about', 'slides', 'slide', 'report']);
const stem = (w) => { let x = w.replace(/(?:ing|ed)$/, ''); if (x.length < 3) x = w; return x.endsWith('ss') ? x : x.replace(/s$/, ''); };
const words = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const triple = (t) => `${t.paper.band}/${t.display.class}/${t.accent.band}`;
const hueGap = (a, b) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return Math.min(d, 360 - d); };

// ---------- deal ----------
function deal() {
  const field = flag('field', '');
  if (!DEAL_FIELDS.includes(field)) { console.error(`--field is one of ${DEAL_FIELDS.join(', ')}`); process.exit(2); }
  guardSkill(LOG(), 'the log');
  const prompt = flag('prompt', '');
  const format = flag('format', '');
  const n = Number(flag('n', 3)), reroll = Number(flag('reroll', 0));
  const log = readLog(LOG());
  const recent = log.slice(0, 3);
  const recentSlugs = new Set(recent.map((r) => String(r.theme || '').toLowerCase()));
  const lastTriple = recent[0] && recent[0].axes;
  const bw = new Set(words(prompt).map(stem));
  const seed = `${createHash('sha1').update(prompt.trim().toLowerCase() + field).digest('hex').slice(0, 6)}·${projectSalt()}·${new Date().toISOString().slice(0, 10)}`;
  const rand = seededRand(seed);
  const themes = loadIndex().filter((t) => !format || t.format === format || t.format === 'both');
  if (!themes.length) { console.error(`no theme in ${THEMES} supports format ${format}`); process.exit(1); }
  const df = new Map();
  for (const t of themes) for (const k of new Set(t.keywords)) df.set(k, (df.get(k) || 0) + 1);
  const scored = themes.map((t) => {
    let fit = 0; const hits = [];
    for (const k of t.keywords) { const kw = k.split(/\s+/).map(stem); if (kw.every((w) => bw.has(w))) { const d = df.get(k); fit += d <= 2 ? 3 : d <= 4 ? 2 : 1; hits.push(k); } }
    const fieldFit = READER_FIELDS[field] ? (READER_FIELDS[field][t.field] ?? -2) : t.field === field ? 4 : (ADJACENT[field] || []).includes(t.field) ? 1 : -2;
    fit += fieldFit;
    const blocked = recentSlugs.has(t.slug) || (lastTriple && lastTriple === triple(t));
    return { t, fit, hits, fieldFit, blocked, r: rand() };
  });
  const pool = scored.filter((s) => !s.blocked).sort((a, b) => b.fit - a.fit || a.r - b.r);
  const take = (exclude) => {
    const avail = pool.filter((s) => !exclude.has(s.t.slug)), picked = [];
    for (const s of avail) {
      if (picked.length >= n) break;
      // Spread the hand: a second and third card differ in display class or accent hue where the pool allows.
      const distinct = picked.every((p) => p.t.display.class !== s.t.display.class || hueGap(p.t.accent.hue, s.t.accent.hue) >= 30 || p.t.paper.band !== s.t.paper.band);
      if (distinct || avail.length - avail.indexOf(s) <= n - picked.length) picked.push(s);
    }
    return picked;
  };
  const seen = new Set();
  for (let r = 0; r < reroll; r++) { const h = take(seen); if (!h.length) break; h.forEach((p) => seen.add(p.t.slug)); }
  const hand = take(seen);
  if (!hand.length) { console.error(`nothing left to deal at reroll ${reroll}; use a lower --reroll`); process.exit(1); }
  if (has('json')) { console.log(JSON.stringify({ seed: `${seed}·r${reroll}`, field, format: format || null, deal: hand.map((s) => ({ slug: s.t.slug, name: s.t.name, field: s.t.field, format: s.t.format, axes: triple(s.t), fit: s.fit, hits: s.hits, file: s.t.file })), avoided: [...recentSlugs] })); return; }
  console.log(`deal ${seed}·r${reroll} · field ${field}${format ? ` · format ${format}` : ''}`);
  hand.forEach((s, i) => {
    const why = [s.fieldFit > 1 ? 'field fit' : s.fieldFit > 0 ? 'adjacent field' : 'other field', s.hits.length ? `fits: ${s.hits.slice(0, 4).join(', ')}` : null].filter(Boolean).join(' · ');
    console.log(`${i + 1}. ${s.t.name} (${s.t.slug}) · ${s.t.field} · ${s.t.format} · ${triple(s.t)} · ${why}`);
  });
  if (recent.length) console.log(`rotated out (last ${recent.length} decks): ${recent.map((r) => r.theme || '?').join(', ')}`);
  console.log(`log read: ${LOG()} (${log.length} entr${log.length === 1 ? 'y' : 'ies'}; deal and draw only read it, theme.mjs log writes it after the build)`);
  console.log(`next: read references/themes/<slug>.md for the pick, run theme.mjs draw for the structure, then node ${SHOWN}/theme.mjs scaffold <slug> --out <deck-dir> --storyline <slug> --dealt "<n>/${hand.length}, seed ${seed}·r${reroll}" --draw <the draw seed, 6 hex>`);
}

// ---------- draw ----------
const NO_DIVIDERS = 'no divider slides: the tracker carries the section';
const DIVIDER_MIN_SLIDES = 16;   // archetypes.md: section dividers only in decks over 15 slides
const DRAW = {
  cover: ['dark full-bleed, title in the left two thirds', 'light paper, title over a single accent rule, decision line beneath', 'split: title left, the one key figure in a panel right', 'typographic: kicker, title, a one-line answer', 'accent band across the top, title set below it'],
  divider: ['full-bleed accent with the contents list, current section outlined', 'quiet paper with an accent edge bar and a large section number', NO_DIVIDERS, 'section number with the one question the section answers'],
  exec: ['SCR rows: situation, complication, resolution', 'numbered answer-first rows, one claim each', 'KPI strip over three claims', 'one-line answer above three supporting boxes', 'argument column left, figures table right'],
  emphasis: ['one highlight bar per exhibit, the rest in ink', 'annotated change: a CAGR or delta label on every time series', 'ranked horizontal bars wherever there is a comparison', 'small multiples instead of one crowded chart', 'table-led: numbers in tables, sparklines for the trend'],
  title: ['answer-first sentence, two lines at most', 'sentence plus a unit line underneath', 'tracker above a one-line sentence'],
  close: ['the decision asked, with the recommended resolution', 'next steps as chevrons with owners and dates', 'the numbers that must be true, as a short table'],
};
// The generic lead-exhibit pool when no storyline file is found: archetypes.md names (refcheck holds them to it).
const ARCHETYPES = ['kpi-strip', 'chart-takeaway', 'matrix-2x2', 'harvey-table', 'financial-summary-table', 'quote-callout', 'timeline-gantt', 'process-chevrons', 'tombstone-grid', 'sources-uses', 'waterfall-bridge', 'football-field', 'marimekko', 'exec-summary-scr', 'ranked-bar', 'small-multiples', 'col-row', 'big-compare'];

function storylineArchetypes(slug) {
  const f = join(STORYLINES, `${slug}.md`);
  if (!existsSync(f)) return null;
  const src = readFileSync(f, 'utf8');
  const order = (/\*\*Order\.\*\*([\s\S]*?)(\n\*\*[A-Z]|\n## |$)/.exec(src) || [, src])[1];
  const known = existsSync(join(SKILL, 'references', 'archetypes.md')) ? new Set([...readFileSync(join(SKILL, 'references', 'archetypes.md'), 'utf8').matchAll(/^(?:#+\s*`?|\*\*\d+\.\s*)([a-z0-9]+(?:-[a-z0-9]+)*)`?(?:\*\*)?/gm)].map((m) => m[1])) : null;
  const found = [...order.matchAll(/\b([a-z0-9]+(?:-[a-z0-9]+)+)\b/g)].map((m) => m[1]).filter((w) => (known && known.size ? known.has(w) : true) && !/^(one|two|three|year|full|month|non|pre|post|top|left|right|ten|five|six)-/.test(w));
  return { file: `references/storylines/${slug}.md`, archetypes: [...new Set(found)] };
}

function draw() {
  const storyline = flag('storyline', '');
  if (!isSlug(storyline)) { console.error('--storyline <slug> (a file in references/storylines)'); process.exit(2); }
  const slidesRaw = flag('slides', null), slides = slidesRaw == null ? null : Number(slidesRaw);
  if (slidesRaw != null && !(Number.isInteger(slides) && slides > 0)) { console.error('--slides takes the planned slide count, a whole number'); process.exit(2); }
  const seed = flag('seed', '') || randomBytes(3).toString('hex');
  const rand = seededRand(`draw·${seed}·${storyline}`);
  const log = readLog(LOG());
  if (!has('json')) console.log(`log read: ${LOG()} (${log.length} entr${log.length === 1 ? 'y' : 'ies'}; draw only reads it)`);
  const low = (x) => String(x || '').toLowerCase();
  const recentOf = (k, n) => log.slice(0, n).map((r) => low(r[k]));
  const pick = (k) => { const bad = recentOf(k, 2); const pool = DRAW[k].filter((o) => !bad.includes(low(o))); const p = pool.length ? pool : DRAW[k]; return p[Math.floor(rand() * p.length)]; };
  // Dividers: never dealt under 16 slides (or when the count is unknown); the tracker carries the section.
  const dividerPick = () => { const d = pick('divider'); return slides != null && slides >= DIVIDER_MIN_SLIDES ? d : NO_DIVIDERS; };
  const story = storylineArchetypes(storyline);
  const lastArch = (log[0] && Array.isArray(log[0].archetypes)) ? log[0].archetypes : [];
  const prevArch = log.slice(0, 3).flatMap((r) => (Array.isArray(r.archetypes) ? r.archetypes : []));
  const counts = new Map(); prevArch.forEach((a) => counts.set(a, (counts.get(a) || 0) + 1));
  // Rest the archetypes the last decks leaned on hardest, unless the storyline cannot work without them.
  const core = new Set(['cover', ...(story ? story.archetypes.slice(0, 3) : [])]);
  const rest = [...counts.entries()].filter(([a]) => !core.has(a)).sort((a, b) => b[1] - a[1] || (rand() - 0.5)).slice(0, 2).map(([a]) => a);
  const fresh = (story && story.archetypes.length ? story.archetypes : ARCHETYPES).filter((a) => !lastArch.includes(a) && !rest.includes(a) && a !== 'cover');
  const lead = fresh.length ? fresh[Math.floor(rand() * fresh.length)] : null;
  const out = { seed, storyline, slides, storyline_file: story ? story.file : null, cover: pick('cover'), divider: dividerPick(), exec: pick('exec'), emphasis: pick('emphasis'), title: pick('title'), close: pick('close'), rest_archetypes: rest, lead_exhibit: lead };
  if (has('json')) { console.log(JSON.stringify(out)); return; }
  console.log(`draw ${seed} · storyline ${storyline}${story ? '' : ' (no storyline file found; generic draw)'}  (--seed ${seed} repeats it)`);
  console.log(`cover: ${out.cover}`);
  console.log(`dividers: ${out.divider}${slides == null ? ` (no --slides given, so no dividers; dividers are dealt only for ${DIVIDER_MIN_SLIDES}+ slides)` : slides < DIVIDER_MIN_SLIDES ? ` (${slides} slides: dividers start at ${DIVIDER_MIN_SLIDES})` : ''}`);
  console.log(`exec summary: ${out.exec}`);
  console.log(`chart emphasis: ${out.emphasis}`);
  console.log(`titles: ${out.title}`);
  console.log(`close: ${out.close}`);
  if (lead) console.log(`lead exhibit: the first chart or table after the exec summary is a ${lead} (KPI tiles, callouts and text are not the exhibit; they may sit above it on the same slide)`);
  console.log(rest.length ? `rest this time (used most in the last decks): ${rest.join(', ')}` : 'rest this time: nothing (no archetypes in the log yet)');
  console.log('take every pick; any pick you do not build is a swap, and the Picks block names each swap with its reason.');
  const entry = { theme: '<slug>', storyline, draw: seed, slides: slides ?? 0, cover: out.cover, divider: out.divider, exec: out.exec, archetypes: story && story.archetypes.length ? story.archetypes.slice(0, 8) : ['kpi-strip', 'chart-takeaway'], swaps: [] };
  console.log(`scaffold with --draw ${seed} (this draw seed, not the deal seed)`);
  console.log(`log it after the build, from the deck project root (valid JSON; set theme, slides, the archetypes you built and any swaps): node ${SHOWN}/theme.mjs log --log ${LOG()} --entry '${JSON.stringify(entry).replace(/'/g, '')}'`);
}

// ---------- scaffold ----------
const SYSTEM_FONTS = new Set(['georgia', 'arial', 'helvetica', 'helvetica neue', 'times', 'times new roman', 'verdana', 'tahoma', 'trebuchet ms', 'segoe ui', 'calibri', 'cambria', 'garamond', 'palatino', 'palatino linotype', 'book antiqua', 'iowan old style', 'menlo', 'monaco', 'consolas', 'courier', 'courier new', 'system-ui', '-apple-system', 'blinkmacsystemfont', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'sans-serif', 'serif', 'monospace', 'franklin gothic medium', 'gill sans', 'optima', 'avenir', 'avenir next', 'futura', 'frutiger', 'univers', 'arial narrow', 'baskerville', 'didot', 'hoefler text', 'charter', 'sf pro text', 'sf pro display']);
const SINGLE_WEIGHT = new Set(['questrial', 'abril fatface', 'bebas neue', 'dm serif display', 'dm serif text', 'playfair display sc', 'archivo black', 'anton', 'alfa slab one']);
// --gf-load (optional): "Family:axes@values" specs separated by |, for a face that needs more than
// 400 and 700 (a light display cut, a width or a custom axis), e.g. "Mona Sans:wdth,wght@100,400;125,300".
function googleFonts(decls) {
  const fams = new Set();
  for (const [k, v] of Object.entries(decls)) if (k.startsWith('--font')) for (const f of v.split(',')) { const n = f.trim().replace(/^["']|["']$/g, ''); if (n && !n.startsWith('var(') && !SYSTEM_FONTS.has(n.toLowerCase())) fams.add(n); }
  const load = new Map(String(decls['--gf-load'] || '').replace(/^["']|["']$/g, '').split('|').map((x) => x.trim()).filter((x) => x.includes(':')).map((x) => [x.split(':')[0].trim().toLowerCase(), x]));
  return [...fams].map((f) => `https://fonts.googleapis.com/css2?family=${load.has(f.toLowerCase()) ? load.get(f.toLowerCase()).replace(/ /g, '+') : `${f.replace(/ /g, '+')}${SINGLE_WEIGHT.has(f.toLowerCase()) ? '' : ':wght@400;700'}`}&display=swap`);
}

const FACTS_SCHEMA = 'facts.json sits next to deck.html. facts: { "<id>": { "value": <number>, "display": "<the text inside the span exactly, a bare number such as 12.4; put $, M, %, x outside the span>", "unit": "<$m|%|x>", "source": "<file:page>", "formula": "<optional: expression over other fact ids, e.g. ebitda / revenue * 100, result in the same unit as value>" } }. Print every figure with <span data-fact="<id>">12.4</span>; slide or page cross-references take data-ref.';
function systemStack(v) {
  const parts = v.split(',').map((x) => x.trim()).filter(Boolean);
  const keep = parts.filter((p) => p.startsWith('var(') || SYSTEM_FONTS.has(p.replace(/^["']|["']$/g, '').toLowerCase()));
  if (!keep.some((p) => /^(serif|sans-serif|monospace|system-ui)$/i.test(p))) keep.push(/serif/i.test(v) && !/sans-serif/i.test(v) ? 'serif' : 'sans-serif');
  return keep.join(', ');
}

// Save a Google family's latin woff2 files into <out>/fonts and return @font-face rules for them.
async function vendorFonts(fams, out) {
  const faces = [], saved = [];
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
  for (const fam of fams) {
    try {
      const r = await fetch(`https://fonts.googleapis.com/css2?family=${fam.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`, { headers: { 'User-Agent': UA } });
      if (!r.ok) continue;
      const files = new Map();
      for (const b of (await r.text()).split('/*').filter((x) => /^\s*latin\s*\*\//.test(x))) {
        const src = (b.match(/url\((https:[^)]+\.woff2)\)/) || [])[1], w = (b.match(/font-weight:\s*([\d ]+);/) || [])[1], st = (b.match(/font-style:\s*(\w+)/) || [])[1] || 'normal';
        if (!src || !w) continue;
        if (!files.has(src)) {
          const name = `${fam.replace(/\W+/g, '-')}-${files.size + 1}.woff2`;
          const f = await fetch(src); if (!f.ok) continue;
          mkdirSync(join(out, 'fonts'), { recursive: true });
          writeFileSync(join(out, 'fonts', name), Buffer.from(await f.arrayBuffer()));
          files.set(src, name);
        }
        faces.push(`@font-face{font-family:"${fam}";font-style:${st};font-weight:${w.trim()};font-display:block;src:url("fonts/${files.get(src)}") format("woff2");}`);
      }
      if (files.size) saved.push(fam);
    } catch { /* no network or not a Google family: the theme's stack renders */ }
  }
  return { faces, saved };
}

async function scaffold() {
  const [slug] = positional();
  if (!isSlug(slug) || !existsSync(join(THEMES, `${slug}.md`))) { console.error(`no theme "${slug}" in ${THEMES} (theme.mjs list)`); process.exit(2); }
  const out = resolve(flag('out', '.'));
  if (inSkill(out)) { console.error(`--out ${out} is inside the skill folder; build in your own deck folder (for example ./<project>/deck), never in the skill`); process.exit(2); }
  const drawSeed = flag('draw', null);
  if (drawSeed && !/^[0-9a-f]{1,12}$/i.test(drawSeed)) { console.error(`--draw takes the draw seed that theme.mjs draw printed (6 hex, e.g. 4c1e9a); "${drawSeed}" looks like the deal seed, which goes in --dealt`); process.exit(2); }
  const src = readFileSync(join(THEMES, `${slug}.md`), 'utf8');
  const h = parseHeader(src, slug), tk = tokenBlock(src, slug);
  const format = flag('format', h.format === 'both' ? 'slides-16x9' : h.format);
  if (h.format !== 'both' && format !== h.format) { console.error(`${h.name} is ${h.format} only; pick another theme for ${format}`); process.exit(2); }
  mkdirSync(out, { recursive: true });
  const deckFile = join(out, 'deck.html');
  const deckExisted = existsSync(deckFile);
  if (deckExisted && !has('force')) { console.error(`${deckFile} exists; --force to overwrite (tokens.css and base.css are always rewritten)`); }
  // Offline: --offline, or .deckmark/preflight.json says the material is confidential. No Google Fonts
  // request; every font token keeps only its system fallbacks (the theme's own stack, web faces removed).
  const pre = [resolve('.deckmark/preflight.json'), join(out, '..', '.deckmark', 'preflight.json'), join(out, '.deckmark', 'preflight.json')].find((p) => existsSync(p));
  let confidential = false; if (pre) { try { const pj = JSON.parse(readFileSync(pre, 'utf8')); confidential = pj.confidential === true || /^(confidential|strictly confidential|nda)$/i.test(String(pj.confidentiality || '')); } catch { /* unreadable preflight: online */ } }
  const offline = has('offline') || confidential;
  let css = tk.css;
  // Text budget from the storyline's **Words.** line: <body data-words-cap data-words-target data-lean>.
  const story = flag('storyline', '');
  const words = isSlug(story) && existsSync(join(STORYLINES, `${story}.md`)) ? parseWords(readFileSync(join(STORYLINES, `${story}.md`), 'utf8'), format) : null;
  const budget = words || { cap: WORDS_DEFAULT[format] || 90, target: null, lean: false };
  // Client brand: --brand <their deck.pdf | page.png> appends a token override block after the theme's.
  let brand = null;
  const brandFile = flag('brand', '');
  if (brandFile) {
    try { brand = await brandFromAny([isUrl(brandFile) ? brandFile : resolve(brandFile)], flag('pages', '1-8')); }
    catch (e) { console.error(`--brand ${brandFile}: ${e.message}`); process.exit(2); }
    const bandOf = (c) => (lum(c) > 0.18 ? 'light' : 'dark');
    if (h.paper && h.paper.band && h.paper.band !== 'mid' && h.paper.band !== bandOf(brand.palette.paper)) console.log(`note: ${h.name} is ${h.paper.band} paper but the brand's paper is ${bandOf(brand.palette.paper)}; the override sets the brand's paper and ink, but a ${bandOf(brand.palette.paper)}-paper theme fits its furniture better`);
  }
  if (offline) css = css.replace(/(--font-[a-z0-9-]+\s*:\s*)([^;]+);/g, (_, k, v) => `${k}${systemStack(v)};`);
  // A website brand also carries its fonts: put the site's family first in the matching stacks.
  // Online, a Google family loads with the theme's. Offline (confidential), the family is saved once into
  // <out>/fonts as woff2 and declared with @font-face, so the deck renders with no outbound request;
  // a family Google does not serve falls back to the theme's stack.
  const decls = { ...tk.decls };
  let faces = [];
  if (brand && brand.fonts) {
    const fams = [...new Set([brand.fonts.display, brand.fonts.body].filter((f) => f && !SYSTEM_FONTS.has(f.toLowerCase())))];
    let usable = new Set([brand.fonts.display, brand.fonts.body].filter(Boolean));
    if (offline) { const v = await vendorFonts(fams, out); faces = v.faces; usable = new Set([...v.saved, ...[brand.fonts.display, brand.fonts.body].filter((f) => f && SYSTEM_FONTS.has(f.toLowerCase()))]); for (const f of fams) if (!v.saved.includes(f)) console.log(`note: ${f} could not be saved for offline use; the theme's fallback stack renders instead`); }
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const put = (k, fam) => { if (!fam || !usable.has(fam) || !decls[k]) return; const cur = (css.match(new RegExp(`${k}\\s*:\\s*([^;]+);`)) || [])[1] || decls[k]; if (new RegExp(`^["']?${esc(fam)}["']?\\s*,`, 'i').test(cur)) return; const v = `"${fam}",${cur}`; css = css.replace(new RegExp(`(${k}\\s*:\\s*)([^;]+);`), `$1${v};`); decls[k] = v; };
    put('--font-display', brand.fonts.display);
    put('--font-body', brand.fonts.body); put('--font-figures', brand.fonts.body);
  }
  writeFileSync(join(out, 'tokens.css'), `/* Deckmark tokens · ${h.name} (${slug}) · generated by theme.mjs scaffold from ${h.file}${offline ? (faces.length ? ' · offline: system fallbacks plus the brand fonts saved in fonts/' : ' · offline: system font fallbacks only') : ''}; edit the theme, not this file */\n${faces.length ? `${faces.join('\n')}\n` : ''}${css}\n${brand ? `\n${brand.css}` : ''}`);
  copyFileSync(join(SKILL, 'assets', 'base.css'), join(out, 'base.css'));
  const stamp = `<!-- Deckmark · theme: ${h.name} (${slug}${flag('dealt', '') ? `, deal ${flag('dealt')}` : ', by request'}) · format: ${format} · storyline: ${flag('storyline', '<slug>')} · draw: ${flag('draw', '<seed>')} · words: ${budget.target ? `target ${budget.target}, ` : ''}cap ${budget.cap}${budget.lean ? ', lean' : ''}${brand ? ` · brand: ${isUrl(brandFile) ? brandFile : basename(brandFile)} (field ${brand.tokens['--field']}, accent ${brand.tokens['--accent']})` : ''}
     decision: <approve|invest|lend|buy|fund|adopt> · cover: <drawn> · dividers: <drawn> · exec: <drawn> · dials: <theme dials used> -->`;
  const fonts = offline ? '' : googleFonts(decls).map((u) => `<link rel="stylesheet" href="${u}">`).join('\n');
  const deck = `<!doctype html>
${stamp}
<html lang="en">
<head>
<meta charset="utf-8">
<title>Deck title</title>
${fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n${fonts}\n` : ''}<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="tokens.css">
</head>
<body data-format="${format}" data-words-cap="${budget.cap}"${budget.target ? ` data-words-target="${budget.target}"` : ''}${budget.lean ? ' data-lean' : ''}>
<main class="deck">

<section class="slide cover${/\.cover\.light\b/.test(tk.css) ? ' light' : ''}" data-archetype="cover">
  <div>
    <p class="cover-kicker">Prepared for the board</p>
    <h1 class="cover-title">Company name: the decision this deck drives</h1>
    <p class="cover-sub">One line on what the reader is asked to decide.</p>
    <div class="cover-rule"></div>
  </div>
  <div class="cover-meta"><span>Month Year</span><span class="confid">Strictly confidential</span></div>
</section>

<section class="slide" data-archetype="exec-summary" data-exec>
  <header class="slide-head">
    <div class="tracker"><span class="on">Performance</span><span>Plan</span><span>Ask</span></div>
    <h2 class="action-title">An action title states the answer in one sentence, not the topic</h2>
  </header>
  <div class="slide-body">
    <div class="kpi-strip" style="--kpis: 3">
      <div class="kpi"><span class="kpi-value"><span data-fact="metric_a">0.0</span><span class="u">x</span></span><span class="kpi-label">Metric A, with its comparison</span></div>
      <div class="kpi"><span class="kpi-value"><span data-fact="metric_b">0.0</span><span class="u">%</span></span><span class="kpi-label">Metric B, with its comparison</span></div>
      <div class="kpi hl"><span class="kpi-value">$<span data-fact="metric_c">0.0</span><span class="u">M</span></span><span class="kpi-label">Metric C, with its comparison</span></div>
    </div>
    <div class="summary-rows">
      <div class="row"><div><span class="k">Situation</span><h4>Where the business stands</h4></div><p>One line, one number, its period and its comparison.</p></div>
      <div class="row"><div><span class="k">Complication</span><h4>What changed or what is at stake</h4></div><p>One line: what changed and what it costs.</p></div>
      <div class="row"><div><span class="k">Resolution</span><h4>The answer and the ask</h4></div><p>One line: what the deck recommends and what it returns.</p></div>
    </div>
    <div class="callout">Decision requested: the one approval today, and the default if none.</div>
  </div>
  <footer class="slide-foot">
    <div class="notes"><p class="source">Source: name the document every figure comes from</p></div>
    <span class="confid">Confidential</span><span class="pageno">2</span>
  </footer>
</section>

</main>
</body>
</html>
`;
  if (!deckExisted || has('force')) writeFileSync(deckFile, deck);
  const factsFile = join(out, 'facts.json');
  if (!existsSync(factsFile)) writeFileSync(factsFile, JSON.stringify({ _schema: FACTS_SCHEMA, facts: {} }, null, 1) + '\n');
  console.log(`wrote ${join(out, 'tokens.css')} (${Object.keys(tk.decls).length} tokens from ${h.file})`);
  console.log(`wrote ${join(out, 'base.css')} (frame, furniture, archetypes; never edit, override tokens)`);
  console.log(`${existsSync(factsFile) ? 'facts' : 'wrote'}: ${factsFile} (every printed figure goes here, next to deck.html)`);
  const wroteDeck = !deckExisted || has('force');
  const webFonts = googleFonts(tk.decls);
  console.log(!wroteDeck ? `fonts: ${deckFile} was kept as it was (no --force), so its <head> and font links are unchanged`
    : offline ? `offline: no Google Fonts link; fonts fall back to the theme's system stack${confidential ? ` (preflight ${pre} marks the material confidential)` : ''}`
    : webFonts.length ? `fonts: Google Fonts link for ${webFonts.length} famil${webFonts.length === 1 ? 'y' : 'ies'} written in <head> (use --offline for confidential material)`
    : "fonts: this theme uses system fonts only, so no font link is written");
  console.log(`words: cap ${budget.cap} body words per content slide${budget.target ? `, target ${budget.target}` : ''}${budget.lean ? ', no prose tables' : ''} (${words ? `storyline ${story}` : 'default; pass --storyline'})`);
  if (brand && brand.fonts) console.log(`brand fonts: headings ${brand.fonts.display || 'theme'} · body ${brand.fonts.body || 'theme'} (first in the stacks; a non-Google face falls back to the theme's)`);
  if (brand) console.log(`brand: ${isUrl(brandFile) ? brandFile : basename(brandFile)} · paper ${brand.tokens['--paper']} · field ${brand.tokens['--field']} · accent ${brand.tokens['--accent']} · override block appended to tokens.css${brand.notes.length ? ` · ${brand.notes.join('; ')}` : ''}`);
  if (wroteDeck) console.log(`wrote ${deckFile} (starter: cover + exec summary, format ${format}; keep the stamp comment at the top)`);
  if (!flag('dealt', '')) console.log('note: no --dealt, so the stamp says "by request"; pass --dealt "<n>/3, seed <deal seed>" when the theme was dealt');
  const missing = NEED_TOKENS.filter((t) => !tk.decls[t]);
  if (missing.length) console.log(`note: theme lacks ${missing.join(', ')}; base.css defaults fill them`);
  console.log(`next: build the cover and exec summary, node ${SHOWN}/render.mjs ${deckFile} --out ${join(out, 'out')} --pages 1-2, look, then the rest; lint with node ${SHOWN}/decklint.mjs ${deckFile} --render --strict --facts ${factsFile}`);
}

// ---------- log ----------
function addLog() {
  const file = LOG();
  guardSkill(file, 'the log');
  let entry; try { entry = JSON.parse(flag('entry', '')); } catch { entry = null; }
  if (!entry || Array.isArray(entry) || typeof entry !== 'object') { console.error("--entry takes one JSON object, the deck's log entry"); process.exit(2); }
  if (!entry.date) entry.date = new Date().toISOString().slice(0, 10);
  if (entry.theme && !entry.axes && isSlug(entry.theme) && existsSync(join(THEMES, `${entry.theme}.md`))) entry.axes = triple(parseHeader(readFileSync(join(THEMES, `${entry.theme}.md`), 'utf8'), entry.theme));
  if (existsSync(file)) { try { JSON.parse(readFileSync(file, 'utf8')); } catch { console.error(`${file} is not valid JSON; fix it or move it aside, nothing was written`); process.exit(1); } }
  const missing = ['theme', 'storyline', 'cover', 'divider', 'exec', 'archetypes'].filter((k) => !entry[k]);
  const next = [entry, ...readLog(file)].slice(0, 20);
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(next, null, 1) + '\n'); renameSync(tmp, file);
  console.log(`logged ${entry.theme || '?'} / ${entry.storyline || '?'} at the top of ${file} (${next.length} of 20)${missing.length ? `; missing ${missing.join(', ')}, which rotation reads` : ''}`);
}

// ---------- check ----------
function hexRgb(s) { const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s.trim()); if (!m) return null; const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1]; return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function oklchRgb(s) {
  const m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/i.exec(s.trim()); if (!m) return null;
  const L = Number(m[1]) / (m[2] ? 100 : 1), C = Number(m[3]), H = Number(m[4]) * Math.PI / 180, a = C * Math.cos(H), b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s2 = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s2, -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s2, -0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * s2];
  return lin.map((c) => { c = Math.min(1, Math.max(0, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; });
}
export const colourOf = (s) => (s ? hexRgb(s) || oklchRgb(s) : null);
export function contrast(a, b) { const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); const Y = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); const x = Y(a), y = Y(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

function check() {
  let bad = 0, warn = 0;
  const files = themeFiles(), slugs = new Set();
  if (!files.length) { console.error(`no theme files in ${THEMES}`); process.exit(1); }
  for (const f of files) {
    const errs = [], notes = [];
    const src = readFileSync(join(THEMES, f), 'utf8');
    let h, tk;
    try { h = parseHeader(src, f); } catch (e) { errs.push(e.message); }
    if (h) {
      for (const k of NEED_HEADER) if (!h.raw[k]) errs.push(`header is missing "${k}"`);
      if (h.slug && `${h.slug}.md` !== f) errs.push(`slug "${h.slug}" does not match the file name`);
      if (h.slug && slugs.has(h.slug)) errs.push(`duplicate slug ${h.slug}`); slugs.add(h.slug);
      if (h.field && !FIELDS.includes(h.field)) errs.push(`field "${h.field}" (valid: ${FIELDS.join(', ')})`);
      if (h.format && !FORMATS.includes(h.format)) errs.push(`format "${h.format}" (valid: ${FORMATS.join(', ')})`);
      if (h.density && !DENSITY.includes(h.density)) errs.push(`density "${h.density}" (valid: ${DENSITY.join(', ')})`);
      if (h.raw.paper && (!['light', 'mid', 'dark'].includes(h.paper.band) || Number.isNaN(h.paper.L))) errs.push(`paper "${h.raw.paper}" is "<light|mid|dark> <L> <hue>"`);
      if (h.raw.accent && (!['warm', 'cool', 'neutral'].includes(h.accent.band) || Number.isNaN(h.accent.hue))) errs.push(`accent "${h.raw.accent}" is "<warm|cool|neutral> <hue>"`);
      if (h.keywords.length < 4) notes.push('fewer than 4 keywords; the dealer will rarely pick it');
      for (const k of ['name', 'slug', 'inspired_by']) if (FIRMS.test(h.raw[k] || '')) errs.push(`${k} names a real firm ("${(FIRMS.exec(h.raw[k]) || [])[0]}"); keep inspired_by generic`);
    }
    try { tk = tokenBlock(src, f); } catch (e) { errs.push(e.message); }
    if (tk) {
      const miss = NEED_TOKENS.filter((t) => !tk.decls[t]);
      if (miss.length) errs.push(`tokens block lacks ${miss.join(', ')}`);
      const soft = NICE_TOKENS.filter((t) => !tk.decls[t]);
      if (soft.length) notes.push(`no ${soft.join(', ')} (base.css defaults apply)`);
      for (const [k, v] of Object.entries(tk.decls)) if (!k.startsWith('--font') && /#|oklch|rgb/i.test(v) && !colourOf(v) && !/^rgba?\(/i.test(v)) notes.push(`${k}: "${v}" is not hex or oklch; contrast not checked`);
      const paper = colourOf(tk.decls['--paper']);
      for (const [k, min] of [['--ink', 7], ['--ink-2', 4.5], ['--muted', 4.5]]) {
        const c = colourOf(tk.decls[k]); if (!c || !paper) continue;
        const r = contrast(c, paper);
        if (r < 4.5) errs.push(`${k} on --paper is ${r.toFixed(2)}:1, under 4.5:1 (body and source text use it)`);
        else if (r < min) notes.push(`${k} on --paper is ${r.toFixed(2)}:1, under ${min}:1`);
      }
      // The header's paper band must match the --paper token: a dark theme's --ink is light, so every
      // base.css default that pairs --ink with --paper (cover, so-what, dark callout) flips with it.
      if (paper && h && h.paper.band) { const Y = (contrast(paper, [0, 0, 0]) * 0.05) - 0.05, band = Y < 0.06 ? 'dark' : Y > 0.4 ? 'light' : 'mid'; if (band !== h.paper.band) notes.push(`header says paper "${h.paper.band}" but --paper reads ${band} (luminance ${Y.toFixed(2)})`); }
      if (h && h.paper.band === 'dark') for (const t of ['--cover-bg', '--cover-ink', '--field', '--field-ink', '--accent-ink']) if (!tk.decls[t]) notes.push(`dark paper without ${t}: the base.css default assumes light paper`);
      const acc = colourOf(tk.decls['--accent']);
      if (acc && paper && contrast(acc, paper) < 3) notes.push(`--accent on --paper is ${contrast(acc, paper).toFixed(2)}:1; fine for bars, not for text`);
      for (const [k, v] of Object.entries(tk.decls)) if (k.startsWith('--font') && /[;{}]/.test(v)) errs.push(`${k} is malformed`);
    }
    for (const sec of ['## Tokens', '## Type', '## Slide furniture', '## Exhibits', '## Dials', '## Never']) if (!src.includes(sec)) notes.push(`no "${sec}" section`);
    if (/—/.test(src)) notes.push('contains an em dash; shipped copy has none');
    bad += errs.length ? 1 : 0; warn += notes.length;
    console.log(`${errs.length ? 'FAIL' : 'ok  '} ${f}${errs.map((e) => `\n     FAIL ${e}`).join('')}${notes.map((e) => `\n     note ${e}`).join('')}`);
  }
  console.log(`\n${files.length} themes · ${bad} failing · ${warn} notes`);
  if (!bad) buildIndex();
  process.exit(bad ? 1 : 0);
}

function list() {
  for (const t of loadIndex()) console.log(`${t.slug.padEnd(18)} ${String(t.field).padEnd(14)} ${String(t.format).padEnd(12)} ${String(t.density).padEnd(7)} ${t.name}`);
}

// Compare realpaths: called through the ~/.claude/skills/deckmark symlink, argv[1] is the link path.
const IS_MAIN = (() => { try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (IS_MAIN) {
  if (cmd === 'index') { const t = buildIndex(); console.log(`indexed ${t.length} themes -> ${INDEX}`); }
  else if (cmd === 'list') list();
  else if (cmd === 'deal') deal();
  else if (cmd === 'draw') draw();
  else if (cmd === 'scaffold') await scaffold();
  else if (cmd === 'log') addLog();
  else if (cmd === 'check') check();
  else { usage(); process.exit(2); }
}
