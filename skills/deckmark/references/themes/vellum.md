---
name: Vellum
slug: vellum
field: asset-mgmt
format: slides-16x9
paper: light 0.94 82
display: serif Grenze
accent: cool 268
density: medium
keywords: family office, wealth review, client review, private client, trust, multi-generational, heritage, stewardship, allocation versus policy, investment committee, parchment, ultramarine, ledger
inspired_by: multi-generational family office and private bank annual client review, printed on heavy cream stock
pictured: wealth review
adapted_from: hallmark/vellum (MIT)
---
# Vellum

The review a family office brings to the family table once a year: a parchment ground, umber ink, Grenze
(a roman with a trace of the old printing house) for titles and the large figures, a plain Hanken Grotesk for
everything read, hairlines and the printer's double rule, and ultramarine as the one pigment for the thing
the family should look at. It feels kept, like a ledger that has been in the family for decades. It is
never a fintech dashboard, never distressed or antique pastiche, and never decorated beyond the rules.

## Tokens
```css
:root{
  --paper:#F3EADA;          /* parchment */
  --paper-2:#E9DCC7;        /* wells and highlighted rows */
  --ink:#261A12;            /* umber: titles, primary text, the double rule */
  --ink-2:#3A2D24;          /* body */
  --muted:#62554A;          /* captions, source, units (6.0:1 on paper) */
  --rule:#BCAB96;           /* hairlines */
  --accent:#2942AB;         /* ultramarine: the one highlighted bar, row, figure */
  --accent-deep:#1B2E87;
  --accent-soft:#D1DBF3;
  --accent-text:#2942AB;    /* 7.1:1 on paper */
  --accent-2:#1B2E87;
  --accent-ink:#F3EADA;
  --series-1:#8C7B68;       /* ordinary bars: umber wash */
  --series-2:#B5A48E;
  --series-3:#D3C4AD;
  --series-4:#E2D6C2;
  --pos:#2942AB; --watch:#9A6A1E; --neg:#261A12;   /* within range, watch, breach: no green or red */
  --font-display:"Grenze",Georgia,"Times New Roman",serif;        /* titles and large figures */
  --font-body:"Hanken Grotesk","Helvetica Neue",Arial,sans-serif; /* everything read */
  --font-figures:"Hanken Grotesk","Helvetica Neue",Arial,sans-serif;
  --radius:2px;
  --rule-w:1px;
  --rule-double:4px;
  --m-x:60px; --m-top:40px; --m-bottom:28px; --gutter:30px;
  /* engine map: theme colours onto the names base.css reads */
  --hl:var(--accent);
  --hl-text:var(--accent-text);
  --divider-bg:var(--accent); --divider-ink:var(--paper);
  --fs-title:31px; --fs-body:15px; --fs-cover:64px; --fs-kpi:44px;
  --weight-title:400;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.tracker { text-transform: none; letter-spacing: 0; font-size: 11px; gap: 0; margin-bottom: 12px; }
.tracker > span { padding: 0 14px 4px; border-bottom: var(--rule-w) solid var(--rule); }
.tracker > span:first-child { padding-left: 0; }
.tracker > .on { border-bottom: 2px solid var(--accent); color: var(--ink); font-weight: 600; }
.slide-head { border-bottom: var(--rule-double) double var(--ink); padding-bottom: 12px; }
.action-title { line-height: 1.24; letter-spacing: -0.005em; max-width: 34em; }
.stamp { text-transform: none; letter-spacing: 0; border: var(--rule-w) solid var(--muted); border-radius: var(--radius); padding: 1px 8px; font-size: 11px; }
.slide.cover.light { background: var(--paper); color: var(--ink); padding: 56px 76px 44px; }
.slide.cover > div:first-child { border-top: var(--rule-double) double var(--ink); padding-top: 26px; }
.slide.cover .cover-kicker { color: var(--ink); text-transform: none; letter-spacing: 0.02em; font-weight: 600; font-size: 15px; }
.slide.cover .cover-title { font-weight: 400; line-height: 1.2; letter-spacing: -0.01em; margin-top: 70px; }
.slide.cover .cover-sub { opacity: 1; color: var(--ink-2); font-size: 19px; }
.cover-rule { background: var(--accent); width: 64px; height: 3px; }
.slide.cover .cover-meta { border-top: var(--rule-w) solid var(--rule); color: var(--muted); }
.kpi-strip { border-top: 0; }
.kpi-value { font-family: var(--font-display); font-weight: 400; letter-spacing: -0.01em; line-height: 1.25; }
.kpi.hl .kpi-value { color: var(--accent-text); }
.kpi-label { font-size: 14px; }
.summary-rows { border-top: var(--rule-w) solid var(--ink); }
.summary-rows .row { grid-template-columns: 260px 1fr; }
.summary-rows .row .k { text-transform: none; letter-spacing: 0; font-weight: 600; color: var(--accent-text); font-size: 12px; }
.summary-rows .row h4 { font-size: 22px; font-weight: 400; line-height: 1.3; }
.exhibit > figcaption { border-bottom: var(--rule-w) solid var(--rule); }
.exhibit-no { text-transform: none; letter-spacing: 0; color: var(--accent-text); }
.takeaway { background: var(--paper-2); border-radius: var(--radius); border-top: var(--rule-double) double var(--ink); }
.takeaway h3 { text-transform: none; letter-spacing: 0; font-family: var(--font-display); font-size: 20px; font-weight: 400; line-height: 1.3; color: var(--ink); }
.takeaway .so-what { background: var(--accent); color: var(--accent-ink); border-radius: var(--radius); font-weight: 600; }
.callout { background: var(--paper-2); border-left: 3px solid var(--accent); border-radius: var(--radius); }
table.data thead th { border-bottom: var(--rule-double) double var(--ink); font-weight: 600; }
table.data tr.hl td { background: var(--accent-soft); }
table.data tr.total td { border-top: var(--rule-double) double var(--ink); }
.status { font-weight: 500; }
.confid { text-transform: none; letter-spacing: 0; }
/* end furniture */
```

## Type
- Action title: Grenze 400, 31px / 1.24 (Grenze's tall ascenders need the leading), umber, sentence case, two lines max. Never set below 24px.
- Large figures (KPI, cover figure, callout figure): Grenze 400 at 44px; the one that matters in ultramarine.
- Body: Hanken Grotesk 400, 15px / 1.4; names in a row and table heads at 600. Three weights at most: 400, 500, 600.
- Tables: Hanken Grotesk 13 to 14px, tabular figures, right-aligned.
- Labels, captions, source: Hanken Grotesk 11 to 12px, sentence case, untracked, muted.
- Cover: Grenze 400 at 64px under a double rule, the family or trust name as given, the period below.

## Slide furniture
- Section tracker as a ruled ledger tab row top left; the current section underlined in ultramarine.
- Under the title, the printer's double rule (4px double, umber) runs the full measure.
- Footer: "Source:" left, "Private and confidential" in sentence case, folio right.
- Stamps ("Unaudited", "Estimate") in a hairline box with a 2px radius, top right.
- Dividers (long reviews): full-bleed ultramarine with the section's answer in Grenze, parchment type.
- The decisions requested appear on the exec summary and again on the last page, with what happens by default.

## Exhibits
- Bars in umber wash (`--series-1`); the asset class or holding the title names in ultramarine. Value labels at bar ends.
- Allocation against policy as a table: actual, target, range, a status dot (ultramarine within range, ochre watch, umber breach) and the rule for each in a footnote.
- Double rule over every table head and above every total; hairlines between rows; the highlighted row in pale ultramarine.
- Takeaway well: `--paper-2` under a double rule, Grenze head, the so-what on an ultramarine bar.
- Performance always net of fees and against the stated benchmark for each line.

## Dials
- `vellum/gotisch`: cover title only in Grenze Gotisch, the Hallmark original's blackletter, for a family's own heritage edition. Off by default: blackletter in action titles is hard to read at a glance and reads as costume to a finance reader, and it would be a third family.
- `vellum/ledger`: the Hallmark indigo colourway, cool grey-blue ground (#E8ECF1 class) with the same ultramarine, for a family that wants it quieter.
- `vellum/statement`: the exec summary opens on one sentence in Grenze at 30px across the measure on the `--paper-2` well, the family's numbers beneath it in ultramarine; for reviews read aloud at the table.

## Never
- Blackletter in action titles, tables or body text.
- Terracotta, clay or oxblood as the pigment on parchment; ultramarine is the one colour.
- Paper texture, deckled edges, vignettes, seals or any antique ornament; the rules carry the age.
- Green for gains and red for losses; status uses ultramarine, ochre and umber with a stated rule.
- Return figures without "net of fees" and the benchmark beside them.
