// Shared paths and helpers for the Deckmark eval harness. Pure functions only (no spawning).
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EVAL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = dirname(EVAL);
export const SKILL_SRC = join(REPO, 'skills', 'deckmark');
export const SCRIPTS = join(SKILL_SRC, 'scripts');
export const SHEET_PY = join(REPO, 'test', 'sheet.py');
export const DEFAULT_RUNS = join(EVAL, 'runs');
export const DEFAULT_SHOTS = join(EVAL, '_shots');

// --flag value pairs; names in `bool` take no value. Unknown flags are kept as strings.
export function parseArgs(argv, bool = []) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (!t.startsWith('--')) { a._.push(t); continue; }
    const k = t.slice(2);
    if (bool.includes(k)) a[k] = true;
    else a[k] = argv[++i];
  }
  return a;
}

export const readJson = (p, fallback = null) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return fallback; } };
export const readText = (p, fallback = null) => { try { return readFileSync(p, 'utf8'); } catch { return fallback; } };

export function loadBriefs(root = EVAL) { return readJson(join(root, 'briefs.json'), []); }
export function loadModels(root = EVAL) { return readJson(join(root, 'models.json'), { arms: [] }); }

// "all" or a comma list -> the matching items (by id), unknown ids reported.
export function pick(list, spec, label) {
  if (!spec || spec === 'all') return list.filter((x) => x.enabled !== false);
  const ids = String(spec).split(',').map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const id of ids) {
    const hit = list.find((x) => x.id === id);
    if (!hit) throw new Error(`unknown ${label} "${id}" (known: ${list.map((x) => x.id).join(', ')})`);
    out.push(hit);
  }
  return out;
}

export const cellName = (armId, tag) => (tag ? `${armId}-${tag}` : armId);

// Every runs/<brief>/<cell>/ directory, filtered by brief id and arm (exact cell name or arm-<tag>).
export function listCells(runs, { brief = null, arm = null } = {}) {
  const out = [];
  if (!existsSync(runs)) return out;
  const briefs = brief && brief !== 'all' ? String(brief).split(',') : null;
  const arms = arm && arm !== 'all' ? String(arm).split(',') : null;
  for (const b of readdirSync(runs).sort()) {
    const bd = join(runs, b);
    if (!statSync(bd).isDirectory() || (briefs && !briefs.includes(b))) continue;
    for (const c of readdirSync(bd).sort()) {
      const dir = join(bd, c);
      if (!statSync(dir).isDirectory()) continue;
      if (arms && !arms.some((x) => c === x || c.startsWith(`${x}-`))) continue;
      out.push({ brief: b, cell: c, dir, work: join(dir, 'work') });
    }
  }
  return out;
}

// The deck a cell built: work/deck/deck.html, else the first deck.html one level down.
export function findDeck(work) {
  const main = join(work, 'deck', 'deck.html');
  if (existsSync(main)) return main;
  if (!existsSync(work)) return null;
  for (const d of readdirSync(work)) {
    if (d.startsWith('.') || d === 'material') continue;
    const p = join(work, d, 'deck.html');
    if (existsSync(p)) return p;
  }
  return existsSync(join(work, 'deck.html')) ? join(work, 'deck.html') : null;
}

// POSIX single-quote for printing a command a user can paste.
export const shq = (s) => (/^[\w@%+=:,./-]+$/.test(String(s)) ? String(s) : `'${String(s).replace(/'/g, `'\\''`)}'`);

export async function pool(items, n, fn) {
  const results = new Array(items.length);
  let i = 0;
  const worker = async () => { while (i < items.length) { const k = i++; results[k] = await fn(items[k], k); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, worker));
  return results;
}

export const mean = (xs) => { const v = xs.filter((x) => typeof x === 'number' && Number.isFinite(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };

// True when the module at `url` is the script node was started with (symlink-safe).
export function isMain(url) {
  try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(url)); } catch { return false; }
}
