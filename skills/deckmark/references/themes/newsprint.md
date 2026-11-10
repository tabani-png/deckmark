---
name: Newsprint
slug: newsprint
field: editorial
format: report-a4
paper: light 0.94 92
display: slab serif Zilla Slab
accent: warm 32
density: dense
keywords: equity research, research note, sector note, initiation, earnings preview, market outlook, broker research, estimates, price target, newsprint, broadsheet, slab serif, double rule, a4
inspired_by: sell-side equity research note and weekly market outlook printed like a broadsheet page
pictured: equity research note
adapted_from: hallmark/newsprint (MIT)
---
# Newsprint

A research note set like the business pages of a broadsheet: pale newsprint stock, warm black ink, a blunt
Zilla Slab headline over a calm Spectral book serif, hairlines for ordinary breaks and a double rule for the
major ones, and one dried brick that marks the house view and never fills a panel. It reads reported and
edited: dateline, the call, the numbers, the risks. It is never a magazine of rounded cards, never a
sans-serif blog, and never a slide deck printed portrait.

## Tokens
```css
:root{
  --paper:#EEEBE3;          /* newsprint stock */
  --paper-2:#E4DFD5;        /* wells: takeaway, highlighted rows */
  --ink:#130E0A;            /* warm black: heads, the highlighted bar */
  --ink-2:#2B2521;          /* running text */
  --muted:#5E5650;          /* datelines, captions, source (6.0:1 on paper) */
  --rule:#9E978E;           /* hairlines and column rules */
  --rule-2:#3D3732;         /* the double rule */
  --accent:#8C2F1F;         /* dried brick: the house view, the highlighted figure, exhibit numbers */
  --accent-text:#8C2F1F;    /* 6.9:1 on paper, safe as text */
  --accent-2:#3D3732;
  --accent-ink:#EEEBE3;
  --series-1:#A39C92;       /* ordinary bars: newsprint grey */
  --series-2:#6F675F;
  --series-3:#C9C3B8;
  --series-4:#D9D4C8;
  --pos:#130E0A; --neg:#130E0A; --watch:#8C2F1F;   /* no green, no red: a paper prints in black */
  --font-display:"Zilla Slab",Rockwell,Georgia,serif;          /* 700 only */
  --font-body:"Spectral",Georgia,"Times New Roman",serif;      /* running text, tables, figures */
  --font-figures:"Spectral",Georgia,serif;
  --radius:0px;
  --rule-w:1px;
  --m-x:20mm; --m-top:16mm; --gutter:6mm;
  /* engine map: theme colours onto the names base.css reads */
  --hl:var(--ink);          /* the subject bar prints solid black; brick goes on its label */
  --hl-text:var(--accent-text);
  --divider-bg:var(--ink); --divider-ink:var(--paper);
  --weight-title:700;
  /* end engine map */
}
/* furniture: the house's own page furniture, on base.css class names */
body[data-format="report-a4"] {
  --m-x: 20mm; --m-top: 15mm; --m-bottom: 12mm;
  --fs-title: 21pt; --fs-body: 9.5pt; --fs-small: 9pt; --fs-sub: 11pt; --fs-label: 8pt; --fs-furniture: 7pt;
  --fs-kpi: 25pt; --fs-cover: 40pt; --gutter: 5.5mm; }
.num, .fig, table.data, svg.dm-chart text, .kpi-value, .pageno { font-variant-numeric: lining-nums tabular-nums; }
.tracker { justify-content: space-between; text-transform: none; letter-spacing: 0; font-size: 7.5pt; border-bottom: 3px double var(--rule-2); padding-bottom: 1.6mm; margin-bottom: 7mm; }
.tracker > span { border: 0; padding: 0; }
.tracker > .on { color: var(--ink); font-weight: 700; border: 0; }
.slide-head { padding-right: 0; }
.kicker { text-transform: none; letter-spacing: 0; font-style: italic; font-weight: 400; }
.action-title { letter-spacing: -0.02em; line-height: 1.06; max-width: none; }
.lead { font-size: var(--fs-sub); line-height: 1.42; color: var(--ink); max-width: none; font-weight: 500; }
.body-copy { max-width: none; text-align: justify; hyphens: auto; line-height: 1.5; }
.stamp { border: 0; border-bottom: var(--rule-w) solid var(--accent); color: var(--accent-text); top: calc(var(--m-top) + 9mm); }
.slide.cover.light { background: var(--paper); color: var(--ink); justify-content: space-between; padding: 14mm 20mm 14mm; }
.slide.cover > div:first-child { border-top: 3px double var(--rule-2); padding-top: 4mm; }
.slide.cover .cover-kicker { color: var(--ink); letter-spacing: 0.08em; font-size: 8pt; }
.slide.cover .cover-title { letter-spacing: -0.02em; line-height: 1.02; max-width: none; margin-top: 62mm; }
.slide.cover .cover-sub { font-size: 13pt; line-height: 1.45; opacity: 1; color: var(--ink-2); max-width: 30em; border-left: 2px solid var(--accent); padding-left: 4mm; }
.cover-rule { width: 100%; height: 3px; background: transparent; border-top: var(--rule-w) solid var(--rule-2); border-bottom: var(--rule-w) solid var(--rule-2); margin-top: 10mm; }
.slide.cover .cover-meta { border-top: var(--rule-w) solid var(--rule); color: var(--muted); font-size: 9pt; }
.kpi-strip { border-top: 3px double var(--rule-2); border-bottom: 3px double var(--rule-2); padding-bottom: 3mm; }
.kpi + .kpi { border-left-color: var(--rule); }
.kpi-value { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; }
.kpi.hl .kpi-value { color: var(--accent-text); }
.kpi-label { font-size: 8.5pt; }
.delta { font-family: var(--font-body); font-weight: 500; font-style: italic; }
.summary-rows { border-top: 2px solid var(--ink); flex: 0 0 auto; }
.summary-rows .row { padding: 3mm 0; max-height: none; flex: 0 0 auto; align-items: start; }
.summary-rows .row .k { text-transform: none; letter-spacing: 0; font-style: italic; font-weight: 500; font-size: 8.5pt; }
.summary-rows .row h4 { font-size: 11.5pt; font-weight: 700; }
.exhibit > figcaption { border-top: 2px solid var(--ink); border-bottom: var(--rule-w) solid var(--rule); padding-top: 1.6mm; padding-bottom: 1.6mm; margin-bottom: 3mm; }
.exhibit-no { text-transform: none; letter-spacing: 0; font-family: var(--font-display); }
.exhibit-unit { font-style: italic; }
.takeaway { background: var(--paper-2); border-top: var(--rule-w) solid var(--rule-2); border-bottom: var(--rule-w) solid var(--rule-2); padding: 4mm 5mm; gap: 2mm; }
.takeaway h3 { font-family: var(--font-display); text-transform: none; letter-spacing: 0; font-size: 10pt; color: var(--ink); }
.takeaway ul { font-size: var(--fs-body); }
.takeaway .so-what { font-weight: 500; font-style: italic; font-size: var(--fs-body); }
.callout { background: transparent; border-left: 0; border-top: var(--rule-w) solid var(--rule-2); border-bottom: var(--rule-w) solid var(--rule-2); padding: 2.5mm 0; font-style: italic; }
table.data { font-size: 8.5pt; }
table.data th, table.data td { border-bottom-color: var(--rule); padding: 1.5mm 2mm; }
table.data thead th { font-weight: 500; font-style: italic; color: var(--ink); border-bottom: var(--rule-w) solid var(--ink); white-space: normal; }
table.data tr.hl td { background: var(--paper-2); }
table.data tr.group td { font-family: var(--font-display); border-bottom-color: var(--rule); }
table.data tr.total td { border-top: 3px double var(--rule-2); border-bottom: 0; }
svg.dm-chart .ch-axis { stroke: var(--ink); }
.slide-foot { border-top: var(--rule-w) solid var(--rule); padding-top: 1.6mm; }
.confid { text-transform: none; letter-spacing: 0; font-style: italic; }
/* end furniture */
```

## Type (sizes in pt on A4)
- Headline (action title): Zilla Slab 700, 21pt / 1.06, tracking -0.02em, ink, sentence case, two lines max. One weight only.
- Standfirst (`.lead`): Spectral 500, 11pt / 1.42, ink, the call in one or two sentences.
- Body: Spectral 400, 9.5pt / 1.5, justified with hyphenation, ink-2. Spectral italic is emphasis only.
- Box score (KPI strip): Zilla Slab 700 at 25pt between two double rules; labels Spectral 8.5pt.
- Tables and chart labels: Spectral with lining tabular figures, 8.5pt; heads Spectral 500 italic.
- Datelines, captions, source, folio: Spectral 7 to 7.5pt, sentence case, untracked, muted.
- Cover: Zilla Slab 700 at 40pt under a masthead line and a double rule.

## Slide furniture
- Masthead line on every page (`.tracker`): desk name left ("Equity research"), date or sector right, a double rule under it.
- Headline, then the standfirst; no rule under the headline, whitespace and the standfirst separate.
- Exhibits open on a 2pt ink rule with "Figure 2" in Zilla Slab, title, unit in italic; a hairline under the caption.
- "Preliminary" or "Estimates" stamp in brick with a brick underline, top right under the masthead.
- Footer: hairline, then "Source:" line left, the disclosure line in italic ("For professional investors only") and the folio right.
- Cover: masthead line in caps, double rule, headline, standfirst with a brick left rule, date and analyst desk at the foot.

## Exhibits
- Bars in newsprint grey (`--series-1`); the subject company in solid ink with its value label in brick. Negatives drop below a black axis and print in brackets.
- No gridlines on labelled bars; lines 2px in ink with names at the line end.
- Estimates tables: years across with A and E markers, the house column tinted `--paper-2`, a double rule above the total or the valuation line.
- Takeaway well: `--paper-2` field ruled top and bottom, Zilla Slab head, so-what line on an ink band.
- Peer tables ruled in hairlines, no verticals, no zebra.

## Dials
- `newsprint/agate`: figures in a third face (a Franklin-style grotesque, as the Hallmark original sets listings). Off by default because the Floor allows two families; turn on only when the reader expects a sans for tables.
- `newsprint/two-col`: body copy in two justified columns with a hairline column rule for long notes (needs a column wrapper the engine does not ship yet).
- `newsprint/brick-bar`: the highlighted bar in brick instead of ink. Toned down from Hallmark, where brick never fills: for a finance reader one coloured bar is clearer than a black one on long peer charts.

## Never
- A sans-serif body or sans labels; Spectral does all the small work.
- Brick as a fill for panels, bands or more than one bar; brick is a signal under 5% of the page.
- Boxed cards, shadows or rounded corners; rules carry the structure.
- Zilla Slab under 700 or in italic.
- Green for up and red for down; a newspaper prints arrows and brackets in black.
- Photographs, tinted or not; images are out of scope.
