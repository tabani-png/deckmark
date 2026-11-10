import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decodePng, palette, tokens, ratio, hex, hsl, brandFrom } from '../../skills/deckmark/scripts/brand.mjs';
import { FX, png, withTmp } from './helpers.mjs';

const NAVY = [12, 28, 64], RED = [200, 32, 44], WHITE = [255, 255, 255], GREY = [40, 40, 44];
const hue = (h) => hsl([1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)))[0];

test('decodePng reads the size and pixels of an RGB PNG', () => {
  const im = decodePng(png(4, 3, (x, y) => (x === 0 && y === 0 ? RED : WHITE)));
  assert.equal(im.w, 4); assert.equal(im.h, 3);
  assert.deepEqual(im.rgb(0), [...RED, 255]);
  assert.deepEqual(im.rgb(5), [...WHITE, 255]);
  assert.throws(() => decodePng(Buffer.from('not a png at all')), /not a PNG/);
});

test('the fixture deck: white paper, navy field, red accent, every pair at its contrast floor', () => {
  const r = brandFrom([join(FX, 'brand.png')]);
  assert.equal(hex(r.palette.paper), '#ffffff');
  assert.ok(Math.abs(hue(r.tokens['--field']) - 222) < 20, r.tokens['--field']);
  assert.ok(hue(r.tokens['--accent']) < 15 || hue(r.tokens['--accent']) > 345, r.tokens['--accent']);
  assert.ok(r.check['ink on paper'] >= 7);
  assert.ok(r.check['muted on paper'] >= 4.5);
  assert.ok(r.check['accent text on paper'] >= 4.5);
  assert.ok(r.check['accent fill on paper'] >= 3);
  assert.match(r.css, /:root\{/);
});

test('a red accent used only as thin rules on navy and white is still the accent', () => withTmp((d) => {
  const f = join(d, 'thin.png');
  writeFileSync(f, png(800, 450, (x, y) => {
    if (x < 240) return NAVY;
    if (y === 60 && x >= 280 && x < 760) return RED;
    if (x >= 280 && x < 284 && y >= 120 && y < 150) return RED;
    if (y >= 90 && y < 100 && x >= 280 && x < 600) return GREY;
    return WHITE;
  }));
  const r = brandFrom([f]);
  assert.ok(Math.abs(hue(r.tokens['--field']) - 222) < 20, `field ${r.tokens['--field']}`);
  const ah = hue(r.tokens['--accent']);
  assert.ok(ah < 15 || ah > 345, `accent ${r.tokens['--accent']} should be the red rule, not navy`);
  assert.notEqual(r.tokens['--field'], r.tokens['--accent']);
}));

test('anti-aliased blends of navy and red do not win the accent over the red itself', () => withTmp((d) => {
  const f = join(d, 'blend.png');
  writeFileSync(f, png(600, 400, (x, y) => {
    if (y < 120) return NAVY;
    if (y === 120 && x % 7 === 0) return [100, 30, 54];   // a few blended edge pixels
    if (y >= 121 && y < 123) return RED;
    return WHITE;
  }));
  const r = brandFrom([f]);
  assert.equal(r.tokens['--accent'], hex(RED));
}));

test('a deck with one brand colour uses it for both roles, and tokens stay legible', () => {
  const p = palette([decodePng(png(300, 200, (x) => (x < 100 ? NAVY : WHITE)))]);
  const t = tokens(p);
  assert.ok(ratio([255, 255, 255], [parseInt(t.tokens['--field'].slice(1, 3), 16), parseInt(t.tokens['--field'].slice(3, 5), 16), parseInt(t.tokens['--field'].slice(5, 7), 16)]) >= 4.5);
  assert.ok(t.check['ink on paper'] >= 7);
});

test('the shipped brand.png fixture decodes', () => {
  const im = decodePng(readFileSync(join(FX, 'brand.png')));
  assert.ok(im.w > 100 && im.h > 50);
});

test('website input: URL detection and the first named font family', async () => {
  const { isUrl, firstFamily } = await import('../../skills/deckmark/scripts/brand.mjs');
  assert.ok(isUrl('https://example.com')); assert.ok(isUrl('http://x.io/a'));
  assert.ok(!isUrl('deck.pdf')); assert.ok(!isUrl('/tmp/https.png'));
  assert.equal(firstFamily('"Montserrat", sans-serif'), 'Montserrat');
  assert.equal(firstFamily("'Open Sans',Arial"), 'Open Sans');
  assert.equal(firstFamily('sans-serif'), null);
  assert.equal(firstFamily('-apple-system, BlinkMacSystemFont'), null);
});

test('two dark brand colours: the one with more area is the field, the other the accent', () => {
  const BLUE = [19, 68, 125], OXBLOOD = [153, 0, 0], PAPER = [250, 250, 250];
  const im = decodePng(png(400, 300, (x, y) => (y < 90 ? BLUE : y < 96 && x < 200 ? OXBLOOD : y > 260 && x < 60 ? OXBLOOD : y > 120 && y < 124 ? GREY : PAPER)));
  const t = tokens(palette([im]));
  assert.ok(Math.abs(hue(t.tokens['--field']) - hsl(BLUE)[0]) < 15, t.tokens['--field']);
  assert.ok(hue(t.tokens['--accent']) < 15 || hue(t.tokens['--accent']) > 345, t.tokens['--accent']);
});
