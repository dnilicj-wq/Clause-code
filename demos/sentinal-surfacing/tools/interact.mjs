// node tools/interact.mjs <url>: clicks every control and checks the result
import { chromium } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch();
const out = {};
for (const w of [390, 1440]) {
  const m = w < 700;
  const p = await b.newPage({ viewport: { width: w, height: m ? 844 : 900 }, isMobile: m, hasTouch: m });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  let mail = ''; await p.addInitScript(() => { window.__opened = []; const o = window.open; window.open = (u, ...a) => { window.__opened.push(String(u)); return null; }; });
  p.on('request', (r) => { if (r.url().startsWith('mailto:')) mail = r.url(); });
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const r = {};
  // nav anchors (desktop nav only)
  if (!m) { for (const t of ['Our work', 'Inside floors', 'About', 'Reviews', 'Quote']) { await p.locator('nav a', { hasText: t }).first().click(); await p.waitForTimeout(1300); r['nav ' + t] = await p.evaluate(() => Math.round(scrollY)); } }
  // hero picker
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  for (const t of (m ? ['Micro', 'Coating', 'Resin'] : ['Microcement', 'Floor coating', 'Resin bound'])) { await p.locator('#top [role=radiogroup] button, #top [role=radiogroup] [role=radio]', { hasText: t }).first().click(); await p.waitForTimeout(400); }
  r.heroLabel = await p.locator('#top [role=radiogroup]').locator('xpath=..').innerText().then(s => s.split('\n')[1]);
  await p.locator('#top a, #top button', { hasText: 'Get a quote' }).first().click(); await p.waitForTimeout(1300);
  r.getQuoteLands = await p.evaluate(() => { const d = document.getElementById('design').getBoundingClientRect(); return Math.round(d.top); });
  // floors tabs + thumbs
  await p.locator('#floors button', { hasText: 'Commercial' }).first().click(); await p.waitForTimeout(400);
  r.floorsCommercial = (await p.locator('#floors h3').first().innerText());
  // reviews dots
  await p.locator('button[aria-label="Review by Bill Ogden"]').click(); await p.waitForTimeout(500);
  r.reviewShown = (await p.locator('#reviews figcaption').first().innerText()).slice(0, 30);
  // FAQ
  const q = p.locator('#faq button', { hasText: 'Can I get a price' }); await q.click(); await p.waitForTimeout(400);
  r.faqOpen = await q.getAttribute('aria-expanded');
  r.faqText = (await p.locator('#faq').innerText()).match(/Can I get a price on this page\?\s*.\s*([^\n]{0,140})/)?.[1];
  // quote form
  await p.locator('#design button', { hasText: 'Microcement' }).first().click();
  await p.locator('#design button', { hasText: 'Medium' }).first().click();
  await p.fill('#design input[placeholder="Your name"]', 'Test Person');
  await p.fill('#design input[placeholder="Phone"]', '07000 000000');
  await p.fill('#design input[placeholder="Postcode"]', 'dh8 7lf');
  const href = await p.evaluate(() => { const f = [...document.querySelectorAll('#design a, #design button')].find(e => /Email it to Neil/.test(e.innerText)); return f.tagName + ' ' + (f.getAttribute('href') || ''); });
  await p.locator('#design', { hasText: 'Email it to Neil' }).locator('text=Email it to Neil').first().click(); await p.waitForTimeout(800);
  r.form = decodeURIComponent((mail || href).replace(/\+/g, ' ')).slice(0, 400);
  r.opened = await p.evaluate(() => window.__opened);
  // sticky / finale buttons
  r.ctaHrefs = await p.evaluate(() => [...document.querySelectorAll('a')].filter(a => /^(Call|Email|Quote|Get a quote)/.test(a.innerText.trim())).map(a => a.innerText.trim().split('\n')[0] + '→' + a.getAttribute('href')));
  r.errs = errs;
  out[w] = r; await p.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
