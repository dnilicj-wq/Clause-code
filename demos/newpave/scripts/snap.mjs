// node scripts/snap.mjs <url> <out.png> [w] [h] [waitMs] [fullPage]
import { chromium } from 'playwright';
const [url, out, w = 1440, h = 900, wait = 2500, full = ''] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: +w < 600, hasTouch: +w < 600 });
p.on('console', m => { if (/error|warn/i.test(m.type())) console.log('[console]', m.text().slice(0, 300)); });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(+wait);
console.log('renderer:', await p.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const d = g && g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'none'; }));
await p.screenshot({ path: out, fullPage: !!full });
await b.close();
