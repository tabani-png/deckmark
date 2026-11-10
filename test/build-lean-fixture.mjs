#!/usr/bin/env node
// Lean fixture: a fund-pitch deck (cap 80 words, no prose tables) with one slide per lean archetype that
// must lint clean, plus a wordy slide and a prose table that must trip `wordy` and `prose-table`.
// usage: node build-lean-fixture.mjs <scaffolded dir>   (writes <dir>/lean.html beside base.css and tokens.css)
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const { chart } = await import(join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'deckmark', 'scripts', 'charts.mjs'));
const dir = process.argv[2];
const foot = (n) => `<footer class="slide-foot"><div class="notes"><p class="source">Source: fixture, fictional company</p></div><span class="confid">Confidential</span><span class="pageno">${n}</span></footer>`;
const head = (t, unit = '') => `<header class="slide-head"><div class="tracker"><span class="on">Business</span><span>Economics</span><span>Ask</span></div><h2 class="action-title">${t}</h2>${unit ? `<p class="unit-line">${unit}</p>` : ''}</header>`;
const S = (n, arch, body, extra = '') => `<section class="slide" data-archetype="${arch}"${extra}>\n  ${head(...body.title)}\n  <div class="slide-body">${body.html}</div>\n  ${foot(n)}\n</section>\n`;

const bar = chart('bar', { categories: ['FY22', 'FY23', 'FY24', 'FY25'], values: [41.2, 48.9, 57.3, 66.0], highlight: 3, width: 760, height: 430, fmt: { dp: 1 } });
const flow = chart('flow', { steps: [{ label: 'Investors fund the note', value: '$15M' }, { label: 'HoldCo builds plants' }, { label: 'Client pays for energy', value: '$0 capex' }, { label: 'Cash returns to investors' }], highlight: 2, width: 1164, height: 400 });
const cycle = chart('cycle', { steps: ['Disciplined investing', 'Strong returns', 'More client capital', 'Larger investments', 'Reinvestment'], highlight: 1, width: 1164, height: 400 });
const r1 = chart('ring', { pct: 15, center: '$150T+', sub: 'Global AUM 2022', arcLabel: '15%', size: 300 });
const r2 = chart('ring', { pct: 28, center: '$300T+', sub: 'Global AUM 2032E', arcLabel: '28%', size: 300 });

const slides = [
  // 1. lean: chart + a three-bullet sidebar, every bullet short
  S(1, 'chart-takeaway', { title: ['Revenue compounded every year from FY22 to FY25 on the same client base', 'Revenue, $ in millions'], html: `
    <div class="chart-takeaway"><figure class="exhibit"><figcaption><span class="exhibit-title">Revenue by fiscal year</span><span class="exhibit-unit">$ in millions</span></figcaption>${bar}</figure>
    <aside class="takeaway"><h3>What it says</h3><ul><li>Revenue rose every year since FY22.</li><li>FY25 is the highest year on record.</li><li>No acquisitions in the period.</li></ul><p class="so-what">Growth is organic.</p></aside></div>
    <aside class="speaker-notes">Speaker notes hold the detail the slide does not show: the client count by year, the pricing history, the contract renewals and every caveat on the FY25 figure. None of this renders and none of it counts toward the slide's word budget, so the presenter can say it without the slide having to carry it. ${'More said than shown. '.repeat(30)}</aside>` }),
  // 2. wordy: a wall of copy far over the cap
  S(2, 'two-column-compare', { title: ['The model works because clients invest nothing and savings are guaranteed by an insurer', ''], html: `
    <div class="grid-12"><div class="span-6"><p class="body-copy">${'The company designs, builds, owns and operates the plants at no cost to the client, who pays only for the energy it uses at a price below the utility rate. '.repeat(3)}</p></div>
    <div class="span-6"><p class="body-copy">${'A performance guarantee insurance policy backs every project, so client savings are protected and the funding partners have a backstop if output falls short. '.repeat(3)}</p></div></div>` }),
  // 3. prose table: label | paragraph rows
  S(3, 'data-table', { title: ['Experience, software and an insured guarantee reduce the risk on every project', ''], html: `
    <table class="data"><thead><tr><th>Advantage</th><th>Evidence</th></tr></thead><tbody>
      <tr><td>Experience</td><td>Formed to bring industry leaders in cogeneration together under one banner, with a long record in design, construction and operation of plants.</td></tr>
      <tr><td>Profiling software</td><td>Predicts the combined production of electricity, heating and cooling within a narrow band, using far fewer resources than other firms.</td></tr>
      <tr><td>Insured guarantee</td><td>A policy underwritten by a large insurer ensures client savings are achieved and backstops project funding partners in every case.</td></tr></tbody></table>` }),
  // 4. big-number comparison
  S(4, 'big-compare', { title: ['The second billion of capacity took a fifth of the time the first one did', ''], html: `
    <div class="big-compare">
      <div class="bc-row"><div class="bc-a"><span class="bc-k">First</span><span class="bc-fig">$1.0B</span><span class="bc-sub">of capacity</span></div><div class="bc-arrow"></div><div class="bc-b"><span class="bc-fig">25 years</span></div></div>
      <div class="bc-row"><div class="bc-a"><span class="bc-k">Next</span><span class="bc-fig">$1.0B</span><span class="bc-sub">of capacity</span></div><div class="bc-arrow"></div><div class="bc-b"><span class="bc-fig">5 years</span></div></div>
    </div><p class="takeaway-bar">Each new plant is profiled and built faster than the last.</p>` }),
  // 5. column row with one proof number each
  S(5, 'col-row', { title: ['Five divisions extend the core offer, each with its own proof point', ''], html: `
    <div class="col-row big" style="--cols: 5">
      <div class="cr-col hl"><span class="cr-head">Core offer</span><span class="cr-fig">$0</span><span class="cr-label">client capex on every plant</span></div>
      <div class="cr-col"><span class="cr-head">Re-Power</span><span class="cr-fig">30 yr</span><span class="cr-label">contracts on acquired plants</span></div>
      <div class="cr-col"><span class="cr-head">Data centers</span><span class="cr-fig">85%</span><span class="cr-label">overall system efficiency</span></div>
      <div class="cr-col"><span class="cr-head">Cultivation</span><span class="cr-fig">3 in 1</span><span class="cr-label">power, heat and CO2 from one fuel</span></div>
      <div class="cr-col"><span class="cr-head">Emergency</span><span class="cr-fig">72 hr</span><span class="cr-label">deployable power and cooling</span></div>
    </div><p class="takeaway-bar">Every division sells the same plant on the same zero-capex contract.</p>` }),
  // 6. full-bleed statement slide
  `<section class="slide statement" data-archetype="statement"><p class="statement-text">Clients pay for energy, <span class="em">never for the plant</span>.</p><p class="statement-sub">Section 2 · Economics</p>${foot(6)}</section>\n`,
  // 7. flow diagram, not a prose chevron
  S(7, 'flow', { title: ['Capital flows from investors to plants and back without the client spending', ''], html: `
    <figure class="exhibit"><figcaption><span class="exhibit-title">How capital moves</span></figcaption>${flow}</figure>
    <p class="takeaway-bar">Investors are repaid before the company takes its full share.</p>` }),
  // 8. cycle diagram + short sidebar
  S(8, 'cycle', { title: ['Returns bring more client capital, which funds larger plants and more returns', ''], html: `
    <figure class="exhibit">${cycle}</figure><p class="takeaway-bar">Returns attract capital; scale lowers the cost of each new plant.</p>` }),
  // 9. ring pair
  S(9, 'ring-pair', { title: ['The addressable market doubles by 2032 and our share of it grows', 'Global AUM, $ trillions'], html: `
    <div class="ring-pair"><figure>${r1}<figcaption>2022</figcaption></figure><div class="rp-arrow"></div><figure>${r2}<figcaption>2032E</figcaption></figure></div>` }),
  // 10. bracket statement
  S(10, 'bracket', { title: ['Buying the credit platform enabled three growth lines we could not build alone', ''], html: `
    <div class="bracket"><div class="br-from"><p class="br-lead">Added a credit platform</p><p class="lead">One acquisition, closed in FY24.</p></div><div class="br-mark"></div>
    <div class="br-to"><span class="br-k">It enabled</span><ul><li>Insurance platform<span class="br-fig">$50B</span></li><li>Private wealth<span class="br-fig">$12B</span></li><li>Partnerships<span class="br-fig">4</span></li></ul></div></div>
    <p class="takeaway-bar">Each line now raises capital on its own.</p>` }),
];

const html = `<!doctype html>
<!-- Deckmark · lean fixture · format: slides-16x9 · storyline: fund-pitch · words: target 40-60, cap 80, lean -->
<html lang="en">
<head>
<meta charset="utf-8">
<title>Lean fixture</title>
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="tokens.css">
</head>
<body data-format="slides-16x9" data-words-cap="80" data-words-target="40-60" data-lean>
<main class="deck">
${slides.join('\n')}
</main>
</body>
</html>
`;
writeFileSync(join(dir, 'lean.html'), html);
console.log(`wrote ${join(dir, 'lean.html')} (${slides.length} slides)`);
