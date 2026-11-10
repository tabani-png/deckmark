---
name: Specimen
slug: specimen
field: banking
format: slides-16x9
paper: light 0.965 82
display: high-contrast serif Bodoni Moda
accent: cool 262
density: medium
keywords: pitch book, board presentation, strategic alternatives, fairness, valuation, football field, precedent transactions, boutique advisory, sell-side, cim, didone, oat paper, ink blue, hairline
inspired_by: independent boutique M&A advisory board pitch book and strategic alternatives review, set like a type foundry's specimen
pictured: pitch book
adapted_from: hallmark/specimen (MIT)
---
# Specimen

A boutique adviser's board book set like a type foundry's specimen: warm oat paper, warm near-black ink,
Bodoni Moda at 400 for titles and the large figures so the hairlines thin against the stems, a plain Geist
beneath it, square 1px rules, a double rule over the table that matters, and one ink blue for the figure
the board should read first. All the contrast lives inside the letters, none in colour or depth. It is
never a fashion masthead in bold Didone, never cream luxury with terracotta, and never a bulge-bracket
template.

## Tokens
```css
:root{
  --paper:#F9F3E8;          /* oat */
  --paper-2:#F1E8DB;        /* the well */
  --ink:#130E0A;            /* warm near-black: titles, bars, the cover band */
  --ink-2:#2E2722;          /* body */
  --muted:#665F58;          /* labels, captions, source (5.7:1 on paper) */
  --rule:#C5BCB1;           /* hairlines */
  --rule-2:#9A9085;         /* the double rule and table heads */
  --accent:#144BB7;         /* ink blue: the offer line, the one highlighted range, the key figure */
  --accent-text:#144BB7;    /* 7.0:1 on paper */
  --accent-2:#2E2722;
  --accent-ink:#F9F3E8;
  --series-1:#2E2722;
  --series-2:#8C837A;
  --series-3:#CFC6BA;
  --series-4:#E4DBCE;
  --pos:#144BB7; --watch:#8C837A; --neg:#130E0A;
  --font-display:"Bodoni Moda",Didot,"Times New Roman",serif;   /* 400 only; titles and large figures */
  --font-body:"Geist","Helvetica Neue",Arial,sans-serif;        /* everything read, tables, chart labels */
  --font-figures:"Geist","Helvetica Neue",Arial,sans-serif;
  --radius:0px;
  --rule-w:1px;
  --m-x:64px; --m-top:42px; --m-bottom:28px; --gutter:30px;
  /* engine map: theme colours onto the names base.css reads */
  --hl:var(--accent);
  --hl-text:var(--accent-text);
  --divider-bg:var(--ink); --divider-ink:var(--paper);
  --fs-title:32px; --fs-body:15px; --fs-cover:66px; --fs-kpi:48px;
  --weight-title:400;
  --tracking-label:0;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.tracker { text-transform: none; font-size: 11px; gap: 0; }
.tracker > span { padding: 0 12px 0 0; margin-right: 12px; border-bottom: 0; border-right: var(--rule-w) solid var(--rule); }
.tracker > span:last-child { border-right: 0; }
.tracker > .on { border-bottom: 0; color: var(--accent-text); font-weight: 500; }
.action-title { letter-spacing: -0.02em; line-height: 1.26; font-optical-sizing: auto; }
.slide-head { border-bottom: var(--rule-w) solid var(--rule); padding-bottom: 14px; }
.stamp { text-transform: none; border: var(--rule-w) solid var(--ink); padding: 2px 9px; color: var(--ink); }
.slide.cover { background: var(--ink); color: var(--paper); padding: 64px 84px 48px; }
.slide.cover .cover-kicker { color: var(--paper); text-transform: none; letter-spacing: 0.04em; font-weight: 400; font-size: 14px; }
.slide.cover .cover-title { font-weight: 400; letter-spacing: -0.025em; line-height: 1.3; margin-top: 96px; max-width: 13em; }
.slide.cover .cover-sub { opacity: 1; max-width: 32em; }
.cover-rule { background: var(--paper); height: 1px; width: 100%; margin-top: 34px; }
.slide.cover .cover-meta { border-top: 0; }
.kpi-strip { border-top: 3px double var(--rule-2); }
.kpi + .kpi { border-left-color: var(--rule); }
.kpi-value { font-family: var(--font-display); font-weight: 400; letter-spacing: -0.02em; line-height: 1.3; }
.kpi.hl .kpi-value { color: var(--accent-text); }
.kpi-label { font-size: 14px; }
.delta { font-weight: 500; color: var(--muted); }
.summary-rows { border-top: var(--rule-w) solid var(--ink); }
.summary-rows .row { grid-template-columns: 280px 1fr; }
.summary-rows .row .k { text-transform: none; color: var(--muted); font-weight: 500; font-size: 12px; }
.summary-rows .row h4 { font-weight: 400; font-size: 21px; letter-spacing: -0.01em; line-height: 1.32; }
.exhibit > figcaption { border-bottom: var(--rule-w) solid var(--rule); }
.exhibit-no { text-transform: none; color: var(--ink); font-weight: 500; }
.exhibit-title { font-weight: 500; }
.takeaway { background: var(--paper-2); border-top: var(--rule-w) solid var(--ink); }
.takeaway h3 { text-transform: none; font-family: var(--font-display); font-weight: 400; font-size: 21px; line-height: 1.32; color: var(--ink); }
.takeaway .so-what { background: var(--ink); color: var(--paper); font-weight: 500; }
.callout { background: transparent; border-left: 0; border-top: var(--rule-w) solid var(--rule); border-bottom: var(--rule-w) solid var(--rule); padding-left: 0; }
.callout .callout-figure { font-family: var(--font-display); font-weight: 400; line-height: 1.3; }
table.data thead th { font-weight: 500; color: var(--muted); border-bottom: 3px double var(--rule-2); }
table.data tr.hl td { background: var(--paper-2); color: var(--ink); }
table.data tr.total td { border-top: var(--rule-w) solid var(--ink); font-weight: 600; }
.confid { text-transform: none; }
/* end furniture */
```

## Type
- Action title: Bodoni Moda 400, 32px / 1.26 (Bodoni's tall ascenders need the leading), tracking -0.02em, ink, sentence case. Never bold: weight turns the Didone into a fashion masthead.
- Large figures (KPI strip, callout figure): Bodoni Moda 400 at 48px; the one the board reads first in ink blue.
- Body: Geist 400, 15px / 1.4, ink-2; names and totals at 500 to 600.
- Tables and chart labels: Geist with tabular figures, 13 to 14px; heads Geist 500 in muted under the double rule.
- Labels, captions, source: Geist 11 to 12px, sentence case, untracked, muted.
- Cover: Bodoni Moda 400 at 66px in oat on the ink band, a 1px oat hairline under the subtitle.

## Slide furniture
- Tracker top left: sections parted by hairline column rules, the current one in ink blue.
- A 1px hairline under every title block; no ornament.
- Stamp ("Preliminary draft", "Subject to diligence") in a 1px ink box, sentence case, top right.
- Footer: "Source:" left, "Strictly private and confidential" in sentence case, folio right.
- Cover: the one ink band in the book. Dividers in long books repeat it with the section's answer in Bodoni.
- A disclaimer page and the adviser's contacts (roles only) close the book.

## Exhibits
- Football fields: ranges in light oat grey, the range the title names in ink blue, the offer or reference price as an ink-blue vertical line labelled at the top.
- Bars in near-black; the subject in ink blue. Value labels at bar ends in Geist; no gridlines on labelled bars.
- Precedent and trading tables: a 3px double rule under the head, hairlines between rows, the subject or median row on the well, a 1px ink rule above median and mean.
- Takeaway well: `--paper-2` under a 1px ink rule, a Bodoni head, the so-what on an ink bar.
- Every multiple carries its basis (LTM, NTM) in the column head.

## Dials
- `specimen/light-cover`: oat cover with an ink title for books that print in volume; the ink band then moves to section dividers.
- `specimen/hairline-only`: drops the double rule for a single 1px ink rule, for a plainer house.
- `specimen/optical`: the Hallmark original pins Bodoni Moda at optical size 96 so the hairlines go razor thin. The engine's font link requests weights only, so the browser uses the default optical size; pinning it needs the `opsz` axis in the font link (script change, not a token). At 32px titles the default cut is the safer read for a board anyway.

## Never
- Bold or heavy Bodoni; 400 only, in titles and large figures. Never Bodoni in tables or body text.
- A warm accent or cool paper; the signal is ink blue, the warmth is the oat.
- Ink blue as a fill for panels or more than one series; it marks the offer, one range, one figure.
- Rounded corners, shadows or gradients.
- Football fields without the basis and source of every range in the notes.
