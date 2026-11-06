// node scripts/shoot.mjs <url> <outPrefix> <w> <h> [sel1,sel2,...]  -> element/section screenshots + errors
import { chromium } from 'playwright';
const [url, out, w = 1440, h = 900, sels = ''] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const mob = +w < 600;
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
const errs = [];
p.on('console', m => { if (/error|warn/i.test(m.type())) errs.push('[console] ' + m.text().slice(0, 300)); });
p.on('pageerror', e => errs.push('[pageerror] ' + e.message));
p.on('requestfailed', r => errs.push('[reqfail] ' + r.url()));
p.on('response', r => { if (r.status() >= 400) errs.push('[' + r.status() + '] ' + r.url()); });
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(1500);
for (const s of sels.split(',').filter(Boolean)) {
  const [sel, scrollFrac = '0', wait = '1200'] = s.split('@');
  await p.evaluate(([sel, f]) => { const el = document.querySelector(sel); const r = el.getBoundingClientRect(); scrollTo(0, scrollY + r.top + (r.height - innerHeight) * +f); }, [sel, scrollFrac]);
  await p.waitForTimeout(+wait);
  await p.screenshot({ path: `${out}-${sel.replace(/[^a-z0-9]/gi, '')}-${scrollFrac}.png` });
}
console.log(errs.join('\n') || 'no errors');
await b.close();
