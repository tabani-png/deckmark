# Gates

Three tiers. **Floor** (SKILL.md): never ships. **Reflex**: a default a model falls into, waivable on the record with `<!-- waive: <decklint rule> <reason> -->` inside the slide's `<section>` (that slide) or `/* waive: <rule> <reason> */` in a `<style>` block (whole deck); the rule names are in the (L) column below, the reason is at least two words. **Finish**: craft, answered, never blocking. Rules marked (L) are checked by `decklint.mjs`; the rest are judged.

## § 1 Sizes and furniture (Floor detail)

| Thing | 16:9 at 1280x720 | A4 report |
|---|---|---|
| Body text (paragraphs, bullets, KPI labels, takeaway text, matrix and chevron text) | 14px min | 11px min |
| Table cells, chart labels, exhibit labels (captions, exhibit numbers, kickers, KPI deltas, axis and legend labels, gap markers) | 10px min | 8pt min |
| Furniture: source, footnote, page number, tracker, confidentiality, stamp | 9px min | 7pt min |
| Action title | 22 to 30px, same size on every content slide, 2 lines max, 8 to 20 words, no closing period (L) | 16 to 22pt, same word and line rule |
| Margins | 4 to 6% of width; dense board readouts may go to 2.5% | 18 to 22mm |

Every content page carries: action title, exhibit, `Source:` line, page number. Confidential material adds the confidentiality line on every page. A theme that declares a tracker or status stamp shows it on every content page. (L)

decklint `min-font` applies exactly these three tiers: text inside `.source, .footnote, .pageno, .confid, .tracker, .stamp, .slide-foot` is furniture; text inside a table, an SVG chart, or a label class listed in `components.md` is a table cell or label; everything else is body. (L)

Fonts: two families per deck, display and body. A third fails.

The Floor rules decklint checks, by name (all FAIL, never waived): `literal-colour` and `literal-font` (Floor 6, static tier), `overflow` and `overlap` (Floor 7: text off the page, out of its box, into the footer, or on other text), `min-font` and `contrast` (Floor 7), `source` (Floor 5), `title-length` (Floor 3), `tieout`, `untraced`, `formula`, `totals` and `sources-uses` (Floor 2, § 2). The static-tier tells `emoji` and `gradient` (Floor 9) report as REFLEX so a quoted mark in a source document can be waived on the record; everything else in § 3.

## § 2 Numbers (Floor detail)

- Every figure in `facts.json` is printed exactly as its rounded value, and every printed figure is in `facts.json`, wrapped in `<span data-fact="<id>">` with the bare number inside and the unit outside (`$<span data-fact="ebitda">25.6</span>M`). Slide and page cross-references carry `data-ref` so they are not read as figures. (L `tieout`, `untraced`)
- Rows marked Total equal the sum of their parts within half the last shown digit (L `totals`). Syntax: the total row carries `data-total`, each part row `data-part`, in the same `<table>`; every numeric column of the total row is checked; groups pair by value (`data-part="opex"` into `data-total="opex"`); a cell that does not add (a margin, a non-additive multiple) carries `data-nosum`.
- Sources are cash: a loan at an OID raises face times price (85.0 at 98.0 is 83.3), so the sources table shows net proceeds or a separate OID line, and the slide says how the shortfall is funded. Never tie at face value.
- Sources equal uses (L `sources-uses`): `<table data-sources>` and `<table data-uses>` on the same slide, paired by value when there are several; each total is its `data-total` row, else the sum of its rows.
- Derived figures recompute (L `formula`): a `facts.json` entry with `"formula": "a / b * 100"` over other fact ids (operators `+ - * / ^ ( )`, result in the entry's unit) must round to its displayed figure.
- A waterfall's bars sum to its end bar.
- One format per deck: negatives `(12.4)` in banking, credit and PE; `-12.4` only in consulting and public-sector themes. Multiples `4.1x`. Percent one decimal unless the field rounds to whole. Estimates carry `E` (`FY25E`). Missing is `n/a`. Mixed formats within a column fail. (L)
- Units live in the exhibit header (`$ in millions`), never repeated in every cell.
- Two cases when a forecast exists: management case and a base or underwriting case. The deck says which governs.
- Every inconsistency between sources is shown, with which one governs. Never pick silently.

## § 3 Reflex gates

| # | Gate | Why it is a tell |
|---|---|---|
| R1 | More than two hues on one slide, where tints and greys of a hue count as that hue (hues within 30 degrees are one) (L `accent-colours`); more than one highlighted element per chart | colour as decoration, not meaning |
| R2 | Legend on a chart with one or two series; gridlines on a bar chart with labelled bars. Direct labels at bar ends, segment ends or line ends are labels, not a legend, and are the preferred form | chart junk |
| R3 | More than 6 bullets, or bullets more than two levels deep (L `bullets`) | the wall of text |
| R4 | Three content slides in a row with no exhibit (L `no-exhibit`) | a memo pretending to be a deck |
| R5 | The same archetype on two slides in a row (L `archetype-repeat`) | a template, not a story |
| R6 | Centred body text, centred table numbers (L `centred-text`) | unreadable |
| R7 | Icons in a row of three with a word under each; card grids labelled "Claim 1 ... 6", "Point 2", "Highlight 3" or numbered boxes that only say which box they are (L `numbered-cards` for the labelled kind). Label each box with what it says, or set the claims as `.summary-rows` with their proof numbers. A column row is allowed when every column carries a proof number (`.col-row`: head, one number, a label of 8 words or fewer); Deckmark ships no icon set, so the number does the work an icon would | the generated-deck signature |
| R8 | "Key takeaways" box that repeats the title | says it twice |
| R9 | A KPI tile with no comparison (no delta, no target, no period) | a number with no meaning |
| R10 | Topic-label section dividers with nothing else; use the divider to state the section's answer | dead slides |
| R11 | Drop shadows or 3D on charts; pie charts with more than 4 slices (L `chart-shadow`) | |
| R12 | Stock-photo heroes, AI images | images are out of scope; use the brand colour block |
| R13 | Ink below the title covers under 60% of the body area (between the title block and the footer), or ends above 70% of the body height (L `empty-slide`). Ink is text glyphs, chart marks and filled shapes; empty or outlined boxes, borders and rules never count, so stretching a container cannot pass it. Waivable only on cover, divider and quote slides | a table or chart floating in the top third: the generated-deck look |
| R14 | Over 30% of a slide's table cells are gaps (n/a, DATA NEEDED, source needed), or more than 3 slides carry gap cells (L `gap-sprawl`). Gaps live on one open-items page, plus a one-line marker where the number would go | half-empty tables read as an unfinished deck |
| R15 | Big-number tiles (a KPI row, a big callout figure) with no chart, table or takeaway on the slide that explains them, outside the exec summary (L `stat-only`) | a row of numbers with nothing below reads as a dashboard placeholder |
| R16 | Table rows stretched far past their text, over about 40px a row at 16:9 for one line (L `stretched-rows`). A short table keeps its height and sits beside a chart or a takeaway sidebar | five rows of text lost in a full page of space |
| R17 | A content slide over its storyline's **Words** cap (body words below the title, not tracker, source, footnotes, page number, speaker notes or numbers), or, in a lean deck, a takeaway sidebar with more than 3 bullets or a bullet over 15 words (5 and 25 when the cap is over 100) (L `wordy`). Cap from `<body data-words-cap>`, else the stamp's storyline, else 90 at 16:9 and 350 on A4. Disclaimer, open-items, appendix, cover, divider and statement slides are exempt; required legal language elsewhere waives with a reason | the slide says what an exhibit should show; the reader stops reading |
| R18 | In a lean deck (storyline marked "no prose tables"), a table or `.summary-rows` whose text cells average over 12 words or hold one over 20 (L `prose-table`). Numbers never count. Turn it into a diagram, a 3-4 tile row (one number, a label of 8 words or fewer each), or cut it | a label column beside a paragraph column is a memo set in a grid |
| R19 | A full-width empty band over 25% of the body height between two blocks of content: a KPI or column row floating mid-slide with nothing between it and the takeaway bar (L `dead-band`). Fix by pairing the row with the exhibit its numbers come from, `.col-row.big` for short figures, or merging the slide (`layout.md` § 3) | the slide looks unfinished: a band of nothing where the exhibit should be |

## § 4 Finish checks

- Show it, do not say it: every content slide is carried by one exhibit (a big number, a chart with direct labels, a diagram, a column row of proof numbers, a table of numbers); the words are a title, a takeaway line and labels. Read the slide in five seconds: if the point needs the paragraph, the exhibit is wrong.

- The horizontal read: titles alone tell the full story.
- Every chart's one highlight is the thing the title talks about.
- Labels sit at the bar end or line end, not in a legend.
- Tables: right-aligned numbers, left-aligned labels, a hairline under the header, a heavier rule above Total.
- The exec summary carries a number in every supporting point.
- The last slide is the ask or the decision, not "Thank you".
- Section dividers state the section's answer.
- White space is even: the exhibit sits on the same grid on every slide, and fills its body area.

## § 5 The sweep walk (load at Step 7)

1. Run `decklint --render --strict --facts`. Read the JSON. Every FAIL fixed, every REFLEX fixed or waived.
2. Open every PNG. For each: does the title say the conclusion; is the highlight the thing the title names; anything clipped, overlapping, or tiny; is the source line there.
3. Walk § 3 table by number. Fix or waive each.
4. Walk § 4. Answer each in one line in the Picks block outcome.
5. Judgment documents: every flag carries one tag (CHANGES THE DECISION / WORTH A QUESTION / EXPLAINED BY CONTEXT); only the first reaches the recommendation; the default outcome if the reader does nothing is printed as one line on the recommendation slide, under the recommendation, and again on the close.
6. Financing pages: sources are cash, net of OID and of fees paid from proceeds; how any shortfall is funded is stated. A sources-and-uses that ties at face value with an OID on the loan is a FAIL to fix, not a rounding note.
7. Redesigns: `redesign.mjs kept` passes (every source figure printed or dropped on the record with a reason).
8. After the review's fixes: re-lint with `--strict`, re-read every changed PNG, re-run the independent tie-out on the final build.
9. Text budget: every `wordy` and `prose-table` is fixed by cutting or by changing the exhibit, never by shrinking type or by moving the source line, a unit or a disclosure into the notes.

## § 6 Fresh-context reviews

Two reviews, each by a subagent that reads only its inputs (on a harness without subagents, in-thread after re-reading only those inputs, and the handoff says so). The builder never opens the review files; it hands the subagent the path.

- **Cover and exec summary** (Step 6, before the rest is built): [`review-cover.md`](review-cover.md), with `page-01.png`, `page-02.png`, the governing thought and the Picks block's Document, Theme and Brand rows. First word `ship` or `fix`.
- **Finish** (Step 7): [`review-finish.md`](review-finish.md), with every PNG and `STORYBOARD.md` (and the before pages on a redesign). First word `rerender`, `rebuild`, `fix` or `ship`.

Act on the first word; one fix batch per review, then re-lint, re-read every changed PNG and re-run the tie-out.
