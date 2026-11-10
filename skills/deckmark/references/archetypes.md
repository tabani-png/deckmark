# Slide archetypes

The sections of a deck. A storyline (`storylines/<slug>.md`) orders them; a theme dresses them; neither replaces the job each one does. Every archetype below is drawn at 1280x720. Report pages (A4/Letter) reuse the same parts on a single text column with exhibits inset.

## The frame every slide shares

```
x 48 ............................................................ x 1232
y 32   tracker / breadcrumb (11px caps), confidentiality tag at right
y 56   ACTION TITLE: one sentence, a claim, 2 lines max, 8 to 20 words
y 128  unit line: what the exhibit measures, unit, period ("EBITDA, USD m, FY22-FY26E")
y 160  ───────────── body: 12 columns, 84px col, 16px gutter ─────────────
y 640  footnotes (numbered, 10px) then SOURCE line ("Source: ...; team analysis")
y 696  footer: doc name . date . page n   (right: exhibit number if the house uses them)
```

Four parts are required on every content slide: **action title** (a sentence with a verb that the body proves, never a topic like "Market overview"), **exhibit** (chart, table or structured text), **unit line** (whenever a number appears), **source line** (whenever a number appears; "Company data" or "Management estimates" counts, "Internal" alone does not). Missing data is a one-line marker where the number would go (a hatched bar, one `n/a` cell with a footnote, or a single `DATA NEEDED: <what>` chip) plus a row on the one **open-items** slide. Never a plausible number, and never a table that is mostly gaps: decklint's `gap-sprawl` fires past 30% gap cells on a slide or gap cells on more than three slides.

## Filling the slide

The body (between the title block and the footer) is the canvas. decklint's `empty-slide` reflex fires when the ink (text glyphs, chart marks, filled shapes; never empty or outlined boxes) covers under 60% of it or stops above 70% of its height; only cover, divider and quote slides may waive it. Fill honestly, in this order:

1. **Scale the exhibit to the body.** `.exhibit` flexes to the body height and its chart scales to the box. Draw the chart at the body's shape: about 1164 x 450 full width, about 700 x 450 next to a sidebar, about 560 x 450 in half of a two-exhibit slide.
2. **Chart + takeaway sidebar.** A chart that reads at two thirds width gets the `chart-takeaway` sidebar: 2 to 4 bullets each tied to a number on the chart, then the so-what line.
3. **Merge two thin slides** that carry the same message into one `two-exhibits` slide under one title (two exhibits, each with caption and unit). Two thin slides on different messages stay two slides, each filled.
4. **KPI tiles with their evidence.** A `kpi-strip` never stands alone (decklint `stat-only`) except on the exec summary: it sits above the chart or table its numbers come from, or beside a takeaway that explains them. Every tile keeps its comparison.
5. **Tables at their natural height.** Rows are never stretched (decklint `stretched-rows`); a table of 8 rows or fewer opens to about 40px rows by itself, the cap. A short table sits with a chart or a takeaway sidebar. A long one keeps 10px cells or more: split it or send detail to the appendix rather than shrink it.

Never pad: no invented figures, no repeated takeaway, no decorative panel, no filler sentence. If the material cannot fill a slide, merge it or cut it and list what is missing on open items.

## Show it, do not say it

Every storyline sets a **Words** budget per content slide (decklint `wordy`; label | paragraph grids trip `prose-table` in lean decks). The budget is set from real documents, measured with pdftotext, all words on the page including the title and footnotes:

| Document | Words a page (median) | How the words are carried |
|---|---|---|
| Brookfield investor day 2024, 181 pp | 33 (mean 56) | one idea a slide: a big-number comparison, a ring pair, a cycle, a bracket, a 5-column row with one proof number each, full-bleed statement slides, a takeaway bar under a small table |
| BlackRock investor day 2025, 147 pp | 72 (mean 131, lifted by disclosure pages) | a chart or two side by side with one number called out, KPI bands under charts, short labelled tiles |
| KKR investor day 2024, 302 pp | 76 | chart plus a 3-bullet column, tiles with a figure each |
| A private founders-round deck, 23 pp | 98, about 75 in the body | KPI grid of six figures, tiles of figure plus one line, a diagram, a terms table |
| Goldman lender presentation 2022, 44 pp | 111 | chart left, short bullets right; tables of numbers |
| Merlin bond roadshow 2019 (bank deck), 44 pp | 159 | chart left with 4-5 bold-led bullets right; a numbered highlight list with a logo or figure each; a timeline diagram; a header band stating the slide's claim |
| P3 sell-side CIM, 60 pp landscape | 187 | two or three labelled panels a page (chart, map, bullets), tables of numbers; the dense pages are bullet lists, never label | paragraph grids |
| Bear Stearns CIM 2007, BDO CIM 2018 (portrait reports) | 154, 200 | running text with inset tables |
| Two-page teasers | 240 to 340 | KPI strip, two short text blocks, one table, one chart |

So: pitch, fund and investor decks run at 40 to 60 body words and cap at 80; a slide-form CIM carries more (cap 160) but carries it the way Merlin and P3 do, as a chart with short bullets or tables of numbers, never as prose in a grid; A4 report pages and judgment memos keep running text.

Before writing a slide, pick what carries it, in this order:

1. **A big number**, or two set against each other (`big-compare`, `ring-pair`).
2. **A chart** with direct labels and a one-line `takeaway-bar`; a sidebar only when the chart needs it (3 bullets of about 12 words at most; 5 of about 22 in a CIM).
3. **A diagram**: `flow` for a process (3 to 5 steps, 4 words a step), `cycle` for a loop, `bracket` for "we did X, which enabled Y".
4. **A column row**: 3 to 5 columns, each a head, one proof number and a label of 8 words or fewer (`col-row`).
5. **A table of numbers**. Text cells in a lean deck stay short; a table whose second column is paragraphs is rebuilt as 3 or 4.
6. Words. Whatever the slide still needs to say goes in the title. Detail goes to the appendix or `<aside class="speaker-notes">`.

Lean never cuts the source line, the unit, a disclosure or a gap marker.

Title tests: read the titles alone in order and they must tell the whole argument (horizontal logic); the body must prove its title and nothing else (vertical logic).

---

## Structure slides

**1. cover**: Use: first page. Grid: title block cols 1-8 at y 260-460; meta (client or "Project <codename>", date, draft/final, confidentiality) at y 600. Parts: document title as a statement or a codename, date, status. Failure: a stock photo and a slogan; a real company name on a blind document.

**2. agenda-tracker**: Use: after the exec summary, and again at each section opening with the current item boxed or filled. Grid: list cols 3-10, one row per section, 56px rows. Parts: 3 to 6 numbered sections whose names are claims or questions. Failure: ten items; names that differ from the section dividers.

**3. section-divider**: Use: between parts in decks of 16 slides or more (the draw never deals them below 16). Grid: section number at cols 1-2 large, title cols 3-10 at y 300. Parts: number, section name, optional one-line takeaway. Failure: dividers in a 10-slide deck; full-bleed photos.

**4. exec-summary-scr**: Use: page 2 of almost every finance document. Grid: three bands down the page (Situation, Complication, Resolution) with labels in cols 1-2 and text in cols 3-12; or a governing thought at top and 3 to 5 numbered key-line claims, each with its headline number in bold. Parts: governing thought, 3-5 claims each carrying one number, the ask. In a pitch, fund, investor or CIM deck: a KPI row of 3-4 figures over 3-5 one-line claims (about 12 words each), never paragraphs. Failure: a table of contents in prose; claims without numbers; the ask missing; over the storyline's Words cap.

**5. recommendation-ask**: Use: the decision page (IC, credit committee, board). Grid: verdict band across cols 1-12 at top (Approve / Approve with conditions / Decline / Defer), terms table cols 1-6, conditions and open items cols 7-12. Parts: the vote asked for, the amount and terms, conditions precedent, what would reverse the recommendation. Failure: "we are excited about"; no stated downside; conditions hidden in the appendix.

**6. quote-callout**: Use: one customer, expert or management statement that a decision turns on. Grid: quote cols 2-9 at 32px, attribution under it, optional supporting stat in cols 10-12. Parts: verbatim quote, named role and date (person name only if given and cleared), source. Failure: an invented or paraphrased quote set in quote marks.

**7. disclaimer**: Use: front or back matter of any document going outside the firm. Grid: single text column cols 2-11 at 11px. Parts: confidentiality, forward-looking statements, no-offer language, non-GAAP note. Failure: omitted on external documents; set larger than the content.

## Number slides

**8. kpi-strip**: Use: top of a dashboard, board or performance page. Grid: 3 to 6 equal tiles across cols 1-12, 120px tall, body below. Parts per tile: label, value (tabular figures), comparison (vs plan / vs prior, signed delta), period. Failure: a value with no comparison; mixed periods across tiles; colour on deltas that contradicts the sign convention (cost up is bad).

**9. dashboard-tiles**: Use: board pack scorecard, portfolio monitoring, credit surveillance. Grid: 2x3 or 3x4 tiles on the 12-col grid, 16px gaps; each tile has its own title, a small chart or table and a status dot. Parts: same KPI set every period, status (green/amber/red) with the rule that sets it written in a footnote. Failure: RAG status with no threshold; the KPI set changing quarter to quarter.

**10. chart-takeaway**: Use: the default analytic slide. Grid: chart cols 1-8, takeaway sidebar cols 9-12 with a 1px rule on its left. Parts: one chart, at most 3 bullets in the sidebar (about 12 words each; 5 in a CIM) each anchored to a number on the chart, highlight colour on the bars the title talks about. When one line says it, use a `takeaway-bar` under a full-width chart instead of a sidebar. Failure: sidebar repeats the title; bullets about things not on the chart; a sidebar of sentences.

**11. waterfall-bridge**: Use: EBITDA bridge, plan-to-actual, entry-to-exit value, net debt walk, reported-to-adjusted. Grid: chart cols 1-9 (or full width), labels above each bar, optional notes cols 10-12. Parts: start and end totals in ink, ups and downs in two hues, connector lines, every step labelled with its value; steps sum exactly to the end. Failure: steps that do not tie (decklint checks); an "Other" step larger than any named step.

**12. stacked-bar**: Use: mix over time (revenue by segment, AUM by asset class). Grid: chart cols 1-9, legend in reading order to the right of the last bar (cols 10-12) or direct labels. Parts: segment values inside bars when tall enough, "100% =" or total above each bar, CAGR column at right where growth matters. Failure: more than 6 segments; legend order that differs from stack order.

**13. marimekko**: Use: market map by segment and player share; two dimensions of size at once. Grid: full width cols 1-12, column widths proportional to segment size, labels inside cells. Parts: segment totals along the top, share % in cells, "Other" in grey. Failure: used where a stacked bar would do; unlabeled thin cells.

**14. ranked-bar**: Use: league tables, peer rankings, survey results. Grid: labels cols 1-3, bars cols 4-10, value at bar end, optional callout cols 11-12. Parts: sorted bars, the subject highlighted in accent, peers in neutral, median or average line. Failure: unsorted; highlight on more than one bar without a reason.

**15. small-multiples**: Use: same metric across 4-9 entities or regions. Grid: 2x2, 2x3 or 3x3 panels, shared axis scale stated in the unit line. Parts: identical axes, one-line panel titles, the one panel that matters marked. Failure: independent y-axes that make small things look big.

**16. financial-summary-table**: Use: historicals and projections in CIM, IC memo, credit memo, LP letter. Grid: full width, line items cols 1-3, periods across, actuals and forecasts separated by a vertical rule and an "A/E" header. Parts: revenue, growth %, gross margin, EBITDA, margin %, capex, FCF (and for credit: net debt, leverage, interest cover); adjusted and reported both shown when they differ. Failure: forecast columns styled the same as actuals; margin rows not recomputing from the lines above.

**17. sensitivity-table**: Use: IRR/MOIC vs entry and exit multiple, DCF value vs WACC and terminal growth, DSCR vs rate and EBITDA decline. Grid: grid table cols 2-9, row and column driver labels, base case cell outlined, explanation cols 10-12. Parts: 5x5 typical, base case at the centre, shading by threshold (e.g. IRR below hurdle in red tint). Failure: base case off-centre or missing; shading with no legend.

**18. football-field**: Use: valuation summary in a pitch book or fairness discussion. Grid: method labels cols 1-3, floating bars cols 4-11, value axis at the bottom, reference lines (offer price, current EV, 52-week range). Parts: one bar per method with low/high labelled and the multiple range used written under the method name. Failure: ranges with no stated multiple; a "selected range" with no reason.

**19. comps-table**: Use: trading comps and precedent transactions. Grid: full width table, 9-11px figures. Parts: company or target/acquirer, date (precedents), EV, EV/Revenue, EV/EBITDA (LTM and NTM), growth, margin; mean and median rows; subject row set apart; as-of date in the unit line. Failure: mixing LTM and NTM in one column; no as-of date; leaving out the comps that hurt the case.

**20. sources-uses**: Use: any financing or buyout. Grid: two tables side by side, Sources cols 1-6, Uses cols 7-12, totals on one baseline. Parts: amount, % of total, multiple of EBITDA for each debt line, pricing where relevant. Failure: totals that do not match (decklint checks); equity shown without saying how much is rollover.

**21. cap-table**: Use: pro forma capitalisation in credit, PE, fund decks. Grid: table cols 1-8, leverage ladder chart cols 9-12. Parts: each tranche with amount, pricing, maturity, cumulative x EBITDA, % of capitalisation; cash; net debt. Failure: cumulative leverage not cumulating.

**22. covenant-table**: Use: credit memo, board pack (for a levered company), lender update. Grid: full width table. Parts: covenant, definition reference, level (with step-downs), actual, projected, headroom % in the base and downside case, first test date. Failure: headroom shown only in the base case; a breached covenant labelled as headroom.

## Logic slides

**23. matrix-2x2**: Use: prioritisation, portfolio positioning, attractiveness vs ability to win. Grid: square plot cols 1-7 (480px), quadrant names in corners, commentary cols 8-12. Parts: axis definitions with what is measured, plotted items with labels, bubble size legend if used. Failure: axes that are opinions with no measure; everything in the top-right.

**24. harvey-table**: Use: options vs criteria, vendor or buyer comparison. Grid: options as rows cols 1-4, criteria as columns, ball cells 24px, weight row at top. Parts: legend for 0/25/50/75/100 fills, the recommended row highlighted, a total or verdict column. Failure: balls with no stated scoring rule.

**25. issue-tree**: Use: problem breakdown in a strategy deck, scope of a review. Grid: root at cols 1-2, two to three levels to the right, connector lines. Parts: MECE branches, each leaf a testable question or a lever with its size. Failure: overlapping branches; leaves that are topics.

**26. process-chevrons**: Use: deal process, methodology, 100-day plan. Grid: 4 to 6 chevrons across cols 1-12 at y 180, text blocks under each. Parts: phase name, duration or dates, key outputs (one line each). Failure: seven steps of filler; no dates; a paragraph under each chevron (use `flow` from `charts.mjs` instead: 3 to 5 steps, 4 words and an optional figure each).

**27. timeline-gantt**: Use: transaction timetable, programme plan, debt maturity. Grid: task labels cols 1-3, time axis cols 4-12, today line. Parts: workstreams, milestones as diamonds, owner column if internal. Failure: no today marker; dates without a year.

**28. org-chart**: Use: management team, transaction structure, legal entity chart. Grid: tree centred, boxes 160x56. Parts: role, name only if given, tenure; for structure charts, ownership % on each line and where the debt sits. Bios are name, role and 2-3 short proof points (years in the field, one number, a prior firm), never a paragraph; the full biography goes to the appendix. Failure: invented names; photos; a bio table of paragraphs.

**29. two-column-compare**: Use: before and after, then vs now, base vs downside, us vs peer. Grid: cols 1-6 and 7-12 with matched rows. Parts: identical row labels both sides, the difference called out. Failure: rows that do not line up.

**30. risk-matrix**: Use: risk register in IC memo, credit memo, board pack. Grid: likelihood x impact grid cols 1-6, numbered risks plotted; table cols 7-12 with risk, mitigant, owner, tag. Parts: every risk tagged CHANGES THE DECISION / WORTH A QUESTION / EXPLAINED BY CONTEXT; only the first tag reaches the verdict. Failure: twelve risks all "medium"; mitigants that restate the risk.

**31. rag-tracker**: Use: initiative status, diligence workstream status, action log. Grid: table, status dot column at left. Parts: item, owner, due, status, one-line comment; the rule for each colour in a footnote. Failure: all green; status without a date.

**32. map**: Use: footprint, sites, sales coverage, regional figures. Grid: map cols 1-8, figure list cols 9-12. Parts: simple outline geography, dots or shaded regions with values, legend. Failure: a world map for a business in two states; shading with no scale.

**33. tombstone-grid**: Use: credentials in a pitch book, fund track record of realised deals. Grid: 4x3 or 5x3 tiles, 200x140. Parts: deal type, target described generically unless public, role, size, year. Failure: logos the user did not supply; deals that cannot be confirmed.

## Back matter

**34. appendix-table**: Use: full statements, comps detail, data room index, definitions. Grid: full width, 10px minimum, zebra rows or hairlines. Parts: same source and unit line as any other slide; "A1, A2" numbering. Failure: main-body slides dumped in the appendix untouched; no title claim (appendix titles may be descriptive, they still state what the table is).

**35. memo-page**: Use: report-format documents (IC memo, credit memo, public-sector review, DD report). Grid: A4 at 794x1123 or Letter 816x1056; text column 600px, side margin notes 160px, exhibits inset at column width. Parts: numbered headings, paragraph 1 states the finding, exhibits numbered. Failure: slides reflowed into a page with bullets only.

**36. open-items**: Use: once per deck that has any gap, near the end (before the appendix) or after the exec summary in a draft. Grid: one full-width `table.data` with `data-archetype="open-items"` on the slide. Parts: item, where it would appear (slide number), what closes it (document, owner), status, and whether it CHANGES THE DECISION. Every gap marker in the deck has its row here; gap cells on this page do not count toward `gap-sprawl`. Failure: gaps spread as `n/a` across many slides; a gap with no owner.

**37. two-exhibits**: Use: two thin exhibits that prove the same title (a level and its mix, a trend and its driver). Grid: `.two-exhibits` (1:1) or `.two-exhibits.wide-left` (1.5:1), each side an `.exhibit` with its own caption and unit. Parts: one title, two exhibits, one source line covering both. Failure: two unrelated messages under one title; a second exhibit added only to fill space.

## Lean slides (pitch, fund, investor and CIM decks reach for these before a table)

**38. big-compare**: Use: a then-vs-now or this-vs-that that is the whole point ("First $1T took 25 years; the next, under 5"). Grid: 2 or 3 `.bc-row` down the body, each label + big figure, an arrow, the result figure. Parts: the figures, a short label each, a `takeaway-bar` optional. Failure: more than three rows; figures without a period or unit.

**39. ring-pair**: Use: a market or share that grows between two dates ($25T to $60T+, share 15% to 28%). Grid: two `ring` charts from `charts.mjs` in `.ring-pair` with an arrow between, a caption under each. Parts: the big figure inside each ring, the share as the arc and its label, the dates. Failure: rings with no stated basis for the arc; more than two rings.

**40. cycle**: Use: a flywheel or loop the business runs on. Grid: `cycle` from `charts.mjs` at full width (about 1164 x 400) with a `takeaway-bar`, or at two thirds with a short sidebar. Parts: 3 to 6 steps of 4 words or fewer, the step the title names highlighted. Failure: a cycle that is really a list; steps that are sentences.

**41. flow**: Use: how money or work moves (investor to project and back, deal process, a model in four steps). Grid: `flow` from `charts.mjs` across the body, `takeaway-bar` under it. Parts: 3 to 5 steps, 4 words each, a figure where one exists. Failure: a prose chevron row; more than five steps.

**42. bracket**: Use: "we did X, which enabled Y" (an acquisition and what it unlocked, an investment and its outcomes). Grid: `.bracket`: the move on the left, a chevron bracket, 2 to 4 outcomes on the right each with a figure (`.br-fig`). Parts: the move in under 8 words, outcomes with numbers. Failure: outcomes without a figure; more than four.

**43. col-row**: Use: platform, divisions, products or advantages, one column each. Grid: `.col-row` with `--cols` 3 to 5; each `.cr-col` a head (3 words), one `.cr-fig` proof number and a `.cr-label` of 8 words or fewer; `.hl` on the one the title names. Parts: a number in every column. Failure: a column with no number (that is R7's icon row); paragraphs under the figure.

**44. statement**: Use: a full-bleed sentence on the field colour that opens a section of a pitch or investor deck, or states the governing thought before the evidence. Grid: `.slide.statement`, `.statement-text` (one sentence, 15 words or fewer, `.em` on the key phrase). Parts: the sentence, an optional `.statement-sub` naming the section. Failure: two in a row; a statement that is a topic label ("Our strategy").

**45. takeaway-bar**: not a slide but the one line under a chart, table or diagram, in the field colour (`.takeaway-bar`). It replaces a sidebar when one line says it. Failure: two lines; repeating the title.

