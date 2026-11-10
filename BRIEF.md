# Deckmark: build brief (shared by every agent on this build)

## Goal
A Claude Code skill, `deckmark`, that makes finance-grade decks and PDF reports that look designed, not generated:
strategy decks, CIMs, teasers, pitch books, IC memos, credit memos, LP letters, investor-day decks, board packs,
public-sector reports. Audience: finance professionals (PE, private credit, IB, asset management, CFOs,
family offices, wealth, public sector).

## Architecture (reverse-engineered from Hallmark, MIT, https://github.com/Nutlope/hallmark)
Hallmark = a hard Floor of non-waivable rules + Reflex gates (waivable on the record) + Finish checks, a Flow
(pre-flight, ask once, shape, deal a theme, load, Picks block, build, sweep), a catalog of themes (one .md of tokens
and rules + one .jpg picture each), a dealer script that picks 3 themes per prompt and rotates against a log,
a draw for structure, a linter that runs in a real browser, and a fresh-context reviewer.

Deckmark maps it to decks:
| Hallmark | Deckmark |
|---|---|
| theme (material) | house style: tokens + type + slide furniture + chart rules |
| macrostructure (page shape) | storyline: SCR strategy deck, CIM, teaser, IC memo, pitch book, board pack, ... |
| sections | slide archetypes: exec summary, KPI strip, waterfall, 2x2, harvey table, timeline, ... |
| job (subscribe, book) | the decision the deck drives: approve, invest, lend, buy, fund, adopt |
| sloplint | decklint: overflow, clipped text, min font size, action-title length, source line on every exhibit, tokens only, number tie-out |
| genre | field: consulting, banking, asset-mgmt, credit, PE, public-sector, editorial, dashboard |

Output: HTML slides (1280x720, or A4/Letter report pages) → Playwright → PDF + per-page PNG (+ optional PPTX).

## Theme file format (references/themes/<slug>.md)
```
---
name: <Original name, never a firm name>
slug: <kebab>
field: consulting | banking | asset-mgmt | credit | pe | public-sector | editorial | dashboard
format: slides-16x9 | report-a4 | both
paper: light|mid|dark <L> <hue>
display: <class> <font family>      # Google-fonts or system fonts only
accent: <warm|cool|neutral> <hue>
density: sparse | medium | dense
keywords: comma list used by the dealer
inspired_by: what kind of real document (e.g. "top-tier strategy consultancy research report"), generic, no firm name
pictured: <storyline it is pictured with>
---
# Name
One paragraph: what it feels like and what it is never.
## Tokens   (one :root css block, oklch or hex, every colour + font + radius + rule)
## Type     (display/body/figures/labels/footnotes, sizes in px at 1280x720)
## Slide furniture (action title, tracker/breadcrumb, exhibit number, source line, footer, page number, confidentiality)
## Exhibits (chart style: bar fills, gridlines, labels on bars, legend place, highlight rule, table style)
## Dials    (2-3 variations, stated in the stamp)
## Never    (the tells that break this style)
```
Theme names are original. Never put a firm's name, logo or trademark in a theme. "Inspired by" stays generic.

## Rules every agent keeps
- Never invent a number, quote, logo or client in any output. Sample decks use clearly fictional companies.
- Public reference decks are style evidence only. Do not copy their text or logos into the skill.
- No image generation. Charts are SVG/HTML drawn from data.
- Plain English in notes. No em dashes in shipped copy.
