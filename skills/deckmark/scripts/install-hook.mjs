#!/usr/bin/env node
// Wire Deckmark's edit-time lint into Claude Code as a PostToolUse hook. Opt-in: nothing installs it
// for you. Project-local by default (./.claude/settings.json); --global writes ~/.claude/settings.json.
//   node install-hook.mjs [--global | --settings <path>] [--print] [--remove]
// The hook (lint-hook.mjs) runs decklint's static tier after a Write or Edit of a deck, blocks only on a
// Floor FAIL and stays silent otherwise. Re-running replaces Deckmark's entry, never anyone else's.
// Shape mirrors Hallmark's install-hook.mjs (MIT, Copyright (c) 2026 Hallmark contributors).
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const HOOK_CMD = `node "${join(HERE, 'lint-hook.mjs')}"`;
const MATCHER = 'Write|Edit|MultiEdit';
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
if (has('--help') || has('-h')) { console.log('node install-hook.mjs [--global | --settings <path>] [--print] [--remove]'); process.exit(0); }

const settingsPath = opt('--settings') ? resolve(opt('--settings')) : has('--global') ? join(homedir(), '.claude', 'settings.json') : join(process.cwd(), '.claude', 'settings.json');
const hookEntry = { matcher: MATCHER, hooks: [{ type: 'command', command: HOOK_CMD, timeout: 10 }] };

if (has('--print')) { console.log(`# add to ${settingsPath} :`); console.log(JSON.stringify({ hooks: { PostToolUse: [hookEntry] } }, null, 2)); process.exit(0); }
if (has('--remove') && !existsSync(settingsPath)) { console.log(`no ${settingsPath}; nothing to remove`); process.exit(0); }

let settings = {};
if (existsSync(settingsPath)) { try { settings = JSON.parse(readFileSync(settingsPath, 'utf8')); } catch { console.error(`refusing to overwrite unparseable ${settingsPath}; fix or delete it first`); process.exit(1); } }
if (!settings || typeof settings !== 'object' || Array.isArray(settings)) { console.error(`refusing to rewrite ${settingsPath}: it is not a JSON object`); process.exit(1); }
settings.hooks ??= {};
settings.hooks.PostToolUse ??= [];
if (!Array.isArray(settings.hooks.PostToolUse)) { console.error(`refusing to rewrite ${settingsPath}: hooks.PostToolUse is not a list`); process.exit(1); }

const ours = (h) => typeof h?.command === 'string' && /deckmark[\\/]scripts[\\/]lint-hook\.mjs/.test(h.command);
settings.hooks.PostToolUse = settings.hooks.PostToolUse.flatMap((e) => {
  if (!Array.isArray(e?.hooks) || !e.hooks.some(ours)) return [e];
  const rest = e.hooks.filter((h) => !ours(h));
  return rest.length ? [{ ...e, hooks: rest }] : [];
});
// Write beside the file and rename over it; a symlinked settings.json keeps its link.
const save = () => { mkdirSync(dirname(settingsPath), { recursive: true }); const dest = existsSync(settingsPath) ? realpathSync(settingsPath) : settingsPath; const tmp = `${dest}.deckmark-tmp`; writeFileSync(tmp, JSON.stringify(settings, null, 2) + '\n'); renameSync(tmp, dest); };

if (has('--remove')) { save(); console.log(`removed the Deckmark lint hook from ${settingsPath}`); process.exit(0); }
settings.hooks.PostToolUse.push(hookEntry);
save();
console.log(`installed the Deckmark edit-time lint hook into ${settingsPath}`);
console.log('it runs decklint static on a written deck (.html with the Deckmark stamp, or inside a project with a .deckmark folder): a Floor FAIL blocks with the findings, a REFLEX is a note, clean is silent. Remove with --remove.');
