---
name: Editorial
slug: editorial
field: editorial
format: report-a4
paper: light 0.97 86
display: sans Bricolage Grotesque
accent: cool 152
density: medium
keywords: thought leadership, research report, outlook, white paper, house view, market outlook, insights, institute, annual outlook, long read, magazine, serif body, heavy rule, green, a4
inspired_by: asset manager or research institute annual outlook and thought-leadership report set like a contemporary magazine
pictured: research outlook report
adapted_from: hallmark/editorial (MIT)
---
# Editorial

The annual outlook a research institute or asset manager publishes for clients: warm white uncoated stock,
printed black with a faint cool tilt, a tight grotesque headline over a Source Serif standfirst and body, a
heavy ink rule that opens every page, 1px hairlines for everything else, the house numbers reversed out on an
ink band, and one printer's green that marks the house view. Argued like a long read, laid out like a
magazine. It is never a serif literary journal, never cream with terracotta, never a gallery of photographs.

## Tokens
```css
:root{
  --paper:#F7F5F0;          /* warm white uncoated */
  --paper-2:#EEEBE4;        /* the well */
  --ink:#0C0D12;            /* printed black, cool tilt: heads, ink band, ordinary series */
  --ink-2:#2A2B31;          /* reading text */
  --muted:#615D57;          /* captions, source, labels (6.0:1 on paper) */
  --rule:#D0CDC7;           /* hairlines between rows */
  --rule-2:#8F8C85;         /* hairline under a table head */
  --accent:#007439;         /* printer's green: the house view, one series, one row */
  --accent-text:#007439;    /* 5.4:1 on paper */
  --accent-light:#8FD3AC;   /* green on the ink band only (8.9:1 on ink) */
  --accent-2:#2A2B31;
  --accent-ink:#F7F5F0;
  --series-1:#2A2B31;
  --series-2:#8F8C85;
  --series-3:#BDB9B2;
  --series-4:#DEDAD3;
  --pos:#007439; --neg:#2A2B31; --watch:#8F8C85;
  --font-display:"Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;  /* heads, labels, figures */
  --font-body:"Source Serif 4",Georgia,"Times New Roman",serif;            /* standfirst and reading */
  --font-figures:"Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;
  --radius:0px;
  --rule-w:1px;
  --rule-heavy:4px;
  --m-x:20mm; --m-top:16mm; --gutter:6mm;
  /* engine map: theme colours onto the names base.css reads */
  --hl:var(--accent);
  --hl-text:var(--accent-text);
  --divider-bg:var(--ink); --divider-ink:var(--paper);
  --weight-title:700;
  --tracking-label:0;
  /* end engine map */
}
/* furniture: the house's own page furniture, on base.css class names */
body[data-format="report-a4"] {
  --m-x: 20mm; --m-top: 14mm; --m-bottom: 12mm;
  --fs-title: 22pt; --fs-body: 9.5pt; --fs-small: 9pt; --fs-sub: 12.5pt; --fs-label: 8pt; --fs-furniture: 7pt;
  --fs-kpi: 26pt; --fs-cover: 44pt; --gutter: 6mm; }
.tracker { justify-content: space-between; text-transform: none; font-family: var(--font-display); font-size: 7.5pt; margin-bottom: 4mm; }
.tracker > span { border: 0; padding: 0; }
.tracker > .on { color: var(--ink); font-weight: 700; border: 0; }
.slide-head { padding-right: 0; border-top: var(--rule-heavy) solid var(--ink); padding-top: 3mm; margin-bottom: 5mm; }
.action-title { letter-spacing: -0.015em; line-height: 1.04; max-width: none; }
.kicker { text-transform: none; font-family: var(--font-display); }
.lead { font-family: var(--font-body); font-size: var(--fs-sub); line-height: 1.32; color: var(--ink); max-width: none; }
.body-copy { max-width: none; line-height: 1.55; }
.stamp { border: var(--rule-w) solid var(--ink); padding: 0.6mm 2mm; color: var(--ink); text-transform: none; font-family: var(--font-display); top: calc(var(--m-top) - 7mm); }
.slide.cover.light { background: var(--paper); color: var(--ink); padding: 16mm 20mm 14mm; }
.slide.cover > div:first-child { border-top: var(--rule-heavy) solid var(--ink); padding-top: 4mm; }
.slide.cover .cover-kicker { font-family: var(--font-display); color: var(--ink); text-transform: none; letter-spacing: 0; font-size: 10pt; }
.slide.cover .cover-title { letter-spacing: -0.02em; line-height: 0.98; max-width: 11em; margin-top: 48mm; }
.slide.cover .cover-sub { font-family: var(--font-body); font-size: 15pt; line-height: 1.28; color: var(--ink); opacity: 1; max-width: 26em; margin-top: 8mm; }
.cover-rule { width: 18mm; height: var(--rule-heavy); background: var(--accent); margin-top: 10mm; }
.slide.cover .cover-meta { border-top: var(--rule-w) solid var(--rule-2); font-family: var(--font-display); font-size: 9pt; color: var(--muted); }
.kpi-strip { background: var(--ink); border-top: 0; padding: 5mm 6mm 6mm; gap: 6mm; }
.kpi + .kpi { border-left-color: var(--muted); }
.kpi-value { color: var(--paper); font-weight: 700; letter-spacing: -0.02em; }
.kpi.hl .kpi-value { color: var(--accent-light); }
.kpi-value .u { color: var(--paper); }
.kpi-label { color: var(--paper); font-family: var(--font-display); font-size: 8.5pt; }
.kpi .delta, .kpi .delta.up, .kpi .delta.down { color: var(--rule); font-weight: 400; }
.summary-rows { border-top: var(--rule-heavy) solid var(--ink); flex: 0 0 auto; }
.summary-rows .row { padding: 3.5mm 0; max-height: none; flex: 0 0 auto; align-items: start; grid-template-columns: 52mm 1fr; }
.summary-rows .row .k { text-transform: none; font-family: var(--font-display); font-weight: 400; color: var(--muted); font-size: 8pt; }
.summary-rows .row h4 { font-family: var(--font-display); font-size: 13pt; font-weight: 700; letter-spacing: -0.01em; }
.exhibit > figcaption { font-family: var(--font-display); border-top: var(--rule-w) solid var(--ink); border-bottom: 0; padding-top: 2mm; margin-bottom: 2mm; }
.exhibit-no { text-transform: none; color: var(--ink); }
.exhibit-title { font-weight: 700; }
.takeaway { background: var(--paper-2); border-top: var(--rule-w) solid var(--rule-2); padding: 4mm 5mm; gap: 2mm; }
.takeaway h3 { font-family: var(--font-display); text-transform: none; font-size: 10pt; color: var(--ink); }
.takeaway ul { font-size: var(--fs-body); }
.takeaway .so-what { font-family: var(--font-body); font-weight: 400; font-size: 11pt; line-height: 1.3; background: transparent; color: var(--ink); padding: 2mm 0 0; border-top: var(--rule-w) solid var(--rule-2); }
.callout { background: transparent; border-left: 0; border-top: var(--rule-heavy) solid var(--ink); padding: 3mm 0 0; font-family: var(--font-body); font-size: 12pt; line-height: 1.3; }
table.data { font-size: 8.5pt; }
table.data th, table.data td { padding: 1.6mm 2mm; border-bottom-color: var(--rule); }
table.data thead th { font-family: var(--font-display); font-weight: 400; color: var(--muted); border-bottom: var(--rule-w) solid var(--rule-2); white-space: normal; }
table.data td.num { font-family: var(--font-figures); }
table.data tr.hl td { background: var(--paper-2); }
table.data tr.hl td:first-child { border-left: 3px solid var(--accent); }
table.data tr.total td { border-top: var(--rule-heavy) solid var(--ink); }
svg.dm-chart .ch-grid { stroke: var(--rule); }
.slide-foot { border-top: var(--rule-w) solid var(--rule); padding-top: 1.6mm; font-family: var(--font-display); }
.confid { text-transform: none; }
/* end furniture */
```

## Type (sizes in pt on A4)
- Headline (action title): Bricolage Grotesque 700, 22pt / 1.04, tracking -0.015em, ink, sentence case, two lines max.
- Standfirst (`.lead`): Source Serif 4 at 12.5pt / 1.32 in ink, the argument in one breath. The serif at size is as much this house as the head.
- Body: Source Serif 4, 9.5pt / 1.55, ink-2.
- Labels, captions, table heads, tracker, footer: Bricolage Grotesque 400, 7 to 8pt, sentence case, untracked, muted.
- Figures: Bricolage Grotesque with lining tabular numerals; KPI figures 26pt reversed out of the ink band.
- Cover: Bricolage 700 at 44pt, a Source Serif standfirst at 15pt, a short green bar.

## Slide furniture
- Every page opens on a 4px ink rule with the running head (report name left, chapter right) directly under it.
- Headline, then the serif standfirst; nothing between them.
- Exhibits open on a 1px ink hairline; "Figure 3" and the title in the grotesque, unit in muted.
- Stamp: a 1px ink-outlined box, sentence case ("House view", "Illustrative"), in the top margin above the heavy rule.
- Footer: hairline, "Source:" left, report name and folio right, all in the grotesque at 7pt.
- The house numbers sit once in the document on the ink band (`.kpi-strip`), with the house-view figure in light green.

## Exhibits
- Ordinary series in ink and greys; the house view (the series, bar or row the headline names) in green.
- Lines 2px, named at the line end; light hairline gridlines allowed on line charts where the reader reads levels.
- Tables: hairline rows, head in muted grotesque, highlighted rows tinted `--paper-2` with a 3px green edge, a 4px ink rule above any total.
- Takeaway well: `--paper-2` under a hairline; the so-what is a serif sentence, not a filled bar.
- No boxes, no shadows, no rounded corners.

## Dials
- `editorial/condensed`: the Hallmark original sets heads in Bricolage at width 75 and weight 800. The engine's font link requests weights 400 and 700 only, so the default width at 700 is used; the condensed cut needs the `wdth` axis in the font link (script change, not a token).
- `editorial/no-band`: KPI figures on paper between two 4px rules instead of the ink band, for houses that print without solid fills.
- `editorial/green-off`: the house view in ink-2 at full weight and the green removed, for a sponsor brand colour to replace it.

## Never
- A serif headline; Source Serif sets standfirst, body and quotations only.
- Green as a rule, a band or running text; it marks one series, one row or one figure.
- All-caps labels or tracked small caps; sentence case throughout.
- Two ink bands on one page, or an ink band holding anything other than the house numbers.
- Photographs or decorative illustration; images are out of scope.
