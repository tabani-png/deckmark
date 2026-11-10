# Roadmap

Open items for the next versions. Each one was seen in a render or a test run.

## Done in v0.6

- Redesign and audit verbs (`redesign.mjs extract | kept | audit | compare`), the Hallmark-depth references, `refcheck.mjs`, `install.mjs`, the opt-in edit-time hook, the Codex manifest, 61 unit tests, the `dead-band` reflex and `.col-row.big`, stacked-bar labels that are never dropped, thin-rule brand accents. Gap map: [docs/HALLMARK-GAP.md](docs/HALLMARK-GAP.md).

## Redesign

- **PPTX before-images.** `redesign.mjs extract` reads a PPTX's text and chart values but cannot render its pages; export to PDF first for the before images and `brand.mjs`. A LibreOffice route (`soffice --convert-to pdf`) when it is installed would close this.
- **Figure matching by value.** `kept` matches figures by their digits; a figure the new deck shows rounded (384 for 384.2) must be a printed fact or dropped on the record. Matching within rounding of a printed fact would cut the dropped list.
- **DECK.md checked by machine.** Pre-flight honours a DECK.md by instruction; `scaffold` could read it and diff `tokens.css` against its `## Tokens` block.

## Themes and layout

- **Folio North A4 starter trips `empty-slide`.** The A4 starter deck for `folio-north` does not fill its body area, so decklint's `empty-slide` reflex fires on it. The 16:9 starters all lint clean with `--strict`; the A4 starters are not yet in that loop.
- **Glasswork starter cards look tall and thin.** The frosted cards in the `glasswork` starter stretch to the body height with little in them. They should keep their natural height and sit beside an exhibit. (v0.6's `dead-band` counts a filled card as visible mass, so the starter lints clean; the look itself is still open.)
- **A default `.col-row` alone on a slide.** The plain row stretches its columns (head at the top, figure at the foot), which `dead-band` flags. v0.6 adds `.col-row.big` (tiles that take the height); the default could become that once existing decks are re-rendered against it.
- **Covers are half empty in the lower part.** Several covers put the title block in the upper half and leave the lower half bare. Covers need a lower anchor (the key figure, the decision line or the document line) so the page reads as finished.

## Storylines

- **No research-note storyline.** `newsprint` and `editorial` are pictured as equity research notes and outlooks, but there is no `research-note` storyline to order one (rating and target first, thesis, estimates and changes, valuation, risks, disclosures).

## Charts

- **Negative bar labels collide with category labels.** In `scripts/charts.mjs`, when a bar chart's minimum is below zero, the value label under a negative bar overlaps the category label beneath the axis. Reserve bottom margin for the value label when `min < 0`.

## Export

- **PPTX converter is not in this repo.** SKILL.md builds a PPTX from the rendered PNGs with a script from a separate local skill, and points at that skill's NDA guardrails for data rooms. Both should ship here or be described without the external path.

## Testing

- **A third herdr round on v0.4.** Rounds one and two ran on v0.1 and v0.2. v0.3 fixed what round two found and v0.4 added eight themes; neither has been run end to end by a fresh agent. Run the same three fictional cases (CIM, credit memo, strategy deck) plus one case on a new theme, and record them in `eval/herdr/r3-*`.
