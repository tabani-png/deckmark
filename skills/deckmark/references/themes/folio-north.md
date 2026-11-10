---
name: Folio North
slug: folio-north
field: public-sector
format: report-a4
paper: light 1.00 0
display: serif EB Garamond
accent: cool 255
density: medium
keywords: public sector, government report, white paper, strategy, ministry, regulator, utilities, municipality, nordic, a4, chapters, boxes, figures, policy, restraint
inspired_by: Nordic government ministry strategy white paper (A4, chapter numbers, grey boxes, one navy)
pictured: public-sector report
---
# Folio North

A Nordic ministry white paper. A4 portrait, narrow single column, wide margins, numbered chapters with a
classical serif title, plain sans body, numbered grey boxes and figures, one navy. Restrained to the
point of austerity and very easy to read. It is never a slide deck printed portrait, never photo-led
inside, never more than three colours.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --ink:#111111;            /* body text */
  --navy:#1C345E;           /* chapter numbers, figure titles, highlighted bar, cover title band */
  --accent:#1C345E;         /* engine name for --navy: highlight bar, chapter numbers, box labels */
  --muted:#5E5E5E;          /* running heads, folios, notes */
  --box:#ECECEB;            /* boxes and figure frames (warm pale grey) */
  --rule:#000000;           /* footer hairline */
  --cover:#68A9CB;          /* cover panel light blue (cover only) */
  --series-2:#9DB4CF;       /* second chart series */
  --font-display:"EB Garamond",Garamond,"Times New Roman",serif; /* real: Garamond */
  --font-body:"Arimo",Arial,Helvetica,sans-serif;               /* real: Arial */
  --font-cover:"Work Sans",Arial,sans-serif;                    /* real: geometric sans caps on cover */
  --radius:0px;
  --rule-w:0.5pt;
  --page-w:210mm; --page-h:297mm;
  --m-inner:31mm;           /* left on normal pages; 43mm on chapter openers */
  --m-outer:42mm;           /* text measure about 138mm, 70 characters */
  --m-top:42mm;
  --m-bottom:30mm;
  /* engine map: theme colours onto the names base.css reads */
  --paper-2:var(--box);
  --series-1:var(--series-2); --series-3:var(--box);
  --hl:var(--navy);
  --hl-text:var(--navy);
  --divider-bg:var(--paper); --divider-ink:var(--ink);
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
body[data-format="report-a4"] {
  --m-x: 31mm; --m-top: 22mm; --m-bottom: 14mm;
  --fs-title: 24pt; --fs-body: 9pt; --fs-small: 8.5pt; --fs-sub: 10.5pt; --fs-label: 8pt; --fs-furniture: 7pt;
  --weight-title: 400; --gutter: 6mm; }
.slide { padding-right: 42mm; }
.tracker { justify-content: space-between; text-transform: none; letter-spacing: 0; margin-bottom: 18mm; }
.tracker > span, .tracker > .on { border: 0; font-weight: 400; color: var(--muted); padding: 0; }
.action-title { font-weight: 400; line-height: 1.12; }
.slide-head { padding-right: 0; padding-bottom: 5mm; border-bottom: var(--rule-w) solid var(--rule); margin-bottom: 6mm; }
.lead { font-size: 10.5pt; line-height: 1.5; color: var(--ink); }
.slide.cover { background: var(--paper); color: var(--ink); padding: 0; justify-content: flex-start; }
.slide.cover > div:first-child { background: var(--cover); margin-top: 92mm; padding: 14mm 18mm 16mm 31mm; }
.slide.cover .cover-kicker { color: var(--navy); letter-spacing: 0.12em; }
.slide.cover .cover-title { font-family: var(--font-cover); text-transform: uppercase; font-weight: 600; letter-spacing: 0.03em; color: var(--navy); font-size: 30pt; }
.slide.cover .cover-sub { color: var(--navy); opacity: 1; font-size: 12pt; }
.slide.cover .cover-rule { display: none; }
.slide.cover .cover-meta { margin: auto 31mm 14mm; border-top: var(--rule-w) solid var(--rule); color: var(--muted); }
.summary-rows { border-top: 0; gap: 4mm; flex: 0 0 auto; }
.summary-rows .row { background: var(--box); grid-template-columns: 1fr; gap: 1.5mm; border: 0; padding: 5mm 6mm; max-height: none; flex: 0 0 auto; }
.summary-rows .row .k { color: var(--navy); letter-spacing: 0; text-transform: none; font-size: 8pt; }
.summary-rows .row h4 { font-family: var(--font-body); font-size: 9pt; font-weight: 700; }
.exhibit { background: var(--box); padding: 4mm 4mm 3mm; }
.exhibit > figcaption { border-bottom: 0; margin-bottom: 3mm; padding-bottom: 0; font-size: 8pt; }
.exhibit-no { color: var(--ink); letter-spacing: 0; text-transform: none; }
.exhibit-unit { color: var(--ink-2); }
svg.dm-chart .ch-axis { stroke: var(--ink); }
.takeaway { padding: 5mm 6mm; gap: 2mm; }
.takeaway h3 { color: var(--navy); text-transform: none; letter-spacing: 0; font-size: 8pt; }
.takeaway ul { font-size: 8.5pt; }
table.data { font-size: 8.5pt; background: var(--paper); }
table.data th, table.data td { border-bottom: 0; padding: 1.6mm 2mm; }
table.data thead th { border-bottom: var(--rule-w) solid var(--rule); font-size: 8pt; }
table.data tr.total td { border-top: var(--rule-w) solid var(--rule); border-bottom: var(--rule-w) solid var(--rule); }
table.data th.num { white-space: normal; vertical-align: bottom; }
.body-copy { max-width: none; }
.slide-foot { border-top: var(--rule-w) solid var(--rule); padding-top: 2mm; }
/* end furniture */
```

## Type (sizes in pt on A4)
- Chapter title: EB Garamond 400, 30pt / 1.1, ink, two lines max, sentence case, preceded by the number "3." in the same size.
- Section heading: Arimo 400, 11pt, ink; sub-heading Arimo 400 italic 8.5pt.
- Body: Arimo 8.5pt / 11.5pt leading, ragged right, no indents, 6pt between paragraphs.
- Box text: Arimo 7.6pt; box title bold 7.6pt; box label "Box 13" bold --navy.
- Figure label "Figure 4" Arimo bold 7.6pt, title bold 7.6pt.
- Notes and sources: Arimo 7pt ("Note:", "Source:"); footnotes 7pt serif.
- Running head and folio: Arimo 7pt muted.
- Foreword pull quote: EB Garamond 14pt in quotation marks, opening page only.

## Page furniture
- Running head at 25mm from top: chapter label left ("Chapter 3"), section name right.
- Footer: 0.5pt hairline across the measure, then publication title and month right-aligned 7pt, folio at the outer edge.
- Chapter opener: title starts at 55mm from top, a hairline under the title block, then a lead paragraph.
- Cross-references inline in body: "see figure 4", "see box 9". Every box and figure is numbered through the document.
- Cover: full-bleed photo allowed (cover only) with a --cover panel holding the title in --font-cover caps white, subtitle below, date top right, issuing body bottom right.
- Inside cover: plain --box panel, emblem placeholder, one line of where to find the full plan.
- No confidentiality line; public documents carry publication date and issuing body instead.

## Exhibits
- Figures sit inside a --box frame with 4mm padding; chart white-on-grey is not used, chart sits directly on --box.
- Bars: --navy for the one highlighted bar, --series-2 for the rest, a single negative bar in --navy too (no red); axis ticks 6pt, light gridlines 0.25pt white.
- Dual axis allowed only when units differ and both are labelled ("Pct." left and right).
- Schematic "house" or pillar diagrams: --navy roof band, light blue pillars, white text, one row of goals underneath.
- Boxes: --box fill, no border, label + title + body; can hold bold run-in sub-heads.
- Tables: Arimo 7.6pt, bold header, hairline under header and at bottom only.

## Dials
- `folio-north/two-col`: two columns of 65mm for longer reports.
- `folio-north/annex`: denser 7.6pt body for appendices and annexes.
- `folio-north/brand`: swap --navy for an agency colour; keep the grey and one colour rule.

## Never
- More than three colours in the whole document (navy, grey box, cover blue).
- Photographs inside chapters; icons or illustrations as decoration.
- Bold coloured headings, coloured title bars, centred body text.
- Unnumbered boxes or figures, or figures without "Source:".
- Slide-style action titles; chapters are named, not argued.
