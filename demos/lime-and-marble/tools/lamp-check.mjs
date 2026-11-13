// node tools/lamp-check.mjs <url> <outprefix> [selector]  — Lamp CTA quality gate: finale at 390x844 + 1440x900, glint angle, bar/glow colours, buttons, sticky-bar overlap
import { chromium } from 'playwright';
const [, , url, out, sel = '.lamp-cta'] = process.argv;
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const [w, h, n] of [[390, 844, 'm'], [1440, 900, 'd']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: n === 'm' ? 2 : 1, isMobile: n === 'm', hasTouch: n === 'm' });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); } });
  const s = p.locator(sel).first();
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await s.evaluate((el) => el.scrollIntoView({ block: 'end', behavior: 'instant' }));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}-${n}-early.png` });
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${out}-${n}.png` });
  await s.screenshot({ path: `${out}-${n}-sec.png` });
  await s.evaluate((el) => el.scrollIntoView({ block: 'end', behavior: 'instant' }));
  await p.waitForTimeout(400);
  const a1 = await p.evaluate((sel) => getComputedStyle(document.querySelector(sel + ' .glint-btn')).getPropertyValue('--gb-a'), sel);
  await p.waitForTimeout(900);
  const a2 = await p.evaluate((sel) => getComputedStyle(document.querySelector(sel + ' .glint-btn')).getPropertyValue('--gb-a'), sel);
  const info = await p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); const bar = document.querySelector(sel + ' .lamp-cta__bar').getBoundingClientRect(); const bb = document.querySelector('.bbar'); const btns=[...document.querySelectorAll(sel + ' .lamp-cta__ctas a')].map(a=>({t:a.textContent.trim(),href:a.getAttribute('href'),bottom:Math.round(a.getBoundingClientRect().bottom)})); return { barW: Math.round(bar.width), barColor: getComputedStyle(document.querySelector(sel + ' .lamp-cta__bar')).backgroundColor, glow: getComputedStyle(document.querySelector(sel + ' .lamp-cta__glow')).backgroundColor, btns, bbarTop: bb && getComputedStyle(bb).display !== 'none' ? Math.round(bb.getBoundingClientRect().top) : null, vh: innerHeight }; }, sel);
  console.log(n, JSON.stringify({ glint: [a1, a2], ...info, errs }));
  await ctx.close();
}
await b.close();
