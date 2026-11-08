// node tools/shot.mjs <url> <out.png> [w] [h] [waitMs] [scrollY] [--full]
import { chromium } from 'playwright';
const [url, out, w = 1440, h = 900, wait = 2500, sy = 0] = process.argv.slice(2);
const full = process.argv.includes('--full');
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'], headless: true });
const mobile = +w < 700;
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 2 : 1, hasTouch: mobile, isMobile: mobile });
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', (e) => errs.push(String(e)));
await p.goto(url, { waitUntil: 'networkidle' });
if (+sy) { await p.evaluate((y) => window.scrollTo(0, y), +sy); }
await p.waitForTimeout(+wait);
await p.screenshot({ path: out, fullPage: full });
const gl = await p.evaluate(() => { const c = document.createElement('canvas').getContext('webgl'); const e = c?.getExtension('WEBGL_debug_renderer_info'); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'none'; });
console.log('renderer:', gl, '| errors:', errs.slice(0, 5).join(' || ') || 'none');
await b.close();
