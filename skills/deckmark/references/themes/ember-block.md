---
name: Ember Block
slug: ember-block
field: asset-mgmt
format: slides-16x9
paper: light 1.00 0
display: sans Archivo
accent: warm 35
density: medium
keywords: investor day, asset manager, earnings, kpi, big numbers, black and white, orange accent, platform, flows, aum, capital markets day, strategy targets
inspired_by: global asset manager investor day and earnings supplement decks (black and white with one hot brand colour)
pictured: investor day deck
---
# Ember Block

Black, white and one hot orange. Heavy grotesk claims, giant KPI numerals set on black blocks, solid
orange bars with the value on top and nothing else. It reads like a confident public company telling
the market where it is going. It is never pastel, never a consulting grid of bullets, never photos
inside content pages, and never a chart in more than one colour family.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --black:#000000;          /* footer band, KPI blocks, section covers */
  --ink:#000000;            /* titles and body */
  --muted:#5A5A5A;          /* captions, axis labels */
  --rule:#000000;           /* chart baselines, thin dividers */
  --accent:#FF4713;         /* the one brand colour: bars, KPI tick, highlight */
  --accent-text:#D03A0E;    /* --accent darkened for text on white (4.9:1) */
  --accent-2:#FFCE00;       /* secondary: KPI tile left bar, second callout */
  --tint-1:#FFB194;         /* accent tint for second-rank bars */
  --tint-2:#FFDAD0;         /* table/label backgrounds */
  --tint-3:#FFF5CC;         /* yellow tint backgrounds */
  --font-display:"Archivo",Arial,sans-serif;          /* real: proprietary geometric grotesk, Extrabold */
  --font-body:"Archivo",Arial,sans-serif;             /* real: same family, Book */
  --font-label:"Archivo Narrow",Arial Narrow,sans-serif; /* real: condensed light */
  --radius:0px;
  --panel-radius:48px;      /* section cover panels only */
  --rule-w:1px;
  --m-x:48px;
  --m-top:48px;
  --footer-h:24px;
  /* engine map: theme colours onto the names base.css reads */
  --ink-2:#000000;
  --paper-2:var(--black);
  --series-1:var(--tint-1); --series-2:var(--accent); --series-3:var(--accent-2); --series-4:var(--tint-2);
  --hl:var(--accent);
  --hl-text:var(--accent-text);
  --divider-bg:var(--black);
  --pos:#000000; --neg:#000000;
  --fs-title:36px; --fs-kpi:52px; --fs-cover:60px; --fs-body:16px;
  --weight-title:700;
  --gutter:24px;
  --m-bottom:0px;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.slide-head { margin-bottom: 22px; }
.action-title { letter-spacing: -0.01em; line-height: 1.08; }
.cover-title { letter-spacing: -0.015em; }
.slide.cover > div:first-child { background: var(--paper); color: var(--black); padding: 44px 56px 48px 64px; border-top-right-radius: var(--panel-radius); max-width: 900px; position: relative; }
.slide.cover .cover-kicker { color: var(--accent-text); }
.slide.cover .cover-sub { opacity: 1; }
.cover-rule { position: absolute; left: 32px; top: 44px; bottom: 48px; width: 6px; height: auto; margin: 0; }
.slide-body { padding-bottom: 18px; }
.kpi-strip { border-top: 0; gap: 10px; }
.kpi { background: var(--black); padding: 18px 20px 16px; border-left: 6px solid var(--accent-2); }
.kpi + .kpi { border-left: 6px solid var(--accent-2); margin-left: 0; padding-left: 20px; }
.kpi-value, .kpi-label { color: var(--paper); }
.kpi.hl .kpi-value { color: var(--accent); }
.kpi .delta, .kpi .delta.up, .kpi .delta.down { color: var(--accent-2); }
.summary-rows { border-top-color: var(--black); }
.summary-rows .row h4 { font-family: var(--font-display); font-size: 19px; }
.takeaway { background: var(--black); color: var(--paper); padding: 28px; }
.takeaway h3 { color: var(--accent-2); }
.takeaway ul { font-size: 17px; }
.takeaway li::marker { color: var(--accent); }
.takeaway .so-what { background: var(--accent-text); color: var(--paper); font-size: 15px; }
.callout { background: var(--tint-3); color: var(--black); border-left: 6px solid var(--accent); font-size: 17px; }
table.data { border-collapse: separate; border-spacing: 0 4px; font-size: 14px; }
table.data thead th { border-bottom: 2px solid var(--black); }
table.data tbody td { background: var(--tint-2); border-bottom: 0; padding: 8px 12px; color: var(--black); }
table.data tbody td:first-child { background: var(--accent-text); color: var(--paper); font-weight: 700; }
table.data tr.hl td { background: var(--tint-1); }
table.data tr.hl td:first-child { background: var(--black); }
table.data tr.total td { background: var(--black); color: var(--paper); border-top: 0; }
table.data td.neg { color: var(--black); }
.slide-foot { background: var(--black); color: var(--paper); margin: 0 calc(var(--m-x) * -1); padding: 7px var(--m-x); }
.slide-foot .source, .slide-foot .footnote, .slide-foot .confid, .slide-foot .pageno { color: var(--paper); }
.slide.cover .cover-meta { padding-bottom: 8px; }
/* end furniture */
```

## Type
- Action title: Archivo 800, 37px / 1.1, ink, one line, a claim in sentence case ("Durable performance is foundational to our platform").
- Column heads: Archivo 800, 18 to 20px.
- Body: Archivo 400, 17px / 1.35.
- Hero KPI: Archivo 800, 104px, white on --black, a 40x6px --accent tick above it; caption Archivo 700 26px white beneath, max 4 lines.
- KPI tile number: Archivo 800 37px white; caption 14px.
- Chart labels and notes: Archivo Narrow 300, 13px; value labels Archivo 700 15px above bars.
- End notes slide: 10px, still not below 9px.

## Slide furniture
- Footer: full-width --black band 24px tall at the bottom, house wordmark (fictional) white 13px at x=48, page number white 10px right.
- Title top left at (48,48). No tracker, no rule.
- Notes line just above the footer band, 9.5px muted: "Note: For footnoted information, refer to slide N." Footnotes are collected on end-notes slides at the end of each section.
- Performance pages add "Past performance is not indicative of future results." beside the note.
- Section cover: --black field, a white panel with --panel-radius on one corner holding the event name in 3 stacked lines with a 4px --accent vertical bar at left; presenter name bold and title regular top right, white; section title Archivo 800 64px white.
- Confidentiality not used (public deck); dial `private` adds it.

## Exhibits
- Columns: solid --accent, no gridlines, no value axis unless the dial `axis` is on; bold value above each bar; 1px black baseline; category labels under the baseline.
- Bridge or growth arrows: a single --accent arrow with "+$3T" style label, never a waterfall rainbow.
- KPI strip: three --black tiles across the bottom, each with a 6px --accent-2 left bar, big number + 2-line caption.
- Highlight table: label cells in --accent with white bold text, value cells in --tint-2, description cells in --tint-3; rows separated by 6px white gaps.
- Timeline: thin black vertical line with year ticks, value boxes in --accent / --tint-1 / --accent-2.
- Process: numbered circles in --accent-2 with black numerals joined by black chevrons.

## Dials
- `ember-block/dark`: content slides on --black with white text for a section.
- `ember-block/axis`: adds a left value axis in Narrow 12px for charts that need scale.
- `ember-block/accent-swap`: replace --accent with a client brand colour; keep black and white.

## Never
- More than one colour family in a chart (accent and its tints only).
- Gridlines, legends in boxes, 3D, gradients, drop shadows.
- Photography on content slides; only the cover may carry one image.
- Footnote text on the content slide beyond one note line.
- Thin or light display weights for titles.
