// node tools/posters.mjs  -> renders hero wall posters (raw lime + polished) from the real shader into public/posters
import { preview } from 'vite';
import { chromium } from 'playwright';
import sharp from 'sharp';
const server = await preview({ preview: { port: 5231, strictPort: true }, logLevel: 'silent' });
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [tag, w, h] of [['m', 390, 844], ['d', 1440, 900]]) {
  for (const cap of ['matte', 'polished']) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto(`http://localhost:5231/?cap=${cap}`);
    await p.waitForFunction(() => window.__still === 1, null, { timeout: 15000 });
    await p.waitForTimeout(400);
    const buf = await p.screenshot();
    const name = cap === 'matte' ? 'wall' : 'polished';
    await sharp(buf).webp({ quality: 72 }).toFile(`public/posters/${name}-${tag}-v1.webp`);
    if (tag === 'd' && cap === 'polished') await sharp(buf).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 78 }).toFile('public/posters/og-base.jpg');
    console.log(name, tag);
    await p.close();
  }
}
await b.close(); await server.close();
