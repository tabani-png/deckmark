#!/usr/bin/env node
// Deckmark render: deck.html -> deck.pdf + page-NN.png (1x; plus page-NN@2x.png on --hires).
// usage: node render.mjs deck.html --out out/ [--hires] [--name deck] [--pages 1-2]
//   --pages takes "1-2", "3" or "1,4-6": PNGs of those pages only, no PDF (the fast first look).
// Waits for web fonts. Works for slides-16x9 (1280x720) and report-a4 (body data-format="report-a4").
import { mkdirSync, realpathSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function openDeck(browser, htmlPath, scale = 1) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(resolve(htmlPath)).href, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => page.waitForLoadState('load'));
  await page.evaluate(async () => {
    if (document.fonts) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const format = await page.evaluate(() => document.body.dataset.format || 'slides-16x9');
  return { page, format };
}

export function parsePages(spec) {
  if (!spec) return null;
  const set = new Set();
  for (const part of String(spec).split(',')) {
    const m = /^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(part);
    if (!m) throw new Error(`--pages "${spec}": use 1-2, 3 or 1,4-6`);
    const a = Number(m[1]), b = Number(m[2] ?? m[1]);
    if (a < 1 || b < a) throw new Error(`--pages "${spec}": pages count from 1, low to high`);
    for (let i = a; i <= b; i++) set.add(i);
  }
  return set;
}

export async function render(htmlPath, outDir, { hires = false, name = null, pages = null } = {}) {
  const { chromium } = await import('playwright');
  const out = resolve(outDir); mkdirSync(out, { recursive: true });
  const stem = name || basename(htmlPath).replace(/\.html?$/, '');
  const browser = await chromium.launch();
  try {
    const { page, format } = await openDeck(browser, htmlPath, 1);
    const want = parsePages(pages);
    const pdf = want ? null : join(out, `${stem}.pdf`);
    if (pdf) {
      await page.emulateMedia({ media: 'print' });
      await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      await page.emulateMedia({ media: 'screen' });
    }
    const shots = [];
    const passes = hires ? [[page, ''], [(await openDeck(browser, htmlPath, 2)).page, '@2x']] : [[page, '']];
    for (const [p, tag] of passes) {
      const slides = await p.$$('section.slide');
      for (let i = 0; i < slides.length; i++) {
        if (want && !want.has(i + 1)) continue;
        const f = join(out, `page-${String(i + 1).padStart(2, '0')}${tag}.png`);
        await slides[i].screenshot({ path: f, animations: 'disabled' });
        shots.push(f);
      }
    }
    const count = (await page.$$('section.slide')).length;
    return { pdf, shots, count, format };
  } finally { await browser.close(); }
}

// Compare realpaths: called through the ~/.claude/skills/deckmark symlink, argv[1] is the link path.
const IS_MAIN = (() => { try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (IS_MAIN) {
  const a = process.argv.slice(2);
  const html = a.find((x, i) => !x.startsWith('--') && !['--out', '--name', '--pages'].includes(a[i - 1]));
  const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  if (!html) { console.error('usage: node render.mjs deck.html --out out/ [--hires] [--name deck] [--pages 1-2]'); process.exit(2); }
  render(html, opt('--out', 'out'), { hires: a.includes('--hires'), name: opt('--name', null), pages: opt('--pages', null) })
    .then((r) => console.log(`${r.format}: ${r.count} pages -> ${r.pdf ? `${r.pdf} + ` : 'no pdf (--pages) + '}${r.shots.length} png in ${resolve(opt('--out', 'out'))}`))
    .catch((e) => { console.error(`render failed: ${e.message}`); process.exit(1); });
}
