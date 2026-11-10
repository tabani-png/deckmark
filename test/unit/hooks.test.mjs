// The edit-time hook and the installers. Never touches the real home folder or settings.
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync, mkdirSync, lstatSync, readlinkSync, symlinkSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { run, tmp, SKILL } from './helpers.mjs';

const hook = (payload) => { const r = run('lint-hook.mjs', [], { input: typeof payload === 'string' ? payload : JSON.stringify(payload) }); assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout || '{}'); };
const deck = (body, stamp = true) => `<!doctype html>${stamp ? '<!-- Deckmark · theme: x -->' : ''}<html><head></head><body><main class="deck"><section class="slide" data-archetype="a">${body}</section></main></body></html>`;

test('lint hook: a Floor FAIL in a written deck blocks with the findings', () => {
  const d = tmp(), f = join(d, 'deck.html');
  writeFileSync(f, deck('<p style="color: #c00">Revenue</p>'));
  const out = hook({ tool_name: 'Write', tool_input: { file_path: f } });
  assert.equal(out.decision, 'block');
  assert.match(out.reason, /literal-colour/);
  assert.match(out.hookSpecificOutput.additionalContext, /Floor check on deck\.html: 1 FAIL/);
});

test('lint hook: a clean deck is silent; a Reflex is a note, never a block', () => {
  const d = tmp(), f = join(d, 'deck.html');
  writeFileSync(f, deck('<p style="color: var(--ink)">Revenue</p>'));
  assert.deepEqual(hook({ tool_input: { file_path: f } }), {});
  writeFileSync(f, deck('<p>Growth \u{1F680}</p>'));
  const out = hook({ tool_input: { file_path: f } });
  assert.equal(out.decision, undefined);
  assert.match(out.hookSpecificOutput.additionalContext, /1 REFLEX \(emoji\)/);
});

test('lint hook: other files, unstamped pages outside a deck project and bad input are ignored', () => {
  const d = tmp();
  const css = join(d, 'site.css'); writeFileSync(css, 'p { color: #c00 }');
  assert.deepEqual(hook({ tool_input: { file_path: css } }), {});
  const page = join(d, 'page.html'); writeFileSync(page, deck('<p style="color: #c00">x</p>', false));
  assert.deepEqual(hook({ tool_input: { file_path: page } }), {});
  mkdirSync(join(d, '.deckmark'));
  assert.equal(hook({ tool_input: { file_path: page } }).decision, 'block', 'inside a .deckmark project an unstamped deck is linted');
  assert.deepEqual(hook('not json'), {});
  assert.deepEqual(hook({ tool_input: { file_path: join(d, 'missing.html') } }), {});
});

test('install-hook: adds one entry, keeps other hooks, re-runs idempotently, removes cleanly', () => {
  const d = tmp(), s = join(d, '.claude', 'settings.json');
  mkdirSync(join(d, '.claude'));
  writeFileSync(s, JSON.stringify({ model: 'x', hooks: { PostToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo other' }] }] } }));
  assert.equal(run('install-hook.mjs', ['--settings', s]).status, 0);
  assert.equal(run('install-hook.mjs', ['--settings', s]).status, 0);
  let j = JSON.parse(readFileSync(s, 'utf8'));
  assert.equal(j.model, 'x');
  assert.equal(j.hooks.PostToolUse.length, 2);
  const ours = j.hooks.PostToolUse.find((e) => /lint-hook\.mjs/.test(e.hooks[0].command));
  assert.equal(ours.matcher, 'Write|Edit|MultiEdit');
  assert.equal(run('install-hook.mjs', ['--settings', s, '--remove']).status, 0);
  j = JSON.parse(readFileSync(s, 'utf8'));
  assert.deepEqual(j.hooks.PostToolUse.map((e) => e.matcher), ['Bash']);
});

test('install-hook: refuses an unparseable settings file; --print changes nothing', () => {
  const d = tmp(), s = join(d, 'settings.json');
  writeFileSync(s, '{ not json');
  assert.equal(run('install-hook.mjs', ['--settings', s]).status, 1);
  assert.equal(readFileSync(s, 'utf8'), '{ not json');
  const p = run('install-hook.mjs', ['--settings', join(d, 'none.json'), '--print']);
  assert.match(p.stdout, /PostToolUse/);
  assert.ok(!existsSync(join(d, 'none.json')));
});

test('install: copies the payload for the harnesses named, under a test home', { timeout: 60000 }, () => {
  const home = tmp();
  const r = run('install.mjs', ['--home', home, '--claude', '--codex']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const dir of [join(home, '.claude', 'skills', 'deckmark'), join(home, '.agents', 'skills', 'deckmark')]) {
    for (const f of ['SKILL.md', 'LICENSE', 'references/gates.md', 'scripts/decklint.mjs', 'assets/base.css', 'agents/openai.yaml']) assert.ok(existsSync(join(dir, f)), `${dir}/${f}`);
    assert.ok(!lstatSync(dir).isSymbolicLink());
  }
});

test('install: --link symlinks; an existing symlink is kept unless --force; --remove unlinks without touching the repo', { timeout: 60000 }, () => {
  const home = tmp(), dir = join(home, '.claude', 'skills', 'deckmark');
  assert.equal(run('install.mjs', ['--home', home, '--claude', '--link']).status, 0);
  assert.ok(lstatSync(dir).isSymbolicLink());
  assert.equal(readlinkSync(dir), SKILL);
  const copy = run('install.mjs', ['--home', home, '--claude']);
  assert.match(copy.stdout, /is a symlink/);
  assert.ok(lstatSync(dir).isSymbolicLink(), 'a working-copy link is never replaced without --force');
  assert.equal(run('install.mjs', ['--home', home, '--remove']).status, 0);
  assert.ok(!existsSync(dir));
  assert.ok(existsSync(join(SKILL, 'SKILL.md')), 'the repo behind the link is untouched');
});

test('install: --dry-run changes nothing; no harness found exits 1', { timeout: 60000 }, () => {
  const home = tmp();
  mkdirSync(join(home, '.claude'));
  const r = run('install.mjs', ['--home', home, '--dry-run']);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /would install/);
  assert.deepEqual(readdirSync(join(home, '.claude')), []);
  assert.equal(run('install.mjs', ['--home', tmp()]).status, 1);
});

test('the Codex manifest names the skill and its verbs', () => {
  const y = readFileSync(join(SKILL, 'agents', 'openai.yaml'), 'utf8');
  assert.match(y, /display_name: Deckmark/);
  assert.match(y, /\$deckmark redesign/);
  assert.match(y, /allow_implicit_invocation: true/);
});
