---
name: Fairness Room
slug: fairness-room
field: banking
format: slides-16x9
paper: light 1.00 0
display: sans Albert Sans
accent: cool 262
density: dense
keywords: pitch book, board discussion materials, special committee, fairness, m&a, valuation, football field, comps, precedents, sources and uses, dcf, sensitivity, navy, blue
inspired_by: bulge-bracket investment bank board and special committee discussion materials (public fairness exhibit style)
pictured: pitch book
---
# Fairness Room

The book a banker walks into a boardroom with. White pages, a bright corporate blue title, navy table
bars, and exhibits so dense they need a unit line and three footnotes. Every page carries a red dashed
draft stamp until it is final. It is never airy, never a marketing deck, never a chart without a source
and a "$ in millions" line.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --ink:#0F1632;            /* navy: table title bars, method pills, peer bars */
  --ink-2:#1A1A1A;          /* body text */
  --muted:#5F6670;          /* unit lines, axis, footnotes */
  --rule:#C9CED6;           /* table hairlines */
  --accent:#205EE3;         /* titles, section numbers, subject company bars */
  --accent-soft:#74C3FC;    /* second valuation method, highlighted total rows */
  --tint:#E6F1FC;           /* total rows, highlighted column fill */
  --ref:#A3ADAF;            /* "for reference only" bars */
  --subject:#E5A823;        /* subject company bar in comps when blue is taken by peers */
  --pos:#388C3F;            /* one method row or upside bar only */
  --neg:#D65F57;            /* offer price dashed line, downside bars in tornado */
  --stamp:#D65F57;          /* draft stamp border and text */
  --font-display:"Albert Sans","Helvetica Neue",Arial,sans-serif; /* real: proprietary bank geometric sans */
  --font-body:"Arimo",Arial,"Helvetica Neue",sans-serif;          /* real: Arial-class */
  --font-figures:"Arimo",Arial,sans-serif;
  --radius:3px;             /* pills and title bars only */
  --rule-w:0.75px;
  --m-x:32px;
  --m-top:28px;
  --gutter:20px;
  /* engine map: theme colours onto the names base.css reads */
  --paper-2:var(--tint);
  --hl:var(--accent);
  --series-1:var(--ink); --series-2:var(--accent); --series-3:var(--accent-soft); --series-4:var(--ref);
  --divider-bg:var(--paper); --divider-ink:var(--accent);
  --fs-title:30px; --fs-body:14px; --fs-small:14px; --fs-table:12px;
  --weight-title:500;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.action-title { color: var(--accent); }
.subtitle { font-weight: 700; font-size: 14px; color: var(--ink-2); margin-top: 4px; }
.stamp { border: 1px dashed var(--stamp); color: var(--stamp); padding: 3px 8px; font-weight: 700; letter-spacing: 0.02em; }
.slide.cover.light { border-top: 12px solid var(--accent); }
.slide.cover.light > div:first-child { margin-top: 110px; }
.slide.cover.light .cover-title { color: var(--accent); font-weight: 500; }
.slide.cover.light .cover-kicker { color: var(--ink); }
.slide.cover.light .cover-rule { background: var(--ink); height: 3px; }
table.data thead th { background: var(--ink); color: var(--paper); border-bottom: 0; padding: 7px 10px; }
table.data tr.total td { background: var(--tint); border-top: 1.5px solid var(--ink); }
table.data tr.hl td { background: var(--paper); font-weight: 700; color: var(--ink); border-top: 1.5px solid var(--ink); }
.summary-rows .row .k { color: var(--accent); }
svg.dm-chart .ch-range { fill: var(--ink); }
svg.dm-chart .ch-marker { stroke: var(--neg); stroke-dasharray: 5 3; }
svg.dm-chart .ch-value.hl { fill: var(--ink); }
.slide-foot .pageno { border-left: 1px solid var(--rule); padding-left: 10px; }
/* end furniture */
```

## Type
- Action title: Albert Sans 500, 30px / 1.1, --accent, one line, noun phrase or short claim ("Summary of Preliminary Financial Analysis").
- Subtitle: Arimo bold 14px ink-2 directly under the title; unit line under it, Arimo italic 11px muted: "($ in millions, except per share data)".
- Body bullets: Arimo 14px / 1.3 (the body minimum), round bullets, 3px indent steps.
- Tables: Arimo 12px (--fs-table), header bold 11px; numbers tabular, right aligned.
- Bar labels: 11px ink-2 outside bar ends.
- Footnotes and source: Arimo 9px muted, never below 9px.
- Section divider: "2.  Preliminary Financial Analyses" in Albert Sans 34px --accent, left at x=96, vertical centre, nothing else on the page.

## Slide furniture
- Draft stamp top right, 1px dashed --stamp box, 10px bold --stamp text: "Preliminary Draft | Subject to Review and Revision". Remove only when the theme dial `final` is set.
- Title top left at y=60; no rule under it.
- Source block bottom left at y=676: "Source: Company forecasts, public filings, market data as of [date]." then "Note:" line, then numbered footnotes "(1)". Every exhibit page has it.
- Footer right: house wordmark text (fictional), a 1px vertical rule, page number 12px.
- Page 2 is always the disclaimer: heading in --accent, 4 to 5 justified paragraphs at 9.5px.
- Contents page: numbered sections with page numbers; sections reused as dividers.
- "For Reference Only" groups get a rotated 10px label in a --ref band at the left of the row group.

## Exhibits
- Football field: rows are methods with navy or blue label pills at left (240px wide); floating bars with low and high labels outside each end; vertical dashed lines for current price (--accent-soft) and offer price (--neg) with boxed tags at the top; assumptions column at right in 10px bullets. Reference-only rows in --ref.
- Comps benchmarking: one column per peer, subject first in --subject, peers in --ink, median as a dotted --accent line labelled "Median: 7.3x". Values above bars, negatives in parentheses.
- Sources & uses: two tables side by side, each with an --ink title bar, columns "$ in mm" and "%", total row in --tint with a rule above; sources total must equal uses total.
- Precedents: date row, target and acquirer as text names (no logos unless supplied), FV and FV/LTM EBITDA columns, median line.
- Sensitivity tornado: --neg and --pos bars around a midpoint tag.
- Tables: --ink header row with white text or bold text over a 1.5px --ink rule; hairline rows; highlighted latest column in --tint.
- Line charts: subject in --accent 2px, index in --ink 1.5px, peers in --ref 1px.

## Dials
- `fairness-room/final`: draft stamp off, adds "Strictly Private and Confidential" footer line.
- `fairness-room/navy-title`: titles in --ink instead of --accent for more conservative houses.
- `fairness-room/teaser`: density medium, body 14px, used for a 2-page sell-side teaser.

## Never
- A valuation exhibit without a unit line, a source line and an as-of date.
- Minus signs for negatives; mixed decimals within a column; multiples without "x".
- Rounded cards, drop shadows, gradients, icons as decoration, stock photos.
- Real bank or company names and logos in samples.
- Two highlight colours competing on one chart.
