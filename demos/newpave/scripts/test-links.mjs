// Fails if any page has a wrong phone link, a WhatsApp link without a pre-filled message,
// or an internal link/asset that does not exist.   node scripts/test-links.mjs
import fs from 'node:fs'; import path from 'node:path';
const PUB = new URL('../public/', import.meta.url).pathname;
const TELS = new Set(['+447787707154', '+441952950167', '+448009330769']);
const pages = []; (function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory() && f.name !== 'source') walk(p); else if (f.name.endsWith('.html')) pages.push(p); } })(PUB);
const js = ['js/app.js', 'js/config.js'].map(f => fs.readFileSync(PUB + f, 'utf8')).join('\n');
const redirects = JSON.parse(fs.readFileSync(PUB + 'vercel.json', 'utf8')).redirects.map(r => r.source);
let fail = 0; const bad = (p, m) => { fail++; console.log('FAIL', path.relative(PUB, p), m); };
let tels = 0, was = 0, links = 0;
for (const p of pages) {
  const h = fs.readFileSync(p, 'utf8');
  for (const m of h.matchAll(/href="tel:([^"]*)"/g)) { tels++; if (!TELS.has(m[1])) bad(p, 'tel link ' + m[1]); }
  for (const m of h.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)) { was++; if (!/^https:\/\/wa\.me\/447787707154\?text=.+/.test(m[1])) bad(p, 'whatsapp link not pre-filled ' + m[1]); }
  for (const m of h.matchAll(/(?:href|src)="(\/[^"#?]*)[^"]*"/g)) {
    let u = m[1]; links++; if (u === '/') continue; if (redirects.includes(u.replace(/\/?$/, '/'))) continue;
    const f = PUB + u.slice(1); const ok = fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html')));
    if (!ok) bad(p, 'missing ' + u);
  }
  for (const m of h.matchAll(/srcset="([^"]*)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(' ')[0]; if (u.startsWith('/') && !fs.existsSync(PUB + u.slice(1))) bad(p, 'missing srcset ' + u); }
  for (const m of h.matchAll(/href="#([^"]+)"/g)) if (!h.includes(`id="${m[1]}"`)) bad(p, 'anchor #' + m[1]);
  if (/lorem|ipsum/i.test(h)) bad(p, 'lorem ipsum');
  if (/—/.test(h.replace(/<script[\s\S]*?<\/script>/g, ''))) bad(p, 'em dash in copy');
}
for (const m of js.matchAll(/tel:([+\d]+)/g)) if (!TELS.has(m[1])) { fail++; console.log('FAIL js tel', m[1]); }
// gallery + jobs referenced by app.js must exist
for (const m of js.matchAll(/\['([a-z-]+)', '[^']+', '[^']+'\]/g)) if (!fs.existsSync(PUB + `img/${m[1]}-1280a.webp`)) { fail++; console.log('FAIL js image', m[1]); }
console.log(`${pages.length} pages, ${tels} tel links, ${was} WhatsApp links, ${links} internal links checked`);
if (fail) { console.log(fail + ' problem(s)'); process.exit(1); } else console.log('PASS');
