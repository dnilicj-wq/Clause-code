import { chromium } from 'playwright';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url + '?gl=force'); await p.waitForTimeout(6500);
for (const t of ['Block paving', 'Natural stone', 'Resin']) {
  await p.getByRole('radio', { name: t, exact: true }).first().click();
  for (const ms of [1300, 1100, 2600]) { await p.waitForTimeout(ms); await p.screenshot({ path: `${out}/${t[0]}-${ms}.jpg`, quality: 75 }); }
}
await b.close();
