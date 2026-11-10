#!/usr/bin/env node
// Judge: a read-only `claude -p` vision pass over each cell's contact sheet (and up to six full
// pages), with the skill's finish-review prompt (review-finish.md, or gates.md § 6 on older
// skill versions) plus six axes (1-5) and an overall 1-10.
// Writes runs/<brief>/<cell>/judge.json (+ judge-raw.json, the CLI envelope).
//
//   node eval/judge.mjs [--brief id] [--arm id] [--model opus] [--force] [--dry-run] [--use-api-key]
//
// The judge's tools are Read only (--tools Read --allowedTools Read --permission-mode dontAsk),
// no MCP, cwd is the cell folder so the images sit inside its working directory.
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { DEFAULT_RUNS, SKILL_SRC, isMain, listCells, loadBriefs, loadModels, parseArgs, readText, shq } from './lib/common.mjs';
import { buildJudgeArgs, childEnv } from './lib/cli.mjs';
import { judgePrompt, parseJudgeOutput, reviewerPrompt } from './lib/judge.mjs';

export function judgeInputs(cell, brief, reviewer) {
  const render = join(cell.dir, 'render');
  if (!existsSync(join(render, 'sheet.png'))) return null;
  const pages = readdirSync(render).filter((f) => /^page-\d+\.png$/.test(f)).sort().map((f) => `render/${f}`);
  const storyboard = readText(join(cell.work, '.deckmark', 'STORYBOARD.md'), null);
  return { prompt: judgePrompt({ reviewer, storyboard, brief, sheet: 'render/sheet.png', pages }), pages };
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['force', 'dry-run', 'use-api-key']);
  const RUNS = args['runs-dir'] || DEFAULT_RUNS;
  const BIN = args['claude-bin'] || process.env.EVAL_CLAUDE_BIN || 'claude';
  const model = args.model || loadModels().judge?.model || null;
  const rv = reviewerPrompt(SKILL_SRC);
  const reviewer = rv.text;
  const briefs = new Map(loadBriefs().map((b) => [b.id, b]));
  const cells = listCells(RUNS, args);
  let n = 0;
  if (args['dry-run'] && !cells.some((c) => existsSync(join(c.dir, 'render', 'sheet.png')))) {
    const b = [...briefs.values()][0];
    const a = buildJudgeArgs({ prompt: judgePrompt({ reviewer, storyboard: null, brief: b, sheet: 'render/sheet.png', pages: ['render/page-01.png'] }), model });
    console.log(`# no rendered cells yet; the judge runs this per cell (cwd eval/runs/<brief>/<cell>):\n${[BIN, ...a].map(shq).join(' ')}`);
  }
  for (const c of cells) {
    const b = briefs.get(c.brief);
    const out = join(c.dir, 'judge.json');
    if (!b) continue;
    if (existsSync(out) && !args.force) { console.log(`skip  ${c.brief}/${c.cell} (judge.json exists)`); continue; }
    const inp = judgeInputs(c, b, reviewer);
    if (!inp) { console.log(`skip  ${c.brief}/${c.cell} (no render/sheet.png; run render-cells.mjs)`); continue; }
    const cliArgs = buildJudgeArgs({ prompt: inp.prompt, model });
    if (args['dry-run']) { console.log(`\n# judge ${c.brief}/${c.cell} (cwd ${c.dir})\n${[BIN, ...cliArgs].map(shq).join(' ')}`); continue; }
    console.log(`judge ${c.brief}/${c.cell} ...`);
    const r = spawnSync(BIN, cliArgs, { cwd: c.dir, env: childEnv(process.env, { useApiKey: !!args['use-api-key'] }), encoding: 'utf8', timeout: 600000, maxBuffer: 32 << 20 });
    writeFileSync(join(c.dir, 'judge-raw.json'), r.stdout || '');
    const j = { ...parseJudgeOutput(r.stdout || ''), reviewerFrom: rv.from, model: model || 'cli-default', generatedAt: new Date().toISOString() };
    writeFileSync(out, `${JSON.stringify(j, null, 2)}\n`);
    n++;
    console.log(j.error ? `error ${c.brief}/${c.cell}: ${j.error}` : `done  ${c.brief}/${c.cell}: ${j.verdict} · ${j.overall}/10`);
  }
  console.log(`judged ${n} cell(s)`);
}
