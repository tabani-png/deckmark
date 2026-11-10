---
name: Quiet Mandate
slug: quiet-mandate
field: banking
format: both
paper: light 0.99 85
display: serif Source Serif 4
accent: cool 250
density: medium
keywords: cim, teaser, confidential information memorandum, sell-side, boutique advisory, mid-market m&a, investment highlights, business overview, adjusted ebitda, project codename, navy, serif
inspired_by: boutique M&A advisory confidential information memorandum and sell-side teaser
pictured: CIM
---
# Quiet Mandate

The memorandum a boutique advisor sends to a buyer list under NDA. Serif section titles, a navy and one
muted gold, numbered sections, a project codename on the cover and "Strictly Private and Confidential"
on every page. Quietly expensive, readable cover to cover. It is never loud, never full of icons, and
never names the company where the codename should be.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --paper-2:#F7F5F0;        /* warm off-white for highlight panels and cover lower band */
  --ink:#0E2240;            /* navy: titles, header bars, primary bars */
  --ink-2:#222222;          /* body */
  --muted:#6B6B6B;          /* captions, units, footnotes */
  --rule:#C8C8C8;           /* hairlines */
  --accent:#2F5DA8;         /* the highlighted bar or row */
  --gold:#A08440;           /* section numbers, thin ornaments, cover rule; never a chart fill */
  --tint:#E4EAF3;           /* table total rows, highlight column */
  --font-display:"Source Serif 4",Georgia,"Times New Roman",serif; /* real: Georgia-class serif */
  --font-body:"Arimo",Arial,"Helvetica Neue",sans-serif;           /* real: Arial */
  --font-figures:"Arimo",Arial,sans-serif;
  --radius:0px;
  --rule-w:0.75px;
  --m-x:60px;               /* slides; report-a4 uses 22mm */
  --m-top:44px;
  --gutter:28px;
  /* engine map: theme colours onto the names base.css reads */
  --hl:var(--accent);
  --divider-bg:var(--ink);
  --fs-title:30px; --fs-body:15px;
  --fs-cover:60px;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.slide-head::after { content: ""; display: block; width: 40px; height: 2px; background: var(--gold); margin-top: 14px; }
.tracker > .on { border-bottom-color: var(--gold); }
.slide.cover.light { background: linear-gradient(var(--paper) 0 72%, var(--paper-2) 72% 100%); }
.slide.cover.light .cover-kicker { color: var(--ink); letter-spacing: 0.22em; }
.slide.cover.light .cover-title { color: var(--ink); font-weight: 600; line-height: 1.15; }
.cover-rule { background: var(--gold); height: 2px; width: 64px; }
.summary-rows { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; border-top: 0; }
.summary-rows .row { display: block; max-height: none; border: var(--rule-w) solid var(--rule); padding: 20px 22px; }
.summary-rows .row .k { font-family: var(--font-display); font-size: 28px; color: var(--gold); letter-spacing: 0; margin-bottom: 6px; }
.summary-rows .row h4 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
table.data { font-size: 14px; }
table.data tr.total td { background: var(--tint); }
.exhibit-no { color: var(--ink); }
/* end furniture */
```

## Type
- Section title (slides): Source Serif 4 700, 32px / 1.15, --ink, with the section number in --gold ("3.2").
- Report page title (A4): Source Serif 4 600, 26pt; body Arimo 10pt / 1.45.
- Body (slides): Arimo 16px / 1.4, ink-2.
- Investment highlight tiles: serif 20px 600 headline + 14px body.
- Tables: Arimo 12.5px, tabular numbers.
- Footnotes and source: Arimo 10px muted; never below 9px.
- Cover: "Project [Codename]" Source Serif 4 54px --ink, "Confidential Information Memorandum" 20px, month and year.

## Slide furniture
- Tracker: small caps 11px muted top left above the title: "3 | Business Overview".
- Title, then a 40px x 2px --gold rule under it.
- Footer left: "Strictly Private and Confidential" 10px; centre: "Project [Codename]"; right: page number.
- Source line bottom left above the footer on every exhibit: "Source: Management information; [advisor] analysis."
- Page 2: confidentiality and disclaimer notice; page 3: contents with numbered sections.
- Last page: advisor contacts (names, roles, emails as placeholders), no photos.
- "Illustrative" or "Preliminary" stamp 10px caps --muted in a hairline box top right when figures are projections.

## Exhibits
- Columns: --ink fills; the latest actual or projected year in --accent; projected years labelled with "E" or "B"; value labels on top 13px.
- Adjusted EBITDA bridge: reported EBITDA (--ink) then add-backs as floating bars in --tint with --ink outlines, adjusted EBITDA (--accent); every add-back footnoted.
- P&L table: years across with "FY23A FY24A FY25E", sections bold, margins in italic % rows, totals rule above.
- Investment highlights: 6 numbered tiles in a 3x2 grid, number in --gold serif 28px, hairline frame, no fill.
- Customer concentration: horizontal bars top 10, share labels, "Top 10 = X% of revenue" note.
- Org charts: hairline boxes, names as roles only.
- Maps only as simple outlined regions with dots, no basemaps.

## Dials
- `quiet-mandate/report`: report-a4 portrait, single column body at 150mm measure, exhibits full width.
- `quiet-mandate/teaser`: 2 pages, company described without a name, key financials table and process contact only.
- `quiet-mandate/gold-off`: removes gold ornaments for a plainer bank house.

## Never
- The real company name in a teaser or on the CIM cover (codename only).
- Gold or serif in charts; serif in tables.
- Icons, emoji, stock photography, rounded cards, gradients.
- Projections without "E"/"B" markers or an "Illustrative" stamp.
- Add-backs without a footnote explaining each.
