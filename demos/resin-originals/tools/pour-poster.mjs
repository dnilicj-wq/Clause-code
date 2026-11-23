// Renders frame 0 of the pour shader to the hero stills (first paint). Run after a build: node tools/pour-poster.mjs
import { preview } from 'vite';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
const server = await preview({ preview: { port: 5198, strictPort: true }, logLevel: 'silent' });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
mkdirSync('public/client/hero', { recursive: true }); mkdirSync('dist/client/hero', { recursive: true });
for (const [name, w, h, q] of [['m', 600, 1300, 74], ['d', 1600, 1000, 72]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.goto('http://localhost:5198/?pourstill=1', { waitUntil: 'networkidle' });
  await p.waitForSelector('.pour__cv.is-on', { timeout: 20000 }); await p.waitForTimeout(400);
  const d = await p.evaluate(() => document.querySelector('.pour__cv').toDataURL('image/png'));
  writeFileSync(`/tmp/pour-${name}.png`, Buffer.from(d.split(',')[1], 'base64'));
  execFileSync('cwebp', ['-quiet', '-q', String(q), '-sharp_yuv', `/tmp/pour-${name}.png`, '-o', `public/client/hero/pour-${name}-v1.webp`]);
  copyFileSync(`public/client/hero/pour-${name}-v1.webp`, `dist/client/hero/pour-${name}-v1.webp`);
}
await b.close(); await server.close();
console.log('pour stills written');
