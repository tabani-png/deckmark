---
name: Verdance
slug: verdance
field: public-sector
format: slides-16x9
paper: light 1.00 0
display: geometric sans Questrial
accent: warm 150
density: dense
keywords: national plan, economic vision, government, sector strategy, initiatives, targets, flagship projects, green, gold, ministry
inspired_by: consultancy national economic vision full report for a government
pictured: public-sector report
---
# Verdance

A national programme document: deep green identity, a gold second note, a solid green footer bar on every
page, green sidebars that name the levers, and initiative tables that run for many pages. It feels
institutional and ambitious. It is never a startup deck, never neon, and never uses the green for
decoration inside charts beyond the one highlighted series.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --brand:#007A33;          /* deep green: footer bar, sidebars, headings, highlight bar */
  --accent:#007A33;         /* engine name for --brand */
  --brand-dark:#1E3A2C;     /* cover field */
  --brand-tint:#CCE4D8;     /* pale green highlight, "covered in this section" key */
  --gold:#D8A93C;           /* second note: column-group headers, stamp, one series */
  --gold-tint:#EFE4C2;
  --ink:#1A1A1A;
  --muted:#6E6E6E;
  --bar-grey:#D3D3D3;       /* non-highlighted bars */
  --rule:#9A9A9A;
  --flag:#D7262E;           /* small kicker tab only, e.g. a section label chip */
  --font-display: "Questrial", "Century Gothic", "URW Gothic", Arial, sans-serif; /* real: Century Gothic */
  --font-body: Arial, "Arimo", Helvetica, sans-serif;      /* real: Arial */
  --font-figures: Arial, "Arimo", sans-serif;
  --radius:0px;
  --rule-w:1px;
  --m-x:18px;
  --m-top:18px;
  --gutter:18px;
  --footer-h:26px;
  /* engine map: theme colours onto the names base.css reads */
  --paper-2:color-mix(in srgb, var(--brand-tint) 45%, var(--paper));
  --series-1:var(--bar-grey); --series-2:var(--brand); --series-3:var(--gold); --series-4:var(--brand-dark);
  --hl:var(--brand);
  --hl-text:var(--brand);
  --divider-bg:var(--brand-dark);
  --fs-title:27px; --fs-body:14px;
  --weight-title:400;
  --m-bottom:0px;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.slide { padding-top: 26px; }
.tracker > span { padding: 2px 8px; border: 0; }
.tracker > .on { background: var(--brand); color: var(--paper); }
.action-title { padding-bottom: 10px; border-bottom: 1px solid var(--gold); }
.stamp { border: 0.75px solid var(--rule); padding: 2px 7px; color: var(--muted); top: 26px; }
.slide strong, .summary-rows .row .em { color: var(--brand); }
.slide.cover { background: var(--brand-dark); justify-content: flex-end; }
.slide.cover > div:first-child { margin-left: auto; text-align: left; max-width: 640px; margin-bottom: 40px; }
.slide.cover .cover-kicker { color: var(--gold); }
.slide.cover .cover-rule { background: var(--gold); }
.slide.cover::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 38%; background: var(--brand); }
.summary-rows { border-top: 0; gap: 8px; }
.summary-rows .row { grid-template-columns: 26% 1fr; border-bottom: 0; padding: 0; background: var(--paper); align-items: center; }
.summary-rows .row > div:first-child { background: var(--brand); color: var(--paper); padding: 16px 18px; align-self: stretch; display: flex; flex-direction: column; justify-content: center; }
.summary-rows .row .k { color: var(--paper); opacity: 0.9; }
.summary-rows .row h4 { color: var(--paper); font-family: var(--font-body); font-size: 17px; }
.summary-rows .row p { font-size: 15px; padding-right: 24px; }
table.data thead th { border-bottom: 2px solid var(--brand); }
table.data td:first-child { color: var(--brand); font-weight: 700; }
table.data td.num { background: var(--paper-2); border-bottom: 3px solid var(--paper); text-align: center; }
table.data th.num { text-align: center; }
.takeaway .so-what { background: var(--brand); }
.slide-foot { background: var(--brand); margin: 0 calc(var(--m-x) * -1); padding: 6px var(--m-x); align-items: center; }
.slide-foot .source, .slide-foot .footnote, .slide-foot .confid, .slide-foot .pageno { color: var(--paper); }
/* end furniture */
```

## Type
- Display: Questrial 26px / 1.15, --ink, 2 lines max, left aligned; thin gold or grey rule under the title area.
- Kicker chip above title: 10px white caps on --brand or --flag, small tab touching the top edge.
- Body: Arial 14px / 1.3; key phrases bold in --brand.
- Sidebar labels: Arial bold 15px white on --brand.
- Figures: Arial 13px; growth rates in pill chips (white text on --gold or --flag) above column groups.
- Footnotes/source: Arial 9.5px, white text inside the green footer bar for the source; footnotes above it in ink.

## Slide furniture
- Footer: full-width --brand bar, --footer-h tall, source line left in white, page number right in white.
- Top right: small emblem slot (client mark only if supplied; otherwise leave empty, never invent).
- Optional circled tracker (A, B1, C3) in --brand before the title.
- Stamps right-aligned under the title in grey boxed caps ("NON-EXHAUSTIVE", "ILLUSTRATIVE EXAMPLE").
- Outline pages: three-column chapter map, chapter heads in --brand caps underlined, current chapter on --brand-tint.
- Cover: --brand-dark field with a full-bleed duotone green image, title bottom right white 36px.

## Exhibits
- Bars: --bar-grey, the subject bar in --brand; value labels at bar end.
- Area/stacked charts: --brand, --gold, grey, dark green; labels inside bands, legend as a swatch row on top.
- Lines: two lines max, --brand and --gold, small multiples across countries with the subject in bold.
- Target tables: "2017 / 2025 / 2035" columns, grey value boxes, TBC allowed only as text "TBC".
- Initiative tables: id column (e.g. Fin.A.10) in --brand, objective, initiative text, owner; hairlines.
- Left sidebar pattern: 26% green column with 3 to 4 levers, bullets right.

## Dials
- `verdance/footer`: green bar footer vs thin green rule.
- `verdance/gold`: gold second colour on or off (off = green plus greys only).
- `verdance/sidebar`: green lever sidebar on analysis pages on or off.

## Never
- National symbols, flags or emblems generated or guessed; only marks the user supplies.
- Watermarks across content.
- More than green, gold and greys in one chart (the red is for chips only).
- Light-weight green text on white under 14px (contrast).
