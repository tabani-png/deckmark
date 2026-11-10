import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parsePages, render } from '../../skills/deckmark/scripts/render.mjs';
import { tmp, makeDeck, slide } from './helpers.mjs';

test('parsePages: ranges, lists and errors', () => {
  assert.deepEqual([...parsePages('1-3')], [1, 2, 3]);
  assert.deepEqual([...parsePages('1,4-5')], [1, 4, 5]);
  assert.equal(parsePages(null), null);
  assert.throws(() => parsePages('3-1'), /low to high/);
  assert.throws(() => parsePages('a'), /use 1-2/);
  assert.throws(() => parsePages('0'), /count from 1/);
});

test('render writes one PDF page and one PNG per slide; --pages writes PNGs only', { timeout: 120000 }, async () => {
  const d = tmp();
  const deck = makeDeck(d, [slide({ arch: 'a', body: '<p>one</p>' }), slide({ arch: 'b', body: '<p>two</p>' }), slide({ arch: 'c', body: '<p>three</p>' })]);
  const full = await render(deck.file, join(d, 'out'));
  assert.equal(full.count, 3);
  assert.ok(existsSync(full.pdf));
  const pdf = readFileSync(full.pdf, 'latin1');
  assert.equal((pdf.match(/\/Type\s*\/Page\b/g) || []).length, 3);
  const box = /MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)/.exec(pdf);
  assert.ok(Math.abs(Number(box[1]) - 960) < 2 && Math.abs(Number(box[2]) - 540) < 2, box && box[0]);
  assert.deepEqual(readdirSync(join(d, 'out')).filter((f) => f.endsWith('.png')).sort(), ['page-01.png', 'page-02.png', 'page-03.png']);
  const some = await render(deck.file, join(d, 'quick'), { pages: '2' });
  assert.equal(some.pdf, null);
  assert.deepEqual(readdirSync(join(d, 'quick')), ['page-02.png']);
  const png = readFileSync(join(d, 'quick', 'page-02.png'));
  assert.equal(png.readUInt32BE(16), 1280);
  assert.equal(png.readUInt32BE(20), 720);
});
