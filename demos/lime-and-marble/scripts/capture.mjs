// Renders shader stills to public/: hero posters, layer textures, finish lookbook.
// Run with the dev server up: node scripts/capture.mjs [base=http://localhost:5190]
// Changed image = new filename (immutable cache). Bump VER when re-rendering.
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:5190';
// Optional: CAPTURE_PRESET=<key> CAPTURE_VER=<tag> renders posters in another preset to new filenames.
const VER = process.env.CAPTURE_VER || 'v1';
const PRE = process.env.CAPTURE_PRESET ? `&preset=${process.env.CAPTURE_PRESET}` : '';
fs.mkdirSync('public/posters', { recursive: true }); fs.mkdirSync('public/demo', { recursive: true });
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
async function shot(q, w, h, out, quality = 78, dpr = 1) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await p.goto(`${base}/capture?${q}${PRE}&gl=force`);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
  const buf = await p.screenshot({ type: 'png' });
  await sharp(buf).webp({ quality }).toFile(out);
  await p.close();
  console.log('wrote', out);
}
const only = process.argv[3];
const jobs = [
  ['posters', () => shot('k=hero', 1440, 900, `public/posters/pour-d-${VER}.webp`, 70)],
  ['posters', () => shot('k=hero', 390, 844, `public/posters/pour-m-${VER}.webp`, 66, 1.5)],
  // layer textures (square, used by the layer explode)
  ['tex', () => shot('k=concrete&lx=.5&ly=.5', 900, 900, `public/demo/tex-slab-${VER}.webp`)],
  ['tex', () => shot('k=x&base=8A5A2B&metal=C08850&kind=solid&lx=.4&ly=.7', 900, 900, `public/demo/tex-primer-${VER}.webp`)],
  ['tex', () => shot('k=storm-solid&lx=.4&ly=.7', 900, 900, `public/demo/tex-base-${VER}.webp`)],
  ['tex', () => shot('k=graphite-flake&lx=.4&ly=.7', 900, 900, `public/demo/tex-flake-${VER}.webp`)],
  ['tex', () => shot('k=copper-metallic&lx=.45&ly=.75', 900, 900, `public/demo/tex-top-${VER}.webp`)],
  ['ba', () => shot('k=concrete&lx=.5&ly=.6', 1800, 800, `public/demo/ba-before-${VER}.webp`, 80)],
  ['ba', () => shot('k=copper-metallic&lx=.5&ly=.6', 1800, 800, `public/demo/ba-after-${VER}.webp`, 80)],
  // finish lookbook (macro renders, labelled "Example render")
  ...['graphite-flake', 'copper-metallic', 'pearl-metallic', 'midnight-metallic', 'storm-solid', 'quartz-sand'].map((k) => ['look', () => shot(`k=${k}&lx=.55&ly=.7`, 1000, 1250, `public/demo/look-${k}-${VER}.webp`)]),
];
for (const [g, j] of jobs) if (!only || only === g) await j();
await b.close();
