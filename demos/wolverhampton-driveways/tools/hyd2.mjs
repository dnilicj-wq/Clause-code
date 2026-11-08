import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on('pageerror', e => console.log('PE', String(e).slice(600,20000))); p.on('console', m => m.type()==='error' && console.log(m.text().slice(0, 2500)));
await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(2000); await b.close();
