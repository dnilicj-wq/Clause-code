import { chromium, devices } from 'playwright';
const [url, dir, kind] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const opts = kind === 'm' ? { ...devices['iPhone 13'], recordVideo: { dir, size: { width: 390, height: 844 } } } : { viewport: { width: 1440, height: 900 }, recordVideo: { dir, size: { width: 1440, height: 900 } } };
const c = await b.newContext(opts); const p = await c.newPage();
await p.goto(url); await p.waitForTimeout(11000);
if (kind !== 'm') { await p.mouse.move(400, 300); await p.waitForTimeout(300); }
await c.close(); await b.close();
