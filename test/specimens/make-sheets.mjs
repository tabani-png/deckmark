#!/usr/bin/env node
// Theme pictures: for each theme (or the slugs given), build its specimen, render it, lint it with
// --render --facts (must be clean), then compose a 2x2 contact sheet about 1600px wide into
// skills/deckmark/references/themes/<slug>.png. Build output goes to test/out/specimens (git-ignored).
// usage: node make-sheets.mjs [slug ...]
import { readdirSync, existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const SCRIPTS = join(ROOT, 'skills', 'deckmark', 'scripts');
const THEMES = join(ROOT, 'skills', 'deckmark', 'references', 'themes');
const OUT = join(ROOT, 'test', 'out', 'specimens');
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(HERE).filter((f) => existsSync(join(HERE, f, 'spec.json'))).sort();
const { chromium } = await import('playwright');
let failed = 0;
const browser = await chromium.launch();
try {
  for (const slug of slugs) {
    const dir = join(OUT, slug), facts = join(HERE, slug, 'facts.json');
    const before = failed;
    mkdirSync(dir, { recursive: true });
    execFileSync('node', [join(HERE, 'build-specimen.mjs'), slug, dir], { stdio: 'inherit' });
    execFileSync('node', [join(SCRIPTS, 'render.mjs'), join(dir, 'deck.html'), '--out', join(dir, 'out'), '--hires'], { stdio: 'ignore' });
    try {
      execFileSync('node', [join(SCRIPTS, 'decklint.mjs'), join(dir, 'deck.html'), '--render', '--strict', '--facts', facts], { stdio: 'pipe' });
    } catch (e) { failed++; console.log(`  FAIL lint ${slug}\n${e.stdout}`); }
    const ok = failed === before;
    const a4 = /data-format="report-a4"/.test(readFileSync(join(dir, "deck.html"), "utf8"));
    const cellW = 784, gap = 16;
    const imgs = [1, 2, 3, 4].map((i) => pathToFileURL(join(dir, 'out', `page-0${i}@2x.png`)).href);
    const html = `<!doctype html><html><body style="margin:0;background:#D7D9DC">
<div style="display:grid;grid-template-columns:${cellW}px ${cellW}px;gap:${gap}px;padding:${gap}px">
${imgs.map((u) => `<img src="${u}" style="width:${cellW}px;display:block;box-shadow:0 1px 3px rgba(0,0,0,.18)">`).join('\n')}
</div></body></html>`;
    const tmp = join(dir, 'sheet.html'); writeFileSync(tmp, html);
    const page = await browser.newPage({ viewport: { width: cellW * 2 + gap * 3, height: 600 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
    await page.screenshot({ path: ok ? join(THEMES, `${slug}.png`) : join(dir, "sheet.png"), fullPage: true });
    await page.close();
    if (ok) console.log(`  ok   ${slug} -> references/themes/${slug}.png${a4 ? ' (A4)' : ''}`);
  }
} finally { await browser.close(); }
process.exit(failed ? 1 : 0);
