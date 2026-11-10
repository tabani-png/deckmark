# Layout

How a slide is composed and how it fills, and how a deck paces across its slides. Numbers are at 1280 x 720 unless a line says A4. The frame and grid are in `craft.md` § 1; every class named here is in `components.md`; the archetypes are in `archetypes.md`.

## 1. A content slide

Four parts, top to bottom, always in this order: `.slide-head` (tracker, action title, unit line), `.slide-body` (the exhibit and at most one line or sidebar that reads it), `.slide-foot` (footnotes, source, confidentiality, page number). The body is a flex column that fills the space between head and foot; everything in it is measured against that box.

- **One exhibit carries the slide.** A chart, a table of numbers, a diagram, a column row of proof numbers or a big-number comparison. A second exhibit proves the same title (`.two-exhibits`).
- **The reading line** under or beside the exhibit: a `.takeaway-bar` (one line) or a `.chart-takeaway` sidebar (three short bullets and a so-what). Never both.
- **Text is what is left.** Pick the carrier in this order: a big number or comparison, a chart with direct labels, a diagram, a column row, a table of numbers, words (`archetypes.md` § Show it, do not say it).

## 2. Compositions

| Composition | Grid | When |
| --- | --- | --- |
| Full-width exhibit + takeaway bar | exhibit 12 cols, bar under | one chart or table says it; the default |
| Chart + sidebar | `.chart-takeaway`, 8 + 4 | the chart needs two or three numbers read off it |
| Two exhibits | `.two-exhibits` 6 + 6, or `.wide-left` 7 + 5 | a level and its mix, a trend and its driver, a short table and the chart of the same numbers |
| KPI row over its exhibit | `.kpi-strip` then the chart or table | the figures summarise the exhibit beneath them |
| Column row | `.col-row`, 3 to 5 columns | parallel parts, one proof number each |
| Big compare | `.big-compare`, 2 or 3 rows | a then-vs-now that is the whole point |
| Diagram | `flow`, `cycle`, `.bracket`, `ring-pair` | a process, a loop, a cause and its outcomes, a share that grows |
| Statement | `.slide.statement` | one sentence opens a section (pitch, investor, fund decks) |
| Memo page | A4, text column + inset exhibits | IC memo, credit memo, DD report, public-sector review |

Never the same composition on two slides in a row (REFLEX `archetype-repeat`); a dense slide (a table, a two-exhibit slide) is followed by a lighter one where the story allows.

## 3. Filling the slide

decklint measures ink, not boxes. `empty-slide` fires when ink below the title covers under 60% of the body area or stops above 70% of its height; `dead-band` fires when a full-width empty band over 25% of the body height opens between two blocks (the KPI or column row floating mid-slide above the takeaway bar). Fill from the material, in this order:

1. **Scale the exhibit to the body.** An `.exhibit` flexes to the body height and its chart scales to the box. Draw charts at the body's shape: about 1164 x 450 full width, 700 x 450 beside a sidebar, 560 x 450 in half of a two-exhibit slide.
2. **Pair the figures with their exhibit.** A KPI row or a column row sits above the chart or table its numbers come from (`kpi-strip` never stands alone outside the exec summary: REFLEX `stat-only`).
3. **Let a figure row take the height.** When three to five short figures really are the exhibit, `.col-row.big` sets them as tiles that take the body height: each column a tinted well, the head under its rule, the figure (scaled to the row) and its label centred in the rest, so no empty band opens over the takeaway bar. Long figures (`$15,000,000`) keep the plain `.col-row` beside a chart. Never float a thin row with an inline `margin: auto`.
4. **Merge two thin slides** that make one point into one `.two-exhibits` slide under one title.
5. **Tables keep their natural height.** Never stretch rows (REFLEX `stretched-rows`); a short table sits beside a chart or a sidebar. A long one keeps 10px cells: split it or send detail to the appendix.
6. **Cut the slide** when the material cannot fill it, and list what would on open items. A thin source gets fewer slides, never emptier ones.

Never: invented figures, a repeated takeaway, a decorative panel, a stretched empty box, an inline `margin: auto` that floats a thin row in the middle of the page.

## 4. The cover and the exec summary

- **Cover:** the dealt posture (`theme.mjs draw`): dark full-bleed, light with an accent rule, split with one key figure in a panel, typographic, or an accent band. Title as the decision or a codename, the date, the status (draft, preliminary), the confidentiality line. No photograph, no logo the user did not supply.
- **Exec summary:** the deck in one page: the governing thought, three to five supporting points each with its number, and the ask. In pitch, fund, investor and CIM decks, a KPI row over three to five one-line claims; in judgment documents, the recommendation, the default outcome line and the flags that change the decision.
- Build these two first and review them (`review-cover.md`) before the rest.

## 5. Pace across the deck

- **Sections:** a tracker on every content slide names the section; dividers only at 16 slides or more, and a divider states the section's answer, never a bare topic.
- **Rhythm:** after a dense table, a chart or a statement; after two charts, a different composition. A statement slide opens a section at most once a section, never two in a row.
- **Density follows the field:** banking and credit read dense tables of numbers; consulting reads one exhibit per slide; investor-day and fund decks read one big number; public-sector reports read numbered paragraphs with figures (`fields.md`).
- **Back matter:** open items, then the appendix (`A1`, `A2`), then the disclaimer if it did not lead.

## 6. A4 reports

- One text column of 600px with numbered headings; paragraph one of each section states the finding.
- Exhibits inset at column width, numbered (`Exhibit 3`), each with its source line beneath.
- A margin column for notes and cross-references (`data-ref`).
- Tables break across pages only between rows, with the header repeated; never a table cut mid-row.

## 7. Before the sweep

Flip through the PNGs at thumbnail size: does each slide have one thing big enough to be its reason? Squint: with the words blurred, does each slide still have a shape, and does the deck alternate heavy and light? A slide holding only a title and a line wants its exhibit, a merge, or a cut.
