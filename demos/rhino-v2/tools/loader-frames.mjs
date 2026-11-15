// node tools/loader-frames.mjs <url> <outDir>: phone frames of the first-visit loader at ~150/350/550/750ms
import { chromium } from 'playwright';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await p.goto(url + '/?loader=1', { waitUntil: 'commit' });
for (const t of [150, 350, 550, 750]) { await p.waitForFunction((t) => performance.now() >= t, t); await p.screenshot({ path: `${out}/loader-${t}.png` }); }
await b.close();
