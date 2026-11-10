#!/usr/bin/env node
// Deckmark refcheck: the skill's own references hold together. Static, no browser, about 100ms.
//   node refcheck.mjs [--errors] [--json]
// Checks: every markdown link and every named .md/.mjs file resolves; every "file.md § N" or "§ Name"
// points at a real section; every class components.md and the references name exists in base.css or
// is written by charts.mjs; every archetype a storyline or theme.mjs names exists in archetypes.md;
// every decklint rule is documented in gates.md and every (L `rule`) there exists; versions agree
// across SKILL.md, package.json and the plugin manifests; no em or en dash in shipped copy; every
// theme has its picture and an index row; SKILL.md stays lean; no reference is unreachable.
// Exit 1 on any error. Modelled on Hallmark's refcheck.mjs (MIT, Copyright (c) 2026 Hallmark contributors).
import { readFileSync, readdirSync, statSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname, relative, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(ROOT, '..', '..');
const args = process.argv.slice(2);
const AS_JSON = args.includes('--json'), ONLY_ERRORS = args.includes('--errors');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const FILES = walk(ROOT);
const MD = FILES.filter((f) => f.endsWith('.md'));
const BY_BASE = new Map(); for (const f of FILES) { const b = basename(f); if (!BY_BASE.has(b)) BY_BASE.set(b, []); BY_BASE.get(b).push(f); }
const read = (f) => readFileSync(f, 'utf8');
const findings = [];
const add = (level, file, line, rule, msg) => findings.push({ level, file: relative(REPO, file), line, rule, msg });
const lineAt = (src, i) => src.slice(0, i).split('\n').length;
const SKILL = join(ROOT, 'SKILL.md');
const skillSrc = read(SKILL);
const VERSION = (/^version:\s*([\d.]+)/m.exec(skillSrc) || [])[1];

// ---------- 1. links and file mentions ----------
// Files a deck project owns (not the skill): named in prose, never shipped here.
const PROJECT_FILES = new Set(['DECK.md', 'STORYBOARD.md', 'STORYBOARD.draft.md', 'QUESTIONS.md', 'README.md', 'AGENTS.md', 'CLAUDE.md', 'build.mjs', 'BRIEF.md']);
for (const f of MD) {
  const src = read(f);
  for (const m of src.matchAll(/\]\(([^)\s]+)\)/g)) {
    const raw = m[1]; if (/^(https?:|mailto:|#)/.test(raw)) continue;
    const target = raw.split('#')[0]; if (!target) continue;
    if (!existsSync(resolve(dirname(f), target))) add('error', f, lineAt(src, m.index), 'link', `dead link ${raw}`);
  }
  for (const m of src.matchAll(/`([\w./~-]+\.(?:md|mjs))`/g)) {
    const name = m[1]; if (/[<*~]/.test(name) || name.startsWith('/')) continue;
    const b = basename(name); if (PROJECT_FILES.has(b)) continue;
    if (!(BY_BASE.has(b) || existsSync(resolve(dirname(f), name)) || existsSync(join(ROOT, name)))) add('error', f, lineAt(src, m.index), 'mention', `names ${name}, which does not exist`);
  }
}

// ---------- 2. § sections ----------
const headingsOf = new Map();
function headings(file) {
  if (!headingsOf.has(file)) {
    const src = read(file);
    headingsOf.set(file, [...src.matchAll(/^#{1,4}\s+(.+)$/gm)].map((m) => m[1].replace(/[*`]/g, '').trim()).concat([...src.matchAll(/^\s*(?:[-*]\s+|\d+\.\s+)?\*\*([^*]+)\*\*/gm)].map((m) => m[1].trim())));
  }
  return headingsOf.get(file);
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
for (const f of MD) {
  const src = read(f);
  for (const m of src.matchAll(/§\s*([^\n§]{1,60})/g)) {
    const lineStart = src.lastIndexOf('\n', m.index) + 1;
    const mentions = [...src.slice(lineStart, m.index).matchAll(/([\w-]+(?:\/[\w-]+)*\.md)/g)];
    const fm = mentions.length ? mentions[mentions.length - 1][1] : null;
    let target = f;
    if (fm) { const c = BY_BASE.get(basename(fm)); if (!c) continue; target = c.find((x) => x.endsWith(fm)) || c[0]; }
    const rest = m[1].trim(), hs = headings(target);
    const num = /^(\d+)\b/.exec(rest);
    if (num) { if (!hs.some((h) => new RegExp(`^(§\\s*)?${num[1]}[.\\s]`).test(h))) add('error', f, lineAt(src, m.index), 'section', `${relative(ROOT, target)} has no § ${num[1]}`); continue; }
    const words = norm(rest.split(/[,.;:()]|\s(?:and|to|or|for|on|in|when|is|with|first|waits|binds)\s/)[0]).split(' ').slice(0, 3).join(' ');
    if (!words || words.length < 3 || /^(n|nn)$/.test(words)) continue;
    const first = words.split(' ')[0];
    if (!hs.map(norm).some((h) => h.includes(words) || h.startsWith(first))) add('error', f, lineAt(src, m.index), 'section', `${relative(ROOT, target)} has no section like "§ ${rest.split(/[,.;:)]/)[0].trim()}"`);
  }
}

// ---------- 3. classes ----------
const baseCss = read(join(ROOT, 'assets', 'base.css'));
const chartsSrc = read(join(ROOT, 'scripts', 'charts.mjs'));
const NOT_CLASS = new Set(['html', 'htm', 'pdf', 'png', 'pptx', 'xlsx', 'json', 'md', 'mjs', 'css', 'svg', 'deckmark', 'txt', 'tmp', 'jpg', 'jpeg', 'docx', 'csv', 'claude', 'codex', 'agents', 'yaml', 'local', 'env']);
const classExists = (c) => new RegExp(`\\.${c.replace(/[-]/g, '\\-')}(?![\\w-])`).test(baseCss) || new RegExp(`['" ]${c}['" ]|class="${c}`).test(chartsSrc) || chartsSrc.includes(`'${c}'`) || chartsSrc.includes(` ${c}\``) || chartsSrc.includes(`${c}${'$'}`) || chartsSrc.includes(c + "'") || chartsSrc.includes(c + '"');
const CLASS_DOCS = MD.filter((f) => /references\/(components|layout|craft|patterns|archetypes|data-viz)\.md$/.test(f) || f === SKILL);
for (const f of CLASS_DOCS) {
  const src = read(f);
  for (const m of src.matchAll(/`((?:[a-z]+)?(?:\.[a-z][a-z0-9-]*)+)`/g)) {
    const tok = m[1]; if (/^[a-z]+$/.test(tok)) continue;
    for (const c of tok.split('.').slice(1)) {
      if (NOT_CLASS.has(c) || /^\d/.test(c)) continue;
      if (!classExists(c)) add('error', f, lineAt(src, m.index), 'class', `.${c} (in \`${tok}\`) is not in base.css or charts.mjs`);
    }
  }
}

// ---------- 4. archetypes ----------
const archSrc = read(join(ROOT, 'references', 'archetypes.md'));
const ARCH = new Set([...archSrc.matchAll(/^\*\*\d+\.\s*([a-z0-9]+(?:-[a-z0-9]+)*)\*\*/gm)].map((m) => m[1]));
const SUFFIX = /-(strip|takeaway|bridge|bar|table|multiples|field|uses|matrix|2x2|tiles|tracker|divider|scr|ask|callout|chart|compare|pair|row|grid|gantt|chevrons|tree|exhibits|items|page|summary)$/;
const RULE_NAMES = new Set(Object.keys((await import('./decklint.mjs')).RULES));
const storyDir = join(ROOT, 'references', 'storylines');
for (const f of [...readdirSync(storyDir).map((x) => join(storyDir, x)), join(ROOT, 'references', 'storylines.md')]) {
  const src = read(f);
  for (const m of src.matchAll(/\b([a-z0-9]+(?:-[a-z0-9]+)+)\b/g)) {
    const w = m[1];
    if (!SUFFIX.test(w) || ARCH.has(w) || RULE_NAMES.has(w) || (/^(one|two|three|half|full|first|year|bank)-|^\d/.test(w) || ['sources-and-uses', 'track-record', 'data-room'].includes(w))) continue;
    add('error', f, lineAt(src, m.index), 'archetype', `"${w}" reads as an archetype and is not in archetypes.md`);
  }
  if (f.endsWith('.md') && dirname(f) === storyDir) {
    if (!/^\*\*Words\.\*\* 16:9 target \d+-\d+, cap \d+ · A4 cap \d+/m.test(src)) add('error', f, 1, 'storyline', 'no parseable **Words.** line (decklint reads it)');
    if (!/\*\*Short form/.test(src) && !/teaser/.test(basename(f))) add('error', f, 1, 'storyline', 'no **Short form** section for thin material');
  }
}
const themeSrc = read(join(ROOT, 'scripts', 'theme.mjs'));
const archList = (/const ARCHETYPES = \[([^\]]+)\]/.exec(themeSrc) || [])[1] || '';
for (const m of archList.matchAll(/'([^']+)'/g)) if (!ARCH.has(m[1])) add('error', join(ROOT, 'scripts', 'theme.mjs'), lineAt(themeSrc, themeSrc.indexOf(`'${m[1]}'`)), 'archetype', `theme.mjs deals "${m[1]}", which is not in archetypes.md`);

// ---------- 5. decklint rules vs gates.md ----------
const gatesSrc = read(join(ROOT, 'references', 'gates.md'));
for (const r of RULE_NAMES) if (!new RegExp(`\`${r}\``).test(gatesSrc)) add('error', join(ROOT, 'references', 'gates.md'), 1, 'rule', `decklint rule ${r} is not documented in gates.md`);
for (const m of gatesSrc.matchAll(/\(L `([a-z-]+)`/g)) if (!RULE_NAMES.has(m[1])) add('error', join(ROOT, 'references', 'gates.md'), lineAt(gatesSrc, m.index), 'rule', `gates.md names decklint rule ${m[1]}, which does not exist`);

// ---------- 6. versions ----------
const ver = (file, get) => { if (!existsSync(file)) return; let v; try { v = get(JSON.parse(read(file))); } catch { v = null; } if (v !== VERSION) add('error', file, 1, 'version', `${basename(file)} says ${v} where SKILL.md says ${VERSION}`); };
ver(join(REPO, 'package.json'), (j) => j.version);
ver(join(REPO, '.claude-plugin', 'plugin.json'), (j) => j.version);
ver(join(REPO, '.claude-plugin', 'marketplace.json'), (j) => j.plugins && j.plugins[0] && j.plugins[0].version);
const picks = /\*\*Deckmark · v([\d.]+)\*\*/.exec(skillSrc);
if (!picks || picks[1] !== VERSION) add('error', SKILL, 1, 'version', `the Picks block says v${picks && picks[1]} where the frontmatter says ${VERSION}`);

// ---------- 7. dashes in shipped copy ----------
const COPY = [...MD, ...['README.md', 'ROADMAP.md', join('docs', 'HALLMARK-GAP.md')].map((x) => join(REPO, x)).filter(existsSync)];
for (const f of COPY) { const src = read(f); for (const m of src.matchAll(/[—–]/g)) add('error', f, lineAt(src, m.index), 'dash', 'em or en dash in shipped copy'); }

// ---------- 8. themes ----------
const THEME_DIR = join(ROOT, 'references', 'themes');
const themeMd = readdirSync(THEME_DIR).filter((x) => x.endsWith('.md'));
let index = { themes: [] }; try { index = JSON.parse(read(join(THEME_DIR, 'index.json'))); } catch { add('error', join(THEME_DIR, 'index.json'), 1, 'index', 'index.json missing or unreadable (run theme.mjs index)'); }
const indexed = new Set(index.themes.map((t) => t.slug));
for (const t of themeMd) {
  const slug = basename(t, '.md');
  if (!existsSync(join(THEME_DIR, `${slug}.png`))) add('error', join(THEME_DIR, t), 1, 'picture', `no ${slug}.png beside the theme (the deal shows it)`);
  if (!indexed.has(slug)) add('error', join(THEME_DIR, t), 1, 'index', 'theme missing from index.json (run theme.mjs index)');
}
for (const t of index.themes) if (!existsSync(join(ROOT, t.file))) add('error', join(THEME_DIR, 'index.json'), 1, 'index', `index lists ${t.file}, which does not exist`);

// ---------- 9. SKILL.md shape ----------
const fm = /^---\n([\s\S]*?)\n---/.exec(skillSrc);
const desc = fm && (/^description:\s*(.*)$/m.exec(fm[1]) || [])[1];
if (!fm || !/^name:\s*deckmark$/m.test(fm[1]) || !desc) add('error', SKILL, 1, 'frontmatter', 'SKILL.md needs name: deckmark and a description');
else if (!/^"(?:[^"\\]|\\.)*"$/.test(desc) || desc.length > 1026) add('error', SKILL, 3, 'frontmatter', 'the description must be one double-quoted line of 1,024 characters or fewer');
const lines = skillSrc.split('\n').length, bytes = Buffer.byteLength(skillSrc);
if (lines > 160 || bytes > 19000) add('error', SKILL, 1, 'size', `SKILL.md is ${lines} lines, ${bytes} bytes; keep it at 160 lines and 19,000 bytes or under and move detail into references`);

// ---------- 10. reachability ----------
const reach = new Set([SKILL]); const queue = [SKILL];
while (queue.length) {
  const f = queue.shift(); const src = read(f);
  const names = [...src.matchAll(/\]\(([^)#\s]+\.md)/g)].map((m) => resolve(dirname(f), m[1])).concat([...src.matchAll(/`?([\w-]+(?:\/[\w-]+)*\.md)`?/g)].flatMap((m) => BY_BASE.get(basename(m[1])) || []));
  if (/storylines/.test(src)) for (const x of readdirSync(storyDir)) names.push(join(storyDir, x));
  if (/themes\/<slug>\.md/.test(src)) for (const x of themeMd) names.push(join(THEME_DIR, x));
  for (const n of names) if (MD.includes(n) && !reach.has(n)) { reach.add(n); queue.push(n); }
}
for (const f of MD) if (!reach.has(f)) add('warn', f, 1, 'orphan', 'no file reachable from SKILL.md names this file');

// ---------- report ----------
const shown = ONLY_ERRORS ? findings.filter((x) => x.level === 'error') : findings;
const errors = findings.filter((x) => x.level === 'error').length, warns = findings.length - errors;
if (AS_JSON) console.log(JSON.stringify({ ok: !errors, errors, warns, findings: shown }, null, 1));
else {
  for (const x of shown) console.log(`${x.level === 'error' ? 'ERROR' : 'warn '} ${x.file}:${x.line} ${x.rule}: ${x.msg}`);
  console.log(`refcheck: ${MD.length} markdown files · ${errors} error${errors === 1 ? '' : 's'} · ${warns} warning${warns === 1 ? '' : 's'}`);
}
process.exit(errors ? 1 : 0);
