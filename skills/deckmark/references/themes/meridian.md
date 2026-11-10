---
name: Meridian
slug: meridian
field: consulting
format: slides-16x9
paper: light 1.00 0
display: serif Georgia
accent: cool 235
density: medium
keywords: strategy, board, sector analysis, market sizing, scr, transformation, peers, benchmark, navy, cyan, serif titles
inspired_by: top-tier strategy consultancy sector analysis deck, recent house style (serif titles, navy and electric blue)
pictured: SCR strategy deck
---
# Meridian

Confident, modern strategy deck. Heavy serif action titles in near black navy, plain sans body, one
electric blue that marks the thing the reader should look at. Dense but ordered: every page is a claim,
a chart that proves it and a source line. It is never playful, never gradient-filled, never a web
landing page with big empty heroes and centred text.

## Tokens
```css
:root{
  --paper:#FFFFFF;
  --panel:#E7E7E7;          /* right-hand takeaway panel on split slides */
  --ink:#051C2C;            /* deep navy, titles and dark bars */
  --ink-2:#222222;          /* body text */
  --muted:#6B6B6B;          /* unit lines, axis, source */
  --rule:#BFBFBF;           /* hairlines in tables */
  --accent:#00A9F4;         /* electric blue: the one highlighted bar, key numbers in text */
  --accent-text:#0079B8;    /* --accent darkened for text on white (4.7:1) */
  --accent-2:#2251FF;       /* second series only, used sparingly */
  --tint-1:#1F40E6;         /* heatmap: strongest */
  --tint-2:#0679C3;
  --tint-3:#3CC8F4;
  --tint-4:#AFE4F5;         /* heatmap: weakest */
  --neg:#051C2C;            /* negatives stay dark, not red */
  --alert:#E5546C;          /* only for a single "today" marker */
  --font-display: Georgia, "Source Serif 4", "Times New Roman", serif;   /* real: Georgia Bold */
  --font-body: Arial, "Arimo", "Helvetica Neue", Helvetica, sans-serif;  /* real: Arial */
  --font-figures: Arial, "Arimo", sans-serif;
  --radius:0px;
  --rule-w:0.75px;
  --m-x:58px;               /* 4.5% of 1280 */
  --m-top:36px;
  --gutter:32px;
  /* engine map: theme colours onto the names base.css reads */
  --paper-2:var(--panel);
  --hl:var(--accent);
  --fs-title:30px;
  --fs-cover:52px;
  /* end engine map */
}
/* furniture: the house's own slide furniture, on base.css class names */
.slide ul { list-style: square; }
.summary-rows .row h4 { font-size: 18px; }
.summary-rows .row p { font-size: 16px; }
/* end furniture */
```

## Type
- Display (action title): Georgia bold, 32px / 1.12, ink, max 2 lines, left aligned at --m-x.
- Unit line under title: Arial 17px regular, ink-2, single line, 4px below title.
- Body: Arial 15px / 1.3; bullets with small square accent markers; key phrases bold in --accent-2 or --accent (max 3 per block).
- Figures on bars and in tables: Arial 14px, tabular numbers.
- Labels/kicker/stamps: Arial 11px caps, letter-spacing 0.04em, muted.
- Footnotes and source: Arial 9.5px, ink-2; never below 9px.
- Cover title: Georgia bold 52px white on --ink, left third, photo or fine line-wave art right.

## Slide furniture
- Action title top left, full sentence, 10 to 18 words, no period. Optional prefix tracker: framework id in bold like "2a:" set inline before the title.
- Kicker stamps top right, underlined small caps: "Preliminary", "Non-exhaustive".
- No rule under the title; whitespace separates.
- Source block bottom left at y=690: numbered footnotes line(s), then "Source: A; B; C".
- Footer right: house wordmark (text, 9.5px muted) then page number, baseline aligned with the source.
- Confidentiality appears on the cover only.
- Dividers: full-bleed bright --accent background with the contents list in white, current section boxed with a 1px white outline.

## Exhibits
- Bars: dark --ink fills, the subject bar in --accent; value label at bar end, 14px. No gridlines, no value axis.
- Horizontal ranked bars for peer comparisons; category labels left aligned.
- Small multiples of column charts with travel-band labels underneath, takeaway in a grey box to the left.
- Lines: 2px, series named at the line end, no legend box.
- Heatmap table: cell fills from --tint-1 to --tint-4, white text on the two darkest, ink on the rest. Column group headers ("Size", "Growth") with a hairline underline.
- Tables: bold header, --rule hairline between rows, no verticals, no zebra.
- Split slide: content 64% left, --panel 36% right with 3 bullets and an arrow callout box in --ink with white text.
- Case example frames: two bordered boxes ("Description" | "Case example"), a short thick --ink tab at top left of each.

## Dials
- `meridian/split`: grey right panel on by default for chart pages.
- `meridian/cover-dark`: navy cover with line-wave art vs white cover with navy title.
- `meridian/wide`: 1088x612 proportions, titles scale to 30px and gain more column room.

## Never
- Coloured bars for every category, rainbow legends, 3D, gradients on bars.
- Title in sans or title as a topic label on a content page.
- Gridlines on bar charts or a value axis when every bar is labelled.
- Rounded cards, drop shadows, emoji, icons used as decoration.
- Red to mean "bad" in charts.
