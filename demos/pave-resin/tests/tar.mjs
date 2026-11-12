// node tar.mjs <url> <out> [w h] -> tarmac roll with the hero UI hidden (scene only)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [base, out, w = 390, h = 844] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const mob = +w < 900;
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
const p = await ctx.newPage();
await p.goto(base + '/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__heroReady, null, { timeout: 30000 }); await p.waitForTimeout(3500);
await p.addStyleTag({ content: '.hp-in,.hp-side,.hp-copy,.hoffer,.bbar{visibility:hidden!important}' });
await p.evaluate(() => window.__hp.auto('tarmac')); await p.waitForTimeout(2800);
await p.evaluate(() => window.__hp.auto('tarmac'));
for (const [n, d] of [['a', 500], ['b', 500], ['c', 500], ['done', 2500]]) { await p.waitForTimeout(d); await p.screenshot({ path: `${out}/${mob ? 'm' : 'd'}-t-${n}.png` }); }
await b.close();
