// Static build for the Gafflow Resin Finishes demo. `node build.mjs` → dist/
// Every live URL from gafflowresinfinishes.com keeps its exact path, trailing slash included (see redirects.md).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { build } from 'esbuild';
import site from './site.config.mjs';
import rates from './pricing.config.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, process.env.OUT || 'dist');
const legacy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/legacy.json'), 'utf8'));
const RAW = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products-raw.json'), 'utf8'));
const { biz } = site;
const BASE = site.siteUrl;
if (process.env.NOINDEX === '0') site.noindex = false; // launch-mode build for audits

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });

/* ---------- assets ---------- */
await build({
  entryPoints: [path.join(SRC, 'js/main.js')], outdir: path.join(DIST, 'assets'), bundle: true, format: 'esm',
  splitting: true, minify: true, target: 'es2020', chunkNames: '[name]-[hash]', logLevel: 'warning',
});
await build({ entryPoints: [path.join(SRC, 'css/styles.css')], outdir: path.join(DIST, 'assets'), bundle: true, minify: true, external: ['/img/*', '/fonts/*'], logLevel: 'warning' });
const hash = (f) => crypto.createHash('md5').update(fs.readFileSync(path.join(DIST, 'assets', f))).digest('hex').slice(0, 10);
const V = { js: hash('main.js') };
const CSS = fs.readFileSync(path.join(DIST, 'assets/styles.css'), 'utf8');
for (const d of ['img', 'fonts']) fs.cpSync(path.join(SRC, d), path.join(DIST, d), { recursive: true });

/* ---------- helpers ---------- */
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ICONS = path.join(ROOT, 'node_modules/@phosphor-icons/core/assets');
const iconCache = new Map();
function icon(name, weight = 'regular') {
  const k = name + weight;
  if (!iconCache.has(k)) {
    const file = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
    const svg = fs.readFileSync(path.join(ICONS, weight, file), 'utf8');
    iconCache.set(k, svg.replace('<svg ', '<svg class="i" aria-hidden="true" focusable="false" '));
  }
  return iconCache.get(k);
}
function dims(file) {
  const b = fs.readFileSync(file);
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (t === 'VP8L') { const n = b.readUInt32LE(21); return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1]; }
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
}
// Responsive photo: <name>-640.webp + <name>-1280.webp
function img(name, alt, { sizes = '(max-width: 760px) 100vw, 50vw', eager = false, cls = '', small = false } = {}) {
  const big = `${name}-1280.webp`;
  const [w, h] = dims(path.join(SRC, 'img', big));
  const [w6] = dims(path.join(SRC, 'img', `${name}-640.webp`));
  const src = small ? `/img/${name}-640.webp` : `/img/${big}`;
  return `<img${cls ? ` class="${cls}"` : ''} src="${src}" srcset="/img/${name}-640.webp ${w6}w, /img/${big} ${w}w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
const pimg = (slug, alt) => `<img src="/img/p/${slug}.webp" alt="${esc(alt)}" width="480" height="480" loading="lazy" decoding="async">`;
// One enquiry number in site.config.mjs drives every call and WhatsApp link.
const PHONE_INTL = '+44' + biz.phone.replace(/\D/g, '').replace(/^0/, '');
const tel = `tel:${PHONE_INTL}`;
const wa = (text) => `https://wa.me/${PHONE_INTL.slice(1)}?text=${encodeURIComponent(text)}`;
const WA = wa('Hi Gafflow, I would like a quote for a resin floor. Here is a photo of the space. My postcode is ');
const WA_COURSE = wa('Hi Gafflow, I have a question.');
const abs = (p) => BASE + p;
const money = (n) => '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

/* ---------- products ---------- */
const CAT = {
  system: ['the-dpm-primer-coat', 'the-sub-base-coat', 'the-big-base-15kg', 'the-money-coat', 'the-matt-pu', 'the-g-2000'],
  pigments: [...site.bases.map((b) => b[0]), 'metallic-epoxy-powder-pigments-50g', 'metallic-epoxy-powder-pigments-300g', ...site.metallics.map((m) => `metallic-epoxy-powder-pigment-${m[0]}`)],
  kits: ['deep-cast-epoxy-resin-14-5kg-kit', 'arts-crafts-resin-kit-1kg', 'arts-crafts-resin-kit-3kg', 'resin-bound-mini-kit'],
  learn: ['the-resin-bible', 'intensive-resin-training-london', 'epoxy-flooring-course-eastbourne'],
};
const CAT_LABEL = { system: 'Flooring system', pigments: 'Pigments', kits: 'Kits', learn: 'Courses and guides' };
const products = Object.fromEntries(Object.entries(RAW).map(([slug, r]) => {
  const prices = [...r.price.matchAll(/£([\d,]+\.\d{2})/g)].map((m) => +m[1].replace(/,/g, ''));
  const lo = prices[0], hi = prices[1] && prices[1] !== lo ? prices[1] : null;
  const cat = Object.keys(CAT).find((k) => CAT[k].includes(slug)) || 'other';
  const seen = new Set();
  // drop stale course dates (the live listing still shows the past 29/30 Oct option)
  const body = r.body.filter((b) => { const k = b.x.slice(0, 90); if (seen.has(k) || /^29\/30 Oct/.test(b.x)) return false; seen.add(k); return true; });
  const name = r.name.replace(/EPoxy/g, 'Epoxy');
  return [slug, { slug, name, lo, hi, cat, body, out: /out of stock/i.test(r.stock), variations: r.variations, meta: r.meta, title: r.title }];
}));
const priceText = (p) => p.hi ? `${money(p.lo)} to ${money(p.hi)}` : money(p.lo);
const fromText = (p) => p.hi ? `from ${money(p.lo)}` : money(p.lo);
const storeUrl = (slug) => `${biz.store}/product/${slug}/`;
// Shop links go to Gafflow's existing shop on gafflowresinfinishes.com.
const shop = (path) => biz.store + path;

/* ---------- schema ---------- */
const BIZ_ID = `${BASE}/#business`;
const bizSchema = () => ({
  '@context': 'https://schema.org', '@type': ['HomeAndConstructionBusiness', 'Store'], '@id': BIZ_ID,
  name: biz.name, legalName: biz.legalName, url: BASE + '/', telephone: PHONE_INTL, email: biz.email,
  image: `${BASE}/img/og.jpg`, logo: `${BASE}/img/logo-512.png`,
  address: { '@type': 'PostalAddress', streetAddress: biz.street, addressLocality: biz.locality, addressRegion: biz.region, postalCode: biz.postcode, addressCountry: 'GB' },
  areaServed: [{ '@type': 'Country', name: 'United Kingdom' }, { '@type': 'Place', name: 'Europe' }],
  award: 'National Flooring Awards 2025: Installation of the Year (Residential), Winner',
  sameAs: Object.values(biz.social),
});
const faqSchema = (list) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbs = (trail) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })) });
const serviceSchema = (name, desc) => ({ '@context': 'https://schema.org', '@type': 'Service', name, serviceType: 'Resin flooring installation', description: desc, provider: { '@id': BIZ_ID }, areaServed: { '@type': 'Country', name: 'United Kingdom' } });
const courseSchema = (c) => ({
  '@context': 'https://schema.org', '@type': 'Course', name: `Resin flooring course: ${c.name}`, description: c.points.join('. ') + '.', provider: { '@id': BIZ_ID },
  hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Onsite', startDate: c.start, location: { '@type': 'Place', name: c.where, address: c.where } },
  offers: { '@type': 'Offer', price: c.price, priceCurrency: 'GBP', url: abs(`/product/${c.slug}/`), category: 'Paid' },
});
const productSchema = (p) => ({
  '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: `${BASE}/img/p/${p.slug}.webp`, description: p.meta || (p.body[0] && p.body[0].x) || p.name,
  brand: { '@type': 'Brand', name: 'Gafflow' },
  offers: p.hi
    ? { '@type': 'AggregateOffer', lowPrice: p.lo, highPrice: p.hi, priceCurrency: 'GBP', availability: `https://schema.org/${p.out ? 'OutOfStock' : 'InStock'}` }
    : { '@type': 'Offer', price: p.lo, priceCurrency: 'GBP', availability: `https://schema.org/${p.out ? 'OutOfStock' : 'InStock'}`, url: abs(`/product/${p.slug}/`) },
});

/* ---------- chrome ---------- */
const NAV = [['/installations/', 'Installations'], ['/gallery/', 'Our work'], ['/courses/', 'Courses'], [shop('/shop/'), 'Shop'], ['/resin-business-opportunities/', 'Franchise'], ['/contact/', 'Contact']];
const MENU = [
  ['Floors', [['/installations/', 'All installations'], ['/residential-services/', 'Homes'], ['/commercial-services/', 'Commercial'], ['/resin-driveways/', 'Resin driveways'], ['/pu-comfort-flooring/', 'PU comfort flooring'], ['/bespoke-resin-commissions/', 'Bespoke commissions'], ['/gallery/', 'Our work']]],
  ['Learn', [['/courses/', 'Training courses'], ['/commercial-floor-installers/', 'Training for flooring showrooms'], ['/resin-business-opportunities/', 'Franchise'], [storeUrl('the-resin-bible'), 'The Resin Bible']]],
  ['Shop', [[shop('/shop/'), 'All products'], [shop('/epoxy-resin/'), 'Flooring system'], [shop('/epoxy-pigments/'), 'Pigments'], [shop('/deep-cast-epoxy-resin/'), 'Deep cast resin'], [shop('/resin-bound/'), 'Resin bound kits'], [shop('/resin-craft-kits/'), 'Craft kits']]],
];
const brand = (tag = 'a') => `<${tag} class="brand" ${tag === 'a' ? 'href="/"' : ''}><img src="/img/logo.webp" alt="" width="44" height="44"><span class="wordmark"><span class="wm-a">Gafflow</span><span class="wm-b">Resin Finishes</span></span></${tag}>`;
const header = (cur) => `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="wrap nav">
    ${brand()}
    <nav class="nav-links" aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${cur === h ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <div class="nav-cta">
      <a class="nav-phone" href="${tel}" aria-label="Call ${biz.phone}" data-track="call" data-loc="header">${icon('phone')}<span>${biz.phone}</span></a>
      <a class="btn btn-primary btn-sm" href="/#quote" data-track="cta" data-loc="header">Free quote</a>
      <button type="button" class="menu-btn" data-menu aria-expanded="false" aria-controls="menu"><span class="sr">Menu</span><span class="bars" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="menu" id="menu"><div class="wrap menu-grid">${MENU.map(([h, items]) => `<div><p class="f-h">${h}</p><ul>${items.map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul></div>`).join('')}
    <div class="menu-ctas"><a class="btn btn-primary" href="/#quote">Get a free quote ${icon('arrow-right')}</a><a class="btn btn-ghost" href="${tel}">${icon('phone')} ${biz.phone}</a></div></div></div>
</header>`;
const footer = () => `
<footer class="footer">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      ${brand('div')}
      <p>${esc(biz.legalName)}, ${esc(biz.street)}, ${esc(biz.locality)}, ${esc(biz.region)}, ${esc(biz.postcode)}. Company number ${biz.companyNo}.</p>
      <p>London Training Centre: ${esc(biz.londonCentre)}.</p>
      <p><a href="${tel}" data-track="call" data-loc="footer">${biz.phone}</a><br><a href="mailto:${biz.email}">${biz.email}</a></p>
      <ul class="socials">${[['instagram', 'instagram-logo', 'Instagram'], ['facebook', 'facebook-logo', 'Facebook'], ['tiktok', 'tiktok-logo', 'TikTok'], ['youtube', 'youtube-logo', 'YouTube']].map(([k, ic, t]) => `<li><a href="${biz.social[k]}" rel="noopener" aria-label="Gafflow on ${t}">${icon(ic)}</a></li>`).join('')}</ul>
    </div>
    ${MENU.map(([h, items]) => `<div><p class="f-h">${h}</p><ul>${items.map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul></div>`).join('')}
  </div>
  <div class="wrap fine foot-legal"><p><a href="/policies/">Policies</a> · <a href="/terms-and-conditions/">Terms and conditions</a> · <a href="/refund-policy/">Refund policy</a> · <a href="/privacy-policy/">Privacy policy</a> · <a href="/testimonials/">Testimonials</a></p><p>© ${new Date().getFullYear()} ${esc(biz.legalName)}. All rights reserved.</p></div>
</footer>
<div class="mobile-bar" aria-label="Quick actions">
  <a href="${tel}" data-track="call" data-loc="mobile-bar">${icon('phone')}Call</a>
  <a href="${WA}" data-track="whatsapp" data-loc="mobile-bar" rel="noopener">${icon('whatsapp-logo')}WhatsApp</a>
  <a class="mb-quote" href="/#quote" data-track="cta" data-loc="mobile-bar">${icon('file-text')}Quote</a>
</div>`;

const clientConfig = { rates: { ...rates, form: site.form }, phone: biz.phone, phoneIntl: PHONE_INTL };

function layout({ p, title, meta, body, schema = [], noindex = false, cur = '', og = '/img/og.jpg', preload = '' }) {
  if (!preload) {
    const m = body.match(/<img src="([^"]+)" srcset="([^"]+)" sizes="([^"]+)"[^>]*fetchpriority="high"/);
    if (m) preload = `<link rel="preload" as="image" href="${m[1]}" imagesrcset="${m[2]}" imagesizes="${m[3]}" fetchpriority="high">`;
  }
  const robots = site.noindex || noindex ? '<meta name="robots" content="noindex, nofollow">' : '';
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta)}">
<link rel="canonical" href="${abs(p)}">
${robots}
<meta name="theme-color" content="#0d0a0f">
<meta property="og:type" content="website"><meta property="og:site_name" content="Gafflow Resin Finishes"><meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(meta)}">
<meta property="og:url" content="${abs(p)}"><meta property="og:image" content="${BASE}${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/favicon.png" type="image/png"><link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="preload" href="/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<style>${CSS}</style>
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>
${header(cur)}
<main id="main">
${body}
</main>
${footer()}
<script>window.__GAF__=${JSON.stringify(clientConfig)}</script>
<script type="module" src="/assets/main.js?v=${V.js}"></script>
</body>
</html>`;
}

/* ---------- blocks ---------- */
const trustStrip = () => `
<section class="trust" aria-label="Why Gafflow">
  <ul class="wrap trust-list">${site.trust.map(([ic, t, s]) => `<li>${icon(ic, 'light')}<span><b>${t}</b><small>${s}</small></span></li>`).join('')}</ul>
</section>`;

const doors = () => `
<section class="doors-sec" aria-label="What brings you to Gafflow">
  <div class="wrap doors">
    <a class="door" href="/installations/">${icon('paint-roller', 'light')}<span><b>Have a floor installed</b><small>Homes, businesses and driveways</small></span>${icon('arrow-right')}</a>
    <a class="door" href="/courses/">${icon('chalkboard-teacher', 'light')}<span><b>Learn to lay resin</b><small>Courses from £795</small></span>${icon('arrow-right')}</a>
    <a class="door" href="${shop('/shop/')}">${icon('flask', 'light')}<span><b>Buy the products</b><small>Gafflow's own resin range</small></span>${icon('arrow-right')}</a>
  </div>
</section>`;

const finishesBlock = ({ h = 'h2', title = 'Five ways to finish a floor' } = {}) => {
  const [f, ...rest] = site.finishes;
  const card = (s, big) => `
    <article class="fin-card${big ? ' fin-feature' : ''}">
      <div class="fin-media">${img(s.img, s.alt, { sizes: big ? '(max-width: 760px) 100vw, 50vw' : '(max-width: 760px) 100vw, 25vw', small: !big })}${s.maker ? '<span class="render-note">Manufacturer image</span>' : ''}</div>
      <div class="fin-body"><h3 class="h4">${esc(s.name)}</h3><p>${esc(s.line)}</p><p class="fin-where">${icon('map-pin-simple-area', 'light')}${esc(s.where)}</p></div>
    </article>`;
  return `
<section id="finishes" class="sec finishes" aria-labelledby="fin-title">
  <div class="wrap">
    <div class="sec-head"><${h} id="fin-title" class="h2">${title}</${h}><p class="lede-sm">Every Gafflow floor is mixed and poured by hand, so the finish is yours alone. These are the systems the team installs.</p></div>
    <div class="fin-grid">${card(f, true)}<div class="fin-side">${rest.map((s) => card(s, false)).join('')}</div></div>
  </div>
</section>`;
};

const pourBlock = () => {
  const [b0] = site.bases, m0 = site.metallics[0];
  return `
<section id="design" class="sec pour" aria-labelledby="pour-title" data-pour>
  <div class="wrap pour-grid">
    <div class="pour-stage" style="--b:${b0[2]};--m:${m0[2]}">
      <canvas aria-hidden="true"></canvas>
      <p class="pour-label" aria-live="polite"><span data-pour-label>${esc(m0[1])} metallic over ${esc(b0[1])}</span></p>
      <p class="pour-hint" aria-hidden="true">${icon('hand-pointing', 'light')} Move across the floor to catch the light</p>
    </div>
    <div class="pour-ctrl">
      <h2 id="pour-title" class="h2">Design your floor before we pour it</h2>
      <p class="lede-sm">Pick a base and one of the 20 Gafflow metallic pigments, then move across the floor to catch the light. Every colour here is in the Gafflow shop.</p>
      <fieldset><legend>Base colour</legend><div class="swatches sw-base">
        ${site.bases.map(([slug, name, hex], i) => `<label class="swatch" title="${esc(name)}"><input type="radio" name="base" value="${slug}" data-hex="${hex}" data-name="${esc(name)}"${i === 0 ? ' checked' : ''}><span style="--c:${hex}"></span><b class="sr">${esc(name)}</b></label>`).join('')}
      </div></fieldset>
      <fieldset><legend>Metallic pigment</legend><div class="swatches">
        ${site.metallics.map(([slug, name, hex], i) => `<label class="swatch" title="${esc(name)}"><input type="radio" name="metal" value="${slug}" data-hex="${hex}" data-name="${esc(name)}"${i === 0 ? ' checked' : ''}><span style="--c:${hex}"></span><b class="sr">${esc(name)}</b></label>`).join('')}
      </div></fieldset>
      <div class="pour-actions">
        <a class="btn btn-primary" href="#quote" data-pour-quote data-track="pour_quote">Quote me this floor ${icon('arrow-right')}</a>
        <button type="button" class="btn btn-ghost" data-pour-shuffle>${icon('shuffle')} Surprise me</button>
      </div>
      <p class="pour-buy">Pouring it yourself? <a href="${storeUrl('metallic-epoxy-powder-pigment-' + m0[0])}" data-pour-buy><span>${esc(m0[1])}, from £9</span></a> · <a href="${storeUrl(b0[0])}" data-pour-buy-base><span>${esc(b0[1])}, from £25</span></a></p>
      <p class="fine">A live preview, not a photo. Real pours vary with technique and light, which is the point.</p>
    </div>
  </div>
</section>`;
};

const sp = rates.spaces, fz = rates.finishes;
const estimator = (h = 'h2', title = 'A ballpark in 30 seconds') => `
<section id="estimate" class="sec estimate" aria-labelledby="est-title">
  <div class="wrap est-grid">
    <div class="est-copy">
      <${h} id="est-title" class="h2">${title}</${h}>
      <p class="lede-sm">Pick the space, the finish and the size. You see an example range straight away, with no contact details needed.</p>
    </div>
    <form class="est-form" data-estimator novalidate>
      <fieldset><legend>Space</legend><div class="chips">
        ${Object.entries(sp).map(([k, v], i) => `<label class="chip"><input type="radio" name="space" value="${k}"${i === 0 ? ' checked' : ''}><span>${esc(v.label)}</span></label>`).join('')}
      </div></fieldset>
      <fieldset><legend>Finish</legend><div class="chips">
        ${Object.entries(fz).map(([k, v], i) => `<label class="chip"><input type="radio" name="finish" value="${k}"${i === 0 ? ' checked' : ''}><span><i class="sw sw-${k}" aria-hidden="true"></i>${esc(v.label)}</span></label>`).join('')}
      </div></fieldset>
      <fieldset><legend><label for="est-m2">Area</label></legend>
        <div class="range-row"><input id="est-m2" name="m2" type="range" min="${sp.kitchen.min}" max="${sp.kitchen.max}" step="1" value="${sp.kitchen.m2}" class="range"><output for="est-m2" class="m2-out"><span data-m2>${sp.kitchen.m2}</span> m²</output></div>
        <p class="hint">Not sure? Length × width in metres is close enough.</p>
      </fieldset>
    </form>
    <div class="est-card" aria-live="polite">
      <p class="est-label">Example range</p>
      <p class="est-price"><span data-low>£0</span><span class="to">to</span><span data-high>£0</span></p>
      <p class="est-sub"><span data-sum>Kitchen</span></p>
      <p class="est-note">Example figures only. Your exact price is confirmed after a free site survey.</p>
      <a class="btn btn-primary btn-block" href="#quote" data-lock data-track="estimator_lock"><span>Get my<span class="hide-sm"> exact</span> quote</span> ${icon('arrow-right')}</a>
    </div>
  </div>
</section>`;

const layerStack = () => `
<section id="layers" class="layers" aria-labelledby="layers-title" data-layers>
  <div class="layers-sticky">
    <div class="wrap layers-grid">
      <div class="layers-copy">
        <h2 id="layers-title" class="h2">Every layer is a Gafflow product</h2>
        <p class="lede-sm">Gafflow formulated its own metallic epoxy system, then trained the trade to lay it. Scroll to take a floor apart.</p>
        <ol class="layer-list" data-layer-list>
          ${[...site.layers].reverse().map((l, i) => `<li data-li="${site.layers.length - 1 - i}"><b>${esc(l.name)}</b><span>${esc(l.benefit)}${l.product ? ` <a href="${storeUrl(l.product)}">${esc(products[l.product].name.split(',')[0])}, ${fromText(products[l.product])}</a>` : ''}</span></li>`).join('')}
        </ol>
      </div>
      <div class="stack-stage" aria-hidden="true">
        <div class="stack" data-stack>
          ${site.layers.map((l, i) => `<div class="slab slab-${l.key}" style="--i:${i}">${l.key !== 'seal' ? `<img src="/img/layer-${l.key}.webp" alt="" width="512" height="512" loading="lazy" decoding="async">` : ''}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>`;

const gallery = ({ filter = true, limit = 99, h = 'h2', title = 'Real Gafflow floors', only = null, id = 'work', lede = 'Every photo here is a Gafflow installation, from their own jobs and socials.' } = {}) => {
  const items = site.gallery.filter((g) => !only || only.includes(g[1])).slice(0, limit);
  return `
<section id="${id}" class="sec gallery" aria-labelledby="${id}-title">
  <div class="wrap">
    <div class="sec-head"><${h} id="${id}-title" class="h2">${title}</${h}><p class="lede-sm">${lede}</p></div>
    ${filter ? `<div class="chips filter" role="group" aria-label="Filter projects">
      ${[['all', 'All'], ['residential', 'Homes'], ['commercial', 'Commercial'], ['outdoor', 'Outdoor'], ['bespoke', 'Bespoke']].map(([k, t], i) => `<button type="button" class="chip-btn" data-filter="${k}" aria-pressed="${i === 0}">${t}</button>`).join('')}
    </div>` : ''}
    <ul class="masonry" data-gallery>
      ${items.map(([im, space, cap]) => `<li data-space="${space}"><figure>${img(im, '', { sizes: '(max-width: 560px) 50vw, (max-width: 1100px) 33vw, 25vw', small: true })}<figcaption>${esc(cap)}</figcaption></figure></li>`).join('')}
    </ul>
  </div>
</section>`;
};

const awardTeam = () => `
<section id="team" class="sec team" aria-labelledby="team-title">
  <div class="wrap team-grid">
    <figure class="award-fig">${img('award', 'Two of the Gafflow team holding the National Flooring Awards 2025 trophy for Installation of the Year, Residential', { sizes: '(max-width: 860px) 100vw, 50vw', small: true })}<figcaption>${icon('trophy', 'fill')}<span><b>Winner, Installation of the Year (Residential)</b>National Flooring Awards 2025</span></figcaption></figure>
    <div>
      <h2 id="team-title" class="h2">Award winners. Still on the tools.</h2>
      <p>Harry, Ollie, Lou and the Gafflow crew are known for their fine finishes, and not just on floors. From the first grind of the slab to the final top coat, the people who formulated the products are the people pouring your floor.</p>
      <p>The same team runs the training courses, so the standard you get at home is the one they teach the trade.</p>
      <ul class="crew">${site.team.map(([k, n]) => `<li>${img(k, n + ' from Gafflow Resin Finishes', { sizes: '120px', small: true })}<span>${n}</span></li>`).join('')}</ul>
      <p class="fine">Chloe Ferry chose Gafflow for her living space and shared the result with her followers.</p>
    </div>
  </div>
</section>`;

const tcard = (t) => `<figure class="tcard"><blockquote><p>${esc(t.text).replace(/\n/g, '<br>')}</p></blockquote><figcaption><b>${esc(t.name)}</b><span>${[t.what, t.date].filter(Boolean).map(esc).join(' · ')}</span></figcaption></figure>`;
const testimonials = ({ limit = 6, title = 'What people say after training with Gafflow', id = 'reviews', h = 'h2' } = {}) => `
<section id="${id}" class="sec reviews" aria-labelledby="${id}-title">
  <div class="wrap">
    <div class="sec-head"><${h} id="${id}-title" class="h2">${title}</${h}><p class="lede-sm">Word for word from Gafflow's own testimonials and courses pages. Nothing written for this site.</p></div>
    <div class="tgrid">${site.testimonials.slice(0, limit).map(tcard).join('')}</div>
    ${limit < site.testimonials.length ? `<a class="link-arrow" href="/testimonials/">Read all testimonials ${icon('arrow-right')}</a>` : ''}
  </div>
</section>`;

const GOOGLE_G = '<svg class="g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
const googleSlot = () => `<div class="rev-slot"><p class="rev-head">${GOOGLE_G}<b>Installation reviews on Google</b></p><p class="rev-empty">This panel connects to Gafflow's Google Business Profile at launch, so homeowners and businesses see real, verified installation reviews. No sample reviews are used on this site.</p></div>`;

const coursesBlock = ({ h = 'h2', title = 'Learn it from the people who pour it', full = false } = {}) => `
<section id="courses" class="sec courses" aria-labelledby="courses-title">
  <div class="wrap">
    <div class="sec-head"><${h} id="courses-title" class="h2">${title}</${h}><p class="lede-sm">Hands-on resin flooring courses run by working installers. You mix, pour and troubleshoot yourself, and leave with discounts on Gafflow products and a team on the end of the phone.</p></div>
    <div class="course-grid">
      ${site.courses.map((c) => `
      <article class="course">
        <div class="course-media">${img(c.img, `${c.name} course poster`, { sizes: '(max-width: 760px) 40vw, 220px', small: true })}</div>
        <div class="course-body">
          ${c.flag ? `<p class="flag">${esc(c.flag)}</p>` : ''}
          <h3 class="h3">${esc(c.name)}</h3>
          <p class="course-when">${icon('calendar-blank', 'light')}<span>${esc(c.dates)} <b class="soon" data-starts="${c.start}"></b></span></p>
          <p class="course-when">${icon('map-pin', 'light')}<span>${esc(c.where)}</span></p>
          <ul class="ticks">${c.points.map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>
          <div class="course-foot"><p class="course-price">${money(c.price)}<small>per person</small></p><a class="btn btn-primary" href="${storeUrl(c.slug)}" data-track="course_book" data-loc="${c.slug}">Book a place ${icon('arrow-right')}</a></div>
        </div>
      </article>`).join('')}
    </div>
    ${full ? `<div class="other-courses">${site.coursesOther.map(([n, p, d]) => `<div><p class="oc-price">${esc(p)}</p><h3 class="h4">${esc(n)}</h3><p>${esc(d)}</p></div>`).join('')}</div>` : `<a class="link-arrow" href="/courses/">All courses, 1-to-1 training and masterclasses ${icon('arrow-right')}</a>`}
  </div>
</section>`;

const pcard = (p, cls = '') => `<li class="pcard${cls}" data-cat="${p.cat}"><a href="${storeUrl(p.slug)}">${pimg(p.slug, p.name)}<span class="pc-body"><b>${esc(p.name)}</b><span class="pc-price">${priceText(p)}</span>${p.out ? '<span class="pc-stock">Out of stock, email to order</span>' : ''}</span></a></li>`;
const shopTeaser = () => `
<section id="shop" class="sec shop-teaser" aria-labelledby="shop-title">
  <div class="wrap">
    <div class="sec-head"><h2 id="shop-title" class="h2">The system we install with, tin by tin</h2><p class="lede-sm">Primers, base, Money Coat and seals: the Gafflow Metallic Epoxy System, in the order the team applies it. Technical data sheets come with every product.</p></div>
    <ul class="pgrid">${CAT.system.map((s) => pcard(products[s])).join('')}</ul>
    <a class="link-arrow" href="${shop('/shop/')}">Shop all products and pigments ${icon('arrow-right')}</a>
  </div>
</section>`;

const faqBlock = (list, { title = 'Straight answers', h = 'h2', id = 'faq' } = {}) => `
<section id="${id}" class="sec faq" aria-labelledby="${id}-title">
  <div class="wrap faq-grid">
    <div><${h} id="${id}-title" class="h2">${title}</${h}><p class="lede-sm">Still unsure? Call <a href="${tel}" data-track="call" data-loc="faq">${biz.phone}</a> or <a href="${WA}" rel="noopener">WhatsApp the team</a>.</p></div>
    <div class="faq-list">${list.map(([q, a]) => `<details><summary>${esc(q)}${icon('plus')}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join('')}</div>
  </div>
</section>`;

const TILE_ICONS = { kitchen: 'cooking-pot', hallway: 'door-open', bathroom: 'bathtub', ground: 'house-line', garage: 'garage', commercial: 'storefront', driveway: 'car-profile' };
const quoteForm = ({ h = 'h2', title = 'Get your free quote', lede = 'Four quick steps. Tell us about the space, send a few photos and the team comes back with ideas, a quotation and dates.', space = 'kitchen' } = {}) => `
<section id="quote" class="sec quote" aria-labelledby="quote-title">
  <div class="wrap quote-grid">
    <div class="quote-copy">
      <${h} id="quote-title" class="h2">${title}</${h}>
      <p class="lede-sm">${lede}</p>
      <ul class="ticks">${['Free quote', 'Site survey and design consultation', 'Installed by an award-winning team'].map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>
      <a class="btn btn-ghost" href="${WA}" data-track="whatsapp" data-loc="quote" rel="noopener">${icon('whatsapp-logo')} Or WhatsApp a photo</a>
    </div>
    <form class="qf" data-quote novalidate action="/thank-you/" method="post" enctype="multipart/form-data">
      <div class="qf-progress" aria-hidden="true"><span data-qf-bar></span></div>
      <p class="qf-step-label" aria-live="polite"><span data-qf-n>Step 1 of 4</span>: <span data-qf-name>Your project</span></p>
      <fieldset class="qf-step" data-step="1">
        <legend class="sr">Your project</legend>
        <div class="tiles">${Object.entries(sp).map(([k, v]) => `<label class="tile"><input type="radio" name="space" value="${esc(v.label)}"${k === space ? ' checked' : ''}><span>${icon(TILE_ICONS[k], 'light')}${esc(v.label)}</span></label>`).join('')}<label class="tile"><input type="radio" name="space" value="Bespoke piece or feature wall"${space === 'bespoke' ? ' checked' : ''}><span>${icon('paint-brush-broad', 'light')}Bespoke piece</span></label></div>
        <div class="field-row">
          <div class="field"><label for="qf-finish">Finish</label><select id="qf-finish" name="finish" class="input"><option value="Not sure yet">Not sure yet</option>${Object.values(fz).map((v) => `<option>${esc(v.label)}</option>`).join('')}</select></div>
          <div class="field"><label for="qf-m2">Approx. area (m²) <span class="opt">Optional</span></label><input id="qf-m2" name="area_m2" type="number" inputmode="numeric" min="1" class="input"></div>
        </div>
        <p class="design-note" data-design-note hidden>${icon('palette', 'light')}Your design: <span></span></p>
      </fieldset>
      <fieldset class="qf-step" data-step="2" hidden>
        <legend class="sr">Your postcode</legend>
        <div class="field"><label for="qf-pc">Postcode</label><input id="qf-pc" name="postcode" autocomplete="postal-code" class="input pc" required data-req="Add your postcode so we can plan the survey." placeholder="e.g. BN23 6PH"><p class="err" aria-live="polite"></p></div>
        <p class="cover" data-cover aria-live="polite">${icon('check-circle')}<span data-cover-text></span></p>
      </fieldset>
      <fieldset class="qf-step" data-step="3" hidden>
        <legend class="sr">Photos of the space</legend>
        <label class="drop" for="qf-photos">${icon('camera', 'light')}<b>Add up to 3 photos</b><span>One wide shot of the whole space, one close-up of the current floor, and anything you love for inspiration.</span></label>
        <input id="qf-photos" name="photos" type="file" accept="image/*" multiple class="sr-file">
        <ul class="thumbs" data-thumbs></ul>
        <p class="hint">No photos to hand? Skip this and WhatsApp them later.</p>
      </fieldset>
      <fieldset class="qf-step" data-step="4" hidden>
        <legend class="sr">Your details</legend>
        <div class="field"><label for="qf-name">Name</label><input id="qf-name" name="name" autocomplete="name" class="input" required data-req="Please add your name."><p class="err"></p></div>
        <div class="field-row">
          <div class="field"><label for="qf-phone">Phone</label><input id="qf-phone" name="phone" type="tel" autocomplete="tel" class="input" required data-kind="phone" data-req="Add a phone number."><p class="err"></p></div>
          <div class="field"><label for="qf-email">Email</label><input id="qf-email" name="email" type="email" autocomplete="email" class="input" required data-kind="email" data-req="Add your email for the written quote."><p class="err"></p></div>
        </div>
        <div class="field"><label for="qf-msg">Anything we should know? <span class="opt">Optional</span></label><textarea id="qf-msg" name="message" rows="3" class="input"></textarea></div>
        <input type="text" name="company_website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="fine">We use your details only to reply to your enquiry.</p>
      </fieldset>
      <input type="hidden" name="estimate" value=""><input type="hidden" name="design" value="">
      <div class="qf-nav">
        <button type="button" class="btn btn-ghost" data-qf-back hidden>${icon('arrow-left')} Back</button>
        <button type="button" class="btn btn-primary" data-qf-next>Continue ${icon('arrow-right')}</button>
        <button type="submit" class="btn btn-primary" data-qf-submit hidden>Send my quote request</button>
      </div>
      <p class="form-status" aria-live="polite"></p>
    </form>
  </div>
</section>`;

const ctaBand = (t = 'Want a floor nobody else has?', { href = '/#quote', label = 'Get a free quote' } = {}) => `
<section class="cta-band"><div class="wrap cta-inner">
  <p class="h3">${t}</p>
  <div class="ctas"><a class="btn btn-primary" href="${href}" data-track="cta" data-loc="band">${label} ${icon('arrow-right')}</a><a class="btn btn-ghost" href="${WA}" data-track="whatsapp" data-loc="band" rel="noopener">${icon('whatsapp-logo')} WhatsApp the team</a></div>
</div></section>`;

const pageHero = ({ kicker = '', h1, lede, image = null, alt = '', ctas = true, ctaHref = '#quote', ctaLabel = 'Get a free quote', maker = false, course = false }) => `
<section class="phero${image ? ' has-img' : ''}">
  ${image ? `<div class="phero-bg" aria-hidden="true">${img(image, alt, { sizes: '(max-width: 760px) 360px, 100vw', eager: true })}</div>` : ''}
  <div class="wrap phero-inner">
    ${kicker ? `<p class="crumb">${kicker}</p>` : ''}
    <h1 class="h1">${h1}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
    ${ctas ? `<div class="ctas"><a class="btn btn-primary btn-lg" href="${ctaHref}" data-track="cta" data-loc="page-hero">${ctaLabel} ${icon('arrow-right')}</a><a class="btn btn-ghost btn-lg" href="${WA}" data-track="whatsapp" data-loc="page-hero" rel="noopener">${icon('whatsapp-logo')} WhatsApp a photo</a></div>` : ''}
  </div>
  ${maker ? '<span class="render-note phero-note">Manufacturer image</span>' : ''}
</section>`;
const crumbNav = (trail) => `<nav aria-label="Breadcrumb">${trail.map(([n, p], i) => i < trail.length - 1 ? `<a href="${p}">${esc(n)}</a>` : `<span aria-current="page">${esc(n)}</span>`).join(' <span aria-hidden="true">/</span> ')}</nav>`;
const fixEmail = (s) => s.replace(/\*\* ?@ ?\*+ ?es\.com/g, biz.email);
const prose = (blocks) => blocks.map((b) => b.t === 'li' ? `<li>${esc(fixEmail(b.x))}</li>` : `<${b.t === 'h1' ? 'h2' : b.t}>${esc(fixEmail(b.x))}</${b.t === 'h1' ? 'h2' : b.t}>`).join('\n').replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
const benefits = (list) => `<ul class="benefits">${list.map(([ic, t, d]) => `<li>${icon(ic, 'light')}<b>${t}</b>${d ? `<span>${d}</span>` : ''}</li>`).join('')}</ul>`;
const split = (title, paras, image, alt, { flip = false, h = 'h2', extra = '' } = {}) => `
<section class="sec split${flip ? ' flip' : ''}"><div class="wrap split-grid">
  <figure class="split-media">${img(image, alt, { sizes: '(max-width: 860px) 100vw, 50vw', small: true })}</figure>
  <div><${h} class="h2">${title}</${h}>${paras.map((p) => `<p>${p}</p>`).join('')}${extra}</div>
</div></section>`;

/* ---------- pages ---------- */
const pages = [];
const add = (p, opts) => pages.push({ p, ...opts });

// HOME
const heroPreload = `<link rel="preload" as="image" href="/img/hero-m.webp" media="(max-width: 860px)" fetchpriority="high"><link rel="preload" as="image" href="/img/hero-d-1100.webp" imagesrcset="/img/hero-d-720.webp 720w, /img/hero-d-1100.webp 1100w" imagesizes="46vw" media="(min-width: 861px)" fetchpriority="high">`;
add('/', {
  title: 'Gafflow Resin Finishes | Award-Winning Resin Floors, Training & Products',
  meta: 'Award-winning metallic, marble and resin bound floors for homes and businesses, plus hands-on resin flooring courses and the Gafflow product range. Free quotes UK-wide.',
  preload: heroPreload,
  schema: [bizSchema(), ...site.courses.map(courseSchema), faqSchema(site.faqs)],
  body: `
<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="award-pill">${icon('trophy', 'fill')}<span>Winners, Installation of the Year (Residential), National Flooring Awards 2025</span></p>
      <h1 id="hero-title" class="display">Floors people stop and stare at.</h1>
      <p class="lede">Metallic, marble and resin bound finishes for homes and businesses, poured by the team that makes the products and trains the trade.</p>
      <div class="ctas">
        <a class="btn btn-primary btn-lg" href="#quote" data-track="cta" data-loc="hero">Get a free quote ${icon('arrow-right')}</a>
        <a class="btn btn-ghost btn-lg" href="#design" data-track="cta" data-loc="hero-design">${icon('palette')} Design your floor</a>
      </div>
    </div>
    <figure class="hero-media">
      <picture>
        <source media="(max-width: 860px)" srcset="/img/hero-m.webp" width="720" height="540">
        <img src="/img/hero-d-1100.webp" srcset="/img/hero-d-720.webp 720w, /img/hero-d-1100.webp 1100w" sizes="46vw" alt="Gloss white resin entrance hall with black inlay lines, installed by Gafflow" width="1100" height="1375" fetchpriority="high" decoding="async">
      </picture>
      <figcaption>Gafflow black and white entrance hall</figcaption>
    </figure>
  </div>
</section>
${doors()}
${trustStrip()}
${finishesBlock()}
${pourBlock()}
${estimator()}
${layerStack()}
${gallery({ limit: 12 })}
${awardTeam()}
${coursesBlock()}
${testimonials({ limit: 3 })}
${shopTeaser()}
${faqBlock(site.faqs)}
${quoteForm()}
<aside class="nudge" data-nudge hidden aria-label="Quick estimate">
  <p><b>Get a ballpark in 30 seconds</b><span>No contact details needed.</span></p>
  <a class="btn btn-primary btn-sm" href="#estimate" data-track="nudge">Show me</a>
  <button type="button" class="nudge-x" data-nudge-x aria-label="Dismiss">${icon('x')}</button>
</aside>`,
});

// INSTALLATIONS
add('/installations/', {
  title: 'Resin Flooring Contractors | Expert Installation by Gafflow',
  meta: 'Award-winning resin floor installation for homes, commercial and industrial spaces. Metallic, marble, flake, PU and resin bound. Get a free quote from Gafflow Resin Finishes.',
  cur: '/installations/',
  schema: [bizSchema(), faqSchema(site.faqs), crumbs([['Home', '/'], ['Installations', '/installations/']]), ...site.finishes.map((f) => serviceSchema(f.name, f.line))],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Installations', '/installations/']]), h1: 'Resin flooring contractors, from an award-winning team', lede: 'Commercial and residential installations by National Flooring Awards 2025 winners. From initial prep to the final top coat, the team loves what it does, and it shows.', image: 'entrance-black-white', alt: 'Black and white resin entrance hall floor installed by Gafflow' })}
${trustStrip()}
${finishesBlock()}
${estimator()}
${layerStack()}
${gallery({ limit: 8 })}
${faqBlock(site.faqs, { title: 'Questions before you book' })}
${quoteForm()}`,
});

// RESIDENTIAL
const rooms = [
  ['kitchen-ivory', 'Kitchens', 'Durable, easy to clean and resistant to scratches, stains and heat. Resin can mimic marble or granite, or carry a design that is yours alone.'],
  ['bathroom-black-gold', 'Bathrooms and wet rooms', 'Waterproof and seam-free, so there is nowhere for water or mould to get in. Floors, shower walls and splashbacks in one continuous finish.'],
  ['living-neutral', 'Living spaces', 'Sleek, modern floors, plus coffee tables, walls and fireplace surrounds to match. Endless colours, patterns and textures.'],
  ['wardrobe-doors', 'Bedrooms and dressing rooms', 'Resin wardrobe doors, dressing rooms, en-suites and desks. If you can imagine it there, it can go there.'],
  ['drive-butterscotch', 'Outdoors', 'Driveways, patios, paths and BBQ areas that stand up to rain and sun, with non-slip options.'],
];
add('/residential-services/', {
  title: 'Resin Flooring for Homes | Kitchens, Bathrooms, Hallways | Gafflow',
  meta: 'Stunning resin floors and surfaces for kitchens, bathrooms, hallways, living rooms and outdoor spaces. Award-winning residential installations by Gafflow Resin Finishes.',
  cur: '/installations/',
  schema: [bizSchema(), serviceSchema('Residential resin flooring', 'Resin floors and surfaces for kitchens, bathrooms, hallways, living spaces and outdoors.'), crumbs([['Home', '/'], ['Installations', '/installations/'], ['Homes', '/residential-services/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Installations', '/installations/'], ['Homes', '/residential-services/']]), h1: 'Give your home the wow factor', lede: 'Inside or out, a Gafflow floor will be the envy of the neighbourhood. Easy to keep clean, built to last for years, and designed just for you.', image: 'kitchen-ivory', alt: 'Open-plan kitchen with an ivory and beige swirled resin floor' })}
<section class="sec"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Every room, not just the floor</h2><p class="lede-sm">Resin works on floors, walls, worktops and doors, so one finish can carry through the whole home.</p></div>
  <div class="rooms">${rooms.map(([im, t, d]) => `<article class="room">${img(im, t, { sizes: '(max-width: 760px) 100vw, 33vw', small: true })}<div><h3 class="h4">${t}</h3><p>${d}</p></div></article>`).join('')}</div>
</div></section>
<section class="sec tight"><div class="wrap">${benefits([['shield-check', 'Hard wearing', 'Made for hallways, kitchens and outdoor spaces.'], ['drop', 'Hygienic', 'Seamless, so perfect for kitchens and bathrooms.'], ['sneaker-move', 'Slip and stain resistant', 'Anti-slip options for busy family homes.'], ['broom', 'Easy to clean', 'No complex cleaning. Wipe and go.'], ['palette', 'Endless effects', 'Marbling, flake, metallics or a single colour.'], ['squares-four', 'Not just floors', 'Walls, worktops, tables and doors.']])}</div></section>
${estimator('h2', 'What would my room cost?')}
${gallery({ only: ['residential', 'outdoor'], filter: false, title: 'Homes we have finished', limit: 8, id: 'homes' })}
${quoteForm({ title: 'Tell us about your home' })}`,
});

// COMMERCIAL
const sectors = [
  ['salon-pink', 'Salons and spas', 'Easy to clean, hygienic and seam-free on floors, walls and ceilings. Pigments matched to your brand.'],
  ['nightclub', 'Nightclubs and bars', 'Loud and proud or subtle and sophisticated. Quick to clean up and hygienic, because there are no seams.'],
  ['restaurant-blue', 'Restaurants, cafés and catering', 'Worktops, walls and floors, from the prep area to the tables, blended with your brand colours.'],
  ['hotel-event', 'Hotels and conference venues', 'More impressive than carpet, easier to clean and durable in high-traffic areas. A show-stopping event space.'],
  ['grey-marble', 'Showrooms', 'Where resin comes into its own: easy to keep clean, highly durable and the perfect stage for quality products.'],
];
add('/commercial-services/', {
  title: 'Commercial Resin Flooring | Bars, Salons, Hotels, Showrooms | Gafflow',
  meta: 'Unique commercial resin installations for bars, nightclubs, salons, restaurants, hotels and showrooms. Approved installers with their own product range. Free site meeting.',
  cur: '/installations/',
  schema: [bizSchema(), serviceSchema('Commercial resin flooring', 'Bespoke resin floors, walls and worktops for bars, salons, restaurants, hotels and showrooms.'), crumbs([['Home', '/'], ['Installations', '/installations/'], ['Commercial', '/commercial-services/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Installations', '/installations/'], ['Commercial', '/commercial-services/']]), h1: 'Complete resin installations, as unique as your business', lede: 'Approved installers with their own product range. Every commercial project is bespoke, and the team will come to site to talk it through.', image: 'cocktail-bar', alt: 'Cocktail bar with a pink and gold resin floor under gold lights' })}
<section class="sec"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Spaces we transform</h2><p class="lede-sm">Floors, walls, worktops and one-off features like concrete walls and resin water features, anywhere your customers will notice.</p></div>
  <div class="rooms">${sectors.map(([im, t, d]) => `<article class="room">${img(im, t, { sizes: '(max-width: 760px) 100vw, 33vw', small: true })}<div><h3 class="h4">${t}</h3><p>${d}</p></div></article>`).join('')}
  <a class="room room-cta" href="/commercial-floor-installers/">${icon('chalkboard-teacher', 'light')}<div><h3 class="h4">Already in flooring?</h3><p>Get a new resin showroom floor and train your staff at the same time.</p><span class="link-arrow">Showroom training ${icon('arrow-right')}</span></div></a></div>
</div></section>
<section class="sec tight"><div class="wrap">${benefits([['shield-check', 'Hard wearing', 'High-traffic and industrial areas such as warehouses.'], ['drop', 'Hygienic', 'Perfect for restaurants, salons and spas.'], ['sneaker-move', 'Slip and stain resistant', 'Anti-slip for kitchens, factories and event spaces.'], ['broom', 'Easy to clean', 'Seamless surfaces clean in minutes.'], ['palette', 'Endless effects', 'Marble, flake, metallics, single colours.'], ['squares-four', 'Not just floors', 'Walls, worktops, tables or floors.']])}</div></section>
${gallery({ only: ['commercial'], filter: false, title: 'Commercial work', limit: 8, id: 'commercial' })}
${quoteForm({ title: 'Arrange a site meeting', lede: 'Tell us about the venue and what you have in mind.', space: 'commercial' })}`,
});

// DRIVEWAYS
add('/resin-driveways/', {
  title: 'Resin Driveways UK | Resin Bound Installation | Gafflow',
  meta: 'Long-lasting, low-maintenance resin bound driveways, paths and patios. Permeable, SuDS compliant and never laid over old tarmac. Free sample visit from Gafflow.',
  cur: '/installations/',
  schema: [bizSchema(), serviceSchema('Resin bound driveways', 'Resin bound driveways, paths, patios and terraces, permeable and SuDS compliant.'), crumbs([['Home', '/'], ['Installations', '/installations/'], ['Resin driveways', '/resin-driveways/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Installations', '/installations/'], ['Resin driveways', '/resin-driveways/']]), h1: 'Resin driveways, the ultimate outdoor finish', lede: 'Aggregate mixed into resin for a smooth, flat drive with no loose gravel, no weeds and no puddles. It lifts the whole look of a property.', image: 'drive-large', alt: 'Large resin bound driveway outside a detached house' })}
${split('Smooth, permeable and weed resistant', ['With resin bound systems the aggregate is mixed in with the resin, giving a smooth, flat finish with no loose stones.', 'The surface is porous, so water drains through it. That makes it fully compliant with SuDS (Sustainable Urban Drainage Systems) and helps manage flood risk.', 'Grey, walnut, red, anthracite or white: the team brings the sample range to you to choose on site.'], 'drive-samples', 'Tray of resin bound driveway aggregate samples')}
<section class="sec tight"><div class="wrap warn">
  ${icon('warning-circle', 'light')}<div><h2 class="h3">Why we never overlay old tarmac or concrete</h2><p>Many contractors offer to lay resin straight over an existing drive. It is tempting on price, but the different surfaces cause serious drainage problems. Properly prepared drives last a very long time. Sub-standard ones do not. Gafflow mixes every batch in exact proportions and only installs in the right conditions, so there are no patchy areas or defects.</p></div>
</div></section>
${gallery({ only: ['outdoor'], filter: false, title: 'Recent driveways and terraces', id: 'drives' })}
${estimator('h2', 'What would my driveway cost?').replace('value="kitchen" checked', 'value="kitchen"').replace('value="driveway"', 'value="driveway" checked')}
${quoteForm({ title: 'Book a sample visit', space: 'driveway' })}`,
});

// PU COMFORT
add('/pu-comfort-flooring/', {
  title: 'PU Comfort Flooring Specialists | Arturo PU Systems | Gafflow',
  meta: 'Seamless, flexible and hygienic polyurethane comfort flooring using the Arturo system. Softer underfoot, acoustic options, suits underfloor heating. Site survey and quotation.',
  cur: '/installations/',
  schema: [bizSchema(), serviceSchema('PU comfort flooring', 'Arturo polyurethane comfort flooring for healthcare, education, retail, offices and homes.'), crumbs([['Home', '/'], ['Installations', '/installations/'], ['PU comfort flooring', '/pu-comfort-flooring/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Installations', '/installations/'], ['PU comfort flooring', '/pu-comfort-flooring/']]), h1: 'PU comfort flooring', lede: 'Seamless, flexible and hygienic polyurethane floors using the Arturo system. Softer underfoot than epoxy, with acoustic options, and a dream to clean.', image: 'pu-parking', alt: 'Arturo PU floor in a car park with orange and grey markings (manufacturer image)', maker: true, ctaLabel: 'Book a site survey' })}
<section class="sec"><div class="wrap two-col">
  <div><h2 class="h2">What makes PU different</h2><p>Polyurethane has natural elasticity, so unlike epoxy it accommodates structural movement and thermal expansion without cracking. It is softer underfoot, which helps people who stand all day, and it can be installed smooth or slip-resistant in a wide range of colours and textures.</p><p>PU comfort flooring adds elastic layers for even more resilience. It is common in hospitals, schools, retail, leisure and modern offices, and works in homes too.</p></div>
  <div class="vs" role="table" aria-label="PU compared with epoxy">
    <div class="vs-row vs-head" role="row"><span role="columnheader">Feature</span><span role="columnheader">PU</span><span role="columnheader">Epoxy</span></div>
    ${[['Flexibility', 'Flexible', 'Rigid'], ['Comfort', 'Soft underfoot', 'Hard'], ['Thermal resistance', 'Excellent', 'Moderate'], ['Acoustic options', 'Yes', 'Limited'], ['Suited to', 'Hospitals, offices, schools', 'Warehouses, factories']].map(([a, b, c]) => `<div class="vs-row" role="row"><span role="rowheader">${a}</span><span role="cell"><b>${b}</b></span><span role="cell">${c}</span></div>`).join('')}
  </div>
</div></section>
<section class="sec tight"><div class="wrap">${benefits([['person-simple-walk', 'Comfortable underfoot', 'Reduced fatigue for people on their feet.'], ['drop-half', 'Impermeable to liquids', ''], ['shield-check', 'Durable and impact resistant', ''], ['speaker-simple-low', 'Acoustic and thermal options', ''], ['thermometer-hot', 'Suits underfloor heating', ''], ['leaf', 'Solvent free', '']])}</div></section>
<section class="sec tight"><div class="wrap"><h2 class="h2">Technical information</h2>
  <dl class="spec-grid">${[['FeRFA classification', '5'], ['System thickness', '2 mm to 3 mm'], ['Usage', 'Light duty'], ['Wear and scratch resistance', '≤ AR0.5'], ['Fire rating', 'Bfl-s1'], ['Shore hardness (Shore D)', '30'], ['UV stable', 'Yes, with coloured seal coat PU3320'], ['Slip resistance option', 'Yes'], ['Curing at 20°C, 65% RH', 'Foot traffic after about 18 hours, full mechanical resilience after 3 days, chemically resistant after 7 days']].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
  <p class="fine">Pendulum test values and the chemical resistance list are available on request.</p>
</div></section>
${quoteForm({ title: 'Book a site survey', space: 'commercial' })}`,
});

// BESPOKE
add('/bespoke-resin-commissions/', {
  title: 'Bespoke Resin Commissions | Art, Feature Walls & Furniture | Gafflow',
  meta: 'Bespoke resin artwork, feature walls, river tables and furniture from Gafflow Resin Finishes. Personal design consultation, delivery and fitting across the UK.',
  cur: '/installations/',
  schema: [bizSchema(), serviceSchema('Bespoke resin commissions', 'Custom resin artwork, feature walls, river tables and furniture.'), crumbs([['Home', '/'], ['Installations', '/installations/'], ['Bespoke commissions', '/bespoke-resin-commissions/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Installations', '/installations/'], ['Bespoke commissions', '/bespoke-resin-commissions/']]), h1: 'Bespoke resin commissions', lede: 'Feature walls, river tables, rock walls, water features and art. Every piece is individually designed and poured, so the result is one of a kind.', image: 'wall-art', alt: 'Large framed resin wall art above a dining table', ctaLabel: 'Start your design' })}
<section class="sec"><div class="wrap">
  <div class="rooms">${[['wall-art', 'Resin artwork and feature walls', '3D layered abstracts, ocean pieces and geode effects, plus feature walls in shimmering metallics, marbled flow or rock effect. Graffiti, too, with the artists Gafflow works alongside.'], ['river-table', 'Furniture', 'Live-edge river tables, worktops and sideboards in wood, metal and coloured resin, made to your exact size.'], ['wardrobe-doors', 'One-off commissions', 'Wardrobe doors, sculptures, branded displays and full interior themes. You bring the idea, Gafflow brings the resin expertise.']].map(([im, t, d]) => `<article class="room">${img(im, t, { sizes: '(max-width: 760px) 100vw, 33vw', small: true })}<div><h3 class="h4">${t}</h3><p>${d}</p></div></article>`).join('')}</div>
</div></section>
<section class="sec tight"><div class="wrap two-col">
  <div><h2 class="h2">Why resin for a commission?</h2><ul class="ticks">${['Highly durable and long-lasting', 'Resistant to heat, stains and scratches', 'Visually dynamic and endlessly customisable', 'Ideal for artistic and practical pieces'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul></div>
  <div><h2 class="h2">How it works</h2><ul class="ticks">${['A conversation first, then a personal design consultation', 'Premium-grade epoxy resin only', 'Delivery and fitting available across the UK'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul></div>
</div></section>
${gallery({ only: ['bespoke'], filter: false, title: 'Recent commissions', id: 'bespoke' })}
${quoteForm({ title: 'Start your design', lede: 'Tell us the idea, the space and the colours. We will come back to arrange a design consultation.', space: 'bespoke' })}`,
});

// SHOWROOM TRAINING (B2B)
add('/commercial-floor-installers/', {
  title: 'Resin Training for Flooring Showrooms | New Showroom Floor | Gafflow',
  meta: 'For commercial flooring businesses: train your team in resin installation while we install a new resin floor in your showroom. Bespoke courses and trade discounts.',
  cur: '/courses/',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Courses', '/courses/'], ['Showroom training', '/commercial-floor-installers/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Courses', '/courses/'], ['Showroom training', '/commercial-floor-installers/']]), h1: 'A new skill, a new product and a new showroom floor', lede: 'If flooring is your business and you have a showroom, Gafflow will train your team in resin installation by laying a brand new resin floor in your own premises.', image: 'course-class', alt: 'Resin flooring course in a large warehouse with students and trainer', ctaHref: `mailto:${biz.email}?subject=Showroom%20resin%20training`, ctaLabel: 'Tell me more', course: true })}
<section class="sec"><div class="wrap two-col">
  <div><h2 class="h2">Why it works</h2><ul class="feature-list">${[['Hands-on learning', 'Real experience installing a resin floor in your own showroom.'], ['Expert guidance', 'Every trick in the book, so you avoid expensive mistakes.'], ['Business growth', 'Add resin to your services, with help promoting it.'], ['Cost-effective upgrade', 'A professional showroom floor while your team trains.']].map(([t, d]) => `<li>${icon('check-circle', 'light')}<span><b>${t}</b><br><small>${d}</small></span></li>`).join('')}</ul></div>
  <div><h2 class="h2">What your team learns</h2><ul class="ticks">${['Surface preparation and priming', 'Mixing and applying resin, from base to finish', 'Techniques for a seamless, durable finish', 'Troubleshooting common installation issues', 'Maintenance, longevity and the best products'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul>
  <p>The course is tailored to you: the number of staff, the size and location of the premises and the length of training. You also get a trade discount on Gafflow products.</p>
  <div class="ctas"><a class="btn btn-primary" href="mailto:${biz.email}?subject=Showroom%20resin%20training">Email the team ${icon('arrow-right')}</a><a class="btn btn-ghost" href="${tel}">${icon('phone')} ${biz.phone}</a></div></div>
</div></section>
${testimonials({ limit: 3 })}`,
});

// COURSES
const courseFaqs = [
  ['What support do I get after a course?', 'The team stays on hand for advice, from product choices to technical questions, and offers ongoing business support with bespoke packages for marketing, graphic design and websites.'],
  ['Do I need any experience?', 'No. The courses suit beginners, professional installers, contractors and builders, and interior designers and architects. Experienced installers can ask about a bespoke course.'],
  ['What is included?', 'All tools, materials and equipment, lunch, training manuals, your own sample board to take home, and exclusive discounts on Gafflow resin products.'],
  ['Where are courses held?', 'Eastbourne and the new London Training Centre in South Croydon, with courses also run in Birmingham, Essex, Sheffield and Northern Ireland, and launching in Europe.'],
  ['What happens after I book?', 'A member of the Gafflow team gets in touch within a couple of days with full course details.'],
];
add('/courses/', {
  title: 'Epoxy Resin Flooring Courses UK | Hands-On Training | Gafflow',
  meta: 'Hands-on epoxy resin flooring courses run by working installers. 2-day Eastbourne £795, 3-day London £995, 1-to-1 training £3,500. Lunch, materials and product discounts included.',
  cur: '/courses/',
  schema: [bizSchema(), ...site.courses.map(courseSchema), faqSchema(courseFaqs), crumbs([['Home', '/'], ['Courses', '/courses/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Courses', '/courses/']]), h1: 'Epoxy resin flooring courses, taught by installers', lede: 'There is no sitting around with clean hands here. Learn the full process with the team that lays award-winning floors, and leave inspired, educated and raring to go.', image: 'course-group', alt: 'A group of course graduates with the Gafflow trainers', ctaHref: '#courses', ctaLabel: 'See course dates', course: true })}
${coursesBlock({ title: 'Upcoming courses', full: true })}
<section class="sec tight"><div class="wrap two-col">
  <div><h2 class="h2">What you will learn</h2><ul class="ticks">${['Health and safety when working with resin', 'Calculating quantities for any project', 'Priming surfaces, and which surfaces suit resin', 'Special effects, as seen on Gafflow socials', 'Long-lasting top coats', 'Troubleshooting resin problems', 'Costing your projects', 'Sales and marketing advice for your resin business'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul></div>
  <div><h2 class="h2">Who the courses are for</h2><dl class="spec-grid one">${[['Beginners', 'A solid foundation to get started straight away, for a career or personal projects.'], ['Professional installers', 'Advanced techniques and specialised training.'], ['Contractors and builders', 'Add floors, worktops and driveways to your services.'], ['Interior designers and architects', 'Specify resin with confidence.']].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div>
</div></section>
<section class="sec tight"><div class="wrap"><h2 class="h2">Meet your trainers</h2><ul class="crew crew-lg">${site.team.map(([k, n]) => `<li>${img(k, n + ', Gafflow trainer', { sizes: '200px', small: true })}<span>${n}</span></li>`).join('')}</ul></div></section>
${testimonials({ limit: 12, title: 'What past students say', id: 'student-reviews' })}
${faqBlock(courseFaqs, { title: 'Course questions', id: 'course-faq' })}
${ctaBand('Do not see a date that suits?', { href: `mailto:${biz.email}?subject=Course%20dates`, label: 'Ask about new dates' })}`,
});

// FRANCHISE
add('/resin-business-opportunities/', {
  title: 'Resin Business Opportunities | Gafflow Resin Franchise',
  meta: 'Start your own resin business with a Gafflow Resin Finishes franchise: training, products, troubleshooting support and a priority territory for early owners.',
  cur: '/resin-business-opportunities/',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Franchise', '/resin-business-opportunities/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Franchise', '/resin-business-opportunities/']]), h1: 'Own your piece of the resin industry', lede: 'Gafflow is offering the right people a territory of their own across the UK, Ireland and Europe, with the training, products and support of a team that has already made the mistakes and made a success.', image: 'team-van', alt: 'The Gafflow team in front of their branded vans', ctaHref: `mailto:${biz.email}?subject=Franchise%20enquiry`, ctaLabel: 'Arrange a first chat', course: true })}
<section class="sec"><div class="wrap">
  <div class="rooms three">${[['graduation-cap', 'Training', 'From the first conversation you learn the Gafflow formula, on the tools and in the business.'], ['flask', 'The products', 'No headache choosing products: use Gafflow\'s own, and sell them as an extra income stream.'], ['lifebuoy', 'Troubleshooting', 'An experienced team ready when things go wrong. And trust us, they do.'], ['briefcase', 'Business tools', 'Safety documents, recommended accounting and marketing tools, and a website expert to set you up online.'], ['users-three', 'A network', 'You will never feel you are flying solo, with a growing network ready to help each other out.'], ['map-trifold', 'Priority territory', 'Early owners start at an early-starter rate and get priority on available territories.']].map(([ic, t, d]) => `<article class="room room-ic">${icon(ic, 'light')}<div><h3 class="h4">${t}</h3><p>${d}</p></div></article>`).join('')}</div>
</div></section>
${split('What do you need?', ['Imagination. Determination. Drive. Ambition. Creativity. Personality. These are some of the key skills that make the difference between a good business and a great one.', 'Franchise agreements are in their final stages, so there has never been a better time. Arrange an initial discussion to see what you need, how quickly you could be up and running, and what the initial investment will be.'], 'lou', 'Lou from Gafflow beside a branded van', { extra: `<div class="ctas"><a class="btn btn-primary" href="mailto:${biz.email}?subject=Franchise%20enquiry">Email the team ${icon('arrow-right')}</a><a class="btn btn-ghost" href="${tel}">${icon('phone')} ${biz.phone}</a></div>` })}`,
});

// GALLERY
add('/gallery/', {
  title: 'Gallery | Resin Flooring Inspiration from Gafflow',
  meta: 'Real Gafflow resin floors and surfaces: metallic bars, marble hallways, bathrooms, kitchens, driveways and bespoke pieces. Inspiration from an award-winning team.',
  cur: '/gallery/',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Gallery', '/gallery/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Gallery', '/gallery/']]), h1: 'A few examples of our work', lede: 'Every resin finish is unique. Have an idea for a design? Talk to the team, and here is a little inspiration.', ctas: true })}
${gallery({ h: 'h2', title: 'Inside or out, the envy of the neighbourhood' })}
${split('Working with Chloe Ferry', ['Gafflow transformed Chloe Ferry\'s living space, and she chose to share it on her socials, through the press and in a video review on Instagram.', 'An absolute joy to work with, and amazing results, as always.'], 'chloe-floor', 'Chloe Ferry with the Gafflow team on her new white marble effect floor', { flip: true, extra: `<a class="btn btn-primary" href="/#quote">Want the look? Get a quote ${icon('arrow-right')}</a>` })}
${ctaBand()}`,
});

// TESTIMONIALS
add('/testimonials/', {
  title: 'Testimonials | Gafflow Resin Products, Training & Installations',
  meta: 'What people say about Gafflow resin products, training courses and installations, word for word. Leave your own review on Google or on our products.',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Testimonials', '/testimonials/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Testimonials', '/testimonials/']]), h1: 'Do not just take our word for it', lede: 'Every testimonial below is copied word for word from Gafflow\'s own testimonials and courses pages.', ctas: false })}
<section class="sec tight"><div class="wrap"><div class="tgrid">${site.testimonials.map(tcard).join('')}</div></div></section>
<section class="sec tight"><div class="wrap narrow">${googleSlot()}<p class="fine">Had a floor, a course or products from Gafflow? Thank you for taking a moment to leave a review on Google or on the product in the shop.</p></div></section>
${coursesBlock({ title: 'Ready to learn resin floors?' })}`,
});

// CONTACT
add('/contact/', {
  title: 'Contact Gafflow Resin Finishes | Installations, Courses & Orders',
  meta: `Contact the Gafflow team about installations, course bookings, commercial projects and product orders. WhatsApp, email or call ${biz.phone}.`,
  cur: '/contact/',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Contact', '/contact/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Contact', '/contact/']]), h1: 'We look forward to hearing from you', lede: 'WhatsApp, email or call. Leave a message and the team will be back to you really soon.', ctas: false })}
<section class="sec contact-ways"><div class="wrap ways">
  <a href="${tel}" data-track="call" data-loc="contact">${icon('phone', 'light')}<b>Call or leave a message</b><span>${biz.phone}</span></a>
  <a href="${WA}" data-track="whatsapp" data-loc="contact" rel="noopener">${icon('whatsapp-logo', 'light')}<b>WhatsApp</b><span>Send photos of your space</span></a>
  <a href="mailto:${biz.email}">${icon('envelope-simple', 'light')}<b>Email</b><span>${biz.email}</span></a>
  <div>${icon('map-pin', 'light')}<b>Eastbourne and London</b><span>${esc(biz.street)}, ${biz.locality}, ${biz.postcode}<br>${esc(biz.londonCentre)}</span></div>
</div></section>
${quoteForm({ title: 'Or start your quote here' })}`,
});

// SHOP
const shopCats = Object.keys(CAT_LABEL);
const allProducts = shopCats.flatMap((c) => CAT[c].map((s) => products[s]).filter(Boolean));
const shopFilter = () => `<div class="chips filter" role="group" aria-label="Filter products"><button type="button" class="chip-btn" data-shop-filter="all" aria-pressed="true">All</button>${shopCats.map((c) => `<button type="button" class="chip-btn" data-shop-filter="${c}" aria-pressed="false">${CAT_LABEL[c]}</button>`).join('')}</div>`;
const SHIPPING = 'Products ship by courier because of their weight and size. Gafflow aims for next working day delivery on orders placed by midday. Large orders: get in touch for the best delivery time and discount.';
add('/shop/', {
  title: 'Shop | Epoxy Resin Flooring Products, Pigments & Kits | Gafflow',
  meta: 'The Gafflow epoxy flooring system, metallic and liquid pigments, deep cast resin, resin bound and craft kits, plus The Resin Bible and training courses.',
  cur: '/shop/',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Shop', '/shop/']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: allProducts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/product/${p.slug}/`), name: p.name })) }],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Shop', '/shop/']]), h1: 'Everything for first-class resin floors', lede: 'The products Gafflow installs with, plus kits for crafters. Technical data sheets supplied, installation support included, and the team is a message away.', ctas: false })}
<section class="sec tight"><div class="wrap">
  <p class="notice">${icon('info', 'light')}<span>Some products are temporarily out of stock. <a href="mailto:${biz.email}?subject=Product%20order">Email the team</a> to order or check lead times.</span></p>
  ${shopFilter()}
  <ul class="pgrid" data-shop>${allProducts.map((p) => pcard(p)).join('')}</ul>
  <div class="shop-help">${[['file-text', 'Technical data sheets', 'Supplied with products.'], ['book-open-text', 'Installation guide', 'Full support provided.'], ['truck', 'Courier delivery', 'Next working day aim, order by midday.']].map(([ic, t, d]) => `<div>${icon(ic, 'light')}<b>${t}</b><span>${d}</span></div>`).join('')}</div>
</div></section>
${ctaBand('Rather have the team lay it for you?')}`,
});

const catPage = (p, { title, meta, h1, lede, slugs, extra = '', after = '' }) => add(p, {
  title, meta, cur: '/shop/',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Shop', '/shop/'], [h1, p]])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Shop', '/shop/'], [h1, p]]), h1, lede, ctas: false })}
${extra}
<section class="sec tight"><div class="wrap"><ul class="pgrid">${slugs.map((s) => pcard(products[s])).join('')}</ul></div></section>
${after}
${ctaBand('Want to learn to lay it properly?', { href: '/courses/', label: 'See training courses' })}`,
});
catPage('/epoxy-resin/', {
  title: 'Epoxy Resin Flooring Products | The Gafflow System', meta: 'The Gafflow epoxy flooring system: DPM Primer, Sub Base, Big Base, Money Coat, Matt PU and G2000. Tried and tested for outstanding results.',
  h1: 'Epoxy flooring products', lede: 'Follow the products in order for perfect results: prime, base, design, then seal.', slugs: CAT.system,
  extra: `<section class="sec tight"><div class="wrap"><ol class="steps">${[['Prime', 'DPM Primer or Sub-Base. Two coats of DPM act as a damp-proof membrane on slabs up to 98% RH.'], ['Base', 'The Big Base: 100% solids, excellent build-up and levelling. Grey as standard.'], ['Design', 'The Money Coat: clear, UV-resistant epoxy for swirling, marbling and layering pigments.'], ['Seal', 'Matt PU for a non-yellowing matt finish, or G2000 sol-gel gloss for chemical and abrasion resistance.']].map(([t, d], i) => `<li><span class="step-n">${i + 1}</span><h2 class="h4">${t}</h2><p>${d}</p></li>`).join('')}</ol></div></section>`,
});
catPage('/epoxy-pigments/', {
  title: 'Epoxy Pigments | Metallic Powder & Liquid Pigments | Gafflow', meta: 'Explore the huge range of Gafflow epoxy pigments: liquid bases and an outstanding range of 20 metallic powder pigments.',
  h1: 'Epoxy pigments', lede: 'Liquid base pigments and 20 metallic powders. Try any combination in the live floor designer first.', slugs: CAT.pigments,
  extra: `<section class="sec tight"><div class="wrap"><a class="designer-link" href="/#design">${icon('palette', 'light')}<span><b>Preview a pigment on a live poured floor</b><small>Pick a base and a metallic, then move across the floor to catch the light.</small></span>${icon('arrow-right')}</a></div></section>`,
  after: `<section class="sec tight"><div class="wrap narrow"><p class="fine">Metallic powders are not suitable for outdoor use, as ultraviolet exposure can cause chalking.</p></div></section>`,
});
add('/deep-cast-epoxy-resin/', {
  title: 'Deep Cast Epoxy Resin | River Table Resin Calculator | Gafflow', meta: 'Gafflow Deep Cast Epoxy Resin for river tables and deep pours up to 50mm. Low exotherm, crystal clear. Work out how much resin you need with the calculator.',
  cur: '/shop/',
  schema: [bizSchema(), productSchema(products['deep-cast-epoxy-resin-14-5kg-kit']), crumbs([['Home', '/'], ['Shop', '/shop/'], ['Deep cast epoxy resin', '/deep-cast-epoxy-resin/']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Shop', '/shop/'], ['Deep cast epoxy resin', '/deep-cast-epoxy-resin/']]), h1: 'Deep cast epoxy resin', lede: 'Low-viscosity epoxy for deep pours up to 50mm in one go: river tables, deep moulds, wood encapsulation and resin art.', image: 'river-table', alt: 'Walnut river table with a deep blue resin river', ctas: false })}
<section class="sec tight"><div class="wrap two-col">
  <div><h2 class="h2">How much resin do you need?</h2><p>Length × average width × depth × 1,100 (the average density of epoxy in kg per m³).</p>
  <form class="calc" data-calc novalidate>
    <div class="field-row three">${[['L', 'Length (m)', 1.8], ['W', 'Average width (m)', 0.2], ['D', 'Depth (mm)', 50]].map(([k, l, v]) => `<div class="field"><label for="c-${k}">${l}</label><input id="c-${k}" name="${k}" type="number" inputmode="decimal" step="any" min="0" value="${v}" class="input"></div>`).join('')}</div>
    <p class="calc-out" aria-live="polite"><b data-kg>19.8 kg</b><span data-kits>2 × 14.5kg kits</span></p>
    <p class="fine">Example from the guide: 1.8 × 0.2 × 0.05 × 1,100 = 19.8 kg. Stay within 50mm per pour.</p>
  </form></div>
  <div><ul class="pgrid one">${pcard(products['deep-cast-epoxy-resin-14-5kg-kit'])}</ul></div>
</div></section>
<section class="sec tight"><div class="wrap two-col">
  <div><h2 class="h2">Why deep cast resin?</h2><ul class="ticks">${['Low exothermic reaction, so less heat build-up', 'Deep pours up to 50mm in a single pour', 'Excellent clarity for river tables', 'Superior bubble release', 'Extended working time for large pours'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul></div>
  <div><h2 class="h2">How to use it</h2><ol class="steps steps-v">${[['Measure accurately', 'Mix resin and hardener to the stated ratio.'], ['Mix thoroughly', 'Slowly and consistently, to avoid adding air.'], ['Pour in controlled layers', 'Stay within the 50mm limit.'], ['Remove bubbles', 'A light pass with a heat gun or torch.'], ['Allow the full cure', 'The slow cure is what keeps it crystal clear.']].map(([t, d], i) => `<li><span class="step-n">${i + 1}</span><h3 class="h4">${t}</h3><p>${d}</p></li>`).join('')}</ol></div>
</div></section>
${ctaBand('Want a river table made for you?', { href: '/bespoke-resin-commissions/', label: 'Bespoke commissions' })}`,
});
catPage('/resin-bound/', {
  title: 'Resin Bound Kits | Mini Kit up to 1m² | Gafflow', meta: 'Resin bound mini kits covering up to 1m² in seven colours. Free collection from Eastbourne or Whyteleafe, or delivery.',
  h1: 'Resin bound kits', lede: 'Try the resin bound system on a small area first. Kits cover up to 1m², with free collection from Eastbourne or Whyteleafe, or delivery.', slugs: ['resin-bound-mini-kit'],
  after: `<section class="sec tight"><div class="wrap"><h2 class="h3">Colours</h2><ul class="bound-sw">${['Ashfall', 'Baltic Moon', 'Creme Caramel', 'Eastbourne Beach', 'Gold Coral', 'Molten Ash', 'Steel Blue'].map((n) => `<li><img src="/img/p/bound-${n.toLowerCase().replace(/ /g, '-')}.webp" alt="" width="160" height="160" loading="lazy"><span>${n.replace('Creme', 'Crème')}</span></li>`).join('')}</ul><p class="fine">More colours available on request. <a href="/resin-driveways/">Prefer a full driveway installed?</a></p></div></section>`,
});
catPage('/resin-craft-kits/', {
  title: 'Resin Craft Kits | Arts & Crafts Epoxy Kits | Gafflow', meta: 'Arts and crafts resin kits with Gafflow Money Coat epoxy, liquid pigment and metallic minis. Ideal for hobbyists and small projects.',
  h1: 'Resin craft kits', lede: 'For arts, crafts and smaller areas, made with the same Money Coat the team pours floors with. The creativity is endless.', slugs: ['arts-crafts-resin-kit-1kg', 'arts-crafts-resin-kit-3kg'],
});

// PRODUCT PAGES
const SPLIT = /^(Appearance|Technical Information|Features & Benefits|FEATURES & BENEFITS|Shipping|Packaging|Course Details|What You)/i;
for (const p of Object.values(products)) {
  const course = site.courses.find((c) => c.slug === p.slug);
  const i = p.body.findIndex((b, k) => k > 0 && SPLIT.test(b.x));
  const intro = (i > 0 ? p.body.slice(0, i) : p.body.slice(0, 3)).filter((b) => b.t !== 'li').slice(0, 3);
  const rest = i > 0 ? p.body.slice(i) : p.body.slice(3);
  const related = (CAT[p.cat] || []).filter((s) => s !== p.slug).slice(0, 4).map((s) => products[s]);
  const hidden = p.slug === 'deposit-payment';
  const crumbCat = p.cat === 'learn' ? ['Courses', '/courses/'] : ['Shop', '/shop/'];
  add(`/product/${p.slug}/`, {
    title: (p.title || `${p.name} | Gafflow Resin Finishes`).replace(/ - Gafflow Resin Finishes$/, ' | Gafflow Resin Finishes').replace(/EPoxy/g, 'Epoxy'),
    meta: p.meta || `${p.name} from Gafflow Resin Finishes. ${priceText(p)}.`,
    noindex: hidden, cur: p.cat === 'learn' ? '/courses/' : '/shop/',
    schema: [bizSchema(), course ? courseSchema(course) : productSchema(p), crumbs([['Home', '/'], crumbCat, [p.name, `/product/${p.slug}/`]])],
    body: `
<section class="sec prod"><div class="wrap prod-grid">
  <figure class="prod-media"><img src="/img/p/${p.slug}.webp" alt="${esc(p.name)}" width="480" height="480" fetchpriority="high" decoding="async"></figure>
  <div class="prod-info">
    <p class="crumb">${crumbNav([['Home', '/'], crumbCat, [p.name.split(',')[0], `/product/${p.slug}/`]])}</p>
    <h1 class="h2">${esc(p.name)}</h1>
    <p class="prod-price">${priceText(p)}${course ? '<small>per person</small>' : ''}</p>
    ${course ? `<p class="course-when">${icon('calendar-blank', 'light')}<span>${esc(course.dates)} <b class="soon" data-starts="${course.start}"></b></span></p><p class="course-when">${icon('map-pin', 'light')}<span>${esc(course.where)}</span></p>` : ''}
    ${intro.map((b) => `<p>${esc(b.x)}</p>`).join('')}
    ${p.variations.map((v) => `<div class="vars"><p class="vars-h">${esc(v.name.replace(/\b\w/, (c) => c.toUpperCase()))}</p><ul>${v.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div>`).join('')}
    ${p.out ? `<p class="notice">${icon('info', 'light')}<span>Out of stock online. <a href="mailto:${biz.email}?subject=${encodeURIComponent('Order: ' + p.name)}">Email the team</a> to order or check lead times.</span></p>` : ''}
    <div class="ctas">
      <a class="btn btn-primary btn-lg" href="${storeUrl(p.slug)}" data-track="${course ? 'course_book' : 'add_to_cart'}" data-loc="${p.slug}">${course ? 'Book my place' : p.out ? 'View on the store' : 'Buy now'} ${icon('arrow-right')}</a>
      <a class="btn btn-ghost btn-lg" href="${course ? WA_COURSE : `mailto:${biz.email}?subject=${encodeURIComponent('Question: ' + p.name)}`}" rel="noopener">${icon(course ? 'whatsapp-logo' : 'envelope-simple')} Ask a question</a>
    </div>
    <p class="fine">${course ? 'Places are strictly limited. Once your booking is confirmed, the team gets in touch within a couple of days with full details.' : p.slug === 'the-resin-bible' ? 'Digital download. Refunds are not available on digital products.' : esc(SHIPPING)}</p>
  </div>
</div></section>
${rest.length ? `<section class="sec tight"><div class="wrap narrow"><details class="more"><summary>${course ? 'Full course details' : 'Full product and technical details'}${icon('plus')}</summary><div class="prose">${prose(rest)}</div></details></div></section>` : ''}
${related.length ? `<section class="sec tight"><div class="wrap"><h2 class="h3">${course ? 'Other courses and guides' : 'Goes well with'}</h2><ul class="pgrid">${related.map((r) => pcard(r)).join('')}</ul></div></section>` : ''}
${course ? testimonials({ limit: 3, title: 'What past students say' }) : ''}`,
  });
}

// LEGAL (ported verbatim)
const legalPage = (slug, crumb) => {
  const L = legacy[slug];
  let [h1, ...rest] = L.blocks;
  if (slug === 'privacy-policy') { rest = L.blocks; h1 = { x: 'Privacy policy' }; }
  add(`/${slug}/`, {
    title: L.title.replace(/ - Gafflow Resin Finishes$/, ' | Gafflow Resin Finishes'), meta: L.meta || `${crumb} for Gafflow Resin Finishes.`,
    schema: [bizSchema(), crumbs([['Home', '/'], [crumb, `/${slug}/`]])],
    body: `
${pageHero({ kicker: crumbNav([['Home', '/'], [crumb, `/${slug}/`]]), h1: esc(h1.x), lede: '', ctas: false })}
<section class="sec tight"><div class="wrap"><div class="prose">${slug === 'policies'
    ? `<ul class="link-list"><li><a href="/terms-and-conditions/">Terms and conditions</a></li><li><a href="/refund-policy/">Refund policy</a></li><li><a href="/privacy-policy/">Privacy policy</a></li><li>Client contract terms for installations: supplied with your written quotation.</li></ul>`
    : prose(rest)}</div></div></section>`,
  });
};
legalPage('policies', 'Policies');
legalPage('terms-and-conditions', 'Terms and conditions');
legalPage('refund-policy', 'Refund policy');
legalPage('privacy-policy', 'Privacy policy');

// THANK YOU
add('/thank-you/', {
  title: 'Thank you | Gafflow Resin Finishes', meta: 'Your quote request has reached Gafflow Resin Finishes.', noindex: true,
  body: `
<section class="sec thanks"><div class="wrap narrow">
  <p class="thanks-ic">${icon('check-circle', 'duotone')}</p>
  <h1 class="h1">Thank you. Your request is in.</h1>
  <p class="lede">${esc(biz.replyTime)}</p>
  <div class="ty-sum" data-ty-summary hidden></div>
  <h2 class="h3">What happens next</h2>
  <ol class="steps steps-v">${[['A chat about your ideas', 'The team looks at your photos and talks through finishes, colours and what the space needs.'], ['Site survey', 'A visit to assess the existing floor and the space before anything is quoted.'], ['Your quotation', 'Your quotation, then a date for the work.']].map(([t, d], i) => `<li><span class="step-n">${i + 1}</span><h3 class="h4">${t}</h3><p>${d}</p></li>`).join('')}</ol>
  <div class="ctas"><a class="btn btn-primary" href="${WA}" data-track="whatsapp" data-loc="thank-you" rel="noopener">${icon('whatsapp-logo')} WhatsApp your photos</a><a class="btn btn-ghost" href="/gallery/">Browse more floors</a></div>
</div></section>`,
});

/* ---------- write ---------- */
const sitemap = [];
for (const pg of pages) {
  const html = layout(pg);
  if (/[—–]/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) console.warn('dash found on', pg.p);
  const out = pg.p === '/' ? 'index.html' : pg.p.replace(/^\//, '') + 'index.html';
  fs.mkdirSync(path.dirname(path.join(DIST, out)), { recursive: true });
  fs.writeFileSync(path.join(DIST, out), html);
  if (!pg.noindex) sitemap.push(abs(pg.p));
}
fs.writeFileSync(path.join(DIST, '404.html'), layout({ p: '/404', title: 'Page not found | Gafflow Resin Finishes', meta: 'This page could not be found.', noindex: true, body: `${pageHero({ h1: 'That page has moved or no longer exists', lede: 'Try the home page, the shop or the gallery.', ctas: false })}${ctaBand()}` }));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), site.noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`Built ${pages.length + 1} pages into ${path.relative(ROOT, DIST)}/`);
