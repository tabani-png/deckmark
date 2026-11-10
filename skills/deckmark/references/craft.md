# Craft

Slide craft as numbers wherever a number exists: the grid, alignment, white space, hierarchy, type, colour, numbers and copy. Read at Step 4 on every build. `layout.md` owns the page frame and how a slide fills; `data-viz.md` owns charts; the theme supplies the material (faces, palette, furniture). Where a theme file and this file disagree on material, the theme wins; the Floor beats both.

## 1. The grid

- **One frame, every content slide.** 1280 x 720, side margins 48px (4 to 6% of width; 2.5% only on a dense board readout), the tracker at y 32, the action title at y 56, the body from about y 160 to the footer at y 640, furniture at y 696. The exhibit sits on the same grid on every slide: a reader flipping pages sees the furniture hold still and only the content move.
- **Twelve columns** inside the margins, 16px gutters (`.grid-12`, `.span-N`). Splits come from the columns: chart 8 + sidebar 4, two exhibits 6 + 6 or 7 + 5, a label column 3 + values 9. Never a free-floating box at a width the grid does not make.
- **Left edges line up** from the tracker to the source line: title, unit line, exhibit caption, table first column and the source line share one x. A centred title over left-aligned content is the commonest misalignment.
- **A4 reports** use one text column of about 600px (66 to 72 characters), a 160px margin column for notes, exhibits inset at column width, 18 to 22mm page margins.

## 2. Hierarchy

Three levels on a content slide, never more: the action title (the claim), the exhibit (the proof), the furniture (where it came from). Hierarchy comes from size and weight first, colour last.

| Role | 16:9 | A4 | Token |
| --- | --- | --- | --- |
| Action title | 22 to 30px, one size across the deck | 16 to 22pt | `--fs-title` |
| Unit line, lead | 15 to 17px | 11 to 12pt | `--fs-sub` |
| Body, KPI labels, takeaway | 14px minimum | 11px minimum | `--fs-body` |
| Table cells, chart and exhibit labels | 10px minimum | 8pt minimum | `--fs-table`, `--fs-label` |
| Source, footnote, page number, tracker | 9px minimum | 7pt minimum | `--fs-furniture` |
| KPI figure | 36 to 48px | 22 to 28pt | `--fs-kpi` |

- One title size on every content slide (decklint reads them; a title that shrinks to fit is a title that is too long: cut it).
- Two weights in running use (regular and bold); a third only for the KPI figure if the theme sets one.
- The highlight is one element per exhibit: the bar, row or figure the title talks about. A second highlight on a slide needs a reason in the title.

## 3. White space

- **Space is even, not empty.** The gap between title block and body, between exhibit and takeaway, and between columns comes from the theme's `--gutter`; nudges off the scale are a tell.
- **Space follows mass.** A full-width chart may breathe; a row of three figures floating mid-slide with an empty band above the takeaway bar is not white space but an unfinished slide (REFLEX `dead-band`, `empty-slide`). Fill from the material (`layout.md` § 3), never with padding.
- **No card inside a card**, no border around the exhibit and again around its table, no panel behind a chart that already sits on paper. The surface ladder: paper, then a hairline (`--rule`), then a tinted well, then the field colour for one band (the takeaway bar, a dark cover). Climb one rung at a time.

## 4. Type

- **Two families per deck** (Floor 7): display and body; one may do both. Figures may take a third only through `--font-figures` when the theme names it, for numbers only.
- **Titles:** sentence case, one sentence, no closing full stop, `text-wrap: balance`, 8 to 20 words, 2 lines at most. Tracking 0 to -0.01em on a sans, 0 on a serif.
- **Labels:** the body face a step smaller. Tracked capitals only where the theme's furniture voice is capitals (a tracker, a kicker, a table head on a banking theme), at 0.04 to 0.08em; never on running text.
- **Numbers:** `tabular-nums` and lining figures on every figure that compares; right-aligned in tables; units in the header (`$ in millions`), never in every cell.
- **Never:** justified text, a single italic word in a roman title, underlines for emphasis, all-caps body, outlined or shadowed type.

## 5. Colour

- **Restrained is the default.** Paper and ink carry the slide; the accent marks the one thing the title names and nothing else. Two hues per slide at most, tints and greys of a hue counting once (REFLEX `accent-colours`).
- **The field colour** (the theme's dark brand colour) is for one band: a dark cover, a divider, the takeaway bar, a table head. Text on it takes the field's own ink (`--field-ink`), never `--muted`.
- **Signs follow effect, not arithmetic.** A cost that falls is good: `.delta.down.good`. Red and green are never the only signal; the sign and the word carry it.
- **Contrast:** body 4.5:1 (decklint `contrast`), large text 3:1, accent text 4.5:1 on paper, accent fills 3:1.
- **Bans:** gradients behind data, purple to blue anywhere, glow, drop shadow on a chart or table, colour as decoration.

## 6. Numbers as set

- One decimal convention per deck; percentages to one decimal unless the field rounds; multiples `4.1x`; negatives `(12.4)` in banking, credit and PE, `-12.4` only on consulting and public-sector themes.
- Estimates carry `E` (`FY25E`); actuals and forecasts part by a vertical rule and an `A`/`E` header.
- Every printed figure is a fact (`patterns.md` § Facts); rounding rounds; a total is the sum of its parts (decklint `totals`).

## 7. Copy

- **The action title** is the conclusion, with a verb, specific to this company: *Pricing and volume added 3.1 of EBITDA in FY25*, never *EBITDA bridge*. The swap test: if a title would sit unchanged in a competitor's deck, it carries no fact; add the number or the noun only this deck has.
- **The horizontal read:** the titles alone, in order, tell the argument. The **vertical read:** the body proves its title and nothing else.
- **Lean:** one exhibit carries the slide; the takeaway is one line; a sidebar is three bullets of about twelve words, each anchored to a number on the exhibit; detail goes to the appendix or `<aside class="speaker-notes">`.
- **Refuse the generated voice:** *Unlock*, *Revolutionize*, *Seamless*, *Leverage* as a verb, *Key takeaways* boxes that repeat the title, *Thank you* as the last slide, colon titles (*Growth: the story*), em dashes.
- **Punctuation:** curly quotes, a true apostrophe, no em or en dash in copy (a comma, a colon or "to" for ranges), a non-breaking space inside unit pairs (`$15 MM` only when the house writes it so).

## 8. Missing facts

A missing number is a one-line gap marker where it would print (`<span class="gap">n/a: source needed</span>`) and a row on the one open-items slide; never a guess, never a table that is mostly gaps (REFLEX `gap-sprawl`). A section the material cannot carry is cut and listed on open items, not built half empty. Full markup: `patterns.md` § Gaps.

## 9. Finish

The last few percent; `gates.md` § 4 lists them as checks.

- Table heads never wrap; the first column one step heavier; a hairline under the head, a heavier rule above the total.
- Source lines name the reader's documents and pages, never a build file.
- Footnote markers are superscript numbers in order down the slide.
- Page numbers on every content slide; the cover and dividers carry none.
- The close is the decision or the ask, never *Thank you* or *Questions?*.
