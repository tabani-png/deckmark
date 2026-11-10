# Deckmark test run: Halden Packaging credit memo

## Theme picked and why

**Ochre Covenant** (`ochre-covenant`), dealt 1 of 3 for field `credit`.

Why: it is the only dealt theme with field fit to private credit. Its register (navy, one ochre accent, rolling tables, no red or green mood colours) suits a lender reading a credit memo. It also ships a `credit-memo` dial. The other two dealt themes were Quiet Mandate and Fairness Room (banking, adjacent field). They were not used.

Storyline: `credit-memo`. Draw `28b4b9`: split cover, numbered answer-first exec summary, no divider slides, annotated CAGR label on time series, close as chevrons.

## Slide count

17 slides, 16:9. Build files are in `deck/`:
- `deck/deck.html`, the slides
- `deck/facts.json`, every printed figure with its source or formula
- `deck/charts/*.svg`, charts drawn from data by `charts.mjs`
- `deck/out/deck.pdf` and `deck/out/page-01.png` to `page-17.png`
- `.deckmark/STORYBOARD.md`, `.deckmark/preflight.json`, `.deckmark/log.json`

## Lint outcome

`decklint deck.html --render --facts facts.json`: **PASS, 0 FAIL, 0 REFLEX, 0 waived.** One note: 12 facts were never printed (tenor, pricing, floor, oid, ridge_share, rev_cagr, m25x, top1). These are not errors.

Lint passed a deck that still has a real sources-and-uses gap. See item 4 below.

## Review verdict

Fresh-context reviewer (given only the PNGs, the storyboard and gates.md § 6): **fix**.

Applied:
- Slide 2 headline now shows both 2.96x pro forma and 3.32x reported.
- Slide 5 title now gives the growth rates (6.7% to 4.4%) instead of saying "slowing" alone.
- Slide 12 chart now shows the EBITDA levels the title talks about. The old chart showed leverage bars, and its highlight did not match the title.
- Slide 2 open-items wording and slide 15 title no longer say "three open items". The material names three, and the deck's list was different.

Not applied:
- Reviewer point 4 said 24.1% gross margin has no visible source. It is in the table on slide 6. The reviewer misread the slide.
- Reviewer point 8 (tags read as machine-made): the tags are the skill's required convention, so I kept them.

## Tie-out verdict

Independent tie-out (re-read `material.md` only, not `facts.json`): 115 printed figures.

- MATCH: 61
- ROUNDING-OK: 50
- MISMATCH: 1. The revenue CAGR was printed as 5.5%. Recomputed: (158.2/142.0)^0.5 - 1 = 5.5502%, which rounds to **5.6%**. **Fixed** on slide 5, in the chart label, and in `facts.json`.
- UNSUPPORTED: 3. Two were wording counts that did not match the material ("three open items", "five items still requested"). **Fixed** by rewording. The third is "four conditions" on slide 16. That list is the deal team's draft, and it is labelled as such on the slide. Left as is.

After the fixes, lint is still PASS.

## Picks block, final row

`Floor 0 FAIL · Reflex 0 · review: fix (applied, see above) · tie-out 115 rows: 1 mismatch fixed, 3 wording fixed, 1 draft list kept`

## Judgment calls I made (please check)

1. **Draft label "approve with conditions".** The material lists the decision options but does not recommend one. I wrote this label as a draft for the committee. The four conditions are my draft, not the material's.
2. **Pro forma leverage 2.96x.** The material states it. The deck also shows 3.32x on reported EBITDA, because the Ridgeway add-back is in doubt.
3. **Covenant cushions use gross debt.** No cash balance was supplied. Net leverage would be lower with any cash, so the cushions shown are conservative.
4. **Sources do not tie.** The material's uses are 85.0. Its debt is 85.0 at a 98.0 OID, which yields 83.3 cash. The deck shows the 1.7 gap as an open item and does not force a tie.

## Material problems the deal team should check

1. **Sponsor equity does not reconcile.** Uses are fully covered by the 85.0 of debt, so no sponsor cash shows at close. Yet line 7 says sponsor equity is 45% of pro forma capitalisation. On 85.0 of debt that implies about 69.5. The deck shows the equity cheque as n/a.
2. **Ridgeway period conflict.** Line 4 labels the 3.1 as an FY2025 budget figure. Line 6 adds it to FY2024 to reach 28.7.
3. **Budget compares unlike bases.** The FY2025 budget includes Ridgeway, and the actual years do not. Ex-Ridgeway, budget EBITDA is 25.3, below FY2024's 25.6.
4. **OID treatment unclear.** The uses have no OID line. It is not stated whether the 1.7 discount sits inside the 3.0 of fees.
5. **Customer concentration period not stated.** Top customer 18% and top five 41% have no period.
6. **Covenant is net, inputs are gross.** Line 8 tests net leverage. No cash is given, so gross is used as a proxy.

## Skill problems: where the instructions were unclear, wrong or missing

Paths are relative to the skill folder (`~/.claude/skills/deckmark` is a symlink to `<repo>/skill/deckmark`).

1. **Scripts exit silently when run through the symlink (wrong).** `scripts/theme.mjs:372`, `scripts/charts.mjs:335`, `scripts/decklint.mjs:314`, `scripts/render.mjs:46` all guard with `fileURLToPath(import.meta.url) === process.argv[1]`. When the path goes through a symlink, the guard is false and the command does nothing and exits 0. `theme.mjs deal` printed nothing. Workaround: call the real path (`<repo>/skill/deckmark/scripts/...`). The fix belongs in the guard (compare realpaths), not in the docs.

2. **Sources must equal uses is documented but not enforced (wrong, serious).** `references/gates.md:22` says "Sources equal uses … (L where the table carries `data-total`)". `scripts/decklint.mjs` has no `data-total` handling. The attribute syntax is not documented in SKILL.md or gates.md either. Result: the 83.3 vs 85.0 gap on slide 10 passed lint. The Floor "totals add up" rule is not checked by machine.

3. **Derived figures are not checked (missing).** Lint's untraced check only confirms that a printed number appears in `facts.json`. It does not recompute derived values. My own `facts.json` carried a wrong CAGR (5.5% instead of 5.6%), and lint passed it. Only the independent tie-out caught it. SKILL.md § 7 should say that the tie-out is what checks derivations, or lint should recompute any fact that has a formula.

4. **`--facts` file location is not stated (ambiguous).** SKILL.md § 6 and § 7 write `facts.json` and `--facts facts.json` with no folder. The scaffold writes into `<deck-dir>`. I put it in `deck/`. Please state the expected location.

5. **Ambiguous "render cover and exec summary first" step (ambiguous).** SKILL.md § 6 says to render the cover and exec summary, then build the rest. `render.mjs` renders the whole deck and has no per-slide option. I rendered everything at each pass.

6. **Look at each theme picture (unclear).** SKILL.md § 3 says "Look at each picture … pick the one whose register fits". I viewed only the chosen theme's PNG. The skill does not say whether all three must be viewed.

7. **`sources-uses` class breaks tables (wrong or undocumented).** `assets/base.css:229` defines `.sources-uses` as a two-column grid wrapper, not a table style. Putting it on a `<table>` broke the layout on first render (the Sources and Uses headers became chips). Neither SKILL.md nor gates.md mentions the class. Fixed by removing it from the tables.

8. **Scaffold hard-codes a Google Fonts link (missing, for confidential decks).** `scripts/theme.mjs:244` writes `fonts.googleapis.com` and `fonts.gstatic.com` links into every deck. Rendering a confidential deck therefore makes outbound requests. SKILL.md § 0 says no web egress of client figures. The font request carries no figures, but the skill does not mention it or offer a local-font option.

9. **Empty folder left in the skill (cruft).** `references/fields/` is empty. SKILL.md § 1 and § 4 point to `references/fields.md`. Remove the empty folder.

10. **Not exercised.** The data-room NDA guardrail (SKILL.md § 0, pointing to `cim-builder/SKILL.md`) did not apply, so I did not check it. PPTX export was not requested.

## Shared repo note

A session-start guard reported two other agents working in `<repo>` (PIDs 249 and 252). I did not use a worktree, because the job asked for `./deck/` in this folder. I wrote only under `test/herdr/credit-memo/`. I made no commits. I did not edit anything under the skill folder.
