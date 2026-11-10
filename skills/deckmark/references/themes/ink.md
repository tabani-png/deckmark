---
name: Ink
slug: ink
field: pe
format: slides-16x9
paper: light 0.995 100
display: sans Epilogue
accent: cool 188
density: medium
keywords: private equity, investment committee, ic memo, lp letter, quarterly letter, portfolio review, buyout, growth equity, value creation, returns by case, monochrome, teal, ruled, quiet, plain
inspired_by: mid-market private equity investment committee memo and quarterly LP letter, printed in plain black with one state colour
pictured: IC memo
adapted_from: hallmark/ink (MIT)
---
# Ink

An investment committee memo printed in plain black: white paper, a black with no hue, Epilogue at 700 for
the title and 400 for everything read, ruled lists that open on a 1px ink rule, and one teal that means
recommended, in, or cleared. It feels competent and unhurried, the memo of a partner who expects the
numbers to be checked. It is never a loud investor-day deck, never a cold corporate grey, and never warm
cream editorial.

## Tokens
```css
:root{
  --paper:#FEFDFB;          /* white paper */
  --paper-2:#F6F5F2;        /* the well */
  --ink:#0D0D0D;            /* hueless black: titles, bars, totals */
  --ink-2:#292929;          /* body (muted greys tire on white) */
  --muted:#525252;          /* labels, captions, source (7.7:1 on paper) */
  --rule:#DBDBD8;           /* hairlines between rows */
  --accent:#00746D;         /* teal: recommended, in, cleared; the one highlighted mark */
  --accent-text:#00746D;    /* 5.6:1 on paper */
  --accent-soft:#C3F3EF;    /* the "in" tag fill */
  --accent-soft-ink:#022D2B;
  --accent-2:#292929;
  --accent-ink:#FEFDFB;
  --series-1:#0D0D0D;
  --series-2:#8A8A8A;
  --series-3:#BDBDBD;
  --series-4:#E3E3E1;
  --pos:#00746D; --watch:#8A8A8A; --neg:#0D0D0D;    /* teal means in; out is grey or black, never red */
  --font-display:"Epilogue","Helvetica Neue",Arial,sans-serif;
  --font-body:"Epilogue","Helvetica Neue",Arial,sans-serif;
  --font-figures:"Epilogue","Helvetica Neue",Arial,sans-serif;
  --radius:4px;
  --rule-w:1px;
  --m-x:60px; --m-top:40px; --m-bottom:28px; --gutter:30px;
  /* engine map: theme colours onto the names base.css reads */
  --hl:var(--accent);
  --hl-text:var(--accent-text);
  --divider-bg:var(--ink); --divider-ink:var(--paper);
  --fs-title:30px; --fs-body:15px; --fs-cover:56px; --fs-kpi:40px;
  --tracking-label:0;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.tracker { text-transform: none; gap: 22px; font-size: 11px; }
.tracker > span { padding-bottom: 2px; }
.tracker > .on { border-bottom: 2px solid var(--ink); }
.action-title { letter-spacing: -0.03em; line-height: 1.08; }
.stamp { top: calc(var(--m-top) - 4px); border: 0; border-radius: 999px; background: var(--accent-soft); color: var(--accent-soft-ink); padding: 3px 12px; text-transform: none; font-weight: 700; font-size: 11px; }
.slide.cover.light { background: var(--paper); color: var(--ink); padding: 60px 80px 46px; }
.slide.cover .cover-kicker { color: var(--muted); text-transform: none; letter-spacing: 0; font-weight: 400; font-size: 15px; }
.slide.cover .cover-title { letter-spacing: -0.04em; line-height: 1.0; margin-top: 120px; max-width: 14em; }
.slide.cover .cover-sub { opacity: 1; color: var(--ink-2); max-width: 36em; }
.cover-rule { display: none; }
.slide.cover .cover-meta { border-top: var(--rule-w) solid var(--ink); color: var(--muted); }
.kpi-strip { border-top: 0; background: var(--paper-2); border-radius: var(--radius); padding: 16px 22px 18px; }
.kpi-value { letter-spacing: -0.04em; }
.kpi.hl .kpi-value { color: var(--accent-text); }
.kpi-label { font-size: 14px; }
.delta { font-weight: 400; color: var(--muted); }
.summary-rows { border-top: var(--rule-w) solid var(--ink); }
.summary-rows .row { grid-template-columns: 250px 1fr; }
.summary-rows .row .k { text-transform: none; color: var(--muted); font-weight: 400; font-size: 12px; }
.summary-rows .row h4 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; font-size: 18px; }
.summary-rows .row:first-child h4 { color: var(--accent-text); }
.exhibit > figcaption { border-bottom: var(--rule-w) solid var(--ink); }
.exhibit-no { text-transform: none; color: var(--ink); }
.takeaway { background: var(--paper-2); border-radius: var(--radius); border: var(--rule-w) solid var(--rule); }
.takeaway h3 { text-transform: none; font-size: 15px; color: var(--ink); }
.takeaway .so-what { background: var(--ink); color: var(--paper); border-radius: var(--radius); font-weight: 700; }
.callout { background: var(--paper-2); border-left: 0; border-top: var(--rule-w) solid var(--ink); border-radius: 0; font-weight: 400; }
.callout strong { color: var(--accent-text); }
table.data thead th { font-weight: 400; color: var(--muted); border-bottom: var(--rule-w) solid var(--ink); }
table.data tr.hl td { background: var(--paper-2); font-weight: 700; color: var(--ink); }
table.data tr.total td { border-top: var(--rule-w) solid var(--ink); }
.status { font-weight: 700; }
.status.st-ok { color: var(--accent-soft-ink); background: var(--accent-soft); border-radius: 999px; padding: 2px 10px 2px 8px; }
.status.st-ok::before { background: var(--accent); }
.status.st-watch { color: var(--muted); border-radius: 999px; padding: 2px 10px 2px 8px; outline: var(--rule-w) solid var(--rule); outline-offset: -1px; }
.confid { text-transform: none; }
/* end furniture */
```

## Type
- Action title: Epilogue 700, 30px / 1.08, tracking -0.03em, ink, sentence case, two lines max.
- Body: Epilogue 400, 15px / 1.4, ink-2; names in a row and totals at 700.
- Figures: Epilogue 700, a step larger than the label beside them; KPI figures 40px, tracking -0.04em, the recommended one in teal.
- Labels, captions, table heads, tracker: Epilogue 400, 11 to 12px, sentence case, untracked, muted. No mono, no caps.
- Cover: Epilogue 700 at 56px set low on white, the deal codename and the decision in the subtitle, no rule or ornament.

## Slide furniture
- Section tracker top left in sentence case; the current section underlined in ink, never teal.
- Status tag top right as a pale teal pill ("Recommended", "For decision"); a closed or declined item takes an outlined grey pill.
- Every list and table opens on a 1px ink rule and continues on hairlines.
- Footer: "Source:" left, "Confidential, for the investment committee" in sentence case, folio right.
- The recommendation row of the exec summary carries its headline in teal; the default if the committee does nothing is printed under it.

## Exhibits
- Bars in black; the one bar the title names in teal. Value labels at bar ends, no gridlines.
- Value creation bridges: totals black, contributions grey, detractors light grey with bracketed labels, the driver the title names in teal.
- Returns by case as a ruled table: base case row on the well in bold, a teal "Clears" pill against the hurdle, an outlined pill where it does not.
- Takeaway well: `--paper-2` with a hairline edge and 4px radius; the so-what on an ink bar.
- KPI figures sit on one `--paper-2` well, never on separate cards.

## Dials
- `ink/board`: the Hallmark notice-board colourway (pale yellow ground, deeper teal) for an internal portfolio review; off for anything an LP sees.
- `ink/letter`: LP letter mode: summary rows become paragraphs under the ink rule, KPIs drop to a single row of fund figures (net IRR, TVPI, DPI) each with its prior-quarter comparison.
- Toned down from Hallmark: radius 12px became 4px on wells and 0 on exhibits, and the resting shadow is gone. Rounded cards read as product UI to a committee; the pill stays only on state tags.

## Never
- A second colour: teal means in, recommended or cleared; out is grey, never red.
- A warm black or warm paper; ink and greys carry no hue.
- A teal field, teal running text or a teal rule; teal marks one figure, one bar, one tag.
- Shadows, glows or cards inside cards.
- A memo that ends without the decision requested and the default outcome.
