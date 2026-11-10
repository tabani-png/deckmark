# Direction

How the deck's house style is chosen and justified. Read at Step 3. A theme is a material (palette, type, furniture, chart style); it never sets the slide order, which is the storyline's.

## 1. The order of authority

The first match wins.

1. **A `DECK.md` at the project root** (a locked house system, `house-system.md`): build in it. No deal, no brand extraction; the variety rule inverts (decks share the system).
2. **The user named a theme** (`theme <slug> <brief>`, or the name in the prompt): scaffold it; the stamp says `by request`.
3. **The client has a brand** (their website, their deck, a brand guide, colours they gave): deal for paper and register, then re-skin with `brand.mjs` (§ 3). The client's website is the default source: it is the brand they show the world.
4. **The user named a look** ("like a strategy firm", "bulge bracket", "Nordic public report", "the dashboard picture"): `theme.mjs deal` with that phrase in `--prompt`; pick the closest of the three.
5. **Everything else deals:** `theme.mjs deal --field <field> --format <slides-16x9|report-a4> --prompt "<the brief>" --log .deckmark/log.json`.

## 2. Picking from the deal

The deal returns three themes that fit the field and the prompt and clear the last three decks in the log. Then:

1. **Open all three pictures** (`references/themes/<slug>.png`), not only the favourite, side by side.
2. **Read them against the reader**, not your taste. An IC reads dense tables at a glance: a banking or PE theme with tight tables. An LP reads a story with one figure a page: an asset-management or editorial theme. A board reads a scorecard: a dashboard theme. A ministry reads a report: a public-sector theme.
3. **Check the paper** against the brand and the room: a deck printed for a credit committee wants light paper; a dark theme only when the brand is dark or the user asks.
4. **Say it in one line** naming the other two: *Ledgerline, dealt 2/3: dense banking tables and a navy field suit a credit committee; Glasswork is too sparse for covenant tables, Midnight is dark paper for a printed pack.*
5. **Load only that theme file.** Re-deal only when asked (`--reroll 1`); when every theme has been shown, the deal says so and stops (it never loops).

The justification is the reader and the material, never "it looks modern". A pick that fails the material (a sparse theme for a 40-row comps table) is a swap, named in the Picks block.

## 3. Client brand

When the client has a website, a deck of their own or a clear brand, the deck wears the client's paper, colours and fonts.

**Which source.** The client's public website first (the domain in their email, their deck's footer or the material): it is the current brand and it is public, so reading it sends no client figures anywhere. Their own deck second, when there is no site or the site is a placeholder. When both exist and disagree, the website wins and the Picks block says so. A confidential deck still renders offline: the website is read once at scaffold time, and offline mode keeps only the system fallbacks of the site's font.

1. `node <dir>/scripts/brand.mjs <https://their-site | their deck.pdf | page PNGs> [--pages 1-8]` measures the paper (light or dark), the ink and the brand colours by flat area (panels, bars, table heads; photographs do not count), gives each a role (field = the dark brand colour for panels, table heads and the cover; accent = the brighter one for the highlight) and checks each pair (ink 7:1, muted and accent text 4.5:1, accent fills 3:1), darkening or lightening until they pass.
2. Pick the theme closest in **paper** and register to the brand: a white deck in navy and red gets a light-paper theme. Re-deal with `--prompt "<brief>, light paper"` if all three are dark.
   On a website it screenshots the page at 1280 wide in headless Chromium and also reads the heading and body fonts. When two dark colours compete (navy and oxblood), the one with more area is the field.
3. Scaffold with `--brand <the same URL or file>`: the override block lands in `tokens.css` after the theme's tokens, the site's fonts go first in the theme's font stacks (a Google family loads; any other falls back to the theme's), and the stamp records it.
4. The Picks block says it: `Brand · client website · light paper, field #13447d, accent #990000, Montserrat · theme <name> chosen for light paper`.

**Never a brand colour from memory.** A hex recalled from training data is confidently wrong. Colours come from the client's website or own file (measured by `brand.mjs`), from values the user types, or from a brand guide in the material. With none of these, ask once: *I will not guess brand colours. Send your website address, paste the hex values or send a page of your deck, or say "no brand" and I will deal a house style.*

## 4. Firm marks

A theme may be inspired by a kind of firm (a strategy house, a bulge-bracket book, a Nordic asset manager). It never carries that firm's name, logo, wordmark or trademark colours as a claim, and theme names and `inspired_by` lines stay generic (`theme.mjs check` fails a theme that names a real firm). A client's own marks appear only when the client supplied them for this deck.

## 5. Without Node

Pick from `references/themes/index.json` by hand (field, format, paper, density), look at the picture, and stamp `deal: manual`. Tokens come from the theme file's `## Tokens` block, copied into `tokens.css` as written.
