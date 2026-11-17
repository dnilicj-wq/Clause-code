import { chromium } from 'playwright';
const [file, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
await p.goto('file://' + file, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
await p.screenshot({ path: out, fullPage: true }); await b.close();
