import { chromium, devices } from 'playwright';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const errs = [];
for (const [tag, opts] of [['d', { viewport: { width: 1440, height: 900 } }], ['m', { ...devices['iPhone 13'] }]]) {
  const c = await b.newContext(opts); const p = await c.newPage();
  p.on('pageerror', (e) => errs.push(tag + ' ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(tag + ' ' + m.text()));
  await p.goto(url + '?gl=force'); await p.waitForTimeout(7000);
  await p.screenshot({ path: `${out}/${tag}-0.jpg`, quality: 70 });
  for (const t of ['Block paving', 'Resin', 'Natural stone', 'Porcelain']) {
    await p.getByRole('radio', { name: t, exact: true }).first().click();
    await p.waitForTimeout(700); await p.screenshot({ path: `${out}/${tag}-${t[0]}-mid.jpg`, quality: 70 });
    await p.waitForTimeout(2600); await p.screenshot({ path: `${out}/${tag}-${t[0]}.jpg`, quality: 70 });
  }
  await c.close();
}
console.log(errs.join('\n') || 'no errors'); await b.close();
