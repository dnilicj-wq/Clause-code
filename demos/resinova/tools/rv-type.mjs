// Real-size crops of every serif use, phone (3x) and laptop (1x). Usage: node tools/rv-type.mjs <url> <outdir> <tag>
import { chromium } from 'playwright';
const [url, out, tag = 'now'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [w, h, d, k] of [[390, 844, 3, 'm'], [1440, 900, 1, 'd']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: d });
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 400) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(50); }
  await p.waitForTimeout(800);
  for (const [sel, n] of [['header.nav .logo', 'logo'], ['#top .hero-copy', 'hero'], ['#services .card-floors .card-txt', 'card'], ['#why .why-list', 'why'], ['.yours', 'yours'], ['#how .steps', 'steps'], ['#faq', 'faq'], ['.facts', 'facts']]) {
    const el = await p.$(sel); if (!el) continue;
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    await el.screenshot({ path: `${out}/${tag}-${k}-${n}.png` }).catch(() => {});
  }
  await p.close();
}
await b.close();
