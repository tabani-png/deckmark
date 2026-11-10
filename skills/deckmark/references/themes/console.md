---
name: Console
slug: console
field: dashboard
format: slides-16x9
paper: dark 0.17 250
display: grotesk-sans Host Grotesk
accent: warm 80
density: dense
keywords: dashboard, board kpi pack, board pack, monthly management pack, operating review, scorecard, kpi tiles, variance, budget vs actual, monitoring, portfolio monitoring, cfo pack, dark, graphite, amber, mono figures, instrument, audit trail
inspired_by: operating dashboard for a CFO board pack set on a graphite instrument panel (hairline panels, mono figures, amber for what a person owns)
pictured: board-pack
adapted_from: hallmark/console (MIT)
---
# Console

A board KPI pack kept like an instrument log by careful people: a graphite ground stepped in three lightnesses, hairline panels cut from one surface, Host Grotesk for what a person reads and Atkinson Hyperlegible Mono for every figure a system measured. Two meanings and only two: cool blue is what the instruments measured, amber is what a person owns, the deviation or the decision. Status takes green and amber dots only where a rule sets them. Nothing glows. It is never a neon terminal, never a glass dashboard, never a science-fiction control room, and never a page of small tiles with no answer on it.

## Tokens
```css
:root{
  --paper: oklch(17% 0.008 250);        /* graphite ground */
  --paper-2: oklch(21% 0.009 250);      /* panel one step up */
  --paper-3: oklch(13.5% 0.007 250);    /* deepest step: so-what bar, logs, changed rows */
  --ink: oklch(95% 0.005 250);          /* titles, figures */
  --ink-2: oklch(83% 0.008 250);        /* body text */
  --muted: oklch(71% 0.01 250);         /* labels, axis, source (6.6:1 on paper) */
  --rule: oklch(31% 0.01 250);          /* panel seams, row rules, gridlines */
  --rule-2: oklch(42% 0.012 250);       /* selected row, head rule, axis */
  --accent: oklch(82% 0.15 80);         /* amber: a person, a deviation, the decision */
  --accent-ink: oklch(18% 0.04 75);     /* text on an amber fill */
  --accent-soft: oklch(29% 0.05 80);    /* amber tint for a flagged row */
  --accent-text: var(--accent);         /* amber reads on graphite (9.6:1) */
  --cool: oklch(77% 0.12 245);          /* instrument blue: measured series */
  --cool-soft: oklch(29% 0.05 245);
  --ok: oklch(76% 0.15 150);
  --ok-soft: oklch(24.5% 0.03 150);
  --bad: oklch(70% 0.17 25);
  --bad-soft: oklch(24.5% 0.035 25);
  --font-display: "Host Grotesk", ui-sans-serif, system-ui, sans-serif;   /* 500, never 700 */
  --font-body: "Host Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-figures: "Atkinson Hyperlegible Mono", ui-monospace, Menlo, monospace;   /* what was measured */
  --gf-load: "Host Grotesk:wght@400;500;700|Atkinson Hyperlegible Mono:wght@400;500;700";
  --radius: 10px;
  --radius-chip: 6px;
  --rule-w: 1px;
  --m-x: 48px;
  --m-top: 34px;
  --gutter: 20px;
  /* engine map: theme colours onto the names base.css reads */
  --hl: var(--accent);
  --hl-text: var(--accent);
  --accent-2: var(--cool);
  --series-1: var(--cool);               /* measured series */
  --series-2: oklch(60% 0.09 245);
  --series-3: oklch(46% 0.06 245);
  --series-4: oklch(35% 0.03 245);
  --pos: var(--ok);
  --neg: var(--bad);
  --watch: var(--accent);
  --divider-bg: var(--paper-3);
  --divider-ink: var(--ink);
  --cover-bg: var(--paper);
  --cover-ink: var(--ink);
  --field: var(--paper-3);
  --field-ink: var(--ink);
  --desk: oklch(11% 0.006 250);
  --fs-title: 28px;
  --fs-cover: 48px;
  --fs-kpi: 38px;
  --fs-body: 14px;
  --fs-small: 14px;
  --weight-title: 500;
  --tracking-label: 0;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.action-title, .cover-title, .divider-title { letter-spacing: -0.03em; line-height: 1.08; }
.tracker, .kicker, .label, .stamp, .exhibit-no, .takeaway h3, .summary-rows .row .k, .cover-kicker, .confid, .tl-date, .sources-uses h4, .section-band { text-transform: none; letter-spacing: 0; font-weight: 500; }
.tracker { gap: 6px; }
.tracker > span { padding: 2px 8px; border: var(--rule-w) solid var(--rule); border-radius: 4px; }
.tracker > .on { color: var(--ink); background: var(--paper-2); border-color: var(--rule-2); font-weight: 500; }
.stamp { border-bottom: 0; font-family: var(--font-figures); color: var(--muted); }
.kicker, .summary-rows .row .k { color: var(--muted); }
.exhibit-no { color: var(--muted); }
.exhibit-title { font-weight: 500; }
/* hairline panels: one surface divided by 1px seams */
.exhibit, .takeaway { background: var(--paper-2); border: var(--rule-w) solid var(--rule); border-radius: var(--radius); padding: 14px 18px 12px; }
.exhibit > figcaption { border-bottom-color: var(--rule); }
.kpi-strip { border-top: 0; gap: var(--rule-w); background: var(--rule); border: var(--rule-w) solid var(--rule); border-radius: var(--radius); overflow: hidden; }
.kpi { background: var(--paper-2); padding: 14px 18px 14px; gap: 4px; }
.kpi + .kpi { border-left: 0; margin-left: 0; padding-left: 18px; }
.kpi-label { order: -1; color: var(--muted); font-weight: 500; font-size: 14px; }
.kpi-value { font-weight: 400; letter-spacing: -0.04em; }
.kpi-value .u { font-weight: 400; }
.kpi .delta { font-size: 12px; font-weight: 500; }
.summary-rows { border-top: 0; gap: var(--rule-w); background: var(--rule); border: var(--rule-w) solid var(--rule); border-radius: var(--radius); overflow: hidden; }
.summary-rows .row { background: var(--paper-2); border-bottom: 0; padding: 12px 18px; grid-template-columns: 210px 1fr; }
.summary-rows .row h4 { font-family: var(--font-display); font-weight: 500; font-size: 17px; }
.takeaway h3 { color: var(--muted); font-size: 12px; }
.takeaway .so-what { font-weight: 500; border-radius: var(--radius-chip); border: var(--rule-w) solid var(--rule-2); }
.callout { border-left: 0; border: var(--rule-w) solid var(--rule); border-radius: var(--radius); background: var(--paper-3); }
.callout strong { color: var(--accent-text); }
table.data { font-size: 13.5px; }
table.data thead th, table.harvey thead th { color: var(--muted); font-weight: 500; border-bottom: var(--rule-w) solid var(--rule-2); }
table.data td { border-bottom-color: var(--rule); }
table.data tbody tr:last-child td { border-bottom: 0; }
table.data .num { font-size: 13px; }
table.data tr.total td, table.data tr.group td { font-weight: 500; border-top: var(--rule-w) solid var(--rule-2); }
table.data tr.hl td { background: var(--paper-3); }
table.data td.neg { color: var(--ink-2); }
table.data th.num, .cover-meta .confid { font-family: var(--font-body); }
.status { font-weight: 500; color: var(--ink-2); }
.status::before { width: 8px; height: 8px; }
.tomb { border: var(--rule-w) solid var(--rule); border-radius: var(--radius); background: var(--paper-2); }
.cover-rule { width: 40px; height: 3px; border-radius: 2px; }
.cover-meta { border-top-color: var(--rule); color: var(--muted); font-family: var(--font-figures); font-size: 14px; }
svg.dm-chart text { font-size: 12.5px; }
svg.dm-chart .ch-axis { stroke: var(--rule-2); }
svg.dm-chart .ch-grid { stroke: var(--rule); }
svg.dm-chart .ch-value { font-weight: 500; }
svg.dm-chart .ch-cat { fill: var(--ink-2); font-family: var(--font-body); }
svg.dm-chart .ch-muted { fill: var(--muted); }
svg.dm-chart .ch-bar, svg.dm-chart .ch-hl, svg.dm-chart .ch-s1, svg.dm-chart .ch-s2, svg.dm-chart .ch-s3, svg.dm-chart .ch-pos, svg.dm-chart .ch-total { rx: 2px; }
/* end furniture */
```

## Type
- Action title: Host Grotesk 500, 28px / 1.08, tracking -0.03em, --ink, sentence case; calm at size, never 700.
- Body: Host Grotesk 400, 14px / 1.4, --ink-2; emphasis at 700 in --ink, or amber when it names the owner or the decision.
- Labels, tracker chips, table heads, KPI labels: Host Grotesk 500, 11 to 13px, sentence case, --muted.
- Figures (KPI values, table numbers, chart values, as-of stamps, page numbers): Atkinson Hyperlegible Mono 400 to 500, tabular, slashed zero; KPI values 38px, table figures 13px. Mono is only for what was measured, never a label, a head or a control.
- Source and footnotes 10px --muted; minimum anywhere 9px.

## Slide furniture
- Tracker as a row of chips over the title: 1px --rule chips at 4px radius, the current section one step up on --paper-2 with a --rule-2 edge; no signal colour on navigation.
- As-of stamp top right in the mono face ("As of 30 Sep, close"); required on every data slide.
- Content sits in hairline panels (--paper-2 inside a 1px --rule at 10px radius). Panels that sit together are one surface with 1px seams: the KPI strip and the summary rows are cut that way.
- Source line bottom left, confidentiality and mono page number bottom right, 10px.
- Cover: graphite ground, kicker in amber, title in Host Grotesk 500, a 40px amber rule, meta line in the mono face.
- Divider: the deepest step, section number in mono, title 44px 500.

## Exhibits
- Bars and lines: measured series in cool blue, stepped darker for comparisons (--series-2, --series-3); the deviation or the subject in amber. Value labels in mono; category labels in Host Grotesk.
- Gridlines 1px --rule only on line and combo charts with a value axis; labelled bars carry none.
- KPI strip: 3 to 5 tiles on one seamed surface; label top, mono figure, delta in ok green or bad red by effect (costs down are green). A tile with no comparison is not allowed.
- Tables: muted 500 head over a --rule-2 hairline, 1px --rule rows, mono figures right-aligned, no verticals; negatives in parentheses in --ink-2, since colour lives in the status column; a flagged row on the deepest step. Status dots 8px: green on track, amber watch, red breach, with the rule in a footnote.
- Highlight rule: amber marks one thing per exhibit (the deviation, the owner, the decision); cool carries everything measured.

## Dials
- `console/graphite` (default): the tokens above.
- `console/amber-room`: ground oklch(15% 0.022 70) under ink oklch(95% 0.012 85), amber oklch(82% 0.15 82), cool turned to ice oklch(82% 0.08 200).
- `console/dense`: 5-tile strips, 12px table figures and 12px panel padding, for a monthly management pack.

## Never
- Swap the meanings: an amber measured series or a cool deviation is the deck lying.
- A third signal colour on a chart, or status colour on anything that is not a status or a signed delta.
- Glow, shadow under a panel, gradient on a surface, or a neon terminal look.
- Mono on a label, a heading or a title.
- A slide of small panels only: one value or one record per slide is set large.
- A KPI without its period and comparison, or a data slide without its as-of stamp.
