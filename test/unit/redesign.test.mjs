import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { deflateRawSync } from 'node:zlib';
import { figuresIn, readZip, readDeck, record, draftFacts, kept, audit } from '../../skills/deckmark/scripts/redesign.mjs';
import { run, tmp, makeDeck, slide } from './helpers.mjs';

// A minimal zip writer (deflate) for a synthetic PPTX.
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(files) {
  const locals = [], centrals = []; let off = 0;
  for (const [name, text] of Object.entries(files)) {
    const data = Buffer.from(text), comp = deflateRawSync(data), nm = Buffer.from(name), crc = crc32(data);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nm.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(8, 10); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, nm, comp); centrals.push(ch, nm); off += 30 + nm.length + comp.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}
const P = (t) => `<a:p><a:r><a:t>${t}</a:t></a:r></a:p>`;

test('figuresIn: currency, units, negatives and ranges; years, small counts and page numbers skipped', () => {
  const f = figuresIn('Revenue $48.3M in 2025, up 8.9% on (2.1) cost; 3 sites; 4.1x leverage; 1,338.8 total; $500MM+ pipeline', { page: 7 });
  assert.deepEqual(f.map((x) => x.text), ['$48.3M', '8.9%', '(2.1)', '4.1x', '1,338.8', '$500MM+']);
  assert.equal(f.find((x) => x.text === '(2.1)').value, -2.1);
  assert.equal(figuresIn('page 7 of the deck', { page: 7 }).length, 0);
  assert.deepEqual(figuresIn('in 1990, he joined').map((x) => x.text), []);
});

test('readZip and the PPTX reader: slide text in order and chart values as figures', () => {
  const d = tmp(), f = join(d, 'old.pptx');
  writeFileSync(f, zip({
    'ppt/slides/slide2.xml': `<p:sld>${P('Market grows to $85.2B by 2037')}${P('A 10.1% CAGR')}</p:sld>`,
    'ppt/slides/slide1.xml': `<p:sld>${P('Project Harbor')}${P('A $15MM note &amp; 15% coupon')}</p:sld>`,
    'ppt/slides/_rels/slide2.xml.rels': '<Relationships><Relationship Target="../charts/chart1.xml"/></Relationships>',
    'ppt/charts/chart1.xml': '<c:chart><c:val><c:numRef><c:numCache><c:pt><c:v>24.4</c:v></c:pt><c:pt><c:v>85.2</c:v></c:pt></c:numCache></c:numRef></c:val></c:chart>',
  }));
  assert.ok(readZip(readFileSync(f)).has('ppt/charts/chart1.xml'));
  const deck = readDeck(f);
  assert.equal(deck.kind, 'pptx');
  assert.equal(deck.pages.length, 2);
  assert.equal(deck.pages[0].lines[0], 'Project Harbor');
  assert.match(deck.pages[0].text, /\$15MM note & 15% coupon/);
  const rec = record(f, deck);
  assert.deepEqual(rec.pages[1].figures.map((x) => x.display), ['85.2', '10.1', '24.4', '85.2']);
});

test('HTML extract, draft facts and the kept check: pass, a lost figure FAILs, a dropped one with a reason passes', () => {
  const d = tmp();
  const old = makeDeck(d, [slide({ arch: 'a', title: 'Revenue reached $48.3M in FY25, up 8.9% on contract wins', body: '<p>Backlog was 1,204 units and churn 2.5%.</p>' })]);
  const rec = record(old.file, readDeck(old.file));
  assert.deepEqual(rec.pages[0].figures.map((f) => f.display), ['48.3', '8.9', '1,204', '2.5']);
  const facts = draftFacts(rec);
  assert.equal(Object.keys(facts.facts).length, 4);
  assert.equal(facts.facts.p01_01.source, 'deck.html p1');
  const keep = '<section class="slide"><p>$<span data-fact="rev">48.3</span>M up <span>8.9</span>%; backlog 1,204; churn 2.5%</p></section>';
  assert.equal(kept(rec, keep).ok, true);
  const lost = kept(rec, '<p>$48.3M up 8.9%</p>');
  assert.equal(lost.ok, false);
  assert.deepEqual(lost.lost.map((l) => l.figure), ['1,204', '2.5%']);
  const dropped = kept(rec, '<p>$48.3M up 8.9%</p>', null, [{ figure: '1,204', page: 1, reason: 'operational detail moved out' }, { figure: '2.5', reason: 'churn on appendix' }]);
  assert.equal(dropped.ok, true);
  assert.equal(dropped.dropped.length, 2);
  assert.equal(kept(rec, '<p>$48.3M up 8.9%</p>', null, [{ figure: '1,204', reason: 'x' }, { figure: '2.5', reason: 'y' }]).ok, false, 'a one-word reason is not a reason');
  assert.equal(kept(rec, '<p>nothing</p>', { facts: { a: { value: 48.3, display: '48.3' }, b: { value: 8.9 }, c: { value: 1204, display: '1,204' }, d: { value: 2.5 } } }).ok, true, 'facts.json counts');
});

test('audit flags wordy pages, figures with no source line and topic titles', () => {
  const rec = { source: 'x.pdf', kind: 'pdf', pages: [
    { n: 1, title: 'Cover', words: 5, figures: [], source_line: false, lines: [], text: '' },
    { n: 2, title: 'Market overview', words: 150, figures: [{ text: '$5M' }], source_line: false, lines: [], text: '' },
    { n: 3, title: 'Revenue grew 8.9% a year on contract wins and pricing', words: 40, figures: [{ text: '8.9%' }], source_line: true, lines: [], text: '' },
  ] };
  const a = audit(rec, 80);
  assert.equal(a.flagged, 1);
  assert.equal(a.rows[1].flags.length, 3);
  assert.deepEqual(a.rows[2].flags, []);
});

test('CLI: extract writes the record, draft facts, storyboard and before images; kept and audit run', { timeout: 120000 }, () => {
  const d = tmp();
  const old = makeDeck(d, [slide({ arch: 'a', title: 'Revenue reached $48.3M in FY25, up 8.9% on contract wins', body: '<p>Backlog 1,204 units.</p>' }), slide({ arch: 'b', title: 'Margin widened to 16.2% as pricing held through the year', body: '<p>EBITDA $7.8M.</p>' })]);
  const out = join(d, '.deckmark', 'redesign');
  const r = run('redesign.mjs', ['extract', old.file, '--out', out], { cwd: d });
  assert.equal(r.status, 0, r.stderr);
  for (const f of ['record.json', 'facts.draft.json', 'STORYBOARD.draft.md', 'dropped.json']) assert.ok(existsSync(join(out, f)), f);
  assert.deepEqual(readdirSync(join(out, 'before')).sort(), ['page-01.png', 'page-02.png']);
  assert.match(readFileSync(join(out, 'STORYBOARD.draft.md'), 'utf8'), /^02 · in progress · Margin widened/m);
  const pass = run('redesign.mjs', ['kept', join(out, 'record.json'), old.file], { cwd: d });
  assert.equal(pass.status, 0, pass.stdout);
  const fresh = join(d, 'new.html'); writeFileSync(fresh, '<p>$48.3M</p>');
  const fail = run('redesign.mjs', ['kept', join(out, 'record.json'), fresh], { cwd: d });
  assert.equal(fail.status, 1);
  assert.match(fail.stdout, /FAIL kept/);
  const au = run('redesign.mjs', ['audit', old.file], { cwd: d });
  assert.equal(au.status, 0);
  assert.match(au.stdout, /decklint/);
  const cmp = run('redesign.mjs', ['compare', join(out, 'before'), join(out, 'before'), '--out', join(d, 'compare.html')], { cwd: d });
  assert.equal(cmp.status, 0);
  assert.match(readFileSync(join(d, 'compare.html'), 'utf8'), /page-02\.png/);
});

const hasPoppler = spawnSync('pdftotext', ['-v']).status === 0;
test('CLI: a PDF source is read page by page with pdftotext', { skip: hasPoppler ? false : 'poppler not installed', timeout: 120000 }, () => {
  const d = tmp();
  const old = makeDeck(d, [slide({ arch: 'a', title: 'Revenue reached $48.3M in FY25, up 8.9% on contract wins', body: '<p>Backlog 1,204 units.</p>' }), slide({ arch: 'b', title: 'Margin widened to 16.2% as pricing held through the year' })]);
  assert.equal(run('render.mjs', [old.file, '--out', join(d, 'pdf')]).status, 0);
  const pdf = join(d, 'pdf', 'deck.pdf');
  const rec = record(pdf, readDeck(pdf));
  assert.equal(rec.kind, 'pdf');
  assert.equal(rec.pages.length, 2);
  assert.ok(rec.pages[0].figures.some((f) => f.display === '48.3'));
  assert.ok(rec.pages[1].figures.some((f) => f.display === '16.2'));
  const r = run('redesign.mjs', ['extract', pdf, '--out', join(d, 'r')], { cwd: d });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(readdirSync(join(d, 'r', 'before')).includes('page-01.png'));
});

test('extract refuses to write inside the skill folder and rejects unknown formats', () => {
  const d = tmp(); const f = join(d, 'x.key'); writeFileSync(f, 'x');
  const r = run('redesign.mjs', ['extract', f, '--out', join(d, 'o')], { cwd: d });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /reads \.pdf, \.pptx or \.html/);
});
