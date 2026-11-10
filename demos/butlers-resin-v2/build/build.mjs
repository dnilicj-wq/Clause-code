// Static site generator: real HTML for every page, WebP images, inlined CSS, one small deferred script.
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, cpSync } from 'fs';
import { dirname, join, extname, basename } from 'path';
import { SITE, FAQ, WHY, SERVICES, BLENDS, PAIRS, AREAS, GEO, miles, loadProjects, REVIEWS_CT, REVIEWS_FB } from './data.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const ORIG = join(ROOT, 'assets/orig');
const IMGCACHE = join(ROOT, '.imgcache');
const manifest = Object.fromEntries(Object.entries(JSON.parse(readFileSync(join(ROOT, 'src/raw/img-manifest.json')))).map(([k, v]) => [k, join(ROOT, v)]));
manifest['logo.jpg'] = join(ORIG, 'logo-white-v1.png');
if (!existsSync(manifest['logo.jpg'])) await sharp(join(ORIG, 'logo.jpg')).greyscale().linear(1.3, -10).png().toFile(manifest['logo.jpg']); // their logo, grey background lifted to white
manifest['hero-compass-poster.jpg'] = join(ORIG, 'hero-compass-poster.jpg');
const PROJECTS = loadProjects(manifest);
const pSlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'img'), { recursive: true });
mkdirSync(IMGCACHE, { recursive: true });
cpSync(join(ROOT, 'public'), DIST, { recursive: true });

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- images ----------
const meta = {};
for (const [k, f] of Object.entries(manifest)) {
  if (!existsSync(f)) continue;
  const m = await sharp(f).metadata();
  const rot = m.orientation >= 5;
  meta[k] = { w: rot ? m.height : m.width, h: rot ? m.width : m.height };
}
const jobs = new Map(); // out name -> {src, w, crop}
const VER = 'v1'; // changed image = new filename
function variants(file, widths, crop) {
  const m = meta[file];
  if (!m) throw new Error('missing image ' + file);
  const stem = slug(basename(manifest[file], extname(manifest[file]))).slice(0, 48) + (crop ? '-' + crop.tag : '') + '-' + VER;
  const ws = widths.filter((w) => w < m.w * 1.05);
  if (!ws.length) ws.push(Math.min(widths[0], m.w));
  return ws.map((w) => { const n = `${stem}-${w}.webp`; jobs.set(n, { src: manifest[file], w, crop }); return [n, w]; });
}
function img(file, alt, { sizes = '100vw', widths = [480, 900, 1500], cls = '', eager = false, crop } = {}) {
  const v = variants(file, widths, crop);
  const m = meta[file];
  const ratio = !crop ? m.h / m.w : crop.square ? 1 : crop.rel ? (crop.h * m.h) / (crop.w * m.w) : crop.h / crop.w;
  const w = v[v.length - 1][1];
  return `<img src="/img/${v[Math.min(1, v.length - 1)][0]}" srcset="${v.map(([n, w]) => `/img/${n} ${w}w`).join(', ')}" sizes="${sizes}" width="${w}" height="${Math.round(w * ratio)}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;
}
const imgUrl = (file, w = 900, crop) => '/img/' + variants(file, [w], crop)[0][0];

// ---------- icons ----------
const I = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  lr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.8 5.5 21.7l1.7-7.3L1.6 9.5 9 8.9z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1 0 1.6-.8 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4.1-4-7.4-9-7.4z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.7l5.7 5.7a8 8 0 1 1-11.3 0z"/><path d="M8 14h8M9 17.5h6"/></svg>',
  grip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 18c2-1 4-1 6 0s4 1 6 0 3-1 4 0M4 13c2-1 4-1 6 0s4 1 6 0 3-1 4 0M4 8c2-1 4-1 6 0s4 1 6 0 3-1 4 0"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="14" r="6"/><path d="M8.5 9.2L6 2h4l2 5 2-5h4l-2.5 7.2"/></svg>',
  road: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 21L9 3M19 21L15 3M12 5v2M12 11v2M12 17v2"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  drive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v4M19 10v4"/><path d="M4 21l3-7h10l3 7"/></svg>',
  patio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v6M15 9v6M9 15v6"/></svg>',
  path: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 22c0-6 8-6 8-12 0-3-2-6-4-8M4 22c0-6 8-6 8-12"/></svg>',
  other: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L13.4 13.4 8.5 15.5l2.1-4.9z"/></svg>',
};

// ---------- shared bits ----------
const LOGO = () => img('logo.jpg', "Butler's Resin & Construction", { widths: [160, 320], sizes: '160px', crop: LOGOCROP, eager: true });
let LOGOCROP; // set after trim
const RM_CROP = { tag: 'band', left: 0, top: 0.25, w: 1, h: 0.5, rel: true };
const blendOf = (name) => BLENDS.find((b) => b.name === name);
const nav = [['/services/', 'Services'], ['/projects/', 'Projects'], ['/areas/', 'Areas'], ['/#reviews', 'Reviews']];

function header(cur) {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="hdr"><div class="wrap">
<a class="logo" href="/" aria-label="Butler's Resin & Construction, home">${LOGO()}</a>
<nav class="nav" aria-label="Main">${nav.map(([h, t]) => `<a href="${h}"${cur === h ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
<a class="tel" href="tel:${SITE.tel}">${I.phone}${SITE.phone}</a>
<a class="btn sm" href="#quote">Free quote</a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Menu">${I.menu}</button>
</div>
<nav class="drawer" id="drawer" aria-label="Mobile">${nav.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="tel:${SITE.tel}">Call ${SITE.phone}</a></nav>
</header>`;
}
const waHref = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi Butler's, I'd like a quote for")}` : '#quote';
function bottomBar() {
  return `<nav class="bbar" aria-label="Quick contact"><a href="tel:${SITE.tel}">${I.phone}Call</a><a class="wa${SITE.whatsapp ? '' : ' placeholder'}" href="${waHref}"${SITE.whatsapp ? '' : ' data-placeholder="WhatsApp number needed"'}>${I.wa}WhatsApp</a><a class="q" href="#quote">Free quote</a></nav>`;
}
function footer() {
  return `<footer class="ftr"><div class="wrap"><div class="g">
<div><a class="lg" href="/">${LOGO()}</a>
<p>Resin bound driveways, patios and paths across Cambridgeshire, from our base in ${SITE.town}.</p>
<p><a href="tel:${SITE.tel}"><b>${SITE.phone}</b></a><br><a href="mailto:${SITE.email}">${SITE.email}</a></p>
<p><a href="${SITE.facebook}" rel="noopener" target="_blank">Facebook</a> · <a href="${SITE.instagram}" rel="noopener" target="_blank">Instagram</a> · <a href="${SITE.checkatrade}" rel="noopener" target="_blank">Checkatrade reviews</a></p></div>
<div><h3>Services</h3><ul>${SERVICES.map((s) => `<li><a href="/services/${s.slug}/">${s.name}</a></li>`).join('')}</ul></div>
<div><h3>Areas</h3><ul>${AREAS.slice(0, 12).map((a) => `<li><a href="/areas/${a.slug}/">${a.town}</a></li>`).join('')}</ul></div>
<div><h3>Company</h3><ul><li><a href="/projects/">Recent projects</a></li><li><a href="/#reviews">Reviews</a></li><li><a href="/#faq">FAQ</a></li><li><a href="/#quote">Free quote</a></li></ul>
<p style="margin-top:14px">${SITE.legal}<br>${SITE.town}, ${SITE.county}</p></div>
</div>
<div class="bt"><span>© 2026 ${esc(SITE.legal)}. All rights reserved.</span><span>Resin Mill Elite Installer · NRSWA qualified</span></div></div></footer>`;
}

const CSS = readFileSync(join(ROOT, 'src/styles.css'), 'utf8').replace(/\n/g, '').replace(/\s{2,}/g, ' ');
const BIZ = {
  '@type': 'HomeAndConstructionBusiness', '@id': SITE.url + '/#business', name: SITE.name, legalName: SITE.legal,
  url: SITE.url + '/', telephone: SITE.tel, email: SITE.email,
  address: { '@type': 'PostalAddress', addressLocality: SITE.town, addressRegion: SITE.county, addressCountry: 'GB' },
  areaServed: AREAS.map((a) => ({ '@type': 'City', name: a.town })), sameAs: SITE.sameAs,
};
function page({ path, title, desc, body, schema = [], cur, preload = '', ogImg }) {
  const url = SITE.url + path;
  const ld = [{ '@context': 'https://schema.org', ...BIZ, logo: SITE.url + imgUrl('logo.jpg', 320, LOGOCROP), image: SITE.url + imgUrl('hero-compass-poster.jpg', 1280) }, ...schema.map((s) => ({ '@context': 'https://schema.org', ...s }))];
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE.url + (ogImg || imgUrl('hero-compass-poster.jpg', 1280))}">
<meta name="theme-color" content="#ffffff"><link rel="icon" href="${imgUrl('logo.jpg', 160, LOGOCROP)}">
<link rel="preload" href="/fonts/fjalla-one.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>${preload}
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld)}</script>
<script>document.documentElement.className='js'</script>
</head><body>${header(cur)}<main id="main">${body}</main>${footer()}${bottomBar()}<script src="/app.js?v=${Date.now().toString(36)}" defer></script></body></html>`;
  const out = join(DIST, path, path.endsWith('/') ? 'index.html' : '');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  PAGES.push(path);
}
const PAGES = [];
const crumbs = (items) => `<nav class="crumbs wrap" aria-label="Breadcrumb">${items.map(([h, t], i) => (i < items.length - 1 ? `<a href="${h}">${esc(t)}</a> / ` : `<span aria-current="page">${esc(t)}</span>`)).join('')}</nav>`;
const crumbLd = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: SITE.url + h })) });

// ---------- components ----------
function projCard(p, sizes = '(min-width:980px) 33vw, (min-width:620px) 50vw, 100vw') {
  const b = p.blend && blendOf(p.blend);
  return `<a class="card" href="/projects/${p.slug}/"><div class="ph">${img(p.cover, `${p.name} in ${p.place}`, { sizes, widths: [480, 800] })}</div>
<div class="bd"><div class="pills"><span class="pill town">${esc(p.town === 'Cambridgeshire' ? 'Cambridgeshire' : p.town)}</span>${p.blend ? `<span class="pill">${b ? `<span class="sw" style="background-image:url(${imgUrl(b.img, 160)})"></span>` : ''}${esc(p.blend)}</span>` : ''}</div>
<h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p></div></a>`;
}
const stars = (n = 5) => `<span class="stars" aria-label="${n} out of 5 stars">${'★'.repeat(n)}</span>`;
function reviewCard(r) {
  const meta = r.source === 'Checkatrade' ? `<span><b>${esc(r.name)}</b>${r.loc ? ` · ${esc(r.loc)}` : ''} · ${esc(r.date)}</span>` : `<span><b>${esc(r.name)}</b> · ${esc(r.date)}</span>`;
  return `<article class="rv">${r.source === 'Checkatrade' ? '<span class="stars" aria-label="Scored 10 out of 10">10/10</span>' : stars(r.stars)}
${r.title ? `<h3>${esc(r.title)}</h3>` : ''}<p class="tx">${esc(r.text)}</p><button class="rm" type="button" hidden>Read more</button>
<div class="who">${meta}<span class="src ${r.source === 'Checkatrade' ? 'ct' : 'fb'}">${r.source}</span></div></article>`;
}
const ALL_REVIEWS = [REVIEWS_CT[0], ...REVIEWS_FB.slice(0, 2), REVIEWS_CT[2], REVIEWS_FB[9], REVIEWS_CT[4], ...REVIEWS_FB.slice(2, 9), REVIEWS_CT[1], REVIEWS_FB[10], REVIEWS_CT[3], REVIEWS_FB[11], REVIEWS_CT[5]];
function reviewsSection(list = ALL_REVIEWS, h = 'What customers say') {
  return `<section class="sec alt" id="reviews" aria-labelledby="rv-h"><div class="wrap">
<div class="head"><div><span class="eyebrow">Reviews</span><h2 id="rv-h">${h}</h2></div>
<div class="rail-nav"><button type="button" data-rail="-1" aria-label="Previous reviews">${I.left}</button><button type="button" data-rail="1" aria-label="Next reviews">${I.right}</button></div></div>
<div class="rv-sum"><a href="${SITE.checkatrade}" target="_blank" rel="noopener"><span class="sc">${SITE.ctScore}</span><span><b>Checkatrade</b> · ${SITE.ctCount} reviews</span></a>
<a href="${SITE.facebook}" target="_blank" rel="noopener"><span class="sc fb">5★</span><span><b>Facebook</b> · 5-star reviews</span></a></div>
<div class="rail" tabindex="0" aria-label="Customer reviews, scroll sideways">${list.map(reviewCard).join('')}</div>
<p class="note">Reviews copied word for word from Checkatrade and Facebook. Checkatrade shows a postcode district rather than a name for some reviewers.</p>
</div></section>`;
}
function quoteSection({ type = '', h = 'Get your free quote', intro = "Tell us about the job in three quick steps. We'll get back to you to arrange a look and a free, no-obligation quote." } = {}) {
  const T = [['Driveway', I.drive], ['Patio', I.patio], ['Path', I.path], ['Other', I.other]];
  return `<section class="sec" id="quote" aria-labelledby="q-h"><div class="wrap qz">
<div><span class="eyebrow">Free quote</span><h2 id="q-h">${h}</h2><p class="lead" style="margin-top:12px">${intro}</p>
<ul class="q-points"><li>${I.tick}<span>No prices guessed online. We look at your base first, then quote.</span></li><li>${I.tick}<span>Most driveways are done in 4 to 6 days, and we confirm your timeline before we start.</span></li><li>${I.tick}<span>Photos help. Snap the area now and add them in step 2.</span></li></ul></div>
<form class="qform" action="/api/quote" method="post" enctype="multipart/form-data" novalidate>
<div class="steps" aria-hidden="true"><i class="on"></i><i></i><i></i></div>
<input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
<input type="hidden" name="design" value=""><input type="hidden" name="page" value="">
<fieldset class="cur" data-step="1"><legend><span class="stepn">Step 1 of 3</span>What do you need?</legend>
<div class="chip" role="status">${I.palette}<span></span></div>
<div class="opts">${T.map(([t, ic]) => `<label><input type="radio" name="type" value="${t}"${t === type ? ' checked' : ''} required>${ic}${t}</label>`).join('')}</div>
<p class="err" data-for="type">Pick one to carry on.</p>
<div class="nav2"><button class="btn next" type="button">Next ${I.arrow}</button></div></fieldset>
<fieldset data-step="2"><legend><span class="stepn">Step 2 of 3</span>About the area</legend>
<label class="fld"><span>Rough size</span><select name="size"><option value="">Not sure</option><option>Small, under 30 m² (a path or small patio)</option><option>Medium, 30 to 60 m² (one or two cars)</option><option>Large, 60 to 100 m²</option><option>Very large, over 100 m²</option></select></label>
<label class="fld"><span>Current surface</span><select name="surface"><option value="">Choose one</option><option>Grass or soil</option><option>Loose gravel</option><option>Concrete</option><option>Block paving</option><option>Tarmac</option><option>Paving slabs</option><option>Something else</option></select></label>
<div class="fld"><span>Photos of the area <em>(optional, up to 6)</em></span><label class="drop">${I.cam}<span>Tap to add photos</span><input type="file" name="photos" accept="image/*" multiple></label><div class="thumbs" aria-live="polite"></div></div>
<div class="nav2"><button class="btn ghost back" type="button">Back</button><button class="btn next" type="button">Next ${I.arrow}</button></div></fieldset>
<fieldset data-step="3"><legend><span class="stepn">Step 3 of 3</span>Where can we reach you?</legend>
<label class="fld"><span>Your name</span><input name="name" autocomplete="name" required><span class="err" data-for="name">Please add your name.</span></label>
<label class="fld"><span>Phone number</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required><span class="err" data-for="phone">Please add a phone number we can call.</span></label>
<label class="fld"><span>Postcode</span><input name="postcode" autocomplete="postal-code" autocapitalize="characters" required><span class="err" data-for="postcode">Please add your postcode.</span></label>
<div class="nav2"><button class="btn ghost back" type="button">Back</button><button class="btn send" type="submit">Get my free quote</button></div>
<p class="err" data-for="send" role="alert">Something went wrong sending that. Please try again or call ${SITE.phone}.</p></fieldset>
<p class="alt-call">Rather talk? Call <a href="tel:${SITE.tel}">${SITE.phone}</a></p>
</form></div></section>`;
}
function faqSection(items = FAQ) {
  return `<section class="sec" id="faq" aria-labelledby="faq-h"><div class="wrap"><span class="eyebrow">FAQ</span><h2 id="faq-h" style="margin-bottom:18px">Questions we get asked</h2>
<div class="faq">${items.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
<p class="note">Can't see your question? Email <a href="mailto:${SITE.email}">${SITE.email}</a> or call <a href="tel:${SITE.tel}">${SITE.phone}</a>.</p></div></section>`;
}
const faqLd = (items = FAQ) => ({ '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const reviewLd = (list) => list.map((r) => ({ '@type': 'Review', itemReviewed: { '@id': SITE.url + '/#business' }, author: { '@type': 'Person', name: r.name }, reviewBody: r.text, ...(r.source === 'Facebook' ? { reviewRating: { '@type': 'Rating', ratingValue: r.stars, bestRating: 5 } } : { reviewRating: { '@type': 'Rating', ratingValue: 10, bestRating: 10 } }), publisher: { '@type': 'Organization', name: r.source } }));

function areasList() {
  return `<ul class="areas">${AREAS.map((a) => `<li><a href="/areas/${a.slug}/">${a.town}<small>${a.town === 'Chatteris' ? 'Home' : Math.round(miles('Chatteris', a.town)) + ' mi'}</small></a></li>`).join('')}</ul>`;
}

// Their compass inlay drawn as SVG (designer)
const COMPASS = `<g id="cmp" fill="#262628"><circle r="34" fill="none" stroke="#262628" stroke-width="3.2"/><circle r="27" fill="none" stroke="#262628" stroke-width="1.6"/>
<path d="M0-44 6-6 0 0-6-6zM44 0 6 6 0 0 6-6zM0 44-6 6 0 0 6 6zM-44 0-6-6 0 0-6 6z"/><path d="M0-44 6-6 0 0z" fill="#56565a"/><path d="M44 0 6 6 0 0z" fill="#56565a"/><path d="M0 44-6 6 0 0z" fill="#56565a"/><path d="M-44 0-6-6 0 0z" fill="#56565a"/>
<path d="M22-22 4-2 0 0 2-4zM22 22 2 4 0 0 4 2zM-22 22-4 2 0 0-2 4zM-22-22-2-4 0 0-4-2z"/>
<g font-family="Fjalla,Impact,sans-serif" font-size="15" text-anchor="middle"><text y="-50">N</text><text y="61">S</text><text x="56" y="5.5">E</text><text x="-56" y="5.5">W</text></g></g>`;
function designer() {
  return `<section class="sec alt" id="design" aria-labelledby="dz-h"><div class="wrap">
<div class="head"><div><span class="eyebrow">Design your driveway</span><h2 id="dz-h">Your colours. Your border. Your inlay.</h2></div>
<p class="lead">Custom colours and inlays are what we're known for. Try the real Resin Mill blends we lay, add a border and our compass, then send the design with your quote request.</p></div>
<div class="dz"><div class="pv"><svg viewBox="0 0 400 310" role="img" aria-labelledby="pv-t"><title id="pv-t">Top-down drawing of a driveway in the chosen design</title>
<defs>${BLENDS.map((b) => `<pattern id="r-${b.key}" patternUnits="userSpaceOnUse" width="40" height="40"><image href="/img/${TILES[b.key]}" width="40" height="40"/></pattern>`).join('')}
<pattern id="blk" patternUnits="userSpaceOnUse" width="20" height="10"><rect width="20" height="10" fill="#3a3b3e"/><path d="M0 .5h20M10 0v10" stroke="#232325" stroke-width="1.2"/></pattern>
<pattern id="gr" patternUnits="userSpaceOnUse" width="12" height="12"><rect width="12" height="12" fill="#c4c6c8"/><path d="M0 .5h12M.5 0v12" stroke="#9fa2a5" stroke-width="1"/><rect x="2" y="3" width="3" height="2" fill="#d6d8d9"/><rect x="7" y="7" width="2" height="2" fill="#b0b3b5"/></pattern>
<pattern id="roof" patternUnits="userSpaceOnUse" width="14" height="9"><rect width="14" height="9" fill="#55595e"/><path d="M0 8.5h14M7 0v9" stroke="#45484c" stroke-width="1"/></pattern>
<pattern id="grass" patternUnits="userSpaceOnUse" width="8" height="8"><rect width="8" height="8" fill="#6f9a4b"/><path d="M1 2h1M5 5h1M3 7h1" stroke="#80ab5a"/></pattern>
<clipPath id="drv"><rect x="70" y="96" width="318" height="186"/></clipPath></defs>
<rect width="400" height="310" fill="url(#grass)"/>
<rect x="0" y="282" width="400" height="28" fill="#b9b6ae"/><path d="M0 282h400" stroke="#8d8a83" stroke-width="2"/><rect x="214" y="280" width="98" height="5" fill="#a19e96"/>
<rect x="64" y="0" width="330" height="88" fill="url(#roof)"/><path d="M64 44h330" stroke="#3b3e42" stroke-width="3"/><rect x="64" y="86" width="330" height="5" fill="#d8d3c7"/><rect x="170" y="88" width="34" height="8" fill="#6b4a33"/>
<rect id="pv-fill" x="70" y="96" width="318" height="186" fill="url(#r-verona)"/>
<g id="pv-border" fill="none" stroke-width="12" clip-path="url(#drv)"><rect x="76" y="102" width="306" height="174" stroke="url(#blk)"/></g>
<g id="pv-cmp" transform="translate(229 189) scale(.95)">${COMPASS}</g>
</svg><div class="cap"><span>Blend: <b id="pv-b">Verona</b></span><span>Border: <b id="pv-e">Charcoal block</b></span><span>Compass: <b id="pv-c">Yes</b></span></div></div>
<div class="ctls">
<div class="ctl"><span id="bl-l">1. Pick a Resin Mill blend</span><div class="blends" role="radiogroup" aria-labelledby="bl-l">${BLENDS.map((b, i) => `<label><input type="radio" name="dz-blend" value="${b.key}" data-name="${b.name}"${i === 0 ? ' checked' : ''}><span class="sw" style="background-image:url(${imgUrl(b.img, 160, { tag: 'tile', square: true })})"></span>${b.name}</label>`).join('')}</div></div>
<div class="ctl"><span id="bo-l">2. Choose a border</span><div class="seg" role="radiogroup" aria-labelledby="bo-l">${[['none', 'None'], ['blk', 'Charcoal block'], ['gr', 'Silver granite']].map(([v, t]) => `<label><input type="radio" name="dz-border" value="${v}" data-name="${t}"${v === 'blk' ? ' checked' : ''}><i></i>${t}</label>`).join('')}</div></div>
<div class="ctl"><label class="tgl"><span><b>3. Add a compass inlay</b><small>Like the one in the video at the top of this page</small></span><input type="checkbox" id="dz-cmp" checked></label></div>
<a class="btn wide" href="#quote" id="dz-send">Send me this design with my quote ${I.arrow}</a>
<p class="note">The blend swatches are photos of the real Resin Mill stone. Screens vary, so ask to see the colour in person before you decide. No prices here: every base is different, so we look first and quote after.</p>
</div></div></div></section>`;
}

// ---------- pages ----------
const LOCAL = ['Warboys', 'Huntingdon', 'Ely', 'Mepal', 'March', 'Littleport', 'Sawtry', 'Chatteris', 'Yaxley', 'Thorney'];
const localProjects = PROJECTS.filter((p) => LOCAL.includes(p.town));
const homeWork = ['composite-fencing-resin-patio-and-path-warboys', 'verona-resin-bound-patio-huntingdon', 'resin-driveway-and-entrance-transformation-ely', 'resin-bound-front-entrance-installation-chatteris', 'resin-pathway-and-patio-renovation-march-cambridgeshire', 'evening-rose-resin-mix-installation-yaxley-peterborough', 'resin-front-yard-transformation-sawtry', 'resin-garden-makeover-huntingdon', 'smooth-resin-bound-pathway-and-garden-revamp-littleport'].map((s) => pSlug[s] || console.warn('no project', s)).filter(Boolean);

const TILES = {};
// Top-down resin texture per blend: aggregate dots coloured from the real swatch photo, tiling seamlessly.
async function makeTiles() {
  for (const b of BLENDS) {
    const name = `resin-tile-${b.key}-v1.webp`; TILES[b.key] = name;
    const cache = join(IMGCACHE, name);
    if (!existsSync(cache)) {
      const { data } = await sharp(manifest[b.img]).rotate().resize(20, 20, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const cols = []; for (let i = 0; i < data.length; i += 3) cols.push(`rgb(${data[i]},${data[i + 1]},${data[i + 2]})`);
      let seed = [...b.key].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
      const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      const N = 160, dots = [];
      for (let i = 0; i < 900; i++) {
        const x = rnd() * N, y = rnd() * N, r = 1.6 + rnd() * 2.6, c = cols[Math.floor(rnd() * cols.length)];
        for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { const X = x + dx, Y = y + dy; if (X > -6 && X < N + 6 && Y > -6 && Y < N + 6) dots.push(`<ellipse cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * (0.7 + rnd() * 0.3)).toFixed(1)}" fill="${c}"/>`); }
      }
      const mean = cols[Math.floor(cols.length / 2)];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}"><rect width="${N}" height="${N}" fill="${mean}"/>${dots.join('')}</svg>`;
      await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(cache);
    }
    cpSync(cache, join(DIST, 'img', name));
  }
}

async function build() {
  await makeTiles();
  // trim logo whitespace once to get a tight crop
  const t = await sharp(manifest['logo.jpg']).trim({ background: '#ffffff', threshold: 30 }).toBuffer({ resolveWithObject: true });
  LOGOCROP = { tag: 'trim', left: -t.info.trimOffsetLeft, top: -t.info.trimOffsetTop, w: t.info.width, h: t.info.height };

  const hp = (p) => `<link rel="preload" as="image" href="${imgUrl('hero-compass-poster.jpg', 900)}" imagesrcset="${variants('hero-compass-poster.jpg', [480, 900, 1280]).map(([n, w]) => `/img/${n} ${w}w`).join(', ')}" imagesizes="(min-width:900px) 55vw, 100vw" fetchpriority="high">`;
  const pairBtn = PAIRS.map((p, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(p.label)}</button>`).join('');
  const pairData = PAIRS.map((p) => ({ b: variants(p.before, [480, 900, 1400]).map(([n, w]) => `/img/${n} ${w}w`).join(', '), a: variants(p.after, [480, 900, 1400]).map(([n, w]) => `/img/${n} ${w}w`).join(', ') }));
  const homeReviews = ALL_REVIEWS;

  // HOME
  page({
    path: '/', title: "Resin Driveways Chatteris & Cambridgeshire | Butler's Resin & Construction",
    desc: "Resin bound driveways, patios and paths across Cambridgeshire from Chatteris. Resin Mill Elite Installer, NRSWA qualified, 10/10 on Checkatrade. Free quote: 0333 339 9898.",
    preload: hp(), schema: [faqLd(), ...reviewLd(homeReviews)],
    body: `<section class="hero"><div class="wrap grid">
<div class="hero-media">${img('hero-compass-poster.jpg', "Overhead view of the compass design in a golden resin driveway laid by Butler's", { eager: true, widths: [480, 900, 1280], sizes: '(min-width:900px) 55vw, 100vw' })}
<video muted playsinline loop preload="none" data-src="/media/hero-compass-v1.mp4" aria-hidden="true" tabindex="-1"></video><span class="tag">Compass inlay, laid by Butler's</span></div>
<div class="hero-copy"><span class="eyebrow">Chatteris · Cambridgeshire</span><h1>Resin driveways, <span>laid properly.</span></h1>
<p class="sub">Chatteris-based. Resin Mill Elite Installer. Most driveways done in 4 to 6 days.</p>
<div class="ctas"><a class="btn" href="#quote">Get my free quote</a><a class="btn ghost" href="#work">See our work</a></div></div>
</div></section>
<div class="trust"><div class="wrap"><ul>
<li><a href="${SITE.checkatrade}" target="_blank" rel="noopener" style="display:flex;gap:10px;align-items:center"><span class="ic">${I.star}</span><span><b>${SITE.ctScore} Checkatrade</b>${SITE.ctCount} reviews</span></a></li>
<li><a href="${SITE.facebook}" target="_blank" rel="noopener" style="display:flex;gap:10px;align-items:center"><span class="ic">${I.star}</span><span><b>5★ reviews</b>on Facebook</span></a></li>
<li>${img('Back Middle.png', 'The Resin Mill Elite Installer badge', { widths: [160, 320], sizes: '72px', cls: 'rm', crop: RM_CROP })}<span><b>Resin Mill</b>Elite Installer</span></li>
<li><span class="ic">${I.road}</span><span><b>NRSWA</b>qualified</span></li>
<li><span class="ic">${I.medal}</span><span><b>10+ years</b>in the industry</span></li>
</ul></div></div>
<section class="sec" id="work" aria-labelledby="w-h"><div class="wrap">
<div class="head"><div><span class="eyebrow">Our recent work</span><h2 id="w-h">Driveways, patios & paths near you</h2></div><p class="lead">Every photo is a Butler's job. Tap one to see the before, the build and the finish.</p></div>
<div class="cards compact">${homeWork.map((p) => projCard(p)).join('')}</div>
<div class="more"><a class="btn ghost" href="/projects/">See all ${PROJECTS.length} projects ${I.arrow}</a></div></div></section>
<section class="sec alt" aria-labelledby="ba-h"><div class="wrap">
<div class="head"><div><span class="eyebrow">Before & after</span><h2 id="ba-h">Drag to see the difference</h2></div></div>
<div class="ba-tabs" role="tablist" aria-label="Before and after projects">${pairBtn}</div>
<div class="ba" data-pairs='${JSON.stringify(pairData).replace(/'/g, '&#39;')}'>
${img(PAIRS[0].after, 'After: finished work by Butler\'s', { widths: [480, 900, 1400], sizes: '(min-width:1000px) 980px, 100vw', cls: 'af' })}
${img(PAIRS[0].before, 'Before: the site prior to work', { widths: [480, 900, 1400], sizes: '(min-width:1000px) 980px, 100vw', cls: 'bf' })}
<span class="lbl l1">Before</span><span class="lbl l2">After</span><div class="bar"><span class="knob">${I.lr}</span></div>
<input type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after"></div>
<p class="ba-cap">Use your thumb or the arrow keys. Photos from our own jobs.</p></div></section>
${designer().replace('class="sec alt"', 'class="sec"')}
<section class="sec alt" aria-labelledby="why-h"><div class="wrap">
<div class="head"><div><span class="eyebrow">Why Butler's</span><h2 id="why-h">Engineered for strength & style</h2></div><p class="lead">Every surface we lay starts with a properly prepared base, so it looks right on day one and for years after.</p></div>
<ul class="why">${WHY.map(([ic, h, p]) => `<li><span class="ic">${I[ic]}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ul></div></section>
<section class="sec" aria-labelledby="team-h"><div class="wrap team">
<div class="ph">${img('dji_fly_20241223_143928_0027_1734965263233_pho.jpg', "A Butler's team member looks over a finished golden resin driveway with a compass design", { sizes: '(min-width:900px) 50vw, 100vw' })}</div>
<div><span class="eyebrow">Meet the team</span><h2 id="team-h">You can always trust the Butler</h2>
<p class="lead" style="margin:14px 0 18px">A Chatteris-based team laying resin bound driveways, patios and paths across Cambridgeshire. Customers name Bill in most of their reviews, often with his brother or Jordan alongside him.</p>
<blockquote>“Bill and his brother have laid a new resin bound patio for us this week and the results are exceptional.”<cite>Rachel Courten, Facebook</cite></blockquote>
<blockquote>“Just had Bill and Jordan back for a third time, this time a complete transformation of my driveway.”<cite>Verified reviewer, PE15, Checkatrade</cite></blockquote>
<div class="rm-badge">${img('Back Middle.png', 'The Resin Mill Elite Installer badge', { widths: [240], sizes: '120px', crop: RM_CROP })}<span>The Resin Mill, the UK's largest resin bound products manufacturer, has recognised us as an Elite Installer.</span></div>
</div></div></section>
${reviewsSection(homeReviews)}
<section class="sec" aria-labelledby="ar-h"><div class="wrap">
<div class="head"><div><span class="eyebrow">Areas we cover</span><h2 id="ar-h">Based in Chatteris. Working across the county.</h2></div><p class="lead">Distances are from Chatteris. Not on the list? Ask anyway, we cover Cambridgeshire and beyond.</p></div>
${areasList()}</div></section>
${quoteSection()}
${faqSection().replace('class="sec"', 'class="sec alt"')}`,
  });

  // SERVICES
  page({
    path: '/services/', cur: '/services/', title: "Our Services | Resin, Block Paving, Fencing | Butler's Resin & Construction",
    desc: 'Resin bound driveways, resin patios and paths, block paving, fencing, drop kerbs, pressure washing, tiling and flooring from Butler\'s in Chatteris.',
    schema: [crumbLd([['/', 'Home'], ['/services/', 'Services']])],
    body: `${crumbs([['/', 'Home'], ['/services/', 'Services']])}<section class="sec" style="padding-top:20px"><div class="wrap"><span class="eyebrow">Our services</span><h1 style="margin-bottom:12px">Driveways, groundwork & finishing</h1><p class="lead" style="margin-bottom:28px">Done properly, first time.</p>
<div class="svc-grid">${SERVICES.map((s) => `<a class="card" href="/services/${s.slug}/"><div class="ph">${img(s.imgs[0], `${s.name} by Butler's Resin & Construction`, { widths: [480, 800], sizes: '(min-width:980px) 33vw, (min-width:620px) 50vw, 100vw' })}</div><div class="bd"><h3>${s.name}</h3><p>${esc(s.copy.split('. ')[0])}.</p></div></a>`).join('')}</div></div></section>${quoteSection()}`,
  });
  for (const s of SERVICES) {
    const rel = PROJECTS.filter((p) => (s.kind === 'resin' ? p.kind === 'resin' && (s.slug === 'resin-bound-driveways' ? /drive/i.test(p.name + p.lines.join(' ')) : /patio|path|garden/i.test(p.name)) : s.kind === 'block' ? p.kind === 'paving' || /block paving/i.test(p.name) : s.kind === 'fence' ? /fenc/i.test(p.name) : s.kind === 'interior' ? p.kind === 'interior' : false)).slice(0, 6);
    const items = [['/', 'Home'], ['/services/', 'Services'], [`/services/${s.slug}/`, s.name]];
    const qtype = s.slug === 'resin-patios-paths' ? 'Patio' : s.kind === 'resin' || s.kind === 'block' || s.kind === 'kerb' ? 'Driveway' : 'Other';
    page({
      path: `/services/${s.slug}/`, cur: '/services/', title: `${s.title} | Butler's Resin & Construction`,
      desc: `${s.name} from Butler's Resin & Construction in Chatteris. ${s.points.join('. ')}. Free quote on 0333 339 9898.`.slice(0, 158),
      schema: [crumbLd(items), { '@type': 'Service', name: s.name, provider: { '@id': SITE.url + '/#business' }, areaServed: AREAS.map((a) => a.town), description: s.copy }],
      ogImg: imgUrl(s.imgs[0], 1200),
      body: `${crumbs(items)}<section class="ph-hero"><div class="wrap grid"><div><span class="eyebrow">Our services</span><h1>${s.name}</h1><p class="lead">${esc(s.copy)}</p>${s.copy2 ? `<p class="lead">${esc(s.copy2)}</p>` : ''}
<ul class="ticks">${s.points.map((p) => `<li>${I.tick}${esc(p)}</li>`).join('')}</ul><div class="ctas"><a class="btn" href="#quote">Get my free quote</a><a class="btn ghost" href="tel:${SITE.tel}">${I.phone}${SITE.phone}</a></div></div>
<div class="img">${img(s.imgs[0], `${s.name} by Butler's Resin & Construction`, { eager: true, sizes: '(min-width:900px) 50vw, 100vw' })}</div></div></section>
${s.imgs.length > 1 ? `<section class="sec alt"><div class="wrap"><h2 style="margin-bottom:20px">${s.name}: our photos</h2><div class="gal">${s.imgs.slice(1).map((f) => `<figure>${img(f, `${s.name} job by Butler's Resin & Construction`, { widths: [480, 800], sizes: '(min-width:760px) 33vw, 50vw' })}</figure>`).join('')}</div></div></section>` : ''}
${s.kind === 'resin' ? `<section class="sec"><div class="wrap"><h2 style="margin-bottom:20px">Why resin bound</h2><ul class="why">${WHY.map(([ic, h, p]) => `<li><span class="ic">${I[ic]}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ul></div></section>` : ''}
${rel.length ? `<section class="sec${s.kind === 'resin' ? ' alt' : ''}"><div class="wrap"><div class="head"><h2>Recent ${s.short.toLowerCase()} projects</h2><a class="btn ghost sm" href="/projects/">All projects</a></div><div class="cards compact">${rel.map((p) => projCard(p)).join('')}</div></div></section>` : ''}
${quoteSection({ type: qtype })}
<section class="sec alt"><div class="wrap"><h2 style="margin-bottom:16px">${s.name} near you</h2><ul class="links">${AREAS.map((a) => `<li><a href="/areas/${a.slug}/">${a.town}</a></li>`).join('')}</ul></div></section>
${s.kind === 'resin' ? faqSection() : ''}`,
    });
  }

  // PROJECTS
  page({
    path: '/projects/', cur: '/projects/', title: "Recent Projects | Resin Driveways & Patios | Butler's Resin & Construction",
    desc: `${PROJECTS.length} recent Butler's projects: resin driveways, patios, paths, fencing and garden transformations in Warboys, Huntingdon, Ely, March, Sawtry, Chatteris and more.`,
    schema: [crumbLd([['/', 'Home'], ['/projects/', 'Projects']])],
    body: `${crumbs([['/', 'Home'], ['/projects/', 'Projects']])}<section class="sec" style="padding-top:20px"><div class="wrap"><span class="eyebrow">Recent Butler projects</span><h1 style="margin-bottom:12px">Our work, job by job</h1><p class="lead" style="margin-bottom:28px">Each project shows the before, the build and the finish, with the town and the resin blend we used.</p>
<div class="cards compact">${PROJECTS.map((p) => projCard(p)).join('')}</div></div></section>${quoteSection()}`,
  });
  for (const p of PROJECTS) {
    const items = [['/', 'Home'], ['/projects/', 'Projects'], [`/projects/${p.slug}/`, p.name]];
    const b = p.blend && blendOf(p.blend);
    const near = PROJECTS.filter((q) => q !== p && GEO[q.town] && GEO[p.town]).sort((a, c) => miles(p.town, a.town) - miles(p.town, c.town)).slice(0, 3);
    const area = AREAS.find((a) => a.town === p.town) || AREAS.slice().sort((a, c) => (GEO[p.town] ? miles(p.town, a.town) - miles(p.town, c.town) : 0))[0];
    page({
      path: `/projects/${p.slug}/`, cur: '/projects/', title: `${p.name} – ${p.place} | Butler's Resin & Construction`,
      desc: `${p.summary} A Butler's Resin & Construction project in ${p.place}.`.slice(0, 160),
      schema: [crumbLd(items)], ogImg: imgUrl(p.cover, 1200),
      body: `${crumbs(items)}<section class="ph-hero" style="padding-bottom:28px"><div class="wrap"><span class="eyebrow">Project · ${esc(p.place)}</span><h1>${esc(p.name)}</h1>
<div class="facts"><span class="pill town">${esc(p.place)}</span>${p.blend ? `<span class="pill">${b ? `<span class="sw" style="background-image:url(${imgUrl(b.img, 160)})"></span>` : ''}Resin: ${esc(p.blend)} (Resin Mill)</span>` : ''}</div>
<div class="gal">${p.photos.slice(0, 7).map((f, i) => `<figure${i === 0 ? ' class="big"' : ''}>${img(f.file, f.alt || `${p.name}, photo ${i + 1}`, { eager: i === 0, widths: i === 0 ? [480, 900, 1500] : [480, 800], sizes: i === 0 ? '(min-width:1180px) 1130px, 100vw' : '(min-width:760px) 33vw, 50vw' })}</figure>`).join('')}</div></div></section>
<section class="sec" style="padding-top:12px"><div class="wrap side"><div class="prose">${renderLines(p)}</div>
<aside><div class="box">${b ? `<div class="swbig" style="background-image:url(${imgUrl(b.img, 480)})"></div><h3>${esc(b.name)}</h3><p class="note" style="margin-top:0">The Resin Mill blend used on this job. Try it in the <a href="/#design">driveway designer</a>.</p>` : `<h3>Want something similar?</h3>`}
<a class="btn wide" href="#quote" style="margin-top:6px">Get my free quote</a><p class="alt-call">or call <a href="tel:${SITE.tel}">${SITE.phone}</a></p></div>
${area ? `<p class="note" style="margin-top:16px">More about our work in <a href="/areas/${area.slug}/">${area.town}</a>.</p>` : ''}</aside></div></section>
${near.length ? `<section class="sec alt"><div class="wrap"><h2 style="margin-bottom:20px">More projects nearby</h2><div class="cards compact">${near.map((q) => projCard(q)).join('')}</div></div></section>` : ''}
${quoteSection({ type: /path/i.test(p.name) && !/drive/i.test(p.name) ? 'Path' : /patio|garden/i.test(p.name) ? 'Patio' : p.kind === 'resin' ? 'Driveway' : 'Other', h: 'Want something like this?' })}`,
    });
  }

  // AREAS
  page({
    path: '/areas/', cur: '/areas/', title: "Areas We Cover | Resin Driveways Cambridgeshire | Butler's Resin & Construction",
    desc: 'Butler\'s lays resin driveways, patios and paths across Cambridgeshire from Chatteris: March, Ely, Wisbech, Huntingdon, St Ives, Ramsey, Warboys, Sawtry, Whittlesey, Peterborough and Thorney.',
    schema: [crumbLd([['/', 'Home'], ['/areas/', 'Areas']])],
    body: `${crumbs([['/', 'Home'], ['/areas/', 'Areas']])}<section class="sec" style="padding-top:20px"><div class="wrap"><span class="eyebrow">Areas we cover</span><h1 style="margin-bottom:12px">Resin driveways across Cambridgeshire</h1><p class="lead" style="margin-bottom:28px">We're based in Chatteris and work across Cambridgeshire and beyond. Pick your town to see work we've done nearby.</p>${areasList()}</div></section>${quoteSection()}`,
  });
  AREAS.forEach((a, ai) => {
    const items = [['/', 'Home'], ['/areas/', 'Areas'], [`/areas/${a.slug}/`, a.town]];
    const near = localProjects.filter((p) => p.kind !== 'interior').map((p) => [p, miles(a.town, p.town)]).sort((x, y) => x[1] - y[1]).slice(0, 6).map((x) => x[0]);
    const d = Math.round(miles('Chatteris', a.town));
    const rv = [REVIEWS_FB[(ai * 2) % 12], REVIEWS_CT[ai % 6], REVIEWS_FB[(ai * 2 + 1) % 12]];
    const others = AREAS.filter((x) => x !== a).sort((x, y) => miles(a.town, x.town) - miles(a.town, y.town));
    page({
      path: `/areas/${a.slug}/`, cur: '/areas/', title: `Resin Driveways ${a.town} | Patios & Paths | Butler's Resin & Construction`,
      desc: `Resin bound driveways, patios and paths in ${a.town}${a.town === 'Chatteris' ? ', where we are based' : `, ${d} miles from our Chatteris base`}. Resin Mill Elite Installer. Free quote: 0333 339 9898.`,
      schema: [crumbLd(items), { '@type': 'Service', name: `Resin driveways in ${a.town}`, provider: { '@id': SITE.url + '/#business' }, areaServed: { '@type': 'City', name: a.town } }],
      ogImg: imgUrl(near[0].cover, 1200),
      body: `${crumbs(items)}<section class="ph-hero"><div class="wrap grid"><div><span class="eyebrow">${a.town === 'Chatteris' ? 'Our home town' : `${d} miles from Chatteris`}</span><h1>Resin driveways in ${a.town}</h1>
<p class="lead">${esc(a.intro)}</p><p>${esc(a.local)}</p>
<div class="ctas"><a class="btn" href="#quote">Get my free quote</a><a class="btn ghost" href="tel:${SITE.tel}">${I.phone}${SITE.phone}</a></div></div>
<div class="img">${img(near[0].cover, `${near[0].name} in ${near[0].place}`, { eager: true, sizes: '(min-width:900px) 50vw, 100vw' })}</div></div></section>
<section class="sec alt"><div class="wrap"><div class="head"><div><span class="eyebrow">Nearby work</span><h2>Projects in and near ${a.town}</h2></div><a class="btn ghost sm" href="/projects/">All projects</a></div>
<div class="cards compact">${near.map((p) => projCard(p)).join('')}</div></div></section>
<section class="sec"><div class="wrap"><div class="head"><div><span class="eyebrow">What we do in ${a.town}</span><h2>Services</h2></div></div>
<ul class="links">${SERVICES.map((s) => `<li><a href="/services/${s.slug}/">${s.name}</a></li>`).join('')}</ul>
<ul class="why" style="margin-top:26px">${WHY.slice(0, 3).map(([ic, h, p]) => `<li><span class="ic">${I[ic]}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ul></div></section>
${reviewsSection(rv, 'What customers say')}
${quoteSection({ type: 'Driveway', h: `Free quote in ${a.town}` })}
<section class="sec alt"><div class="wrap"><h2 style="margin-bottom:16px">Other areas we cover</h2><ul class="links">${others.map((x) => `<li><a href="/areas/${x.slug}/">${x.town}</a></li>`).join('')}</ul></div></section>`,
    });
  });

  // thanks + 404
  page({ path: '/thanks/', title: "Thanks | Butler's Resin & Construction", desc: 'Thanks for your quote request.', body: `<section class="sec"><div class="wrap" style="max-width:640px;text-align:center"><h1>Thanks, we've got it</h1><p class="lead" style="margin:16px auto">Your quote request is with us. We'll be in touch to arrange a look at the job. If it's urgent, call <a href="tel:${SITE.tel}">${SITE.phone}</a>.</p><a class="btn" href="/">Back to the homepage</a></div></section>` });
  page({ path: '/404.html', title: "Page not found | Butler's Resin & Construction", desc: 'Page not found.', body: `<section class="sec"><div class="wrap" style="max-width:640px;text-align:center"><h1>That page has moved</h1><p class="lead" style="margin:16px auto">Try our <a href="/projects/">recent projects</a>, the <a href="/services/">services</a>, or call <a href="tel:${SITE.tel}">${SITE.phone}</a>.</p><a class="btn" href="/">Homepage</a></div></section>` });

  // sitemap + robots + headers
  const urls = PAGES.filter((p) => !/thanks|404/.test(p));
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${SITE.url}${u}</loc><lastmod>2026-11-10</lastmod></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
  writeFileSync(join(DIST, '_headers'), `/*\n  X-Robots-Tag: noindex\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/img/*\n  Cache-Control: public, max-age=31536000, immutable\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/media/*\n  Cache-Control: public, max-age=31536000, immutable\n`);

  // app.js
  cpSync(join(ROOT, 'src/app.js'), join(DIST, 'app.js'));
  mkdirSync(join(DIST, 'media'), { recursive: true });
  cpSync(join(ROOT, 'assets/hero-compass.mp4'), join(DIST, 'media/hero-compass-v1.mp4'));

  // images
  let made = 0;
  await Promise.all([...jobs].map(async ([name, j]) => {
    const cache = join(IMGCACHE, name);
    if (!existsSync(cache)) {
      let s = sharp(j.src).rotate();
      if (j.crop) {
        const m = await sharp(j.src).rotate().toBuffer({ resolveWithObject: true });
        const W = m.info.width, H = m.info.height;
        let c;
        if (j.crop.square) { const sz = Math.min(W, H) * 0.6; c = { left: Math.round((W - sz) / 2), top: Math.round((H - sz) / 2), width: Math.round(sz), height: Math.round(sz) }; }
        else if (j.crop.rel) c = { left: Math.round(j.crop.left * W), top: Math.round(j.crop.top * H), width: Math.round(j.crop.w * W), height: Math.round(j.crop.h * H) };
        else c = { left: j.crop.left, top: j.crop.top, width: j.crop.w, height: j.crop.h };
        s = sharp(m.data).extract(c);
      }
      await s.resize({ width: j.w, withoutEnlargement: true }).webp({ quality: j.w <= 500 ? 70 : 66, effort: 5 }).toFile(cache);
      made++;
    }
    cpSync(cache, join(DIST, 'img', name));
  }));
  console.log(`pages ${PAGES.length}, images ${jobs.size} (${made} new)`);
}

// Their project text, as real HTML. Headings and lists inferred from their line structure; wording untouched.
function renderLines(p) {
  const out = []; let list = false;
  const otherBlend = (l) => p.blend && /^(Rich|Natural|Cool|Warm|Light)[^:]*:/.test(l) && BLENDS.some((b) => b.name !== p.blend && l.includes(b.name));
  for (let l of p.lines) {
    l = l.replace(/^[^\p{L}\p{N}“"(]+/u, '').trim();
    if (!l || /^PROJECT HIGHLIGHTS$/i.test(l) || otherBlend(l)) continue;
    const isHead = (l.length < 70 && (l === l.toUpperCase() || /(Resin Mix|Mix \(Resin Mill\))/.test(l) || /^(Before|Our Vision|The Results|After|The Process|Project)/i.test(l))) || (l.endsWith(':') && l.length < 80 && !/^(Key issues|Planned works|Works|Key|The work)/i.test(l));
    const opensList = l.endsWith(':') && !isHead;
    if (isHead) { if (list) { out.push('</ul>'); list = false; } out.push(`<h2>${esc(l.replace(/:$/, '').toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase()))}</h2>`); continue; }
    if (opensList) { if (list) out.push('</ul>'); out.push(`<p><strong>${esc(l)}</strong></p><ul>`); list = true; continue; }
    if (list && l.length < 170 && !/[.!]$/.test(l)) { out.push(`<li>${esc(l)}</li>`); continue; }
    if (list) { out.push('</ul>'); list = false; }
    const m = l.match(/^([A-Z][^:]{2,48}):\s+(.+)$/);
    out.push(m ? `<p><strong>${esc(m[1])}:</strong> ${esc(m[2])}</p>` : `<p>${esc(l)}</p>`);
  }
  if (list) out.push('</ul>');
  return out.join('\n');
}

await build();
