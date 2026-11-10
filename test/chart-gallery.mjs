#!/usr/bin/env node
// Writes gallery.html into a scaffolded folder: every chart type on themed slides, for eyeballing and linting.
// usage: node chart-gallery.mjs <scaffolded dir> <charts fixture dir>
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const { chart } = await import(join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'deckmark', 'scripts', 'charts.mjs'));
const [dir, fx] = process.argv.slice(2);
const c = (t) => chart(t, JSON.parse(readFileSync(join(fx, `${t}.json`), 'utf8')));
const head = readFileSync(join(dir, 'deck.html'), 'utf8').split('<main class="deck">')[0];
const fig = (no, title, unit, body) => `<figure class="exhibit span-6"><figcaption><span class="exhibit-no">Exhibit ${no}</span><span class="exhibit-title">${title}</span><span class="exhibit-unit">${unit}</span></figcaption>${body}</figure>`;
const slide = (n, arch, title, a, b) => `<section class="slide" data-archetype="${arch}"><header class="slide-head"><h2 class="action-title">${title}</h2></header>
<div class="slide-body"><div class="grid-12">${a}${b}</div></div>
<footer class="slide-foot"><div class="notes"><p class="source">Source: chart gallery fixture, fictional data</p></div><span class="pageno">${n}</span></footer></section>`;
const spark = c('sparkline');
const slides = [
  slide(1, 'gallery-a', 'Ranked bars rank carriers and stacked columns split revenue by line', fig(1, 'On-time delivery by carrier', '%', c('bar')), fig(2, 'Revenue by service line', '$ in millions', c('stacked'))),
  slide(2, 'gallery-b', 'Grouped columns compare regions and the bridge walks budget to actual', fig(3, 'EBITDA by region', '$ in millions', c('grouped')), fig(4, 'EBITDA, budget to actual', '$ in millions', c('waterfall'))),
  slide(3, 'gallery-c', 'Line and combo charts show the margin trend against revenue', fig(5, 'EBITDA margin', '%', c('line')), fig(6, 'Revenue and margin', '$M and %', c('combo'))),
  slide(4, 'gallery-d', 'The market map sizes segments and the valuation ranges bracket the offer', fig(7, 'Market by segment and share', '$ in millions', c('marimekko')), fig(8, 'Enterprise value', '$ in millions', c('football') + `<p class="small" style="margin-top: 12px">Margin trend ${spark.replace('<svg', '<svg style="display: inline-block; width: 120px; vertical-align: middle"')} Harvey ${c('harvey').replace('<svg', '<svg style="display: inline-block; width: 18px; vertical-align: middle"')}</p>`)),
];
writeFileSync(join(dir, 'gallery.html'), `${head}<main class="deck">\n${slides.join('\n')}\n</main>\n</body>\n</html>\n`);
console.log(`wrote ${join(dir, 'gallery.html')}`);
