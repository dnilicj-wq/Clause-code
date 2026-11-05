// Precision layer textures: realistic shader stills for the floor cross-section. New filenames only (-pr-v1).
import { chromium } from 'playwright';
import sharp from 'sharp';
const base = process.argv[2] || 'http://localhost:5210';
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
async function png(q, w = 900, h = 900) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`${base}/capture?${q}&preset=precision-navy&gl=force`);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
  const buf = await p.screenshot({ type: 'png' }); await p.close(); return buf;
}
const out = (n) => `public/demo/tex-${n}-pr-v1.webp`;
await sharp(await png('k=concrete&lx=.35&ly=.4')).modulate({ brightness: 1.05 }).webp({ quality: 80 }).toFile(out('grind'));
await sharp(await png('k=x&base=5F6368&metal=A9AEB3&kind=quartz&lx=.4&ly=.6')).webp({ quality: 80 }).toFile(out('repair'));
await sharp(await png('k=x&base=5A3A10&metal=C88F3C&kind=solid&lx=.35&ly=.55')).webp({ quality: 80 }).toFile(out('primer'));
const body = await png('k=x&base=0D2F78&metal=4B8DE8&kind=solid&lx=.3&ly=.45');
await sharp(body).webp({ quality: 82 }).toFile(out('body'));
// Top: the same blue gloss with a yellow walkway line and hatching, as a finished floor reads from above.
const hatch = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">
  <defs><pattern id="h" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="30" height="70" fill="#F2C200"/></pattern>
  <clipPath id="c"><rect x="600" y="0" width="300" height="900"/></clipPath></defs>
  <rect x="520" y="0" width="34" height="900" fill="#F2C200"/>
  <rect x="600" y="0" width="300" height="900" fill="url(#h)" clip-path="url(#c)"/>
  <rect x="0" y="0" width="900" height="900" fill="url(#g)" opacity="0"/>
</svg>`);
const lines = await sharp(hatch).png().toBuffer();
await sharp(body).composite([{ input: lines, blend: 'over' }]).modulate({ brightness: 1.04 }).webp({ quality: 82 }).toFile(out('top'));
await b.close(); console.log('ok');
