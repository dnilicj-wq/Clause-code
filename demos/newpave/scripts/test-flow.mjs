// End-to-end on a phone: designer -> booking (with design), out-of-area postcode, photo, slot, details, done.
// node scripts/test-flow.mjs [baseUrl]
import { chromium } from 'playwright'; import sharp from 'sharp'; import fs from 'node:fs';
const B = process.argv[2] || 'http://localhost:4610';
const b = await chromium.launch({ args: ['--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const errs = []; p.on('pageerror', e => errs.push(e.message));
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
await p.goto(B + '/', { waitUntil: 'load' }); await p.waitForTimeout(1200);
// designer: block, charcoal, 3-4 cars, drainage
await p.locator('#cfgSurf button[data-v=block]').tap();
await p.locator('#cfgLook button[data-v=charcoal]').tap();
await p.locator('#cfgSize button[data-v=three]').tap();
await p.locator('#cfgExtras input[data-x=drainage]').check();
await p.waitForTimeout(900);
const price = await p.textContent('#cfgPrice'); ok(/£3,550 to £6,500/.test(price), 'price range for 55 m² block + drainage: ' + price);
await p.locator('#cfgBook').tap(); await p.waitForTimeout(1500);
ok(await p.isVisible('#bkDesign.on'), 'design summary carried into booking: ' + (await p.textContent('#bkDesignT')));
ok(!(await p.isVisible('#bkSvc')), 'service tiles skipped when arriving with a design');
await p.locator('#bkNext').tap();
// out-of-area postcode
await p.fill('#bkPc', 'LS1 4AP'); ok(/let you know/.test(await p.textContent('#bkPcRes')), 'out-of-area message: ' + await p.textContent('#bkPcRes'));
await p.fill('#bkPc', 'TF2 7QT'); ok(/we cover Telford/.test(await p.textContent('#bkPcRes')), 'in-area message: ' + await p.textContent('#bkPcRes'));
await p.fill('#bkPc', 'LS1 4AP');
await p.locator('#bkNext').tap();
// photo: a big 4000px image is downscaled on the phone
const big = await sharp({ create: { width: 4000, height: 3000, channels: 3, background: '#887766' } }).jpeg().toBuffer();
await p.setInputFiles('#bkFile', { name: 'drive.jpg', mimeType: 'image/jpeg', buffer: big }); await p.waitForTimeout(800);
const kb = await p.evaluate(() => document.querySelector('#bkDropT').textContent); ok(/Photo added/.test(kb), 'photo downscaled: ' + kb);
await p.locator('#bkNext').tap();
// slot: next without picking -> error
await p.locator('#bkNext').tap(); ok(/Pick a day/.test(await p.textContent('#bkErr')), 'validation: ' + await p.textContent('#bkErr'));
await p.locator('#bkDays label').nth(1).tap(); await p.locator('.slots label').nth(2).tap(); await p.waitForTimeout(500);
ok(await p.isVisible('#bkName'), 'auto-advanced to details');
await p.fill('#bkName', 'Test Customer'); await p.fill('#bkTel', '07700 900123');
const t0 = Date.now(); await p.locator('#bkNext').tap(); await p.waitForTimeout(500);
ok(await p.isVisible('#bkDone'), 'done screen shown');
const wa = await p.getAttribute('#bkWa', 'href'); const msg = decodeURIComponent(wa.split('text=')[1]);
ok(wa.startsWith('https://wa.me/447787707154?text='), 'WhatsApp button pre-filled');
ok(/Block paving, Charcoal/.test(msg) && /LS1 4AP/.test(msg) && /Test Customer/.test(msg), 'summary includes design, postcode, name');
console.log('---\n' + msg + '\n---');
fs.mkdirSync(new URL('../screenshots/', import.meta.url).pathname, { recursive: true });
await p.screenshot({ path: new URL('../screenshots/flow-done-390.png', import.meta.url).pathname });
ok(!errs.length, 'no page errors ' + errs.join(' | '));
await b.close();
