import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 412, height: 823 } });
const c = await p.context().newCDPSession(p); await c.send('Network.enable'); await c.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await p.goto('http://localhost:4321/'); await p.waitForTimeout(6000);
console.log(await p.evaluate(() => performance.getEntriesByType('resource').map((r) => `${Math.round(r.startTime)}-${Math.round(r.responseEnd)} ${r.name.split('/').pop()}`).join('\n') + '\nload ' + Math.round(performance.getEntriesByType('navigation')[0].loadEventEnd) + ' fcp ' + Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime)));
await b.close();
