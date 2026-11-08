import { chromium } from 'playwright';
const [,, url, out, w, h, ...acts] = process.argv;
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: +w < 700, isMobile: +w < 700 });
const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push(String(e)));
await p.goto(url); let n = 0;
for (const a of acts) {
  if (a.startsWith('wait:')) await p.waitForTimeout(+a.slice(5));
  else if (a.startsWith('click:')) await p.click(a.slice(6), { timeout: 5000 }).catch((e) => errs.push('click ' + a + ' ' + String(e).slice(0, 300)));
  else if (a.startsWith('scroll:')) { await p.evaluate((s) => { if (/^[0-9]+$/.test(s)) scrollTo(0, +s); else document.querySelector(s)?.scrollIntoView(); }, a.slice(7)); await p.waitForTimeout(900); }
  else if (a === 'shot') await p.screenshot({ path: `${out}-${n++}.png` });
}
console.log(errs.join('\n') || 'no errors'); await b.close();
