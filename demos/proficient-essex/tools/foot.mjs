import { chromium } from 'playwright';
const [url, out, w, h] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(4500);
await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(1500);
await p.screenshot({ path: out, type: 'jpeg', quality: 75 }); await b.close();
