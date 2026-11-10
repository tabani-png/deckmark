#!/usr/bin/env node
// Generate: drive the real Claude Code CLI over each (brief x arm) cell with the deckmark skill
// copied into a scratch project, and record conformance from the stream-json transcript.
//
//   node eval/gen-cli.mjs [--brief all|id,id] [--arm all|default,sonnet,haiku] [--tag v05]
//        [--concurrency 2] [--timeout-min 45] [--budget-usd 15] [--max-turns N] [--effort high]
//        [--force] [--dry-run] [--repair-round N] [--use-api-key]
//
// Cell: eval/runs/<brief>/<arm>[-<tag>]/ holds prompt.txt, transcript.jsonl, stderr.txt, run.json;
// its work/ subfolder is the agent's cwd: .claude/skills/deckmark (a copy), material/, and what
// the agent builds (deck/, .deckmark/).
//
// Permissions (fixed, see lib/cli.mjs and the tests): --permission-mode acceptEdits, tools limited
// to Read, Write, Edit, Glob, Grep and Bash(node|python3|pdftoppm|pdftotext *), no MCP servers,
// project settings only, never a bypass mode. The API key is removed from the child env unless
// --use-api-key, so cells run on the logged-in subscription.
//
// --repair-round N re-prompts only cells whose score.json is not strict-clean, in the same work
// folder, with the decklint findings; transcript.repair-N.jsonl, run.json gains repairs[].
// EVAL_CLAUDE_BIN (or --claude-bin) swaps the binary; the tests point it at a fake.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { DEFAULT_RUNS, EVAL, REPO, SKILL_SRC, cellName, findDeck, loadBriefs, loadModels, parseArgs, pick, pool, readJson, readText, shq } from './lib/common.mjs';
import { buildGenArgs, childEnv, genPrompt, repairPrompt } from './lib/cli.mjs';
import { analyzeTranscript, bashSummary, fileConformance, loadList, loadOrder, toolsOutsideAllowlist } from './lib/transcript.mjs';

const args = parseArgs(process.argv.slice(2), ['force', 'dry-run', 'use-api-key']);
const models = loadModels();
const d = models.defaults || {};
const RUNS = args['runs-dir'] || DEFAULT_RUNS;
const BIN = args['claude-bin'] || process.env.EVAL_CLAUDE_BIN || 'claude';
const timeoutMs = Number(args['timeout-min'] || d.timeoutMin || 45) * 60000;
const concurrency = Number(args.concurrency || d.concurrency || 2);
const budget = Number(args['budget-usd'] || d.budgetUsd || 15);
const repairRound = args['repair-round'] ? Number(args['repair-round']) : null;

function runClaude(cliArgs, cwd, env) {
  return new Promise((resolve) => {
    const out = []; let buf = '', err = '', timedOut = false;
    const p = spawn(BIN, cliArgs, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const t = setTimeout(() => { timedOut = true; p.kill('SIGTERM'); setTimeout(() => p.kill('SIGKILL'), 10000).unref(); }, timeoutMs);
    p.stdout.on('data', (x) => { buf += x; let nl; while ((nl = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, nl); buf = buf.slice(nl + 1); if (l.trim()) out.push(l); } });
    p.stderr.on('data', (x) => { if (err.length < 20000) err += x; });
    p.on('close', (code) => { clearTimeout(t); if (buf.trim()) out.push(buf); resolve({ lines: out, stderr: err, code, timedOut }); });
    p.on('error', (e) => { clearTimeout(t); resolve({ lines: out, stderr: `${err}\nspawn error: ${e.message}`, code: -1, timedOut }); });
  });
}

// The skill as copied into the cells: SKILL.md version, the repo commit, and whether skills/ had
// uncommitted edits (a cell run on a working tree is not reproducible from the hash alone).
function skillVersion() {
  const v = (/^version:\s*(\S+)/m.exec(readText(join(SKILL_SRC, 'SKILL.md'), '')) || [])[1] || null;
  const git = (a) => { const r = spawnSync('git', ['-C', REPO, ...a], { encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : null; };
  return { version: v, commit: git(['rev-parse', '--short', 'HEAD']), dirty: !!git(['status', '--porcelain', '--', 'skills/']) };
}
const SKILL_VERSION = skillVersion();

function measure(lines, work) {
  const a = analyzeTranscript(lines, { workDir: work });
  const deck = findDeck(work);
  return {
    a, deck,
    conformance: fileConformance(work, deck),
    loadOrder: loadOrder(a.events, loadList(readText(join(work, '.claude', 'skills', 'deckmark', 'SKILL.md'), ''))),
    bash: bashSummary(a.events),
  };
}

async function genCell(brief, arm) {
  const cell = cellName(arm.id, args.tag);
  const dir = join(RUNS, brief.id, cell), work = join(dir, 'work'), runJson = join(dir, 'run.json');
  const prompt = genPrompt(brief);
  const cliArgs = buildGenArgs({ prompt, model: arm.model, budgetUsd: budget, maxTurns: args['max-turns'], effort: args.effort });
  if (args['dry-run']) {
    console.log(`\n# ${brief.id}/${cell}  (cwd ${work}; skill copied to work/.claude/skills/deckmark, material to work/material)`);
    console.log([BIN, ...cliArgs].map(shq).join(' '));
    return;
  }
  if (existsSync(runJson) && !args.force) { console.log(`skip  ${brief.id}/${cell} (run.json exists; --force to redo)`); return; }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(work, '.claude', 'skills'), { recursive: true });
  cpSync(SKILL_SRC, join(work, '.claude', 'skills', 'deckmark'), { recursive: true });
  cpSync(join(EVAL, 'briefs', brief.id, 'material'), join(work, 'material'), { recursive: true });
  writeFileSync(join(dir, 'prompt.txt'), `${prompt}\n`);
  console.log(`run   ${brief.id}/${cell} ...`);
  const started = Date.now();
  const res = await runClaude(cliArgs, work, childEnv(process.env, { useApiKey: !!args['use-api-key'] }));
  writeFileSync(join(dir, 'transcript.jsonl'), `${res.lines.join('\n')}\n`);
  writeFileSync(join(dir, 'stderr.txt'), res.stderr);
  const m = measure(res.lines, work);
  const run = {
    brief: brief.id, cell, arm: arm.id, skill: SKILL_VERSION, model: m.a.model ?? arm.model ?? 'cli-default',
    ok: m.a.sessionInit && !m.a.isError && !res.timedOut && m.conformance.deck,
    exitCode: res.code, timedOut: res.timedOut, durationSec: +((Date.now() - started) / 1000).toFixed(1),
    costUSD: m.a.cost, turns: m.a.turns, stopSubtype: m.a.stop, tokens: m.a.usage,
    safety: { permissionMode: m.a.permissionMode, toolsOutsideAllowlist: toolsOutsideAllowlist(m.a.toolsAdvertised), mcpAdvertised: m.a.mcpAdvertised, permissionDenials: m.a.permissionDenials },
    skillInvoked: m.a.skillInvoked, conformance: m.conformance, loadOrder: m.loadOrder, bash: m.bash,
    toolCounts: m.a.toolCounts, toolErrors: m.a.toolErrors,
    filesWritten: [...new Set(m.a.events.filter((e) => e.tool === 'Write' || e.tool === 'Edit').map((e) => e.path))].slice(0, 40),
    resultPreview: m.a.resultText.slice(0, 400), repairs: [], generatedAt: new Date().toISOString(),
  };
  writeFileSync(runJson, `${JSON.stringify(run, null, 2)}\n`);
  console.log(`done  ${brief.id}/${cell} | ok=${run.ok} stamp=${run.conformance.stamp} loadOrder=${run.loadOrder.ok} lint=${run.bash.lastDecklint?.pass ?? 'none'} turns=${run.turns} cost=${run.costUSD} ${run.durationSec}s`);
}

async function repairCell(brief, arm) {
  const cell = cellName(arm.id, args.tag);
  const dir = join(RUNS, brief.id, cell), work = join(dir, 'work');
  const run = readJson(join(dir, 'run.json')), score = readJson(join(dir, 'score.json')), lint = readJson(join(dir, 'lint.json'));
  if (!run || !score || !existsSync(work)) return;
  if (score.strictClean || !score.deck) { if (!args['dry-run']) console.log(`skip  ${brief.id}/${cell} (${score.deck ? 'strict-clean' : 'no deck to repair'})`); return; }
  const prompt = repairPrompt(lint?.findings || []);
  const cliArgs = buildGenArgs({ prompt, model: arm.model, budgetUsd: budget, maxTurns: args['max-turns'], effort: args.effort });
  if (args['dry-run']) { console.log(`\n# repair ${repairRound} ${brief.id}/${cell} (cwd ${work})\n${[BIN, ...cliArgs].map(shq).join(' ')}`); return; }
  console.log(`repair${repairRound} ${brief.id}/${cell} ...`);
  const started = Date.now();
  const res = await runClaude(cliArgs, work, childEnv(process.env, { useApiKey: !!args['use-api-key'] }));
  writeFileSync(join(dir, `transcript.repair-${repairRound}.jsonl`), `${res.lines.join('\n')}\n`);
  const m = measure(res.lines, work);
  run.repairs = [...(run.repairs || []).filter((r) => r.round !== repairRound), { round: repairRound, ok: m.a.sessionInit && !m.a.isError && !res.timedOut, costUSD: m.a.cost, turns: m.a.turns, durationSec: +((Date.now() - started) / 1000).toFixed(1), lastDecklint: m.bash.lastDecklint, permissionDenials: m.a.permissionDenials }];
  run.costUSDTotal = (run.costUSD ?? 0) + run.repairs.reduce((s, r) => s + (r.costUSD ?? 0), 0);
  run.conformance = m.conformance;
  writeFileSync(join(dir, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);
  console.log(`done  repair${repairRound} ${brief.id}/${cell} | lint=${m.bash.lastDecklint?.pass ?? 'none'} cost=${m.a.cost}`);
}

const briefs = pick(loadBriefs(), args.brief, 'brief');
const arms = pick(models.arms, args.arm, 'arm');
const cells = briefs.flatMap((b) => arms.map((a) => [b, a]));
console.log(`${repairRound ? `repair round ${repairRound}` : 'generate'}: ${briefs.length} brief(s) x ${arms.length} arm(s) = ${cells.length} cell(s), concurrency ${concurrency}, timeout ${timeoutMs / 60000} min, budget $${budget}/cell${args['dry-run'] ? ' (dry run: commands only)' : ''}`);
await pool(cells, args['dry-run'] ? 1 : concurrency, ([b, a]) => (repairRound ? repairCell(b, a) : genCell(b, a)));
