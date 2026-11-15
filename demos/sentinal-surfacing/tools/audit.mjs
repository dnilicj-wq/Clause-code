// node tools/audit.mjs <url> <outDir>: hero-at-1s + scrolled screenshots at 390x844 and 1440x900, plus link/anchor/section checks
import { chromium } from 'playwright';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const m = w < 700;
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, hasTouch: m, isMobile: m });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (x) => x.type() === 'error' && errs.push(x.text()));
  const t0 = Date.now(); await p.goto(url, { waitUntil: 'commit' });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `${out}/${w}-hero-1s.png` });
  const hero1s = await p.evaluate(() => { const h1 = document.querySelector('h1'); const r = h1?.getBoundingClientRect(); const cs = h1 && getComputedStyle(h1); return { h1Count: document.querySelectorAll('h1').length, text: h1?.innerText, visible: !!r && r.height > 0 && cs.opacity !== '0', loaderUp: !!document.querySelector('[class*=loader],[data-loader]') && [...document.querySelectorAll('[class*=loader],[data-loader]')].some(e => e.getBoundingClientRect().height > 100 && getComputedStyle(e).opacity !== '0' && getComputedStyle(e).display !== 'none') }; });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${out}/${w}-hero-3s.png` });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = h; y < H; y += Math.round(h * 0.9)) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(700); await p.screenshot({ path: `${out}/${w}-s${String(++i).padStart(2, '0')}.png` }); }
  const info = await p.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const dup = {}; document.querySelectorAll('h1,h2').forEach((e) => { if (!vis(e)) return; const k = e.innerText.trim().replace(/\s+/g, ' '); dup[k] = (dup[k] || 0) + 1; });
    const links = [...document.querySelectorAll('a[href]')].map((a) => ({ t: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 30), h: a.getAttribute('href') }));
    const badAnchors = links.filter((l) => l.h.startsWith('#') && l.h.length > 1 && !document.getElementById(l.h.slice(1))).map(l => l.h);
    const emptyA = links.filter((l) => !l.h || l.h === '#');
    const sections = [...document.querySelectorAll('section')].map((s) => ({ id: s.id || s.getAttribute('aria-label') || s.getAttribute('aria-labelledby'), h: Math.round(s.getBoundingClientRect().height), txt: s.innerText.trim().length, imgs: s.querySelectorAll('img,canvas,svg,video').length }));
    const buttons = [...document.querySelectorAll('button')].filter(vis).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 25));
    const imgsBroken = [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src);
    const tags = [...document.querySelectorAll('.ex-tag')].map(e => ({ t: e.innerText, parent: e.parentElement?.id || e.parentElement?.className?.slice(0, 40) }));
    return { dupHeads: Object.entries(dup).filter(([, n]) => n > 1), uniqLinks: [...new Set(links.map(l => l.h))], badAnchors, emptyA: emptyA.length, sections, buttons, imgsBroken, tags, robots: document.querySelector('meta[name=robots]')?.content };
  });
  console.log(JSON.stringify({ w, hero1s, ...info, errs: errs.slice(0, 6) }, null, 1));
  await p.close();
}
await b.close();
