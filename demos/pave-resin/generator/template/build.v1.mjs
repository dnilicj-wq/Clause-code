// node build.mjs <leadDir>  ->  <leadDir>/dist
// Reads <leadDir>/data.json (scraped facts) merged with <leadDir>/site.json (build choices). Nothing here invents facts:
// every claim, review, service and town comes from the lead's data files.
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'fs';
import { dirname, join, extname, basename, resolve } from 'path';

const LEAD = resolve(process.argv[2]);
const T = dirname(new URL(import.meta.url).pathname);
const DIST = join(LEAD, 'dist');
const CACHE = join(LEAD, '.imgcache');
const D = { ...JSON.parse(readFileSync(join(LEAD, 'data.json'), 'utf8')), ...JSON.parse(readFileSync(join(LEAD, 'site.json'), 'utf8')) };
const S = D; // shorthand
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'img'), { recursive: true });
mkdirSync(join(DIST, 'fonts'), { recursive: true });
mkdirSync(CACHE, { recursive: true });
copyFileSync(join(T, 'inter-var.woff2'), join(DIST, 'fonts/inter-var.woff2'));
if (S.font?.file) copyFileSync(join(LEAD, S.font.file), join(DIST, 'fonts', basename(S.font.file)));

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- colour ----------
const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const toHex = (a) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const lum = (h) => { const [r, g, b] = hex(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const P = S.brand.primary;
const PD = S.brand.primaryDark && contrast(S.brand.primaryDark, '#ffffff') >= 4.5 ? S.brand.primaryDark : (() => { let c = P; for (let i = 0; i < 20 && contrast(c, '#ffffff') < 4.6; i++) c = mix(c, '#000000', 0.12); return c; })();
const ON = contrast(P, '#ffffff') >= 3 ? '#ffffff' : '#141414';
const INK = S.brand.ink && lum(S.brand.ink) < 0.08 ? S.brand.ink : '#1b1c1f';

// ---------- images ----------
const meta = {};
async function m(file) {
  if (meta[file]) return meta[file];
  const p = join(LEAD, file);
  if (!existsSync(p)) throw new Error('missing image ' + file);
  const md = await sharp(p).metadata();
  const rot = md.orientation >= 5;
  return (meta[file] = { w: rot ? md.height : md.width, h: rot ? md.width : md.height });
}
const jobs = new Map();
async function variants(file, widths) {
  const { w: W } = await m(file);
  const stem = slug(basename(file, extname(file))).slice(0, 40) + '-' + Buffer.from(file).toString('base64url').slice(-6).toLowerCase();
  let ws = widths.filter((w) => w <= W * 1.05);
  if (!ws.length) ws = [Math.min(widths[0], W)];
  return ws.map((w) => { const n = `${stem}-${w}.webp`; jobs.set(n, { src: join(LEAD, file), w }); return [n, w]; });
}
async function img(file, alt, { sizes = '100vw', widths = [480, 800, 1200], eager = false, cls = '' } = {}) {
  const v = await variants(file, widths), mm = await m(file), w = v[v.length - 1][1];
  return `<img src="/img/${v[Math.min(1, v.length - 1)][0]}" srcset="${v.map(([n, w]) => `/img/${n} ${w}w`).join(', ')}" sizes="${sizes}" width="${w}" height="${Math.round((w * mm.h) / mm.w)}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;
}
const srcset = async (file, widths = [480, 800, 1200]) => (await variants(file, widths)).map(([n, w]) => `/img/${n} ${w}w`).join(', ');
const imgUrl = async (file, w = 1200) => '/img/' + (await variants(file, [w]))[0][0];
async function lqip(file) {
  const buf = await sharp(join(LEAD, file)).rotate().resize(24).webp({ quality: 40 }).toBuffer();
  const st = await sharp(join(LEAD, file)).rotate().resize(32).stats();
  return { uri: `data:image/webp;base64,${buf.toString('base64')}`, col: toHex([st.dominant.r, st.dominant.g, st.dominant.b]) };
}

// ---------- icons ----------
const sv = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
const I = {
  phone: sv('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z"/></svg>',
  arrow: sv('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  left: sv('<path d="M15 6l-6 6 6 6"/>'), right: sv('<path d="M9 6l6 6-6 6"/>'),
  lr: sv('<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>'),
  tick: sv('<path d="M20 6L9 17l-5-5"/>'),
  pin: sv('<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'),
  shield: sv('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'),
  tools: sv('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'),
  cal: sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>'),
  menu: sv('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.8 5.5 21.7l1.7-7.3L1.6 9.5 9 8.9z"/></svg>',
  g: '<svg class="g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
};

// ---------- data ----------
const SERVICES = S.services.map((s) => ({ ...s, slug: s.slug || slug(s.name) }));
const AREAS = S.areas.map((a) => (typeof a === 'string' ? { town: a } : a)).map((a) => ({ ...a, slug: slug(a.town) }));
const REVIEWS = (S.google?.reviews || []).filter((r) => r.text && r.text.trim());
const G = S.google || {};
const tel = S.phoneTel;
const WA = S.whatsapp;
const waLink = (txt) => `https://wa.me/${WA}?text=${encodeURIComponent(txt)}`;
const RT = (r) => Number(r).toFixed(1);
const stars = (n) => '★'.repeat(Math.round(n || 5));
const PAGES = [];

// ---------- quote modal (5 taps) ----------
function quoteModal() {
  const svc = (S.quoteServices || SERVICES.map((s) => s.short || s.name)).concat(['Something else']);
  const sizes = S.quoteSizes || ['Small (under 20m²)', 'Medium (20–50m²)', 'Large (50m²+)', 'Not sure yet'];
  const when = ['As soon as possible', 'In 1–3 months', 'Later this year', 'Just getting prices'];
  const towns = AREAS.slice(0, 11).map((a) => a.town).concat(['Somewhere else']);
  const opts = (arr, cls = '') => `<div class="opts ${cls}">${arr.map((v) => `<button type="button" data-v="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join('')}</div>`;
  return `<dialog class="qm" id="qm" aria-label="Book a free quote" data-wa="${WA || ''}"><div class="box">
<div class="top"><button type="button" class="bk">‹ Back</button><div class="steps" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><button type="button" class="x" aria-label="Close">×</button></div>
<form novalidate>
<fieldset data-k="service"><legend>What do you need?</legend><p class="hint">Tap one. 5 quick taps, no obligation.</p>${opts(svc)}</fieldset>
<fieldset data-k="size"><legend>Roughly how big?</legend><p class="hint">A best guess is fine, we measure up for free.</p>${opts(sizes)}</fieldset>
<fieldset data-k="when"><legend>When would you like it done?</legend><p class="hint">Helps us plan the visit.</p>${opts(when)}</fieldset>
<fieldset data-k="town"><legend>Where's the job?</legend><p class="hint">Areas we cover.</p>${opts(towns, 'towns')}</fieldset>
<fieldset><legend>Where should we call you?</legend><p class="hint">We'll ring to book your free quote visit.</p><div class="sum"></div>
<label class="fld"><span>Your name</span><input name="name" autocomplete="name" required></label><div class="err" data-for="name">Please add your name.</div>
<label class="fld"><span>Phone number</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required></label><div class="err" data-for="phone">Please add a phone number we can reach you on.</div>
<label class="hp" aria-hidden="true">Company<input name="company" tabindex="-1" autocomplete="off"></label>
<button class="btn send" type="submit">Book my free quote</button><div class="err" data-for="send">Sorry, that didn't send. Please call <a href="tel:${tel}">${esc(S.phoneDisplay)}</a>.</div>
</fieldset></form></div></dialog>`;
}

// ---------- layout ----------
let LOGO_HTML = '', HEROLQ;
const NAV = [['/services/', 'Services'], ['/gallery/', 'Our work'], ['/areas/', 'Areas'], ['/reviews/', 'Reviews']];
const header = (cur) => `<a class="skip" href="#main">Skip to content</a>
<header class="hdr"><div class="wrap">
<a class="logo" href="/" aria-label="${esc(S.name)}, home">${LOGO_HTML}</a>
<nav class="nav" aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${cur === h ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
<a class="tel" href="tel:${tel}">${I.phone}${esc(S.phoneDisplay)}</a>
<a class="btn sm" href="#quote" data-quote>Free quote</a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Menu">${I.menu}</button>
</div>
<nav class="drawer" id="drawer" aria-label="Mobile">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="tel:${tel}">Call ${esc(S.phoneDisplay)}</a></nav>
</header>`;
const bbar = (q = '') => `<nav class="bbar" aria-label="Quick contact"><a href="tel:${tel}">${I.phone}Call</a><a class="wa" href="${waLink(`Hi ${S.owner || ''}, I'd like a quote please`)}" target="_blank" rel="noopener">${I.wa}WhatsApp</a><a class="q" href="#quote" data-quote="${esc(q)}">Free quote</a></nav>`;
const footer = () => `<footer class="ftr"><div class="wrap"><div class="g">
<div><a class="lg" href="/">${LOGO_HTML}</a>
<p>${esc(S.footerLine)}</p>
<p><a href="tel:${tel}"><b>${esc(S.phoneDisplay)}</b></a>${S.email ? `<br><a href="mailto:${S.email}">${esc(S.email)}</a>` : ''}${S.address ? `<br>${esc(S.address)}` : ''}</p>
${(S.socials || []).length ? `<p>${S.socials.map((u) => `<a href="${esc(u)}" rel="noopener" target="_blank">${/facebook/.test(u) ? 'Facebook' : /instagram/.test(u) ? 'Instagram' : /checkatrade/.test(u) ? 'Checkatrade' : /tiktok/.test(u) ? 'TikTok' : /linkedin/.test(u) ? 'LinkedIn' : /youtube/.test(u) ? 'YouTube' : /x\.com|twitter/.test(u) ? 'X' : 'Profile'}</a>`).join(' · ')}</p>` : ''}</div>
<div><h3>Services</h3><ul>${SERVICES.map((s) => `<li><a href="/services/${s.slug}/">${esc(s.name)}</a></li>`).join('')}</ul></div>
<div><h3>Areas we cover</h3><ul>${AREAS.slice(0, 14).map((a) => `<li><a href="/areas/${a.slug}/">${esc(a.town)}</a></li>`).join('')}</ul></div>
</div>
<div class="bt"><span>© 2026 ${esc(S.legalName || S.name)}</span><span>Demo by Clientgateway</span></div></div></footer>`;

let CSS = readFileSync(join(T, 'styles.css'), 'utf8');
function vars() {
  const f = S.font || {};
  const ff = f.family ? `@font-face{font-family:'${f.family}';src:url(/fonts/${basename(f.file)}) format('woff2');font-weight:${f.range || f.weight || 700};font-display:swap}` : '';
  return ff + `:root{--p:${P};--pd:${PD};--on:${ON};--ink:${INK};--mut:#56585e;--bg:#fff;--alt:${S.brand.alt || mix(P, '#ffffff', 0.94)};--tint:${mix(P, '#ffffff', 0.86)};--line:#e3e4e7;--r:${S.radius ?? 10}px;--br:${S.btnRadius ?? 8}px;--hf:${f.family ? `'${f.family}',` : ''}Inter,system-ui,sans-serif;--hw:${f.weight || 700};--ht:${f.transform || 'none'};--hl:${f.spacing || '-.01em'};--hbg:${S.brand.headerBg || '#fff'};--hink:${S.brand.headerInk || INK};--hline:${S.brand.headerBg && lum(S.brand.headerBg) < 0.3 ? 'rgba(255,255,255,.16)' : '#e6e6e9'};--fbg:${S.brand.footerBg || '#17181b'};--lgbg:${S.brand.logoBg || '#fff'};--heroc:${HEROLQ.col};--lqip:url(${HEROLQ.uri})}`;
}
const BIZ = () => ({
  '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', name: S.name, url: S.url + '/', telephone: tel, ...(S.email ? { email: S.email } : {}),
  address: { '@type': 'PostalAddress', ...(S.street ? { streetAddress: S.street } : {}), addressLocality: S.town, ...(S.county ? { addressRegion: S.county } : {}), addressCountry: 'GB' },
  areaServed: AREAS.map((a) => ({ '@type': 'City', name: a.town })), sameAs: S.socials || [],
  ...(G.rating && G.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: G.rating, reviewCount: G.count } } : {}),
});
async function page({ path, title, desc, body, cur, preload = '', quoteFor = '', ld = [] }) {
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${S.url + path}"><meta name="robots" content="noindex">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${S.url}${await imgUrl(S.hero.img, 1200)}">
<meta name="theme-color" content="${S.brand.headerBg || '#ffffff'}"><link rel="icon" href="${S.favicon || '/img/' + LOGO_FILE}">
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>${S.font?.file ? `<link rel="preload" href="/fonts/${basename(S.font.file)}" as="font" type="font/woff2" crossorigin>` : ''}${preload}
<style>${vars()}${CSS}</style>
<script type="application/ld+json">${JSON.stringify([BIZ(), ...ld])}</script>
</head><body>${header(cur)}<main id="main">${body}</main>${footer()}${bbar(quoteFor)}${quoteModal()}<script src="/app.js?v=${BUILD}" defer></script></body></html>`;
  const out = join(DIST, path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html.replace(/\n/g, ''));
  PAGES.push(path);
}
const BUILD = Date.now().toString(36);

// ---------- sections ----------
const crumbs = (items) => `<nav class="crumbs wrap" aria-label="Breadcrumb"><a href="/">Home</a>${items.map(([h, t]) => ` › ${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}`).join('')}</nav>`;
const gchip = () => (G.rating ? `<a class="gchip" href="/reviews/">${I.g}<span><b>${RT(G.rating)}</b> <span class="st">${stars(G.rating)}</span> ${G.count ? `${G.count} Google reviews` : 'on Google'}</span></a>` : '');
const rvCard = (r) => `<figure class="rv"><div class="stars" aria-label="${r.stars || 5} out of 5">${stars(r.stars)}</div><blockquote class="tx">${esc(r.text)}</blockquote><button class="rm" type="button" hidden>Read more</button><figcaption class="who"><b>${esc(r.author)}</b><span>Google${r.when ? ' · ' + esc(r.when) : ''}</span></figcaption></figure>`;
const rvSum = () => (G.rating ? `<a class="rv-sum" href="${esc(G.url || '#')}" target="_blank" rel="noopener">${I.g}<span><b>${RT(G.rating)}</b> <span class="st">${stars(G.rating)}</span><small>${G.count ? `from ${G.count} reviews on Google` : 'on Google'}</small></span></a>` : '');
function reviewsRail(list = REVIEWS, title = 'What customers say', eyebrow = 'Google reviews') {
  if (!list.length) return '';
  return `<section class="sec alt" id="reviews"><div class="wrap"><div class="head"><div><span class="eyebrow">${eyebrow}</span><h2>${esc(title)}</h2></div><div class="rail-nav"><button type="button" data-rail="-1" aria-label="Previous reviews">${I.left}</button><button type="button" data-rail="1" aria-label="Next reviews">${I.right}</button></div></div>
${rvSum()}<div class="rail">${list.map(rvCard).join('')}</div>${REVIEWS.length > list.length || list === REVIEWS ? `<p><a class="btn line" href="/reviews/">Read all ${REVIEWS.length} reviews ${I.arrow}</a></p>` : ''}</div></section>`;
}
async function baSection() {
  const pairs = S.pairs || [];
  if (!pairs.length) return '';
  const P2 = await Promise.all(pairs.map(async (p) => ({ a: await srcset(p.after), b: await srcset(p.before), cap: p.caption || p.label })));
  const p0 = pairs[0];
  return `<section class="sec" id="before-after"><div class="wrap"><div class="head"><div><span class="eyebrow">Before &amp; after</span><h2>${esc(S.baTitle || 'See the difference')}</h2></div><p class="lead">Drag the slider. Real ${esc(S.name)} jobs, before and after.</p></div>
${pairs.length > 1 ? `<div class="ba-tabs" role="tablist">${pairs.map((p, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(p.label)}</button>`).join('')}</div>` : ''}
<div class="ba" data-pairs='${esc(JSON.stringify(P2))}' aria-label="Before and after comparison">
${(await img(p0.after, 'After: ' + p0.label, { sizes: '(min-width:1000px) 1000px, 100vw', widths: [480, 800, 1200] })).replace('<img ', '<img class="af" ')}
${(await img(p0.before, 'Before: ' + p0.label, { sizes: '(min-width:1000px) 1000px, 100vw', widths: [480, 800, 1200] })).replace('<img ', '<img class="bf" ')}
<span class="lbl l1">Before</span><span class="lbl l2">After</span><span class="bar"><span class="knob">${I.lr}</span></span>
<input type="range" min="0" max="100" value="50" aria-label="Slide to compare before and after"></div>
<p class="ba-cap">${esc(p0.caption || p0.label)}</p></div></section>`;
}
async function galleryGrid(items, { big = true } = {}) {
  return `<div class="gal">${(await Promise.all(items.map(async (g, i) => `<figure${big && i === 0 ? ' class="big"' : ''}>${await img(g.img, g.caption || g.service || S.name, { sizes: big && i === 0 ? '(min-width:1180px) 1130px, 100vw' : '(min-width:760px) 33vw, 50vw', widths: big && i === 0 ? [480, 800, 1200] : [360, 600] })}${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`))).join('')}</div>`;
}
async function serviceCards(list = SERVICES) {
  return `<div class="cards">${(await Promise.all(list.map(async (s) => `<a class="card" href="/services/${s.slug}/"><div class="ph">${await img(s.imgs[0], s.name, { sizes: '(min-width:980px) 33vw, (min-width:620px) 50vw, 100vw', widths: [400, 700] })}</div><div class="bd"><h3>${esc(s.name)}</h3><p>${esc(s.cardLine || (s.copy || '').split(/(?<=\.)\s/)[0])}</p><span class="go">See ${esc((s.short || s.name).toLowerCase())} ${I.arrow}</span></div></a>`))).join('')}</div>`;
}
const areaLinks = (except) => `<ul class="areas">${AREAS.filter((a) => a.slug !== except).map((a) => `<li><a href="/areas/${a.slug}/">${esc(a.town)}${I.pin}</a></li>`).join('')}</ul>`;
const band = (q = '') => `<section class="band"><div class="wrap"><div><h2>${esc(S.bandTitle || 'Get your free, no-obligation quote')}</h2><p>5 quick taps, or call ${esc(S.owner || 'us')} on ${esc(S.phoneDisplay)}.</p></div><div class="ctas"><a class="btn" href="#quote" data-quote="${esc(q)}">Book a free quote ${I.arrow}</a><a class="btn alt" href="tel:${tel}">${I.phone}Call now</a></div></div></section>`;
const faq = () => (S.faq?.length ? `<section class="sec" id="faq"><div class="wrap"><div class="head"><div><span class="eyebrow">FAQ</span><h2>Common questions</h2></div></div><div class="faq">${S.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div></section>` : '');
const ld_faq = () => (S.faq?.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: S.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] : []);

// ---------- build ----------
let LOGO_FILE;
{
  HEROLQ = await lqip(S.hero.img);
  // logo: trimmed PNG/WebP at 2 sizes
  const lp = join(LEAD, S.brand.logo);
  const isSvg = /\.svg$/i.test(lp);
  if (isSvg) { LOGO_FILE = 'logo.svg'; copyFileSync(lp, join(DIST, 'img/logo.svg')); const t = readFileSync(lp, 'utf8'); const vb = t.match(/viewBox="[\d.\s-]+?\s([\d.]+)\s([\d.]+)"/); const r = vb ? +vb[1] / +vb[2] : 3; LOGO_HTML = `<img src="/img/logo.svg" alt="${esc(S.name)}" width="${Math.round(58 * r)}" height="58">`; }
  else {
    let pipe = sharp(lp).rotate();
    if (S.brand.logoTrim !== false) pipe = pipe.trim({ threshold: 12 });
    const buf = await pipe.png().toBuffer();
    const md = await sharp(buf).metadata();
    const h = Math.min(md.height, 160);
    LOGO_FILE = 'logo-' + BUILD + '.webp';
    await sharp(buf).resize({ height: h }).webp({ quality: 92, alphaQuality: 100 }).toFile(join(DIST, 'img', LOGO_FILE));
    LOGO_HTML = `<img src="/img/${LOGO_FILE}" alt="${esc(S.name)}" width="${Math.round((md.width / md.height) * 58)}" height="58">`;
  }
}

// HOME
{
  const hs = await srcset(S.hero.img, [640, 960, 1400, 1920]);
  const hm = await m(S.hero.img);
  const ms = S.hero.mobileImg ? await srcset(S.hero.mobileImg, [480, 800, 1200]) : '';
  const heroImg = `<picture>${ms ? `<source media="(max-width:759px)" srcset="${ms}" sizes="100vw">` : ''}<img src="${(await imgUrl(S.hero.img, 960))}" srcset="${hs}" sizes="100vw" width="1920" height="${Math.round((1920 * hm.h) / hm.w)}" alt="${esc(S.hero.alt || S.hero.what || S.name)}" fetchpriority="high" decoding="async"></picture>`;
  const trust = (S.trust || []).map(([ic, b, t]) => `<li><span class="ic">${I[ic] || I.tick}</span><span><b>${esc(b)}</b>${esc(t)}</span></li>`).join('');
  const body = `
<section class="hero" style="--hpos:${S.hero.pos || 'center'};--hposm:${S.hero.posM || S.hero.pos || 'center'}${ms ? `;--lqipm:url(${(await lqip(S.hero.mobileImg)).uri})` : ''}">${heroImg}${S.hero.tag ? `<span class="tag">${esc(S.hero.tag)}</span>` : ''}<div class="wrap">
${gchip()}<h1>${S.heroHeadlineHtml || esc(S.heroHeadline)}</h1><p class="sub">${esc(S.heroSub)}</p>
<div class="ctas"><a class="btn" href="#quote" data-quote>Book a free quote ${I.arrow}</a><a class="btn ghost" href="${waLink(`Hi ${S.owner || ''}, I'd like a quote please`)}" target="_blank" rel="noopener"><span class="wa-i">${I.wa}</span>WhatsApp ${esc(S.owner || 'us')}</a></div></div></section>
${trust ? `<section class="trust"><div class="wrap"><ul>${trust}</ul></div></section>` : ''}
<section class="sec" id="services"><div class="wrap"><div class="head"><div><span class="eyebrow">What we do</span><h2>${esc(S.servicesTitle || 'Our services')}</h2></div><p class="lead">${esc(S.servicesLead || '')}</p></div>${await serviceCards()}</div></section>
${await baSection()}
${reviewsRail(REVIEWS.slice(0, 9))}
<section class="sec" id="work"><div class="wrap"><div class="head"><div><span class="eyebrow">Our work</span><h2>${esc(S.galleryTitle || 'Recent jobs')}</h2></div><a class="btn line" href="/gallery/">See all our work ${I.arrow}</a></div>${await galleryGrid((S.gallery || []).slice(0, 7))}</div></section>
${S.intro ? `<section class="sec alt"><div class="wrap about"><div class="ph">${await img(S.aboutImg || S.gallery[1]?.img || S.hero.img, S.name, { sizes: '(min-width:900px) 50vw, 100vw', widths: [480, 800] })}</div><div><span class="eyebrow">About ${esc(S.name)}</span><h2>${esc(S.aboutTitle || 'Who we are')}</h2><div class="prose" style="margin-top:14px">${S.intro.split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join('')}</div>${S.why?.length ? `<ul class="ticks">${S.why.map((w) => `<li>${I.tick}<span>${esc(w)}</span></li>`).join('')}</ul>` : ''}<a class="btn" href="#quote" data-quote>Book a free quote ${I.arrow}</a></div></div></section>` : ''}
<section class="sec" id="areas"><div class="wrap"><div class="head"><div><span class="eyebrow">Areas we cover</span><h2>${esc(S.areasTitle || 'Local to you')}</h2></div><p class="lead">${esc(S.areasLead || '')}</p></div>${areaLinks()}</div></section>
${faq()}${band()}`;
  await page({ path: '/', title: S.homeTitle, desc: S.homeDesc, body, preload: ms ? `<link rel="preload" as="image" media="(max-width:759px)" imagesrcset="${ms}" imagesizes="100vw" fetchpriority="high"><link rel="preload" as="image" media="(min-width:760px)" imagesrcset="${hs}" imagesizes="100vw" fetchpriority="high">` : `<link rel="preload" as="image" imagesrcset="${hs}" imagesizes="100vw" fetchpriority="high">`, ld: ld_faq() });
}

// SERVICES index + pages
await page({ path: '/services/', cur: '/services/', title: `Services | ${S.name}`, desc: `${SERVICES.map((s) => s.name).join(', ')} from ${S.name}.`, body: `${crumbs([[null, 'Services']])}<section class="sec" style="padding-top:20px"><div class="wrap"><div class="head"><div><span class="eyebrow">What we do</span><h1>${esc(S.servicesTitle || 'Our services')}</h1></div></div>${await serviceCards()}</div></section>${band()}` });
for (const s of SERVICES) {
  const lq = await lqip(s.imgs[0]);
  const gal = s.imgs.slice(1).map((f) => ({ img: f }));
  const rel = REVIEWS.filter((r) => (s.match || []).some((k) => r.text.toLowerCase().includes(k))).slice(0, 6);
  const body = `${crumbs([['/services/', 'Services'], [null, s.name]])}
<section class="ph-hero"><div class="wrap grid"><div><span class="eyebrow">${esc(S.name)}</span><h1>${esc(s.title || s.name)}</h1>${gchip().replace('gchip', 'gchip" style="box-shadow:none;border:1px solid var(--line)')}
${s.points?.length ? `<ul class="ticks">${s.points.map((p) => `<li>${I.tick}<span>${esc(p)}</span></li>`).join('')}</ul>` : ''}
<div class="ctas"><a class="btn" href="#quote" data-quote="${esc(s.short || s.name)}">Book a free quote ${I.arrow}</a><a class="btn line" href="tel:${tel}">${I.phone}${esc(S.phoneDisplay)}</a></div></div>
<div class="img" style="--lqip:url(${lq.uri});--heroc:${lq.col}">${await img(s.imgs[0], s.name, { eager: true, sizes: '(min-width:900px) 50vw, 100vw', widths: [480, 800, 1100] })}</div></div></section>
<section class="sec alt"><div class="wrap"><div class="prose">${(s.copy || '').split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join('')}</div></div></section>
${gal.length ? `<section class="sec"><div class="wrap"><div class="head"><div><span class="eyebrow">Our work</span><h2>${esc(s.name)} we've done</h2></div></div>${await galleryGrid(gal, { big: gal.length > 2 })}</div></section>` : ''}
${reviewsRail(rel.length >= 2 ? rel : REVIEWS.slice(0, 6), 'What customers say')}
<section class="sec"><div class="wrap"><div class="head"><div><span class="eyebrow">Areas</span><h2>${esc(s.name)} near you</h2></div></div>${areaLinks()}</div></section>${band(s.short || s.name)}`;
  await page({ path: `/services/${s.slug}/`, cur: '/services/', title: `${s.title || s.name} | ${S.name}`, desc: (s.copy || '').slice(0, 155), body, quoteFor: s.short || s.name });
}

// AREAS
await page({ path: '/areas/', cur: '/areas/', title: `Areas we cover | ${S.name}`, desc: `${S.name} covers ${AREAS.map((a) => a.town).join(', ')}.`, body: `${crumbs([[null, 'Areas']])}<section class="sec" style="padding-top:20px"><div class="wrap"><div class="head"><div><span class="eyebrow">Areas we cover</span><h1>${esc(S.areasTitle || 'Areas we cover')}</h1></div><p class="lead">${esc(S.areasLead || '')}</p></div>${areaLinks()}</div></section>${band()}` });
let ai = 0;
for (const a of AREAS) {
  const local = REVIEWS.filter((r) => r.text.toLowerCase().includes(a.town.toLowerCase()));
  const rv = local.length ? local.concat(REVIEWS.filter((r) => !local.includes(r))).slice(0, 6) : REVIEWS.slice(ai % 3, (ai % 3) + 6);
  const gal = (S.gallery || []).slice((ai * 3) % Math.max(1, (S.gallery.length - 5)), ((ai * 3) % Math.max(1, (S.gallery.length - 5))) + 6);
  const intro = (S.areaIntro || '').replaceAll('{town}', a.town);
  const body = `${crumbs([['/areas/', 'Areas'], [null, a.town]])}
<section class="ph-hero"><div class="wrap grid"><div><span class="eyebrow">${esc(a.town)}${a.county ? ', ' + esc(a.county) : ''}</span><h1>${esc((S.areaH1 || '{services} in {town}').replaceAll('{town}', a.town).replaceAll('{services}', S.areaServicesLabel || 'Our services'))}</h1>
<p class="lead">${esc(intro)}</p>${gchip().replace('gchip', 'gchip" style="box-shadow:none;border:1px solid var(--line)')}
<div class="ctas"><a class="btn" href="#quote" data-quote>Free quote in ${esc(a.town)} ${I.arrow}</a><a class="btn line" href="${waLink(`Hi ${S.owner || ''}, I'd like a quote in ${a.town} please`)}" target="_blank" rel="noopener"><span class="wa-i">${I.wa}</span>WhatsApp</a></div></div>
<div class="img">${await img(gal[0]?.img || S.hero.img, `${S.name} job`, { eager: true, sizes: '(min-width:900px) 50vw, 100vw', widths: [480, 800, 1100] })}</div></div></section>
<section class="sec alt"><div class="wrap"><div class="head"><div><span class="eyebrow">Services in ${esc(a.town)}</span><h2>What we can do for you</h2></div></div>${await serviceCards()}</div></section>
${reviewsRail(rv, local.length ? `Customers in ${a.town} and nearby` : 'What our customers say')}
${gal.length > 1 ? `<section class="sec"><div class="wrap"><div class="head"><div><span class="eyebrow">Our work</span><h2>Recent jobs</h2></div></div>${await galleryGrid(gal.slice(1), { big: false })}</div></section>` : ''}
<section class="sec alt"><div class="wrap"><div class="head"><div><span class="eyebrow">Also covering</span><h2>Other areas we cover</h2></div></div>${areaLinks(a.slug)}</div></section>${band()}`;
  await page({ path: `/areas/${a.slug}/`, cur: '/areas/', title: `${(S.areaTitle || '{services} in {town}').replaceAll('{town}', a.town).replaceAll('{services}', S.areaServicesLabel || 'Services')} | ${S.name}`, desc: intro.slice(0, 155), body });
  ai++;
}

// REVIEWS + GALLERY
await page({ path: '/reviews/', cur: '/reviews/', title: `Reviews | ${S.name}`, desc: `${RT(G.rating)}★ from ${G.count} Google reviews.`, body: `${crumbs([[null, 'Reviews']])}<section class="sec" style="padding-top:20px"><div class="wrap"><div class="head"><div><span class="eyebrow">Google reviews</span><h1>What our customers say</h1></div></div>${rvSum()}<div class="rvgrid">${REVIEWS.map(rvCard).join('')}</div>${G.url ? `<p style="margin-top:22px"><a class="btn line" href="${esc(G.url)}" target="_blank" rel="noopener">Read them all on Google ${I.arrow}</a></p>` : ''}</div></section>${band()}` });
await page({ path: '/gallery/', cur: '/gallery/', title: `Our work | ${S.name}`, desc: `Photos of real jobs by ${S.name}.`, body: `${crumbs([[null, 'Our work']])}<section class="sec" style="padding-top:20px"><div class="wrap"><div class="head"><div><span class="eyebrow">Our work</span><h1>${esc(S.galleryTitle || 'Recent jobs')}</h1></div></div>${await galleryGrid(S.gallery || [])}</div></section>${await baSection()}${band()}` });

// 404 / misc
writeFileSync(join(DIST, '404.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title><body style="font-family:system-ui;padding:40px;text-align:center"><h1>Page not found</h1><p><a href="/">Back to ${esc(S.name)}</a></p>`);
writeFileSync(join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(DIST, '_headers'), `/*\n  X-Robots-Tag: noindex\n/img/*\n  Cache-Control: public, max-age=31536000, immutable\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${PAGES.map((p) => `<url><loc>${S.url}${p}</loc></url>`).join('')}</urlset>`);
copyFileSync(join(T, 'app.js'), join(DIST, 'app.js'));

// images
let n = 0;
await Promise.all([...jobs].map(async ([name, j]) => {
  const c = join(CACHE, name);
  if (!existsSync(c)) { await sharp(j.src).rotate().resize({ width: j.w, withoutEnlargement: true }).webp({ quality: j.w > 1000 ? 70 : 74, effort: 4 }).toFile(c); n++; }
  copyFileSync(c, join(DIST, 'img', name));
}));
console.log(`built ${PAGES.length} pages, ${jobs.size} images (${n} new) -> ${DIST}`);
