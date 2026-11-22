// node tools/walk.mjs <url> <outDir> <w> <h> [step=0.9]  -> scrolls like a person, one shot per step, plus sheet.jpg
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
const [url, out, w = 390, h = 844, step = 0.9] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const mobile = +w < 700;
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile });
const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const files = []; let y = 0, i = 0;
while (y < H - +h + 1 && i < 60) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(700);
  const f = `${out}/s${String(i).padStart(2, '0')}.png`; await p.screenshot({ path: f }); files.push(f);
  y += Math.round(+h * +step); i++;
}
console.log('height', H, 'screens', (H / +h).toFixed(1), 'shots', files.length, 'errors', errs.slice(0, 4).join(' || ') || 'none');
const tw = 260, th = Math.round(tw * +h / +w), cols = Math.min(10, files.length), rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(files.map((f) => sharp(f).resize(tw, th).toBuffer()));
await sharp({ create: { width: cols * tw, height: rows * th, channels: 3, background: '#333' } })
  .composite(tiles.map((t, k) => ({ input: t, left: (k % cols) * tw, top: Math.floor(k / cols) * th }))).jpeg({ quality: 80 }).toFile(`${out}/sheet.jpg`);
await b.close();
