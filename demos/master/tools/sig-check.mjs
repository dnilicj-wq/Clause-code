// node tools/sig-check.mjs <url> <outPrefix>  (quality gate for the 6 signature sections)
// Screenshots each one at 390x844 and 1440x900 after scrolling to it like a visitor, and prints whether
// its animation ran: --p moved (scroll-linked), .on steps lit, .is-playing / .is-in set, no sideways scroll.
import { chromium } from 'playwright';
const [base, out] = process.argv.slice(2);
const b = await chromium.launch({  });
const SECTIONS = [['layer', '#services .card .sig-lb'], ['benefits', '#benefits'], ['proof', '#proof'], ['rail', '#how'], ['owner', '.sig-os'], ['guarantee', '#promises']];
const report = {};
for (const [vw, vh, tag, mobile] of [[390, 844, 'm', true], [1440, 900, 'd', false]]) {
  const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  for (const [name, sel] of SECTIONS) {
    const el = p.locator(sel).first();
    if (!(await el.count())) { report[name] = 'absent'; continue; }
    const top = await el.evaluate((e) => e.getBoundingClientRect().top + scrollY);
    const res = {};
    // scroll in steps from just above to the target pose, so scroll-linked parts move like a real visitor
    const target = name === 'rail' ? top - vh * 0.15 : name === 'layer' ? top - vh * 0.45 : top - vh * 0.08;
    for (let y = target - vh; y <= target; y += 90) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(16); }
    // re-measure (lazy images above may have shifted it) and settle on the exact pose
    const top2 = await el.evaluate((e) => e.getBoundingClientRect().top + scrollY);
    const t2 = name === 'rail' ? top2 - vh * 0.15 : name === 'layer' ? top2 - vh * 0.45 : top2 - vh * 0.08;
    for (let y = t2 - 300; y <= t2; y += 60) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(16); }
    await p.waitForTimeout(name === 'owner' ? 2600 : 900);
    res.p = await el.evaluate((e) => { const s = e.matches('[data-sig-scroll]') ? e : e.querySelector('[data-sig-scroll]'); return s ? getComputedStyle(s).getPropertyValue('--p') : null; });
    res.on = await el.evaluate((e) => e.querySelectorAll('.on').length + '/' + e.querySelectorAll('[data-at]').length);
    res.playing = await el.evaluate((e) => e.querySelectorAll('.is-playing').length + '/' + e.querySelectorAll('[data-sig-play]').length);
    res.in = await el.evaluate((e) => e.classList.contains('is-in') || !!e.querySelector('.is-in'));
    // sticky bottom bar must not cover content: check overlap with bar on phones is only while scrolling (bar fixed) — record bar height
    if (mobile) res.bar = await p.evaluate(() => { const bb = document.querySelector('.bbar'); return bb ? Math.round(bb.getBoundingClientRect().height) : 0; });
    res.overflowX = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await p.screenshot({ path: `${out}-${tag}-${name}.png` });
    report[tag + ':' + name] = res;
  }
  report[tag + ':errors'] = errs.length ? errs : 'none';
  await p.close();
}
console.log(JSON.stringify(report, null, 1));
await b.close();
