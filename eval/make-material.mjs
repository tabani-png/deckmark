#!/usr/bin/env node
// Rebuild the binary material from its HTML source with the skill's own renderer:
//   briefs/restyle-client-deck/src/marlow-q3-board.html -> material/marlow-q3-board.pdf
//   briefs/pitch-brand/src/brand-sheet.html             -> material/brand.png
// The outputs are committed; run this only after editing a source.  node eval/make-material.mjs
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EVAL, SCRIPTS } from './lib/common.mjs';

const { render } = await import(join(SCRIPTS, 'render.mjs'));
const jobs = [
  { src: 'restyle-client-deck/src/marlow-q3-board.html', pick: (r) => r.pdf, out: 'restyle-client-deck/material/marlow-q3-board.pdf' },
  { src: 'pitch-brand/src/brand-sheet.html', pick: (r) => r.shots[0], out: 'pitch-brand/material/brand.png' },
];
for (const j of jobs) {
  const tmp = mkdtempSync(join(tmpdir(), 'deckmark-material-'));
  try {
    const r = await render(join(EVAL, 'briefs', j.src), tmp);
    copyFileSync(j.pick(r), join(EVAL, 'briefs', j.out));
    console.log(`${j.src} -> ${j.out} (${r.count} page${r.count === 1 ? '' : 's'})`);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
