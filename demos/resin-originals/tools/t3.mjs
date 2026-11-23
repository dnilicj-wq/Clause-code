import { chromium } from 'playwright';
const O = process.argv[2], U = process.argv[3] || 'http://localhost:5240/';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto(U, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
const st = () => p.evaluate(() => ({ live: document.querySelector('.pour__cv').classList.contains('is-on'), w: document.querySelector('.pour__cv').width, pill: document.querySelector('.pill.is-on')?.textContent, sw: document.querySelector('.swatch.is-on')?.getAttribute('aria-label') }));
console.log('loaded', JSON.stringify(await st()));
await p.screenshot({ path: `${O}/a-idle.png` });
// swirl with a drag (mouse in mobile emulation)
await p.mouse.move(80, 120); await p.mouse.down();
for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 1.6; await p.mouse.move(187 + Math.cos(a) * 110, 230 + Math.sin(a) * 90); await p.waitForTimeout(16); }
await p.screenshot({ path: `${O}/b-swirl.png` }); await p.mouse.up();
await p.waitForTimeout(5000); await p.screenshot({ path: `${O}/b2-levelled.png` });
await p.locator('.swatch').nth(1).tap(); await p.waitForTimeout(900); await p.screenshot({ path: `${O}/c-blackred.png` });
console.log('chip', JSON.stringify(await st()));
await p.locator('.pill', { hasText: 'Flake' }).tap(); await p.waitForTimeout(400); await p.screenshot({ path: `${O}/d-flake-landing.png` });
await p.waitForTimeout(2200); await p.screenshot({ path: `${O}/d-flake.png` }); console.log('flake', JSON.stringify(await st()));
await p.locator('.pill', { hasText: 'Quartz' }).tap(); await p.waitForTimeout(2000); await p.screenshot({ path: `${O}/e-quartz.png` }); console.log('quartz', JSON.stringify(await st()));
await p.evaluate(() => document.getElementById('work').scrollIntoView()); await p.waitForTimeout(1200); await p.screenshot({ path: `${O}/f-jobs.png` });
const first = await p.evaluate(() => document.querySelector('.tile__t')?.textContent);
await p.locator('.tile__media').first().tap(); await p.waitForTimeout(1500);
const tile = await p.evaluate(() => { const v = document.querySelector('.tile video'); return { src: v?.getAttribute('src'), playing: v && !v.paused, others: [...document.querySelectorAll('.tile video')].slice(1).filter(x => x.getAttribute('src')).length }; });
await p.screenshot({ path: `${O}/f-jobs-play.png` });
console.log('first job', first, JSON.stringify(tile), 'errs', errs, 'docW', await p.evaluate(() => document.documentElement.scrollWidth));
// reduced motion
const r = await b.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
await r.goto(U, { waitUntil: 'networkidle' }); await r.waitForTimeout(1500);
const before = await r.evaluate(() => document.querySelector('.pour__cv').classList.contains('is-on'));
await r.locator('.pill', { hasText: 'Flake' }).click(); await r.waitForTimeout(500);
console.log('reduced: canvas before tap', before, 'after', await r.evaluate(() => document.querySelector('.pour__cv').classList.contains('is-on')));
await r.screenshot({ path: `${O}/g-reduced-flake.png` });
await b.close();
