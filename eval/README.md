# Deckmark eval harness

Repo-internal tooling that measures the skill end to end on the real Claude Code CLI: 8 fictional briefs x 3 model arms, each cell a fresh headless run with only the skill and the brief's material, then rendered, linted, checked against the brief's `expect` block, judged from the pictures and laid out in one gallery. Modelled on Hallmark's `eval/` (MIT); the unit tests of the engine itself stay in `test/` (`npm test`).

Nothing here ships with the skill. All companies, people and figures in `briefs/` are fictional.

## Files

| File | Role |
| --- | --- |
| `briefs.json` | The 8 briefs. Each has `brief` (the prompt after `/deckmark`), `document`, and `expect.checks`: machine checks run on the built deck (types below). |
| `briefs/<id>/material/` | The material copied into the cell. `briefs/<id>/src/` holds the HTML source of binary material and is never copied. |
| `make-material.mjs` | Rebuilds `restyle-client-deck/material/marlow-q3-board.pdf` and `pitch-brand/material/brand.png` from `src/` with the skill's `render.mjs`. Outputs are committed. |
| `models.json` | The arms (`default` = no `--model`, `sonnet`, `haiku`), the judge model, run defaults and the cost estimate. |
| `gen-cli.mjs` | Generation. Per cell: copies `skills/deckmark` into `runs/<brief>/<arm>/work/.claude/skills/deckmark` and the material into `work/material/`, runs `claude -p "/deckmark <brief> ..."` with `cwd` = `work/`, `--output-format stream-json`, timeout and concurrency, and writes `prompt.txt`, `transcript.jsonl`, `stderr.txt`, `run.json`. `--dry-run` prints the commands. `--repair-round N` re-prompts cells that are not strict-clean with their decklint findings. |
| `render-cells.mjs` | `render.mjs` on each cell's deck into `runs/.../render/` (PDF + page PNGs), contact sheet with `test/sheet.py`, copies cover and sheet to `_shots/`. |
| `score.mjs` | `decklint --render --strict --facts --json` per cell (`lint.json`) and the `expect` checks and word stats (`score.json`). |
| `judge.mjs` | Vision judge through the CLI, read-only. Reviewer prompt = the skill's own finish review (`references/review-finish.md`, or `gates.md` § 6 on v0.5) plus six axes 1-5 (story, hierarchy, chart craft, restraint, specificity, looks-like-a-real-firm) and overall 1-10. Writes `judge.json` (+ `judge-raw.json`). |
| `report.mjs` | `eval/index.html`: per-arm summary, then a row per brief and a card per arm (cover, lint chips, expect pass count with the failed checks, judge verdict and score, cost, turns). |
| `serve.py` | Serves `eval/` on `http://127.0.0.1:4202` (loopback only). |
| `run-matrix.mjs` | gen -> render -> score -> repair rounds -> judge -> report. |
| `lib/` | The pure parts: command lines (`cli.mjs`), transcript and conformance (`transcript.mjs`), expect checks and scoring (`expect.mjs`), judge prompt and parser (`judge.mjs`), gallery (`report.mjs`). |
| `test/` | `node --test` suite (`npm run eval:test`). A fake `claude` (`test/fake-claude.mjs`) replays a recorded-shape stream-json transcript (`test/fixtures/transcript.jsonl`) and a judge envelope, so the whole pipeline is tested with no model call. |
| `herdr/` | Archive of the two manual rounds before this harness (below). |
| `runs/`, `_shots/`, `index.html` | Generated, gitignored. |

## The briefs

| id | Document | What it tests (machine checks) |
| --- | --- | --- |
| `oid-credit-memo` | credit memo | $85.0M at 98.0 raises 83.3: sources show net 83.3 (or face less a 1.7 OID line), fact 83.3 present, flag tags, open items name the QoE |
| `thin-cim` | CIM | one-page material: Short form 6-16 slides, open items name customers, management and market, no invented market share |
| `metric-temptation` | Series B deck | NRR and CAC payback asked for but absent: gap marker beside each, no figure printed against them, no such fact, listed on open items |
| `restyle-client-deck` | `redesign` of a client PDF | `redesign.mjs` record and `dropped.json` written, brand in the stamp, light paper, `--field` near the client navy |
| `dark-investor-day` | capital markets day | investor-day storyline, dark paper, mean words a content slide <= 80, targets printed as ranges |
| `a4-report` | value-for-money review | `report-a4` format, public-sector-review storyline, the benchmarking recommendation |
| `board-pack` | monthly board pack | board-pack storyline, `data-total` rows, the capex decision |
| `pitch-brand` | M&A pitch book | pitch-book storyline, brand in the stamp from `brand.png`, light paper, `--field` near #0E5A4F |

Every brief also runs `factsInMaterial`: each non-derived fact in `facts.json` must equal or round from a number in the material (at the same scale or a thousand either way); derived figures must carry a `formula`. One unmatched fact is tolerated.

Check types (`lib/expect.mjs`): `format`, `storyline`, `slides`, `stamp`, `paper`, `tokenNear`, `textIncludes`, `textExcludes`, `openItems`, `gapNear`, `noFigureNear`, `factsNoKey`, `factDisplay`, `factsInMaterial`, `sourcesNet`, `hasTotals`, `wordsMeanMax`, `fileExists`.

## What `run.json` records

From the transcript: model, cost, turns, duration, stop reason, tokens, permission mode, tools advertised outside the allowlist (must be empty), MCP tools (must be empty), permission denials, tool counts and errors; every `theme.mjs` deal/draw/scaffold/log, render, brand, `redesign.mjs` verb and decklint run, whether a full `--render --strict --facts` lint ran and whether the last one passed. **Load order**: one storyline, three theme pictures opened before one theme file, the storyline before the theme, every file Step 4 of the copied `SKILL.md` names after "Exactly:" read before the scaffold or the first `deck.html` write, and no read of a skill copy outside the cell (a leak from `~/.claude/skills`). From the files: the stamp and its fields, `preflight.json` with all seven keys, `STORYBOARD.md` and its ghost-line status counts, facts and formulas, `log.json`, the self-review and tie-out notes, rendered PNGs. Also the skill version, repo commit and whether `skills/` was dirty when the cell ran.

## Permissions

Every generation cell runs:

```
claude -p "<prompt>" --output-format stream-json --verbose --permission-mode acceptEdits \
  --tools Read,Write,Edit,Glob,Grep,Bash \
  --allowedTools "Read,Write,Edit,Glob,Grep,Bash(node *),Bash(python3 *),Bash(pdftoppm *),Bash(pdftotext *)" \
  --strict-mcp-config --setting-sources project --no-session-persistence --max-budget-usd 15 [--model sonnet|haiku]
```

with `cwd` = the cell's `work/`. The judge runs `--tools Read --allowedTools Read --permission-mode dontAsk` with `cwd` = the cell folder. `lib/cli.mjs` refuses to build any command with a bypass mode or a skip-permissions flag, and the tests check it. The child env drops `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL` and the host session's `CLAUDECODE` / `CLAUDE_CODE_*` variables, so cells run on the logged-in subscription; `--use-api-key` keeps the key. The harness never reads or prints a key.

Known limits: `Bash(node *)` lets the agent run any node script, which the skill needs (its tools are node scripts). The skill's step 7 subagents are not available (no Agent tool), so the prompt asks the agent to write the review and tie-out itself to `.deckmark/review.md` and `.deckmark/tieout.md`. Skills do not auto-trigger in `claude -p`, so the prompt invokes `/deckmark` by name: this measures conformance, not triggering. The cell sits inside this repo, so Claude Code also loads parent `CLAUDE.md` files above `eval/runs/`.

## How to run

Run from a terminal where `claude` is logged in (not from inside another Claude Code session). Each cell takes 10-30 minutes.

```sh
# See every command, nothing spawned
node eval/run-matrix.mjs --dry-run

# One real cell, end to end (gen, render, score, judge, report)
node eval/run-matrix.mjs --brief oid-credit-memo --arm sonnet

# The full matrix: 8 briefs x 3 arms, two cells at a time, one repair round
node eval/run-matrix.mjs --repair 1 --concurrency 2

# Browse
python3 eval/serve.py        # http://127.0.0.1:4202/index.html
```

Other knobs: `--tag v06` (separate cells per skill version: `runs/<brief>/<arm>-v06/`), `--force` (redo cells that have a `run.json`), `--timeout-min 45`, `--budget-usd 15` (per cell, passed as `--max-budget-usd`), `--max-turns N`, `--effort high`, `--judge-model opus`, `--skip-gen` (re-render, re-score, re-judge existing cells), `--skip-judge`.

Stages one at a time:

```sh
node eval/gen-cli.mjs --brief thin-cim --arm haiku
node eval/render-cells.mjs --brief thin-cim
node eval/score.mjs --brief thin-cim --force
node eval/judge.mjs --brief thin-cim
node eval/report.mjs
npm run eval:test            # the harness's own tests, no model call
```

## Cost estimate

API-equivalent per cell, from the size of the herdr rounds (12-17 slides, 2-4 renders, 3-6 lint runs, every PNG read back); replace with the measured `costUSD` after the first cells (`models.json` → `costEstimateUsd`):

| Arm | Per cell | 8 briefs |
| --- | --- | --- |
| `default` (Opus-class) | $4-10 | $32-80 |
| `sonnet` | $2-5 | $16-40 |
| `haiku` | $0.5-1.5 | $4-12 |
| judge (per cell) | $0.1-0.4 | $2.4-9.6 for 24 cells |

Full matrix, no repair: about **$55-140** and 4-6 hours at concurrency 2. A repair round adds $0.5-3 per cell it touches. One cell: $2-10. On a Claude subscription these are usage, not a bill; `--max-budget-usd` (default 15) still caps each cell.

## Archive: the manual herdr rounds (`herdr/`)

Before this harness, each run was a fresh agent in a herdr pane (a terminal multiplexer for coding agents) with only the skill and one brief (`material.md`): a fictional company with real-looking figures, a reader and a decision. The agent ran the whole flow (pre-flight, ask-once answered by the brief, storyline, deal, draw, build, render, `decklint`, a fresh-context review and an independent tie-out against `material.md`) and wrote `RESULT.md`: the theme and why, slide count, lint outcome, review verdict, tie-out counts, and every place the skill was unclear, wrong or missing, with file and line.

| Case | Document | Reader and decision |
| --- | --- | --- |
| Northbay Dental Partners | sell-side CIM summary | PE sponsors in round one; submit an indication of interest |
| Halden Packaging | private credit memo | credit committee; lend |
| Lakeshore Mutual Bank | SCR strategy deck on AI in finance | CFO and executive committee; approve the roadmap and budget |

### Round 1 (v0.1): `herdr/cim`, `herdr/credit-memo`, `herdr/strategy`

| Case | Theme | Slides | Lint | Review | Tie-out |
| --- | --- | --- | --- | --- | --- |
| CIM | Quiet Mandate | 15 | PASS | fix | 137 figures, 0 mismatch, 2 unsupported (fixed) |
| Credit memo | Ochre Covenant | 17 | PASS | fix | 115 figures, 1 rounding mismatch (fixed) |
| Strategy | Meridian | 14 | PASS | fix | 126 figures, 0 mismatch, 15 unsupported (recommendations and counts, not source figures) |

What it found: the scripts exited silently when run through a symlinked skill folder; decklint's body-text minimum disagreed with the gates; sources and uses and derived figures were documented but not checked by machine (the credit memo passed lint with a sources and uses gap); title length rules disagreed between files; the draw could deal dividers for a 15-slide deck. All fixed in v0.2.

### Round 2 (v0.2): `herdr/r2-cim`, `herdr/r2-credit-memo`, `herdr/r2-strategy`

| Case | Theme | Slides | Lint | Review | Tie-out |
| --- | --- | --- | --- | --- | --- |
| CIM | Quiet Mandate | 12 | PASS `--strict` | fix | 127 figures, 0 mismatch, 1 unsupported (fixed) |
| Credit memo | Ochre Covenant | 13 | PASS `--strict` | fix | 103 figures, 0 mismatch, 0 unsupported |
| Strategy | Meridian | 11 | PASS | fix | 97 figures, 0 mismatch, 10 unsupported (team proposals, not source figures) |

The decks were shorter because the agents cut to what the material could carry and listed the rest on one open-items page. The credit memo's first lint returned 27 FAILs (cover overflow, contrast on a dark cover, overlapping rows, figures that did not tie, a covenant cushion off by 0.1) that were fixed at the root. What it found: the scaffold example omitted `--dealt` and `--draw` was ambiguous; the `cfo` field was documented but rejected; the `data-fact` example put units inside the span; slide cross-references were flagged as untraced; `hbar` labels overflowed; the draw dealt a split cover with no component for it; gap markers failed contrast on dark grounds; nothing said to re-run the tie-out after review fixes. All fixed in v0.3.

### Files in each herdr run

- `material.md`: the brief.
- `RESULT.md`: the agent's report.
- `facts.json` (at the run root or in `deck/`): every printed figure with its source or formula.
- `deck/deck.html`, `deck/tokens.css`, `deck/base.css` and any chart SVGs: the deck as built.
- `deck/out/deck.pdf`: the final render. Per-page PNGs are not kept in git; re-render with `node skills/deckmark/scripts/render.mjs eval/herdr/<run>/deck/deck.html --out <dir>`.

The reports quote paths as they were at the time: the skill then lived in `skill/deckmark/` (now `skills/deckmark/`), the runs in `test/herdr/` (now `eval/herdr/`), and `<repo>` stands for the repository root. CSS copied into each deck is the version of that day, so a re-render shows the deck as built, not as the current version would build it.
