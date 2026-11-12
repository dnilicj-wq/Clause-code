// node r8.mjs <url> <out> -> 390px: loader exit (lay must be mid-way), tarmac mid-roll + finished, popup twice from "Design it & book"
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [base, out] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(base + '/', { waitUntil: 'commit' });
await p.waitForSelector('.pl', { state: 'attached' });
const t0 = await p.evaluate(() => performance.now());
await p.screenshot({ path: `${out}/1-loader.png` });
await p.waitForSelector('.pl.out', { state: 'attached', timeout: 8000 });
const tx = await p.evaluate(() => Math.round(performance.now()));
for (const [i, d] of [[0, 0], [1, 350], [2, 450], [3, 2400]]) { await p.waitForTimeout(d); await p.screenshot({ path: `${out}/2-exit-${i}.png` }); }
console.log('loader exit started at', tx, 'ms');
await p.waitForTimeout(2500);
await p.locator('.hp-tiles button[data-s=tarmac]').tap(); await p.waitForTimeout(2600); // first time: texture worker
await p.locator('.hp-tiles button[data-s=block]').tap(); await p.waitForTimeout(400);
await p.locator('.hp-tiles button[data-s=tarmac]').tap();
for (const [n, d] of [['3-tarmac-roll-a', 700], ['3-tarmac-roll-b', 600], ['3-tarmac-roll-c', 500], ['4-tarmac-done', 2600]]) { await p.waitForTimeout(d); await p.screenshot({ path: `${out}/${n}.png` }); }
const st = () => p.evaluate(() => { const d = document.querySelector('dialog.bk'); return { open: d.open, step: d.querySelector('.qstep').textContent, chip: d.querySelector('.chip').hidden ? '-' : d.querySelector('.chip span').textContent }; });
for (const i of [1, 2]) {
  await p.locator('.hp-go').tap(); await p.waitForTimeout(600);
  console.log('Design it & book #' + i, JSON.stringify(await st())); await p.screenshot({ path: `${out}/5-popup-${i}.png` });
  await p.locator('dialog.bk fieldset.cur .opts button').first().tap(); await p.waitForTimeout(400);
  await p.locator('dialog.bk .bkx').tap(); await p.waitForTimeout(450);
}
await p.evaluate(() => window.cgBook()); await p.waitForTimeout(400); console.log('plain open', JSON.stringify(await st()));
console.log(errs.join('\n') || 'no errors'); await b.close();
