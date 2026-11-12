// node poster.mjs <url> <outDir>  -> hero posters straight from the engine: intro state (far part laid) + finished block, mobile + desktop
import { chromium } from 'playwright';
import sharp from './template/node_modules/sharp/lib/index.js';
import { mkdirSync } from 'fs';
const [base, out] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [tag, vp, mob, dsf] of [['m', { width: 390, height: 844 }, true, 2], ['d', { width: 1440, height: 900 }, false, 1]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dsf, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__hpHold = true; });
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__heroReady, null, { timeout: 30000 });
  await p.addStyleTag({ content: '.hp-poster{display:none!important}.hpk>*:not(.hp-stage),.hp-shade,.hp-lamp,header,.bbar,.hoffer{visibility:hidden!important}.hp-gl{transition:none!important}' });
  await p.waitForTimeout(2500);
  const cv = p.locator('.hp-gl');
  const shot = async (name) => { const buf = await cv.screenshot(); await sharp(buf).webp({ quality: 74, effort: 6 }).toFile(`${out}/${name}.webp`); console.log(name, (await sharp(buf).metadata()).width); };
  await shot(`hero-${tag}`);
  await p.evaluate(() => window.__hp.fill('block')); await p.waitForTimeout(2500);
  await shot(`hero-${tag}-done`);
  await ctx.close();
}
await b.close();
