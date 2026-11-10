import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chart, fmt, TYPES } from '../../skills/deckmark/scripts/charts.mjs';
import { FX } from './helpers.mjs';

const labels = (svg) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
const noLiteral = (svg) => !/(fill|stroke)="#|style="[^"]*(#[0-9a-f]{3}|rgb)/i.test(svg);

test('every fixture chart renders an SVG in tokens (no literal colours)', () => {
  for (const f of readdirSync(join(FX, 'charts'))) {
    const type = f.replace(/\.json$/, '');
    const svg = chart(type, JSON.parse(readFileSync(join(FX, 'charts', f), 'utf8')));
    assert.match(svg, /^<svg[^>]*class="dm-chart/, type);
    assert.ok(noLiteral(svg), `${type} has a literal colour`);
  }
});

test('fmt: decimals, prefix and suffix, negatives in parentheses or with a minus, signed deltas', () => {
  assert.equal(fmt(1234.5, { dp: 1, prefix: '$' }), '$1,234.5');
  assert.equal(fmt(-12.4, { dp: 1 }), '(12.4)');
  assert.equal(fmt(-12.4, { dp: 1, negParens: false }), '-12.4');
  assert.equal(fmt(3.1, { dp: 1 }, true), '+3.1');
  assert.equal(fmt(15, { suffix: '%' }), '15%');
});

test('labels take the most decimals in the data when fmt.dp is unset', () => {
  const svg = chart('bridge', { steps: [{ label: 'Start', value: 13, total: true }, { label: 'Add', value: 0.9 }, { label: 'End', value: 13.9, total: true }] });
  assert.ok(labels(svg).includes('13.0'));
  assert.ok(labels(svg).includes('+0.9'));
});

test('stacked: a short segment keeps its value label, beside the bar (a small segment case)', () => {
  const data = { width: 600, height: 420, categories: ['Yr 1-5', '6-10', '11-15', '16-20', '21-25', '26-30'], series: [{ name: 'Lender return', values: [31.8, 27.5, 12.9, 0, 0, 0] }, { name: 'Sponsor return', values: [24.3, 33.7, 61.5, 104.2, 119.6, 138.4] }], totals: false, fmt: { dp: 1 } };
  const svg = chart('stacked', data);
  const ls = labels(svg);
  for (const v of data.series.flatMap((s) => s.values).filter((v) => v !== 0)) assert.ok(ls.includes(v.toFixed(1)), `no label for ${v}`);
});

test('stacked: in a tight chart every nonzero segment is still labelled, outside ones never under 10px', () => {
  const data = { width: 300, height: 260, categories: ['A', 'B', 'C', 'D'], series: [{ name: 'Debt', values: [2.1, 1.4, 0.6, 0.2] }, { name: 'Equity', values: [80.4, 91.2, 99.9, 120.5] }], fmt: { dp: 1 } };
  const svg = chart('stacked', data);
  const ls = labels(svg);
  for (const v of data.series.flatMap((s) => s.values)) assert.ok(ls.includes(v.toFixed(1)), `no label for ${v}`);
  for (const m of svg.matchAll(/font-size="(\d+)"/g)) assert.ok(Number(m[1]) >= 10);
});

test('stacked: bars widen so a tall segment carries its label inside', () => {
  const svg = chart('stacked', { width: 560, height: 420, categories: ['a', 'b', 'c', 'd', 'e', 'f'], series: [{ name: 'Short series name', values: [100.1, 120.2, 130.3, 140.4, 150.5, 160.6] }], fmt: { dp: 1 } });
  assert.ok(!/ch-out/.test(svg), 'tall segments should be labelled inside');
});

test('waterfall: every step labelled, deltas signed, totals plain', () => {
  const svg = chart('waterfall', { steps: [{ label: 'FY24', value: 20, total: true }, { label: 'Price', value: 3.1 }, { label: 'Cost', value: -1.2 }, { label: 'FY25', value: 21.9, total: true }] });
  const ls = labels(svg);
  for (const l of ['20.0', '+3.1', '(1.2)', '21.9']) assert.ok(ls.includes(l), l);
});

test('one highlight class per highlighted mark, and flow nodes grow with a taller box', () => {
  const svg = chart('bar', { categories: ['A', 'B', 'C'], values: [1, 2, 3], highlight: 'C' });
  assert.equal((svg.match(/class="ch-hl"/g) || []).length, 1);
  const short = chart('flow', { steps: ['a', 'b', 'c'], height: 220 }), tall = chart('flow', { steps: ['a', 'b', 'c'], height: 450 });
  const h = (s) => Number(/class="ch-node[^"]*"/.test(s) && /height="([\d.]+)" class="ch-node/.exec(s)[1]);
  assert.ok(h(tall) > h(short) + 50);
});

test('diagrams refuse step counts outside their range; unknown types throw', () => {
  assert.throws(() => chart('cycle', { steps: ['a', 'b'] }), /3 to 6/);
  assert.throws(() => chart('flow', { steps: ['a'] }), /2 to 6/);
  assert.throws(() => chart('pie', {}), /unknown chart type/);
  assert.ok(Object.keys(TYPES).includes('hbar'));
});
