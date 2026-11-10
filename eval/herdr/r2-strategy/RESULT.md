# RESULT · Lakeshore Mutual Bank · AI in finance roadmap (test run)

## Outcome
- Deck: `./deck/deck.html` (11 slides, 16:9). PDF: `./deck/out/deck.pdf`. PNGs: `./deck/out/page-01.png` to `page-11.png`.
- Storyline: `scr-strategy`. Reader: CFO and executive committee. Decision: approve the roadmap and budget.
- Storyboard (ghost deck): `./.deckmark/STORYBOARD.md`. 9 confirmed, 2 in progress, 0 missing.

## Theme
- **Meridian** (dealt 1 of 3). Chosen over Ledgerline (public-sector register) and Gridline (energy-study look).
- Why: serif action titles and a plain navy and blue palette fit a strategy deck for an executive committee.

## Draw
- Seed `b786cd`. Cover: typographic. Dividers: none (under 16 slides). Exec: KPI strip over three claims.
- Lead exhibit: issue tree. Built as two tables (components.md has no tree class). This is a swap.
- Options table is built as `harvey-table` with no harvey balls (no scoring basis in the material). This is a swap.

## Lint
- `decklint --render --facts`: **PASS, 0 fail, 0 reflex, 0 waived.** Run after every rebuild. Final run clean.

## Review (fresh context, PNGs + storyboard only)
- Verdict: **fix**. Fixes applied: slide 9 budget split marked open; slide 10 title and exhibit numbers corrected; slide 4 peer-median method flagged; slide 3 title no longer overstates AP; slide 11 footer test wording removed.
- Not changed: the 60% message repeats on slides 2, 5, 6, 7 and 9 (by design: exec, options, bridge, plan, ask). Table text is 10px on a 1280px slide, so it reads small on a phone. Both are noted, not fixed.
- Re-check after fixes: slides 3 and 10 re-read and clean. Slide 9 not re-read after the wording change.

## Tie-out (independent, source only: `material.md`)
- **TIES.** 57 MATCH, 30 ROUNDING-OK, 10 UNSUPPORTED, 0 MISMATCH.
- UNSUPPORTED items are team proposals (wave windows, wave grouping, owners, timings), a document date, and a 2023 data request. None contradicts the source.
- Exhibit numbering flagged by the tie-out was already corrected (slide 9 Exhibit 6, slide 10 Exhibit 7).

## Open items (in the deck, slide 10)
- Loaded cost per finance hour, so 58,000 hours can be priced in dollars.
- Budget split by use case and by wave.
- Named owner for each wave.
- Prior-year journal volume and restatement count.
- Peer median method and date.

## Deviations from the skill
- Skipped the "cover and exec first" partial render (SKILL.md:128). Built all slides, then rendered. The `--pages` option was not tested.
- Field: asked for `cfo`, which `theme.mjs deal` rejects. Used `consulting`.
- No worktree was made. Two other agents were already in `<repo>` (guard notice). New files were written only under `test/herdr/r2-strategy/`.
- `<repo>/skill` was not touched. Used the skill at `~/.claude/skills/deckmark`.

## Where the skill was unclear, wrong or missing
1. **SKILL.md:61** says board/CFO → `cfo`. `scripts/theme.mjs` `deal` rejects `cfo`. Valid list: consulting, banking, asset-mgmt, credit, pe, public-sector, editorial, dashboard. `references/fields.md:47` has a `cfo` section nobody can reach.
2. **SKILL.md:126** scaffold command omits `--dealt`. The deal output says to pass it. Without it the stamp says "by request" (`scripts/theme.mjs:258`). I corrected the stamp by hand.
3. **SKILL.md:129** chart list omits `bridge` and ranked bars. Ranked bars need `bar` with `"orient": "h"`. `hbar` fails.
4. **SKILL.md:21** (Floor 2) says every printed number is in `facts.json`, but never says to wrap figures in `<span data-fact>`. `decklint` fails any unwrapped figure, including `0%`. The `data-fact` rule only appears in the scaffold's `facts.json` schema text.
5. **SKILL.md:128** partial render path (`--pages 1-2`) is not verified. I did not use it.
6. **`references/components.md`** has no class for an issue tree. The draw can still deal an issue tree as the lead exhibit (`theme.mjs draw`). The skill does not say what to do then.
7. **`references/components.md`** harvey section needs scores. The skill does not say what to do when the material has no scoring basis.
8. **SKILL.md Step 7 (tie-out, ~line 158)** does not say how the subagent should list the figures it checks. I had to define that myself.
9. **`scripts/theme.mjs` scaffold output** prints next-step commands under `<repo>/skill/deckmark/scripts`. SKILL.md says `<dir>` is `~/.claude/skills/deckmark`. The two paths differ.
10. **Concurrency:** the worktree guard reports two other agents in `<repo>`. The skill does not say what to do when a build runs in a shared working tree.
11. **Log:** `theme.mjs log` ran (entry 1 of 20) after the build.
