#!/usr/bin/env node
// Render: each cell's deck -> runs/<brief>/<cell>/render/{deck.pdf,page-NN.png,sheet.png}, plus
// _shots/<brief>-<cell>-{cover,sheet}.png for the gallery. Uses the skill's render.mjs and
// test/sheet.py (Pillow), so the judge and the report see the deck as the engine renders it.
//
//   node eval/render-cells.mjs [--brief id] [--arm id] [--force] [--dry-run]
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { DEFAULT_RUNS, DEFAULT_SHOTS, SCRIPTS, SHEET_PY, findDeck, listCells, parseArgs } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['force', 'dry-run']);
const RUNS = args['runs-dir'] || DEFAULT_RUNS, SHOTS = args['shots-dir'] || DEFAULT_SHOTS;
let n = 0;
for (const c of listCells(RUNS, args)) {
  const deck = findDeck(c.work), out = join(c.dir, 'render'), sheet = join(out, 'sheet.png');
  if (!deck) { console.log(`skip  ${c.brief}/${c.cell} (no deck)`); continue; }
  if (existsSync(sheet) && !args.force) { console.log(`skip  ${c.brief}/${c.cell} (rendered; --force to redo)`); continue; }
  const cmds = [[process.execPath, join(SCRIPTS, 'render.mjs'), deck, '--out', out], ['python3', SHEET_PY, out, sheet, '4']];
  if (args['dry-run']) { console.log(`would render ${c.brief}/${c.cell}: ${cmds.map((x) => x.join(' ')).join(' && ')}`); continue; }
  rmSync(out, { recursive: true, force: true });
  let ok = true;
  for (const [bin, ...rest] of cmds) {
    const r = spawnSync(bin, rest, { encoding: 'utf8', timeout: 300000 });
    if (r.status !== 0) { ok = false; console.log(`fail  ${c.brief}/${c.cell}: ${bin} ${rest[0]} -> ${(r.stderr || r.error?.message || '').trim().slice(0, 300)}`); break; }
  }
  if (!ok) continue;
  mkdirSync(SHOTS, { recursive: true });
  copyFileSync(sheet, join(SHOTS, `${c.brief}-${c.cell}-sheet.png`));
  const first = readdirSync(out).filter((f) => /^page-\d+\.png$/.test(f)).sort()[0];
  if (first) copyFileSync(join(out, first), join(SHOTS, `${c.brief}-${c.cell}-cover.png`));
  n++;
  console.log(`done  ${c.brief}/${c.cell}`);
}
console.log(`rendered ${n} cell(s)`);
