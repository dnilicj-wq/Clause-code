import { chromium, devices } from 'playwright';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const c = await b.newContext({ ...devices['iPhone 13'] }); const p = await c.newPage();
const cdp = await c.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(url + '?gl=force'); await p.waitForTimeout(14000);
for (const t of ['Block paving', 'Natural stone', 'Resin', 'Porcelain', 'Block paving']) {
  await p.evaluate(() => { window.__g = []; let l = performance.now(); const f = () => { const n = performance.now(); window.__g.push(n - l); l = n; if (window.__g.length < 150) requestAnimationFrame(f); }; requestAnimationFrame(f); window.__c = performance.now(); });
  await p.getByRole('radio', { name: t, exact: true }).first().click();
  await p.waitForTimeout(450); if (out) await p.screenshot({ path: `${out}/${t[0]}-${Date.now() % 1000}.jpg`, quality: 70 });
  await p.waitForTimeout(2800);
  const g = await p.evaluate(() => window.__g);
  const s = [...g].sort((a, b) => a - b);
  console.log(t.padEnd(14), 'max frame', Math.round(s[s.length - 1]), 'ms  p90', Math.round(s[Math.floor(s.length * 0.9)]), 'ms  median', Math.round(s[Math.floor(s.length / 2)]));
}
console.log(errs.join('|') || 'no errors'); await b.close();
