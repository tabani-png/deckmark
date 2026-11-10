#!/usr/bin/env node
// Score: decklint --render --strict --facts --json on each cell's deck, plus the brief's expect
// checks and the body-word stats -> runs/<brief>/<cell>/{lint.json,score.json}.
//
//   node eval/score.mjs [--brief id] [--arm id] [--force] [--dry-run]
//
// The expect checks read the material from eval/briefs/<id>/material/ (text files, plus
// pdftotext of any PDF when poppler is installed, else the brief's src/*.html).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { DEFAULT_RUNS, EVAL, SCRIPTS, findDeck, isMain, listCells, loadBriefs, parseArgs, readJson, readText } from './lib/common.mjs';
import { buildScore, runExpect, visibleText, wordStats } from './lib/expect.mjs';
import { parseStamp } from './lib/transcript.mjs';

export function materialText(briefDir) {
  const parts = [];
  const mat = join(briefDir, 'material');
  if (existsSync(mat)) {
    for (const f of readdirSync(mat).sort()) {
      const p = join(mat, f);
      if (/\.(md|txt|csv|json)$/i.test(f)) parts.push(readFileSync(p, 'utf8'));
      else if (/\.pdf$/i.test(f)) {
        const r = spawnSync('pdftotext', ['-layout', p, '-'], { encoding: 'utf8' });
        if (r.status === 0) parts.push(r.stdout);
      }
    }
  }
  const src = join(briefDir, 'src');
  if (existsSync(src)) for (const f of readdirSync(src)) if (/\.html$/.test(f)) parts.push(visibleText(readFileSync(join(src, f), 'utf8')));
  return parts.join('\n');
}

export function lintDeck(deck) {
  const facts = join(deck, '..', 'facts.json');
  const a = [join(SCRIPTS, 'decklint.mjs'), deck, '--render', '--strict', '--json', ...(existsSync(facts) ? ['--facts', facts] : [])];
  const r = spawnSync(process.execPath, a, { encoding: 'utf8', timeout: 300000, maxBuffer: 64 << 20 });
  if (r.status !== 0 && r.status !== 1) return { unavailable: true, reason: `decklint exit ${r.status}: ${(r.stderr || r.error?.message || '').trim().slice(0, 400)}` };
  try { const j = JSON.parse(r.stdout); j.factsUsed = existsSync(facts); return j; } catch (e) { return { unavailable: true, reason: `decklint output not JSON: ${e.message}` }; }
}

export function scoreCell(cell, brief, { lint = lintDeck } = {}) {
  const deck = findDeck(cell.work);
  const html = deck ? readText(deck, '') : null;
  const ctx = {
    html,
    work: cell.work,
    stamp: parseStamp(html),
    tokensCss: deck ? `${readText(join(deck, '..', 'tokens.css'), '')}\n${(html || '').match(/<style[\s\S]*?<\/style>/gi)?.join('\n') || ''}` : '',
    facts: deck ? readJson(join(deck, '..', 'facts.json'), {}) : {},
    materialText: materialText(join(EVAL, 'briefs', brief.id)),
  };
  const l = deck ? lint(deck) : { unavailable: true, reason: 'no deck' };
  const score = buildScore({ lint: l, expect: runExpect(brief.expect?.checks, ctx), words: html ? wordStats(html) : null, deck, stamp: ctx.stamp });
  return { lint: l, score: { ...score, brief: brief.id, cell: cell.cell, generatedAt: new Date().toISOString() } };
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['force', 'dry-run']);
  const RUNS = args['runs-dir'] || DEFAULT_RUNS;
  const briefs = new Map(loadBriefs().map((b) => [b.id, b]));
  let n = 0;
  for (const c of listCells(RUNS, args)) {
    const b = briefs.get(c.brief);
    if (!b) { console.log(`skip  ${c.brief}/${c.cell} (brief not in briefs.json)`); continue; }
    const out = join(c.dir, 'score.json');
    if (existsSync(out) && !args.force) { console.log(`skip  ${c.brief}/${c.cell} (score.json exists)`); continue; }
    if (args['dry-run']) { console.log(`would score ${c.brief}/${c.cell}: decklint --render --strict --facts --json + ${b.expect?.checks?.length ?? 0} expect checks`); continue; }
    const { lint, score } = scoreCell(c, b);
    writeFileSync(join(c.dir, 'lint.json'), `${JSON.stringify(lint, null, 1)}\n`);
    writeFileSync(out, `${JSON.stringify(score, null, 2)}\n`);
    n++;
    console.log(`score ${c.brief}/${c.cell}: ${score.lint.unavailable ? `lint n/a (${score.lint.reason})` : `${score.lint.fail} FAIL / ${score.lint.reflex} REFLEX`} · expect ${score.expect.passed}/${score.expect.total} · words ${score.words?.mean ?? 'n/a'}`);
  }
  console.log(`scored ${n} cell(s)`);
}
