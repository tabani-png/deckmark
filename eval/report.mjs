#!/usr/bin/env node
// Report: eval/index.html, a static gallery of every cell (row per brief, card per arm) with the
// per-arm summary on top. Reads briefs.json, models.json, runs/*/*/{run,score,judge}.json, _shots/.
//
//   node eval/report.mjs [--out eval/index.html]
import { existsSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DEFAULT_RUNS, DEFAULT_SHOTS, EVAL, isMain, listCells, loadBriefs, loadModels, parseArgs, readJson } from './lib/common.mjs';
import { armOf, renderReport } from './lib/report.mjs';

export function collect(runs, shots, outDir) {
  const armIds = loadModels().arms.map((a) => a.id);
  const rel = (p) => (existsSync(p) ? `./${relative(outDir, p)}` : null);
  return listCells(runs).map((c) => ({
    brief: c.brief, cell: c.cell, armId: armOf(c.cell, armIds),
    run: readJson(join(c.dir, 'run.json')), score: readJson(join(c.dir, 'score.json')), judge: readJson(join(c.dir, 'judge.json')),
    cover: rel(join(shots, `${c.brief}-${c.cell}-cover.png`)),
    sheet: rel(join(shots, `${c.brief}-${c.cell}-sheet.png`)),
    pdf: rel(join(c.dir, 'render', 'deck.pdf')),
  }));
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const out = args.out || join(EVAL, 'index.html');
  const cells = collect(args['runs-dir'] || DEFAULT_RUNS, args['shots-dir'] || DEFAULT_SHOTS, join(out, '..'));
  writeFileSync(out, renderReport({ briefs: loadBriefs(), cells }));
  console.log(`wrote ${out} (${cells.length} cells); browse with: python3 eval/serve.py`);
}
