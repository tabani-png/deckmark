#!/usr/bin/env node
// Builds the 8-slide Northwind Freight fixture deck (a fictional company) into a scaffolded folder.
// Every printed figure comes from facts.json: text figures carry data-fact, charts carry data-src.
// usage: node build-fixture.mjs <scaffolded dir> <facts.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const { chart } = await import(join(HERE, '..', 'skills', 'deckmark', 'scripts', 'charts.mjs'));

const [dir, factsPath] = process.argv.slice(2);
const F = JSON.parse(readFileSync(factsPath, 'utf8')).facts;
const v = (k) => F[k].value;
const d = (k) => `<span data-fact="${k}">${F[k].display}</span>`;
const head = readFileSync(join(dir, 'deck.html'), 'utf8').split('<main class="deck">')[0]
  .replace('<title>Deck title</title>', '<title>Northwind Freight: margin plan and acquisition case</title>')
  .replace('storyline: <slug>', 'storyline: scr-strategy').replace('draw: <seed>', 'draw: fixture')
  .replace('decision: <approve|invest|lend|buy|fund|adopt>', 'decision: invest');
const foot = (n, src, note = '') => `  <footer class="slide-foot">
    <div class="notes">${note ? `<p class="footnote">${note}</p>` : ''}<p class="source">${src}</p></div>
    <span class="confid">Confidential</span><span class="pageno">${n}</span>
  </footer>`;
const tracker = (on) => `<div class="tracker">${['Performance', 'Margin plan', 'Market', 'Valuation', 'Next steps'].map((s) => `<span${s === on ? ' class="on"' : ''}>${s}</span>`).join('')}</div>`;

const revenue = chart('bar', { width: 1164, height: 268, categories: ['FY21', 'FY22', 'FY23', 'FY24', 'FY25'], values: ['rev_fy21', 'rev_fy22', 'rev_fy23', 'rev_fy24', 'rev_fy25'].map(v), highlight: 4, cagr: `CAGR ${F.rev_cagr.display}`, fmt: { dp: 1 }, src: 'facts.json#rev_fy21..rev_fy25' });
const bridge = chart('waterfall', { width: 700, height: 400, steps: [
  { label: 'FY24 EBITDA', value: v('ebitda_fy24'), total: true }, { label: 'Volume', value: v('br_volume') }, { label: 'Pricing', value: v('br_price') },
  { label: 'Fuel', value: v('br_fuel') }, { label: 'Labour', value: v('br_labour') }, { label: 'Network savings', value: v('br_network') },
  { label: 'FY25 EBITDA', value: v('ebitda_fy25'), total: true }], floor: 30, highlight: 5, fmt: { dp: 1 }, src: 'facts.json#ebitda_fy24,br_*,ebitda_fy25' });
const field = chart('football', { width: 640, rowHeight: 64, rows: [
  { label: 'Trading comps, 7.5x to 9.0x', low: v('val_trading_lo'), high: v('val_trading_hi') },
  { label: 'Precedents, 8.0x to 10.0x', low: v('val_prec_lo'), high: v('val_prec_hi') },
  { label: 'DCF, base case', low: v('val_dcf_lo'), high: v('val_dcf_hi'), }], marker: { value: v('offer_ev'), label: 'Offer' }, fmt: { dp: 1 }, tickDp: 0, src: 'facts.json#val_*,offer_ev' });

const hb = (n) => `<span class="hb" data-v="${n}" role="img" aria-label="${n} of 4"></span>`;
const harveyRows = [['Northwind Freight', [4, 3, 3, 4, 2]], ['Competitor A', [3, 4, 2, 2, 3]], ['Competitor B', [2, 2, 4, 3, 1]], ['Competitor C', [1, 3, 2, 2, 4]]];

const slides = `
<section class="slide cover" data-archetype="cover">
  <div>
    <p class="cover-kicker">Investment committee · discussion document</p>
    <h1 class="cover-title">Northwind Freight: a regional carrier with a clear path to a ${d('margin_target')} margin</h1>
    <p class="cover-sub">The case for acquiring Northwind at ${d('offer_ev')} enterprise value, and the three moves that pay for it.</p>
    <div class="cover-rule"></div>
  </div>
  <div class="cover-meta"><span>Fictional company · test fixture</span><span class="confid">Strictly confidential</span></div>
</section>

<section class="slide" data-archetype="summary-rows">
  <header class="slide-head">${tracker('Performance')}
    <h2 class="action-title">Northwind earns ${d('margin_fy25')} today and can reach ${d('margin_target')} with three operating moves</h2>
  </header>
  <div class="slide-body">
    <div class="kpi-strip" style="--kpis: 3">
      <div class="kpi"><span class="kpi-value">${d('rev_cagr')}</span><span class="kpi-label">Revenue CAGR since FY21</span></div>
      <div class="kpi"><span class="kpi-value">${d('margin_fy25')}</span><span class="kpi-label">EBITDA margin, FY25</span></div>
      <div class="kpi hl"><span class="kpi-value">${d('uplift')}</span><span class="kpi-label">EBITDA added at the target margin</span></div>
    </div>
    <div class="summary-rows">
      <div class="row"><div><span class="k">Situation</span><h4>A profitable regional carrier</h4></div><p>FY25 revenue of ${d('rev_fy25')}; on-time delivery ${d('otd_fy25')}, ahead of peers.</p></div>
      <div class="row"><div><span class="k">Complication</span><h4>Cost inflation is eating the growth</h4></div><p>Fuel and labour took margin back; EBITDA held at ${d('ebitda_fy25')} on pricing.</p></div>
      <div class="row"><div><span class="k">Resolution</span><h4>Three moves, one owner each</h4></div><p>Network, repricing, telematics: ${d('margin_target')} margin adds ${d('uplift')} of EBITDA.</p></div>
    </div>
  </div>
${foot(2, 'Source: Northwind Freight management accounts FY21 to FY25 (fictional); deal team analysis')}
</section>

<section class="slide" data-archetype="kpi-strip">
  <header class="slide-head">${tracker('Performance')}
    <h2 class="action-title">Revenue has compounded at ${d('rev_cagr')} a year since FY21 without a down year</h2>
  </header>
  <div class="slide-body">
    <div class="kpi-strip">
      <div class="kpi hl"><span class="kpi-value">${d('rev_fy25')}</span><span class="kpi-label">FY25 revenue</span></div>
      <div class="kpi"><span class="kpi-value">${d('margin_fy25')}</span><span class="kpi-label">FY25 EBITDA margin</span></div>
      <div class="kpi"><span class="kpi-value">${d('otd_fy25')}</span><span class="kpi-label">On-time delivery, FY25</span></div>
      <div class="kpi"><span class="kpi-value">${d('fleet')}</span><span class="kpi-label">Trucks in the owned fleet</span></div>
    </div>
    <figure class="exhibit fill">
      <figcaption><span class="exhibit-no">Exhibit 1</span><span class="exhibit-title">Revenue by fiscal year</span><span class="exhibit-unit">$ in millions</span></figcaption>
      ${revenue}
    </figure>
  </div>
${foot(3, 'Source: Northwind Freight audited accounts FY21 to FY24, management accounts FY25 (fictional)', 'Fiscal year ends 31 March.')}
</section>

<section class="slide" data-archetype="chart-takeaway">
  <header class="slide-head">${tracker('Margin plan')}
    <h2 class="action-title">Pricing and volume beat cost inflation, and network savings show the next lever</h2>
  </header>
  <div class="slide-body">
    <div class="chart-takeaway">
      <figure class="exhibit">
        <figcaption><span class="exhibit-no">Exhibit 2</span><span class="exhibit-title">EBITDA bridge, FY24 to FY25</span><span class="exhibit-unit">$ in millions</span></figcaption>
        ${bridge}
      </figure>
      <aside class="takeaway">
        <h3>What the bridge says</h3>
        <ul>
          <li>Volume and pricing added ${d('br_volume')} and ${d('br_price')}.</li>
          <li>Fuel ${d('br_fuel')} and labour ${d('br_labour')} are the costs to manage.</li>
          <li>The first network savings delivered ${d('br_network')} from two depots alone.</li>
        </ul>
        <p class="so-what">Rolling the depot redesign out to the full network is the largest single margin lever.</p>
      </aside>
    </div>
  </div>
${foot(4, 'Source: Northwind Freight management accounts FY24 and FY25 (fictional); deal team analysis')}
</section>

<section class="slide divider" data-archetype="divider">
  <p class="divider-no">02</p>
  <h2 class="divider-title">Market position and valuation</h2>
  <ul class="divider-list"><li>Performance and margin plan</li><li class="on">Market position and valuation</li><li>Next steps</li></ul>
</section>

<section class="slide" data-archetype="harvey-table">
  <header class="slide-head">${tracker('Market')}
    <h2 class="action-title">Northwind leads on reliability and coverage but trails on digital tools</h2>
  </header>
  <div class="slide-body">
    <div class="chart-takeaway">
    <figure class="exhibit">
      <figcaption><span class="exhibit-no">Exhibit 3</span><span class="exhibit-title">Capability comparison, regional carriers</span><span class="exhibit-unit">deal team assessment</span></figcaption>
      <table class="harvey airy">
        <thead><tr><th>Carrier</th><th class="hb-cell">Reliability</th><th class="hb-cell">Coverage</th><th class="hb-cell">Pricing power</th><th class="hb-cell">Fleet age</th><th class="hb-cell">Digital tools</th></tr></thead>
        <tbody>${harveyRows.map(([n, vals], i) => `<tr${i === 0 ? ' class="us"' : ''}><td>${n}</td>${vals.map((x) => `<td class="hb-cell">${hb(x)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      <div class="hb-legend" style="margin-top: 14px"><span>${hb(0)}Weak</span><span>${hb(2)}Average</span><span>${hb(4)}Leading</span></div>
    </figure>
    <aside class="takeaway"><h3>What the comparison says</h3><ul><li>Northwind leads every carrier on reliability and fleet age.</li><li>Competitor A matches it on coverage; Competitor B prices harder.</li><li>Digital tools are the only column where Northwind sits below average.</li></ul>
      <p class="so-what">Digital tools are the one gap, and the cheapest to close: the telematics programme brings Northwind level with Competitor A within the first year.</p></aside>
    </div>
  </div>
${foot(6, 'Source: customer interviews and public filings of the comparison carriers (all fictional); deal team assessment')}
</section>

<section class="slide" data-archetype="football-field">
  <header class="slide-head">${tracker('Valuation')}
    <h2 class="action-title">The ${d('offer_ev')} offer sits inside every valuation range and is fully funded</h2>
  </header>
  <div class="slide-body">
    <div class="grid-12 fill">
      <figure class="exhibit span-7">
        <figcaption><span class="exhibit-no">Exhibit 4</span><span class="exhibit-title">Enterprise value ranges</span><span class="exhibit-unit">$ in millions</span></figcaption>
        ${field}
      </figure>
      <figure class="exhibit span-5">
        <figcaption><span class="exhibit-no">Exhibit 5</span><span class="exhibit-title">Sources and uses</span></figcaption>
        <div class="sources-uses">
          <table class="data" data-sources><caption>($ in millions)</caption><thead><tr><th>Sources</th><th class="num">$M</th></tr></thead><tbody>
            <tr data-part><td>Term loan</td><td class="num">${d('su_term_loan')}</td></tr>
            <tr data-part><td>Sponsor equity</td><td class="num">${d('su_equity')}</td></tr>
            <tr class="total" data-total><td>Total</td><td class="num">${d('su_total')}</td></tr></tbody></table>
          <table class="data" data-uses><caption>($ in millions)</caption><thead><tr><th>Uses</th><th class="num">$M</th></tr></thead><tbody>
            <tr data-part><td>Purchase price</td><td class="num">${d('su_ev')}</td></tr>
            <tr data-part><td>Fees</td><td class="num">${d('su_fees')}</td></tr>
            <tr data-part><td>Cash to balance sheet</td><td class="num">${d('su_cash')}</td></tr>
            <tr class="total" data-total><td>Total</td><td class="num">${d('su_total')}</td></tr></tbody></table>
        </div>
        <div class="callout" style="margin-top: 24px">The offer is below the midpoint of the precedent range and leaves headroom for a competitive second round.</div>
      </figure>
    </div>
  </div>
${foot(7, 'Source: deal team valuation model; multiples applied to FY25 EBITDA (fictional)', 'Precedent range from regional freight transactions in the deal team database.')}
</section>

<section class="slide" data-archetype="chevrons">
  <header class="slide-head">${tracker('Next steps')}
    <h2 class="action-title">Committee approval this month lets the deal close before the peak shipping season</h2>
  </header>
  <div class="slide-body">
    <div class="chevrons"><div class="chev on">Approve</div><div class="chev">Confirm diligence</div><div class="chev">Sign and fund</div><div class="chev">First hundred days</div></div>
    <div class="timeline" style="--steps: 4">
      <div class="tl-item now"><span class="tl-date">This month</span><span class="tl-text">Investment committee</span></div>
      <div class="tl-item"><span class="tl-date">Q1 2026</span><span class="tl-text">Diligence complete</span></div>
      <div class="tl-item"><span class="tl-date">Q2 2026</span><span class="tl-text">Signing and close</span></div>
      <div class="tl-item"><span class="tl-date">H2 2026</span><span class="tl-text">Margin programme live</span></div>
    </div>
    <table class="data compact"><thead><tr><th>Condition to close</th><th>Owner</th><th>Closes it</th><th>By</th></tr></thead><tbody>
      <tr><td>Exclusivity letter signed</td><td>Deal team</td><td>Committee approval</td><td>This month</td></tr>
      <tr><td>Quality of earnings confirms adjusted EBITDA</td><td>Diligence adviser</td><td>QoE report</td><td>Q1 2026</td></tr>
      <tr><td>Fleet condition within the capex plan</td><td>Operations partner</td><td>Fleet survey</td><td>Q1 2026</td></tr>
      <tr><td>Term loan commitment letter</td><td>Lender</td><td>Credit approval</td><td>Q2 2026</td></tr></tbody></table>
    <div class="callout dark" style="margin-top: auto"><strong>Decision requested:</strong> approve a binding offer at ${d('offer_ev')} enterprise value, subject to confirmatory diligence.</div>
  </div>
${foot(8, 'Source: deal team workplan (fictional)')}
</section>
`;
writeFileSync(join(dir, 'deck.html'), `${head}<main class="deck">\n${slides}\n</main>\n</body>\n</html>\n`);
console.log(`wrote ${join(dir, 'deck.html')} (8 slides, Northwind Freight)`);
