// Quality gate for the Rhino demo: claim scan, broken images, CTA targets, hero timing, loader timing.
// node tools/gate.mjs [url]  (no url = serves dist/ on :5299)
import { chromium } from 'playwright';
import { preview } from 'vite';
let url = process.argv[2], server;
if (!url) { server = await preview({ preview: { port: 5299, strictPort: true }, logLevel: 'silent' }); url = 'http://localhost:5299'; }
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const out = { url };
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const mobile = w < 700;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  const bad = []; const errs = [];
  p.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(url + '/', { waitUntil: 'load' });
  const t = await p.evaluate(() => new Promise((res) => {
    const nav = performance.getEntriesByType('navigation')[0];
    let lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    setTimeout(() => res({ fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0), lcp: Math.round(lcp), dcl: Math.round(nav.domContentLoadedEventEnd), heroInShell: !!document.querySelector('#top h1') }), 1500);
  }));
  // scroll like a person so lazy images load
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += h * 0.7) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(250); }
  await p.waitForTimeout(800);
  const imgs = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.currentSrc || i.src));
  const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
  const ids = await p.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
  const deadAnchors = [...new Set(links.filter((l) => l.startsWith('#') && l.length > 1 && !ids.includes(l.slice(1))))];
  const ext = [...new Set(links.filter((l) => !l.startsWith('#')))];
  out[w] = { timing: t, brokenImgs: imgs, http4xx: [...new Set(bad)], errors: errs, deadAnchors, links: ext };
  if (w === 1440) {
    // open every FAQ so its answer is in the scan
    const text = await p.evaluate(() => document.body.innerText);
    const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
    const re = /£|\d|%|years?\b|guarantee|warrant|certif|insured|approved|rated|stars?\b|reviews?\b|waterproof|fire|\beco|\bUV\b|#[0-9a-f]{6}/i;
    out.claims = [...new Set(lines.filter((l) => re.test(l)))];
    out.forbidden = lines.filter((l) => /Demo site, sample content|Sarah K\.|Mark T\.|Priya D\.|Northfield|Example customer/.test(l));
  }
  await ctx.close();
}
// loader timing on a first visit (webdriver skips it unless ?loader=1)
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(url + '/?loader=1', { waitUntil: 'commit' });
  const t0 = Date.now();
  await p.waitForFunction(() => !document.getElementById('rl'), null, { timeout: 5000 });
  const gone = await p.evaluate(() => Math.round(performance.now()));
  await p.goto(url + '/?loader=1'); const repeat = await p.evaluate(() => !!document.getElementById('rl'));
  out.loader = { goneAtMs: gone, wallMs: Date.now() - t0, shownOnRepeat: repeat };
  await ctx.close();
}
await b.close(); await server?.close();
console.log(JSON.stringify(out, null, 1));
