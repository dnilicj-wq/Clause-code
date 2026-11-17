import { chromium } from 'playwright';
const out = process.argv[2]; const b = await chromium.launch();
for (const w of [1440, 1280, 1024, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' }); await p.waitForTimeout(3500);
  const lines = await p.evaluate(() => { const h = document.querySelector('#top h1'); return Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)); });
  // every heading: count one-word last lines (orphans)
  const orphans = await p.evaluate(() => [...document.querySelectorAll('.h2,.h1,.h-fin')].filter((h) => { const r = document.createRange(); r.selectNodeContents(h); const rs = [...r.getClientRects()]; const last = rs[rs.length - 1]; return last && last.width < 70 && rs.length > 1; }).map((h) => h.textContent));
  console.log(w, 'hero lines', lines, 'orphans', JSON.stringify(orphans));
  if (w === 1440) await p.screenshot({ path: `${out}/hero-1440.png` });
  await p.close();
}
await b.close();
