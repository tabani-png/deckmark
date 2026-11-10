#!/usr/bin/env bash
# Deckmark engine test: theme tools, the Northwind Freight fixture (render + lint green),
# a broken deck that must FAIL, a reflex deck, an A4 smoke deck and the chart CLI.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
S="$ROOT/skills/deckmark/scripts"
FX="$ROOT/test/fixtures"
OUT="$ROOT/test/out"
LOG="$OUT/.deckmark/log.json"
rm -rf "$OUT"; mkdir -p "$OUT"
pass() { printf '  ok   %s\n' "$1"; }
die() { printf '  FAIL %s\n' "$1"; exit 1; }
has() { node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));const want=process.argv.slice(1);const got=new Set(r.findings.filter(f=>f.grade===want[0]).map(f=>f.rule));const miss=want.slice(1).filter(w=>!got.has(w));if(miss.length){console.error("missing "+want[0]+": "+miss.join(", "));process.exit(1)}' "$@"; }

echo "1. theme tools"
node "$S/theme.mjs" check > "$OUT/theme-check.txt" 2>&1 && pass "theme check: all themes valid" || echo "  note theme check reports theme-file problems (see $OUT/theme-check.txt); engine tests continue"
node "$S/theme.mjs" index > /dev/null && pass "index"
node "$S/theme.mjs" deal --field pe --prompt "IC memo for a regional freight carrier buyout" --log "$LOG" --json > "$OUT/deal1.json" && pass "deal: $(node -e 'console.log(require(process.argv[1]).deal.map(d=>d.slug).join(", "))' "$OUT/deal1.json")"
node "$S/theme.mjs" draw --storyline scr-strategy --log "$LOG" --seed 5eed01 --json > "$OUT/draw.json" && pass "draw (seeded)"
node "$S/theme.mjs" log --log "$LOG" --entry '{"theme":"meridian","storyline":"scr-strategy","draw":"5eed01","cover":"x","divider":"y","exec":"z","archetypes":["summary-rows","kpi-strip","chart-takeaway","harvey-table","football-field","chevrons"],"prompt":"Northwind fixture"}' > /dev/null && pass "log"
node "$S/theme.mjs" deal --field consulting --prompt "strategy deck" --log "$LOG" --json | node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));if(r.deal.some(d=>d.slug==="meridian"))process.exit(1)' && pass "rotation: meridian rested after the logged deck" || die "rotation did not rest the logged theme"

echo "2. Northwind Freight fixture (meridian, 16:9)"
D="$OUT/northwind"
node "$S/theme.mjs" scaffold meridian --out "$D" --storyline scr-strategy --dealt "1/3, fixture" > /dev/null && pass "scaffold"
node "$ROOT/test/build-fixture.mjs" "$D" "$FX/northwind-facts.json" > /dev/null && pass "build 8 slides from facts.json"
node "$S/render.mjs" "$D/deck.html" --out "$D/out" --hires && pass "render pdf + png"
[ "$(ls "$D/out"/page-0?.png | wc -l | tr -d ' ')" = "8" ] && pass "8 page PNGs at 1x" || die "expected 8 PNGs"
node "$S/decklint.mjs" "$D/deck.html" --render --strict --facts "$FX/northwind-facts.json" > "$OUT/lint-northwind.txt" && pass "decklint PASS (render + tie-out)" || { cat "$OUT/lint-northwind.txt"; die "Northwind deck should lint clean"; }

echo "3. broken deck must FAIL"
cp "$FX/broken.html" "$D/broken.html"
if node "$S/decklint.mjs" "$D/broken.html" --render --facts "$FX/northwind-facts.json" --json > "$OUT/lint-broken.json"; then die "broken deck passed"; fi
has FAIL overflow source tieout untraced literal-colour < "$OUT/lint-broken.json" && pass "FAIL on overflow, source, tieout, untraced, literal-colour"

echo "4. reflex deck: REFLEX findings, waiver honoured, exit 0"
cp "$FX/reflex.html" "$D/reflex.html"
node "$S/decklint.mjs" "$D/reflex.html" --render --json > "$OUT/lint-reflex.json" || die "reflex deck should not FAIL"
has REFLEX emoji archetype-repeat no-exhibit < "$OUT/lint-reflex.json" && has WAIVED bullets < "$OUT/lint-reflex.json" && pass "REFLEX emoji, archetype-repeat, no-exhibit; bullets WAIVED"
if node "$S/decklint.mjs" "$D/reflex.html" --render --strict > /dev/null; then die "--strict should fail on unwaived REFLEX"; else pass "--strict fails on unwaived REFLEX"; fi

echo "5. report-a4 smoke (gridline)"
A="$OUT/a4"
node "$S/theme.mjs" scaffold gridline --format report-a4 --out "$A" > /dev/null && pass "scaffold A4"
node "$S/render.mjs" "$A/deck.html" --out "$A/out" > /dev/null && pass "render A4"
node -e 'const b=require("fs").readFileSync(process.argv[1],"latin1");const m=b.match(/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)/);if(!m||Math.abs(m[1]-595.92)>2||Math.abs(m[2]-842.88)>2){console.error(m&&m[0]);process.exit(1)}' "$A/out/deck.pdf" && pass "PDF pages are A4"
node "$S/decklint.mjs" "$A/deck.html" --render --strict > "$OUT/lint-a4.txt" && pass "A4 starter lints clean" || { cat "$OUT/lint-a4.txt"; die "A4 starter should lint clean"; }

echo "6. chart CLI"
for t in bar stacked grouped waterfall line combo marimekko football harvey sparkline; do
  node "$S/charts.mjs" "$t" --data "$FX/charts/$t.json" > "$OUT/chart-$t.svg" && grep -q '<svg' "$OUT/chart-$t.svg" || die "chart $t"
done
pass "10 chart types render to SVG"
node "$ROOT/test/chart-gallery.mjs" "$D" "$FX/charts" > /dev/null && node "$S/render.mjs" "$D/gallery.html" --out "$D/gallery" > /dev/null && node "$S/decklint.mjs" "$D/gallery.html" --render --strict > "$OUT/lint-gallery.txt" && pass "chart gallery renders and lints clean" || { cat "$OUT/lint-gallery.txt"; die "chart gallery"; }

echo "7. fill and numbers rules"
cp "$FX/fill-broken.html" "$D/fill-broken.html"
if node "$S/decklint.mjs" "$D/fill-broken.html" --render --json > "$OUT/lint-fill.json"; then die "fill fixture passed"; fi
has FAIL totals sources-uses < "$OUT/lint-fill.json" && pass "FAIL on totals (16.0 vs 15) and sources-uses (83.3 vs 85.0)"
has REFLEX empty-slide gap-sprawl < "$OUT/lint-fill.json" && pass "REFLEX empty-slide and gap-sprawl"
node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));const e=r.findings.filter(f=>f.rule==="empty-slide");const ok=e.some(f=>f.slide===1&&f.grade==="REFLEX")&&e.some(f=>f.slide===5&&f.grade==="WAIVED");const deck=r.findings.some(f=>f.rule==="gap-sprawl"&&f.slide==null);process.exit(ok&&deck?0:1)' < "$OUT/lint-fill.json" && pass "empty-slide waiver honoured on the quote slide only; deck-level gap-sprawl on 4 slides" || die "empty-slide waiver scope or deck gap-sprawl"
if node "$S/decklint.mjs" "$D/deck.html" --render --facts "$FX/formula-broken-facts.json" --json > "$OUT/lint-formula.json"; then die "a wrong derived fact passed"; fi
has FAIL formula < "$OUT/lint-formula.json" && pass "FAIL formula: a derived fact that does not recompute"
grep -q '"rule": "formula"' "$OUT/lint-formula.json" && ! grep -q 'rev_cagr: ' "$OUT/lint-formula.json" && pass "correct formulas (CAGR, margin, sources total) pass"

echo "8. symlinked skill path (~/.claude/skills/deckmark style)"
L="$OUT/link"; mkdir -p "$L"; ln -s "$ROOT/skills/deckmark" "$L/deckmark"; LS="$L/deckmark/scripts"
[ -n "$(node "$LS/theme.mjs" list)" ] && pass "theme.mjs through the symlink" || die "theme.mjs silent through the symlink"
node "$LS/charts.mjs" bar --data "$FX/charts/bar.json" | grep -q '<svg' && pass "charts.mjs through the symlink" || die "charts.mjs silent through the symlink"
node "$LS/render.mjs" "$D/deck.html" --out "$L/out" --pages 1-2 | grep -q 'no pdf' && [ "$(ls "$L/out"/page-*.png | wc -l | tr -d ' ')" = "2" ] && [ ! -e "$L/out/deck.pdf" ] && pass "render.mjs through the symlink, --pages 1-2 writes 2 PNGs and no PDF" || die "render.mjs --pages through the symlink"
node "$LS/decklint.mjs" "$D/deck.html" | grep -q 'PASS' && pass "decklint.mjs through the symlink" || die "decklint.mjs silent through the symlink"

echo "9. scaffold and draw details"
O="$OUT/offline"
node "$S/theme.mjs" scaffold quiet-mandate --out "$O" --offline > /dev/null
! grep -q googleapis "$O/deck.html" && ! grep -Eq -- '--font-[a-z]+:[^;]*"Source Serif' "$O/tokens.css" && pass "--offline: no Google Fonts link, system font stack only" || die "offline scaffold still loads web fonts"
node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.exit(j.facts&&j._schema?0:1)' "$O/facts.json" && pass "scaffold writes facts.json with its schema next to deck.html"
C="$OUT/conf"; mkdir -p "$C/.deckmark"; echo '{"confidential": true}' > "$C/.deckmark/preflight.json"
node "$S/theme.mjs" scaffold quiet-mandate --out "$C/deck" > /dev/null && ! grep -q googleapis "$C/deck/deck.html" && pass "confidential preflight turns offline on by itself" || die "confidential preflight still loads web fonts"
node "$S/theme.mjs" draw --storyline cim --slides 15 --seed 5eed02 --log "$LOG" --json | node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));process.exit(/^no divider/.test(r.divider)?0:1)' && pass "draw --slides 15 deals no dividers" || die "dividers dealt under 16 slides"
for seed in a1 b2 c3 d4 e5 f6; do node "$S/theme.mjs" draw --storyline cim --slides 30 --seed $seed --log "$LOG" --json; done | node -e 'const rs=require("fs").readFileSync(0,"utf8").trim().split("\n").map(JSON.parse);process.exit(rs.some(r=>!/^no divider/.test(r.divider))?0:1)' && pass "draw --slides 30 can deal dividers"
node "$S/theme.mjs" draw --storyline cim --slides 15 --log "$LOG" | sed -n "s/.*--entry '\(.*\)'$/\1/p" | node -e 'JSON.parse(require("fs").readFileSync(0,"utf8"))' && pass "draw prints a valid JSON log entry" || die "draw log example is not valid JSON"

for t in $(node "$S/theme.mjs" list | awk '$3!="report-a4"{print $1}'); do
  node "$S/theme.mjs" scaffold "$t" --out "$OUT/starters/$t" > /dev/null && node "$S/decklint.mjs" "$OUT/starters/$t/deck.html" --render --strict > "$OUT/starters/$t.txt" || { cat "$OUT/starters/$t.txt"; die "starter deck for $t is not clean"; }
done
pass "every 16:9 theme's starter deck lints clean with --strict"

echo "10. ink, stat-only, stretched rows, numbered cards"
cp "$FX/ink.html" "$D/ink.html"
node "$S/decklint.mjs" "$D/ink.html" --render --json > "$OUT/lint-ink.json" || die "ink fixture should carry REFLEX only"
node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));const at=(rule,n)=>r.findings.some(f=>f.rule===rule&&f.slide===n&&f.grade==="REFLEX");const none=(n)=>!r.findings.some(f=>f.slide===n&&f.grade!=="NOTE");const ok=at("stat-only",1)&&at("empty-slide",2)&&at("stretched-rows",3)&&at("numbered-cards",4)&&none(5)&&none(6)&&!r.findings.some(f=>f.rule==="stat-only"&&f.slide!==1);if(!ok){console.error(JSON.stringify(r.findings,null,1));process.exit(1)}' < "$OUT/lint-ink.json" && pass "stat-only on bare KPI tiles; empty-slide counts ink, not a stretched box; stretched-rows; numbered-cards; exec summary and paired KPI slide clean" || die "ink fixture"
node "$S/charts.mjs" hbar --data "$FX/charts/bar.json" | grep -q '<svg' && pass "hbar is a chart type" || die "hbar"
echo '{"steps":[{"label":"Start","value":13,"total":true},{"label":"Add","value":0.9},{"label":"End","value":13.9,"total":true}]}' > "$OUT/dp.json"
node "$S/charts.mjs" bridge --data "$OUT/dp.json" | grep -q '>13.0<' && pass "labels share the data's decimals when fmt.dp is unset (13 prints 13.0)" || die "dp inference"
node "$S/theme.mjs" deal --field cfo --prompt "board pack" --log "$LOG" > /dev/null && pass "deal accepts the cfo reader field" || die "deal --field cfo"
if node "$S/theme.mjs" scaffold meridian --out "$OUT/badseed" --draw "82719c·ab12cd34·2026-11-07·r0" 2> /dev/null; then die "scaffold took a deal seed as --draw"; else pass "scaffold rejects a deal seed passed as --draw"; fi
if node "$S/theme.mjs" log --log "$ROOT/skills/deckmark/.deckmark/log.json" --entry '{"theme":"x"}' 2> /dev/null; then rm -rf "$ROOT/skills/deckmark/.deckmark"; die "log wrote into the skill folder"; else pass "log refuses a path inside the skill folder"; fi
if node "$S/theme.mjs" scaffold meridian --out "$ROOT/skills/deckmark/tmpdeck" 2> /dev/null; then rm -rf "$ROOT/skills/deckmark/tmpdeck"; die "scaffold wrote into the skill folder"; else pass "scaffold refuses an --out inside the skill folder"; fi

echo "11. text budget: wordy, prose-table, lean archetypes, speaker notes"
node "$ROOT/test/build-lean-fixture.mjs" "$D" > /dev/null && pass "build the lean fixture (fund-pitch, cap 80)"
node "$S/decklint.mjs" "$D/lean.html" --render --json > "$OUT/lint-lean.json" || die "lean fixture should carry REFLEX only"
node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));const at=(rule,n)=>r.findings.some(f=>f.rule===rule&&f.slide===n&&f.grade==="REFLEX");const clean=[1,4,5,6,7,8,9,10].filter(n=>r.findings.some(f=>f.slide===n&&f.grade!=="NOTE"));if(!at("wordy",2)||!at("prose-table",3)||clean.length){console.error(JSON.stringify(r.findings.filter(f=>f.grade!=="NOTE"),null,1));process.exit(1)}' < "$OUT/lint-lean.json" && pass "wordy on the wall of copy, prose-table on the label | paragraph table; chart + 3 short bullets, big-number compare, column row, statement, flow, cycle, ring pair and bracket slides clean; speaker notes not counted" || die "lean fixture"
node "$S/render.mjs" "$D/lean.html" --out "$D/lean" > /dev/null && pass "lean fixture renders"
node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));process.exit(r.summary.budget.cap===80&&r.summary.budget.lean?0:1)' < "$OUT/lint-lean.json" && pass "budget read from <body data-words-cap data-lean>" || die "budget from body"
sed -e 's/ data-words-cap="80" data-words-target="40-60" data-lean//' "$D/lean.html" > "$D/lean-stamp.html"
node "$S/decklint.mjs" "$D/lean-stamp.html" --render --json | node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));process.exit(r.summary.budget.cap===80&&r.summary.budget.lean&&/fund-pitch/.test(r.summary.budget.from)?0:1)' && pass "no body attributes: budget read from the stamp's storyline (fund-pitch)" || die "budget from stamp"
node "$S/theme.mjs" scaffold meridian --out "$OUT/budget" --storyline cim > /dev/null && grep -q 'data-words-cap="160"' "$OUT/budget/deck.html" && grep -q 'words: target 80-140, cap 160, lean' "$OUT/budget/deck.html" && pass "scaffold --storyline cim writes data-words-cap 160 and the stamp" || die "scaffold budget"
node "$S/decklint.mjs" "$OUT/budget/deck.html" --render --strict > /dev/null && pass "the lean starter exec summary lints clean under the cim budget" || die "starter under budget"
for s in "$ROOT"/skills/deckmark/references/storylines/*.md; do grep -Eq '^\*\*Words\.\*\* 16:9 target [0-9]+-[0-9]+, cap [0-9]+ · A4 cap [0-9]+' "$s" || die "no Words line in $(basename "$s")"; done
pass "every storyline carries a parseable Words line"
echo '{"pct":30,"center":"$1T","sub":"AUM"}' > "$OUT/ring.json"; echo '{"steps":["A","B","C","D"]}' > "$OUT/cycle.json"; echo '{"steps":["A","B","C"]}' > "$OUT/flow.json"
for t in ring cycle flow; do node "$S/charts.mjs" "$t" --data "$OUT/$t.json" | grep -q '<svg' || die "chart $t"; done
pass "ring, cycle and flow diagrams render to SVG"

echo "12. brand: client colours from their own deck"
node "$S/brand.mjs" "$FX/brand.png" --json > "$OUT/brand.json" && pass "brand.mjs reads a PNG"
node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));const rgb=(h)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const [fr,fg,fb]=rgb(r.tokens["--field"]),[ar,ag,ab]=rgb(r.tokens["--accent"]);const ok=r.light&&r.paper==="#ffffff"&&fb>fr&&fr+fg+fb<200&&ar>150&&ar>2*ag&&ar>2*ab&&Object.values(r.check).every((v,i)=>v>=3)&&r.check["ink on paper"]>=7&&r.check["muted on paper"]>=4.5&&r.check["accent text on paper"]>=4.5;if(!ok){console.error(JSON.stringify(r,null,1));process.exit(1)}' < "$OUT/brand.json" && pass "white paper, navy field, red accent; ink 7:1, muted and accent text 4.5:1" || die "brand palette"
node "$S/theme.mjs" scaffold meridian --out "$OUT/branded" --storyline fund-pitch --brand "$FX/brand.png" > /dev/null && grep -q 'brand override from brand.png' "$OUT/branded/tokens.css" && grep -q 'brand: brand.png' "$OUT/branded/deck.html" && pass "scaffold --brand appends the override block and records it in the stamp" || die "scaffold --brand"
node "$S/decklint.mjs" "$OUT/branded/deck.html" --render --strict > "$OUT/lint-branded.txt" && pass "the branded starter lints clean (contrast holds)" || { cat "$OUT/lint-branded.txt"; die "branded starter"; }

echo "all green"
