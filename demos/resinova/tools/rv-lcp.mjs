import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 412, height: 823 } });
await p.addInitScript(() => { window.__l = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__l.push([Math.round(e.startTime), e.size, e.element ? e.element.tagName + '.' + e.element.className : '-', e.url.slice(-30), JSON.stringify(e.element && e.element.getBoundingClientRect()), [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+f.style).join('|')]))).observe({ type: 'largest-contentful-paint', buffered: true }); });
const c = await p.context().newCDPSession(p); await c.send('Network.enable'); await c.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 });
if (process.env.NOJS) await p.route('**/assets/index-*.js', (r) => r.abort());
await p.goto('http://localhost:4321/'); await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => window.__l)));
await b.close();
