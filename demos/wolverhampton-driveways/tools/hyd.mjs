import { chromium, devices } from 'playwright';
const b = await chromium.launch();
for (const ctxOpts of [{ ...devices['Moto G4'] }, { viewport: { width: 1440, height: 900 } }]) {
  const c = await b.newContext(ctxOpts); const p = await c.newPage();
  const logs = []; p.on('console', m => (m.type() === 'error' || /hydrat/i.test(m.text())) && logs.push(m.text().slice(0, 200))); p.on('pageerror', e => logs.push('PE ' + String(e).slice(0, 200)));
  await p.addInitScript(() => { window.__marks = []; new MutationObserver(() => {}).observe(document, { childList: true }); });
  await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const same = await p.evaluate(() => !!document.querySelector('#top') && document.querySelectorAll('#below section').length);
  console.log(ctxOpts.viewport.width, 'below sections', same, 'logs', JSON.stringify(logs));
  await c.close();
}
await b.close();
