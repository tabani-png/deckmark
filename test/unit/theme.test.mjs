import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { run, withTmp, SKILL } from './helpers.mjs';

const THEMES = join(SKILL, 'references', 'themes');

test('check passes on every shipped theme', () => {
  const r = run('theme.mjs', ['check']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /\d+ themes · 0 failing/);
});

test('check accepts a theme with LF or CRLF line endings, and fails a broken one either way', () => withTmp((d) => {
  const src = readFileSync(join(THEMES, 'meridian.md'), 'utf8').replace(/\r\n/g, '\n');
  for (const [name, text] of [['lf', src], ['crlf', src.replace(/\n/g, '\r\n')]]) {
    const dir = join(d, name); mkdirSync(dir);
    writeFileSync(join(dir, 'meridian.md'), text);
    const ok = run('theme.mjs', ['check', '--themes', dir]);
    assert.equal(ok.status, 0, `${name}: ${ok.stdout}`);
    writeFileSync(join(dir, 'meridian.md'), text.replace(/--ink:[^;]+;/, ''));
    const bad = run('theme.mjs', ['check', '--themes', dir]);
    assert.equal(bad.status, 1, `${name}: ${bad.stdout}`);
    assert.match(bad.stdout, /lacks --ink/);
  }
}));

test('check fails a theme that names a real firm', () => withTmp((d) => {
  const src = readFileSync(join(THEMES, 'meridian.md'), 'utf8').replace(/^inspired_by:.*$/m, 'inspired_by: a Goldman pitch book');
  writeFileSync(join(d, 'meridian.md'), src);
  const r = run('theme.mjs', ['check', '--themes', d]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /names a real firm/);
}));

test('deal returns three distinct themes for the field and is stable for one prompt and project', () => withTmp((d) => {
  const deal = () => JSON.parse(run('theme.mjs', ['deal', '--field', 'credit', '--prompt', 'credit memo for a unitranche', '--json', '--log', join(d, '.deckmark', 'log.json')], { cwd: d }).stdout);
  const a = deal(), b = deal();
  assert.equal(a.deal.length, 3);
  assert.equal(new Set(a.deal.map((t) => t.slug)).size, 3);
  assert.deepEqual(a.deal.map((t) => t.slug), b.deal.map((t) => t.slug));
}));

test('deal refuses an unknown field', () => withTmp((d) => {
  const r = run('theme.mjs', ['deal', '--field', 'crypto', '--prompt', 'x', '--log', join(d, 'log.json')], { cwd: d });
  assert.equal(r.status, 2);
}));

test('draw is deterministic for a seed and deals no dividers under 16 slides', () => withTmp((d) => {
  const draw = (slides) => JSON.parse(run('theme.mjs', ['draw', '--storyline', 'cim', '--slides', String(slides), '--seed', 'abc123', '--json', '--log', join(d, 'log.json')], { cwd: d }).stdout);
  assert.deepEqual(draw(20), draw(20));
  assert.match(draw(12).divider, /^no divider/);
  assert.ok(draw(20).lead_exhibit);
}));

test('the lead exhibit the draw deals is always a real archetype', () => withTmp((d) => {
  const arch = new Set([...readFileSync(join(SKILL, 'references', 'archetypes.md'), 'utf8').matchAll(/^\*\*\d+\.\s*([a-z0-9-]+)\*\*/gm)].map((m) => m[1]));
  for (const story of [...readdirSync(join(SKILL, 'references', 'storylines')).map((f) => f.replace(/\.md$/, '')), 'no-such-storyline']) {
    for (const seed of ['a1', 'b2', 'c3']) {
      const r = JSON.parse(run('theme.mjs', ['draw', '--storyline', story, '--slides', '20', '--seed', seed, '--json', '--log', join(d, 'log.json')], { cwd: d }).stdout);
      if (r.lead_exhibit) assert.ok(arch.has(r.lead_exhibit), `${story}/${seed}: ${r.lead_exhibit}`);
    }
  }
}));

test('scaffold writes tokens, base, facts and a starter deck, and refuses the skill folder', () => withTmp((d) => {
  const out = join(d, 'deck');
  const r = run('theme.mjs', ['scaffold', 'meridian', '--out', out, '--storyline', 'fund-pitch', '--draw', 'abc123'], { cwd: d });
  assert.equal(r.status, 0, r.stderr);
  for (const f of ['tokens.css', 'base.css', 'facts.json', 'deck.html']) assert.ok(existsSync(join(out, f)), f);
  const html = readFileSync(join(out, 'deck.html'), 'utf8');
  assert.match(html, /data-words-cap="80"/);
  assert.match(html, /draw: abc123/);
  const bad = run('theme.mjs', ['scaffold', 'meridian', '--out', join(SKILL, 'tmp-deck')], { cwd: d });
  assert.equal(bad.status, 2);
  assert.ok(!existsSync(join(SKILL, 'tmp-deck')));
}));

test('log puts the newest deck first, keeps 20, and rotation rests that theme', () => withTmp((d) => {
  const log = join(d, '.deckmark', 'log.json');
  for (let i = 0; i < 22; i++) run('theme.mjs', ['log', '--log', log, '--entry', JSON.stringify({ theme: i === 21 ? 'ledgerline' : 'meridian', storyline: 'credit-memo', cover: 'c', divider: 'd', exec: 'e', archetypes: ['kpi-strip'] })], { cwd: d });
  const j = JSON.parse(readFileSync(log, 'utf8'));
  assert.equal(j.length, 20);
  assert.equal(j[0].theme, 'ledgerline');
  const dealt = JSON.parse(run('theme.mjs', ['deal', '--field', 'credit', '--prompt', 'credit memo', '--json', '--log', log], { cwd: d }).stdout);
  assert.ok(!dealt.deal.some((t) => t.slug === 'ledgerline'));
  assert.ok(dealt.avoided.includes('ledgerline'));
}));
