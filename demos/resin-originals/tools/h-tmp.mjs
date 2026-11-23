import { chromium } from 'playwright';
const U = process.argv[3] || 'http://localhost:5240/', O = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const vids = []; p.on('request', r => { if (/\.mp4/.test(r.url())) vids.push(Math.round(performance.now()) + ' ' + r.url().split('/').pop()); });
const t0 = Date.now();
await p.goto(U, { waitUntil: 'commit' });
await p.waitForTimeout(Math.max(0, 500 - (Date.now() - t0))); await p.screenshot({ path: `${O}/t05.png` });
await p.waitForTimeout(Math.max(0, 3000 - (Date.now() - t0))); await p.screenshot({ path: `${O}/t3.png` });
const state = () => p.evaluate(() => ({ on: [...document.querySelectorAll('.pill')].findIndex(x => x.classList.contains('is-on')), now: document.querySelector('.hero__now').textContent, vidOn: [...document.querySelectorAll('.hero__vid')].map(v => v.classList.contains('is-on') + ':' + !v.paused) }));
console.log('3s', JSON.stringify(await state()));
await p.waitForTimeout(4000); console.log('7s auto', JSON.stringify(await state()));
await p.locator('.pill', { hasText: 'Quartz' }).tap(); await p.waitForTimeout(1800);
console.log('tap quartz', JSON.stringify(await state())); await p.screenshot({ path: `${O}/quartz.png` });
await p.waitForTimeout(7000); console.log('held 7s later', JSON.stringify(await state()));
await p.locator('.pill', { hasText: 'Flake' }).tap(); await p.waitForTimeout(1800); await p.screenshot({ path: `${O}/flake.png` });
console.log('tap flake', JSON.stringify(await state()));
// black check: mean luminance of hero area at 0.5s
console.log('vids', vids, 'errs', errs, 'docW', await p.evaluate(() => document.documentElement.scrollWidth));
// reduced motion
const r = await b.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
await r.goto(U, { waitUntil: 'networkidle' }); await r.waitForTimeout(7000);
await r.locator('.pill', { hasText: 'Flake' }).click(); await r.waitForTimeout(800);
console.log('reduced', JSON.stringify(await r.evaluate(() => ({ srcs: [...document.querySelectorAll('.hero__vid')].map(v => v.getAttribute('src')), on: document.querySelector('.pill.is-on').textContent, img: !!document.querySelector('.hero__layer.is-on img')?.complete }))));
await r.screenshot({ path: `${O}/reduced-flake.png` });
await b.close();
