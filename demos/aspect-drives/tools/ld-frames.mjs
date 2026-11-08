import { chromium } from 'playwright';
const [url, out, w, h] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.goto(url);
const ts = [150, 500, 900, 1300, 1800, 2200, 2500, 2700, 2900, 3200, 3700];
let last = Date.now(); const t0 = last;
for (const [i, t] of ts.entries()) { const wait = t - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait); await p.screenshot({ path: `${out}-${String(i).padStart(2, '0')}.jpg`, quality: 70 }); }
console.log('errors', errs);
await b.close();
