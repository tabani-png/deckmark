# Consulting deck grammar (research notes)

Evidence: 7 strategy-consultancy decks and reports, about 72 pages sampled at 50 dpi
(PNGs in `research/pages/consulting/<deck>/`). Decks: a transit authority board readout (89 pp,
4:3), a city sector analysis (40 pp, 16:9), a pharma client working deck (50 pp, court exhibit),
a city COVID recovery council report (26 pp, 4:3), a national energy-efficiency report (129 pp, 4:3),
a transit authority COVID revenue assessment (38 pp, ultra wide 16:9), a national economic
vision full report (1274 pp, 4:3). Style evidence only, no text copied.

Page sizes seen: 705.6x529.2 pt (4:3, three decks), 720x540 (4:3), 960x540 (16:9),
1088x612 (16:9 wide), 612x792 (Letter, a slide set printed onto Letter pages).

## 1. Action titles
- Every content page has a full-sentence title that states the takeaway ("X is by far the
  largest employer in Y"), not a topic label. Topic labels survive only on contents, dividers,
  methodology and appendix pages ("Contents", "Methodology for ...", "Key milestones for ...").
- Length: 1 to 2 lines, rarely 3. Measured 9 to 22 words, typically 12 to 16 words,
  70 to 130 characters. A 3-line title appears only on dense public-sector pages and looks cramped.
- Sentence case, no closing period. Two-part titles use an ellipsis across a split slide
  ("The sector has modest employment..." / "...but is a critical enabler").
- Optional title prefix: a circled letter or number (A, B, 1, 2a, 5) that ties the page to
  a framework shown earlier. This is the tracker in most decks, more than a breadcrumb text.
- Directly under the title, a one-line "chart unit line" in regular weight: what is measured,
  unit, period ("Employment, growth, and specialization by subsector"). Then the chart.

Measured title size (font size as % of page height, from bbox line heights / 1.2):
| family | title font | size pt | % page h | at 1280x720 |
|---|---|---|---|---|
| modern serif strategy | Georgia Bold | ~24 | 4.4% | ~32 px |
| classic Arial template | Arial Bold, navy | ~15 | 2.8% | ~20-22 px |
| airy municipal | Arial regular, blue | ~19 | 3.5% | ~25 px |
| national plan | Century Gothic / Arial | ~20 | 3.8% | ~27 px |
Body text 10 to 14 pt equivalent (14 to 18 px at 720 h). Footnotes and source 6 to 8 pt
(9 to 11 px). Nothing body-level under 9 px.

## 2. Tracker / breadcrumb
- Kicker above title in small caps grey: "SECTION: SUBTOPIC" (e.g. two words, colon, two words),
  about 7 to 8 pt, left aligned on the title x.
- Contents page re-shown at each section start with the current item highlighted (grey or light
  blue bar behind the line, bold text). This repeated agenda is the most common divider.
- Status stamps top right in boxed small caps: "PRELIMINARY", "NON-EXHAUSTIVE",
  "ILLUSTRATIVE", "DETAILS FOLLOW", "DIRECTIONAL", "BASED ON INTERVIEWS, NOT VERIFIED".
  Thin 0.5 pt grey box, 7 pt type. Always about the evidence status, never decoration.
- Confidentiality line top right or bottom: "DRAFT, PRE-DECISIONAL, CONFIDENTIAL AND PROPRIETARY".
- "Current as of <date>" or "Data collected <date>" stamps on time-sensitive pages.

## 3. Exhibit numbering
- Slide decks rarely print "Exhibit N". Page numbers do that job; the circled tracker letter
  links pages to the storyline. Reports in Letter/A4 (research publications) do use
  "Exhibit N" above the chart title. Decklint should require exhibit numbers only in report format.

## 4. Source and note lines
- Bottom left, above the footer, in this order: numbered footnotes ("1 Defined as ...; 2 ..."
  run on one line separated by semicolons or two spaces), then "Source: A; B; C" (or
  "SOURCE:" in caps in the older template). Semicolon-separated, document titles in quotes,
  "Team analysis" or "<firm> analysis" when internal. Present on effectively 100% of chart and
  table pages, absent on text-only and divider pages.
- Footnote markers are superscript digits on the label they qualify, never asterisks.
- Size 6 to 8 pt (9 to 10 px at 720). Grey or black, never coloured.

## 5. Page furniture
- Footer: source left, firm wordmark plus page number right (or a small client logo bottom right
  with the number). Page number 7 to 8 pt.
- Thin horizontal rule under the title in some families (navy 1 pt, or a light grey hairline
  across the content width); others use whitespace only.
- Margins: tight. Left margin measured 1.3% of width (classic Arial template, 9 pt on 705),
  4.4% (airy municipal), 4.6% (modern serif). Top: title starts 3 to 6% down.
  Content uses 90 to 97% of width. These are not airy web layouts; density is the norm.
- Split slide: content left ~65%, a grey (#E6E6E6-ish) right panel ~35% holding the takeaway
  bullets or a second chart. Seen in modern serif and MTA decks.

## 6. Chart conventions
- Direct labels: values printed at the end of every bar; series labelled at line ends,
  legends only when 3+ series and then top right, small, inline swatches.
- No gridlines in bar charts; value axis often removed entirely. Line charts keep a thin
  y-axis with ticks and no horizontal grid, or very light grid.
- Highlight one: all bars navy/dark, the subject bar in the bright accent (e.g. the client
  city in cyan among dark peers). Or all grey with one coloured.
- Sorted horizontal bar charts for rankings, category names left aligned, values right of bar.
- Stacked columns with totals above, segment values inside, segment labels to the right of the
  last column (no legend).
- Heatmap tables: cell fills on a navy to pale cyan sequential scale with white or dark text.
- Harvey balls (quarter fills) in comparison tables with a legend "Most favorable / Least favorable".
- Callout boxes: grey side boxes with a bold 1-line takeaway next to a chart ("51% of commuters
  ... longer than 30 min"), dark arrow connecting a panel to the chart.
- Scenario grid (3x3 of mini line sparklines labelled A1..B5), process chevrons across the top,
  phase columns with dated milestones, 2-column "Description / Case example" frames.
- Waterfalls and marimekkos did not appear in the sampled pages; they are part of the canon but
  use the same rules: dark bars, accent for the delta, labels on bars, no axis.
- Tables: header row in bold with a 1 pt rule below, thin grey rules between rows, no vertical
  rules, no zebra. Group header spanning columns with an underline.

## 7. Colour discipline
- 1 dark (navy, near black blue, or deep green) + 1 bright accent + 2 to 3 tints of the same hue
  + greys. Measured distinct chromatic hues per deck: 2 (most), 3 (national plan with a gold).
- Colour carries meaning (subject vs peers, scenario A vs B), never decoration.
- Accent text in body: key phrases set bold in the accent colour inside bullet text
  ("Reduces congestion by 25%"). Used a lot, roughly 1 to 3 phrases per bullet block.
- Red appears only as a tiny marker (a "today" triangle on a timeline, a highlight box).

## 8. White space
- Low. Pages fill. Whitespace comes from consistent column gutters (2 to 3% of width) and
  aligned left edges, not big margins. The airy municipal family is the exception.

## 9. Section dividers
- Repeated contents page with current item highlighted (most common).
- Full-bleed photo with a grey or tinted wash on the left, list on the right (older template).
- Grey-panel divider with the section title in the left column and a thumbnail on the right (MTA).

## 10. Exec summary forms
- Two-statement opener page: two large accent-colour headlines each followed by a short paragraph.
- "What's new" grid: coloured label cells left, icon, bold accent phrase plus a sentence right.
- Numbered row table: circled number, bold claim in a narrow column, supporting bullets wide.
- Phase workplan with chevrons and "you are here" marker.

## Visual families seen
1. Modern serif strategy (navy + electric cyan, Georgia Bold titles, Arial body). -> meridian
2. Classic Arial template, dense public-sector review (navy titles, harvey balls, tight
   margins, photo-wash dividers, confidentiality header). -> ledgerline
3. Energy/utilities research report (same template genes, navy cover with diagonal, aqua
   label blocks, numbered framework letters). -> gridline
4. Airy municipal council report (light-weight blue titles, thin rule, white, line charts
   with end labels, client co-brand). -> harbourlight
5. National economic plan (deep green with a gold, Century Gothic feel, green footer bar,
   green label sidebars). -> verdance
Also seen: a Calibri framed working-deck variant (blue titles, navy bottom bar, numbered circles),
close to family 2; not made a separate theme.

## Lint candidates (most important)
1. Action title on every content page: full sentence, 8 to 20 words, at most 2 lines, no period.
2. Source line on every page with a chart or table; footnote digits must resolve to a note.
3. Max 2 chromatic hues plus tints and greys; accent used for one highlighted element per chart.
4. Direct labels on bars and line ends; no gridlines in bar charts; legend only for 3+ series.
5. Min font: body >= 14 px, footnotes/source >= 9 px at 1280x720; title size fixed per theme
   and identical on every page (no shrink-to-fit).
