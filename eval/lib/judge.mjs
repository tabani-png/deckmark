// Vision judge: the skill's own finish-review prompt (references/review-finish.md, or the older
// gates.md § 6 quote) plus six craft axes, parsed into judge.json.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const AXES = ['story', 'hierarchy', 'chartCraft', 'restraint', 'specificity', 'realFirm'];
export const AXIS_TEXT = {
  story: 'story: do the action titles, read alone top to bottom, tell one argument that ends in the decision?',
  hierarchy: 'hierarchy: on each page, is it obvious what to read first (title, then the one exhibit, then the takeaway)?',
  chartCraft: 'chartCraft: charts and tables drawn from data, direct labels, one highlight that matches the title, units and source lines, numbers aligned?',
  restraint: 'restraint: does every colour, rule and box earn its place, with no decoration, icon rows or filler?',
  specificity: 'specificity: is the content written for this company and this reader, with real figures, not generic consulting language?',
  realFirm: 'realFirm: does it look like a real firm made it (a strategy house, a bank, an asset manager, a public body), not a template or a model?',
};

export function gatesSection6(gatesMd) {
  const m = /## § 6[^\n]*\n([\s\S]*?)(?=\n## |\s*$)/.exec(gatesMd || '');
  if (!m) return null;
  const quote = /^>\s?(.*)$/m.exec(m[1]);
  return (quote ? quote[1] : m[1]).trim();
}

// The reviewer prompt as the skill ships it today: review-finish.md (v0.6 layout) when present,
// else the quoted prompt in gates.md § 6 (v0.5 layout).
export function reviewerPrompt(skillDir) {
  const finish = join(skillDir, 'references', 'review-finish.md');
  if (existsSync(finish)) return { from: 'references/review-finish.md', text: readFileSync(finish, 'utf8').replace(/^#[^\n]*\n+/, '').trim() };
  const s6 = gatesSection6(readFileSync(join(skillDir, 'references', 'gates.md'), 'utf8'));
  if (!s6) throw new Error('no reviewer prompt: neither review-finish.md nor a gates.md § 6 quote');
  return { from: 'references/gates.md § 6', text: s6 };
}

export const VERDICTS = ['ship', 'fix', 'rebuild', 'rerender'];

export function judgePrompt({ reviewer, storyboard, brief, sheet, pages }) {
  if (!reviewer) throw new Error('judgePrompt needs the reviewer prompt text');
  return [
    reviewer,
    '',
    `The deck: ${brief.document || brief.name}. The brief it answered: ${brief.brief}`,
    `Read the contact sheet first: ${sheet} (every page, small). Then Read at most 6 of these full-size pages where you need to look closer: ${pages.join(', ')}.`,
    storyboard ? `\nThe storyboard (STORYBOARD.md):\n${storyboard.slice(0, 6000)}` : '\nNo storyboard was written.',
    '',
    'After the review, also score the deck 1-5 (integers) on each axis:',
    ...AXES.map((a) => `- ${AXIS_TEXT[a]}`),
    'and give overall: an integer 1-10 for the deck as a piece of finance-grade work.',
    '',
    'Write the whole review as ONLY one JSON object, no fences, no prose: your first word goes in verdict, the findings in findings, your answer to the forwarding question in forward, exactly this shape:',
    '{"verdict":"ship|fix|rebuild|rerender","findings":[{"page":3,"issue":"..."}],"forward":"one line","axes":{"story":n,"hierarchy":n,"chartCraft":n,"restraint":n,"specificity":n,"realFirm":n},"overall":n,"rationale":"one sentence"}',
    'At most 8 findings, most serious first.',
  ].join('\n');
}

// First balanced {...} in a text, string-aware, so fences and preambles do not matter.
export function extractJson(text) {
  const s = String(text || '');
  for (let start = s.indexOf('{'); start >= 0; start = s.indexOf('{', start + 1)) {
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) { try { return JSON.parse(s.slice(start, i + 1)); } catch { break; } }
    }
  }
  return null;
}

const int = (v, lo, hi) => (Number.isInteger(Number(v)) && Number(v) >= lo && Number(v) <= hi ? Number(v) : null);

// stdout of `claude -p --output-format json` -> judge.json body, or { error }.
export function parseJudgeOutput(stdout) {
  let envelope = null;
  try { envelope = JSON.parse(String(stdout).trim()); } catch {
    for (const l of String(stdout).split('\n').reverse()) { try { const e = JSON.parse(l); if (e && e.type === 'result') { envelope = e; break; } } catch { /* next */ } }
  }
  if (!envelope) return { error: 'judge output is not JSON' };
  if (Array.isArray(envelope)) envelope = envelope.find((e) => e?.type === 'result') || null;
  if (!envelope) return { error: 'no result event' };
  const meta = { costUSD: envelope.total_cost_usd ?? null, turns: envelope.num_turns ?? null, stop: envelope.subtype ?? null };
  if (envelope.is_error) return { error: `judge run failed: ${envelope.subtype || 'error'}`, ...meta };
  const j = extractJson(envelope.result);
  if (!j) return { error: 'no JSON object in judge answer', preview: String(envelope.result || '').slice(0, 300), ...meta };
  const verdict = VERDICTS.includes(String(j.verdict).toLowerCase()) ? String(j.verdict).toLowerCase() : null;
  const axes = Object.fromEntries(AXES.map((a) => [a, int(j.axes?.[a], 1, 5)]));
  const overall = int(j.overall, 1, 10);
  const problems = [];
  if (!verdict) problems.push('verdict');
  for (const a of AXES) if (axes[a] == null) problems.push(`axes.${a}`);
  if (overall == null) problems.push('overall');
  const findings = Array.isArray(j.findings) ? j.findings.slice(0, 8).map((f) => ({ page: f?.page ?? null, issue: String(f?.issue ?? f ?? '').slice(0, 300) })) : [];
  return { verdict, findings, forward: j.forward ? String(j.forward).slice(0, 300) : null, axes, overall, rationale: String(j.rationale || '').slice(0, 400), ...(problems.length ? { invalid: problems } : {}), ...meta };
}
