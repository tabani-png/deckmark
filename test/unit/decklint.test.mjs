// Each decklint rule on a tiny fixture. The static tier runs on strings in a temp folder; the render
// tier builds one deck of small slides, renders it once in Chromium, and checks each slide's rule.
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { staticTier, checkFormulas, parseWords, deckBudget, lint, RULES } from '../../skills/deckmark/scripts/decklint.mjs';
import { chart } from '../../skills/deckmark/scripts/charts.mjs';
import { tmp, makeDeck, slide } from './helpers.mjs';

const at = (r, rule, n, grade) => r.findings.some((f) => f.rule === rule && f.slide === n && (!grade || f.grade === grade));
const page = (body, head = '') => `<!doctype html><html><head>${head}</head><body><main class="deck"><section class="slide" data-archetype="x">${body}</section></main></body></html>`;
const staticOn = (html) => { const d = tmp(); const f = join(d, 'deck.html'); writeFileSync(f, html); return staticTier(f); };
const rules = (st) => new Set(st.findings.map((f) => f.rule));

test('static: literal colours in a style block, an inline style and an SVG attribute FAIL', () => {
  const st = staticOn(page('<p style="color: #c00">x</p><svg><rect fill="red"/></svg>', '<style>.x { background: rgb(1,2,3); }</style>'));
  assert.equal(st.findings.filter((f) => f.rule === 'literal-colour').length, 3);
});

test('static: a token block at :root is allowed; var() is never a literal', () => {
  const st = staticOn(page('<p style="color: var(--ink); box-shadow: 0 1px 2px var(--rule)">x</p>', '<style>:root { --x: #123456; --y: oklch(50% 0.1 20); }</style>'));
  assert.ok(!rules(st).has('literal-colour'));
});

test('static: a literal font-family FAILs, a token font does not', () => {
  assert.ok(rules(staticOn(page('<p style="font-family: Arial">x</p>'))).has('literal-font'));
  assert.ok(!rules(staticOn(page('<p style="font-family: var(--font-body)">x</p>'))).has('literal-font'));
});

test('static: emoji is caught; a file with no slides is an overflow FAIL', () => {
  assert.ok(rules(staticOn(page('<p>Growth \u{1F680}</p>'))).has('emoji'));
  assert.ok(rules(staticOn('<html><body><p>no slides</p></body></html>')).has('overflow'));
});

test('static: waivers are read per slide and deck-wide', () => {
  const st = staticOn(`<html><head><style>/* waive: accent-colours client brand uses three */</style></head><body><section class="slide"><!-- waive: wordy safe harbour text verbatim --></section><section class="slide"></section></body></html>`);
  assert.deepEqual(st.waivers.map((w) => [w.rule, w.slide]), [['accent-colours', null], ['wordy', 1]]);
});

test('formulas recompute within rounding; a wrong one, a missing id and bad characters FAIL', () => {
  const ok = checkFormulas({ facts: { a: { value: 10 }, b: { value: 4 }, m: { value: 40.0, display: '40.0', formula: 'b / a * 100' }, c: { value: 20.1, display: '20.1', formula: '((a / b) ^ (1 / 5) - 1) * 100' } } });
  assert.deepEqual(ok, []);
  const bad = checkFormulas({ facts: { a: { value: 10 }, m: { value: 41, display: '41', formula: 'a * 4' }, n: { value: 1, formula: 'zz + 1' }, o: { value: 1, formula: 'a; process.exit()' } } });
  assert.equal(bad.length, 3);
});

test('the Words line parses; the budget comes from the body, then the stamp, then the default', () => {
  assert.deepEqual(parseWords('**Words.** 16:9 target 40-60, cap 80 · A4 cap 300 · no prose tables.'), { cap: 80, target: '40-60', lean: true });
  assert.equal(parseWords('**Words.** 16:9 target 40-60, cap 80 · A4 cap 300', 'report-a4').cap, 300);
  assert.equal(parseWords('nothing'), null);
  assert.equal(deckBudget('<body data-words-cap="55">').cap, 55);
  assert.equal(deckBudget('<!-- Deckmark · storyline: cim --><body>').cap, 160);
  assert.equal(deckBudget('<body data-format="report-a4">').cap, 350);
});

test('every rule decklint names has a tier', () => {
  for (const [k, [tier, why]] of Object.entries(RULES)) { assert.match(tier, /^(FAIL|REFLEX)$/, k); assert.ok(why.length > 10, k); }
});

test('render tier: each rule fires on its slide, the control slide is clean', { timeout: 120000 }, async () => {
  const d = tmp();
  const bars = chart('bar', { categories: ['FY22', 'FY23', 'FY24', 'FY25'], values: [40.1, 43.6, 45.9, 48.3], width: 1164, height: 420, fmt: { dp: 1 } });
  const bar = `<figure class="exhibit">${bars}</figure><p class="takeaway-bar">Each year added more than the one before.</p>`;
  const long = Array.from({ length: 140 }, (_, i) => ['contract', 'pricing', 'volume', 'customers', 'renewals'][i % 5]).join(' ');
  const S = [
    /* 1 control */ slide({ arch: 'chart-takeaway', body: bar }),
    /* 2 source */ slide({ arch: 'ranked-bar', body: bar, source: '' }),
    /* 3 title */ slide({ arch: 'stacked-bar', title: 'Revenue', body: bar }),
    /* 4 tieout */ slide({ arch: 'marimekko', body: `${bar}<p>Revenue was $<span data-fact="rev">9.9</span>M.</p>` }),
    /* 5 untraced */ slide({ arch: 'comps-table', body: `${bar}<p>Backlog reached 4,321 units.</p>` }),
    /* 6 totals */ slide({ arch: 'cap-table', body: `<table class="data"><tbody><tr data-part><td>A</td><td class="num">1.0</td></tr><tr data-part><td>B</td><td class="num">2.0</td></tr><tr data-total><td>Total</td><td class="num">4.0</td></tr></tbody></table>${bar}` }),
    /* 7 sources-uses */ slide({ arch: 'sources-uses', body: `<div class="sources-uses"><table class="data" data-sources><tbody><tr><td>Loan</td><td class="num">10.0</td></tr></tbody></table><table class="data" data-uses><tbody><tr><td>Price</td><td class="num">12.0</td></tr></tbody></table></div>${bar}` }),
    /* 8 min-font */ slide({ arch: 'map', body: `${bar}<p style="font-size: 8px">Tiny print nobody can read on a phone.</p>` }),
    /* 9 contrast */ slide({ arch: 'org-chart', body: `${bar}<p style="color: var(--paper)">Text in the paper colour cannot be read.</p>` }),
    /* 10 overflow */ slide({ arch: 'timeline-gantt', body: `${bar}<p style="width: 80px; white-space: nowrap">This sentence is far wider than the box it sits in.</p>` }),
    /* 11 empty-slide */ slide({ arch: 'quote-callout', body: '<p>One short line.</p>' }),
    /* 12 dead-band */ slide({ arch: 'col-row', body: '<div class="col-row" style="--cols: 3; flex: none"><div class="cr-col"><span class="cr-head">A</span><span class="cr-fig">15%</span><span class="cr-label">rate</span></div><div class="cr-col"><span class="cr-head">B</span><span class="cr-fig">$75M</span><span class="cr-label">pipeline</span></div><div class="cr-col"><span class="cr-head">C</span><span class="cr-fig">$0</span><span class="cr-label">capex</span></div></div><p class="takeaway-bar" style="margin-top: auto">The ask is one line at the foot.</p>', attrs: 'data-src-ok' }),
    /* 13 stretched-rows */ slide({ arch: 'covenant-table', body: `<table class="data"><tbody><tr style="height: 140px"><td>Leverage</td><td class="num">4.1x</td></tr><tr style="height: 140px"><td>Cover</td><td class="num">2.2x</td></tr></tbody></table>` }),
    /* 14 stat-only */ slide({ arch: 'kpi-strip', body: '<div class="kpi-strip" style="--kpis: 2"><div class="kpi"><span class="kpi-value">4.6x</span><span class="kpi-label">Net leverage</span></div><div class="kpi"><span class="kpi-value">22%</span><span class="kpi-label">Margin</span></div></div>' }),
    /* 15 numbered-cards */ slide({ arch: 'matrix-2x2', body: `<div class="grid-12"><div class="span-4"><h4>Point 1</h4></div><div class="span-4"><h4>Point 2</h4></div><div class="span-4"><h4>Point 3</h4></div></div>${bar}` }),
    /* 16 gap-sprawl */ slide({ arch: 'financial-summary-table', body: `<table class="data"><tbody><tr><td>Revenue</td><td>n/a</td><td>n/a</td><td>n/a</td></tr></tbody></table>${bar}` }),
    /* 17 wordy */ slide({ arch: 'memo-page', body: `<p class="body-copy">${long}</p>` }),
    /* 18 bullets */ slide({ arch: 'rag-tracker', body: `<ul>${'<li>an item</li>'.repeat(8)}</ul>` }),
    /* 19 centred-text, no-exhibit */ slide({ arch: 'two-column-compare', body: `<p style="text-align: center">${'centred body text that runs long enough to be read as a paragraph '.repeat(2)}</p>` }),
    /* 20 archetype-repeat */ slide({ arch: 'two-column-compare', body: bar }),
    /* 21 chart-shadow */ slide({ arch: 'football-field', body: bar.replace('<figure class="exhibit">', '<figure class="exhibit" style="box-shadow: 0 2px 6px var(--ink)">') }),
    /* 22 accent-colours, gradient */ slide({ arch: 'harvey-table', body: `${bar}<div style="display: flex; gap: 8px"><span style="background: var(--t-a); width: 40px; height: 20px"></span><span style="background: var(--t-b); width: 40px; height: 20px"></span><span style="background: var(--t-c); width: 40px; height: 20px"></span><span style="background-image: linear-gradient(90deg, var(--t-p), var(--t-b)); width: 80px; height: 20px"></span></div>` }),
    /* 23 overlap */ slide({ arch: 'issue-tree', body: `${bar}<div style="position: relative; height: 30px"><p style="position: absolute; top: 0; left: 0">Two labels on one spot</p><p style="position: absolute; top: 2px; left: 10px">Two labels on one spot</p></div>` }),
  ];
  const deck = makeDeck(d, S, { style: ':root { --t-a: #c0392b; --t-b: #1f5fa8; --t-c: #2e8b57; --t-p: #7b2fbf; }', facts: { rev: { value: 1.0, display: '1.0', source: 'test' }, f40: { value: 40.1, display: '40.1' }, f43: { value: 43.6, display: '43.6' }, f45: { value: 45.9, display: '45.9' }, f48: { value: 48.3, display: '48.3' } } });
  const r = await lint(deck.file, { render: true, facts: deck.facts });
  const want = [['source', 2], ['title-length', 3], ['tieout', 4], ['untraced', 5], ['totals', 6], ['sources-uses', 7], ['min-font', 8], ['contrast', 9], ['overflow', 10], ['empty-slide', 11], ['dead-band', 12], ['stretched-rows', 13], ['stat-only', 14], ['numbered-cards', 15], ['gap-sprawl', 16], ['wordy', 17], ['bullets', 18], ['centred-text', 19], ['no-exhibit', 19], ['archetype-repeat', 20], ['chart-shadow', 21], ['accent-colours', 22], ['gradient', 22], ['overlap', 23]];
  const missing = want.filter(([rule, n]) => !at(r, rule, n));
  assert.deepEqual(missing, [], JSON.stringify(r.findings.filter((f) => f.grade !== 'NOTE').map((f) => [f.slide, f.rule, f.msg.slice(0, 60)]), null, 1));
  const control = r.findings.filter((f) => f.slide === 1 && f.grade !== 'NOTE');
  assert.deepEqual(control, []);
  assert.equal(r.ok, false);
});

test('render tier: prose-table and the lean takeaway rule in a lean deck', { timeout: 120000 }, async () => {
  const d = tmp();
  const prose = 'a long explanatory paragraph in a table cell that reads like a memo rather than a number and keeps going on';
  const bars = chart('bar', { categories: ['A', 'B'], values: [1.5, 2.5], width: 700, height: 420 });
  const S = [
    slide({ arch: 'data', body: `<table class="data"><tbody><tr><td>One</td><td>${prose}</td></tr><tr><td>Two</td><td>${prose}</td></tr></tbody></table><p class="takeaway-bar">Line.</p>` }),
    slide({ arch: 'chart-takeaway', body: `<div class="chart-takeaway"><figure class="exhibit">${bars}</figure><aside class="takeaway"><h3>Read</h3><ul><li>one</li><li>two</li><li>three</li><li>four</li></ul></aside></div>` }),
  ];
  const deck = makeDeck(d, S, { body: 'data-words-cap="80" data-lean' });
  const r = await lint(deck.file, { render: true });
  assert.ok(at(r, 'prose-table', 1), JSON.stringify(r.findings));
  assert.ok(at(r, 'wordy', 2), JSON.stringify(r.findings));
});

test('a waiver with a reason turns a Reflex into WAIVED; a waiver on a FAIL is rejected', { timeout: 120000 }, async () => {
  const d = tmp();
  const S = [slide({ arch: 'rag-tracker', body: `<!-- waive: bullets the client's list is verbatim --><!-- waive: source not needed here --><ul>${'<li>an item</li>'.repeat(8)}</ul>${chart('bar', { categories: ['A', 'B'], values: [1.5, 2.5], width: 1164, height: 400 })}`, source: '' })];
  const deck = makeDeck(d, S);
  const r = await lint(deck.file, { render: true });
  assert.ok(at(r, 'bullets', 1, 'WAIVED'));
  assert.ok(at(r, 'source', 1, 'FAIL'));
  assert.ok(r.findings.some((f) => f.rule === 'waive' && /FAIL rules are fixed/.test(f.msg)));
});
