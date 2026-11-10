#!/usr/bin/env node
// Builds a theme's 4-page specimen (cover, exec summary, chart + takeaway, dense table) into a folder
// scaffolded by theme.mjs. Everything printed comes from test/specimens/<slug>/spec.json (words) and
// facts.json (every number). All companies, places and figures in the specimens are fictional.
// Text placeholders {key} print facts.json[key].display with data-fact; chart values "@key" read
// facts.json[key].value; table cells that name a fact key print it with data-fact.
// usage: node build-specimen.mjs <slug> <out-dir>
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(HERE, '..', '..', 'skills', 'deckmark', 'scripts');
const { chart } = await import(join(SCRIPTS, 'charts.mjs'));

const [slug, out] = process.argv.slice(2);
if (!slug || !out) { console.error('usage: node build-specimen.mjs <slug> <out-dir>'); process.exit(2); }
const S = JSON.parse(readFileSync(join(HERE, slug, 'spec.json'), 'utf8'));
const F = JSON.parse(readFileSync(join(HERE, slug, 'facts.json'), 'utf8')).facts;
const a4 = S.format === 'report-a4';
execFileSync('node', [join(SCRIPTS, 'theme.mjs'), 'scaffold', slug, '--out', out, '--format', S.format, '--force', '--storyline', S.storyline, '--dealt', 'specimen'], { stdio: 'ignore' });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const d = (k) => { if (!F[k]) throw new Error(`${slug}: no fact "${k}"`); return `<span data-fact="${k}">${esc(F[k].display)}</span>`; };
const tx = (s) => (s == null ? '' : esc(s).replace(/\{([A-Za-z0-9_]+)\}/g, (_, k) => d(k)));
const resolve = (x) => (typeof x === 'string' && x.startsWith('@') ? (F[x.slice(1)] ? F[x.slice(1)].value : (() => { throw new Error(`${slug}: no fact "${x}"`); })())
  : Array.isArray(x) ? x.map(resolve) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, resolve(v)])) : x);

// Content geometry from the theme tokens, so chart viewBox units print at their nominal size.
const tokens = readFileSync(join(out, 'tokens.css'), 'utf8');
const px = (name, dflt) => { const m = new RegExp(`${name}\\s*:\\s*([\\d.]+)(px|mm)?`).exec(tokens); return m ? Number(m[1]) * (m[2] === 'mm' ? 96 / 25.4 : 1) : dflt; };
const a4mx = /body\[data-format="report-a4"\][^}]*--m-x\s*:\s*([\d.]+)(mm|px)/.exec(tokens);
const mx = a4 ? (a4mx ? Number(a4mx[1]) * (a4mx[2] === 'mm' ? 96 / 25.4 : 1) : 68) : px('--m-x', 56);
const gutter = a4 ? 23 : px('--gutter', 28);
const contentW = Math.round((a4 ? 793 : 1280) - 2 * mx);

const head = readFileSync(join(out, 'deck.html'), 'utf8').split('<main class="deck">')[0]
  .replace('<title>Deck title</title>', `<title>${esc(S.title)}</title>`)
  .replace('draw: <seed>', 'draw: specimen')
  .replace('decision: <approve|invest|lend|buy|fund|adopt>', `decision: ${S.decision || 'approve'}`);
const tracker = (on) => (S.tracker ? `<div class="tracker">${S.tracker.map((s) => `<span${s === on ? ' class="on"' : ''}>${esc(s)}</span>`).join('')}</div>` : '');
const stamp = (s) => (s ? `<span class="stamp">${esc(s)}</span>` : '');
const foot = (n, p) => `  <footer class="slide-foot">
    <div class="notes">${p.note ? `<p class="footnote">${tx(p.note)}</p>` : ''}${p.source ? `<p class="source">${tx(p.source)}</p>` : ''}</div>
    <span class="confid">${esc(S.confid ?? 'Confidential')}</span><span class="pageno">${n}</span>
  </footer>`;
const sHead = (p) => `  <header class="slide-head">${tracker(p.tracker)}${stamp(p.stamp)}
    ${p.kicker ? `<p class="kicker">${tx(p.kicker)}</p>` : ''}<h2 class="action-title">${tx(p.title)}</h2>${p.subtitle ? `\n    <p class="subtitle">${tx(p.subtitle)}</p>` : ''}
  </header>`;
const more = (p) => (p.more ? p.more.map((x) => `\n    <p class="body-copy">${tx(x)}</p>`).join('') : '');
const caption = (e) => `<figcaption>${e.no ? `<span class="exhibit-no">${esc(e.no)}</span>` : ''}<span class="exhibit-title">${tx(e.title)}</span>${e.unit ? `<span class="exhibit-unit">${tx(e.unit)}</span>` : ''}</figcaption>`;

// ---- 1. cover
const C = S.cover;
const cover = `<section class="slide cover${C.light ? ' light' : ''}" data-archetype="cover">
  <div>
    <p class="cover-kicker">${tx(C.kicker)}</p>
    <h1 class="cover-title">${tx(C.title)}</h1>
    <p class="cover-sub">${tx(C.sub)}</p>
    <div class="cover-rule"></div>
  </div>
  <div class="cover-meta"><span>${tx(C.meta)}</span><span class="confid">${esc(C.confid ?? S.confid ?? 'Strictly confidential')}</span></div>
</section>`;

// ---- table helpers
const cell = (c, j) => {
  if (c == null || c === '') return '<td></td>';
  if (typeof c === 'string' && F[c]) return `<td class="num${F[c].value < 0 ? ' neg' : ''}">${d(c)}</td>`;
  const hb = /^hb:(\d)$/.exec(c); if (hb) return `<td class="hb-cell"><span class="hb" data-v="${hb[1]}" role="img" aria-label="${hb[1]} of 4"></span></td>`;
  const st = /^st:(ok|watch|breach):(.*)$/.exec(c); if (st) return `<td><span class="status st-${st[1]}">${tx(st[2])}</span></td>`;
  return `<td${j === 0 ? '' : ' class="txt"'}>${tx(c)}</td>`;
};
const th = (h) => `<th${h.num ? ' class="num"' : h.hb ? ' class="hb-cell"' : ''}>${tx(h.h)}</th>`;
const makeTable = (T) => `<table class="data">
        ${T.group ? `<thead><tr class="group">${T.group.map((g) => `<th colspan="${g.span}"${g.h ? ' class="grp"' : ''}>${tx(g.h)}</th>`).join('')}</tr>` : '<thead>'}<tr>${T.columns.map(th).join('')}</tr></thead>
        <tbody>${T.rows.map((r) => `
          <tr${r.cls ? ` class="${r.cls}"` : ''}>${r.cells.map(cell).join('')}</tr>`).join('')}
        </tbody>
      </table>`;

// ---- 2. executive summary
const E = S.exec;
const kpis = E.kpis ? `<div class="kpi-strip" style="--kpis: ${E.kpis.length}">${E.kpis.map((k) => `
      <div class="kpi${k.hl ? ' hl' : ''}"><span class="kpi-value">${tx(k.value)}</span><span class="kpi-label">${tx(k.label)}</span>${k.delta ? `<span class="delta ${k.dir || 'up'}">${tx(k.delta)}</span>` : ''}</div>`).join('')}
    </div>` : '';
const rows = E.rows ? `<div class="summary-rows">${E.rows.map((r) => `
      <div class="row"><div><span class="k">${tx(r.k)}</span><h4>${tx(r.h)}</h4></div><p>${tx(r.p)}</p></div>`).join('')}
    </div>` : '';
const exec = `<section class="slide" data-exec data-archetype="${E.table ? 'summary-table' : E.kpis && !E.rows ? 'kpi-strip' : 'summary-rows'}">
${sHead(E)}
  <div class="slide-body">
    ${E.lead ? `<p class="lead">${tx(E.lead)}</p>` : ''}${kpis}${rows}${E.table ? `<figure class="exhibit">
      ${caption(E.table.exhibit)}
      ${makeTable(E.table)}
    </figure>` : ''}${E.callout ? `\n    <div class="callout${E.calloutClass ? ' ' + E.calloutClass : ''}">${tx(E.callout)}</div>` : ''}${more(E)}
  </div>
${foot(2, E)}
</section>`;

// ---- 3. chart + takeaway
const K = S.chart;
const chartW = Math.round(a4 || K.full ? contentW : (contentW - gutter * 1.2) * 1.75 / 2.75);
const svg = chart(K.type, { ...resolve(K.data), width: chartW, height: K.data.height ?? (a4 ? 330 : 400), src: `facts.json#${K.srcKeys || K.type}` });
const take = K.takeaway ? `<aside class="takeaway">
        <h3>${tx(K.takeaway.h)}</h3>
        <ul>${K.takeaway.bullets.map((b) => `<li>${tx(b)}</li>`).join('')}</ul>
        ${K.takeaway.sowhat ? `<p class="so-what">${tx(K.takeaway.sowhat)}</p>` : ''}
      </aside>` : '';
const fig = `<figure class="exhibit">
        ${caption(K.exhibit)}
        ${svg}
      </figure>`;
const chartSlide = `<section class="slide" data-archetype="chart-takeaway">
${sHead(K)}
  <div class="slide-body">
    ${K.lead ? `<p class="lead">${tx(K.lead)}</p>` : ''}${a4 || K.full ? `${fig}\n    ${take}` : `<div class="chart-takeaway">
      ${fig}
      ${take}
    </div>`}${K.callout ? `\n    <div class="callout">${tx(K.callout)}</div>` : ''}${more(K)}
  </div>
${foot(3, K)}
</section>`;

// ---- 4. dense table
const T = S.table;
const tableSlide = `<section class="slide" data-archetype="${T.archetype || 'data-table'}">
${sHead(T)}
  <div class="slide-body">
    ${T.lead ? `<p class="lead">${tx(T.lead)}</p>` : ''}<figure class="exhibit">
      ${caption(T.exhibit)}
      ${makeTable(T)}${T.legend ? `\n      <div class="hb-legend" style="margin-top: 10px">${T.legend.map(([v, l]) => `<span><span class="hb" data-v="${v}"></span>${esc(l)}</span>`).join('')}</div>` : ''}
    </figure>${T.callout ? `\n    <div class="callout">${tx(T.callout)}</div>` : ''}${more(T)}
  </div>
${foot(4, T)}
</section>`;

writeFileSync(join(out, 'deck.html'), `${head}<main class="deck">\n${[cover, exec, chartSlide, tableSlide].join('\n\n')}\n</main>\n</body>\n</html>\n`);
console.log(`wrote ${join(out, 'deck.html')} (${slug} specimen, ${S.format}, chart ${chartW}px wide)`);
