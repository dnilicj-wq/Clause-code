// Crawl newpaveltd.co.uk and download the largest version of every image.
// Usage: node scripts/fetch-newpave-images.mjs   (run from demos/newpave)
// Output: public/img/source/*  +  public/img/source/manifest.json  (IMAGES.md is written from it by hand/script)
import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://newpaveltd.co.uk';
const OUT = path.resolve('public/img/source');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const SEED = ['/', '/services/', '/areas-covered/', '/gallery/', '/reviews/', '/contact/'];
const EXTRA = ['/wp-content/uploads/2026/08/newpave-removebg-preview-1.png'];

const get = async (u, asBuf = false) => {
  const r = await fetch(u, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!r.ok) throw new Error(r.status + ' ' + u);
  return asBuf ? Buffer.from(await r.arrayBuffer()) : r.text();
};
const abs = u => { try { return new URL(u.replace(/&amp;/g, '&'), ORIGIN).href; } catch { return null; } };

// ---- crawl pages ----
const pages = new Set(), queue = [...SEED.map(p => ORIGIN + p)];
const imgs = new Map(); // url -> Set(page)
const add = (u, page) => { u = abs(u); if (!u || !/\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(u)) return; if (!u.startsWith(ORIGIN)) return; (imgs.get(u) || imgs.set(u, new Set()).get(u)).add(page); };
while (queue.length) {
  const url = queue.shift().replace(/#.*$/, '');
  if (pages.has(url)) continue; pages.add(url);
  let html; try { html = await get(url); } catch (e) { console.warn('skip', e.message); continue; }
  const p = new URL(url).pathname;
  // follow /services/* and /areas-covered/* children
  for (const m of html.matchAll(/href="(https:\/\/newpaveltd\.co\.uk\/(?:services|areas-covered)\/[^"#?]*)"/g)) if (!pages.has(m[1])) queue.push(m[1]);
  for (const m of html.matchAll(/\s(?:src|data-src|data-lazy-src|data-orig-file|data-large-file|data-bg|data-background|href|content)="([^"]+)"/g)) add(m[1], p);
  for (const m of html.matchAll(/\s(?:srcset|data-srcset|data-lazy-srcset)="([^"]+)"/g)) m[1].split(',').forEach(s => add(s.trim().split(/\s+/)[0], p));
  for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) add(m[1], p);
  // linked stylesheets (background images)
  for (const m of html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/g)) {
    const cssU = abs(m[1]); if (!cssU || !cssU.startsWith(ORIGIN) || pages.has(cssU)) continue; pages.add(cssU);
    try { const css = await get(cssU); for (const c of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) add(new URL(c[1], cssU).href, p + ' (css)'); } catch { }
  }
}
EXTRA.forEach(e => add(ORIGIN + e, '(brief)'));

// ---- normalise to the original upload ----
const original = u => {
  let o = u.replace('/wp-content/smush-webp/', '/wp-content/uploads/');
  o = o.replace(/\.(jpe?g|png)\.webp(\?.*)?$/i, '.$1');
  o = o.replace(/-\d{2,4}x\d{2,4}(?=\.(jpe?g|png|webp|gif)$)/i, '');
  o = o.replace(/-scaled(?=\.(jpe?g|png)$)/i, '-scaled');
  return o.split('?')[0];
};
const groups = new Map(); // original -> {found:Set, pages:Set}
for (const [u, ps] of imgs) {
  if (/\/plugins\/|\/themes\/.*\/(icons?|fonts?)\//.test(u) && !/logo/i.test(u)) continue;
  const o = original(u); const g = groups.get(o) || { found: new Set(), pages: new Set() };
  g.found.add(u); ps.forEach(x => g.pages.add(x)); groups.set(o, g);
}

await fs.mkdir(OUT, { recursive: true });
const manifest = [];
for (const [o, g] of groups) {
  const cands = [o, ...[...g.found].sort((a, b) => (+(b.match(/-(\d+)x\d+/)?.[1] || 9999)) - (+(a.match(/-(\d+)x\d+/)?.[1] || 9999)))];
  let buf = null, used = null;
  for (const c of cands) { try { buf = await get(c, true); used = c; break; } catch { } }
  if (!buf) { console.warn('FAILED', o); continue; }
  const name = decodeURIComponent(path.basename(new URL(used).pathname)).replace(/[^\w.-]+/g, '-');
  await fs.writeFile(path.join(OUT, name), buf);
  manifest.push({ file: name, source: used, bytes: buf.length, fellBack: used !== o, pages: [...g.pages] });
  console.log((used === o ? 'ok  ' : 'fb  ') + name, (buf.length / 1024).toFixed(0) + 'KB');
}
await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify({ crawled: [...pages], images: manifest }, null, 2));
console.log(`\n${pages.size} urls crawled, ${manifest.length} images saved to ${OUT}`);
