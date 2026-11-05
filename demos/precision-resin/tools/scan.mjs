import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto(process.argv[2] + '/?gl=off', { waitUntil: 'networkidle' });
for (let y = 0; y < 40000; y += 600) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60); }
await p.waitForTimeout(800);
const t = await p.evaluate(() => document.body.innerText);
console.log(t); console.error('ERRORS', JSON.stringify(errs));
await b.close();
