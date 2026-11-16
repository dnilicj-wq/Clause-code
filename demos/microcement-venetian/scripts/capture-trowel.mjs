// Renders the trowel-hero poster stills (desktop + mobile) from the live shader.
// Run with the dev server up: node scripts/capture-trowel.mjs [base=http://localhost:5190]
// Changed image = new filename (immutable cache). Bump VER when re-rendering.
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:5190';
const VER = 'v1';
fs.mkdirSync('public/posters', { recursive: true });
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
async function shot(w, h, out, quality, dpr = 1) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await p.goto(`${base}/preview/trowel-hero?still=1&preset=microcement-stone&gl=force`);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
  await sharp(await p.screenshot({ type: 'png' })).webp({ quality }).toFile(out);
  await p.close();
  console.log('wrote', out, fs.statSync(out).size);
}
await shot(1440, 900, `public/posters/trowel-d-${VER}.webp`, 70);
await shot(390, 844, `public/posters/trowel-m-${VER}.webp`, 66, 1.5);
await b.close();
