// node calib.mjs <url> <beforeDir> <outDir> '<SK json>'  -> finished-state band mean (RGB) of each surface vs the old hero
import { chromium } from 'playwright';
import sharp from './template/node_modules/sharp/lib/index.js';
import { mkdirSync } from 'fs';
const [base, before, out, skj = '{}'] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const band = async (f) => { const im = sharp(f); const { width: W, height: H } = await im.metadata();
  const { data, info } = await im.extract({ left: Math.round(W * 0.3), top: Math.round(H * 0.2), width: Math.round(W * 0.65), height: Math.round(H * 0.14) }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const s = [0, 0, 0]; for (let i = 0; i < data.length; i += 3) { s[0] += data[i]; s[1] += data[i + 1]; s[2] += data[i + 2]; } const n = data.length / 3; return s.map((v) => Math.round(v / n)); };
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.addInitScript((j) => { window.__hpSK = JSON.parse(j); window.__hpWait = 99999; }, skj);
await p.goto(base + '/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__heroReady, null, { timeout: 30000 });
for (const k of ['block', 'resin', 'tarmac', 'porcelain']) {
  await p.locator(`.hp-tiles button[data-s=${k}]`).click();
  await p.evaluate((k) => window.__hp.fill(k), k);
  await p.waitForTimeout(k === 'resin' || k === 'tarmac' ? 4500 : 2500);
  const f = `${out}/m-${k}-done.png`; await p.screenshot({ path: f });
  const n = await band(f), o = await band(`${before}/m-hero-${k}.png`);
  console.log(k.padEnd(10), 'new', n.join(','), '| old', o.join(','), '| ratio', (n.reduce((a, c) => a + c) / o.reduce((a, c) => a + c)).toFixed(3));
}
await b.close();
