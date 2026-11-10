# Storylines

Thirteen document shapes. Each file gives the reader and the decision, the length, a **Short form** for thin material, the slide **Order** with the archetype each slide uses, a **Lean form** where the genre reads lean, what practitioners expect that a model forgets, the honesty rules, how it ends, the density and the **Words** budget decklint reads. **Read only the one file you pick**; the index line is enough to choose.

## The index

- **scr-strategy** · the consulting answer deck: governing thought, three to five claims, evidence under each. [`storylines/scr-strategy.md`](storylines/scr-strategy.md)
- **cim** · the sell-side information memorandum after an NDA: the full, named business for a buyer's IOI. [`storylines/cim.md`](storylines/cim.md)
- **teaser** · the blind one-to-two pager before an NDA: fit to the mandate in two minutes. [`storylines/teaser.md`](storylines/teaser.md)
- **pitch-book** · the bank's deck to win a mandate or frame strategic options. [`storylines/pitch-book.md`](storylines/pitch-book.md)
- **ic-memo** · the deal team's case to the investment committee: recommendation first. [`storylines/ic-memo.md`](storylines/ic-memo.md)
- **credit-memo** · the lender's case: how much, on what terms, how it is repaid, what protects it. [`storylines/credit-memo.md`](storylines/credit-memo.md)
- **dd-report** · the adviser's financial or commercial due diligence findings. [`storylines/dd-report.md`](storylines/dd-report.md)
- **fund-pitch** · the GP's fundraising deck to LPs. [`storylines/fund-pitch.md`](storylines/fund-pitch.md)
- **lp-letter** · the GP's quarterly report to limited partners. [`storylines/lp-letter.md`](storylines/lp-letter.md)
- **board-pack** · the finance section of a board meeting: actual vs plan, outlook, decisions. [`storylines/board-pack.md`](storylines/board-pack.md)
- **investor-day** · a listed company's capital markets day: strategy, segments, targets. [`storylines/investor-day.md`](storylines/investor-day.md)
- **wealth-review** · the periodic review for a family or its investment committee. [`storylines/wealth-review.md`](storylines/wealth-review.md)
- **public-sector-review** · a value-for-money or programme review of public money. [`storylines/public-sector-review.md`](storylines/public-sector-review.md)

## How to pick

1. **The document the user named wins** (CIM, credit memo, board pack). A document type with no storyline of its own takes the nearest one and says so: a convertible-note offering deck is `fund-pitch` adapted (an issuer raising money from investors); a lender update is `board-pack` turned to the lender; a teaser for a minority stake is `teaser`.
2. **Else the reader decides,** through the field (`fields.md`): IC → `ic-memo`; lender → `credit-memo`; buyer → `cim` or `teaser`; LP → `fund-pitch` or `lp-letter`; board → `board-pack`; client strategy → `scr-strategy`; ministry → `public-sector-review`; family → `wealth-review`.
3. **Torn between two,** take the one whose **Reader and decision** line names the decision the user's reader actually makes; a judgment document (`ic-memo`, `credit-memo`, `dd-report`) when the reader approves or declines, a story document when the reader invests attention.
4. **Material sets the length.** When the material carries only part of the storyline, build its **Short form**: only the slides the material carries, and every section left out listed on the open-items page with what would let you build it. Cutting the slide count is the honest fix for thin material; a half-empty slide never is.

## Order is not structure

The storyline orders the argument; the draw deals the structure a model converges on when left alone, so two decks of one storyline do not look alike. The deck's fingerprint, one choice per axis:

| Axis | Choices (dealt by `theme.mjs draw`) |
| --- | --- |
| Cover | dark full-bleed · light with an accent rule · split with one key figure · typographic · accent band |
| Exec summary | SCR rows · numbered answer-first rows · KPI strip over three claims · one-line answer over three boxes · argument left, figures right |
| Chart emphasis | one highlight bar · annotated change · ranked horizontal bars · small multiples · table-led with sparklines |
| Titles | answer-first sentence · sentence plus unit line · tracker over one line |
| Dividers | full-bleed with contents · quiet paper with an accent edge · none (tracker only) · number with the section's question; only at 16 slides or more |
| Close | the decision asked · next steps with owners and dates · the numbers that must be true |
| Lead exhibit | the first chart or table after the exec summary, rested against the last decks in the log |

Take every pick unless the material refuses it; each pick not built is a swap, named in the Picks block with its reason. When an archetype has no component (an issue tree, an org chart, a gantt), build it from components that carry the same logic (an issue tree as `.summary-rows` or a two-level `table.data` with `tr.group` rows) and log the swap. A harvey table needs a scoring basis from the material; with none, set the comparison as plain text in a `table.data` and log the swap.

## The spine

`.deckmark/STORYBOARD.md`: the governing thought (one sentence the deck proves), then one line per slide, the ghost deck:

```
NN · <status> · <action title> · <archetype> · <exhibit and its numbers> · <source>
03 · confirmed · Revenue compounded at 8.9% a year since FY21 · chart-takeaway · bar, FY21-FY25 revenue · audited accounts p4
07 · in progress · Pricing adds 3.1 of EBITDA in FY25 · waterfall-bridge · bridge, FY24-FY25 · model tab Bridge (fuel line pending)
11 · missing · <the claim this slide would make> · financial-summary-table · needs: customer cohort data · none yet
```

Status is `confirmed` (every number sourced, slide built), `in progress` (a number or check outstanding, say which) or `missing` (the material cannot carry it; its gaps go to the open-items page, the slide is not built). Status lives in the storyboard and the handoff, never on the slide. Read the titles alone top to bottom before building: if they do not tell the story, rewrite them first.
