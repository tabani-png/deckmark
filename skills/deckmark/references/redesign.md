# Redesign and audit

Loaded only on the verbs: `redesign <deck>` (rebuild an existing deck lean, in brand, keeping every fact) and `audit <deck>` (a report). A request that edits an existing client deck in its own system (fix a typo, change a chart, add a slide) is not a redesign: do it as asked, in that deck's files.

A redesign is a build whose material is the deck that exists. SKILL.md still binds; this file says what the run keeps, what replaces the Step 1 ask and what the sweep adds. The source may be a PDF, a PPTX or an HTML deck.

## What a redesign keeps

- **Every figure.** Each number the old deck prints is either printed in the new deck (in `facts.json`, wrapped in `data-fact`) or put on the record in `dropped.json` with a reason (`duplicate of the p16 total`, `chart label rounded from the p17 table`). `redesign.mjs kept` fails any figure that is neither.
- **Every fact and claim** as found: names, dates, terms, quotes, the claims the client makes. A claim a gate doubts (a market share with no source) is carried as found and listed for the client to confirm; it is never silently fixed, cut or improved.
- **Required language verbatim:** disclaimers, safe-harbour text, risk factors, offering legends. They may move to a `disclaimer` page; they are never reworded or shortened.
- **The brand,** when the deck has one: its paper and colours, measured from the deck itself (`brand.mjs`), never from memory (`direction.md` § 3).

What changes: the storyline, the slide count, the titles (to action titles from the facts already there), the exhibits (prose to a chart, diagram or column row), the system (type, furniture, the grid). Nothing is added: no figure, claim, logo, quote or section the old deck did not have, beyond what the user hands over.

## Depth

The verb is a **full** redesign. A lighter depth runs only when the request says so, and the Picks block names it:

| Depth | Stays | Changes | Only when the request says |
| --- | --- | --- | --- |
| **full** | every figure, fact and required text; the brand | storyline, slide count, titles, exhibits, system | nothing else: it is the verb |
| **restyle** | the slide order and each slide's content | the system: type, colour, furniture, chart style | *keep the structure*, *restyle*, *same slides, new look* |
| **polish** | the system, the structure, the words | only what a gate names: overflow, contrast, tells, tokens | *polish*, *only fix what looks generated*; HTML decks only |

A PDF or PPTX cannot be polished in place; offer `audit` or a restyle.

## Before

1. **Record the deck as it stands:**

```
node <dir>/scripts/redesign.mjs extract <old deck.pdf|.pptx|.html> --out .deckmark/redesign
```

It writes `record.json` (every page: title, text, word count, every figure), `facts.draft.json` (one candidate fact per figure, its page as the source, the line it sits in as context), `STORYBOARD.draft.md` (one ghost line per source page with a guessed archetype), an empty `dropped.json`, and `before/page-NN.png` (PDF and HTML sources; for a PPTX, export it to PDF first for pictures and the brand).

2. **Look at the before pages, then give the read in four lines:** what the deck is for (reader, decision); what works and stays (at least one thing); what reads as generated or crowded (by gate: wordy pages, prose tables, topic titles, missing sources); what is broken (figures that do not tie, a total that does not add; these go on open items, never silently corrected).
3. **The brand:** `node <dir>/scripts/brand.mjs <old deck.pdf> --pages 1-8`.

**`audit <deck>` stops here,** as a report: `node <dir>/scripts/redesign.mjs audit <deck>` (an HTML Deckmark deck goes through `decklint --render`), then `gates.md` § 3 and § 5 walked against the page images: findings by tier, page by page, the lightest depth that would settle them and what only a full redesign would. It changes no file.

## The ask

One message replaces the Step 1 ask; skip it when the request answers it or no one can:

> *Before I redesign, three things. 1. **What must stay**: the brand, a section, the slide order? Say *keep the structure* and I only restyle. 2. **Who reads it now and what they decide**, if that changed. 3. **Anything new**: updated numbers, a model, a source for a figure the deck states without one. Or say **go ahead** and I will rebuild it in full, keeping every figure.*

## The plan

The Picks block opens with four rows of its own:

```markdown
- **Redesign** · full · 23 source pages to 18 slides · fund-pitch, lean
- **Before** · median 144 words a page · 16 pages flagged (wordy, prose tables, no source line on 9)
- **Keeps** · 340 figures, the safe-harbour text verbatim, the navy and red brand
- **Dropped** · none yet (each one goes in dropped.json with its reason)
```

Then the usual rows. The deal's `--prompt` is the read's first line in plain nouns, never the old deck's own copy.

## Build

1. **Facts first.** Confirm each draft fact against its source page: rename the id, set the unit, add a `formula` for derived figures, delete `context` and `status`, move it to `deck/facts.json`. A figure that will not print goes in `dropped.json` with a reason of two words or more.
2. **The spine.** Rewrite `STORYBOARD.draft.md` into `.deckmark/STORYBOARD.md`: pick the storyline closest to the document (`storylines.md`), merge source pages that make one point, turn each title into an action title from the facts on that page, mark statuses. A slide count well under the source's is normal: a lean redesign of a 23-page deck often lands at 15 to 18.
3. **Scaffold in brand:** `theme.mjs scaffold <slug> --out deck --storyline <slug> --dealt "..." --draw <seed> --brand <old deck.pdf>`.
4. **Build** as SKILL.md Step 6: cover and exec summary first, reviewed; generators welcome (`.deckmark/build.mjs`).
5. **Questions the old deck raises** (figures that do not reconcile, undefined terms) go to the open-items page, or, when the user prefers an issuer-clean deck, to `.deckmark/QUESTIONS.md` with one tag each (CHANGES THE DECISION / WORTH A QUESTION / EXPLAINED BY CONTEXT). The deck prints the source's figures as stated, with `data-nosum` on totals the source prints but that do not add, and a footnote saying so.

## After

1. The sweep, as always (`decklint --render --strict --facts`).
2. **The kept check:** `node <dir>/scripts/redesign.mjs kept .deckmark/redesign/record.json deck/deck.html --facts deck/facts.json`. Every `FAIL kept` is restored or added to `dropped.json` with its reason. A figure the new deck shows rounded (a chart label of 384 for 384.2) counts as kept only when its full value is a fact the deck prints; otherwise drop it on the record.
3. **Compare:** `node <dir>/scripts/redesign.mjs compare .deckmark/redesign/before deck/out --out .deckmark/redesign/compare.html`; give the user its path.
4. **The finish review** also gets the before pages and answers what the old deck did better (`review-finish.md`).
5. **The log entry** carries `"mode": "redesign"` and `"depth"`.
6. **The handoff:**

```
Redesign · full · 23 pages to 18 slides
Before   median 144 words a page · 16 pages flagged
After    Floor 0 FAIL · Reflex 1 waived
Kept     340/340 figures (12 dropped on the record, listed) · safe-harbour text verbatim
Changed  storyline, titles, exhibits, system
Yours    8 questions for the issuer in QUESTIONS.md · 2 claims carried as found
Compare  .deckmark/redesign/compare.html
```
