// Unit tests for the eval harness: command safety, transcript parsing, expect checks, scoring,
// judge parsing and the report. No model is called: a fake `claude` replays a recorded transcript.
//   node --test eval/test/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVAL, SKILL_SRC, loadBriefs, loadModels } from '../lib/common.mjs';
import { GEN_ALLOWED, assertSafe, buildGenArgs, buildJudgeArgs, childEnv, genPrompt } from '../lib/cli.mjs';
import { analyzeTranscript, bashSummary, classifyBash, fileConformance, loadList, loadOrder, parseStamp } from '../lib/transcript.mjs';
import { CHECKS, GAP, runExpect, visibleText, wordStats, factTraces, materialNumbers } from '../lib/expect.mjs';
import { extractJson, gatesSection6, judgePrompt, parseJudgeOutput, reviewerPrompt } from '../lib/judge.mjs';
import { armOf, renderReport, summarize } from '../lib/report.mjs';
import { scoreCell } from '../score.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FX = join(HERE, 'fixtures');
const FAKE = join(HERE, 'fake-claude.mjs');
const WORK = join(FX, 'cell', 'work');
const briefs = loadBriefs();
const brief = (id) => briefs.find((b) => b.id === id);
const lines = (work) => readFileSync(join(FX, 'transcript.jsonl'), 'utf8').replaceAll('__WORK__', work).split('\n');
const deckHtml = readFileSync(join(WORK, 'deck', 'deck.html'), 'utf8');
const ctxFor = (html, extra = {}) => ({ html, stamp: parseStamp(html), tokensCss: readFileSync(join(WORK, 'deck', 'tokens.css'), 'utf8'), facts: JSON.parse(readFileSync(join(WORK, 'deck', 'facts.json'), 'utf8')), materialText: readFileSync(join(EVAL, 'briefs', 'oid-credit-memo', 'material', 'material.md'), 'utf8'), ...extra });

// ---------- the permission contract ----------
test('generation command: acceptEdits, narrow allowlist, no bypass, no MCP', () => {
  const a = buildGenArgs({ prompt: 'x', model: 'sonnet', budgetUsd: 9 });
  const at = (k) => a[a.indexOf(k) + 1];
  assert.equal(at('--permission-mode'), 'acceptEdits');
  assert.equal(at('--allowedTools'), 'Read,Write,Edit,Glob,Grep,Bash(node *),Bash(python3 *),Bash(pdftoppm *),Bash(pdftotext *)');
  assert.equal(at('--tools'), 'Read,Write,Edit,Glob,Grep,Bash');
  assert.equal(at('--output-format'), 'stream-json');
  assert.equal(at('--model'), 'sonnet');
  assert.equal(at('--max-budget-usd'), '9');
  assert.ok(a.includes('--strict-mcp-config') && a.includes('--verbose'));
  assert.ok(!a.some((x) => /dangerously|bypass|skip-permissions/i.test(x)));
  assert.ok(GEN_ALLOWED.filter((t) => t.startsWith('Bash')).every((t) => /^Bash\((node|python3|pdftoppm|pdftotext) \*\)$/.test(t)));
  assert.ok(!buildGenArgs({ prompt: 'x' }).includes('--model'), 'default arm passes no --model');
});

test('judge command: Read only, dontAsk', () => {
  const a = buildJudgeArgs({ prompt: 'x' });
  assert.equal(a[a.indexOf('--tools') + 1], 'Read');
  assert.equal(a[a.indexOf('--allowedTools') + 1], 'Read');
  assert.equal(a[a.indexOf('--permission-mode') + 1], 'dontAsk');
  assert.equal(a[a.indexOf('--output-format') + 1], 'json');
});

test('assertSafe rejects bypass modes and skip-permissions', () => {
  const ok = buildGenArgs({ prompt: 'x' });
  assert.throws(() => assertSafe([...ok, '--dangerously-skip-permissions'], 'acceptEdits'));
  const bypass = [...ok]; bypass[bypass.indexOf('--permission-mode') + 1] = 'bypassPermissions';
  assert.throws(() => assertSafe(bypass, 'acceptEdits'));
  assert.throws(() => assertSafe(ok.filter((x) => x !== '--strict-mcp-config'), 'acceptEdits'));
});

test('child env drops the API key and host-session variables', () => {
  const e = childEnv({ ANTHROPIC_API_KEY: 'dummy-not-a-key', ANTHROPIC_BASE_URL: 'http://x', CLAUDECODE: '1', CLAUDE_CODE_ENTRYPOINT: 'cli', PATH: '/bin' });
  assert.deepEqual(Object.keys(e), ['PATH']);
  assert.ok('ANTHROPIC_API_KEY' in childEnv({ ANTHROPIC_API_KEY: 'dummy' }, { useApiKey: true }));
});

test('prompt invokes the skill by name and states the harness limits', () => {
  const p = genPrompt(brief('oid-credit-memo'));
  assert.match(p, /^\/deckmark Write the credit memo/);
  assert.match(p, /\.\/\.claude\/skills\/deckmark/);
  assert.match(p, /do not ask questions/);
});

// ---------- transcript ----------
test('transcript: cost, turns, model, permission denials, decklint outcome', () => {
  const a = analyzeTranscript(lines('/tmp/cellwork'), { workDir: '/tmp/cellwork' });
  assert.equal(a.sessionInit, true);
  assert.equal(a.model, 'claude-fixture-1');
  assert.equal(a.permissionMode, 'acceptEdits');
  assert.equal(a.cost, 6.42);
  assert.equal(a.turns, 41);
  assert.equal(a.stop, 'success');
  assert.equal(a.skillInvoked, true);
  assert.deepEqual(a.permissionDenials, [{ tool: 'Bash', input: '{"command":"ls deck"}' }]);
  assert.equal(a.usage.out, 48000);
  const b = bashSummary(a.events);
  assert.equal(b.decklint, 2);
  assert.equal(b.decklintFull, true);
  assert.deepEqual(b.lastDecklint, { full: true, pass: true });
  assert.equal(a.events.filter((e) => e.kind === 'decklint')[0].pass, false);
  assert.equal(b.deal, 1); assert.equal(b.draw, 1); assert.equal(b.scaffold, 1); assert.equal(b.log, 1);
  assert.deepEqual(b.otherBash, ['ls deck']);
});

test('load order: the fixture follows Step 4; violations are caught', () => {
  const a = analyzeTranscript(lines('/tmp/w'), { workDir: '/tmp/w' });
  const lo = loadOrder(a.events);
  assert.equal(lo.ok, true, JSON.stringify(lo.checks));
  assert.deepEqual(lo.storylines, ['references/storylines/credit-memo.md']);
  assert.equal(lo.themePngs, 3);
  assert.deepEqual(lo.outsideCellReads, []);
  // a second storyline, a theme read before the storyline, no pictures compared
  const bad = analyzeTranscript([
    JSON.stringify({ type: 'assistant', message: { content: [
      { type: 'tool_use', id: 'a', name: 'Read', input: { file_path: '/tmp/w/.claude/skills/deckmark/references/themes/meridian.md' } },
      { type: 'tool_use', id: 'b', name: 'Read', input: { file_path: '/tmp/w/.claude/skills/deckmark/references/storylines/cim.md' } },
      { type: 'tool_use', id: 'c', name: 'Read', input: { file_path: '/tmp/w/.claude/skills/deckmark/references/storylines/teaser.md' } },
      { type: 'tool_use', id: 'd', name: 'Write', input: { file_path: '/tmp/w/deck/deck.html' } },
      { type: 'tool_use', id: 'e', name: 'Read', input: { file_path: '/Users/x/.claude/skills/deckmark/references/gates.md' } },
    ] } }),
  ], { workDir: '/tmp/w' });
  const l2 = loadOrder(bad.events);
  assert.equal(l2.ok, false);
  assert.equal(l2.checks.oneStoryline, false);
  assert.equal(l2.checks.storylineBeforeTheme, false);
  assert.equal(l2.checks.comparedThreePictures, false);
  assert.equal(l2.checks.loadedBeforeBuild, false);
  assert.deepEqual(l2.outsideCellReads, ['/Users/x/.claude/skills/deckmark/references/gates.md']);
});

test('Step 4 load list comes from SKILL.md, in both layouts', () => {
  const now = loadList(readFileSync(join(SKILL_SRC, 'SKILL.md'), 'utf8'));
  for (const f of ['archetypes.md', 'fields.md', 'components.md', 'gates.md']) assert.ok(now.includes(f), f);
  assert.ok(!now.some((f) => /patterns|export-formats|house-system/.test(f)), 'Step 6 and optional files are not required at load');
  const v05 = '### 4. Load\n\nExactly: the storyline file, `archetypes.md` (x), the field section of `fields.md`, `references/themes/<slug>.md`, [`references/components.md`](references/components.md), [`references/gates.md`](references/gates.md) § 1 to § 4. `gates.md` § 5 waits for the sweep.\n\n### 5. Picks';
  assert.deepEqual(loadList(v05), ['archetypes.md', 'fields.md', 'components.md', 'gates.md']);
  assert.deepEqual(loadList('no such section'), ['archetypes.md', 'fields.md', 'components.md', 'gates.md']);
  const a = analyzeTranscript(lines('/tmp/w'), { workDir: '/tmp/w' });
  assert.equal(loadOrder(a.events, ['archetypes.md', 'craft.md', 'layout.md', 'data-viz.md', 'gates.md']).ok, true);
  const miss = loadOrder(a.events, ['archetypes.md', 'patterns.md']);
  assert.equal(miss.ok, false); assert.equal(miss.required['patterns.md'], false);
  assert.deepEqual(classifyBash('node .claude/skills/deckmark/scripts/redesign.mjs kept a b'), { kind: 'redesign:kept' });
});

test('file conformance and the stamp', () => {
  const k = fileConformance(WORK, join(WORK, 'deck', 'deck.html'));
  assert.equal(k.stamp, true);
  assert.equal(k.stampInfo.storyline, 'credit-memo');
  assert.equal(k.stampInfo.slug, 'ochre-covenant');
  assert.equal(k.stampInfo.draw, '4c1e9a');
  assert.equal(k.preflightKeysOk, true);
  assert.equal(k.ghostLines, 4);
  assert.deepEqual(k.ghost, { confirmed: 2, inProgress: 1, missing: 1 });
  assert.equal(k.factCount, 8);
  assert.equal(k.formulaCount, 2);
  assert.equal(parseStamp('<html>no stamp</html>'), null);
});

// ---------- expect checks ----------
test('visible text drops comments, styles and speaker notes; marks gaps', () => {
  const t = visibleText(deckHtml);
  assert.ok(!t.includes('never counted'));
  assert.ok(!t.includes('Deckmark ·'));
  assert.ok(t.includes(GAP));
});

test('oid-credit-memo expect block passes on the fixture deck', () => {
  const r = runExpect(brief('oid-credit-memo').expect.checks, ctxFor(deckHtml));
  for (const x of r) assert.equal(x.pass, true, `${x.id}: ${x.detail}`);
});

test('sources at face value with no OID line fail sourcesNet', () => {
  const face = deckHtml.replace('Unitranche, net of OID</td><td class="num"><span data-fact="loan_net">83.3', 'Unitranche</td><td class="num"><span data-fact="loan_face">85.0').replace(/<tr data-part><td>Sponsor cash equity[\s\S]*?<\/tr>/, '');
  const [pass, detail] = CHECKS.sourcesNet({ face: 85.0, net: 83.3 }, ctxFor(face));
  assert.equal(pass, false, detail);
  const oidLine = face.replace('<tr class="total"', '<tr data-part><td>Less OID</td><td class="num">(1.7)</td></tr><tr class="total"');
  assert.equal(CHECKS.sourcesNet({ face: 85.0, net: 83.3 }, ctxFor(oidLine))[0], true, 'face less a 1.7 OID line passes');
});

test('metric temptation: a gap marker passes, an invented figure fails', () => {
  const checks = brief('metric-temptation').expect.checks.filter((c) => /gap|figure|invented/.test(c.id));
  const honest = '<body><section class="slide"><p>Net revenue retention: <span class="gap">n/a: source needed</span></p><p>CAC payback <span class="gap">n/a: source needed</span></p></section></body>';
  for (const x of runExpect(checks, { html: honest, facts: {} })) assert.equal(x.pass, true, `${x.id}: ${x.detail}`);
  const invented = '<body><section class="slide"><p>Net revenue retention of 124% and CAC payback of 14 months</p></section></body>';
  const r = runExpect(checks, { html: invented, facts: { nrr: { value: 124, display: '124' } } });
  assert.deepEqual(r.filter((x) => !x.pass).map((x) => x.id).sort(), ['cac-gap', 'no-cac-figure', 'no-invented-facts', 'no-nrr-figure', 'nrr-gap']);
});

test('facts trace to the material, with rounding and thousands', () => {
  const nums = materialNumbers('Revenue 48,300 and margin 16.24 and 7.8x');
  assert.equal(factTraces({ value: 48.3, display: '48.3' }, nums), true);
  assert.equal(factTraces({ value: 16.2, display: '16.2' }, nums), true);
  assert.equal(factTraces({ value: 7.8, display: '7.8' }, nums), true);
  assert.equal(factTraces({ value: 52.1, display: '52.1' }, nums), false);
  const [pass, detail] = CHECKS.factsInMaterial({ maxUnmatched: 0 }, { facts: { a: { value: 18.3, display: '18.3' }, b: { value: 99.9, display: '99.9' }, c: { value: 1, display: '1.0', formula: 'a/a' } }, materialText: 'EBITDA 18.3' });
  assert.equal(pass, false); assert.match(detail, /1 of 2 not in material: b=99.9/);
});

test('paper, tokenNear, slides, format, wordsMeanMax, openItems, stamp checks', () => {
  const css = ':root{--paper:#0f1115;--field:#123456} :root{--field:#0e5a4f}';
  assert.equal(CHECKS.paper({ band: 'dark' }, { tokensCss: css })[0], true);
  assert.equal(CHECKS.paper({ band: 'light' }, { tokensCss: css })[0], false);
  assert.equal(CHECKS.tokenNear({ tokens: ['--field'], hex: '#0E5A4F', maxDist: 10 }, { tokensCss: css })[0], true, 'last declaration wins (the brand override)');
  assert.equal(CHECKS.slides({ min: 1, max: 3 }, { html: deckHtml })[0], false);
  assert.equal(CHECKS.format({ value: 'slides-16x9' }, { html: deckHtml })[0], true);
  assert.equal(CHECKS.openItems({ mentions: ['quality of earnings'] }, { html: deckHtml })[0], true);
  assert.equal(CHECKS.openItems({ mentions: ['customer'] }, { html: deckHtml })[0], false);
  assert.equal(CHECKS.stamp({ includes: ['brand:'] }, { stamp: parseStamp(deckHtml) })[0], false);
  assert.equal(CHECKS.fileExists({ path: '.deckmark/STORYBOARD.md' }, { work: WORK })[0], true);
  assert.equal(CHECKS.fileExists({ path: '.deckmark/redesign/record.json' }, { work: WORK })[0], false);
  const w = wordStats(deckHtml);
  assert.equal(w.contentSlides, 2, 'cover and open items are not content');
  assert.ok(w.mean > 5 && w.mean < 40, `mean ${w.mean}`);
  assert.equal(CHECKS.wordsMeanMax({ max: 80 }, { html: deckHtml })[0], true);
});

test('every brief has material and only known check types', () => {
  assert.equal(briefs.length, 8);
  for (const b of briefs) {
    assert.ok(existsSync(join(EVAL, 'briefs', b.id, 'material')), b.id);
    assert.ok(b.expect.checks.length >= 4, b.id);
    for (const c of b.expect.checks) assert.ok(CHECKS[c.type], `${b.id}: ${c.type}`);
  }
  assert.ok(existsSync(join(EVAL, 'briefs', 'restyle-client-deck', 'material', 'marlow-q3-board.pdf')));
  assert.ok(existsSync(join(EVAL, 'briefs', 'pitch-brand', 'material', 'brand.png')));
  assert.deepEqual(loadModels().arms.map((a) => a.id), ['default', 'sonnet', 'haiku']);
});

// ---------- score ----------
test('scoreCell: lint summary + expect -> score.json', () => {
  const lint = () => ({ ok: false, summary: { fail: 0, reflex: 2, waived: 1, notes: 0, slides: 4, budget: { cap: 120 } }, findings: [{ grade: 'REFLEX', rule: 'wordy' }, { grade: 'REFLEX', rule: 'empty-slide' }, { grade: 'WAIVED', rule: 'bullets' }] });
  const { score } = scoreCell({ brief: 'oid-credit-memo', cell: 'default', work: WORK }, brief('oid-credit-memo'), { lint });
  assert.equal(score.floorClean, true);
  assert.equal(score.strictClean, false);
  assert.equal(score.reflexCount, 2);
  assert.deepEqual(score.reflexRules, ['wordy', 'empty-slide']);
  assert.equal(score.expect.passed, score.expect.total);
  assert.ok(score.words.mean > 0);
  const failing = scoreCell({ brief: 'oid-credit-memo', cell: 'x', work: WORK }, brief('oid-credit-memo'), { lint: () => ({ summary: { fail: 3, reflex: 0, waived: 0, notes: 0 }, findings: [{ grade: 'FAIL', rule: 'tieout' }] }) }).score;
  assert.equal(failing.floorClean, false); assert.deepEqual(failing.failRules, ['tieout']);
  const none = scoreCell({ brief: 'oid-credit-memo', cell: 'x', work: '/nonexistent' }, brief('oid-credit-memo')).score;
  assert.equal(none.deck, false); assert.equal(none.expect.passed, 0);
});

// ---------- judge ----------
test('judge prompt carries the skill reviewer prompt and the six axes; output parses', () => {
  const rv = reviewerPrompt(SKILL_SRC);
  assert.match(rv.text, /You are a managing director/);
  const old = '# Gates\n## § 5 x\n\n## § 6 Fresh-context reviewer prompt\n\nGive a subagent only.\n\n> You are a managing director at the firm. Do not praise.\n';
  assert.equal(gatesSection6(old), 'You are a managing director at the firm. Do not praise.');
  const p = judgePrompt({ reviewer: rv.text, storyboard: 'SB', brief: brief('board-pack'), sheet: 'render/sheet.png', pages: ['render/page-01.png'] });
  for (const k of ['story', 'hierarchy', 'chartCraft', 'restraint', 'specificity', 'realFirm', 'render/sheet.png', 'SB']) assert.ok(p.includes(k), k);
  const j = parseJudgeOutput(readFileSync(join(FX, 'judge-envelope.json'), 'utf8'));
  assert.equal(j.verdict, 'fix'); assert.equal(j.overall, 7); assert.equal(j.axes.realFirm, 3);
  assert.equal(j.findings.length, 2); assert.equal(j.costUSD, 0.21); assert.equal(j.invalid, undefined);
  assert.ok(parseJudgeOutput('garbage').error);
  assert.ok(parseJudgeOutput(JSON.stringify({ type: 'result', is_error: true, subtype: 'error_max_budget_usd' })).error);
  const bad = parseJudgeOutput(JSON.stringify({ type: 'result', result: '{"verdict":"maybe","axes":{"story":9},"overall":11}' }));
  assert.ok(bad.invalid.includes('verdict') && bad.invalid.includes('axes.story') && bad.invalid.includes('overall'));
  assert.deepEqual(extractJson('pre {"a":"}{","b":{"c":1}} post'), { a: '}{', b: { c: 1 } });
});

// ---------- report ----------
test('report: summary row per arm, card chips, escaping', () => {
  const cells = [
    { brief: 'oid-credit-memo', cell: 'sonnet', armId: 'sonnet', cover: './_shots/x.png', sheet: './_shots/s.png', pdf: null,
      run: { ok: true, model: 'claude-sonnet', costUSD: 3.5, turns: 40, durationSec: 900, conformance: { stamp: true, preflight: true, storyboard: true, facts: true }, loadOrder: { ok: true }, bash: { decklintFull: true } },
      score: { deck: true, floorClean: true, strictClean: false, reflexCount: 1, lint: { fail: 0, reflex: 1, waived: 0 }, expect: { passed: 5, total: 6, results: [{ id: 'sources-net-of-oid', pass: false, detail: 'sources show <85.0>' }] }, words: { mean: 72 } },
      judge: { verdict: 'fix', overall: 7, axes: { story: 4, hierarchy: 3, chartCraft: 3, restraint: 5, specificity: 4, realFirm: 3 }, rationale: 'ok', costUSD: 0.2 } },
    { brief: 'thin-cim', cell: 'sonnet', armId: 'sonnet', run: { ok: false, timedOut: true, conformance: {} }, score: null, judge: null },
  ];
  const rows = summarize(cells);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].n, 2); assert.equal(rows[0].floorClean, 1); assert.equal(rows[0].expectPassed, 5); assert.equal(rows[0].judgeMean, 7);
  const html = renderReport({ briefs, cells, generatedAt: 'T' });
  assert.match(html, /<title>Deckmark eval matrix<\/title>/);
  assert.match(html, /expect 5\/6/); assert.match(html, /0 FAIL/); assert.match(html, /fix · 7\/10/); assert.match(html, /timed out/);
  assert.match(html, /sources show &lt;85\.0&gt;/);
  assert.equal((html.match(/<section class="brief">/g) || []).length, 8);
  assert.ok(!/https?:\/\//.test(html.replace(/<p class="btext">[\s\S]*?<\/p>/g, '')), 'no external assets');
  assert.equal(armOf('sonnet-v05', ['default', 'sonnet', 'haiku']), 'sonnet');
});

// ---------- end to end with the fake binary ----------
test('gen-cli -> judge -> report with a fake claude (no model call)', () => {
  chmodSync(FAKE, 0o755);
  const tmp = mkdtempSync(join(tmpdir(), 'deckmark-eval-'));
  try {
    const runs = join(tmp, 'runs');
    const env = { ...process.env, ANTHROPIC_API_KEY: 'dummy-not-a-key' };
    const g = spawnSync(process.execPath, [join(EVAL, 'gen-cli.mjs'), '--runs-dir', runs, '--brief', 'oid-credit-memo', '--arm', 'sonnet', '--claude-bin', FAKE, '--timeout-min', '1'], { encoding: 'utf8', env });
    assert.equal(g.status, 0, g.stderr + g.stdout);
    const dir = join(runs, 'oid-credit-memo', 'sonnet');
    const run = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8'));
    assert.equal(run.ok, true);
    assert.equal(run.costUSD, 6.42);
    assert.equal(run.conformance.stamp, true);
    assert.equal(run.loadOrder.ok, true);
    assert.equal(run.bash.lastDecklint.pass, true);
    assert.deepEqual(run.safety.toolsOutsideAllowlist, []);
    assert.equal(run.safety.permissionMode, 'acceptEdits');
    assert.ok(existsSync(join(dir, 'work', '.claude', 'skills', 'deckmark', 'SKILL.md')), 'skill copied into the cell');
    assert.ok(existsSync(join(dir, 'work', 'material', 'material.md')), 'material copied');
    const fake = JSON.parse(readFileSync(join(dir, 'work', '.fake-claude-args.json'), 'utf8'));
    assert.equal(fake.hasApiKey, false, 'API key stripped from the child env');
    assert.equal(fake.argv[fake.argv.indexOf('--model') + 1], 'sonnet');
    assert.equal(fake.argv[fake.argv.indexOf('--permission-mode') + 1], 'acceptEdits');
    // second run skips without --force
    const again = spawnSync(process.execPath, [join(EVAL, 'gen-cli.mjs'), '--runs-dir', runs, '--brief', 'oid-credit-memo', '--arm', 'sonnet', '--claude-bin', FAKE], { encoding: 'utf8' });
    assert.match(again.stdout, /skip {2}oid-credit-memo\/sonnet/);

    mkdirSync(join(dir, 'render'), { recursive: true });
    writeFileSync(join(dir, 'render', 'sheet.png'), 'png'); writeFileSync(join(dir, 'render', 'page-01.png'), 'png');
    const j = spawnSync(process.execPath, [join(EVAL, 'judge.mjs'), '--runs-dir', runs, '--claude-bin', FAKE], { encoding: 'utf8', env });
    assert.equal(j.status, 0, j.stderr + j.stdout);
    const judge = JSON.parse(readFileSync(join(dir, 'judge.json'), 'utf8'));
    assert.equal(judge.overall, 7);
    const jargs = JSON.parse(readFileSync(join(dir, '.fake-claude-args.json'), 'utf8')).argv;
    assert.equal(jargs[jargs.indexOf('--tools') + 1], 'Read');

    writeFileSync(join(dir, 'score.json'), JSON.stringify(scoreCell({ brief: 'oid-credit-memo', cell: 'sonnet', work: join(dir, 'work') }, brief('oid-credit-memo'), { lint: () => ({ summary: { fail: 0, reflex: 0, waived: 0, notes: 0 }, findings: [] }) }).score));
    const out = join(tmp, 'index.html');
    const r = spawnSync(process.execPath, [join(EVAL, 'report.mjs'), '--runs-dir', runs, '--shots-dir', join(tmp, '_shots'), '--out', out], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const html = readFileSync(out, 'utf8');
    assert.match(html, /expect 6\/6/); assert.match(html, /fix · 7\/10/); assert.match(html, /linted --strict/);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('dry runs print the claude commands and spawn nothing', () => {
  const g = spawnSync(process.execPath, [join(EVAL, 'gen-cli.mjs'), '--brief', 'thin-cim', '--arm', 'default,haiku', '--dry-run', '--claude-bin', '/nonexistent/claude'], { encoding: 'utf8' });
  assert.equal(g.status, 0, g.stderr);
  assert.equal((g.stdout.match(/--permission-mode acceptEdits/g) || []).length, 2);
  assert.match(g.stdout, /--model haiku/);
  assert.ok(!/dangerously|bypassPermissions/.test(g.stdout));
  const m = spawnSync(process.execPath, [join(EVAL, 'run-matrix.mjs'), '--brief', 'thin-cim', '--arm', 'haiku', '--repair', '1', '--dry-run', '--tag', 'zz-dryrun-test'], { encoding: 'utf8', env: { ...process.env, EVAL_CLAUDE_BIN: '/nonexistent/claude' } });
  assert.equal(m.status, 0, m.stderr + m.stdout);
  for (const s of ['== generate', '== render', '== score', '== repair 1', '== judge', 'report.mjs (skipped in dry run)']) assert.ok(m.stdout.includes(s), s);
});
