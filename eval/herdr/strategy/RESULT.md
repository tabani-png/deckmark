# RESULT: Deckmark test run, Lakeshore Mutual (fictional)

## Theme picked and why
**Meridian** (dealt 1 of 3 for field `consulting`, format `slides-16x9`; seed `0d67b8·86720a8f·2026-11-07·r0`; draw `6d85f2`).
Why: the reader is a CFO and executive committee choosing a roadmap, which is a strategy-deck register. Meridian is navy and one electric blue, serif action titles, and it marks one highlight per chart. Gridline and Ledgerline were the other two dealt; Ledgerline is public-sector, and Gridline is a report-style theme.

## Slide count
14 slides, 16:9, no section dividers. Storyline `scr-strategy`.

## Build outputs
- `deck/deck.html`, `deck/out/deck.pdf`, `deck/out/page-01.png` to `page-14.png`
- `facts.json` (28 facts, each with its source)
- `.deckmark/STORYBOARD.md`, `.deckmark/log.json`, `.deckmark/build.mjs`

## Lint outcome
`decklint deck.html --render --facts facts.json`: **PASS, 0 FAIL, 0 REFLEX, 0 waived, 0 notes**, after one rebuild. The first run had one NOTE (`h_w12` not printed with `data-fact`). I fixed it by adding the subtotal to a sidebar bullet.

## Review verdict
Fresh-context reviewer (PNGs, STORYBOARD, gates §6 only): **fix**.

Fixed in the one fix batch:
- p6, p9: titles now say "estimated" (client estimates, not validated).
- p7: title no longer says control is "the first priority" when the callout calls it undecided.
- p8: title says "recommended option", not "beats", because scoring is judgment.
- p14: title no longer says "four inputs"; it names cost inputs and benchmarks.
- Re-linted after the fix: PASS, 0 FAIL, 0 REFLEX. Re-read pages 6, 9 and 14.

Not changed (reviewer points I did not act on):
- p13 approves the full $4.0M now, with wave two gated on costs. This is deliberate. Open question for the user.
- p4, p13, p14 small source and footnote text. The lint minimum is 9px for source lines and passes. The reviewer read about 8px. Not changed.
- Repeated decision statements (p1, p2, p3, p13) and repeated figures (p8, p9). Kept as deliberate summary and bridge.
- Cover and p14 say "fictional company, test run". Deliberate, because the material is fictional.
- p10 "n/a, source needed" rows. Deliberate: these are the marked gaps the skill requires.

No confirming review round was run. The skill allows one. Say if you want it.

## Tie-out
Independent tie-out against `material.md` (the agent did not open `facts.json` or `.deckmark/`): **111 of 126 figures MATCH or ROUNDING-OK. 0 MISMATCH. 15 UNSUPPORTED.**

The 15 UNSUPPORTED items are not wrong figures:
- Wave structure and labels (p1, p2, p3, p8, p12, p13): "three waves", "wave one", and the three-wave roadmap. This is our recommendation, not a material figure.
- Deck-internal counts (p3, p8, p10, p11, p13, p14): "four claims", "three options", "two inputs", "four beliefs", "one condition", "four inputs".
- The 2026 cover date (p1).
- Month 6 and Month 12 on the p12 timeline. These are a team proposal, and the p12 footer says so.

The tie-out agent counted text numbers loosely, so the 126 total is higher than the number of distinct facts (28). No printed figure conflicts with `material.md`.

## Deviations from the draw and the picks
- **Cover:** the draw said `split` (title left, one key figure in a panel right). I built a full dark cover with no key-figure panel. This was a miss, not a material refusal.
- **Exec summary:** the draw said "one-line answer above three boxes". I used three labelled rows, with the governing thought as the title only.
- **Chart emphasis:** the draw said table-led, with sparklines. I used bar and waterfall charts plus tables. No sparklines.
- **Dividers:** none, which fits the 14-page length.
- **Honesty gaps, left as marked gaps and not estimated:** build cost per use case, loaded cost per hour (so no dollar value of hours), survey sample size and date, benchmark peer set, restatement root causes.
- **Proposals, labelled as proposals:** the three-wave split, the month timing, the proposed owner roles, and "release wave two at month 6".

## Where the skill instructions were unclear, wrong or missing

1. **`scripts/theme.mjs` silently does nothing when run through the `~/.claude/skills/deckmark` symlink.** Line 372 checks `process.argv[1]` against `fileURLToPath(import.meta.url)`. The second is the realpath, so the first is never equal and the CLI exits with no output. I hit this and worked around it by calling the realpath `<repo>/skill/deckmark/scripts/theme.mjs`. The same guard pattern exists at `charts.mjs:335`, `decklint.mjs:314` and `render.mjs:46`. `decklint` and `render` worked for me only because I used the realpath too. SKILL.md shows the `<dir>` path as `~/.claude/skills/deckmark` and never mentions the realpath.
2. **Body-text minimum disagrees between files.** `SKILL.md` Floor 7 and `references/gates.md` §1 say body text is 14px minimum on 16:9. `scripts/decklint.mjs:18` (`min-font`) says body is 12px. So the linter passes 12 to 13px body text that the Floor forbids.
3. **Title length disagrees.** `SKILL.md` Floor 3 says 20 words max. `references/archetypes.md` line 10 says "max ~15 words". `gates.md` §1 says 8 to 20 words.
4. **`references/fields/` is an empty directory.** SKILL.md and `fields.md` point to `fields.md` (which exists), so the empty folder is just stray, but it is confusing.
5. **The draw is advisory in the text, but nothing enforces it or records the miss.** `SKILL.md` Step 2 says "take it unless the material refuses a pick". I did not take the cover or exec-summary picks and nothing flagged that. A check comparing the built deck to the draw's log entry would catch this.
6. **Ghost-deck status is mentioned but not specified.** `storylines/scr-strategy.md` asks for a confirmed, in-progress or missing status on each slide "in the handoff, not on the slide". The handoff format is not defined anywhere, so I did not produce one.
7. **`theme.mjs log` example uses `"archetypes": [...]`.** The placeholder is not valid JSON, so the example cannot be pasted as written. I used a real array.
8. **Scaffold head loads Google Fonts over the network.** `theme.mjs scaffold` writes `<link>` tags to Google Fonts. Offline renders fall back silently. SKILL.md does not mention this.
9. **Gates §3 R1 vs decklint `accent-colours`.** R1 says "more than two hues" and the linter checks "more than 3 accent colours". The thresholds differ, so the two gates do not agree.

## Note on the worktree guard
At session start, a guard reported two other agents in `<repo>` on `master`. I worked only in `test/herdr/strategy` and did not commit. I did not edit anything under `<repo>/skill`.
