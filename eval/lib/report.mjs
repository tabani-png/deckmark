// Static gallery: a per-arm summary, then one row per brief and one card per arm.
import { AXES } from './judge.mjs';
import { mean } from './common.mjs';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chip = (cls, t) => `<span class="chip ${cls}">${t}</span>`;
const f1 = (v) => (v == null ? 'n/a' : v.toFixed(1));
const money = (v) => (v == null ? 'n/a' : `$${v.toFixed(2)}`);

// Cell dir name -> arm id: the longest known arm id that is the name or its prefix before "-<tag>".
export function armOf(cell, armIds) {
  for (const id of [...armIds].sort((a, b) => b.length - a.length)) if (cell === id || cell.startsWith(`${id}-`)) return id;
  return cell;
}

export function summarize(cells) {
  const cols = new Map();
  for (const c of cells) { if (!cols.has(c.cell)) cols.set(c.cell, []); cols.get(c.cell).push(c); }
  return [...cols.entries()].map(([cell, cs]) => ({
    cell, armId: cs[0].armId, n: cs.length,
    decks: cs.filter((c) => c.score?.deck || c.run?.conformance?.deck).length,
    floorClean: cs.filter((c) => c.score?.floorClean).length,
    strictClean: cs.filter((c) => c.score?.strictClean).length,
    reflexMean: mean(cs.map((c) => c.score?.reflexCount)),
    expectPassed: cs.reduce((a, c) => a + (c.score?.expect?.passed ?? 0), 0),
    expectTotal: cs.reduce((a, c) => a + (c.score?.expect?.total ?? 0), 0),
    stamp: cs.filter((c) => c.run?.conformance?.stamp || c.score?.stamp).length,
    loadOrder: cs.filter((c) => c.run?.loadOrder?.ok).length,
    judgeMean: mean(cs.map((c) => c.judge?.overall)),
    ship: cs.filter((c) => c.judge?.verdict === 'ship').length,
    costMean: mean(cs.map((c) => c.run?.costUSD)),
    costSum: cs.reduce((a, c) => a + (c.run?.costUSD ?? 0) + (c.judge?.costUSD ?? 0), 0),
    turnsMean: mean(cs.map((c) => c.run?.turns)),
  }));
}

export function cardHtml(c) {
  const chips = [];
  const r = c.run, s = c.score, j = c.judge;
  if (r) {
    if (!r.ok) chips.push(chip('bad', r.timedOut ? 'timed out' : `gen ${esc(r.stopSubtype || 'failed')}`));
    const parts = [r.durationSec != null ? `${Math.round(r.durationSec / 60)}m` : null, r.turns != null ? `${r.turns} turns` : null, r.costUSD != null ? money(r.costUSD) : null].filter(Boolean);
    if (parts.length) chips.push(chip('mute', parts.join(' · ')));
    const k = r.conformance || {};
    chips.push(chip(k.stamp ? 'good' : 'bad', k.stamp ? 'stamp' : 'no stamp'));
    const flow = ['preflight', 'storyboard', 'facts'].filter((x) => k[x]).length;
    chips.push(chip(flow === 3 ? 'good' : 'warn', `flow ${flow}/3`));
    if (r.loadOrder) chips.push(chip(r.loadOrder.ok ? 'good' : 'warn', r.loadOrder.ok ? 'load order' : 'load order off'));
    if (r.bash) chips.push(chip(r.bash.decklintFull ? 'good' : 'bad', r.bash.decklintFull ? 'linted --strict' : 'no full lint'));
    if (r.repairs?.length) chips.push(chip('warn', `${r.repairs.length} repair`));
  }
  if (s) {
    if (s.lint?.unavailable) chips.push(chip('mute', 'lint n/a'));
    else {
      chips.push(chip(s.lint.fail === 0 ? 'good' : 'bad', `${s.lint.fail} FAIL`));
      chips.push(chip(s.lint.reflex === 0 ? 'good' : 'warn', `${s.lint.reflex} REFLEX${s.lint.waived ? ` · ${s.lint.waived} waived` : ''}`));
    }
    chips.push(chip(s.expect.passed === s.expect.total ? 'good' : 'bad', `expect ${s.expect.passed}/${s.expect.total}`));
    if (s.words?.mean != null) chips.push(chip('mute', `${Math.round(s.words.mean)} words/slide`));
  }
  if (j) chips.push(j.error ? chip('mute', 'judge error') : chip('judge', `${esc(j.verdict)} · ${j.overall}/10 · axes ${f1(mean(AXES.map((a) => j.axes?.[a])))}`));
  const failed = (s?.expect?.results || []).filter((e) => !e.pass).map((e) => `<li>${esc(e.id)}: ${esc(e.detail)}</li>`).join('');
  const thumb = c.cover ? `<img src="${esc(c.cover)}" alt="${esc(c.brief)} ${esc(c.cell)} page 1" loading="lazy">` : '<div class="noshot">no render</div>';
  const href = c.sheet || c.pdf || null;
  return `<article class="card">
  ${href ? `<a class="thumb" href="${esc(href)}" target="_blank" rel="noopener">${thumb}</a>` : `<div class="thumb">${thumb}</div>`}
  <div class="meta">
    <div class="arm">${esc(c.cell)}${c.run?.model ? `<span class="model">${esc(c.run.model)}</span>` : ''}</div>
    <div class="chips">${chips.join('')}</div>
    ${failed ? `<ul class="fails">${failed}</ul>` : ''}
    ${j?.rationale ? `<p class="why">${esc(j.rationale)}</p>` : ''}
    <p class="links">${c.pdf ? `<a href="${esc(c.pdf)}">pdf</a>` : ''}${c.sheet ? ` <a href="${esc(c.sheet)}">sheet</a>` : ''}</p>
  </div>
</article>`;
}

export function summaryHtml(rows) {
  if (!rows.length) return '<p class="empty">No runs yet. Start with <code>node eval/run-matrix.mjs --dry-run</code>.</p>';
  const tr = rows.map((r) => `<tr><td>${esc(r.cell)}</td><td>${r.decks}/${r.n}</td><td>${r.stamp}/${r.n}</td><td>${r.loadOrder}/${r.n}</td><td>${r.floorClean}/${r.n}</td><td>${r.strictClean}/${r.n}</td><td>${f1(r.reflexMean)}</td><td>${r.expectPassed}/${r.expectTotal}</td><td>${f1(r.judgeMean)}</td><td>${r.ship}/${r.n}</td><td>${money(r.costMean)}</td><td>${f1(r.turnsMean)}</td></tr>`).join('\n');
  return `<table class="summary"><thead><tr><th>arm</th><th>decks</th><th>stamp</th><th>load order</th><th>floor clean</th><th>strict clean</th><th>mean reflex</th><th>expect</th><th>judge mean</th><th>ship</th><th>mean cost</th><th>mean turns</th></tr></thead><tbody>${tr}</tbody></table>`;
}

export function renderReport({ briefs, cells, generatedAt = new Date().toISOString() }) {
  const rows = summarize(cells);
  const sections = briefs.map((b) => {
    const cs = cells.filter((c) => c.brief === b.id);
    return `<section class="brief">
  <h2>${esc(b.id)} <span class="bname">${esc(b.name)}</span></h2>
  <p class="btext">${esc(b.brief)}</p>
  <p class="bexpect">expect: ${(b.expect?.checks || []).map((c) => esc(c.id)).join(' · ')}</p>
  <div class="grid">${cs.length ? cs.map(cardHtml).join('\n') : '<p class="empty">no runs for this brief</p>'}</div>
</section>`;
  }).join('\n');
  const total = rows.reduce((a, r) => a + r.costSum, 0);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Deckmark eval matrix</title>
<style>
:root{--bg:#f6f5f1;--panel:#fff;--line:#d9d6cc;--ink:#1d1d1b;--mute:#66645d;--good:#1f6b43;--bad:#a8322a;--warn:#8a5a00;--acc:#24457a}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,sans-serif;padding:2.5rem clamp(1rem,4vw,3rem) 5rem}
h1{font-size:1.5rem}.sub{color:var(--mute);margin:.3rem 0 2rem;font-size:.88rem}
table.summary{border-collapse:collapse;width:100%;margin-bottom:3rem;font-size:.84rem;font-variant-numeric:tabular-nums;background:var(--panel)}
.summary th,.summary td{text-align:right;padding:.45rem .7rem;border-bottom:1px solid var(--line)}
.summary th:first-child,.summary td:first-child{text-align:left}
.summary th{color:var(--mute);font-weight:600;font-size:.7rem;text-transform:uppercase;letter-spacing:.06em}
.brief{margin-bottom:3rem}.brief h2{font-size:1.05rem}.bname{color:var(--mute);font-weight:400}
.btext{font-size:.88rem;max-width:62rem}.bexpect{color:var(--mute);font-size:.76rem;margin:.2rem 0 1rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem}
.card{background:var(--panel);border:1px solid var(--line);border-radius:6px;overflow:hidden}
.thumb{display:block;aspect-ratio:16/9;background:#e9e7e0;overflow:hidden}.thumb img{width:100%;height:100%;object-fit:contain;display:block}
.noshot{height:100%;display:flex;align-items:center;justify-content:center;color:var(--mute);font-size:.8rem}
.meta{padding:.7rem .8rem;border-top:1px solid var(--line)}.arm{font-weight:600;font-size:.86rem;margin-bottom:.4rem}
.model{color:var(--mute);font-weight:400;font-size:.76rem;margin-left:.5rem}
.chips{display:flex;flex-wrap:wrap;gap:.3rem}
.chip{font-size:.68rem;padding:.15rem .45rem;border-radius:3px;border:1px solid var(--line);color:var(--mute);font-variant-numeric:tabular-nums}
.chip.good{color:var(--good);border-color:var(--good)}.chip.bad{color:var(--bad);border-color:var(--bad)}.chip.warn{color:var(--warn);border-color:var(--warn)}.chip.judge{color:var(--acc);border-color:var(--acc)}
.fails{margin:.5rem 0 0 1rem;font-size:.74rem;color:var(--bad)}.why{font-size:.76rem;color:var(--mute);margin-top:.4rem}
.links{font-size:.74rem;margin-top:.4rem}.links a{color:var(--acc)}.empty{color:var(--mute);font-size:.85rem}
</style></head><body>
<h1>Deckmark eval matrix</h1>
<p class="sub">Generated ${esc(generatedAt)} · ${cells.length} cells · ${briefs.length} briefs · recorded spend ${money(total)} · card opens the contact sheet</p>
${summaryHtml(rows)}
${sections}
</body></html>
`;
}
