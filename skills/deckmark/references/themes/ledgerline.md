---
name: Ledgerline
slug: ledgerline
field: public-sector
format: slides-16x9
paper: light 1.00 0
display: sans Arial
accent: cool 250
density: dense
keywords: public sector, transit, agency, board readout, operating review, cost reduction, initiatives, harvey balls, roadmap, workplan, pre-decisional
inspired_by: classic strategy consultancy board readout for a public transit agency (older Arial template)
pictured: board pack
---
# Ledgerline

A working document for a board or agency leadership. Bold navy Arial titles, tight margins, a lot on
every page, all of it aligned. Harvey balls, initiative tables, phase workplans and a contents page that
reappears with the current section lit. It reads as serious and pre-decisional. It is never glossy, never
a marketing deck, never sparse; and it never uses more than one blue family.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --band:#D9E3EF;           /* pale blue panels, phase backgrounds, highlight bar */
  --grey-band:#E6E6E6;      /* current-item highlight on contents, footer strip */
  --ink:#003366;            /* navy: titles, harvey fills, label column text */
  --ink-2:#000000;          /* body */
  --muted:#767676;          /* confidentiality header, kicker, source */
  --rule:#003366;           /* 1px navy rule under title area */
  --hair:#BFBFBF;           /* dotted/thin row separators */
  --accent:#2E6DB4;         /* bold key phrases inside bullets */
  --tint-1:#6E8FB0;
  --tint-2:#A9BCCF;
  --marker:#C00000;         /* single "today" triangle on timelines only */
  --font-display: Arial, "Arimo", Helvetica, sans-serif;   /* real: Arial Bold */
  --font-body: Arial, "Arimo", Helvetica, sans-serif;      /* real: Arial */
  --font-alt: "Libre Franklin", "Franklin Gothic Book", Arial, sans-serif; /* real: Franklin Gothic Book, kicker only */
  --radius:0px;
  --rule-w:1px;
  --m-x:24px;               /* about 2% of width: this template is tight */
  --m-top:14px;
  --gutter:20px;
  /* engine map: theme colours onto the names base.css reads */
  --paper-2:var(--band);
  --series-1:var(--tint-2); --series-2:var(--tint-1); --series-3:var(--band); --series-4:var(--grey-band);
  --hl:var(--ink);
  --hl-text:var(--ink);
  --divider-bg:var(--grey-band); --divider-ink:var(--ink);
  --fs-title:22px; --fs-body:14px; --fs-small:14px; --fs-table:13px;
  --m-bottom:0px;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.slide-head { border-bottom: 1px solid var(--rule); padding-bottom: 8px; }
.tracker { font-family: var(--font-alt); }
.tracker > .on { border-bottom-color: var(--ink); }
.stamp { border: 0.75px solid var(--hair); padding: 2px 7px; top: calc(var(--m-top) + 22px); }
.slide.cover .cover-kicker { color: var(--band); }
.slide.cover .cover-rule { background: var(--band); height: 2px; }
.summary-rows { border-top: 0; flex: 1 1 auto; }
.summary-rows .row { flex: 1 1 0; max-height: 132px; padding: 12px 0; }
.summary-rows .row .k { color: var(--accent); }
.summary-rows .row h4 { font-family: var(--font-display); font-size: 17px; }
.takeaway { background: var(--paper); border-top: 3px solid var(--ink); padding: 16px 4px; }
table.data { font-size: 13.5px; }
table.data thead th { border-bottom: 1px solid var(--rule); }
table.data td { border-bottom: 0.75px dotted var(--hair); }
table.data td:first-child { font-weight: 700; color: var(--ink); }
.hb { border-color: var(--ink); background: conic-gradient(var(--ink) 0 calc(var(--v, 0) * 25%), var(--paper) 0); width: 18px; height: 18px; }
.slide-foot { background: var(--grey-band); margin: 0 calc(var(--m-x) * -1); padding: 7px var(--m-x) 9px; }
/* end furniture */
```

## Type
- Display (action title): Arial bold 22px / 1.15, --ink, up to 2 lines (3 only if unavoidable), left at --m-x.
- Kicker above title: Franklin-style 10px caps, muted ("SECTION: SUBTOPIC").
- Body: Arial 14px / 1.25, square bullets, en-dash sub-bullets indented 18px.
- Key phrase: bold in --accent, 1 to 2 per bullet group.
- Table headers: Arial bold 13px --ink, underlined with --rule.
- Figures: Arial 13px, tabular numbers.
- Footnotes and source: Arial 9.5px; source prefix in caps "SOURCE:".
- Confidentiality header: 9.5px caps muted, top right.

## Slide furniture
- Top right on every page: "DRAFT, PRE-DECISIONAL, CONFIDENTIAL AND PROPRIETARY" style line.
- Title block, then a 1px navy rule across the full content width.
- Optional circled letter in --ink (white letter) before the title to tie to a framework.
- Boxed stamp right of the title: "DETAILS FOLLOW", "NON-EXHAUSTIVE" in 9.5px caps, 0.75px grey box.
- Footer: grey strip 32px tall across the bottom, small client mark and page number at right.
- Source bottom left just above the strip.
- Dividers: the agenda reprinted, current item on a --grey-band bar in bold, left edge with a desaturated photo wash allowed.

## Exhibits
- Harvey balls: 18px circles, --ink fill in quarters, legend top right "Most favorable / Least favorable".
- Initiative table: numbered circle + bold navy name column (18%), description bullets (50%), 3 rating columns.
- Workplan: 4 phase columns on --band with chevrons between headers, dated milestone at bottom, red triangle for today.
- Bars: --ink, others --tint-2, labels on bars, no gridlines.
- Process roadmaps: navy rectangles with white text, a light arrow band (--tint-2) behind numbered steps.
- Tables: no verticals except dotted dividers between big columns; thin hairlines between rows.

## Dials
- `ledgerline/photo-dividers`: on (photo wash) or off (plain grey agenda).
- `ledgerline/band`: pale blue phase panels vs white with rules only.
- `ledgerline/stamp`: confidentiality line on every page vs cover only.

## Never
- Big empty margins, centred titles, hero numbers alone on a page.
- More than one blue family plus greys; no green/amber RAG unless the content is a RAG status.
- Rounded corners, shadows, gradient fills.
- Topic-label titles on analysis pages.
- Harvey balls without a legend.
