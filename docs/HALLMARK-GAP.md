# Hallmark to Deckmark: the gap map

Every file and feature in Hallmark v2.0.0 (MIT, `skills/hallmark/`), its Deckmark equivalent, where Deckmark stood at v0.5.0 and what v0.6.0 did about it. Status before v0.6: **have**, **partial**, **missing**, or **N/A** (not applicable to static finance decks, with the reason). Images, photographs and image generation are out of scope by rule: Deckmark never generates or places images, so every imagery feature is N/A.

## Counts

| Before v0.6 | Rows |
| --- | --- |
| have | 22 |
| partial | 14 |
| missing | 27 |
| N/A | 13 |
| **total** | **76** |

After v0.6: every partial and missing row is built (41 of 41; the N/A rows are all images, motion, interaction or a marketing site). Two are built in part and say so in the row (PPTX page images in redesign; DECK.md read by instruction, not yet diffed by script); both are on the [roadmap](../ROADMAP.md).

## SKILL.md and the flow

| Hallmark | Deckmark | Before | v0.6 |
| --- | --- | --- | --- |
| SKILL.md, 154 lines, detail in references loaded by step | `skills/deckmark/SKILL.md` | partial: 198 lines, build detail inline | 144 lines; facts, filling, charts, direction, brand and spine detail moved to references and loaded by step; refcheck caps it at 160 lines and 19,000 bytes |
| The Floor (16 rules) | The Floor (11 rules) | have | brand colours from the client's file, never from memory, added to Floor 10 |
| Flow steps 0 to 7 | Steps 0 to 7 | have | each step names what it loads |
| Pre-flight signals and `preflight.json` | Step 0, `.deckmark/preflight.json` | have | edge cases in `flow.md` |
| Ask once | Step 1 | have | |
| Genre detection | Field detection, `fields.md` | have | |
| Shape, the job, signature | Storyline, spine, governing thought | have | |
| The draw | `theme.mjs draw` | have | lead-exhibit pool held to real archetype names |
| Direction: named theme, custom, deal | Step 3 | partial: no file on how to pick or justify | `direction.md` (§ 2 picking from the deal) |
| Picks block | Step 5 | have | version v0.6.0, held by refcheck |
| Hero first, hero review | Cover and exec summary first | partial: render first two pages, no review prompt | `review-cover.md`, run in fresh context at Step 6 |
| Sweep, finish review | Step 7, `gates.md` § 6 | partial: one inline prompt | `review-finish.md` (MD reading cold, rerender, rebuild, fix, ship; redesign question) |
| Verbs `redesign`, `audit` | | missing: `audit` was a one-line verb, no redesign | `redesign.md` and `scripts/redesign.mjs` (extract, kept, audit, compare) |
| Branches file (`flow.md`) | `flow.md` | missing | pre-flight edge cases, one slide, fast mode, generators, edit-time hook, harnesses |
| Fast mode | `flow.md` § Fast mode | missing | built |
| Component scope | One slide or a one-pager (`flow.md`) | missing | built |
| App screens | | N/A | decks have no app screens; the dashboard field and themes cover scorecards |
| Signal 8 (Inspo MCP), comp before build (signal 9) | | N/A | both are image or archive driven; out of scope |
| Harness table (Claude Code, Codex, OpenCode) | `flow.md` § Harnesses | missing | built |

## References

| Hallmark | Deckmark | Before | v0.6 |
| --- | --- | --- | --- |
| `craft.md` (type, colour, surfaces, motion, copy, openings, missing facts, finish) | `craft.md` | missing | slide craft: grid, hierarchy table, white space, type, colour, numbers, copy, missing facts, finish |
| `layout.md` (canvas, sizes, sections, compositions, hero, page) | `layout.md` | partial: frame in `archetypes.md`, filling in SKILL.md | composition table, filling order, cover and exec summary, pace, A4, the thumbnail check |
| `data-viz.md` | `data-viz.md` | partial: chart notes in SKILL.md | which chart for which claim, construction, emphasis, honesty, tables as exhibits, dark grounds |
| `fonts.md` | `fonts.md` | missing | finance pairings, faces that need a reason, system stacks and offline builds, loading, client faces |
| `direction.md` (custom runs) | `direction.md` | partial | order of authority, picking from the deal, client brand, firm marks, without Node |
| `brand-truth.md` | `direction.md` § 3, `house-system.md` | partial: `brand.mjs` measured the brand, no protocol | never a brand colour from memory; ask once when there is no file |
| `design-md.md` (lock the system) | `house-system.md` (`DECK.md`) | missing | format, triggers, how pre-flight honours it; read by instruction (a scripted diff is on the roadmap) |
| `export-formats.md` | `export-formats.md` | missing | PDF 16:9 and A4, PNG, PPTX limits (pictures, not editable), print, offline |
| `review-hero.md` | `review-cover.md` | missing | built |
| `review-finish.md` | `review-finish.md` | partial | built |
| `redesign.md` | `redesign.md` | missing | keeps every figure and required text; depths full, restyle, polish; before, ask, plan, build, after, handoff |
| `patterns.md` | `patterns.md` | partial: in SKILL.md | facts, gaps, totals, sources and uses, waivers, notes, judgment flags, the stamp |
| `gates.md` | `gates.md` | have | R19 `dead-band`; Floor rule names listed; § 6 points at the two review files |
| `anatomy.md` (what real sites in a category are built around) | `storylines/*.md`, `fields.md` | have | each storyline's "What practitioners expect" plays this part |
| `macrostructures.md` + 21 shape files | `storylines.md` + 13 storyline files | partial: no index, no picking rules, Short form in 2 of 13 | index, how to pick, the fingerprint axes the draw deals, the spine; Short form in 12 of 13 (the teaser is already short) |
| `genres/*.md` (voice, allowed, refused, chrome) | `fields.md` | partial | a **Look** per field: what the slides are built from, how colour is used, what it refuses |
| `themes/*.md`, pictures, `index.json` | `themes/*.md`, `.png`, `index.json` | have | refcheck holds picture and index rows |
| `themes/README.md` | | N/A | theme authoring is covered by `theme.mjs check` and the theme files themselves |
| `imagery.md` | | N/A | images out of scope |
| `texture.md` | `craft.md` § 5 bans | N/A | print artifacts (grain, halftone) have no place in a finance deck |
| `dark-mode.md` | dark themes, `data-viz.md` § 6 | N/A | a deck has one paper; dark themes exist, dual mode does not |
| `interaction-and-states.md`, `microinteractions.md` | | N/A | static decks have no controls |
| `scroll-choreography.md` | | N/A | no scrolling or motion in a deck |
| `responsive.md` | `export-formats.md` | N/A | fixed page sizes; 16:9 and A4 are formats, not breakpoints |
| `comp.md` | | N/A | image generation |

## Scripts

| Hallmark | Deckmark | Before | v0.6 |
| --- | --- | --- | --- |
| `theme.mjs` (index, deal, draw, scaffold, log, check, validate) | `theme.mjs` | have | lead-exhibit pool fixed to real archetypes |
| Reroll exhaustion handling | `theme.mjs deal --reroll` | have, untested | `reroll-exhaustion.test.mjs`: a billion rerolls terminate, no repeats until the catalog is spent |
| `sloplint.mjs` static tier | `decklint.mjs` static tier | have | |
| `sloplint-render.mjs` render tier | `decklint.mjs --render` | have | `dead-band` reflex added |
| `--kept`, `--before` (redesign record) | `redesign.mjs extract`, `kept` | missing | built: PDF, PPTX (text and chart values) and HTML |
| `compare.html` | `redesign.mjs compare` | missing | built |
| `refcheck.mjs` | `refcheck.mjs` | missing | links, file mentions, § sections, component classes against base.css and charts.mjs, storyline and draw archetypes against archetypes.md, decklint rules against gates.md, versions, dashes, theme pictures and index, SKILL.md size, orphans |
| `install.mjs` | `install.mjs` | missing | Claude Code, Codex and Cursor, OpenCode; copy or `--link`; refuses to replace a working-copy symlink without `--force`; `--home` for tests |
| `install-hook.mjs` | `install-hook.mjs` | missing | project or global settings, idempotent, keeps other hooks, `--remove`, `--print` |
| `lint-hook.mjs` | `lint-hook.mjs` | missing | decklint static on a written deck; blocks only on a Floor FAIL; never installed on this machine |
| `agents/openai.yaml` | `agents/openai.yaml` | missing | built |
| `capture.mjs`, `picture.mjs`, `imagegen.mjs`, `photos.json` | | N/A | images out of scope |
| | `charts.mjs` | have (Deckmark only) | stacked segments never lose their label; flow nodes grow with the box |
| | `brand.mjs` | have (Deckmark only) | thin-rule accents found by hue distinctness |
| | `render.mjs` | have (Deckmark only) | |

## Tests

| Hallmark | Deckmark | Before | v0.6 |
| --- | --- | --- | --- |
| `theme.test.mjs` | `test/unit/theme.test.mjs` | missing | check on LF and CRLF, firm names, deal, draw, scaffold, log rotation |
| `reroll-exhaustion.test.mjs` | `test/unit/reroll-exhaustion.test.mjs` | missing | built |
| `sloplint-render.test.mjs` | `test/unit/decklint.test.mjs` | missing (fixtures in run.sh only) | every rule on a tiny fixture, static and render, waivers |
| | `test/unit/charts.test.mjs` | missing | built, including the 14.2 stacked label |
| | `test/unit/brand.test.mjs` | missing | built, including a thin red rule on navy and white |
| | `test/unit/render.test.mjs` | missing | built |
| | `test/unit/redesign.test.mjs` | missing | built (synthetic PPTX, HTML, PDF via poppler) |
| | `test/unit/hooks.test.mjs`, `refcheck.test.mjs` | missing | built |
| `capture.test.mjs` | | N/A | no capture |
| Fixtures (`slopped.html`, `kept/`, waivers) | `test/fixtures/` | have | |
| CI | `.github/workflows/test.yml` | have | refcheck, unit tests, poppler, the eval harness tests |

## Packaging

| Hallmark | Deckmark | Before | v0.6 |
| --- | --- | --- | --- |
| `package.json` `skill` block, `files` | `package.json` | partial | `skill`, `files`, `engines`, `test:unit`, `refcheck` |
| Skill-folder `LICENSE` | `skills/deckmark/LICENSE` | missing | built (the installer copies it) |
| README "New in", install | `README.md` | partial | New in v0.6, installer and hook |
| ROADMAP | `ROADMAP.md` | have | v0.6 done list and redesign follow-ups |
| `eval/` | `eval/` (separate work) | have | not touched here |
| `site/`, `vercel.json` | | N/A | no marketing site |
