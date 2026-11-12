// node auto.mjs <url> <out> [w h] -> the automatic lay: frames on load and after each surface tap
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [base, out, w = 390, h = 844] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const mob = +w < 900, tag = mob ? 'm' : 'd';
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const t0 = Date.now();
await p.goto(base + '/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__heroReady, null, { timeout: 30000 });
const tr = Date.now() - t0;
for (const s of [0, 1, 2, 3]) { await p.waitForTimeout(s ? 1000 : 0); await p.screenshot({ path: `${out}/${tag}-load-${s}s.png` }); }
console.log('3D took over at', tr, 'ms after navigation');
await p.waitForTimeout(3000); // let the prebuild finish
for (const k of ['resin', 'tarmac', 'porcelain', 'block']) {
  await p.locator(`.hp-tiles button[data-s=${k}]`).click();
  for (const s of [1, 2, 3]) { await p.waitForTimeout(1000); await p.screenshot({ path: `${out}/${tag}-${k}-${s}s.png` }); }
}
console.log(errs.join('\n') || 'no errors'); await b.close();
