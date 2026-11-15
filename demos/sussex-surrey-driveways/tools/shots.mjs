import { chromium } from 'playwright';
const [url, out, w, h] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]];
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700 });
const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < H; y += h) {
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}-${String(i++).padStart(2,'0')}.jpg`, quality: 60 });
}
console.log('height', H, 'screens', (H / h).toFixed(1), 'errors', JSON.stringify(errs.slice(0,8)));
await b.close();
