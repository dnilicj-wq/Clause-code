// node h3surf.mjs <url> <out> <w> <h>  -> each hero surface: tap tile, mid-lay shot, drag across, "Lay the rest", finished shot
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [base, out, w = 390, h = 844] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const mob = +w < 900, tag = mob ? 'm' : 'd';
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, isMobile: mob, hasTouch: mob });
const p = await ctx.newPage(); const logs = [];
p.on('console', (m) => { if (m.type() === 'error') logs.push(m.text().slice(0, 200)); });
p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
await p.goto(base + '/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__heroReady, null, { timeout: 30000 });
await p.waitForTimeout(4200); // intro strip done
await p.screenshot({ path: `${out}/${tag}-intro.png` });
const box = await p.locator('.hpk').boundingBox();
for (const k of ['block', 'resin', 'tarmac', 'porcelain']) {
  await p.locator(`.hp-tiles button[data-s=${k}]`).click();
  await p.waitForTimeout(k === 'resin' || k === 'tarmac' ? 2600 : 50); // first time: the texture worker
  if (k === 'resin' || k === 'tarmac') { await p.locator(`.hp-tiles button[data-s=block]`).click(); await p.waitForTimeout(300); await p.locator(`.hp-tiles button[data-s=${k}]`).click(); }
  await p.waitForTimeout(650);
  await p.screenshot({ path: `${out}/${tag}-${k}-mid.png` });
  await p.waitForTimeout(1200);
  // a drag across the open part of the drive
  const y = box.y + box.height * (mob ? 0.27 : 0.3);
  await p.mouse.move(box.x + box.width * 0.9, y); await p.mouse.down();
  for (let i = 0; i <= 24; i++) { await p.mouse.move(box.x + box.width * (0.9 - i * 0.032), y + Math.sin(i / 4) * 12); await p.waitForTimeout(16); }
  await p.mouse.up();
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${out}/${tag}-${k}-drag.png` });
  const rest = await p.locator('.hp-rest').isVisible();
  if (rest) await p.locator('.hp-rest').click();
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/${tag}-${k}-laying.png` });
  await p.waitForTimeout(3200);
  await p.screenshot({ path: `${out}/${tag}-${k}-done.png` });
  console.log(k, 'lay-the-rest shown:', rest, '| act:', await p.locator('.hp-act').getAttribute('data-m'));
}
console.log(logs.join('\n') || 'no errors');
await b.close();
