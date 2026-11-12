// node h3shot.mjs <url> <out> [w h] -> screenshots of the 3D hero over time + console errors
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [base, out, w = 390, h = 844] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] , headless: true });
const mob = +w < 900;
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
const p = await ctx.newPage(); const logs = [];
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 300)); });
p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
const t0 = Date.now();
await p.goto(base + '/', { waitUntil: 'load' });
await p.screenshot({ path: `${out}/0-load.png` });
await p.waitForFunction(() => window.__heroReady, null, { timeout: 30000 }).catch(() => logs.push('never ready'));
console.log('ready after', Date.now() - t0, 'ms');
for (const [ms, n] of [[300, 'a-gl'], [1600, 'b-strip'], [1500, 'c-hint']]) { await p.waitForTimeout(ms); await p.screenshot({ path: `${out}/${n}.png` }); }
console.log(logs.join('\n') || 'no errors');
await b.close();
