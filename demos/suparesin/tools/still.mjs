// node tools/still.mjs <url-path-and-query> <out.png> [w] [h] [dpr]
import { chromium } from 'playwright';
const [, , q, out, w = 1440, h = 900, dpr = 1] = process.argv;
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr });
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text()); });
await p.goto('http://localhost:5210' + q);
await p.waitForFunction(() => window.__ready === true, null, { timeout: 20000 }).catch(() => console.log('no __ready'));
await p.screenshot({ path: out });
await b.close();
