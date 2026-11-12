// node plshot.mjs <url> <out> [w h] -> loader frames through to the hero lay, with timestamps
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [base, out, w = 390, h = 844] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const mob = +w < 900, tag = mob ? 'm' : 'd';
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
p.goto(base + '/');
await p.waitForSelector('.pl', { state: 'attached' });
const t = [];
for (let i = 0; i < 14; i++) { const ms = await p.evaluate(() => Math.round(performance.now())).catch(() => -1); await p.screenshot({ path: `${out}/${tag}-pl-${String(i).padStart(2, '0')}.png` }); t.push(ms + (await p.evaluate(() => document.querySelector('.pl') ? (document.querySelector('.pl').classList.contains('out') ? ' out' : ' ' + document.querySelector('.pl-c b').textContent) : ' gone'))); await p.waitForTimeout(220); }
console.log(t.join(' | ')); console.log(errs.join('\n') || 'no errors'); await b.close();
