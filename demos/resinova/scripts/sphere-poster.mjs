// Renders the hero sphere shader once at angle 0 into public/posters/sphere-v1.webp (the pre-JS poster).
import { preview } from 'vite';
import { chromium } from 'playwright';
import sharp from 'sharp';
const server = await preview({ preview: { port: 5187, strictPort: true }, logLevel: 'silent' });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await p.emulateMedia({ reducedMotion: 'reduce' });
await p.goto('http://localhost:5187/', { waitUntil: 'networkidle' });
const url = await p.evaluate(async () => {
  const c = document.querySelector('.orb-gl');
  c.style.width = c.style.height = '720px'; c.style.inset = 'auto';
  await new Promise((r) => setTimeout(r, 400));
  return c.toDataURL('image/png');
});
await b.close(); await server.close();
const buf = Buffer.from(url.split(',')[1], 'base64');
const out = new URL('../public/posters/sphere-v1.webp', import.meta.url).pathname;
await sharp(buf).webp({ quality: 88, alphaQuality: 100 }).toFile(out);
console.log('sphere poster', (await sharp(out).metadata()).width);
