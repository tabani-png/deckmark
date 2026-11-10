---
name: Glasswork
slug: glasswork
field: dashboard
format: slides-16x9
paper: light 0.97 250
display: serif Source Serif 4
accent: cool 255
density: medium
keywords: dashboard, kpi tiles, monitoring, underwriting desk, covenant tracker, portfolio surveillance, frosted cards, glass, navy, serif headings, status dots, deltas, board scorecard, credit monitoring, live deal
inspired_by: modern fintech monitoring dashboards (frosted white cards on a pale blue canvas, serif headings, KPI tiles with deltas)
pictured: credit-memo
---
# Glasswork

A pale blue-white canvas with frosted white cards floating on it, each card holding one answer: a KPI with its delta, a bar chart, a covenant table with green checks. Headings are a sharp, high-contrast serif in deep navy, so the page reads as a document a credit officer would sign, not a SaaS screen. Colour is spent only on data and status: mid-blue bars, green for passing, amber for watch, red for breach. It is never dark mode, never neon, never a gradient on data, never a card with nothing to say, and never decorative icons standing in for numbers.

## Tokens
```css
:root{
  --paper:#EEF3FA;             /* engine name for --canvas: the slide ground */
  --paper-2:#FFFFFF;           /* engine name for --card-solid: panels and cards */
  --canvas:#EEF3FA;            /* page ground, pale blue-white */
  --canvas-2:#F7F9FD;          /* top-left glow of the radial wash */
  --card:rgba(255,255,255,0.78);
  --card-solid:#FFFFFF;        /* print/PDF fallback when blur is off */
  --card-edge:rgba(255,255,255,0.95);  /* 1px inner highlight border */
  --card-shadow:0 1px 2px rgba(20,33,61,0.04), 0 8px 24px rgba(36,64,120,0.08);
  --blur:14px;
  --ink:#14213D;               /* navy: titles, KPI figures, table text */
  --ink-2:#2B3A5C;             /* body text */
  --muted:#5E6C8A;             /* labels, axis text, timestamps */
  --rule:#DCE4F0;              /* hairlines, gridlines, table rules */
  --bar-1:#4A78C2;             /* primary series, mid-blue */
  --bar-2:#8FB0E0;             /* second series */
  --bar-3:#C4D5EF;             /* third series */
  --accent:#4A78C2;            /* engine name for --bar-1 */
  --accent-text:#3A65A8;       /* --bar-1 darkened for text on the canvas (5.2:1) */
  --line:#A9C2E8;              /* line series with white-centred markers */
  --ok:#2E9E4F;                /* pass, favourable delta */
  --ok-bg:#E3F4E8;
  --watch:#E8A23A;             /* amber: watch, threshold lines */
  --watch-bg:#FCF1DE;
  --caution:#E9C33B;           /* yellow: low-priority flag */
  --breach:#D9473F;            /* red: breach, adverse */
  --breach-bg:#FBE4E2;
  --font-display:"Source Serif 4","Georgia",serif;   /* opsz 60, weight 700 */
  --font-body:"Inter","Helvetica Neue",Arial,sans-serif;
  --font-figures:"Source Serif 4","Georgia",serif;   /* KPI values, lining tabular */
  --font-label:"Inter","Helvetica Neue",Arial,sans-serif;
  --radius-card:14px;
  --radius-chip:999px;
  --rule-w:1px;
  --gap:16px;
  --m-x:40px;
  --m-top:32px;
  /* engine map: theme colours onto the names base.css reads */
  --series-1:var(--bar-2); --series-2:var(--bar-2); --series-3:var(--bar-3); --series-4:var(--rule);
  --hl:var(--bar-1);
  --pos:#1F7A3A;             /* --ok darkened for delta text on white cards (5.4:1) */
  --neg:#B8322B;             /* --breach darkened for delta text (6.0:1) */
  --watch-dot:var(--watch);
  --divider-bg:var(--canvas); --divider-ink:var(--ink);
  --radius:var(--radius-card);
  --gutter:var(--gap);
  --fs-title:32px; --fs-kpi:46px; --fs-body:14px;
  --tracking-label:0.2em;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.slide { background: radial-gradient(1200px 700px at 15% 0%, var(--canvas-2), var(--canvas)); }
.tracker { gap: 10px; font-weight: 500; color: var(--ink-2); }
.tracker > span + span::before { content: "/"; margin-right: 10px; color: var(--muted); font-weight: 400; }
.tracker > .on { border-bottom-color: transparent; }
.stamp { border-bottom: 0; color: var(--muted); letter-spacing: 0.04em; }
.stamp::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--ok); margin-right: 7px; vertical-align: 1px; }
.kpi, .takeaway, .summary-rows .row, .slide.cover.light > div:first-child {
  background: var(--card-solid); border: 1px solid var(--card-edge); border-radius: var(--radius-card); box-shadow: var(--card-shadow); }
.exhibit { background: var(--card-solid); border: 1px solid var(--rule); border-radius: var(--radius-card); padding: 16px 20px 12px; }
.exhibit > figcaption { border-bottom: 0; margin-bottom: 4px; }
.exhibit-title { font-family: var(--font-display); font-size: 17px; }
.exhibit-no { letter-spacing: 0.08em; }
.kpi-strip { border-top: 0; gap: var(--gap); }
.kpi { padding: 24px 24px 22px; gap: 10px; }
.kpi + .kpi { border-left: 1px solid var(--card-edge); margin-left: 0; padding-left: 20px; }
.kpi-label { order: -1; font-weight: 500; }
.kpi .delta { font-size: 14px; }
.summary-rows { flex-direction: row; gap: var(--gap); border-top: 0; flex: 1 1 auto; max-height: 300px; }
.summary-rows .row { grid-template-columns: 1fr; gap: 6px; align-content: start; border-bottom: 1px solid var(--card-edge); padding: 18px 22px; max-height: none; }
.summary-rows .row h4 { font-size: 19px; }
.summary-rows .row p { font-size: 15px; }
.summary-rows .row { padding: 22px 24px; }
.takeaway { padding: 20px 22px; }
.takeaway h3 { font-family: var(--font-display); font-size: 17px; text-transform: none; letter-spacing: 0; color: var(--ink); }
.takeaway .so-what { border-radius: 10px; }
.callout.dark { border-radius: var(--radius-card); border-left: 0; padding: 16px 22px; margin-top: auto; font-size: 15px; }
.slide.cover.light { background: radial-gradient(1200px 700px at 15% 0%, var(--canvas-2), var(--canvas)); }
.slide.cover.light > div:first-child { padding: 44px 48px; max-width: 900px; }
.slide.cover.light .cover-rule { background: var(--bar-1); border-radius: 2px; }
.cover-title { font-size: 46px; line-height: 1.14; }
.kpi-value { line-height: 1.18; }
.action-title { line-height: 1.2; }
table.data { font-size: 14px; }
table.data thead th { font-weight: 500; color: var(--muted); border-bottom: 1px solid var(--rule); }
table.data td { border-bottom-color: var(--rule); padding: 8px 10px; }
svg.dm-chart .ch-bar { rx: 4px; }
.status.st-watch::before { background: var(--watch); }
.status.st-breach::before { background: var(--breach); }
/* end furniture */
body{background:radial-gradient(1200px 700px at 15% 0%,var(--canvas-2),var(--canvas));}
.card{background:var(--card);backdrop-filter:blur(var(--blur));border:1px solid var(--card-edge);
      border-radius:var(--radius-card);box-shadow:var(--card-shadow);padding:18px 20px;}
```

## Type
- Action title: Source Serif 4 700, 34px / 1.12, --ink, one line preferred, two max, sentence case claim ("Leverage falls below 4.0x by 2028 in the base case").
- Kicker under the title: Inter 500, 12px, uppercase, letter-spacing 0.28em, --ink-2, items separated by " / " (e.g. DILIGENCE / MODELING / COVENANTS / IC MEMO). Doubles as the tracker; the current section in --ink 700.
- Card title: Source Serif 4 700, 19px, --ink.
- KPI value: Source Serif 4 700, 40px, tabular lining figures, --ink; a pass/breach value may take --ok or --breach.
- KPI label: Inter 500, 14px, --ink-2. Delta: Inter 600, 15px with a solid triangle, --ok or --breach by effect (leverage down is good, so green).
- Body and table text: Inter 400, 14px / 1.4; table header Inter 500 12.5px --muted.
- Axis and legend: Inter 400, 12px, --muted. Source and footnotes: Inter 400, 10.5px, --muted. Minimum anywhere: 10px.

## Slide furniture
- Title block top-left at (40,32); live-status chip top-right: 8px --ok dot + Inter 500 14px "Live deal" style label only if the user's deck has a status; under it "As of: <date, time, zone>" Inter 12px --muted. The as-of stamp is required on every data slide.
- Content sits in cards on a 12-column grid (84px columns, 16px gutters) from y 150 to y 660.
- Exhibit source line inside the bottom of each card, 10.5px --muted, left-aligned. Slide-level footnotes at y 670.
- Footer y 696: document name and "Confidential" left, page number right, Inter 11px --muted. No logo unless supplied.
- Section divider: canvas only, one large frosted card cols 2-11 holding section number in --bar-1 and the section name in serif 48px.

## Exhibits
- KPI tile (kpi-strip): 4 tiles across, 96px tall cards; label top-left, value below, delta to the right of the value on the same baseline. A tile with no comparison is not allowed.
- Bars: flat --bar-1, 4px top radius, no outline; gridlines 1px --rule at 4-5 ticks; value axis left with units ("$45M"); legend top-right inside the card with square swatches 10px. Series order --bar-1, --bar-2, --bar-3; never more than three.
- Line overlay on bars: 2px --line with 6px white-filled markers ringed in --line.
- Threshold or covenant level: 1.5px dashed --watch horizontal line, labelled at its right end ("Min DSCR 1.5x").
- Covenant / status table: no vertical rules, 1px --rule between rows, Limit and Current right-aligned tabular, Current coloured by status, status column a 18px filled circle with a white check (--ok), exclamation (--watch) or cross (--breach).
- Flag list: 10px status dot then the flag text and its number in parentheses ("Customer concentration (35% top customer)"); ordered red, amber, yellow, green.
- Progress: 8px rounded bar, --ok fill on --rule track, percent at right in serif 700 22px; checklist items under it with 16px --ok check circles. Items not done use an empty --rule ring, never a check.
- Document card: 40px outlined doc glyph in --bar-1, serif title, two-line Inter description, a ghost "Open" button only in interactive HTML; omitted in PDF.
- Highlight rule: the series or row the title talks about stays --bar-1; everything else drops to --bar-3.

## Dials
- `glasswork/rail`: a left rail cols 1-3 on bare canvas with the deck title in serif 56px stacked, a tracked-caps tagline, and 3-5 icon + label rows; the dashboard sits in one large frosted frame cols 4-12. For cover and summary slides.
- `glasswork/solid`: blur off, --card-solid with the same shadow; use for print and any renderer without backdrop-filter. Required for PDF export if blur rasterises badly.
- `glasswork/dense`: 3x3 tile grid, KPI value 32px, card padding 14px, for surveillance packs.

## Never
- Dark backgrounds, neon or saturated gradients, glass on glass (a card inside a card with blur).
- Status colour on anything that is not a status or a signed delta.
- RAG dots without the rule that sets them in a footnote.
- Decorative icons where a number belongs; emoji.
- Sans-serif headings or thin serif weights; titles in all caps.
- A KPI without a period and comparison, or a dashboard slide without an as-of stamp.
- Invented figures in sample tiles: samples are labelled as samples and use a fictional borrower.
