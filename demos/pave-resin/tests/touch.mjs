// node touch.mjs <url> <out>  -> real touch input on the 3D hero (CDP), plus the configurator's first paint
import { chromium } from 'playwright';
const [base, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
const t0 = Date.now(); await p.goto(base + '/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__heroReady, null, { timeout: 30000 }); console.log('3D ready after', Date.now() - t0, 'ms');
await p.waitForFunction(() => document.querySelector('.hp-act')?.dataset.m === 'hint', null, { timeout: 8000 }); console.log('auto-play done + hint after', Date.now() - t0, 'ms');
const swipe = async (pts) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
  for (const q of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [q] }); await p.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(600); };
const line = (x0, y0, x1, y1, n = 14) => Array.from({ length: n + 1 }, (_, i) => ({ x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n }));
await swipe(line(200, 420, 205, 160));
console.log('vertical swipe -> scrollY', await p.evaluate(() => scrollY), '| laid:', await p.evaluate(() => document.querySelector('.hp-act').dataset.m === 'rest'));
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
const tb = await p.locator('.hp-tiles').boundingBox();
await swipe(line(tb.x + 20, tb.y + 20, tb.x + tb.width - 20, tb.y + 24));
console.log('drag across the tiles -> laid:', await p.evaluate(() => document.querySelector('.hp-act').dataset.m === 'rest'));
await p.locator('.hp-tiles button[data-s=resin]').tap(); await p.waitForTimeout(1600);
console.log('tap tile -> laid by user:', await p.evaluate(() => document.querySelector('.hp-act').dataset.m === 'rest'));
await swipe(line(340, 250, 60, 262, 20));
console.log('horizontal drag -> scrollY', await p.evaluate(() => scrollY), '| laid:', await p.evaluate(() => document.querySelector('.hp-act').dataset.m === 'rest'));
await p.screenshot({ path: `${out}/m-touch-drag.png` });
await p.locator('.hp-go').tap(); await p.waitForTimeout(600);
console.log('tap Design it & book -> modal open:', await p.evaluate(() => document.querySelector('dialog.bk').open));
await p.locator('dialog.bk .bkx').tap(); await p.waitForTimeout(500);
// configurator first paint
await p.evaluate(() => document.querySelector('#design').scrollIntoView()); await p.waitForTimeout(150);
console.log('cfg at once:', await p.evaluate(() => { const l = document.querySelector('.cfg-load'); return { loaderText: (l?.textContent || '').trim(), photo: !!l?.querySelector('img')?.complete }; }));
await p.locator('.cfg-stage').screenshot({ path: `${out}/m-cfg-instant.png` });
await p.waitForTimeout(2500); await p.locator('.cfg-stage').screenshot({ path: `${out}/m-cfg-live.png` });
await b.close();
