import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(process.argv[2] + '?gl=off', { waitUntil: 'networkidle' });
for (let y = 0; y < 16000; y += 700) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120); }
const r = await p.evaluate(() => [...document.querySelectorAll('main > *, main section, footer')].filter(e=>e.closest('section')===e||e.tagName==='FOOTER').map(e => [(e.getAttribute('aria-label')||e.id||e.tagName), Math.round(e.getBoundingClientRect().height)]));
console.log(r.map(([a,h])=>`${a}: ${h} (${(h/844).toFixed(2)})`).join('\n'));
await b.close();
