---
name: deckmark
description: "Use to make a finance-grade deck or PDF report that looks designed, not generated: strategy deck, CIM, teaser, pitch book, IC memo, credit memo, LP letter, board pack, investor day, public-sector report. Deals a house style per audience, builds HTML slides, renders PDF + PNG, lints in a real browser. Also redesigns an existing client deck (PDF, PPTX, HTML) keeping every figure, and audits one."
argument-hint: "<brief> | theme <slug> <brief> | redesign <deck.pdf|.pptx|.html> | audit <deck>"
version: 0.7.0
---

# Deckmark

Makes decks a model generates look like they came out of a top strategy firm, a bulge-bracket bank or a serious asset manager: a hard floor against the tells, a house style dealt per audience so two decks never look the same, one message per slide, every number traced to a source.

Architecture borrowed from Hallmark (MIT, Together AI): Floor, Reflex and Finish gates, a dealt theme, a structural draw, a browser linter and fresh-context reviewers.

`<dir>` is this skill's folder (`~/.claude/skills/deckmark`, often a symlink to the build repo; use this path). Every script prints its next commands with it.

**Where to work.** `<project>/deck/` holds `deck.html`, `facts.json` and the renders; `<project>/.deckmark/` holds the preflight, storyboard, log, generator scripts and lint output. Run every command from `<project>` (log and salt paths are relative) or pass `--log <project>/.deckmark/log.json`. Never write into the skill folder (the scripts refuse) or into another run's folder.

## The Floor

Binds every deck. None of it is waivable.

1. **No invented facts.** Every number, name, quote, logo, client and date comes from the user's material or a cited public source. A missing number is a one-line gap marker where it would go and a row on the one open-items page; never a plausible guess, never a half-empty table. Sample decks use clearly fictional companies.
2. **Every figure ties.** Every printed number is in `facts.json` with its source and `decklint --facts` passes; derived figures carry a `formula` decklint recomputes; totals carry `data-total` and add up; sources equal uses. A forced tie is a failure.
3. **Action titles.** Every content slide's title is its conclusion in one sentence, 2 lines max, 8 to 20 words. Never a topic label.
4. **One message per slide,** carried by one exhibit; a second exhibit supports the same message. Lean cuts commentary, never a source line, a unit, a disclosure or a gap marker.
5. **Every exhibit has a source line and its unit.** Every chart is drawn from data (`scripts/charts.mjs` or SVG from the same numbers), never a picture of a chart, never AI-generated.
6. **Tokens only.** Every colour and font goes through the theme's `:root` tokens.
7. **Nothing overflows, clips or collides.** Minimum sizes in `gates.md` § 1 (16:9: body 14px, cells and labels 10px, furniture 9px; A4: 11px, 8pt, 7pt). Body contrast 4.5:1. Two font families per deck.
8. **Numbers are set as numbers.** Tabular, right-aligned in tables, negatives `(12.4)` in banking, credit and PE, one decimal convention per deck, units in the header.
9. **No AI tells.** No emoji, no purple-blue gradient, no glow, no card in a card, no drawn browser window, no "Unlock", "Revolutionize", "Seamless", no em dashes in copy.
10. **Firm marks stay out.** A theme may be inspired by a kind of firm; it never uses a firm's name, logo or trademark. Brand colours come from the client's own file, never from memory.
11. Run `node <dir>/scripts/decklint.mjs <deck-dir>/deck.html --render --strict --facts <deck-dir>/facts.json` before handing back. Fix every FAIL; fix or waive every REFLEX.

Above the Floor: **Reflex** gates (defaults a model falls into, waivable on the record with a reason) and **Finish** checks (craft, never blocking), both in [`references/gates.md`](references/gates.md).

## Flow

0. Pre-flight: read the material.
1. Ask once.
2. Shape: storyline, spine, facts, draw.
3. Direction: the house style.
4. Load.
5. The Picks block, once.
6. Build: cover and exec summary first, reviewed, then the rest.
7. Sweep: lint, every PNG, the gates, two fresh-context checks.

**Verbs:** `theme <slug> <brief>` (a named style); `redesign <deck>` (rebuild an existing client deck lean and in brand, keeping every figure) and `audit <deck>` (a report): read [`references/redesign.md`](references/redesign.md) first. Changing an existing client deck in its own system is not a Deckmark run: do it as asked.

Branches (one slide, fast mode, generators, the edit-time hook, Codex and OpenCode): [`references/flow.md`](references/flow.md), one section at a time.

### 0. Pre-flight

Signals, in order: a `DECK.md` at the root (a locked house system that overrides every deal: [`references/house-system.md`](references/house-system.md)); a client brand (their website, their deck, colours they gave); a data room, model, statements or memo the deck must carry; an existing deck to redesign. Data-room material is confidential: stay local, no web egress of client figures, mask account numbers. Edge cases: `flow.md` § Pre-flight edge cases.

Write `.deckmark/preflight.json` with exactly these keys:

```json
{ "material": [{ "file": "accounts.pdf", "pages": "1-12", "what": "audited FY22-FY24" }],
  "numbers_available": ["revenue FY22-FY24"], "numbers_absent": ["FY25 actuals"],
  "confidential": true, "reader": "credit committee", "decision": "lend", "document": "credit-memo" }
```

Confidential material renders offline: the scaffold writes no Google Fonts link and uses system font fallbacks (`scaffold --offline` does the same on request).

### 1. Ask once

One message, even on a short prompt:

> *Before I build, four things. 1. **Material**, the one that matters most: the model, statements, data room, memo or numbers this deck must carry. I never invent a figure. 2. **Reader**: who reads it (IC, lender, LP, board, buyer, regulator) and what they decide. 3. **Document**: CIM, teaser, pitch book, IC memo, credit memo, LP letter, board pack, strategy deck, report, or describe it. 4. **Style**: a house you want it to feel like (strategy firm, bulge bracket, asset manager, Nordic public report, editorial, live dashboard) and a brand colour if any. Or say **go ahead** and I will infer and tell you what I picked.*

Skipped fields are inferred and stated in one line; facts never are. Headless or batch runs do not ask.

**Field,** silently, from the reader: IC / sponsor / LBO → `pe`; lender / covenant → `credit`; buyer / M&A / mandate → `banking`; LP / allocator / fund → `asset-mgmt`; board / CFO / budget → `cfo`; client strategy → `consulting`; ministry / agency → `public-sector`; family office / wealth → `wealth`. Read that field's section in [`references/fields.md`](references/fields.md) (vocabulary, numbers first, formats, look, distrust tells).

### 2. Shape

**Material first.** One line: *real* (every figure and fact supplied), *exhibits* (what each can become), *absent* (what the deck will not have).

**Storyline.** Pick from the index in [`references/storylines.md`](references/storylines.md) and load only that one file: slide order, each slide's job and archetype ([`references/archetypes.md`](references/archetypes.md)), the Words budget, and a **Short form** for thin material (build only what the material carries; list each section left out on the open-items page).

**Spine.** Write `.deckmark/STORYBOARD.md`: the governing thought, then the ghost deck, one line per slide (`NN · status · action title · archetype · exhibit and numbers · source`), format and statuses in `storylines.md` § The spine. Read the titles alone: if they do not tell the story, rewrite them before building.

**Facts.** `facts.json` beside `deck.html`; every printed figure wrapped in `<span data-fact="id">` with the bare number inside and the unit outside; derived figures carry a `formula`. Full pattern: [`references/patterns.md`](references/patterns.md) § Facts.

**The draw.** `node <dir>/scripts/theme.mjs draw --storyline <slug> --slides <planned count> --log .deckmark/log.json` deals the cover posture, dividers (16 slides or more only), exec-summary form, chart emphasis, title form, close and lead exhibit, clear of recent decks. Take every pick unless the material refuses it; each pick not built is a swap named in the Picks block. Its six-hex seed is scaffold's `--draw`; the deal's seed goes in `--dealt`. Nothing is written until `theme.mjs log` after the build.

**Judgment documents** (IC memo, credit memo, DD report, any review or score): thesis first, checks second; every flag tagged CHANGES THE DECISION / WORTH A QUESTION / EXPLAINED BY CONTEXT, only the first reaching the recommendation; neutral stance; the default outcome on one line under the recommendation and again on the close (`patterns.md` § Judgment flags).

### 3. Direction

Read [`references/direction.md`](references/direction.md): DECK.md, then a named theme, then the client's brand (`brand.mjs` on their website first, else their deck; light-paper themes for light brands), then a named look, then the deal:

```
node <dir>/scripts/theme.mjs deal --field <field> --format <slides-16x9|report-a4> --prompt "<the brief>" --log .deckmark/log.json
```

Open all three pictures (`references/themes/<slug>.png`), pick the one whose register fits the reader, say why in one line naming the other two, load only that theme file. Re-deal only when asked (`--reroll 1`). Faces: [`references/fonts.md`](references/fonts.md) only when the user or a brand names other faces.

### 4. Load

Exactly: the storyline file, `archetypes.md` (the archetypes the storyboard uses), the field section of `fields.md`, `references/themes/<slug>.md`, [`references/craft.md`](references/craft.md), [`references/layout.md`](references/layout.md), [`references/data-viz.md`](references/data-viz.md), [`references/components.md`](references/components.md), `gates.md` § 1 to § 4. `patterns.md` at Step 6. `gates.md` § 5 waits for the sweep. Only when needed: `export-formats.md` (A4, Letter, PPTX), `house-system.md` (lock the style).

### 5. The Picks block

```markdown
**Deckmark · v0.7.0**

- **Document** · CIM, 24 slides, 16:9 · reader: PE buyers in round 1 · decision: submit an IOI
- **Words** · cap 160 body words a slide, target 80-140, no prose tables (storyline cim)
- **Brand** · none (or: client deck, paper, field, accent, and why this theme fits that paper)
- **Field** · banking · density medium
- **Theme** · <Name>, dealt 2/3 (why it fits this reader, over <other two>)
- **Draw** · 4c1e9a, 24 slides · taken: cover, exec, emphasis, titles, close, lead exhibit · swaps: none
- **Governing thought** · one sentence
- **Spine** · Cover · Exec summary (SCR) · Investment highlights · ... · Appendix
- **Material** · real: FY21-FY24 audited, FY25 budget · absent: FY25 actuals, management bios
- **Ghost deck** · 20 confirmed · 3 in progress · 1 missing (→ open items)
- **Sweep** · run after build
```

### 6. Build

- **Scaffold:** `node <dir>/scripts/theme.mjs scaffold <slug> --out <deck-dir> --storyline <slug> --dealt "<n>/3, seed <deal seed>" --draw <draw seed> [--brand <client website URL or deck>] [--offline]` writes `tokens.css`, `base.css`, an empty `facts.json` and a starter `deck.html` with the stamp and the storyline's text budget. Fill the stamp's placeholders. Write only slides.
- **Components:** every class an author may use is in `components.md`; do not invent layout classes. The markup a model gets wrong (facts, gaps, totals, sources and uses, waivers, notes): `patterns.md`.
- **Show it, do not say it.** Pick what carries each slide in this order: a big number or comparison, a chart with direct labels and a one-line takeaway, a diagram, a column row of proof numbers, a table of numbers; text is what is left (`archetypes.md` § Show it, do not say it; `craft.md` § 7). decklint `wordy` and `prose-table` hold the storyline's Words cap.
- **Fill every slide, honestly** (`layout.md` § 3): scale the exhibit to the body, pair figures with their exhibit, `.col-row.big` for a row of short figures, merge thin slides, keep tables at natural height, cut what the material cannot fill. decklint `empty-slide` and `dead-band` measure ink, not boxes.
- **Charts from data:** `node <dir>/scripts/charts.mjs <type> --data <json>` returns SVG in theme tokens; which chart for which claim, labels, highlight and decimals: `data-viz.md`.
- **Cover and exec summary first.** `node <dir>/scripts/render.mjs <deck-dir>/deck.html --out <deck-dir>/out --pages 1-2`, look, then the cover review in fresh context ([`references/review-cover.md`](references/review-cover.md); the reviewer reads it, you never open it). Act on `ship` or `fix`, then build the rest.
- **Furniture on every content slide:** tracker, action title, exhibit, source line naming the reader's documents (never a build file), page number, confidentiality line when confidential.
- **Generators are fine** (`<project>/.deckmark/build.mjs`): the generated `deck.html` is what gets linted; re-run it after every fix (`flow.md` § Generators).
- **Log:** from `<project>`, paste the JSON line the draw printed, filled: `node <dir>/scripts/theme.mjs log --log .deckmark/log.json --entry '<json>'`.
- **PPTX** only when asked, with its limits said (`export-formats.md` § PPTX limits).

### 7. Sweep

1. `node <dir>/scripts/decklint.mjs <deck-dir>/deck.html --render --strict --facts <deck-dir>/facts.json`. Fix every FAIL; fix `empty-slide`, `dead-band`, `gap-sprawl`, `wordy` and `prose-table` at the root, not with a waiver (only required legal language may waive `wordy`).
2. Read every PNG. The PNG is the only real visual check.
3. Walk `gates.md` § 5. Fix Floor findings, fix or waive Reflex, answer Finish.
4. Finish review in fresh context: [`references/review-finish.md`](references/review-finish.md) with only the PNGs and the storyboard; act on its first word.
5. Independent tie-out: a subagent re-reads the SOURCE documents (never `facts.json`) and the final PNGs, and returns one line per printed figure: `page · figure as printed · source location · MATCH | ROUNDING-OK | DERIVED-OK | MISMATCH | UNSUPPORTED`, then the counts. It runs on the deck as it ships: any fix after it means re-running it.
6. Redesigns add `redesign.mjs kept` and `compare` (`redesign.md` § After).
7. Update the Picks block's last rows (`Floor 0 FAIL · Reflex 1 waived · review: ship · tie-out 48/48`) and the ghost-deck counts. A fabricated pass is itself a failure. Then one quiet line, skipped when DECK.md exists: *House style portable? Say `lock the house style` for a DECK.md.*

Budget: one fix batch per review, one confirming round: re-lint with `--strict`, re-read every changed PNG, re-run the tie-out.
