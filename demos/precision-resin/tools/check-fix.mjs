import { chromium } from 'playwright';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
p.setDefaultTimeout(8000); await p.goto(url); await p.waitForTimeout(3000);
const top = await p.evaluate(() => document.getElementById('layers').getBoundingClientRect().top + scrollY);
const H = await p.evaluate(() => document.getElementById('layers').offsetHeight);
for (const [k, f] of [['a', 0.0], ['b', 0.22], ['c', 0.45], ['d', 0.7]]) {
  await p.evaluate((y) => scrollTo(0, y), top + 260 + f * H); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/layers-${k}.png` });
}
await p.evaluate(() => document.getElementById('price').scrollIntoView()); await p.waitForTimeout(600);
const res = [];
for (const v of [50, 300, 2500]) for (const fin of ['Gloss coating', 'Resin bound']) {
  await p.evaluate((fin) => [...document.querySelectorAll('#price button')].find((x) => x.textContent === fin).click(), fin);
  await p.evaluate((v) => { const r = document.querySelector('#price input[type=range]'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(r, v); r.dispatchEvent(new Event('input', { bubbles: true })); }, v);
  for (let t = 0; t < 8; t++) { await p.waitForTimeout(200); res.push(await p.evaluate(() => { const d = [...document.querySelectorAll('#price .font-display')].find((e) => e.textContent.includes('£')); const r = d.getBoundingClientRect(); return `${d.textContent} h=${Math.round(r.height)} fs=${getComputedStyle(d).fontSize} sw=${d.scrollWidth} cw=${d.parentElement.clientWidth}`; })); }
}
await p.evaluate(() => [...document.querySelectorAll('#price .font-display')].find((e) => e.textContent.includes('£')).scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/price.png` });
console.log([...new Set(res)].join('\n')); await b.close();
