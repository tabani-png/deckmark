# Deckmark test run: Project Harbor (Northbay Dental Partners, fictional)

## Theme picked and why
- **Theme:** Quiet Mandate (dealt 1 of 3). Field: banking.
- **Why:** The reader is PE sponsors in a sell-side round 1. The theme is a boutique CIM register (serif titles, navy, one muted accent). Its keyword list includes "cim" and "sell-side", and the deal ranked it first.
- **Storyline:** `cim`, compressed to 15 slides.
- **Draw:** `b19a18`. Cover "split" and "KPI strip over three claims" were used. Dividers were not used, because the archetype reserves dividers for decks over 15 slides.

## Slide count
15 slides, 16:9. Output: `deck/deck.html`, `deck/out/deck.pdf`, `deck/out/page-01.png` to `page-15.png`.

## Lint outcome
`decklint deck/deck.html --render --facts facts.json`: **PASS, 0 FAIL, 0 REFLEX, 0 waived, 1 NOTE.**
- The NOTE says 17 facts are not tagged with `data-fact`. They are printed as plain numbers, and each one still traces by value.
- Lint first failed on the cover figure (40px serif in a box). The browser probe showed it inside its box. I reduced it to 36px. The lint result is passing now.

## Review verdict
- Fresh-context review (PNGs, storyboard and gates section 6 only): **fix**.
- Fixes made: page 5 title now says "implied" for the $13.0M. Page 15 title no longer claims a count. Page 15 table now lists the six gaps that were missing.
- Not changed, with reasons: pages 2, 8, 11, 12, 14 and 15 have white space because the material is thin. Page 4 restates later pages on purpose, as a summary. Page 7 title uses growth rates that the chart does not show; the bars show levels, and the rates are in the sidebar.
- Not added: purchase price for the 11 LOI practices, cash flow, capex, net debt, and a business description. The material does not contain these. The reviewer asked whether they exist. Please confirm before the IOI.

## Tie-out outcome
Independent tie-out re-read `material.md` only: **137 figures. 88 MATCH, 47 ROUNDING-OK, 0 MISMATCH, 2 UNSUPPORTED.**
- Both unsupported claims are fixed: "Seven items" count was removed, and the cover date "November 2026" became "Draft · Round 1".
- Every derived figure (growth, margins, CAGR, reported EBITDA, 11.0%, 22.5%) recomputes from the source.

## Skill problems (file and line)

1. **`scripts/theme.mjs:372`, plus the same guard in `charts.mjs:335`, `decklint.mjs:314`, `render.mjs:46`.** The main-module guard compares `import.meta.url` (a real path) with `process.argv[1]` (the path as typed). `~/.claude/skills/deckmark` is a symlink to `<repo>/skill/deckmark`. Running `theme.mjs deal` through the symlink printed nothing and exited 0. Running the real path works. Workaround used: call scripts by the real path. A silent exit 0 is a bad failure mode.
2. **`SKILL.md:26` vs `scripts/decklint.mjs:18` vs `references/gates.md:9`.** Body text minimum is 14px in SKILL.md and gates, but decklint checks 12px. Lint passes sizes that the skill says must fail.
3. **`references/gates.md:9`, `references/archetypes.md:29`, and `references/storylines/cim.md` (no dividers rule).** The draw can say "full-bleed dividers" for a 15-slide deck, while the archetype says dividers only for decks over 15 slides. The draw and archetype disagree. I followed the archetype and named the swap.
4. **`SKILL.md` Step 2 "The draw", and `scripts/theme.mjs` draw output.** The draw says "first exhibit after the summary: waterfall-bridge". The rule does not say whether highlight tiles count as an exhibit. I treated tiles as non-exhibit and put the bridge first.
5. **`scripts/theme.mjs:236` scaffold stamp.** The scaffold writes `storyline: <slug>` and `draw: <seed>` placeholders. The skill does not say to replace them. It also does not say where `cover: <drawn>` values come from. I filled them by hand.
6. **`SKILL.md` Step 0 and Step 2.** The skill does not say what to do when the material gives no codename. The theme says "never name the company on the cover". I picked "Project Harbor" as a label and marked it as a pick. A rule for this case is missing.
7. **`scripts/decklint.mjs` overflow check.** A 40px serif figure in a flex-grid cell was flagged as spilling out of its box. A browser probe showed it inside its box (right edge 1100 px, box edge 1235 px). The rule has no tolerance for line-height, and the message gives no detail. I could not tell which rect failed without writing my own probe.
8. **`SKILL.md` Step 6, Build.** The skill says "Write only slides" after scaffold, but the scaffold does not give cover or tracker classes that match the theme (the theme's `.light` cover needs a manual class). The gap cost time.
9. **`SKILL.md` Step 7.4 (fresh-context review) and `gates.md` section 6.** The prompt says "answers ship, fix or rebuild". It does not say what to do with a `fix` verdict that conflicts with the Floor. I applied only the fixes the Floor required, then stopped at one batch as the skill's budget says.
10. **Worktree.** The session warned that two other agents (PIDs 246, 252) were working in `<repo>`. The skill does not say whether to use a separate worktree for a build. I built in the folder you named and did not stop the other agents.

## Files
- `deck/deck.html`, `deck/tokens.css`, `deck/base.css`, `deck/out/` (PDF and 15 PNGs)
- `facts.json` (41 facts with sources), `.deckmark/STORYBOARD.md`, `.deckmark/build.mjs`, `.deckmark/log.json`, `.deckmark/preflight.json`
- Nothing under `<repo>/skill` was edited.
