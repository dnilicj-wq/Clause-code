import { chromium } from 'playwright';
const out = process.argv[2], url = 'https://clientgateway-master-v3.vercel.app/';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await c.newPage();
await p.goto(url + '?gl=force', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/1-hero.png` });
const top = (sel) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
const ex = await top('[aria-label="See it in your space"]');
const exH = await p.evaluate(() => document.querySelector('[aria-label="See it in your space"]').offsetHeight);
for (const [k, f] of [['a-start', 0.0], ['b-expanding', 0.4], ['c-finished', 1]]) {
  await p.evaluate((y) => scrollTo(0, y), ex + (exH - 844) * f); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/2-expansion-${k}.png` });
}
const ba = await p.evaluate(() => { const el = [...document.querySelectorAll('#gallery img')].find((i) => i.src.includes('garage-bare')).closest('div.relative.mt-4'); return el.getBoundingClientRect().top + scrollY; });
await p.evaluate((y) => scrollTo(0, y - 250), ba); await p.waitForTimeout(2600);
{ const bx = await p.evaluate(() => { const r = [...document.querySelectorAll('#gallery img')].find((i) => i.src.includes('garage-bare')).closest('div.relative.mt-4').getBoundingClientRect(); return [r.left + r.width * 0.5, r.top + r.height / 2]; }); await p.mouse.click(bx[0], bx[1]); await p.waitForTimeout(400); }
await p.screenshot({ path: `${out}/3-before-after.png` });
const ow = await top('[aria-label="Owner"]');
await p.evaluate((y) => scrollTo(0, y), ow); await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}/4-owner.png` });
// header mid-scroll over busy content: the layers section and the light chat section
const ly = await top('#layers');
await p.evaluate((y) => scrollTo(0, y + 900), ly); await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/5-header-midscroll.png`, clip: { x: 0, y: 0, width: 390, height: 300 } });
const how = await top('#how');
await p.evaluate((y) => scrollTo(0, y + 40), how); await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/5-header-over-light-section.png`, clip: { x: 0, y: 0, width: 390, height: 300 } });
await b.close();
