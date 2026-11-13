// Screenshot every top-level section at a viewport. node tools/sections.mjs <url> <outdir> <w> <h> [gl=off]
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const [url, out, w = 390, h = 844, gl = 'off'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: gl === 'force' ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : [] });
const mobile = +w < 700;
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
const p = await ctx.newPage();
await p.goto(url + (url.includes('?') ? '&' : '?') + 'gl=' + gl, { waitUntil: 'networkidle' });
const total = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(90); }
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
const secs = await p.evaluate(() => [...document.querySelectorAll('main section, footer')].filter((e) => !e.parentElement.closest('section')).map((e, i) => {
  const r = e.getBoundingClientRect(); return { i, name: e.getAttribute('aria-label') || e.id || e.tagName.toLowerCase(), top: r.top + scrollY, h: r.height, bg: getComputedStyle(e).backgroundColor };
}));
const rows = [];
for (const s of secs) {
  // hide fixed chrome (nav, dock) below the hero so it doesn't cover the section
  if (s.i === 1) await p.evaluate(() => [...document.querySelectorAll('body *')].forEach((e) => { if (getComputedStyle(e).position === 'fixed') e.style.visibility = 'hidden'; }));
  const n = String(s.i).padStart(2, '0') + '-' + s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  // pinned/sticky sections: shoot the first screen of them
  const hh = Math.min(s.h, mobile ? 2600 : 2200);
  await p.evaluate((y) => scrollTo(0, y), Math.max(0, s.top - 0)); await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${n}.png`, clip: { x: 0, y: s.top, width: +w, height: Math.max(40, hh) }, fullPage: true });
  rows.push(`${n}: ${Math.round(s.h)}px (${(s.h / +h).toFixed(2)} screens) bg=${s.bg}`);
}
console.log(rows.join('\n')); console.log('TOTAL', (total / +h).toFixed(2), 'screens');
await b.close();
