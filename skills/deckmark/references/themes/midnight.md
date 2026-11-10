---
name: Midnight
slug: midnight
field: asset-mgmt
format: slides-16x9
paper: dark 0.14 264
display: grotesk-sans Mona Sans
accent: cool 230
density: medium
keywords: investor day, fund pitch, fundraise, lp meeting, private credit, infrastructure, income fund, track record, aum, dark, midnight blue, night, calm, expanded sans, institutional, asset management, capital markets day
inspired_by: institutional asset manager investor-day deck shown on a dark stage (midnight ground, wide light headings, one cool signal)
pictured: investor day
adapted_from: hallmark/midnight (MIT)
---
# Midnight

A calm, cold investor-day deck whose blue is the ground itself: deep midnight blue to every edge, cool white ink, Mona Sans in an expanded light cut for titles and headline figures like the cards of a film, the same family at normal width for reading. Panels are cut square in steps of lighter blue, and one azure signal marks the figure or bar the slide is about. It reads well on a dark auditorium screen and still prints. It is never a neon dark mode, never frosted glass, never a black page with a blue button, and never warm.

## Tokens
```css
:root{
  --paper: oklch(14% 0.048 264);        /* midnight ground, every edge */
  --paper-2: oklch(18.5% 0.052 264);    /* panel one step up: takeaway, divider, row highlight */
  --paper-3: oklch(23% 0.055 264);      /* deepest lift: so-what bar, dark callout */
  --ink: oklch(95% 0.016 250);          /* cool white: titles, figures */
  --ink-2: oklch(88% 0.05 245);         /* body text */
  --muted: oklch(73% 0.04 256);         /* labels, axis, source (7.4:1 on paper) */
  --rule: oklch(29% 0.058 264);         /* hairlines between rows, gridlines */
  --rule-2: oklch(40% 0.06 262);        /* heavier rule: table head, strip tops, axis */
  --accent: oklch(80% 0.11 230);        /* azure: the one highlighted bar, figure or row marker */
  --accent-2: oklch(58% 0.1 236);       /* deep azure: second series, meter fills */
  --accent-ink: oklch(16% 0.05 264);    /* text on an azure fill */
  --accent-text: var(--accent);         /* azure is light enough to read on the ground (9:1) */
  --font-display: "Mona Sans", ui-sans-serif, system-ui, sans-serif;   /* expanded 125%, 300 and 400 */
  --font-body: "Mona Sans", ui-sans-serif, system-ui, sans-serif;      /* normal width, 400 and 500 */
  --font-figures: "Mona Sans", ui-sans-serif, system-ui, sans-serif;
  --gf-load: "Mona Sans:wdth,wght@100,400;100,500;100,700;125,300;125,400";
  --radius: 0px;
  --rule-w: 1px;
  --m-x: 60px;
  --m-top: 40px;
  --gutter: 30px;
  /* engine map: theme colours onto the names base.css reads */
  --hl: var(--accent);
  --hl-text: var(--accent);
  --series-1: oklch(52% 0.07 252);      /* steel blue: every bar that is not the subject */
  --series-2: oklch(40% 0.06 262);
  --series-3: oklch(32% 0.058 264);
  --series-4: oklch(26% 0.055 264);
  --pos: oklch(82% 0.1 175);            /* cool green for favourable deltas, never warm */
  --neg: var(--ink-2);                  /* adverse stays in ink, not red */
  --watch: oklch(84% 0.12 228);
  --divider-bg: var(--paper-2);
  --divider-ink: var(--ink);
  --cover-bg: var(--paper);
  --cover-ink: var(--ink);
  --field: var(--paper-3);
  --field-ink: var(--ink);
  --desk: oklch(9% 0.03 264);
  --fs-title: 27px;
  --fs-cover: 50px;
  --fs-kpi: 46px;
  --fs-divider: 46px;
  --weight-title: 400;
  --tracking-label: 0;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.action-title, .cover-title, .divider-title, .kpi-value, .cover-figure, .callout-figure { font-stretch: 125%; letter-spacing: -0.015em; }
.action-title { line-height: 1.16; }
.cover-title { font-weight: 300; line-height: 1.16; }
.divider-title { font-weight: 300; }
.kpi-value { font-weight: 300; letter-spacing: -0.03em; line-height: 1.18; }
.kpi-value .u { font-stretch: 100%; font-weight: 400; color: var(--ink-2); }
.tracker, .kicker, .label, .stamp, .exhibit-no, .takeaway h3, .summary-rows .row .k, .cover-kicker, .confid, .tl-date, .sources-uses h4, .section-band { text-transform: none; letter-spacing: 0; font-weight: 500; }
.tracker { font-size: 11px; }
.stamp { border-bottom-color: var(--rule-2); }
.exhibit-no { color: var(--muted); }
.exhibit > figcaption { border-bottom-color: var(--rule); }
.kicker, .summary-rows .row .k { color: var(--muted); }
.kpi-strip, .summary-rows { border-top: var(--rule-w) solid var(--rule-2); }
.kpi-label { color: var(--muted); }
.summary-rows .row h4 { font-family: var(--font-body); font-weight: 500; font-size: 18px; color: var(--ink); }
.summary-rows .row p { font-size: 15px; }
.takeaway h3 { color: var(--muted); font-size: 12px; }
.takeaway .so-what { font-weight: 500; border-left: 2px solid var(--accent); }
.callout { border-left-width: 2px; }
table.data thead th, table.harvey thead th { color: var(--muted); font-weight: 500; border-bottom: var(--rule-w) solid var(--rule-2); }
table.data tr.total td, table.data tr.group td { border-top: var(--rule-w) solid var(--rule-2); border-bottom-color: var(--rule-2); }
table.data tr.hl td:first-child { box-shadow: inset 2px 0 0 var(--accent); }
.tomb { border-top: 2px solid var(--rule-2); }
.cover-rule { width: 64px; height: 2px; }
.cover-meta { border-top-color: var(--rule-2); color: var(--muted); }
svg.dm-chart .ch-axis { stroke: var(--rule-2); }
svg.dm-chart .ch-value { font-weight: 500; }
svg.dm-chart .ch-cat, svg.dm-chart .ch-muted { fill: var(--muted); }
svg.dm-chart .ch-cat { font-variant-numeric: normal; }
.status { font-weight: 500; color: var(--ink-2); }
/* end furniture */
```

## Type
- Action title: Mona Sans 400 at 125% width, 27px / 1.16, --ink, sentence case, max 2 lines, left at --m-x. The wide cut is the voice; a long title is cut down, never set at normal width.
- Cover title: Mona Sans 300 expanded, 50px / 1.16, --ink on the ground. Divider title the same at 46px.
- Headline figures (KPI tiles, cover figure, callout figure): Mona Sans 300 expanded, 46px, tabular, tracking -0.03em; the unit beside it at normal width 400 in --ink-2.
- Body: Mona Sans 400 at normal width, 15px / 1.4, --ink-2; bold phrases in --ink at 700, max 3 a block.
- Item heads (summary rows, takeaway, tombstones): Mona Sans 500 at normal width, 18px, --ink.
- Labels, tracker, table heads, exhibit numbers: Mona Sans 500, 11 to 12px, sentence case, untracked, --muted. No capitals, no mono anywhere.
- Source and footnotes: 10px --muted; minimum anywhere 9px.

## Slide furniture
- Tracker above the title: sentence-case section names in 11px muted, the current one in --ink with a 1px azure underline.
- Action title top left; optional stamp top right ("Preliminary", "Illustrative") in 10px muted with a --rule-2 underline.
- No rule under the title; space separates. Strip tops and table heads take a 1px --rule-2 rule, never a heavy white bar.
- Source block bottom left: footnote line then "Source: ..." in 10px muted. Footer right: confidentiality then page number in --ink 700.
- Cover: the midnight ground to every edge, kicker in azure, title in the expanded light cut over two lines, a short 2px azure rule, meta line over a --rule-2 hairline. Never a light cover.
- Divider: --paper-2 band to every edge, section number and title in the expanded light cut, contents list with the current item outlined in 1px ink.

## Exhibits
- Bars: steel blue --series-1 fills, the subject bar in azure; value labels at the bar end in 500, the highlighted one in azure. No gridlines on labelled bars; the base axis is a --rule-2 hairline.
- Lines: 2.25px steel, the subject line 2.75px azure with ground-filled dot markers; series named at the line end, no legend box.
- Stacks: steel steps from --series-1 down to --series-4 (lighter to darker into the ground), the subject segment in azure.
- Category labels and axis ticks in --muted; values in --ink.
- Tables: 500 muted head over a 1px --rule-2 rule, 1px --rule between rows, no verticals, no zebra; the subject row on --paper-2 with a 2px azure tick at its left edge. Totals over a --rule-2 hairline in 700.
- Takeaway panel: --paper-2, square, no outline; the so-what bar one step up on --paper-3 with a 2px azure left edge.
- Highlight rule: azure stays under 5% of the slide. One bar, one line, one row marker or one figure; never a field.

## Dials
- `midnight/stage`: cover and dividers set the title at 60px in the expanded light cut with nothing else above the fold; for an auditorium screen.
- `midnight/print`: rules step up to --rule-2 everywhere and body text to --ink, for a deck that will also be printed.
- `midnight/figure`: one headline figure per section slide at twice --fs-kpi, alone on the ground with its unit and one line.

## Never
- A warm accent, a red for "bad", or a second signal colour.
- A heavy display weight or a title at normal width; the expanded light cut is the face.
- Glow, halo, radial light, gradient or a lit edge on any panel or bar.
- A rounded corner, a drop shadow or a light section; dark and square end to end.
- Azure as a background field, or on more than one thing per exhibit.
- Tracked capitals, mono labels, emoji or decorative icons.
