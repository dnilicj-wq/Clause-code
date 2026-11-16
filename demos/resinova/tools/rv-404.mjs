import { chromium } from 'playwright';
const url = process.argv[2] || 'https://clientgateway-resinova.dnilicj.workers.dev/';
const b = await chromium.launch();
for (const vp of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const p = await b.newPage({ viewport: vp });
  p.on('response', (r) => r.status() >= 400 && console.log(vp.width, r.status(), r.url()));
  p.on('requestfailed', (r) => console.log(vp.width, 'FAILED', r.failure()?.errorText, r.url()));
  p.on('console', (m) => m.type() === 'error' && console.log(vp.width, 'console:', m.text()));
  await p.goto(url, { waitUntil: 'networkidle' });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 300) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(150); }
  await p.waitForTimeout(2000); await p.close();
}
await b.close(); console.log('done');
