#!/usr/bin/env node
// Install Deckmark for every agent harness found (or the ones named), after refcheck and theme check pass.
//   node install.mjs [--claude] [--codex] [--opencode] [--link] [--dry-run] [--force] [--remove] [--home <dir>]
//   --link     symlink the skill folder instead of copying it (a working copy that tracks the repo)
//   --dry-run  print what would happen and change nothing
//   --force    install even when the checks find a problem, or over an existing symlink
//   --remove   delete every installed copy (a symlink is unlinked; the repo it points at is untouched)
//   --home     install under another home folder (tests; default the user's home)
// Shape mirrors Hallmark's install.mjs (MIT, Copyright (c) 2026 Hallmark contributors).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.dirname(HERE);
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const hi = args.indexOf('--home');
const HOME = hi >= 0 && args[hi + 1] ? path.resolve(args[hi + 1]) : homedir();
const FLAGS = ['--claude', '--codex', '--opencode', '--cursor', '--link', '--dry-run', '--force', '--remove', '--help', '-h', '--home'];
const unknown = args.filter((a, i) => !FLAGS.includes(a) && args[i - 1] !== '--home');
if (has('--help') || has('-h') || unknown.length) {
  if (unknown.length) console.log(`Unknown option: ${unknown.join(' ')}\n`);
  console.log('node install.mjs [--claude] [--codex] [--opencode] [--link] [--dry-run] [--force] [--remove] [--home <dir>]');
  process.exit(unknown.length ? 2 : 0);
}
const DRY = has('--dry-run'), LINK = has('--link');
const PAYLOAD = ['SKILL.md', 'LICENSE', 'references', 'scripts', 'assets', 'agents'];
const TARGETS = {
  claude: { label: 'Claude Code', dir: path.join(HOME, '.claude', 'skills', 'deckmark'), detect: () => fs.existsSync(path.join(HOME, '.claude')) },
  codex: { label: 'Codex CLI and Cursor', dir: path.join(HOME, '.agents', 'skills', 'deckmark'), legacy: path.join(HOME, '.codex', 'skills', 'deckmark'), detect: () => ['.codex', '.agents', '.cursor'].some((d) => fs.existsSync(path.join(HOME, d))) },
  opencode: { label: 'OpenCode', dir: path.join(HOME, '.config', 'opencode', 'skills', 'deckmark'), detect: () => fs.existsSync(path.join(HOME, '.config', 'opencode')) },
};
const lexists = (p) => { try { fs.lstatSync(p); return true; } catch { return false; } };
const isLink = (p) => { try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; } };

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (['.DS_Store', '.deckmark', 'node_modules'].includes(e.name) || e.isSymbolicLink()) continue;
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
function removeAt(dir) {
  if (!lexists(dir)) return;
  if (DRY) return console.log(`  would remove ${dir}`);
  if (isLink(dir)) fs.unlinkSync(dir); else fs.rmSync(dir, { recursive: true, force: true });
  console.log(`  removed ${dir}`);
}
function installTo(dir) {
  if (isLink(dir) && !LINK && !has('--force')) return console.log(`  skipped: ${dir} is a symlink (${fs.readlinkSync(dir)}), a working copy; pass --force to replace it with a copy`);
  if (DRY) return console.log(`  would ${LINK ? 'link' : 'install'} -> ${dir}`);
  fs.mkdirSync(path.dirname(dir), { recursive: true });
  if (LINK) { removeAt(dir); fs.symlinkSync(SKILL_ROOT, dir, 'dir'); return console.log(`  linked ${dir} -> ${SKILL_ROOT}`); }
  const tmp = `${dir}.tmp-install`;
  fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  for (const item of PAYLOAD) {
    const src = path.join(SKILL_ROOT, item); if (!fs.existsSync(src)) continue;
    if (fs.statSync(src).isDirectory()) copyDir(src, path.join(tmp, item)); else fs.copyFileSync(src, path.join(tmp, item));
  }
  if (isLink(dir)) fs.unlinkSync(dir); else fs.rmSync(dir, { recursive: true, force: true });
  fs.renameSync(tmp, dir);
  console.log(`  installed -> ${dir}`);
}

if (has('--remove')) {
  console.log('Removing Deckmark from every known install location:');
  for (const t of Object.values(TARGETS)) removeAt(t.dir);
  removeAt(TARGETS.codex.legacy);
  process.exit(0);
}
const explicit = ['claude', 'codex', 'opencode'].filter((k) => has(`--${k}`) || (k === 'codex' && has('--cursor')));
const picked = explicit.length ? explicit : Object.keys(TARGETS).filter((k) => TARGETS[k].detect());
if (!picked.length) { console.log(`No harness detected under ${HOME} (.claude, .codex, .agents, .cursor, .config/opencode). Name one: --claude --codex --opencode`); process.exit(1); }

const gate = (label, argv) => { try { execFileSync(process.execPath, argv, { stdio: 'pipe' }); return true; } catch (e) { console.log(`\n${label} failed:\n${String(e.stdout || '').trim().split('\n').slice(-12).join('\n')}`); return false; } };
const clean = gate('refcheck', [path.join(HERE, 'refcheck.mjs'), '--errors']) & gate('theme check', [path.join(HERE, 'theme.mjs'), 'check']);
if (!clean && !has('--force')) { console.log('\nNothing installed. Fix the findings above, or pass --force to install anyway.'); process.exit(1); }
console.log(`Deckmark installer${DRY ? ' (dry run)' : ''} · ${LINK ? 'symlink' : `payload: ${PAYLOAD.join(', ')}`}`);
for (const key of picked) {
  const t = TARGETS[key];
  console.log(`\n${t.label}:`);
  if (key === 'opencode' && (picked.includes('claude') || lexists(TARGETS.claude.dir))) { console.log('  skipped: OpenCode reads the Claude Code copy through its compatibility path'); continue; }
  installTo(t.dir);
  if (key === 'codex' && lexists(t.legacy)) console.log(`  an older copy sits at ${t.legacy}; Codex may list Deckmark twice (node install.mjs --remove, then install again)`);
}
console.log('\nDone. Invoke as /deckmark (Claude Code, OpenCode) or $deckmark (Codex). Edit-time lint is separate and opt-in: node scripts/install-hook.mjs');
