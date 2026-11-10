---
name: Ochre Covenant
slug: ochre-covenant
field: credit
format: slides-16x9
paper: light 1.00 0
display: sans Public Sans
accent: warm 70
density: dense
keywords: private credit, direct lending, bdc, fund deck, lp update, quarterly results, first lien, nav, nii, non-accruals, leverage, portfolio statistics, credit memo, navy, ochre
inspired_by: listed direct lending fund (BDC) quarterly investor and earnings presentations
pictured: private credit fund deck
---
# Ochre Covenant

Navy, pale blue and a single ochre. A lender's deck: rolling five-quarter tables, first-lien share,
non-accruals and leverage set out plainly with italic unit labels and footnotes. Calm, conservative and
complete. It is never punchy, never one big number without its trend, and never coloured by mood
(no red for losses, no green for gains).

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --ink:#072346;            /* navy: titles, table headers, primary bars, cover field */
  --ink-2:#2D2D2D;          /* body text (dark grey, not black) */
  --muted:#6E7781;          /* footnotes, axis */
  --rule:#BFC6CE;           /* table hairlines */
  --band:#EEF1F4;           /* zebra group bands in tables */
  --label:#C5DCF1;          /* pale blue label tiles on exec summary */
  --accent:#C48919;         /* ochre: rule under title, second series, cover pill */
  --accent-text:#9B5E18;    /* ochre text on white (5.2:1) */
  --watermark:#F1F2F4;      /* chevron watermark on cover/dividers */
  --font-display:"Public Sans","Segoe UI",Arial,sans-serif; /* real: Bierstadt (grotesque) */
  --font-body:"Public Sans","Segoe UI",Arial,sans-serif;
  --font-figures:"Public Sans",Arial,sans-serif;            /* tabular-nums on */
  --radius:0px;
  --rule-w:0.75px;
  --title-rule:1.5px;
  --m-x:56px;
  --m-top:44px;
  --gutter:24px;
  /* engine map: theme colours onto the names base.css reads */
  --paper-2:var(--band);
  --series-1:var(--ink); --series-2:var(--label); --series-3:var(--accent); --series-4:var(--rule);
  --hl:var(--accent);
  --divider-bg:var(--paper); --divider-ink:var(--ink);
  --fs-title:30px;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.slide-head { border-bottom: var(--title-rule) solid var(--accent); padding-bottom: 12px; }
.subtitle { font-size: 18px; margin-top: 4px; }
.slide li::marker { content: "\203A  "; color: var(--accent); font-weight: 700; }
.slide.cover .cover-title { text-transform: uppercase; font-size: 46px; letter-spacing: 0.01em; }
.slide.cover .cover-kicker { display: inline-block; background: var(--accent); color: var(--ink); padding: 5px 14px; border-radius: 999px; letter-spacing: 0.08em; }
.slide.cover .cover-rule { display: none; }
.slide.cover::after { content: ""; position: absolute; right: -40px; top: 70px; width: 440px; height: 580px; background: color-mix(in srgb, var(--paper) 7%, var(--ink)); clip-path: polygon(0 0, 42% 0, 100% 50%, 42% 100%, 0 100%, 58% 50%); }
.slide.cover > * { position: relative; z-index: 1; }
.summary-rows { border-top: 0; }
.summary-rows .row { grid-template-columns: 300px 1fr; border-bottom: 1px dashed var(--rule); align-items: center; }
.summary-rows .row > div:first-child { background: var(--label); padding: 14px 18px; align-self: stretch; display: flex; flex-direction: column; justify-content: center; }
.summary-rows .row .k { color: var(--ink); }
.summary-rows .row h4 { font-family: var(--font-display); font-size: 18px; }
table.data thead th { background: var(--ink); color: var(--paper); border-bottom: 0; }
table.data thead th:first-child { font-style: italic; font-weight: 400; }
table.data tr.group td { background: var(--band); border-bottom: 0; }
table.data tbody td.num:nth-child(2) { font-weight: 700; color: var(--ink); }
.exhibit-no { color: var(--accent-text); }
/* end furniture */
```

## Type
- Action title: Public Sans 700, 30px / 1.1, --ink, top left; subtitle Public Sans 400 18px --ink-2 directly below ("Key Financial Highlights").
- Body: 15px / 1.35, --ink-2; chevron bullets in --accent.
- Tables: 13px, header bold white on --ink; first header cell carries the unit in italic: "($000 except per share data)".
- Chart titles: 15px 700 caps --ink with unit "($ IN MILLIONS)" and superscript footnote.
- Footnotes: italic 11px muted with superscript numerals; never below 9px.
- Cover: 40px 700 caps white on --ink.

## Slide furniture
- Title block then a full-width --accent rule (1.5px) under it at y=100.
- Footer: fund wordmark (fictional) small at bottom left 11px, page number bottom right 10px; footnotes sit above the wordmark.
- Dividers: white page, section name 40px 700 caps --ink at left middle, oversized --watermark chevrons right, wordmark bottom left.
- Cover: full --ink field, wordmark top left, title caps white, period ("Second Quarter 20XX") in an --accent pill with white bold text, web address small bottom left.
- "As of [date] and for the Three Months Ended" super-header centred over period columns.
- Risk language: "Past performance is not indicative of future results" and a forward-looking statements page after the cover.

## Exhibits
- Rolling tables: newest period first, five columns; section rows bold ("Portfolio Composition (at fair value)"); zebra --band per group; totals with a top rule; ratios as "1.17x"; percentages one decimal; dollars per share two decimals; negatives in parentheses.
- Exec summary: left column of --label tiles (18px 700 --ink, centred), right column bullets, 1px dashed --rule between rows.
- Columns: --ink fills, white value labels inside the bar top; a second series stacked in --accent; legend under the chart, small square keys.
- 100% stacked asset mix: --ink first lien, --label second lien, --accent equity; percentages labelled above each stack.
- KPI grid (fund at a glance): 2 rows x 5, big number 28px --ink, caption 12px, prior-period value in muted brackets "(Q1: 93%)".
- Credit memo pages (dial): term sheet table two columns, covenant table with "Required | Actual | Headroom".

## Dials
- `ochre-covenant/lp-letter`: report-a4 portrait, same tokens, 11pt body, quarterly LP update with a one-page letter then tables.
- `ochre-covenant/credit-memo`: adds Recommendation / Rationale / Risks / Mitigants section bands: `<p class="section-band">Rationale</p>` first in the body (components.md `.section-band`, filled from `--band`, label size).
- `ochre-covenant/quiet`: drops the chevron watermark.

## Never
- Red/green to mean bad/good; mood colours on credit metrics.
- A KPI without its prior period or as-of date.
- Mixed period ordering (oldest first on one page, newest first on another).
- Rounded tiles, shadows, icons, photos of handshakes or skylines.
- Leverage or coverage without "x"; yield without basis (fair value or cost) stated.
