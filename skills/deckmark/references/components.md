# Components

Every `base.css` class an author may use, with a short example each. Use these; do not invent layout classes or add a `<style>` block of new layout. Colours and fonts come from the theme tokens, never from the slide. Chart classes (`.dm-chart`, `.ch-*`) are written by `scripts/charts.mjs`, never by hand.

Size tiers (decklint `min-font`, `gates.md` § 1): **body** 14px (A4 11px); **label** 10px (A4 8pt) for table cells, chart text and the label classes marked *label* below; **furniture** 9px (A4 7pt).

## Page frame

**`.deck`** wraps every page; **`.slide`** is one page (1280x720, or A4 with `<body data-format="report-a4">`). Add `data-archetype="<archetype>"` on every slide.
```html
<main class="deck">
  <section class="slide" data-archetype="chart-takeaway">...</section></main>
```

**`.slide-head`** holds tracker, title and subtitle; **`.slide-body`** is the body area (flex column, fills the page); **`.slide-foot`** holds notes, confidentiality and page number.
```html
<header class="slide-head">...</header><div class="slide-body">...</div>
<footer class="slide-foot"><div class="notes"><p class="source">Source: ...</p></div><span class="confid">Confidential</span><span class="pageno">4</span></footer>
```

## Furniture (furniture tier unless marked)

**`.tracker`** with **`.on`** for the current section.
```html
<div class="tracker"><span>Situation</span><span class="on">Options</span>
  <span>Plan</span></div>
```

**`.action-title`** (8 to 20 words, 2 lines max), **`.subtitle`** or **`.unit-line`** under it (body tier), **`.kicker`** above it (*label*).
```html
<p class="kicker">Exhibit 2 · Margin</p><h2 class="action-title">Pricing and volume beat cost inflation in FY25</h2>
<p class="unit-line">EBITDA, $ in millions, FY24 to FY25</p>
```

**`.stamp`**: a status tag top right ("Preliminary", "Draft").
```html
<header class="slide-head"><span class="stamp">Preliminary</span>
  <h2 class="action-title">...</h2></header>
```

**`.notes`**, **`.source`**, **`.footnote`**, **`.confid`**, **`.pageno`**: the footer parts.
```html
<div class="notes"><p class="footnote">1. Pre-IFRS 16.</p><p class="source">Source: audited accounts FY21 to FY24</p></div>
<span class="confid">Strictly confidential</span><span class="pageno">7</span>
```

## Text

**`.lead`** (a one or two sentence opener, body tier), **`.body-copy`** (memo paragraphs), **`.small`**, **`.em`** (accent-coloured emphasis), **`.label`** (*label*, small caps heading).
```html
<p class="lead">Two ports carry <span class="em">61%</span> of all tonnes.</p>
<p class="label">What the ranking says</p><p class="body-copy">...</p>
```

**`.num`** / **`.fig`**: tabular figures (in tables `td.num` also right-aligns).
```html
<td class="num">1,240</td>
<span class="fig">4.6x</span>
```

**`.gap`** (*label*): the one-line marker where a missing number would go. The open-items slide lists it. Keep it off dark fields (dark cover, `.callout.dark`, `.so-what`); there it takes the field's ink, since `--muted` fails 4.5:1 on a dark ground.
```html
<td class="num"><span class="gap">n/a: source needed</span></td>
<p>Build cost per use case: <span class="gap">n/a, see open items</span></p>
```

## Cover and divider

**`.slide.cover`** (dark) or **`.slide.cover.light`**; parts **`.cover-kicker`** (*label*), **`.cover-title`**, **`.cover-sub`**, **`.cover-rule`**, **`.cover-meta`**.
```html
<section class="slide cover light" data-archetype="cover"><div><p class="cover-kicker">Board discussion document</p><h1 class="cover-title">Project Harbor</h1><p class="cover-sub">...</p><div class="cover-rule"></div></div>
  <div class="cover-meta"><span>Draft · Round 1</span><span class="confid">Strictly confidential</span></div></section>
```

**`.slide.cover.split`**: the dealt split cover. Title block left; **`.cover-panel`** right holds the one key figure: **`.cover-figure`** (the number) and **`.cover-figure-label`** (what it is). Meta runs across the foot. Wrap the figure in `data-fact` as anywhere else.
```html
<section class="slide cover split" data-archetype="cover"><div><p class="cover-kicker">Credit committee</p><h1 class="cover-title">Halden Packaging: $85.0M unitranche</h1><div class="cover-rule"></div></div>
  <div class="cover-panel"><span class="cover-figure"><span data-fact="lev">2.9</span>x</span><span class="cover-figure-label">Pro forma gross leverage</span></div><div class="cover-meta">...</div></section>
```

**`.slide.divider`** (full-bleed) or **`.slide.divider.quiet`** (paper with an accent edge); parts **`.divider-no`**, **`.divider-title`**, **`.divider-list`** with **`li.on`**. Only in decks of 16 slides or more.
```html
<section class="slide divider" data-archetype="section-divider"><p class="divider-no">02</p><h2 class="divider-title">The plan pays back in two years</h2>
  <ul class="divider-list"><li>Performance</li><li class="on">Plan</li></ul></section>
```

## Layout

**`.grid-12`** with **`.span-2`** to **`.span-12`**: the 12-column grid; in the body it fills the height.
```html
<div class="grid-12"><figure class="exhibit span-7">...</figure>
  <div class="span-5">...</div></div>
```

**`.stack`**: a vertical group with the standard gap; **`.fill`**: the child box that takes the remaining height. `.fill` grows the box only: a table or `.summary-rows` inside it keeps its own height, so give the space to a chart, never to stretched rows.
```html
<div class="stack"><p class="lead">...</p>
  <figure class="exhibit fill">...</figure></div>
```

**`.two-exhibits`** (1:1) or **`.two-exhibits.wide-left`** (1.5:1): two exhibits on one message, side by side, filling the body.
```html
<div class="two-exhibits"><figure class="exhibit">...</figure>
  <figure class="exhibit">...</figure></div>
```

## Exhibits

**`.exhibit`** (a `<figure>`): caption, then one chart or table. It flexes to fill the body; a chart SVG inside scales to the box (aspect kept, so draw it at the box's shape: about 1164 x 450 full width, 700 x 450 beside a sidebar, 560 x 450 in a half). **`figcaption`** or **`.exhibit-head`** (*label*) holds **`.exhibit-no`**, **`.exhibit-title`**, **`.exhibit-unit`**.
```html
<figure class="exhibit"><figcaption><span class="exhibit-no">Exhibit 1</span><span class="exhibit-title">Revenue by fiscal year</span><span class="exhibit-unit">$ in millions</span></figcaption>
  <svg class="dm-chart" viewBox="0 0 1164 450" ...>(from charts.mjs)</svg></figure>
```

**`.chart`**: an optional wrapper for a chart plus its own inline note inside an exhibit.
```html
<figure class="exhibit"><figcaption>...</figcaption>
  <div class="chart"><svg class="dm-chart" ...></svg></div></figure>
```

**`.chart-takeaway`** with **`.takeaway`** (sidebar: `h3` *label*, at most 3 short bullets, **`.so-what`** line; decklint `wordy` checks it in lean decks).
```html
<div class="chart-takeaway"><figure class="exhibit">...</figure>
  <aside class="takeaway"><h3>What the bridge says</h3><ul><li>Volume added +5.2.</li></ul><p class="so-what">Network savings are the next lever.</p></aside></div>
```

## Numbers

**`.kpi-strip`** (set `--kpis: <n>`; never alone on a slide outside the exec summary: it sits above the exhibit its numbers come from or beside a takeaway, decklint `stat-only`) of **`.kpi`** (**`.hl`** for the one that matters): **`.kpi-value`** (with optional **`.u`** unit), **`.kpi-label`** (body tier), **`.delta`** (*label*) with **`.up`** / **`.down`** and **`.good`** when down is good.
```html
<div class="kpi-strip" style="--kpis: 3"><div class="kpi hl"><span class="kpi-value">4.6<span class="u">x</span></span><span class="kpi-label">Net leverage, LTM</span><span class="delta down good">0.4x vs FY24</span></div>
  ...</div>
```

**`.callout`** (accent rule, panel), **`.callout.dark`**, **`.callout.big`** with **`.callout-figure`**.
```html
<div class="callout big"><span class="callout-figure">$8.1M</span>
  <p>EBITDA added by reaching a 14.0% margin on FY25 revenue.</p></div>
```

## Tables

**`table.data`**: the data table, always at its natural height (rows are never stretched to fill: decklint `stretched-rows`). A table of 8 rows or fewer opens to about 40px rows at 16:9 by itself (the cap); `.compact` keeps it tight, `.airy` opens a longer one. A short table sits in a `.chart-takeaway` beside a sidebar, or in `.two-exhibits` beside the chart of the same numbers. Rows: **`tr.total`** (heavier rule), **`tr.strong`**, **`tr.sub`** (indented italic), **`tr.group`** (group heading), **`tr.hl`** (tinted), **`tr.unit-row`** (*label*). Cells: **`td.num`** / **`th.num`**, **`td.neg`**, **`td.hl`** / **`col.hl`**. Totals that decklint checks: `data-part` rows and a `data-total` row (`data-nosum` on a cell that does not add); see SKILL.md Step 6.
```html
<table class="data"><thead><tr><th>Line</th><th class="num">FY25</th></tr></thead><tbody><tr data-part><td>Contract</td><td class="num">251.3</td></tr><tr data-part><td>Spot</td><td class="num">108.9</td></tr>
  <tr class="total" data-total><td>Total</td><td class="num">360.2</td></tr></tbody></table>
```

**`table.harvey`** with **`td.hb-cell`** holding **`span.hb`** (`data-v` 0 to 4), **`tr.us`** for the subject row, and an **`.hb-legend`** (*label*) under it.
```html
<table class="harvey"><tbody><tr class="us"><td>Northwind</td><td class="hb-cell"><span class="hb" data-v="4" role="img" aria-label="4 of 4"></span></td></tr></tbody></table>
<div class="hb-legend"><span><span class="hb" data-v="0"></span>Weak</span><span><span class="hb" data-v="4"></span>Leading</span></div>
```

**`.status`** with **`.st-ok`**, **`.st-watch`**, **`.st-breach`**: a status dot and word inside a cell. State the rule for each colour in a footnote.
```html
<td><span class="status st-watch">Watch</span></td>
<td><span class="status st-ok">Pass</span></td>
```

**`.sources-uses`**: a two-column **wrapper** (not a table class) around two tables, each optionally in a `<div>` with an `h4` (*label*). Mark the tables `data-sources` and `data-uses` so decklint checks they total the same. Sources are cash: debt at net proceeds after OID and fees, with how any gap is funded (SKILL.md Step 6). Give both tables the same row count where you can so the totals share a baseline; never stretch rows to line them up.
```html
<div class="sources-uses"><div><h4>Sources</h4><table class="data" data-sources>...</table></div>
  <div><h4>Uses</h4><table class="data" data-uses>...</table></div></div>
```

**`.section-band`** (*label*): a full-width labelled bar at the top of the body naming the memo section (the `credit-memo` dial in ochre-covenant: Recommendation, Rationale, Risks, Mitigants), with an optional **`.band-note`**.
```html
<div class="slide-body"><p class="section-band">Rationale <span class="band-note">why the credit works</span></p>
  ...</div>
```

**`[data-ref]`**: a slide, page or exhibit cross-reference that is not a figure, so decklint does not ask for it in `facts.json`.
```html
<td class="num"><span data-ref>6, 11</span></td>
<p>Proved on <span data-ref>page 8</span>.</p>
```

## Logic and process

**`.summary-rows`** of **`.row`**: label column (**`.k`** *label* plus `h4`) and a paragraph. The SCR or numbered exec summary.
```html
<div class="summary-rows"><div class="row"><div><span class="k">Situation</span><h4>A profitable regional carrier</h4></div><p>Revenue reached $402.5M in FY25.</p></div>
  ...</div>
```

**`.matrix-2x2`**: four **`.quad`** (one **`.quad.hl`**), an **`.axis-y`** and an **`.axis-x`** (*label*).
```html
<div class="matrix-2x2"><div class="axis-y">Ability to win</div><div class="quad"><h4>Defend</h4><p>...</p></div><div class="quad hl"><h4>Invest</h4><p>...</p></div><div class="quad">...</div><div class="quad">...</div>
  <div class="axis-x">Market attractiveness</div></div>
```

**`.timeline`** (set `--steps`) of **`.tl-item`** (**`.now`** for today): **`.tl-date`** (*label*), **`.tl-text`**.
```html
<div class="timeline" style="--steps: 4"><div class="tl-item now"><span class="tl-date">This month</span><span class="tl-text">Investment committee</span></div>
  ...</div>
```

**`.chevrons`** (set `--steps`) of **`.chev`** (**`.on`** for the current phase), with an optional **`.chev-body`** of one `<div>` per phase under it.
```html
<div class="chevrons" style="--steps: 3"><div class="chev on">Approve</div><div class="chev">Diligence</div><div class="chev">Close</div></div>
<div class="chev-body" style="--steps: 3"><div>Committee vote</div><div>Quality of earnings</div><div>Signing</div></div>
```

**`.tombstones`** (set `--cols`) of **`.tomb`**: **`.tomb-name`**, **`.tomb-deal`**, **`.tomb-amt`**, **`.tomb-meta`** (*label*). Only deals the user supplied.
```html
<div class="tombstones" style="--cols: 4"><div class="tomb"><span class="tomb-name">Regional carrier</span><span class="tomb-deal">Sell-side adviser</span><span class="tomb-amt">$420M</span><span class="tomb-meta"><span>2024</span><span>Closed</span></span></div>
  ...</div>
```

## Lean slides (show it, do not say it)

Reach for these before a table or a paragraph in pitch, fund, investor and CIM decks (archetypes.md 38 to 45). Each counts as the slide's exhibit, so it needs a `Source:` line like any chart.

**`.speaker-notes`**: an `<aside>` inside the slide for detail and caveats that are said, not shown. Never rendered, never counted by `wordy`. (`.notes` is the footer wrapper for source lines; it is not speaker notes.) Sources, units and disclosures never move here.
```html
<aside class="speaker-notes">FY25 excludes the Q4 pilot; renewals are 18 of 20 contracts by value.</aside>
```

**`.takeaway-bar`**: the one line under a chart, table or diagram, in the field colour. Replaces a sidebar when one line says it.
```html
<figure class="exhibit">...</figure>
<p class="takeaway-bar">Investors are repaid before the company takes its full share.</p>
```

**`.big-compare`** of **`.bc-row`**: **`.bc-a`** (**`.bc-k`** *label*, **`.bc-fig`**, **`.bc-sub`**), **`.bc-arrow`**, **`.bc-b`** (**`.bc-fig`** in the highlight colour). Two or three rows fill the body.
```html
<div class="big-compare"><div class="bc-row"><div class="bc-a"><span class="bc-k">First</span><span class="bc-fig">$<span data-fact="aum1">1.0</span>T</span><span class="bc-sub">of AUM</span></div>
  <div class="bc-arrow"></div><div class="bc-b"><span class="bc-fig"><span data-fact="yrs1">25</span> years</span></div></div>...</div>
```

**`.ring-pair`**: two `ring` charts (`charts.mjs ring`, `{ "pct": 15, "center": "$150T+", "sub": "Global AUM 2022", "arcLabel": "15%", "size": 300 }`), each in a `<figure>` with a caption, and a **`.rp-arrow`** between.
```html
<div class="ring-pair"><figure>(ring svg)<figcaption>2022</figcaption></figure><div class="rp-arrow"></div>
  <figure>(ring svg)<figcaption>2032E</figcaption></figure></div>
```

**`cycle`** and **`flow`** diagrams: SVG from `charts.mjs` placed in an `.exhibit` like any chart. `cycle` `{ "steps": ["Disciplined investing", "Strong returns", ...], "highlight": 1, "width": 1164, "height": 400 }` (3 to 6 steps); `flow` `{ "steps": [{ "label": "Investors fund the note", "value": "$15M" }, ...], "highlight": 2, "width": 1164, "height": 260 }` (3 to 5 steps, 4 words each).
```html
<figure class="exhibit"><figcaption><span class="exhibit-title">How capital moves</span></figcaption>(flow svg)</figure>
```

**`.bracket`**: **`.br-from`** (**`.br-lead`**, an optional `.lead`), **`.br-mark`** (the chevron bracket, drawn in CSS), **`.br-to`** (**`.br-k`** *label*, a `<ul>` of outcomes each with a **`.br-fig`**).
```html
<div class="bracket"><div class="br-from"><p class="br-lead">Added a credit platform</p></div><div class="br-mark"></div>
  <div class="br-to"><span class="br-k">It enabled</span><ul><li>Private wealth<span class="br-fig">$12B</span></li></ul></div></div>
```

**`.col-row`** (set `--cols`, 3 to 5) of **`.cr-col`** (**`.hl`** for the one the title names): **`.cr-head`** (*label*, 3 words), **`.cr-fig`** (one proof number), **`.cr-label`** (8 words or fewer). Every column carries a number (gates R7).
```html
<div class="col-row" style="--cols: 4"><div class="cr-col hl"><span class="cr-head">Core offer</span><span class="cr-fig">$0</span><span class="cr-label">client capex on every plant</span></div>
  ...</div>
```

**`.col-row.big`**: the same row set as tiles that take the body height (each column a tinted well, the figure scaled to the row and centred with its label). For three to five short figures that are the slide's exhibit; it keeps `dead-band` and `empty-slide` clean without padding.
```html
<div class="col-row big" style="--cols: 3"><div class="cr-col hl"><span class="cr-head">The note</span><span class="cr-fig"><span data-fact="rate">15</span>%</span><span class="cr-label">annual interest, 18-month term</span></div>
  ...</div><p class="takeaway-bar">The ask: $50,000 to $2,000,000 per investor.</p>
```

**`.slide.statement`**: a full-bleed sentence on the field colour. **`.statement-text`** (one sentence, `.em` on the key phrase), optional **`.statement-sub`**, the usual `.slide-foot`. Exempt from `empty-slide` and `wordy`.
```html
<section class="slide statement" data-archetype="statement"><p class="statement-text">Clients pay for energy, <span class="em">never for the plant</span>.</p>
  <p class="statement-sub">Section 2 · Economics</p><footer class="slide-foot">...</footer></section>
```

## Brand override

`theme.mjs scaffold <slug> --brand <https://client-site | client deck.pdf | page.png>` appends a `:root` block after the theme's tokens (`brand.mjs` prints the same block). It sets the paper, ink, rules, accent (fill and text), field, cover and divider grounds, `--cover-accent` (the accent lifted to 4.5:1 on the field, for the cover kicker and statement emphasis) and the chart series, each contrast-checked. Never hand-edit it; re-run with another source.

## Open items

The one page that lists every gap: a slide with `data-archetype="open-items"` and one `table.data` (gap cells here do not count toward `gap-sprawl`).
```html
<section class="slide" data-archetype="open-items">...<table class="data"><thead><tr><th>Item</th><th>Slide</th><th>Closes it</th><th>Owner</th><th>Decision?</th></tr></thead>
  <tbody><tr><td>Build cost per use case</td><td class="num">10</td><td>Vendor quotes</td><td>CFO office</td><td>CHANGES THE DECISION</td></tr></tbody></table>...</section>
```
