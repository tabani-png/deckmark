---
name: Gridline
slug: gridline
field: consulting
format: both
paper: light 1.00 0
display: sans Arial
accent: cool 210
density: dense
keywords: energy, utilities, power, efficiency, abatement, policy, infrastructure, research report, government study, barriers, levers, aqua
inspired_by: consultancy research report for a national energy or utilities ministry
pictured: research report
---
# Gridline

A long research report made of slides: navy titles, aqua label blocks down the left side, numbered
frameworks (1, 2, A, B) that the reader can follow across a hundred pages. It feels technical and
patient, like evidence for a policy decision. It is never a pitch, never sparse, never decorated with
stock icons. Charts are engineering-plain.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --cover:#002960;          /* navy cover field, diagonal cut to white */
  --ink:#002960;            /* titles, framework badges */
  --ink-2:#000000;
  --muted:#767676;
  --label:#A8E4FC;          /* aqua label blocks (left column cells) */
  --label-2:#D6F0FC;        /* pale aqua panel backgrounds, header bars */
  --accent:#00A0E0;         /* bright series, section kicker, header bars of panels */
  --accent-text:#007DB0;    /* --accent darkened for text on white (4.6:1) */
  --rule:#BFBFBF;
  --dash:#9CA8C0;           /* dashed separators between rows */
  --series-1:#002960; --series-2:#00A0E0; --series-3:#7FD3F5; --series-4:#BFBFBF;
  --pop:#C8007F;            /* only when a stacked chart needs a 5th category; avoid */
  --font-display: Arial, "Arimo", Helvetica, sans-serif;  /* real: Arial Bold */
  --font-body: Arial, "Arimo", Helvetica, sans-serif;
  --font-table: "Carlito", Calibri, Arial, sans-serif;     /* real: Calibri in dense tables */
  --radius:0px;
  --rule-w:0.75px;
  --m-x:20px;               /* tight, about 1.5% of width */
  --m-top:16px;
  --gutter:16px;
  /* engine map: theme colours onto the names base.css reads */
  --paper-2:var(--label-2);
  --hl:var(--accent);
  --hl-text:var(--accent-text);
  --divider-bg:var(--cover);
  --fs-title:23px; --fs-body:14px; --fs-small:14px; --fs-table:12.5px;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.tracker > span { padding: 2px 0; }
.tracker > .on { color: var(--accent-text); border-bottom: 0; }
.tracker > .on::before { content: ""; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--ink); margin-right: 6px; vertical-align: 1px; }
.stamp { border: 0.75px solid var(--rule); padding: 2px 7px; color: var(--muted); }
.slide.cover { background: var(--cover); }
.slide.cover::after { content: ""; position: absolute; top: 0; right: 0; bottom: 0; width: 30%; background: var(--paper); clip-path: polygon(46% 0, 100% 0, 100% 100%, 0 100%); }
.slide.cover .cover-title { font-weight: 400; max-width: 13em; }
.slide.cover .cover-kicker { color: var(--label); }
.slide.cover .cover-rule { background: var(--accent); }
.slide.cover .cover-meta { max-width: 62%; }
.summary-rows { border-top: 0; gap: 6px; }
.summary-rows .row { grid-template-columns: 250px 1fr; border-bottom: 0.75px dashed var(--dash); padding: 0; gap: 18px; align-items: stretch; }
.summary-rows .row > div:first-child { background: var(--label); padding: 10px 14px; }
.summary-rows .row > p { padding: 10px 0; }
.summary-rows .row .k { color: var(--ink); }
table.data { font-family: var(--font-table); font-size: 13px; }
table.data thead th { background: var(--label-2); color: var(--ink); border-bottom: 0; }
table.data td { border-bottom: 0.75px dashed var(--dash); padding: 4px 10px; }
table.data td:first-child { background: var(--label); color: var(--ink); font-weight: 700; border-bottom: 2px solid var(--paper); }
table.data tr.total td { border-top: 1.5px solid var(--ink); }
table.data tr.total td:first-child { background: var(--ink); color: var(--paper); }
.takeaway { background: var(--paper); border: 0.75px solid var(--label); border-top: 4px solid var(--accent); }
/* end furniture */
```

## Type
- Display: Arial bold 21px / 1.15, --ink, 2 lines typical.
- Kicker above title: 11px caps, letter-spaced 0.12em, --accent, with a small circled number badge ("1 POLICY").
- Body: Arial 14px / 1.25 (the body minimum); tables 12.5px Carlito (--fs-table).
- Label block text: Arial bold 12px --ink on --label.
- Figures: Arial 12px, tabular.
- Footnotes/source: Arial 9.5px; "Source:" sentence case.
- Report format (A4): title 22pt, body 10pt, add "Exhibit N" in 9pt caps above each chart title.

## Slide furniture
- Title top left, no rule. Circled framework number and letter badges (navy circle, white letter) prefix the title.
- Status stamp top right, small caps in a 0.75px grey box ("INDUSTRIAL SECTOR, SOCIETAL", "BASED ON DATA FROM INTERVIEW, NOT VERIFIED").
- Source bottom left, page number bottom right, 9.5px. No logo on inner pages.
- Cover: --cover navy field, title in white light weight 34px, month and year caps bottom left, diagonal white wedge right.
- Dividers: agenda reprinted, current item on an --label highlight, photo of a still-life on the left half allowed.

## Exhibits
- Left label column: --label cells, bold navy text, rotated vertical group labels allowed for row groups.
- Panel header bars: --accent fill, white bold 12px text, chevron joints between sequential panels.
- Stacked columns: series colours in order --series-1..4, totals on top, segment values inside, legend as a key above with square swatches.
- Measure tables with inline mini bars in --label and a dashed outline for "not quantified".
- Line charts: 1.5px black or navy, small axis labels, no gridlines.
- Rows separated by --dash dashed lines.

## Dials
- `gridline/format`: slides-16x9 or report-a4.
- `gridline/labels`: aqua label column on or off.
- `gridline/badges`: framework number badges on titles on or off.

## Never
- More than 4 series colours; never the --pop colour unless the data forces it.
- Big hero numbers, photo-heavy pages, icons as filler.
- Rounded cards or shadows; coloured page backgrounds behind charts.
- Missing source on a measure table.
