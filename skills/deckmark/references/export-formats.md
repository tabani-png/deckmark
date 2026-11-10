# Export formats

What `render.mjs` writes, and what each format can and cannot carry. `deck.html` is the source of truth; every other format is rendered from it.

| Format | How | Notes |
| --- | --- | --- |
| PDF, 16:9 | `render.mjs deck.html --out out/` | 1280 x 720 pages at 96 dpi (13.33 x 7.5 in), vector text, fonts embedded, backgrounds printed. The default handoff. |
| PDF, A4 report | `<body data-format="report-a4">` (scaffold `--format report-a4`) | 210 x 297 mm pages; the test suite checks the MediaBox. For US Letter, set the theme's `@page` size and say so in the Picks block. |
| PNG pages | written with every render (`page-NN.png`, 1x) | the review copies; `--hires` adds `page-NN@2x.png` for email and print proofs. `--pages 1-2` writes PNGs only, no PDF (the fast first look). |
| PPTX | only when asked: `python3 ~/.claude/skills/cim-builder/assets/make_pptx.py` on the PNGs | see § PPTX limits |
| HTML | `deck.html` with `tokens.css` and `base.css` beside it | opens in any browser; offline when built offline. Not a web page: no responsive layout, no script. |

## Print

- Backgrounds print (`printBackground`), so a dark cover prints dark; for a deck that will be printed on an office printer, prefer a light cover posture and say so.
- Minimum sizes are set for print: 9px furniture at 16:9 is about 6.75pt on a landscape A4 sheet, the smallest a reader holds at arm's length. Never go under them to fit.
- Hairlines under 0.75px vanish on some printers; base.css draws rules at the theme's `--rule-w` (1px or more).
- A4 tables break only between rows; repeat the header row on the next page.

## PPTX limits

The PPTX route places each rendered page as a full-slide picture. Say this to the user before handing it over:

- **Not editable.** Text, numbers and charts are pixels; a reader cannot change a figure, search the text or copy a table.
- **No speaker notes** unless the builder adds them from `<aside class="speaker-notes">`.
- **Fidelity is exact** (it is the render), and file size grows with page count (about 150 to 400 KB a slide at 2x).
- When the client must edit the deck in PowerPoint, Deckmark is the wrong tool for the final file: build and review in Deckmark, then rebuild the approved deck natively (the `officecli` or `pptx` skills) using the same facts.json, and re-run the tie-out on that file.

## Offline and confidential

A confidential build (preflight `"confidential": true` or `scaffold --offline`) makes no network request: no Google Fonts link, system font stacks only (`fonts.md`). Renders run locally in Chromium; nothing leaves the machine. Never upload client renders to a web tool for conversion.

## File names

`out/deck.pdf` and `out/page-NN.png` by default; `--name <stem>` changes the stem (`--name Project-Harbor-IC-v3`). The handoff names the PDF path and the page count.
