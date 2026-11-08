// Renders the driveway shader to stills: hero posters and per-blend previews/swatches.
// Dev server up on 5210: node scripts/capture-pe.mjs [posters|blends]
// Changed image = new filename (bump VER).
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
const base = process.env.BASE || 'http://localhost:5210', VER = process.env.VER || 'v1';
const { blends } = await import('../config/driveway.ts').catch(() => ({ blends: null }));
const keys = blends ? blends.map((b) => b.key) : ['golden', 'silver', 'charcoal', 'autumn', 'cream', 'bronze'];
fs.mkdirSync('public/posters', { recursive: true }); fs.mkdirSync('public/blends', { recursive: true });
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
async function grab(q, w, h, dpr = 1) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await p.goto(`${base}/capture?${q}&gl=force`);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  const buf = await p.screenshot({ type: 'png' }); await p.close(); return buf;
}
const only = process.argv[2];
if (!only || only === 'posters') {
  await sharp(await grab('k=hero', 1440, 900)).webp({ quality: 68 }).toFile(`public/posters/drive-d-${VER}.webp`);
  await sharp(await grab('k=hero', 390, 844, 1.5)).webp({ quality: 62 }).toFile(`public/posters/drive-m-${VER}.webp`);
  console.log('posters');
}
if (!only || only === 'blends') {
  for (const k of keys) {
    const view = await grab(`k=${k}&lx=.62&ly=.5&view=1.75`, 1200, 900);
    await sharp(view).webp({ quality: 72 }).toFile(`public/blends/${k}-view-1200-${VER}.webp`);
    await sharp(view).resize(640).webp({ quality: 70 }).toFile(`public/blends/${k}-view-640-${VER}.webp`);
    const sw = await grab(`k=${k}&lx=.5&ly=.7&view=8&flat=1`, 240, 240);
    await sharp(sw).webp({ quality: 78 }).toFile(`public/blends/${k}-160-${VER}.webp`);
    console.log('blend', k);
  }
}
await b.close();
