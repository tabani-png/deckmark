// Read a `claude -p --output-format stream-json --verbose` transcript and the files a cell left
// behind, and measure conformance with the deckmark flow. Pure: input lines and paths, output JSON.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GEN_TOOLS } from './cli.mjs';

const SKILL_MARK = /(?:^|\/)\.claude\/skills\/deckmark\/(.+)$/;

const textOf = (content) => (typeof content === 'string' ? content
  : Array.isArray(content) ? content.map((c) => (typeof c === 'string' ? c : c?.text ?? '')).join('\n') : '');

export function classifyBash(cmd) {
  const c = String(cmd || '');
  if (/decklint\.mjs/.test(c)) return { kind: 'decklint', render: /--render\b/.test(c) || /--facts\b/.test(c), strict: /--strict\b/.test(c), facts: /--facts\b/.test(c) };
  const t = /theme\.mjs\s+(deal|draw|scaffold|log|check|list|index)\b/.exec(c);
  if (t) return { kind: `theme:${t[1]}` };
  const rd = /redesign\.mjs\s+([a-z]+)/.exec(c);
  if (rd) return { kind: `redesign:${rd[1]}` };
  if (/render\.mjs/.test(c)) return { kind: 'render', partial: /--pages\b/.test(c) };
  if (/brand\.mjs/.test(c)) return { kind: 'brand' };
  if (/charts\.mjs/.test(c)) return { kind: 'charts' };
  if (/sheet\.py/.test(c)) return { kind: 'sheet' };
  if (/\bpdftotext\b|\bpdftoppm\b/.test(c)) return { kind: 'poppler' };
  return { kind: 'other' };
}

export function analyzeTranscript(lines, { workDir = '' } = {}) {
  const r = {
    sessionInit: false, model: null, permissionMode: null, toolsAdvertised: [], mcpAdvertised: [],
    cost: null, turns: null, durationMs: null, stop: null, isError: false, resultText: '',
    usage: null, permissionDenials: [], events: [], toolCounts: {}, toolErrors: 0, skillInvoked: false,
  };
  const byId = new Map();
  const rel = (p) => (workDir && p.startsWith(`${workDir}/`) ? p.slice(workDir.length + 1) : p.replace(/^\.\//, ''));
  let seq = 0;
  for (const line of lines) {
    let ev; try { ev = JSON.parse(line); } catch { continue; }
    if (ev.type === 'system' && ev.subtype === 'init') {
      r.sessionInit = true; r.model = ev.model ?? r.model; r.permissionMode = ev.permissionMode ?? r.permissionMode;
      if (Array.isArray(ev.tools)) { r.toolsAdvertised = ev.tools.map(String); r.mcpAdvertised = r.toolsAdvertised.filter((t) => t.startsWith('mcp__')); }
    }
    if (ev.type === 'assistant' && Array.isArray(ev.message?.content)) {
      for (const b of ev.message.content) {
        if (b?.type !== 'tool_use') continue;
        r.toolCounts[b.name] = (r.toolCounts[b.name] || 0) + 1;
        const inp = b.input || {};
        const e = { i: seq++, tool: b.name, id: b.id };
        if (inp.file_path || inp.path) e.path = rel(String(inp.file_path || inp.path));
        if (b.name === 'Bash') { e.cmd = String(inp.command || '').slice(0, 400); Object.assign(e, classifyBash(inp.command)); }
        if (b.name === 'Skill' && /deckmark/.test(JSON.stringify(inp))) r.skillInvoked = true;
        if (e.path) { const m = SKILL_MARK.exec(e.path); if (m) { e.skillRef = m[1]; if (e.path.startsWith('/') && workDir && !e.path.startsWith(workDir)) e.outsideCell = true; } }
        if (e.path && /\/skills\/deckmark\//.test(e.path) && !SKILL_MARK.test(e.path)) e.outsideCell = true;
        r.events.push(e); if (b.id) byId.set(b.id, e);
      }
    }
    if (ev.type === 'user' && Array.isArray(ev.message?.content)) {
      for (const b of ev.message.content) {
        if (b?.type === 'text' && /# Deckmark|Base directory for this skill:.*deckmark/.test(b.text || '')) r.skillInvoked = true;
        if (b?.type !== 'tool_result') continue;
        const e = byId.get(b.tool_use_id);
        if (b.is_error) r.toolErrors++;
        if (!e) continue;
        e.error = !!b.is_error;
        if (e.kind === 'decklint') {
          const t = textOf(b.content);
          e.pass = /\bPASS ·/.test(t) || /"ok":\s*true/.test(t) ? true : /\bFAIL ·/.test(t) || /"ok":\s*false/.test(t) || b.is_error ? false : null;
        }
      }
    }
    if (ev.type === 'result') {
      r.cost = ev.total_cost_usd ?? r.cost; r.turns = ev.num_turns ?? r.turns; r.durationMs = ev.duration_ms ?? r.durationMs;
      r.stop = ev.subtype ?? r.stop; r.isError = !!ev.is_error; r.resultText = String(ev.result ?? '');
      if (Array.isArray(ev.permission_denials)) r.permissionDenials = ev.permission_denials.map((d) => ({ tool: d.tool_name, input: JSON.stringify(d.tool_input ?? {}).slice(0, 200) }));
      if (ev.usage && typeof ev.usage === 'object') r.usage = { in: ev.usage.input_tokens ?? null, out: ev.usage.output_tokens ?? null, cacheRead: ev.usage.cache_read_input_tokens ?? null, cacheWrite: ev.usage.cache_creation_input_tokens ?? null };
    }
  }
  return r;
}

// The reference files SKILL.md Step 4 names after "Exactly:", e.g. archetypes.md, fields.md,
// craft.md ... gates.md (the storyline and theme placeholders are checked separately).
export const LOAD_FALLBACK = ['archetypes.md', 'fields.md', 'components.md', 'gates.md'];
export function loadList(skillMd) {
  const sec = /###\s*4\.\s*Load\s*\n+([\s\S]*?)(?=\n###|$)/.exec(skillMd || '');
  const exact = sec && /Exactly:([\s\S]*?\.)(?:\s|$)/.exec(sec[1].replace(/\.md/g, '\u2024md'));
  if (!exact) return LOAD_FALLBACK;
  const names = [...exact[1].replace(/\u2024md/g, '.md').matchAll(/`(?:references\/)?([a-z0-9-]+\.md)`/g)].map((m) => m[1]);
  return names.length ? [...new Set(names)] : LOAD_FALLBACK;
}

// Step 4 Load discipline: exactly one storyline, the theme pictures compared before one theme file,
// every reference Step 4 names read, all before the deck is scaffolded or written.
export function loadOrder(events, required = LOAD_FALLBACK) {
  const reads = events.filter((e) => e.tool === 'Read' && e.skillRef);
  const refs = reads.map((e) => e.skillRef);
  const first = (pred) => { const e = reads.find((x) => pred(x.skillRef)); return e ? e.i : null; };
  const storylines = [...new Set(refs.filter((p) => /^references\/storylines\/.+\.md$/.test(p)))];
  const themeMds = [...new Set(refs.filter((p) => /^references\/themes\/.+\.md$/.test(p)))];
  const themePngs = [...new Set(refs.filter((p) => /^references\/themes\/.+\.png$/.test(p)))];
  const req = { storyline: storylines.length > 0, theme: themeMds.length > 0 };
  for (const f of required) req[f] = refs.includes(`references/${f}`);
  const build = events.find((e) => e.kind === 'theme:scaffold' || ((e.tool === 'Write' || e.tool === 'Edit') && /(^|\/)deck\.html$/.test(e.path || '')));
  const lastReq = Math.max(-1, ...required.map((f) => first((p) => p === `references/${f}`) ?? -1),
    first((p) => /^references\/storylines\//.test(p)) ?? -1, first((p) => /^references\/themes\/.+\.md$/.test(p)) ?? -1);
  const sIdx = first((p) => /^references\/storylines\//.test(p));
  const tIdx = first((p) => /^references\/themes\/.+\.md$/.test(p));
  const pngBeforeTheme = tIdx == null ? 0 : reads.filter((e) => /^references\/themes\/.+\.png$/.test(e.skillRef) && e.i < tIdx).length;
  const checks = {
    allRequired: Object.values(req).every(Boolean),
    oneStoryline: storylines.length === 1,
    oneTheme: themeMds.length === 1,
    storylineBeforeTheme: sIdx != null && tIdx != null && sIdx < tIdx,
    comparedThreePictures: pngBeforeTheme >= 3,
    loadedBeforeBuild: build ? lastReq >= 0 && lastReq < build.i : null,
  };
  return {
    ok: Object.values(checks).every((v) => v === true),
    checks, required: req, storylines, themes: themeMds, themePngs: themePngs.length,
    refReadCount: refs.length, refs: refs.slice(0, 40),
    outsideCellReads: events.filter((e) => e.outsideCell).map((e) => e.path).slice(0, 10),
  };
}

export function bashSummary(events) {
  const runs = (k) => events.filter((e) => e.kind === k);
  const lint = runs('decklint');
  const last = lint[lint.length - 1] || null;
  return {
    deal: runs('theme:deal').length, draw: runs('theme:draw').length, scaffold: runs('theme:scaffold').length, log: runs('theme:log').length,
    render: runs('render').length, brand: runs('brand').length, charts: runs('charts').length,
    redesign: events.filter((e) => String(e.kind).startsWith('redesign:')).map((e) => e.kind.slice(9)),
    decklint: lint.length,
    decklintFull: lint.some((e) => e.render && e.strict && e.facts),
    lastDecklint: last ? { full: !!(last.render && last.strict && last.facts), pass: last.pass ?? null } : null,
    otherBash: runs('other').map((e) => e.cmd).slice(0, 10),
  };
}

// The Deckmark stamp scaffold writes as the first comment of deck.html.
export function parseStamp(html) {
  const m = /<!--\s*Deckmark\s*·([\s\S]*?)-->/.exec(html || '');
  if (!m) return null;
  const out = { raw: m[0].slice(0, 600) };
  for (const part of m[1].split(' · ')) {
    const kv = /^\s*([a-z][\w -]*?):\s*([\s\S]*?)\s*$/i.exec(part);
    if (kv) out[kv[1].trim().toLowerCase()] = kv[2];
  }
  if (out.theme) { const s = /\(([a-z0-9-]+)/.exec(out.theme); if (s) out.slug = s[1]; }
  return out;
}

const PREFLIGHT_KEYS = ['material', 'numbers_available', 'numbers_absent', 'confidential', 'reader', 'decision', 'document'];

export function fileConformance(work, deckPath) {
  const j = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return undefined; } };
  const pre = j(join(work, '.deckmark', 'preflight.json'));
  const sbPath = join(work, '.deckmark', 'STORYBOARD.md');
  const sb = existsSync(sbPath) ? readFileSync(sbPath, 'utf8') : null;
  const ghost = sb ? [...sb.matchAll(/^\s*\d{1,2}\s*·\s*(confirmed|in progress|missing)\s*·/gim)].map((m) => m[1].toLowerCase()) : [];
  const factsPath = deckPath ? join(deckPath, '..', 'facts.json') : null;
  const facts = factsPath ? j(factsPath) : undefined;
  const entries = facts ? Object.entries(facts.facts || facts).filter(([k, v]) => !k.startsWith('_') && v && typeof v === 'object') : [];
  const html = deckPath && existsSync(deckPath) ? readFileSync(deckPath, 'utf8') : null;
  const outDir = deckPath ? join(deckPath, '..', 'out') : null;
  const pngs = outDir && existsSync(outDir) ? readdirSync(outDir).filter((f) => /^page-\d+\.png$/.test(f)).length : 0;
  const stamp = parseStamp(html);
  return {
    deck: !!html,
    stamp: !!stamp, stampInfo: stamp,
    preflight: pre !== undefined, preflightKeysOk: !!pre && PREFLIGHT_KEYS.every((k) => k in pre),
    storyboard: !!sb, ghostLines: ghost.length,
    ghost: { confirmed: ghost.filter((s) => s === 'confirmed').length, inProgress: ghost.filter((s) => s === 'in progress').length, missing: ghost.filter((s) => s === 'missing').length },
    facts: entries.length > 0, factCount: entries.length, formulaCount: entries.filter(([, v]) => v.formula).length,
    log: existsSync(join(work, '.deckmark', 'log.json')),
    review: existsSync(join(work, '.deckmark', 'review.md')), tieout: existsSync(join(work, '.deckmark', 'tieout.md')),
    renderedPngs: pngs,
  };
}

// Tools the session was offered beyond the allowlist (a leak if anything shows up).
export const toolsOutsideAllowlist = (advertised) => advertised.filter((t) => !GEN_TOOLS.includes(t));
