// 375px behaviour test for the pour hero + jobs. node tools/t3.mjs <outDir> [url]
import { chromium } from 'playwright';
const O = process.argv[2], U = process.argv[3] || 'http://localhost:5240/';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto(U, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
const st = () => p.evaluate(() => ({ live: document.querySelector('.pour__cv').classList.contains('is-on'), sw: document.querySelector('.swatch.is-on')?.getAttribute('aria-label'), pills: document.querySelectorAll('.pill').length }));
console.log('loaded', JSON.stringify(await st()));
await p.screenshot({ path: `${O}/a-idle.png` });
await p.mouse.move(80, 120); await p.mouse.down();
for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 1.6; await p.mouse.move(187 + Math.cos(a) * 110, 230 + Math.sin(a) * 90); await p.waitForTimeout(16); }
await p.screenshot({ path: `${O}/b-swirl.png` }); await p.mouse.up();
await p.waitForTimeout(5000); await p.screenshot({ path: `${O}/b2-levelled.png` });
await p.locator('.swatch').nth(4).tap(); await p.waitForTimeout(1200); await p.screenshot({ path: `${O}/c-blue.png` });
await p.locator('.swatch').nth(1).tap(); await p.waitForTimeout(1200); await p.screenshot({ path: `${O}/c-red.png` });
console.log('chip', JSON.stringify(await st()));
await p.getByRole('link', { name: /See flake floors/ }).tap(); await p.waitForTimeout(1800); await p.screenshot({ path: `${O}/d-see-flake.png` });
const jobs = () => p.evaluate(() => ({ filter: document.querySelector('#work .chip.is-on')?.textContent, tiles: [...document.querySelectorAll('.tile__t')].map(x => x.textContent), top: Math.round(document.getElementById('work').getBoundingClientRect().top) }));
console.log('see flake', JSON.stringify(await jobs()));
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
await p.getByRole('link', { name: /See quartz floors/ }).tap(); await p.waitForTimeout(1800); console.log('see quartz', JSON.stringify(await jobs()));
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
await p.getByRole('link', { name: /See metallic floors/ }).tap(); await p.waitForTimeout(1800); console.log('see metallic', JSON.stringify(await jobs()));
await p.locator('.tile__media').first().tap(); await p.waitForTimeout(1500);
const tile = await p.evaluate(() => { const v = document.querySelector('.tile video'); return { src: v?.getAttribute('src'), playing: v && !v.paused }; });
console.log('tile', JSON.stringify(tile), 'errs', errs, 'docW', await p.evaluate(() => document.documentElement.scrollWidth));
// link tapped before the jobs chunk loads (window.__roFilter path)
const q = await ctx.newPage(); await q.goto(U, { waitUntil: 'commit' });
await q.waitForFunction(() => document.getElementById('top') && Object.keys(document.getElementById('top')).some(k => k.startsWith('__react'))); // hydrated; before that the link is a plain #work jump
await q.getByRole('link', { name: /See quartz floors/ }).click(); await q.waitForTimeout(3000);
console.log('early tap', JSON.stringify(await q.evaluate(() => document.querySelector('#work .chip.is-on')?.textContent)));
// reduced motion: still image, one frame per chip tap
const r = await b.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
await r.goto(U, { waitUntil: 'networkidle' }); await r.waitForTimeout(1500);
const before = await r.evaluate(() => document.querySelector('.pour__cv').classList.contains('is-on'));
await r.locator('.swatch').nth(4).click(); await r.waitForTimeout(500);
console.log('reduced: canvas before tap', before, 'after', await r.evaluate(() => document.querySelector('.pour__cv').classList.contains('is-on')));
await b.close();
