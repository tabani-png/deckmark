# Banking, asset-management, credit and public-sector deck grammar

Analyst notes for Deckmark. Evidence is style only. No text, logos or numbers from these files go into the skill.

## Evidence base

| Code | Document type | Format | Fonts (pdffonts) | Pages seen |
|---|---|---|---|---|
| AM-ID | Large asset manager investor day, 2025 | 960x540 pt (16:9), PowerPoint | proprietary geometric grotesk (Book, Bold, Extrabold, Condensed Light) | 10 of 147 |
| IB-FO | Bulge-bracket special committee fairness discussion materials, 2026 (SEC exhibit 99(c), page JPGs) | 16:9, 1582x890 px scans | custom bank sans (titles), sans body | 21 of 22 |
| PC-BDC | Listed BDC (direct lending) quarterly earnings deck, 2026 | 792x612 pt (Letter landscape) | Bierstadt, Calibri | 8 of 17 |
| IC-PEN | State pension staff investment recommendation memo (private credit commitment) | Letter portrait | Times New Roman, Arial, Verdana | 2 of 2 |
| SC-IR | Junior mining corporate presentation, 2022 (small-cap IR) | 720x540 pt (4:3) | Century Gothic, Montserrat, Calibri, Arial | 9 of 32 |
| CO-RM | Top-tier consultancy roadmap discussion document, 2025 | 960x540 pt | Georgia (titles), Arial (body) | 9 of 115 |
| PS-DK | Danish government utilities strategy white paper, 2016 | A4 portrait, InDesign | Garamond (chapter titles), Arial (body), National (cover) | 10 of 66 |

Page renders: `research/pages/banking/<code>/` (50 dpi). bankerdecks.com search for the manager returned a list only (investor days, earnings supplements of 8 to 120 slides); deck pages there are gated, so the SEC exhibit, BDC deck and pension memo stood in for the pitch book, credit deck and IC memo. No public sell-side CIM was rendered; CIM notes below come from the consultancy discussion document plus standard practice and are marked "practice, not measured".

Unit rule used below: 960 pt slides scale x1.333 to 1280 px; Letter landscape (792 pt) x1.616; A4 measured in pt and in CSS px at 96 dpi (x1.333).

## 1. Bulge-bracket pitch book / board discussion materials (IB-FO)

Measured (converted to 1280 px):
- Action title: single line, sentence-ish noun phrase ("Summary of ...", "Selected ... Precedent Transactions"), not a full-sentence takeaway. About 30 px, regular-to-medium weight, brand blue (#205EE3 class). Top-left at x about 32 px, y about 60 px.
- Subtitle line below title in bold dark: "Last 3 Years Share Price Performance", then a unit line in italic grey: "($ in millions, except per share data)". The unit line is furniture, not optional.
- Body bullets 11 to 12 px. Tables 9.5 to 11 px. Footnotes 7.5 to 9 px. This is the densest family; min legible size in Deckmark should still be 10 px for tables and 9 px for footnotes.
- Top-right red dashed box: "Preliminary Draft | Subject to Review and Revision by ... Committee". A status stamp on every page.
- Footer: source line bottom-left ("Source: Company forecasts, public filings, FactSet. Market data as of [date]."), then "Note:" and numbered footnotes (1), (2). Logo + vertical rule + page number bottom-right.
- Section dividers: white page, "1.  Transaction Overview" in large blue (about 34 px), left third, nothing else.
- Disclaimer page 2: one heading in blue, 4 dense justified paragraphs, 9 px.
- Colours: white paper, navy table/pill headers #0F1632, brand blue #205EE3, light blue #74C3FC, grey #A3ADAF, single green #388C3F for one method row, red #D65F57 dashed for offer price, blue dashed for current price. About 6 colours, used as series coding not decoration.

Furniture catalog:
- **Football field**: rows = methods (DCF, future share price, trading comps, precedent transactions; then a rotated "For Reference Only" group for premiums paid, 52-week range, analyst targets). Floating horizontal bars with low/high labels outside each end ($10.20 | bar | $14.25). Vertical dashed reference lines for current price and offer price, labelled in boxed tags at the top. Right column: assumptions in 9 px bullets per row. Reference-only rows are grey; valuation rows are colour.
- **Comps benchmarking**: one column per peer, logos as column heads, subject company first and highlighted in the accent, peers in navy, mean/median as a dotted horizontal line with "Median: 7.3x" label in the accent. Values printed above bars ("8.7x", "(2.1%)").
- **Sources & uses**: two side-by-side tables with navy title bars ("Sources and Uses", "Pro Forma Capitalization"); columns "$ in mm" and "%"; total rows with a light-blue fill and rule above. Negative numbers in parentheses.
- **Proposal evolution table**: columns by date, last column highlighted light blue, premium rows in %.
- **Sensitivity / tornado**: red and green bars around a midpoint, low and high in boxed tags.
- **DCF table**: years across, "Q3-Q4 2026E", "2027E"; "E" suffix for estimates; terminal year column separated.
- **Precedents**: date, target logo, acquirer logo, FV ($bn), FV/LTM EBITDA columns.
- Number formats: $ in mm / $ in millions, 1 decimal for multiples with "x" (7.7x), percentages 1 decimal, negatives in parentheses, "n/a" and "--" for missing, "E" for estimate, "LTM" and "NTM".

## 2. Asset-manager investor day (AM-ID)

Measured:
- Paper: white content slides; black section covers. Black footer band full width, about 24 px tall, wordmark left in white, page number right (about 8 px).
- Margins 48 px left/right/top (36 pt). Content x from 48 to 1232.
- Title: 37 px (28 pt) extrabold, black, sentence-case claim ("Durable performance is foundational to our platform"). One line.
- Section labels: 18 to 20 px extrabold. Body 16 to 19 px book weight. Condensed light 13 px for chart labels and notes.
- Hero KPI: 107 px (80 pt) extrabold numeral, white on black block, with a short orange bar above it and a 4-line explanation at 27 px bold under it.
- Colour: black, white, one hot accent (#FF4713 orange-red), one secondary (#FFCE00 yellow), tints (#FFDAD0, #FFB194, #FFF5CC, #FEEBF0). Total about 7, but every chart uses only the accent.
- Bars: solid accent, no gridlines, value labels above bars in bold, thin black baseline, minimal axis.
- KPI strip: three black tiles across the bottom with a yellow left bar, big number (37 px) + 2-line caption.
- Footnotes are not on the slide: "Note: For footnoted information, refer to slide N." End-notes slides collect them, dense, 7 to 8 px.
- Section covers: black field, rounded white panel carrying the event name, presenter name/title top right, big 2-line title at about 64 px.
- No stock photography inside content slides; one aerial photo only on the cover.
- "Past performance is not indicative of future results." sits right on performance slides.

## 3. Private credit / direct lending fund deck (PC-BDC)

Measured (Letter landscape, x1.616 to 1280 px wide; a 16:9 port keeps sizes):
- Title 32 px bold navy (#072346), subtitle 19 px regular directly beneath ("Key Financial Highlights"). Thin ochre rule (#C48919) across the full content width under the title block.
- Margins 63 px. Body text dark grey #2D2D2D, not black.
- Tables: 14 to 15 px. Header row navy fill with white bold; first header cell holds the unit in italic: "($000 except per share data)". Section sub-heads inside tables bold, zebra light grey bands on alternate groups, totals with a top rule. Period columns newest first (Jun 30, 2026 | Mar 31, 2026 | ...).
- Footnotes italic 12 to 13 px, superscript numbering, bottom-left above the footer logo.
- Exec summary: left column of light-blue (#C5DCF1) label tiles ("Financial Results", "Portfolio", "Balance Sheet & Liquidity"), right side chevron bullets, dashed dividers between rows.
- Charts: navy bars, ochre for the special/second series, labels inside bars in white, all caps chart titles in navy bold with "($ IN MILLIONS)".
- Cover: full navy field, white wordmark, title in white caps bold, quarter in an ochre pill.
- Watermark: oversized pale grey chevrons on divider and cover pages.
- Credit KPIs that recur: NII per share, NAV per share, % first lien, non-accruals at cost and fair value, debt-to-equity (1.17x), weighted average yield, interest coverage, net leverage, number of portfolio companies. Rolling 5-quarter columns.

## 4. IC memo (IC-PEN) and LP-facing pension documents

- Letter portrait, 1-2 pages. Header: entity mark left, document title centered, "Page 1" right, rule under.
- Section bands: full-width steel-blue (#8EA9C8 class) bars with bold black labels: Investment Recommendation, Investment Rationale, Investment Risks, Portfolio Implications. Body Times 11 pt justified, arrow bullets.
- Recommendation paragraph first, with commitment size, vehicle, and condition ("subject to satisfactory completion of legal due diligence"). Risks get their own section, kept short. Charts show pro forma allocation impact.
- This maps to Deckmark's judgment-prompt law: thesis and recommendation first, then the checks, with risks tagged.

## 5. Small-cap IR deck (SC-IR), used as a counter-example

Grey title bars with letterspaced light caps, logo glyph in every title bar, bright green tables, 4:3, 4 font families, clip-art car, bullets at 8 pt. Shows what Deckmark must avoid: too many fonts, decorative title bars, saturated table fills, crowding. Useful as decklint negative tests.

## 6. Consultancy discussion document (CO-RM), CIM-adjacent

- Serif titles (Georgia Bold 33 px) with a numbered prefix "1.3", optional italic coloured lead-in for the tracker ("Strategic selection set -"). Body Arial 16 to 21 px. Footnotes 11 to 12 px.
- Margins 59 px. Navy #061F79, bright blue #2251FF, pale teal row shading #E3FCFA. Firm name + page number bottom right, 11 px.
- Agenda page reused as a tracker with the current section in a navy filled bar.
- "Preliminary" small bold label above tables. Gantt with 36 month columns.
- Cover: deep blue gradient, serif title, "Discussion document", date, confidentiality line at 7 px.

CIM conventions (practice, not measured): portrait or landscape, cover with project codename only, confidentiality notice and "Strictly private and confidential", process letter reference, numbered sections (Executive Summary, Investment Highlights, Business Overview, Customers, Operations, Management, Financial Overview, Appendix), investment highlights as 5-8 numbered tiles, adjusted EBITDA bridge, historical + projected P&L with "A" and "E/P" suffixes, KPI definitions in an appendix, contact page with advisor team only.

## 7. Nordic public-sector report (PS-DK)

Measured (A4 595x842 pt):
- Body Arial 8.5 pt (11.3 px), leading about 1.35. Box text 7.6 pt. Footnotes 7 pt, serif in places. Chapter title EB Garamond-class 30 pt (40 px), regular weight, two lines, sentence case, with "3." number.
- Text block: left edge 87 pt (single pages) to 122 pt (chapter pages), right edge about 475 to 510 pt. Measure about 390 pt (about 70 characters). Top of text 120 pt, footer at 731 pt.
- Running head: chapter number left ("Kapitel 3"), section name right, 7 pt. Footer: hairline rule full measure, publication title and month right, folio.
- Colour: navy #1C345E (headings, figure frames, one bar highlight), pale warm grey box fill #ECECEB, cover light blue #68A9CB. Three colours, everything else black.
- Boxes: "Boks 13" label, bold box title, grey fill, no border. Figures: "Figur 4" bold label + bold title, then chart in a grey-filled frame, then "Anm.:" and "Kilde:" lines in 7 pt.
- Cross-references inline: "jf. figur 4", "jf. boks 9".
- Opening pull quote in Garamond in quotes as a minister foreword. Generous white space, no photography inside.

## Rules for decklint (ranked)

1. Every exhibit has a source line beginning "Source:" and, when values are financial, a unit line ("($ in millions)", "($000 except per share data)"). Fail if a chart or table lacks either.
2. Number formatting is consistent per deck: negatives in parentheses, multiples with one decimal and "x", percentages one decimal, "E" suffix on estimate periods, "n/a" or "--" for missing. Fail on mixed minus signs or mixed decimals within a column.
3. Totals tie: every table row marked Total equals the sum of its components within rounding (0.5 of the last shown digit); sources equal uses.
4. Minimum sizes at 1280 px: body 14 px (slides) or 11 px (A4 body), tables 10 px, footnotes 9 px. Pitch-book density is allowed only down to these floors.
5. One highlight colour per exhibit: the subject company or the key bar gets the accent; peers and other series are neutral. Max 6 palette colours per deck excluding tints.
6. Status stamp and confidentiality line on every page when the theme declares them (draft stamp, "Strictly private and confidential").
7. Fonts: max 2 families per deck (display + body). Fail on a third.
8. Action title fits one line (two max) and never overlaps the tracker or stamp.
