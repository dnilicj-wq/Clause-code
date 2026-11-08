// node tools/anim.mjs <url> <outprefix> w h [ms list]
import { chromium } from 'playwright';
const [url, out, w, h] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]];
const ts = (process.argv[6] || '300,1200,2200,2800,3400,4000,4800,5600,6600,8000').split(',').map(Number);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700 });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
const t0 = Date.now(); await p.goto(url);
for (const [i, t] of ts.entries()) { const wt = t - (Date.now() - t0); if (wt > 0) await p.waitForTimeout(wt); await p.screenshot({ path: `${out}-${String(i).padStart(2, '0')}.jpg`, quality: 70 }); }
console.log('errors', JSON.stringify(errs.slice(0, 5)), 'heroReady', await p.evaluate(() => window.__heroReady));
await b.close();
