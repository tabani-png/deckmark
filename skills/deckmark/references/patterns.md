# Patterns

The markup a model gets wrong when left alone: facts, gaps, totals, financing tables, waivers, notes and judgment flags. Read once at Step 6. Take the shape, never the copy.

## Facts

`facts.json` sits next to `deck.html` (the scaffold writes an empty one with its schema). Every printed figure is one entry:

```json
{ "facts": {
  "rev_fy25": { "value": 48.3, "display": "48.3", "unit": "$m", "source": "audited accounts FY25 p4" },
  "margin_fy25": { "value": 16.2, "display": "16.2", "unit": "%", "source": "derived", "formula": "ebitda_fy25 / rev_fy25 * 100" },
  "rev_cagr": { "value": 8.9, "display": "8.9", "unit": "%", "source": "derived", "formula": "((rev_fy25 / rev_fy21) ^ (1 / 4) - 1) * 100" }
} }
```

Every figure is wrapped where it prints, the bare number inside the span and the unit outside, so one fact prints in a table cell and in a sentence alike:

```html
$<span data-fact="rev_fy25">48.3</span>M · <span data-fact="lev">2.9</span>x · <span data-fact="margin_fy25">16.2</span>%
```

- decklint compares the span's text to `display` exactly (FAIL `tieout`) and recomputes every `formula` (FAIL `formula`, tolerance half the last shown digit).
- A number with no `data-fact` FAILs `untraced` unless its value is in `facts.json`. Years and small counts under 13 are exempt by themselves.
- Not a figure: a cross-reference takes `data-ref` (`see <span data-ref>p. 6</span>`); a figure whose source is named inline takes `data-src="<where>"`.
- Charts: pass the same numbers to `charts.mjs` and set `"src"`; the SVG carries `data-src`.

## Gaps

A missing number is a one-line marker where it would print, and a row on the one open-items slide:

```html
<td class="num"><span class="gap">n/a: source needed</span></td>
<section class="slide" data-archetype="open-items">...<table class="data"><thead><tr><th>Item</th><th>Slide</th><th>Closes it</th><th>Owner</th><th>Decision?</th></tr></thead>
  <tbody><tr><td>FY25 actuals</td><td class="num"><span data-ref>7</span></td><td>Audited accounts</td><td>CFO</td><td>CHANGES THE DECISION</td></tr></tbody></table>...</section>
```

Keep gap markers off dark fields; where one must sit there it takes the field's ink. A table that is mostly gaps is not drawn (REFLEX `gap-sprawl`): its slide waits on the open-items page.

## Totals

```html
<table class="data"><tbody>
  <tr data-part><td>Term loan</td><td class="num">180.0</td></tr>
  <tr data-part><td>Sponsor equity</td><td class="num">255.0</td></tr>
  <tr class="total" data-total><td>Total</td><td class="num">435.0</td></tr></tbody></table>
```

Each numeric column of a `data-total` row equals the sum of the `data-part` rows within half its last shown digit (FAIL `totals`). Subtotals pair by name (`data-part="opex"` into `data-total="opex"`); a cell that does not add (a margin, a multiple) takes `data-nosum`. A source deck's printed total that does not add is printed as stated with `data-nosum` and a footnote, and raised as a question; never forced.

## Sources and uses

```html
<div class="sources-uses"><div><h4>Sources</h4><table class="data" data-sources>...</table></div>
  <div><h4>Uses</h4><table class="data" data-uses>...</table></div></div>
```

Sources are cash: a loan issued at a discount raises face times price ($85.0M at 98.0 is 83.3 of proceeds) and fees paid at close are uses. The sources table shows net proceeds (or face with the OID as its own negative line) and the slide says how any gap is funded. The two totals must be equal (FAIL `sources-uses`); pair several on one slide by value (`data-sources="fy25"` with `data-uses="fy25"`).

## Waivers

A Reflex finding is fixed, or waived on the record with a reason of two words or more:

```html
<!-- waive: wordy safe harbour language required verbatim -->        (inside one slide's <section>: that slide)
<style>/* waive: accent-colours client brand uses three colours */</style>   (whole deck)
```

FAIL rules are never waivable; `empty-slide` waives only on cover, divider, statement and quote slides.

## Speaker notes and appendix

Detail and caveats that are said, not shown, go in `<aside class="speaker-notes">` inside the slide: never rendered, never counted by `wordy`. Sources, units and disclosures never move there. Long detail goes to the appendix (`A1`, `A2`), whose titles may describe the table.

## Judgment flags

Judgment documents (IC memo, credit memo, DD report, any review or score) put the thesis and the big picture first, checks second. Every flag carries one tag:

| Tag | Reaches the recommendation? |
| --- | --- |
| CHANGES THE DECISION | yes |
| WORTH A QUESTION | no: listed with what closes it |
| EXPLAINED BY CONTEXT | no: closed, never resurfaces |

Neutral stance; a missing document is a question, not a verdict. The default outcome (what happens if the reader does nothing) is one line directly under the recommendation and again on the close:

```html
<p class="callout">No decision: no funds are committed and the request returns at the next committee.</p>
```

## The stamp

The first comment in `deck.html` (written by the scaffold; fill its placeholders): theme and deal, format, storyline, draw seed, words budget, brand, decision, cover, dividers, exec form, theme dials used, and any deck-wide waivers. decklint reads the storyline from it when `<body>` carries no budget.
