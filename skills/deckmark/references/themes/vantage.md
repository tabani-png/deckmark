---
name: Vantage
slug: vantage
field: pe
format: slides-16x9
paper: dark 0.135 235
display: grotesk-sans Geologica
accent: cool 126
density: medium
keywords: pe fund pitch, fundraise, buyout, mid-market, investor day, lp update, track record, value creation, portfolio review, dark, blue-black, steel, lime signal, measured, precise, corner ticks, fund deck
inspired_by: private equity fund-raising deck in a dark, instrument-quiet house style (blue-black ground, steel ink, one lime signal for the result)
pictured: pe fund pitch
adapted_from: hallmark/vantage (MIT)
---
# Vantage

A private equity fund deck that reads like a measurement: a blue-black ground, pale steel ink, Geologica with its corners sharpened at a light weight, figures always with their units, and hairline frames that only mark their corners. Every exhibit is steel greys stepped in lightness, and one lime signal marks what was found: the deal, the step or the figure the slide is about. It is never a neon cyber page, never a dashboard of glowing tiles, never a particle network, and never a deck where lime is decoration.

## Tokens
```css
:root{
  --paper: oklch(13.5% 0.012 235);      /* blue-black ground */
  --paper-2: oklch(17% 0.014 235);      /* the one quiet band: panels, row highlight */
  --paper-3: oklch(21% 0.016 235);      /* so-what bar, dark callout */
  --ink: oklch(95% 0.006 230);          /* pale steel: titles, figures */
  --ink-2: oklch(82% 0.012 230);        /* body text */
  --muted: oklch(66% 0.016 230);        /* labels, units, axis, source (5.9:1 on paper) */
  --rule: oklch(27% 0.014 235);         /* hairlines, gridlines */
  --rule-2: oklch(34% 0.016 235);       /* corner ticks, table head, axis */
  --accent: oklch(89% 0.19 126);        /* lime: found, measured, the subject */
  --accent-hi: oklch(93% 0.17 126);
  --accent-ink: oklch(19% 0.04 126);    /* text on a lime fill */
  --accent-text: var(--accent);         /* lime reads on the ground (14:1) */
  --point-lo: oklch(42% 0.04 245);
  --point-mid: oklch(70% 0.04 232);
  --point-hi: oklch(96% 0.02 215);
  --font-display: "Geologica", ui-sans-serif, system-ui, sans-serif;  /* 300, SHRP 100 */
  --font-body: "Geologica", ui-sans-serif, system-ui, sans-serif;     /* 350, SHRP 0 */
  --font-figures: "Geologica", ui-sans-serif, system-ui, sans-serif;  /* 400 tabular */
  --gf-load: "Geologica:wght,CRSV,SHRP@200..700,0,0..100";
  --radius: 4px;
  --rule-w: 1px;
  --tick: 10px;
  --m-x: 58px;
  --m-top: 38px;
  --gutter: 30px;
  /* engine map: theme colours onto the names base.css reads */
  --hl: var(--accent);
  --hl-text: var(--accent);
  --series-1: var(--point-mid);          /* steel: every bar that is not the subject */
  --series-2: oklch(55% 0.035 240);
  --series-3: var(--point-lo);
  --series-4: var(--rule-2);
  --accent-2: var(--point-mid);
  --pos: var(--accent);                  /* favourable delta and a passing status: found */
  --neg: var(--ink-2);                   /* adverse stays steel, never red */
  --watch: oklch(80% 0.12 75);           /* amber dot for a holding on watch, status only */
  --divider-bg: var(--paper);
  --divider-ink: var(--ink);
  --cover-bg: var(--paper);
  --cover-ink: var(--ink);
  --field: var(--paper-3);
  --field-ink: var(--ink);
  --desk: oklch(9% 0.01 235);
  --fs-title: 30px;
  --fs-cover: 54px;
  --fs-kpi: 44px;
  --fs-body: 15px;
  --weight-title: 300;
  --tracking-label: 0;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.slide { font-weight: 350; font-variation-settings: "SHRP" 0; }
.action-title, .cover-title, .divider-title, .tomb-name { font-variation-settings: "SHRP" 100; letter-spacing: -0.035em; }
.action-title { line-height: 1.1; }
.cover-title { line-height: 1.02; }
.kpi-value, .cover-figure, .callout-figure { font-weight: 300; letter-spacing: -0.03em; }
.kpi-value .u, .cover-figure .u { font-weight: 400; color: var(--muted); }
.tracker, .kicker, .label, .stamp, .exhibit-no, .takeaway h3, .summary-rows .row .k, .cover-kicker, .confid, .tl-date, .sources-uses h4, .section-band { text-transform: none; letter-spacing: 0; font-weight: 400; }
.tracker > .on { font-weight: 500; }
.stamp { border-bottom: 0; }
.stamp::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 7px; vertical-align: 1px; }
.kicker, .summary-rows .row .k, .exhibit-no { color: var(--muted); }
.exhibit > figcaption { border-bottom-color: var(--rule); }
.exhibit-title { font-weight: 400; color: var(--ink); }
.kpi-strip, .summary-rows { border-top: var(--rule-w) solid var(--rule-2); }
.kpi-label { color: var(--muted); }
.summary-rows .row h4 { font-family: var(--font-display); font-weight: 400; font-size: 19px; font-variation-settings: "SHRP" 100; letter-spacing: -0.02em; }
.summary-rows .row p { font-size: 15px; }
.slide strong, .slide b { font-weight: 500; }
/* corner-tick frame: hairlines drawn only at the corners */
.takeaway { background: transparent; position: relative; }
.takeaway::before { content: ""; position: absolute; inset: 0; pointer-events: none; border: var(--rule-w) solid var(--rule-2);
  -webkit-mask: conic-gradient(at var(--tick) var(--tick), transparent 75%, var(--ink) 0) 0 0 / calc(100% - var(--tick)) calc(100% - var(--tick));
  mask: conic-gradient(at var(--tick) var(--tick), transparent 75%, var(--ink) 0) 0 0 / calc(100% - var(--tick)) calc(100% - var(--tick)); }
.takeaway h3 { color: var(--muted); font-size: 12px; }
.takeaway .so-what { font-weight: 400; border-radius: var(--radius); border-left: 2px solid var(--accent); }
.callout { border-left-width: 2px; border-radius: 0 var(--radius) var(--radius) 0; }
table.data thead th, table.harvey thead th { color: var(--muted); font-weight: 400; border-bottom: var(--rule-w) solid var(--rule-2); }
table.data td { font-weight: 350; }
table.data .num { font-weight: 400; }
table.data tr.total td, table.data tr.group td { font-weight: 500; border-top: var(--rule-w) solid var(--rule-2); border-bottom-color: var(--rule-2); }
table.data tr.hl td { background: var(--paper-2); }
.status { font-weight: 400; color: var(--ink-2); }
.status::before { width: 7px; height: 7px; }
.tomb { border-top: var(--rule-w) solid var(--rule-2); border-radius: var(--radius); }
.cover-rule { width: 48px; height: 2px; }
.cover-meta { border-top-color: var(--rule-2); color: var(--muted); }
.divider-no { color: var(--accent); font-weight: 300; }
svg.dm-chart .ch-axis { stroke: var(--rule-2); }
svg.dm-chart .ch-conn { stroke: var(--rule-2); }
svg.dm-chart .ch-value { font-weight: 400; }
svg.dm-chart .ch-cat, svg.dm-chart .ch-muted { fill: var(--muted); }
svg.dm-chart .ch-bar, svg.dm-chart .ch-hl, svg.dm-chart .ch-pos, svg.dm-chart .ch-total, svg.dm-chart .ch-s1, svg.dm-chart .ch-s2, svg.dm-chart .ch-s3 { rx: 2px; }
/* end furniture */
```

## Type
- Action title: Geologica 300 with "SHRP" 100 (sharpened corners), 30px / 1.1, tracking -0.035em, --ink, sentence case, one line preferred and two at most.
- Cover title: the same cut at 54px / 1.02. Divider titles the same at 44px with the section number in lime 300.
- Headline figures: Geologica 300 tabular at 44px; the unit a step smaller in --muted 400 after the figure. Every figure carries its unit.
- Body: Geologica 350 with "SHRP" 0, 15px / 1.4, --ink-2; emphasis at 500, never 700.
- Item heads: Geologica 400 sharpened, 19px, --ink.
- Labels, tracker, table heads, exhibit numbers: Geologica 400, 11 to 12px, sentence case, --muted. Never tracked capitals, never mono.
- Source and footnotes 10px --muted; minimum anywhere 9px.

## Slide furniture
- Tracker over the title in sentence case, the current section in --ink 500 with a 1px lime underline.
- Stamp top right as a status: a 6px lime dot then the word ("Preliminary", "As of Q3"), no underline.
- Title block top left; no rule under it. Strip tops and table heads take one 1px --rule-2 hairline.
- Source bottom left, confidentiality and page number bottom right, 10px.
- Cover: the ground to every edge, kicker in lime, title in the light sharpened cut, a 48px lime rule, meta line over a --rule-2 hairline.
- Divider: the ground, the section number in lime 300 above the title; no band, no fill.

## Exhibits
- Bars: steel --series-1 fills with a 2px corner, the subject bar in lime; value labels in 400, the subject value in lime. No gridlines when bars are labelled; a --rule-2 hairline base.
- Waterfall / value bridge: totals in steel, positive steps in --series-2, negative steps in --series-3, the step the title is about in lime; dotted --rule-2 connectors.
- Lines: steel 2.25px, the subject line in lime with ground-filled markers; names at the line end.
- Tables: 400 muted head over a --rule-2 hairline, 1px --rule between rows, figures tabular 400 with units in the column head; the subject row on --paper-2. Status dots 7px: lime on plan, amber watch; the words stay steel.
- Takeaway panel: no fill, a corner-tick frame (10px ticks in --rule-2); the so-what bar on --paper-3 with a 2px lime edge.
- Highlight rule: lime marks one thing per exhibit, what was found. Never a heading, never a band, never two subjects.

## Dials
- `vantage/steel` (default): the tokens above.
- `vantage/sodium`: ground oklch(13% 0.012 55), steel replaced by warm greys from oklch(40% 0.05 50) to oklch(95% 0.03 80), lime kept as the signal.
- `vantage/ticks`: every exhibit, not only the takeaway, sits inside a corner-tick frame; for a sparse investor-day cut.

## Never
- Lime on a heading, a band, a background or more than one subject per exhibit.
- Glow, bloom, a grid floor, lines joining points or any sci-fi render.
- A second chromatic hue in charts besides lime; series are steel steps only.
- Red for "bad"; adverse figures stay steel.
- Monospace labels, tracked capitals, bold 700 titles.
- A figure without its unit, or a drop shadow anywhere.
