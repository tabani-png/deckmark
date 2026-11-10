import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { run, tmp, SKILL } from './helpers.mjs';

test('refcheck passes on the shipped skill', () => {
  const r = run('refcheck.mjs');
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, / 0 errors/);
});

// A copy of the skill in a temp repo, broken one way at a time.
function broken(edit) {
  const repo = tmp(), skill = join(repo, 'skills', 'deckmark');
  cpSync(SKILL, skill, { recursive: true, filter: (s) => !/node_modules|\.deckmark/.test(s) });
  edit(skill);
  const r = spawnSync(process.execPath, [join(skill, 'scripts', 'refcheck.mjs'), '--json'], { encoding: 'utf8' });
  return { status: r.status, j: JSON.parse(r.stdout) };
}
const has = (r, rule, re) => r.j.findings.some((f) => f.rule === rule && re.test(f.msg));

test('refcheck catches a dead link, a missing file and a missing section', () => {
  const r = broken((s) => appendFileSync(join(s, 'references', 'craft.md'), '\nSee [the atlas](atlas.md), `nowhere.mjs` and `gates.md` § 9.\n'));
  assert.equal(r.status, 1);
  assert.ok(has(r, 'link', /atlas\.md/));
  assert.ok(has(r, 'mention', /nowhere\.mjs/));
  assert.ok(has(r, 'section', /§ 9/));
});

test('refcheck catches a component class base.css does not define', () => {
  const r = broken((s) => appendFileSync(join(s, 'references', 'components.md'), '\n**`.glow-card`**: a card that glows.\n'));
  assert.ok(has(r, 'class', /\.glow-card/));
});

test('refcheck catches a storyline archetype that does not exist', () => {
  const r = broken((s) => { const f = join(s, 'references', 'storylines', 'cim.md'); writeFileSync(f, readFileSync(f, 'utf8').replace('**cover**', '**hero-banner-strip**')); });
  assert.ok(has(r, 'archetype', /hero-banner-strip/));
});

test('refcheck catches an undocumented decklint rule, an em dash and a fat SKILL.md', () => {
  const r = broken((s) => {
    const g = join(s, 'references', 'gates.md'); writeFileSync(g, readFileSync(g, 'utf8').replace('(L `dead-band`)', '(L `dead-zone`)'));
    appendFileSync(join(s, 'references', 'fonts.md'), '\nA pairing — like this.\n');
    appendFileSync(join(s, 'SKILL.md'), '\n' + 'filler line\n'.repeat(40));
  });
  assert.ok(has(r, 'rule', /dead-zone/));
  assert.ok(has(r, 'dash', /dash/));
  assert.ok(has(r, 'size', /SKILL\.md is/));
});
