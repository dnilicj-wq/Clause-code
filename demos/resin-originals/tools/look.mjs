// dev helper: render the pour shader stills for review. node tools/look.mjs <out.png> [mode] [pal] [w] [h] [t]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const [out, mode = '0', pal = '-1', w = '600', h = '1000', t = '0'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
await p.goto(`http://localhost:${process.env.PORT || 5241}/?pourstill=1`, { waitUntil: 'networkidle' });
await p.waitForSelector('.pour__cv.is-on', { timeout: 30000 });
if (mode !== '0') await p.locator('.pill').nth(+mode).click();
if (pal !== '-1') await p.locator('.swatch').nth(+pal).click();
await p.waitForTimeout(300);
const d = await p.evaluate(() => document.querySelector('.pour__cv').toDataURL('image/png'));
writeFileSync(out, Buffer.from(d.split(',')[1], 'base64'));
await b.close();
