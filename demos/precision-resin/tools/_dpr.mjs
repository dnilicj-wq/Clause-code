import { chromium, devices } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const c = await b.newContext({ ...devices['iPhone 13'] });
const p = await c.newPage();
await p.goto(process.argv[2] + '/?gl=force', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
console.log(await p.evaluate(() => { const cv = document.querySelector('#top canvas'); return { dpr: devicePixelRatio, cssW: cv.clientWidth, w: cv.width, ratio: cv.width / cv.clientWidth, opacity: getComputedStyle(cv).opacity }; }));
await b.close();
