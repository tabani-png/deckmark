// A re-deal walks through the catalog without repeating a theme, and stops cleanly when it runs out.
import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { run, withTmp } from './helpers.mjs';

const deal = (d, reroll, n = 3) => run('theme.mjs', ['deal', '--field', 'consulting', '--prompt', 'strategy deck for a freight carrier', '--reroll', String(reroll), '--n', String(n), '--json', '--log', join(d, 'log.json')], { cwd: d, timeout: 5000 });

for (const n of [1, 3]) {
  test(`an exhausted catalog terminates even at a billion rerolls, hand of ${n}`, () => withTmp((d) => {
    const r = deal(d, 1_000_000_000, n);
    assert.ifError(r.error);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stderr, /nothing left to deal at reroll 1000000000/);
    assert.equal(r.stdout, '');
  }));
}

test('consecutive rerolls never repeat a theme until the catalog is spent', () => withTmp((d) => {
  const seen = new Set(); let r = 0;
  for (;; r++) {
    const res = deal(d, r);
    if (res.status !== 0) { assert.match(res.stderr, /nothing left to deal/); break; }
    const hand = JSON.parse(res.stdout).deal.map((t) => t.slug);
    assert.ok(hand.length >= 1 && hand.length <= 3);
    for (const s of hand) { assert.ok(!seen.has(s), `reroll ${r} repeats ${s}`); seen.add(s); }
  }
  assert.ok(r >= 3, `only ${r} hands before exhaustion`);
  assert.ok(seen.size >= 10, `only ${seen.size} themes dealt`);
}));
