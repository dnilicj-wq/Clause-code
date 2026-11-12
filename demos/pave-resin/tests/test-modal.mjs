// node test-modal.mjs <url> <outdir>  -> booking modal flows (hero, sticky bar, configurator, see-it link) on mobile + desktop, resin card shot
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [base, out] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const state = (p) => p.evaluate(() => { const d = document.querySelector('dialog.bk'); return { open: !!d?.open, step: d?.querySelector('.qstep')?.textContent, chip: d?.querySelector('.chip')?.hidden ? '(none)' : d?.querySelector('.chip span')?.textContent }; });
const close = async (p) => { await p.locator('dialog.bk .bkx').click(); await p.waitForTimeout(500); };
for (const [tag, vp, mob] of [['m', { width: 390, height: 844 }, true], ['d', { width: 1440, height: 900 }, false]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  // hero: Block tile -> CTA -> step 2 -> WhatsApp
  await p.locator('.hp-tiles button[data-s=block]').click(); await p.waitForTimeout(400);
  await p.locator('.hp-go').click(); await p.waitForTimeout(700);
  console.log(tag, 'hero CTA:', JSON.stringify(await state(p)));
  const f = 'dialog.bk .qf';
  await p.locator(`${f} fieldset.cur .opts button`).first().click(); await p.waitForTimeout(450);
  await p.locator(`${f} fieldset.cur .opts button`).first().click(); await p.waitForTimeout(450);
  await p.fill(`${f} input[name=postcode]`, 'WA14 1AA'); await p.locator(`${f} .qnext`).click(); await p.waitForTimeout(350);
  const offer = await p.locator(`${f} .qoffer`).isVisible().catch(() => false);
  await p.fill(`${f} input[name=name]`, 'Test Person'); await p.fill(`${f} input[name=phone]`, '07700900123');
  const [pop] = await Promise.all([ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null), p.locator(`${f} .send`).click()]);
  if (pop) { await pop.waitForURL(/wa\.me|whatsapp/, { timeout: 8000 }).catch(() => {}); console.log(tag, 'whatsapp:', decodeURIComponent(pop.url()).slice(0, 200).replace(/\n/g, ' / '), '| PAVE15 line visible:', offer); await pop.close(); } else console.log(tag, 'whatsapp: NO');
  await close(p); await p.locator('.hp-tiles button[data-s=porcelain]').click(); await p.waitForTimeout(300); await p.locator('.hp-go').click(); await p.waitForTimeout(700);
  console.log(tag, 'reopen after send:', JSON.stringify(await state(p)), '| thanks screen:', await p.locator('dialog.bk .qdone').isVisible().catch(() => false));
  if (mob) await p.screenshot({ path: `${out}/m-modal-step2.png` });
  await close(p); await p.evaluate(() => window.cgBook()); await p.waitForTimeout(600);
  console.log(tag, 'plain open:', JSON.stringify(await state(p))); await close(p);
  await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  // sticky bar / header free survey
  if (mob) { await p.evaluate(() => scrollTo(0, 1200)); await p.waitForTimeout(500); await p.locator('.bbar .q').click(); }
  else await p.locator('header a[href*="#quote"], header [data-book]').first().click();
  await p.waitForTimeout(700); console.log(tag, mob ? 'sticky bar:' : 'header Free survey:', JSON.stringify(await state(p))); await close(p);
  // see it on a real drive: preselect block
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
  await p.locator('.hp-tiles button[data-s=block]').click(); await p.locator('.hp-see').click(); await p.waitForTimeout(1500);
  await p.waitForFunction(() => !document.querySelector('.cfg-load'), null, { timeout: 15000 }).catch(() => {});
  console.log(tag, 'see-it surface:', await p.evaluate(() => document.querySelector('.cfg-ui [data-k=surface] .on, .cfg-ui [data-k=surface] [aria-pressed=true]')?.textContent.trim()), '| at #design:', await p.evaluate(() => Math.round(document.querySelector('#design').getBoundingClientRect().top)));
  // configurator CTA
  await p.locator('.cfg-ui [data-k=colour] button', { hasText: 'Brindle' }).click(); await p.waitForTimeout(400);
  await p.locator('.cfg-ui .cfg-go').click(); await p.waitForTimeout(700);
  console.log(tag, 'configurator CTA:', JSON.stringify(await state(p)));
  if (mob) await p.screenshot({ path: `${out}/${tag}-modal-cfg.png` });
  await close(p);
  // other book buttons
  const n = await p.evaluate(() => document.querySelectorAll('a[href="#quote"],a[href="/#quote"],[data-book]').length);
  console.log(tag, 'book triggers:', n, '| dead #quote targets:', await p.evaluate(() => !document.getElementById('quote')));
  if (mob) { // resin services card
    const card = p.locator('.cards .card').first(); await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(2600);
    await card.screenshot({ path: `${out}/m-resin-card.png` });
  }
  console.log(tag, 'errors:', errs.length ? errs : 'none'); await ctx.close();
}
await b.close();
