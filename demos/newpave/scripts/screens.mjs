// Full-page screenshots at 390 and 1440 into screenshots/. node scripts/screens.mjs [base]
import { chromium } from 'playwright'; import sharp from 'sharp';
const B = process.argv[2] || 'http://localhost:4610', OUT = new URL('../screenshots/', import.meta.url).pathname;
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [w, h] of [[390, 844], [1440, 900]]) for (const [name, url] of [['home', '/'], ['resin', '/services/resin-drives/'], ['telford', '/areas-covered/telford/']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 600, deviceScaleFactor: 1 });
  await p.goto(B + url, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += h * .7) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(120); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  console.log(name, w, 'height', H, 'screens', (H / h).toFixed(1));
  const parts = []; for (let y = 0; y < H; y += 4000) parts.push({ input: await p.screenshot({ fullPage: true, clip: { x: 0, y, width: w, height: Math.min(4000, H - y) } }), top: y, left: 0 });
  await sharp({ create: { width: w, height: H, channels: 3, background: '#000' } }).composite(parts).png().toFile(`${OUT}${name}-${w}.png`); await p.close();
}
await b.close();
