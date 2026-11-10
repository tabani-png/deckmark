#!/usr/bin/env node
// Deckmark edit-time hook (Claude Code PostToolUse on Write|Edit|MultiEdit). Installed only on request
// by install-hook.mjs. After an agent writes a deck (an .html file carrying the Deckmark stamp, or any
// .html inside a project with a .deckmark folder), it runs decklint's static tier, which reads the file
// and its stylesheets without a browser (well under a second), and reports:
//   Floor FAIL  -> decision "block" with the findings, so the agent fixes them before going on
//   REFLEX only -> a one-line note as additional context, never a block
//   clean       -> silent
// Anything unexpected (no payload, unreadable file, a crash) is silent: the hook never breaks a session.
// Shape mirrors Hallmark's lint-hook.mjs (MIT, Copyright (c) 2026 Hallmark contributors).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

const OK = (obj = {}) => { process.stdout.write(JSON.stringify(obj)); process.exit(0); };

export function isDeck(filePath, src) {
  if (!/\.html?$/i.test(filePath)) return false;
  if (/<!--\s*Deckmark\b/.test(src)) return true;
  if (!/<section\b[^>]*class="[^"]*\bslide\b/.test(src)) return false;
  let d = dirname(filePath);
  for (let i = 0; i < 8; i++) { if (existsSync(join(d, '.deckmark'))) return true; const up = dirname(d); if (up === d) break; d = up; }
  return false;
}

export async function check(filePath) {
  const { staticTier, RULES } = await import('./decklint.mjs');
  const st = staticTier(filePath);
  const waived = (f) => RULES[f.rule]?.[0] === 'REFLEX' && st.waivers.some((w) => w.rule === f.rule && w.reason.split(/\s+/).length >= 2 && (w.slide == null || w.slide === f.slide));
  const graded = st.findings.map((f) => ({ ...f, grade: RULES[f.rule] ? RULES[f.rule][0] : 'NOTE' })).filter((f) => !waived(f));
  return { fails: graded.filter((f) => f.grade === 'FAIL'), reflex: graded.filter((f) => f.grade === 'REFLEX') };
}

async function main() {
  let raw = '';
  try { raw = readFileSync(0, 'utf8'); } catch { return OK(); }
  let payload; try { payload = JSON.parse(raw); } catch { return OK(); }
  const filePath = payload?.tool_input?.file_path;
  if (typeof filePath !== 'string' || !filePath) return OK();
  let src = ''; try { src = readFileSync(filePath, 'utf8'); } catch { return OK(); }
  if (!src || !isDeck(filePath, src)) return OK();
  const { fails, reflex } = await check(filePath);
  const name = basename(filePath);
  const line = (f) => `- ${f.rule}${f.slide ? ` (slide ${f.slide})` : ''}: ${f.msg}${f.at ? ` at ${f.at}` : ''}`;
  const sweep = `The render tier (overflow, sizes, contrast, tie-out, empty slides) runs at the sweep: node ${join(dirname(new URL(import.meta.url).pathname), 'decklint.mjs')} ${filePath} --render --strict --facts <deck-dir>/facts.json`;
  if (fails.length) {
    const more = fails.length > 10 ? `\n(+${fails.length - 10} more)` : '';
    const reason = `Deckmark Floor check on ${name}: ${fails.length} FAIL${fails.length === 1 ? '' : 's'} (static tier).\n${fails.slice(0, 10).map(line).join('\n')}${more}\nFix these now: route colours and fonts through the theme tokens. ${sweep}`;
    return OK({ decision: 'block', reason, hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: reason } });
  }
  if (reflex.length) return OK({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: `Deckmark static check on ${name}: 0 FAIL, ${reflex.length} REFLEX (${[...new Set(reflex.map((f) => f.rule))].join(', ')}); fix or waive at the sweep.` } });
  return OK();
}

if (process.argv[1] && /lint-hook\.mjs$/.test(process.argv[1])) main().catch(() => OK());
