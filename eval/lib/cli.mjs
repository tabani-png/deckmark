// The exact `claude -p` command lines the harness runs. Kept pure so the tests can prove the
// safety contract: no bypass mode, no skip-permissions flag, a narrow tool allowlist, no MCP.

// Generation cells: write files in the scratch cell, run only the deckmark scripts and poppler.
export const GEN_TOOLS = ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash'];
export const GEN_ALLOWED = [
  'Read', 'Write', 'Edit', 'Glob', 'Grep',
  'Bash(node *)', 'Bash(python3 *)', 'Bash(pdftoppm *)', 'Bash(pdftotext *)',
];
// The vision judge reads images and nothing else.
export const JUDGE_TOOLS = ['Read'];
export const JUDGE_ALLOWED = ['Read'];

const FORBIDDEN = [/dangerously/i, /bypass/i, /skip-permissions/i];

export function buildGenArgs({ prompt, model = null, budgetUsd = 15, maxTurns = null, effort = null }) {
  const a = ['-p', prompt,
    '--output-format', 'stream-json', '--verbose',
    '--permission-mode', 'acceptEdits',
    '--tools', GEN_TOOLS.join(','),
    '--allowedTools', GEN_ALLOWED.join(','),
    '--strict-mcp-config',
    '--setting-sources', 'project',
    '--no-session-persistence',
    '--max-budget-usd', String(budgetUsd)];
  if (maxTurns) a.push('--max-turns', String(maxTurns));
  if (model) a.push('--model', model);
  if (effort) a.push('--effort', effort);
  assertSafe(a, 'acceptEdits');
  return a;
}

export function buildJudgeArgs({ prompt, model = null, budgetUsd = 2 }) {
  const a = ['-p', prompt,
    '--output-format', 'json',
    '--permission-mode', 'dontAsk',
    '--tools', JUDGE_TOOLS.join(','),
    '--allowedTools', JUDGE_ALLOWED.join(','),
    '--strict-mcp-config',
    '--setting-sources', 'project',
    '--no-session-persistence',
    '--max-budget-usd', String(budgetUsd)];
  if (model) a.push('--model', model);
  assertSafe(a, 'dontAsk');
  return a;
}

// Throws unless the argument list holds the permission contract. Called on every build.
export function assertSafe(args, mode) {
  for (const x of args.slice(2)) for (const re of FORBIDDEN) if (re.test(x)) throw new Error(`unsafe claude argument: ${x}`);
  const pm = args.indexOf('--permission-mode');
  if (pm < 0 || args[pm + 1] !== mode) throw new Error(`permission mode must be ${mode}`);
  if (!args.includes('--allowedTools') || !args.includes('--tools')) throw new Error('tool allowlist missing');
  if (!args.includes('--strict-mcp-config')) throw new Error('MCP servers must be off');
  return true;
}

// Child env: shed host-session variables and, unless asked, the API key, so a cell runs on the
// logged-in subscription and cannot inherit a parent Claude Code session. Values are never read out.
export function childEnv(env, { useApiKey = false } = {}) {
  const e = { ...env };
  if (!useApiKey) delete e.ANTHROPIC_API_KEY;
  delete e.ANTHROPIC_BASE_URL;
  for (const k of Object.keys(e)) if (/^CLAUDE(CODE$|_CODE_)/.test(k)) delete e[k];
  return e;
}

export function genPrompt(brief) {
  return [
    `/deckmark ${brief.brief}`,
    '',
    'Harness notes (an evaluation run; follow the skill exactly otherwise):',
    '- The skill is installed at ./.claude/skills/deckmark. If its SKILL.md is not already in your context, read it first. <dir> means that folder.',
    '- The material is in ./material/. It is all the material there is.',
    '- Work in this folder: ./deck/ for deck.html, facts.json and the renders; ./.deckmark/ for preflight.json, STORYBOARD.md and log.json. Run every command from here.',
    '- Headless: do not ask questions. Infer reader, document and style where the brief is silent and state what you picked. Facts are never inferred.',
    '- Bash runs only node, python3, pdftoppm and pdftotext. Create folders with the Write tool, not mkdir.',
    '- No subagents are available. Do the Step 7 fresh-context review and the independent tie-out yourself and write them to ./.deckmark/review.md and ./.deckmark/tieout.md.',
    '- Finish with the decklint --render --strict --facts run on the final deck and the filled Picks block.',
  ].join('\n');
}

export function repairPrompt(findings, { max = 25 } = {}) {
  const rows = findings.filter((f) => f.grade === 'FAIL' || f.grade === 'REFLEX').slice(0, max)
    .map((f) => `- ${f.grade} ${f.rule}${f.slide ? ` (slide ${f.slide})` : ''}: ${f.msg}`);
  return [
    'Repair round. The deck at ./deck/deck.html does not pass `decklint --render --strict --facts ./deck/facts.json`. Findings:',
    ...rows,
    '',
    'Fix each at the root as the deckmark skill (./.claude/skills/deckmark/SKILL.md, Step 7) says: fill, merge, cut or move gaps to the open-items page; never shrink type, never invent a figure, never force a total. Re-run decklint until it passes, then re-render. Headless: do not ask questions.',
  ].join('\n');
}
