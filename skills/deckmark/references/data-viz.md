# Data viz

Finance charts that read as set by an analyst, not generated: the right form for the claim, one highlight, direct labels, honest axes. Load at Step 4 when the deck has charts (almost every deck). `scripts/charts.mjs` draws every type below from data, in theme tokens; never paste a picture of a chart, never a chart library's default output.

## 1. Which chart for which claim

Pick from what the title claims, not from what the data looks like.

| The title claims | The form | `charts.mjs` |
| --- | --- | --- |
| one number matters | a big figure with its comparison, not a one-bar chart | `.callout.big`, `.kpi`, `ring` |
| a level grew over time | columns, CAGR bracket over them | `bar` with `"cagr"` |
| a rank or a gap to peers | ranked horizontal bars, the subject highlighted | `hbar` |
| one figure moved to another, by cause | a bridge: start, steps, end | `waterfall` / `bridge` |
| the mix changed | stacked columns, values in the segments | `stacked` |
| two series compared per period | grouped columns, two series at most | `grouped` |
| a trend, or several | a line, labels at the line ends | `line` |
| volume and a rate together | bars for the volume, the rate as a line on its own scale, both labelled | `combo` |
| size and share at once (a market map) | marimekko | `marimekko` |
| a valuation range by method | floating bars on one value axis, a reference line | `football` |
| options scored against criteria | a harvey table with a stated scoring rule | `harvey` cells |
| a trend inside a table cell | a sparkline, no axis | `sparkline` |
| the same metric across 4 to 9 entities | small multiples on one shared scale | several charts, same `min`/`max` |
| a process, a loop, a cause and outcomes | a diagram, never a chevron row of prose | `flow`, `cycle`, `.bracket` |

Never: a pie past four slices, a donut wall, a gauge, a 3D chart, a radar, a dual-axis line pair that fakes a correlation (two units get two small charts; the bars-plus-rate `combo` is the one exception and labels every point).

## 2. Construction

- **Draw at the box's shape.** `width` and `height` in the data match the box the chart fills (about 1164 x 450 full width, 700 x 450 beside a sidebar, 560 x 450 in a half), so 13px labels print at 13px.
- **Baselines at zero** for bars. A bridge whose small steps would vanish may set `"floor"`, which draws a break mark on the total bars; say so in the unit line.
- **Direct labels** at the bar end, the segment centre or the line end; a legend only for three or more series that cannot be labelled at their ends.
- **Gridlines** only when the reader reads values off them (a line chart without point labels); never on a labelled bar chart.
- **Axes:** a value axis only when bars are not labelled; tick labels at whole numbers (`"tickDp"`); the category axis says the period (`FY24`, `Q3 2026`, `LTM Jun-26`).
- **Every value keeps its label.** A stacked segment too short for its value is labelled beside the bar, never dropped; a bar widens (up to 80% of its band) so a tall segment's label fits inside.
- **Decimals:** set `"fmt": { "dp": 1 }` to the deck's rule; left unset, every label takes the most decimals in the chart's data, so 13 beside 0.9 prints 13.0. `"prefix"`, `"suffix"` for `$`, `%`, `x`.

## 3. Emphasis

- **One highlight per chart**, and it is the thing the title names (`"highlight"`: an index, a label or a list). Everything else sits in ink and greys.
- **Annotate the change**, not the chart: a CAGR bracket, a delta label, a reference line (`football` `"marker"`), a one-line takeaway under the chart.
- **Multi-series:** a lightness ramp on the ink (`ch-s1` to `ch-s4`), the highlight in the accent; never a rainbow, never more than four series in one chart.
- **Text never wears the series colour** except the highlighted label; values and categories are ink and muted.

## 4. Honesty

- Every chart is drawn from the numbers in `facts.json` (or a model tab named in the source line) and its `src` lands in `data-src`.
- A truncated value axis is said in the unit line ("axis starts at 80%").
- Small multiples share one scale; a panel on its own scale makes small things look big.
- A bridge's steps sum to its end bar; a stacked total equals the sum of its segments; decklint checks tables, the builder checks charts by drawing them from the same numbers.
- Estimates are shown as estimates: an `E` on the category, and where the house uses it, a lighter fill for forecast bars.

## 5. Tables are exhibits too

A table of numbers is often the right exhibit in banking, credit and PE decks: right-aligned figures, left-aligned labels, units in the header, a hairline under the head, a heavier rule above the total, `data-total` and `data-part` so decklint adds it up. Ten pixels minimum in cells; past about 14 rows, split or send to the appendix.

## 6. Dark grounds

On a dark theme or a dark panel, marks take the theme's dark-ground series (base.css maps `ch-*` through the tokens); text takes `--field-ink`. Never place a chart on the takeaway bar's field colour.
