// Screenshot every section at 390 and 1440. Usage: node tools/rv-shoot.mjs <url> <outdir>
import { chromium } from 'playwright';
const [url = 'http://localhost:4321/', out = 'shots'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [w, h, tag] of [[390, 844, 'm'], [1440, 900, 'd']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(4500);
  await p.screenshot({ path: `${out}/${tag}-00-hero.png` });
  const ids = await p.$$eval('main section[id], main > section, footer', (els) => els.map((e, i) => e.id || e.className.split(' ')[0] || 'sec' + i));
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  // slow scroll to trigger reveals/lazy mounts
  for (let y = 0; y < H; y += h / 2) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120); }
  let i = 1;
  for (const id of ids) {
    const el = id && (await p.$(`#${id}`)) || null; if (!el) continue;
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
    await el.screenshot({ path: `${out}/${tag}-${String(i++).padStart(2, '0')}-${id}.png` }).catch(() => {});
  }
  console.log(tag, 'height', H, 'screens', (H / h).toFixed(1), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
