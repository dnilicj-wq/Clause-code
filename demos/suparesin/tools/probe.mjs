import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2]); await p.waitForTimeout(1500);
await p.evaluate(() => document.getElementById('work').scrollIntoView()); await p.waitForTimeout(800);
console.log(await p.evaluate(() => [...document.querySelectorAll('#work figure')].slice(0, 4).map((f) => [f.getAttribute('style'), f.getBoundingClientRect().width | 0, f.querySelector('img').naturalWidth])));
await b.close();
