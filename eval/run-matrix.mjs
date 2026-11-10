#!/usr/bin/env node
// The whole pipeline: gen -> render -> score -> (repair rounds) -> judge -> report.
//
//   node eval/run-matrix.mjs [--brief all|id,id] [--arm all|id,id] [--tag t] [--repair N]
//        [--concurrency 2] [--timeout-min 45] [--budget-usd 15] [--judge-model opus]
//        [--skip-gen] [--skip-judge] [--force] [--dry-run]
//
// --repair N: after scoring, up to N rounds of gen-cli --repair-round r (only cells that are not
// strict-clean), each followed by a forced re-render and re-score. Stops early once all are clean.
// --dry-run prints every claude command and stage; nothing is spawned beyond this harness.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { DEFAULT_RUNS, EVAL, cellName, listCells, loadBriefs, loadModels, parseArgs, pick, readJson } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['force', 'dry-run', 'skip-gen', 'skip-judge', 'use-api-key']);
const dry = args['dry-run'] ? ['--dry-run'] : [];
const force = args.force ? ['--force'] : [];
const pass = (k) => (args[k] != null ? [`--${k}`, String(args[k])] : []);
const sel = [...pass('brief'), ...pass('arm'), ...pass('tag')];
const genFlags = [...sel, ...pass('concurrency'), ...pass('timeout-min'), ...pass('budget-usd'), ...pass('max-turns'), ...pass('effort'), ...(args['use-api-key'] ? ['--use-api-key'] : [])];
// Later stages filter by cell name, which carries the tag.
const arms = pick(loadModels().arms, args.arm, 'arm');
const cellFilter = ['--arm', arms.map((a) => cellName(a.id, args.tag)).join(','), ...pass('brief')];

function stage(name, script, extra, { required = true } = {}) {
  console.log(`\n== ${name}: node eval/${script} ${extra.join(' ')}`);
  const r = spawnSync(process.execPath, [join(EVAL, script), ...extra], { stdio: 'inherit' });
  if (r.status !== 0) { console.error(`stage ${name} exited ${r.status}`); if (required) process.exit(r.status || 1); return false; }
  return true;
}

function dirtyCells() {
  return listCells(DEFAULT_RUNS, { brief: args.brief, arm: cellFilter[1] })
    .filter((c) => { const s = readJson(join(c.dir, 'score.json')); return s && s.deck && !s.strictClean; }).length;
}

pick(loadBriefs(), args.brief, 'brief'); // fail fast on an unknown id
if (!args['skip-gen']) stage('generate', 'gen-cli.mjs', [...genFlags, ...force, ...dry]);
stage('render', 'render-cells.mjs', [...cellFilter, ...force, ...dry]);
stage('score', 'score.mjs', [...cellFilter, ...force, ...dry]);

const rounds = Number(args.repair || 0);
for (let r = 1; r <= rounds; r++) {
  if (!args['dry-run']) { const n = dirtyCells(); if (!n) { console.log(`\nrepair: every cell is strict-clean, stopping before round ${r}`); break; } console.log(`\n-- repair round ${r}/${rounds}: ${n} cell(s) not strict-clean`); }
  if (!stage(`repair ${r}`, 'gen-cli.mjs', [...genFlags, '--repair-round', String(r), ...dry], { required: false })) break;
  stage(`re-render ${r}`, 'render-cells.mjs', [...cellFilter, '--force', ...dry]);
  stage(`re-score ${r}`, 'score.mjs', [...cellFilter, '--force', ...dry]);
  if (args['dry-run']) break;
}

if (args['skip-judge']) console.log('\n== judge: skipped');
else stage('judge', 'judge.mjs', [...cellFilter, ...pass('judge-model').map((x) => (x === '--judge-model' ? '--model' : x)), ...(args['use-api-key'] ? ['--use-api-key'] : []), ...(args.force ? ['--force'] : []), ...dry], { required: false });

if (args['dry-run']) console.log('\n== report: node eval/report.mjs (skipped in dry run)');
else stage('report', 'report.mjs', []);
console.log(`\nmatrix ${args['dry-run'] ? 'dry run ' : ''}complete; gallery: python3 eval/serve.py`);
