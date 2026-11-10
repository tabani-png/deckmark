---
name: Harbourlight
slug: harbourlight
field: public-sector
format: slides-16x9
paper: light 1.00 0
display: sans Arial (regular weight)
accent: cool 230
density: medium
keywords: city, municipal, council report, recovery, economic development, scenarios, opportunities, airy, light blue, co-branded
inspired_by: consultancy council report for a city and its economic development agency
pictured: public-sector report
---
# Harbourlight

Calm and open. Titles in a regular-weight blue sans with a thin rule beneath, generous white, line charts
with series named at the end, small client co-brand marks top right. It addresses elected officials and
senior staff: plain, readable, measured. It is never dense like a working deck, never dark, never bold-heavy.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --ink:#1B1B1B;            /* body */
  --title:#0B5394;          /* regular-weight blue title */
  --title-strong:#0C4884;   /* bold variant for the occasional emphasised word */
  --accent:#0078C0;         /* sub-headings, row labels, links */
  --series-1:#1F4E8C;       /* navy line */
  --series-2:#0099D8;       /* mid blue line */
  --series-3:#6AAF3D;       /* client co-brand green, one series max */
  --series-4:#E3B341;       /* fourth line only */
  --tint:#D6E6F2;           /* framework boxes, mini-chart panels */
  --muted:#6D6D6D;
  --rule:#1B1B1B;           /* thin rule under the title */
  --hair:#C8C8C8;
  --font-display: Arial, "Arimo", Helvetica, sans-serif;  /* real: Arial regular */
  --font-body: Arial, "Arimo", Helvetica, sans-serif;
  --font-serif-label: Georgia, "Source Serif 4", serif;   /* real: Georgia Bold, scenario ids only */
  --radius:0px;
  --rule-w:0.75px;
  --m-x:56px;               /* 4.4% of width */
  --m-top:34px;
  --gutter:28px;
  /* engine map: theme colours onto the names base.css reads */
  --paper-2:var(--tint);
  --ink-2:var(--ink);
  --hl:var(--series-2);
  --hl-text:var(--title);
  --divider-bg:var(--paper); --divider-ink:var(--title);
  --fs-title:27px; --fs-body:15px;
  --weight-title:400;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.action-title { color: var(--title); letter-spacing: 0.005em; max-width: 34em; }
.slide-head { border-bottom: var(--rule-w) solid var(--rule); padding-bottom: 12px; margin-bottom: 26px; }
.tracker { display: none; }
.stamp { border-bottom: 0; color: var(--accent); }
.exhibit > figcaption { border-bottom: 0; }
.exhibit-no { color: var(--accent); font-weight: 400; }
.summary-rows { border-top: 0; }
.summary-rows .row { border-bottom: var(--rule-w) solid var(--hair); }
.summary-rows .row .k { color: var(--accent); font-weight: 400; }
.summary-rows .row h4 { font-family: var(--font-display); font-weight: 400; font-size: 21px; color: var(--title); }
.summary-rows .row p { font-size: 17px; }
.takeaway { background: transparent; border-left: 3px solid var(--accent); padding: 4px 0 4px 20px; }
.takeaway h3 { color: var(--accent); font-weight: 400; }
svg.dm-chart .ch-line.s3 { stroke: var(--muted); stroke-dasharray: 5 4; stroke-width: 1.75; }
svg.dm-chart .ch-line { stroke-width: 2; }
svg.dm-chart .ch-dot.hl { stroke: var(--series-2); }
.slide.cover.light .cover-title { color: var(--title); font-weight: 400; }
.slide.cover.light .cover-kicker { color: var(--accent); font-weight: 400; }
.slide.cover.light .cover-rule { height: 1px; width: 100%; background: var(--rule); }
table.data { font-size: 14px; }
table.data td:first-child { color: var(--accent); }
table.data thead th { font-weight: 400; color: var(--muted); border-bottom: var(--rule-w) solid var(--rule); }
table.data td { border-bottom-color: var(--hair); }
table.data tr.total td { border-top: var(--rule-w) solid var(--rule); border-bottom-color: var(--rule); }
table.data tr.total td:first-child { color: var(--ink); }
/* end furniture */
```

## Type
- Display: Arial regular 27px / 1.2, --title, 1 to 2 lines, letter-spacing 0.005em.
- Under-title rule: 0.75px --rule across the content width, 10px below the title.
- Subtitle (chart frame): Arial 17px --ink.
- Section sub-heads in body: Arial 17px --accent regular.
- Body: Arial 15px / 1.35.
- Stamps: Arial 10px caps muted ("PRELIMINARY", "NON-EXHAUSTIVE", "AS OF <DATE>") in --accent or muted, unboxed.
- Footnotes/source: Arial 9.5px; full URLs allowed, underlined.

## Slide furniture
- Title top left, thin rule below, client co-brand marks (max 2, small, stacked) top right.
- Optional circled letter tracker (B) in --accent before the title.
- "As of" date stamp under the title in --accent small caps for time-sensitive pages.
- Footer: source bottom left, page number bottom right, nothing else.
- Opener page: two large statements in --accent 30px, each followed by one 18px paragraph.
- Agenda: numbered list mid-page, no highlight; dividers are optional.

## Exhibits
- Line charts: 2px lines, series names at the right end with the last value, light y-axis, no grid.
- Scenario parameter boxes to the right of a line chart: --accent left border, small text.
- Scenario grid: 3x3 small panels on --tint with a sparkline each and a serif id (A1, B2) top left.
- Opportunity tables: icon-free; blue row labels, black description, hairlines between rows.
- Framework diagram: a 3-part ring or triangle in --series-1 / --series-2 / --series-3, labels outside in --accent.
- Bars: --series-1 with one --series-2 highlight, labels on bars.

## Dials
- `harbourlight/cobrand`: client marks top right on or off.
- `harbourlight/opener`: two-statement opener page vs standard exec summary.
- `harbourlight/serif-ids`: Georgia scenario ids on or off.

## Never
- Bold titles; full-bleed dark panels on content pages.
- Dense working-deck tables with more than 8 rows per page.
- More than 4 line series; legends in boxes.
- Photos inside content pages (cover only).
