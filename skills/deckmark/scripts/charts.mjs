#!/usr/bin/env node
// Deckmark charts: data in, clean SVG out. Colours are never literal: every mark carries a class
// (ch-bar, ch-hl, ch-s1..s5, ...) that base.css maps to theme tokens. Consulting conventions:
// direct labels, no chart junk, one highlight colour, axis only where needed, units in the title.
//
// CLI:    node charts.mjs <type> --data file.json [--standalone] > out.svg
// Import: import { chart, bar, waterfall, ... } from './charts.mjs'; chart('bar', data) -> svg string
//
// Shared data keys: width, height (viewBox units, match the column the chart sits in so 13px
// labels print at 13px), title (put the unit in it: "Revenue, $M"), src (written as data-src),
// highlight (index, label, or list of either), fmt { dp, prefix, suffix, negParens }.
// fmt.dp: set it to the deck's decimal rule ({ "dp": 1 } prints 13 as 13.0). Left unset, every label in
// the chart takes the most decimals found in its data, so 13 beside 0.9 prints 13.0.
// Types: bar (orient: "h" or type hbar for ranked horizontal bars), stacked, grouped, waterfall (alias
// bridge), line, combo, marimekko, football, harvey, sparkline, and the lean diagrams ring (one metric as
// a ring with its big figure inside), cycle (3-6 steps round a loop) and flow (3-5 short steps with arrows).

import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FS = 13;                                   // label size in viewBox units
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Width estimate in em per character (bold figures at the chart's label size), generous so a trailing
// % or M never runs past the box.
const CW = (c) => (/[0-9$€£]/.test(c) ? 0.6 : /[%MWmw@]/.test(c) ? 0.92 : /[A-Z]/.test(c) ? 0.7 : /[.,:;'|!ilj ()\[\]]/.test(c) ? 0.32 : /[-+x]/.test(c) ? 0.6 : 0.56);
const textW = (s, fs = FS) => [...String(s)].reduce((a, c) => a + CW(c), 0) * fs * 1.06;
const r1 = (n) => Math.round(n * 10) / 10;

export function fmt(v, f = {}, signed = false) {
  if (v == null || Number.isNaN(v)) return '';
  const dp = f.dp ?? (Number.isInteger(v) ? 0 : 1);
  const body = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const core = `${f.prefix ?? ''}${body}${f.suffix ?? ''}`;
  if (v < 0) return f.negParens === false ? `-${core}` : `(${core})`;
  return signed ? `+${core}` : core;
}

function isHl(data, i, label) {
  const h = data.highlight;
  if (h == null) return false;
  const list = Array.isArray(h) ? h : [h];
  return list.some((x) => x === i || x === label);
}

function niceTicks(min, max, count = 4) {
  if (max === min) max = min + 1;
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

function frame(data, w, h, body, extraClass = '') {
  const title = data.title ? `<text class="ch-title" x="0" y="${FS}">${esc(data.title)}</text>` : '';
  const src = data.src ? ` data-src="${esc(data.src)}"` : '';
  const label = esc(data.title || data.type || 'chart');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="dm-chart${extraClass ? ' ' + extraClass : ''}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}"${src}><title>${label}</title>${title}${body}</svg>`;
}
const top0 = (data) => (data.title ? FS + 14 : 0);
const T = (x, y, s, cls = '', anchor = 'middle', extra = '') => `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}"${cls ? ` class="${cls}"` : ''}${extra}>${esc(s)}</text>`;
const R = (x, y, w, h, cls) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}" class="${cls}"/>`;
const L = (x1, y1, x2, y2, cls) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" class="${cls}"/>`;

// ---------- bar (columns, or ranked horizontal bars with orient: "h") ----------
export function bar(data) {
  if (data.orient === 'h') return hbar(data);
  const W = data.width ?? 720, H = data.height ?? 340;
  const cats = data.categories, vals = data.values;
  const t = top0(data) + (data.cagr ? 34 : 22), b = 26;
  const max = Math.max(0, ...vals), min = Math.min(0, ...vals);
  const plotH = H - t - b;
  const y = (v) => t + (max - v) / (max - min || 1) * plotH;
  const band = W / cats.length, bw = Math.min(band * 0.62, 90);
  let out = '';
  cats.forEach((c, i) => {
    const v = vals[i], cx = band * i + band / 2, hl = isHl(data, i, c);
    const y0 = y(Math.max(v, 0)), y1 = y(Math.min(v, 0));
    out += R(cx - bw / 2, y0, bw, y1 - y0, hl ? 'ch-hl' : 'ch-bar');
    out += T(cx, v >= 0 ? y0 - 6 : y1 + FS + 3, fmt(v, data.fmt), `ch-value${hl ? ' hl' : ''}`);
    out += T(cx, H - 6, c, 'ch-cat');
  });
  out += L(0, y(0), W, y(0), 'ch-axis');
  if (data.cagr) {
    const x1 = band / 2, x2 = band * (cats.length - 1) + band / 2, yy = top0(data) + 10;
    out += `<path d="M${r1(x1)} ${yy + 8} V${yy} H${r1(x2)} V${yy + 8}" class="ch-conn"/>`;
    const lab = String(data.cagr), lw = textW(lab) + 16;
    out += `<rect x="${r1((x1 + x2) / 2 - lw / 2)}" y="${yy - 10}" width="${r1(lw)}" height="20" rx="10" class="ch-dot"/>`;
    out += T((x1 + x2) / 2, yy + 4, lab, 'ch-value');
  }
  return frame(data, W, H, out);
}

function hbar(data) {
  const cats = data.categories, vals = data.values;
  const rowH = data.rowHeight ?? 30, t = top0(data) + 4;
  const W = data.width ?? 720, H = data.height ?? t + rowH * cats.length;
  const labW = Math.min(W * 0.36, Math.max(...cats.map((c) => textW(c))) + 14);
  const valW = Math.max(...vals.map((v) => textW(fmt(v, data.fmt)))) + 14;
  const max = Math.max(...vals.map(Math.abs)) || 1;
  const plotW = W - labW - valW;
  let out = '';
  cats.forEach((c, i) => {
    const v = vals[i], yy = t + i * rowH, hl = isHl(data, i, c), bh = rowH * 0.62, w = Math.abs(v) / max * plotW;
    out += T(0, yy + rowH / 2 + 4, c, `ch-cat${hl ? ' ch-value' : ''}`, 'start');
    out += R(labW, yy + (rowH - bh) / 2, w, bh, hl ? 'ch-hl' : 'ch-bar');
    out += T(labW + w + 6, yy + rowH / 2 + 4, fmt(v, data.fmt), `ch-value${hl ? ' hl' : ''}`, 'start');
  });
  out += L(labW, t, labW, t + rowH * cats.length, 'ch-axis');
  return frame(data, W, H, out);
}

// ---------- stacked and grouped ----------
export function stacked(data) {
  const W = data.width ?? 720, H = data.height ?? 340;
  const cats = data.categories, S = data.series;
  const legendW = Math.max(...S.map((s) => textW(s.name))) + 16;
  const t = top0(data) + 22, b = 26, plotW = W - legendW;
  const totals = cats.map((_, i) => S.reduce((a, s) => a + (s.values[i] || 0), 0));
  const max = Math.max(...totals) || 1, plotH = H - t - b;
  const band = plotW / cats.length;
  let bw = Math.min(band * 0.62, 90);
  // Every segment keeps its value label. A bar widens (up to 80% of its band) so a segment tall enough
  // for its label is wide enough too; a segment too short for it is labelled beside the bar instead
  // (right of it; left of the last bar, whose right side holds the series names), never dropped.
  const vals = S.flatMap((s) => cats.map((_, i) => s.values[i] || 0)).filter((v) => v !== 0);
  const tall = (v) => Math.abs(v) / max * plotH >= FS + 4;
  const wide = vals.filter(tall).map((v) => textW(fmt(v, data.fmt)) + 6);
  if (wide.length) bw = Math.min(band * 0.8, Math.max(bw, ...wide));
  const fits = (v, w) => tall(v) && textW(fmt(v, data.fmt)) < w - 4;
  let out = '';
  cats.forEach((c, i) => {
    const cx = band * i + band / 2; let acc = 0;
    const left = i === cats.length - 1;   // the last bar keeps its right side for the series names
    let lastY = null;
    S.forEach((s, k) => {
      const v = s.values[i] || 0, h = v / max * plotH, yy = t + plotH - (acc + v) / max * plotH;
      const hl = isHl(data, k, s.name) && (data.highlightCategory == null || data.highlightCategory === i || data.highlightCategory === c);
      out += R(cx - bw / 2, yy, bw, h, hl ? 'ch-hl' : `ch-s${(k % 4) + 1}`);
      if (v !== 0 && fits(v, bw)) out += T(cx, yy + h / 2 + 4.5, fmt(v, data.fmt), `ch-value${k === 0 || hl ? ' in' : ''}`);
      else if (v !== 0) {
        let ly = yy + h / 2 + 4.5;
        if (lastY != null && Math.abs(lastY - ly) < FS + 2) ly = lastY - (FS + 2);   // stack upward, clear of the label below
        lastY = ly;
        const x0 = left ? cx - bw / 2 - 5 : cx + bw / 2 + 5, lab = fmt(v, data.fmt);
        // A narrow gap takes the label a size down (11, still above the 10px chart-label floor).
        const tight = textW(lab) > band - bw - 8 ? ' font-size="11"' : '';
        out += T(x0, ly, lab, `ch-value ch-out${hl ? ' hl' : ''}`, left ? 'end' : 'start', tight);
      }
      if (i === cats.length - 1) out += T(cx + bw / 2 + 10, yy + h / 2 + 4.5, s.name, 'ch-series-label', 'start');
      acc += v;
    });
    if (data.totals !== false) out += T(cx, t + plotH - totals[i] / max * plotH - 6, fmt(totals[i], data.fmt), 'ch-value');
    out += T(cx, H - 6, c, 'ch-cat');
  });
  out += L(0, t + plotH, plotW, t + plotH, 'ch-axis');
  return frame(data, W, H, out);
}

export function grouped(data) {
  const W = data.width ?? 720, H = data.height ?? 340;
  const cats = data.categories, S = data.series;
  const t = top0(data) + 46, b = 26;
  const all = S.flatMap((s) => s.values), max = Math.max(0, ...all) || 1, plotH = H - t - b;
  const band = W / cats.length, gw = band * 0.74, bw = gw / S.length;
  let out = '', lx = 0;
  S.forEach((s, k) => {
    const cls = isHl(data, k, s.name) ? 'ch-hl' : `ch-s${(k % 4) + 1}`;
    out += R(lx, top0(data) + 6, 11, 11, cls) + T(lx + 16, top0(data) + 16, s.name, 'ch-series-label', 'start');
    lx += textW(s.name) + 40;
  });
  cats.forEach((c, i) => {
    const x0 = band * i + (band - gw) / 2;
    S.forEach((s, k) => {
      const v = s.values[i], hl = isHl(data, k, s.name), h = v / max * plotH;
      out += R(x0 + k * bw + 1, t + plotH - h, bw - 2, h, hl ? 'ch-hl' : `ch-s${(k % 4) + 1}`);
      out += T(x0 + k * bw + bw / 2, t + plotH - h - 5, fmt(v, data.fmt), `ch-value${hl ? ' hl' : ''}`, 'middle', ' font-size="12"');
    });
    out += T(band * i + band / 2, H - 6, c, 'ch-cat');
  });
  out += L(0, t + plotH, W, t + plotH, 'ch-axis');
  return frame(data, W, H, out);
}

// ---------- waterfall / bridge ----------
// steps: [{ label, value, total?: true }]; a total bar runs from zero, a delta floats on the running sum.
export function waterfall(data) {
  const W = data.width ?? 720, H = data.height ?? 340;
  const steps = data.steps;
  let run = 0; const bars = steps.map((s) => {
    if (s.total) { run = s.value; return { ...s, a: 0, b: s.value }; }
    const a = run; run += s.value; return { ...s, a, b: run };
  });
  const t = top0(data) + 22, b = 40;
  // data.floor starts the value axis above zero so small steps stay readable; totals get a break mark.
  const max = Math.max(0, ...bars.flatMap((x) => [x.a, x.b])), min = data.floor ?? Math.min(0, ...bars.flatMap((x) => [x.a, x.b]));
  const plotH = H - t - b, y = (v) => t + (max - v) / (max - min || 1) * plotH;
  const band = W / steps.length, bw = Math.min(band * 0.64, 84);
  let out = '';
  bars.forEach((s, i) => {
    const cx = band * i + band / 2, hl = isHl(data, i, s.label);
    const top = y(Math.max(s.a, s.b)), bot = y(Math.max(min, Math.min(s.a, s.b)));
    const cls = hl ? 'ch-hl' : s.total ? 'ch-total' : s.value >= 0 ? 'ch-pos' : 'ch-s3';
    out += R(cx - bw / 2, top, bw, Math.max(bot - top, 1), cls);
    if (s.total && data.floor) { const yb = y(min) - 14; out += `<path d="M${r1(cx - bw / 2 - 2)} ${r1(yb + 4)} L${r1(cx + bw / 2 + 2)} ${r1(yb - 4)} M${r1(cx - bw / 2 - 2)} ${r1(yb + 10)} L${r1(cx + bw / 2 + 2)} ${r1(yb + 2)}" class="ch-sep" style="stroke-width: 3"/>`; }
    const lab = s.total ? fmt(s.value, data.fmt) : fmt(s.value, data.fmt, true);
    out += T(cx, top - 6, lab, `ch-value${hl ? ' hl' : ''}`);
    if (i < bars.length - 1) out += L(cx + bw / 2, y(s.b), cx + band - bw / 2, y(s.b), 'ch-conn');
    const words = String(s.label).split(' '), lines = []; let cur = '';
    for (const w of words) { if (cur && textW(cur + ' ' + w, 12) > band - 6) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }
    lines.push(cur);
    lines.slice(0, 2).forEach((ln, k) => { out += T(cx, H - b + 18 + k * 14, ln, 'ch-cat', 'middle', ' font-size="12"'); });
  });
  out += L(0, y(Math.max(min, 0)), W, y(Math.max(min, 0)), 'ch-axis');
  return frame(data, W, H, out);
}

// ---------- line ----------
export function line(data) {
  const W = data.width ?? 720, H = data.height ?? 320;
  const cats = data.categories, S = data.series;
  const endW = Math.max(...S.map((s) => textW(s.name))) + 14;
  const all = S.flatMap((s) => s.values).filter((v) => v != null);
  const ticks = niceTicks(data.min ?? Math.min(...all), data.max ?? Math.max(...all), 4);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const axW = Math.max(...ticks.map((v) => textW(fmt(v, { ...data.fmt, dp: data.tickDp ?? 0 })))) + 10;
  const t = top0(data) + 18, b = 26, plotW = W - axW - endW, plotH = H - t - b;
  const inset = 22; // keeps the first and last points clear of the tick labels and the series names
  const x = (i) => axW + inset + (cats.length === 1 ? (plotW - 2 * inset) / 2 : i / (cats.length - 1) * (plotW - 2 * inset));
  const y = (v) => t + (hi - v) / (hi - lo || 1) * plotH;
  let out = '';
  ticks.forEach((v) => { out += L(axW, y(v), axW + plotW, y(v), 'ch-grid') + T(axW - 8, y(v) + 4, fmt(v, { ...data.fmt, dp: data.tickDp ?? 0 }), 'ch-muted', 'end'); });
  cats.forEach((c, i) => { out += T(x(i), H - 6, c, 'ch-cat'); });
  const ends = S.map((s, k) => { const idx = s.values.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0); const last = idx[idx.length - 1]; return { k, y: y(s.values[last]), x: x(last) }; });
  ends.sort((a, b2) => a.y - b2.y).forEach((e, j, arr) => { if (j && e.y - arr[j - 1].y < FS + 2) e.y = arr[j - 1].y + FS + 2; });
  S.forEach((s, k) => {
    const hl = isHl(data, k, s.name), cls = hl ? 'ch-line hl' : `ch-line${k ? ` s${Math.min(k + 1, 3)}` : ''}`;
    const pts = s.values.map((v, i) => (v == null ? null : `${r1(x(i))},${r1(y(v))}`)).filter(Boolean);
    out += `<polyline points="${pts.join(' ')}" class="${cls}"/>`;
    if (hl || S.length === 1) s.values.forEach((v, i) => { if (v == null) return; out += `<circle cx="${r1(x(i))}" cy="${r1(y(v))}" r="3.5" class="ch-dot${hl ? ' hl' : ''}"/>`; if (cats.length <= 8) out += T(x(i), y(v) - 9, fmt(v, data.fmt), `ch-value${hl ? ' hl' : ''}`, 'middle', ' font-size="12"'); });
    const e = ends.find((q) => q.k === k);
    out += T(e.x + 10, e.y + 4, s.name, `ch-series-label${hl ? ' ch-value hl' : ''}`, 'start');
  });
  return frame(data, W, H, out);
}

// ---------- combo: bars on the left scale, one line on its own scale ----------
export function combo(data) {
  const W = data.width ?? 720, H = data.height ?? 340;
  const cats = data.categories, B = data.bars, Ln = data.line;
  const t = top0(data) + 50, b = 26, plotH = H - t - b;
  const bmax = Math.max(...B.values) || 1;
  const lmin = Math.min(...Ln.values), lmax = Math.max(...Ln.values);
  const band = W / cats.length, bw = Math.min(band * 0.58, 84);
  const yb = (v) => t + plotH - v / bmax * plotH * 0.72;
  const yl = (v) => t + 6 + (lmax - v) / ((lmax - lmin) || 1) * plotH * 0.22;
  let out = '';
  out += R(0, top0(data) + 6, 11, 11, 'ch-bar') + T(16, top0(data) + 16, B.name, 'ch-series-label', 'start');
  const lx = textW(B.name) + 44;
  out += `<line x1="${lx}" y1="${top0(data) + 11.5}" x2="${lx + 16}" y2="${top0(data) + 11.5}" class="ch-line hl"/>` + T(lx + 22, top0(data) + 16, Ln.name, 'ch-series-label', 'start');
  const pts = [];
  cats.forEach((c, i) => {
    const cx = band * i + band / 2, v = B.values[i], hl = isHl(data, i, c);
    out += R(cx - bw / 2, yb(v), bw, t + plotH - yb(v), hl ? 'ch-hl' : 'ch-bar');
    out += T(cx, yb(v) + FS + 6, fmt(v, B.fmt ?? data.fmt), 'ch-value in');
    out += T(cx, H - 6, c, 'ch-cat');
    pts.push([cx, yl(Ln.values[i])]);
  });
  out += `<polyline points="${pts.map((p) => p.map(r1).join(',')).join(' ')}" class="ch-line hl"/>`;
  pts.forEach((p, i) => { out += `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="3.5" class="ch-dot hl"/>` + T(p[0], p[1] - 9, fmt(Ln.values[i], Ln.fmt), 'ch-value hl', 'middle', ' font-size="12"'); });
  out += L(0, t + plotH, W, t + plotH, 'ch-axis');
  return frame(data, W, H, out);
}

// ---------- marimekko: column width = segment size, height = share ----------
// segments: [{ label, parts: [{ name, value }] }]; widths from the column totals.
export function marimekko(data) {
  const W = data.width ?? 720, H = data.height ?? 360;
  const segs = data.segments, names = [...new Set(segs.flatMap((s) => s.parts.map((p) => p.name)))];
  const t = top0(data) + 6, b = 40, legendW = Math.max(...names.map((n) => textW(n))) + 14, plotW = W - legendW, plotH = H - t - b;
  const totals = segs.map((s) => s.parts.reduce((a, p) => a + p.value, 0)), grand = totals.reduce((a, v) => a + v, 0) || 1;
  let x = 0, out = '';
  segs.forEach((s, i) => {
    const w = totals[i] / grand * plotW; let acc = 0;
    s.parts.forEach((p) => {
      const k = names.indexOf(p.name), h = p.value / totals[i] * plotH, yy = t + acc;
      const hl = isHl(data, k, p.name);
      out += R(x, yy, w, h, hl ? 'ch-hl' : `ch-s${(k % 4) + 1}`) + `<rect x="${r1(x)}" y="${r1(yy)}" width="${r1(w)}" height="${r1(h)}" class="ch-sep"/>`;
      const pct = `${Math.round(p.value / totals[i] * 100)}%`;
      if (h > FS + 6 && w > textW(pct) + 8) out += T(x + w / 2, yy + h / 2 + 4.5, pct, `ch-value${k === 0 || hl ? ' in' : ''}`);
      if (i === segs.length - 1) out += T(plotW + 8, yy + h / 2 + 4.5, p.name, 'ch-series-label', 'start');
      acc += h;
    });
    out += T(x + w / 2, H - b + 17, s.label, 'ch-cat', 'middle', w < textW(s.label) ? ' font-size="11"' : '');
    out += T(x + w / 2, H - b + 33, fmt(totals[i], data.fmt), 'ch-muted', 'middle', ' font-size="12"');
    x += w;
  });
  return frame(data, W, H, out);
}

// ---------- football field ----------
// rows: [{ label, low, high }]; marker: { value, label } draws the reference line (offer, current price).
export function football(data) {
  const rows = data.rows, rowH = data.rowHeight ?? 34;
  const W = data.width ?? 720, t = top0(data) + (data.marker ? 24 : 6), H = data.height ?? t + rowH * rows.length + 26;
  const labW = Math.min(W * 0.34, Math.max(...rows.map((r) => textW(r.label))) + 16);
  const vals = rows.flatMap((r) => [r.low, r.high]).concat(data.marker ? [data.marker.value] : []);
  const ticks = niceTicks(Math.min(...vals), Math.max(...vals), 5);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const pad = 46, plotX = labW + pad, plotW = W - plotX - pad;
  const x = (v) => plotX + (v - lo) / (hi - lo || 1) * plotW;
  let out = '';
  ticks.forEach((v) => { out += L(x(v), t, x(v), t + rowH * rows.length, 'ch-grid') + T(x(v), H - 6, fmt(v, { ...data.fmt, dp: data.tickDp ?? 0 }), 'ch-muted'); });
  rows.forEach((r, i) => {
    const yy = t + i * rowH, bh = rowH * 0.56, hl = isHl(data, i, r.label);
    out += T(0, yy + rowH / 2 + 4.5, r.label, 'ch-cat', 'start');
    out += R(x(r.low), yy + (rowH - bh) / 2, x(r.high) - x(r.low), bh, hl ? 'ch-range hl' : 'ch-range');
    out += T(x(r.low) - 6, yy + rowH / 2 + 4.5, fmt(r.low, data.fmt), 'ch-value', 'end') + T(x(r.high) + 6, yy + rowH / 2 + 4.5, fmt(r.high, data.fmt), 'ch-value', 'start');
  });
  if (data.marker) {
    const mx = x(data.marker.value);
    out += L(mx, t - 6, mx, t + rowH * rows.length, 'ch-marker');
    out += T(mx, t - 12, `${data.marker.label ?? ''} ${fmt(data.marker.value, data.fmt)}`.trim(), 'ch-value hl');
  }
  return frame(data, W, H, out);
}

// ---------- harvey ball (0 to 4 quarters) ----------
export function harvey(data) {
  const v = Math.max(0, Math.min(4, Number(data.value ?? data))), s = data.size ?? 18, r = s / 2 - 1.5, c = s / 2;
  let fill = '';
  if (v === 4) fill = `<circle cx="${c}" cy="${c}" r="${r}" class="ch-hb-fill"/>`;
  else if (v > 0) {
    const a = v / 4 * 2 * Math.PI, ex = c + r * Math.sin(a), ey = c - r * Math.cos(a);
    fill = `<path d="M${c} ${c} L${c} ${c - r} A${r} ${r} 0 ${v > 2 ? 1 : 0} 1 ${r1(ex)} ${r1(ey)} Z" class="ch-hb-fill"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" class="dm-chart dm-harvey" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img" aria-label="${v} of 4"><circle cx="${c}" cy="${c}" r="${r}" class="ch-hb-ring"/>${fill}</svg>`;
}

// ---------- sparkline ----------
export function sparkline(data) {
  const vals = data.values, W = data.width ?? 120, H = data.height ?? 28, p = 3;
  const min = Math.min(...vals), max = Math.max(...vals);
  const x = (i) => p + i / (vals.length - 1 || 1) * (W - 2 * p), y = (v) => p + (max - v) / (max - min || 1) * (H - 2 * p);
  const pts = vals.map((v, i) => `${r1(x(i))},${r1(y(v))}`).join(' ');
  const src = data.src ? ` data-src="${esc(data.src)}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="dm-chart dm-spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="trend"${src}><polyline points="${pts}" class="ch-spark"/><circle cx="${r1(x(vals.length - 1))}" cy="${r1(y(vals[vals.length - 1]))}" r="2.5" class="ch-spark-end"/></svg>`;
}


// ---------- lean diagrams: ring metric, cycle, flow ----------
// Split a short label into at most `max` lines of about `per` characters.
function wrap(s, per = 16, max = 2) {
  const out = []; let cur = '';
  for (const w of String(s).split(/\s+/)) { if (cur && (cur + ' ' + w).length > per && out.length < max - 1) { out.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w; }
  if (cur) out.push(cur);
  return out;
}
const TL = (x, y, lines, cls, anchor = 'middle', lh = FS * 1.25) => lines.map((l, i) => T(x, y + i * lh, l, cls, anchor)).join('');
const arrowHead = (x, y, ang, cls, s = 7) => { const a = ang, p = (d) => `${r1(x + s * Math.cos(a + d))},${r1(y + s * Math.sin(a + d))}`; return `<polygon points="${r1(x)},${r1(y)} ${p(Math.PI - 0.45)} ${p(Math.PI + 0.45)}" class="${cls}"/>`; };

// ring: one metric as a ring. value / total (or pct 0-100) sets the arc; center is the big figure.
// { value, total | pct, center: "$300T+", sub: "Global AUM 2032E", arcLabel: "28%+", size: 260, highlight: true }
export function ring(data) {
  const S = data.size ?? 260, W = data.width ?? S, H = data.height ?? S, c = { x: W / 2, y: H / 2 }, sw = Math.max(10, S * 0.075), r = S / 2 - sw / 2 - 2;
  const pct = Math.max(0, Math.min(100, data.pct ?? (100 * Number(data.value) / Number(data.total || 100))));
  const a = pct / 100 * 2 * Math.PI, ex = c.x + r * Math.sin(a), ey = c.y - r * Math.cos(a);
  const arc = pct >= 99.95 ? `<circle cx="${r1(c.x)}" cy="${r1(c.y)}" r="${r1(r)}" class="ch-ring ${data.highlight === false ? '' : 'hl'}" stroke-width="${r1(sw)}"/>`
    : pct > 0 ? `<path d="M${r1(c.x)} ${r1(c.y - r)} A${r1(r)} ${r1(r)} 0 ${pct > 50 ? 1 : 0} 1 ${r1(ex)} ${r1(ey)}" class="ch-ring ${data.highlight === false ? '' : 'hl'}" stroke-width="${r1(sw)}"/>` : '';
  const mid = a / 2, lx = c.x + (r + sw * 0.9) * Math.sin(mid), ly = c.y - (r + sw * 0.9) * Math.cos(mid);
  const center = data.center != null ? T(c.x, c.y + (data.sub ? 2 : FS * 0.6), data.center, 'ch-value ch-ring-fig', 'middle', ` style="font-size:${r1(S * 0.13)}px"`) : '';
  const sub = data.sub ? TL(c.x, c.y + S * 0.13 * 0.5 + FS + 2, wrap(data.sub, 18, 2), 'ch-muted') : '';
  const al = data.arcLabel ? T(lx, ly + FS * 0.35, data.arcLabel, 'ch-value hl', lx < c.x - 4 ? 'end' : lx > c.x + 4 ? 'start' : 'middle') : '';
  return frame(data, W, H, `<circle cx="${r1(c.x)}" cy="${r1(c.y)}" r="${r1(r)}" class="ch-ring-track" stroke-width="${r1(sw)}"/>${arc}${center}${sub}${al}`, 'dm-ring');
}

// cycle: 3 to 6 steps round a loop, each arc with an arrow; labels sit outside the ring.
// { steps: ["Disciplined investing", "Strong returns", ...], highlight: 0, width: 700, height: 450 }
export function cycle(data) {
  const W = data.width ?? 700, H = data.height ?? 450, steps = data.steps || [], n = steps.length;
  if (n < 3 || n > 6) throw new Error('cycle takes 3 to 6 steps');
  const c = { x: W / 2, y: H / 2 + top0(data) / 2 }, r = Math.min(W * 0.3, (H - top0(data)) * 0.36), sw = Math.max(8, r * 0.09), gap = 0.14;
  let out = `<circle cx="${r1(c.x)}" cy="${r1(c.y)}" r="${r1(r)}" class="ch-ring-track" stroke-width="${r1(sw)}"/>`;
  steps.forEach((s, i) => {
    const a0 = (i / n) * 2 * Math.PI + gap, a1 = ((i + 1) / n) * 2 * Math.PI - gap;
    const P = (a) => [c.x + r * Math.sin(a), c.y - r * Math.cos(a)];
    const [x0, y0] = P(a0), [x1, y1] = P(a1), hl = isHl(data, i, typeof s === 'string' ? s : s.label);
    out += `<path d="M${r1(x0)} ${r1(y0)} A${r1(r)} ${r1(r)} 0 0 1 ${r1(x1)} ${r1(y1)}" class="ch-ring${hl ? ' hl' : ''}" stroke-width="${r1(sw)}"/>`;
    out += arrowHead(x1 + Math.cos(a1) * sw * 0.6, y1 + Math.sin(a1) * sw * 0.6, a1, hl ? 'ch-hl' : 'ch-bar', sw * 1.3);
    const am = (i / n) * 2 * Math.PI, lx = c.x + (r + sw + 16) * Math.sin(am), ly = c.y - (r + sw + 16) * Math.cos(am);
    const label = typeof s === 'string' ? s : s.label, val = typeof s === 'string' ? null : s.value;
    const anchor = Math.abs(lx - c.x) < 8 ? 'middle' : lx < c.x ? 'end' : 'start';
    const lines = wrap(label, 18, 2), y = ly + (Math.cos(am) > 0.5 ? -((lines.length - 1) * FS * 1.25) - (val ? FS * 1.3 : 0) : Math.cos(am) < -0.5 ? FS : FS * 0.35);
    out += (val != null ? T(lx, y, val, `ch-value${hl ? ' hl' : ''}`, anchor) : '') + TL(lx, y + (val != null ? FS * 1.3 : 0), lines, hl ? 'ch-value' : 'ch-cat', anchor);
  });
  if (data.center) out += TL(c.x, c.y - ((wrap(data.center, 16, 3).length - 1) * FS * 0.62) + FS * 0.35, wrap(data.center, 16, 3), 'ch-value');
  return frame(data, W, H, out, 'dm-cycle');
}

// flow: 3 to 5 steps left to right, a short label each (4 words or fewer) and an optional figure.
// { steps: [{ label: "Fund the plant", value: "$0" }, ...], highlight: 2, width: 1164, height: 220 }
export function flow(data) {
  const W = data.width ?? 1164, H = data.height ?? 220, steps = (data.steps || []).map((s) => (typeof s === 'string' ? { label: s } : s)), n = steps.length;
  if (n < 2 || n > 6) throw new Error('flow takes 2 to 6 steps');
  const t = top0(data), ar = 44, bw = (W - ar * (n - 1)) / n, bh = Math.min(H - t - 4, Math.max(150, (H - t) * 0.6)), y0 = t + (H - t - bh) / 2;   // nodes grow with a taller box, so the diagram fills the body it is drawn for
  let out = '';
  steps.forEach((s, i) => {
    const x = i * (bw + ar), hl = isHl(data, i, s.label), lines = wrap(s.label, Math.max(10, Math.floor(bw / 9)), 2);
    out += `<rect x="${r1(x)}" y="${r1(y0)}" width="${r1(bw)}" height="${r1(bh)}" class="${hl ? 'ch-node hl' : 'ch-node'}"/>`;
    const blockH = (s.value != null ? FS * 2.4 : 0) + lines.length * FS * 1.25, yy = y0 + (bh - blockH) / 2 + FS;
    if (s.value != null) out += T(x + bw / 2, yy + FS * 0.9, s.value, `ch-value ch-flow-fig${hl ? ' on' : ''}`, 'middle', ` style="font-size:${FS * 2}px"`);
    out += TL(x + bw / 2, yy + (s.value != null ? FS * 2.4 : 0), lines, `ch-cat${hl ? ' on' : ''}`);
    if (i < n - 1) { const ax = x + bw + 8, ay = y0 + bh / 2; out += L(ax, ay, ax + ar - 18, ay, 'ch-axis') + arrowHead(ax + ar - 10, ay, 0, 'ch-bar', 8); }
  });
  return frame(data, W, H, out, 'dm-flow');
}

export const TYPES = { bar, hbar: (d) => hbar({ ...d, orient: 'h' }), stacked, grouped, waterfall, bridge: waterfall, line, combo, marimekko, football, harvey, sparkline, ring, cycle, flow };

// The most decimals in any number of the chart's data (capped at 2), for a uniform label format.
function dataDp(data) {
  let dp = 0;
  const walk = (x, k) => {
    if (typeof x === 'number' && Number.isFinite(x) && !/^(width|height|rowHeight|highlight|highlightCategory|floor|min|max|size|tickDp|pct)$/.test(k || '')) { const m = /\.(\d+)/.exec(String(x)); if (m) dp = Math.max(dp, Math.min(2, m[1].length)); }
    else if (Array.isArray(x)) x.forEach((v) => walk(v, k));
    else if (x && typeof x === 'object') for (const [kk, v] of Object.entries(x)) if (kk !== 'fmt') walk(v, kk);
  };
  walk(data);
  return dp;
}
export function chart(type, data) {
  const f = TYPES[type];
  if (!f) throw new Error(`unknown chart type "${type}" (valid: ${Object.keys(TYPES).join(', ')})`);
  const d = { type, ...data };
  if (!d.fmt || d.fmt.dp == null) { const dp = dataDp(data); if (dp) d.fmt = { ...(d.fmt || {}), dp }; }
  return f(d);
}

// Preview only: a standalone file has no base.css, so this embeds a neutral palette.
// Never paste a --standalone svg into a deck; decklint fails its literal colours.
const PREVIEW = `<style>.dm-chart{font-family:Arial,sans-serif}text{font-size:13px;fill:#333}.ch-title,.ch-value,.ch-series-label{font-weight:700;fill:#111}.ch-value.in{fill:#fff}.ch-value.hl{fill:#1F5FA8}.ch-muted{fill:#666}.ch-axis{stroke:#111}.ch-grid{stroke:#ccc;stroke-width:.75}.ch-conn{stroke:#888;stroke-dasharray:2 2}.ch-bar,.ch-total,.ch-s1,.ch-hb-fill{fill:#14202B}.ch-hl,.ch-range.hl,.ch-spark-end{fill:#1F5FA8}.ch-pos,.ch-s2{fill:#7d858c}.ch-s3,.ch-range{fill:#b4b9bd}.ch-s4{fill:#dcdfe1}.ch-sep{stroke:#fff;fill:none}.ch-line,.ch-spark{fill:none;stroke:#14202B;stroke-width:2}.ch-line.hl,.ch-marker{stroke:#1F5FA8}.ch-dot{fill:#fff;stroke:#1F5FA8;stroke-width:2}.ch-hb-ring{fill:#fff;stroke:#14202B;stroke-width:1.5}</style>`;

// Compare realpaths: called through the ~/.claude/skills/deckmark symlink, argv[1] is the link path.
const IS_MAIN = (() => { try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (IS_MAIN) {
  const [type, ...rest] = process.argv.slice(2);
  const i = rest.indexOf('--data');
  if (!type || i < 0) { console.error(`usage: node charts.mjs <${Object.keys(TYPES).join('|')}> --data file.json [--standalone] > out.svg`); process.exit(2); }
  let svg = chart(type, JSON.parse(readFileSync(rest[i + 1], 'utf8')));
  if (rest.includes('--standalone')) svg = svg.replace(/(<svg[^>]*>)/, `$1${PREVIEW}`);
  process.stdout.write(svg + '\n');
}
