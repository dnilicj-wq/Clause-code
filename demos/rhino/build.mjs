// Static build for the Rhino Coating demo. `node build.mjs` → dist/
// Pages keep every live URL slug from rhinocoating.co.uk (see redirects.md).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { build } from 'esbuild';
import site from './site.config.mjs';
import rates from './rates.config.mjs';
import cities from './data/cities.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, process.env.OUT || 'dist');
const legacy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/legacy.json'), 'utf8'));
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
const V = { js: hash('main.js'), css: hash('styles.css') };
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
// WebP dimensions (VP8 / VP8L / VP8X) so every <img> reserves its space (CLS 0).
function dims(file) {
  const b = fs.readFileSync(file);
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (t === 'VP8L') { const n = b.readUInt32LE(21); return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1]; }
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
}
function img(name, alt, { sizes = '(max-width: 760px) 100vw, 50vw', eager = false, cls = '', small = false } = {}) {
  const has1280 = fs.existsSync(path.join(SRC, 'img', `${name}-1280.webp`));
  const big = has1280 ? `${name}-1280.webp` : `${name}-1200.webp`;
  const [w, h] = dims(path.join(SRC, 'img', big));
  const src = small ? `/img/${name}-640.webp` : `/img/${big}`;
  const [w6] = dims(path.join(SRC, 'img', `${name}-640.webp`));
  return `<img${cls ? ` class="${cls}"` : ''} src="${src}" srcset="/img/${name}-640.webp ${w6}w, /img/${big} ${w}w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
const tel = `tel:${biz.phoneIntl}`;
const wa = (text) => `https://wa.me/${biz.whatsapp}?text=${encodeURIComponent(text)}`;
const WA_PHOTOS = wa('Hi Rhino Coating, here are 3 photos of my floor for a quote. My postcode is ');
const abs = (p) => BASE + (p === '/' ? '' : p);

/* ---------- schema ---------- */
const BIZ_ID = `${BASE}/#business`;
const bizSchema = () => ({
  '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', '@id': BIZ_ID,
  name: biz.legalName, alternateName: biz.name, url: BASE + '/', telephone: biz.phoneIntl, email: biz.email,
  image: `${BASE}/img/og.jpg`, logo: `${BASE}/img/rhino-mark.webp`, foundingDate: biz.founded,
  address: { '@type': 'PostalAddress', streetAddress: biz.street, addressLocality: biz.locality, addressRegion: biz.region, postalCode: biz.postcode, addressCountry: 'GB' },
  areaServed: [{ '@type': 'Country', name: 'United Kingdom' }, ...cities.map((c) => ({ '@type': 'City', name: c.name })),
    ...['Didsbury', 'Sale', 'Altrincham', 'Hale', 'Wilmslow', 'Alderley Edge'].map((n) => ({ '@type': 'Place', name: n }))],
  sameAs: [biz.instagram],
});
const serviceSchema = (s) => ({
  '@context': 'https://schema.org', '@type': 'Service', name: `${s.name} ${s.type}`, serviceType: 'Epoxy resin flooring installation',
  description: s.line, provider: { '@id': BIZ_ID }, areaServed: { '@type': 'Country', name: 'United Kingdom' },
});
const faqSchema = (list) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbs = (trail) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })) });

/* ---------- chrome ---------- */
const NAV = [['/epoxy-garage-flooring', 'Garage floors'], ['/services', 'Commercial'], ['/process', 'Process'], ['/portfolio', 'Projects'], ['/#finance', 'Finance'], ['/contact', 'Contact']];
const brand = (tag = 'a') => `<${tag} class="brand" ${tag === 'a' ? 'href="/" aria-label="Rhino Coating home"' : ''}><img src="/img/rhino-mark.webp" alt="" width="122" height="160"><span class="wordmark"><span class="wm-a">Rhino</span><span class="wm-b">Coating</span></span></${tag}>`;
const header = (cur) => `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="wrap nav">
    ${brand()}
    <nav class="nav-links" aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${cur === h ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <div class="nav-cta">
      <a class="nav-phone" href="${tel}" aria-label="Call ${biz.phone}" data-track="call" data-loc="header">${icon('phone')}<span>${biz.phone}</span></a>
      <a class="btn btn-primary btn-sm" href="/#quote" data-track="cta" data-loc="header">Get my fixed quote</a>
    </div>
  </div>
</header>`;
const footer = () => `
<footer class="footer">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      ${brand('div')}
      <p>${esc(biz.legalName)}. ${esc(biz.street)}, ${esc(biz.locality)}, ${esc(biz.region)}, ${esc(biz.postcode)}.</p>
      <p><a href="${tel}" data-track="call" data-loc="footer">${biz.phone}</a><br><a href="mailto:${biz.email}">${biz.email}</a></p>
      <p class="fine">Company registration number ${biz.companyNo}.</p>
    </div>
    <div><p class="f-h">Floors</p><ul>
      <li><a href="/epoxy-garage-flooring">Epoxy garage flooring</a></li><li><a href="/services">Commercial &amp; industrial</a></li>
      <li><a href="/new-build-garage-flooring">New-build developers</a></li><li><a href="/process">Installation process</a></li>
      <li><a href="/floor-preparation">Floor preparation</a></li><li><a href="/portfolio">Projects</a></li><li><a href="/blog">Guides</a></li></ul></div>
    <div><p class="f-h">Areas</p><ul>${cities.map((c) => `<li><a href="/epoxy-flooring-${c.slug}">Epoxy flooring ${c.name}</a></li>`).join('')}</ul></div>
    <div><p class="f-h">Company</p><ul>
      <li><a href="/about">About</a></li><li><a href="/warranty">10-year warranty</a></li><li><a href="/contact">Contact</a></li>
      <li><a href="/terms-and-conditions">Terms &amp; conditions</a></li><li><a href="/complaints">Complaints</a></li></ul></div>
  </div>
  <div class="wrap fine foot-legal"><p>${esc(site.financeWording)}</p><p>© ${new Date().getFullYear()} ${esc(biz.legalName)}. All rights reserved.</p></div>
</footer>
<div class="mobile-bar" aria-label="Quick actions">
  <a href="${tel}" data-track="call" data-loc="mobile-bar">${icon('phone')}Call</a>
  <a href="${WA_PHOTOS}" data-track="whatsapp" data-loc="mobile-bar" rel="noopener">${icon('whatsapp-logo')}WhatsApp</a>
  <a class="mb-quote" href="/#quote" data-track="cta" data-loc="mobile-bar">${icon('file-text')}Quote</a>
</div>`;

const clientConfig = {
  rates, wa: biz.whatsapp, phone: biz.phone, areas: site.areas, homePatch: site.homePatch,
};

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
<meta name="theme-color" content="#121016">
<meta property="og:type" content="website"><meta property="og:site_name" content="Rhino Coating"><meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(meta)}">
<meta property="og:url" content="${abs(p)}"><meta property="og:image" content="${BASE}${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/rhino-mark.webp" type="image/webp">
<link rel="preload" href="/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
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
<script>window.__RHINO__=${JSON.stringify(clientConfig)}</script>
<script type="module" src="/assets/main.js?v=${V.js}"></script>
</body>
</html>`;
}

/* ---------- blocks ---------- */
const trustStrip = () => `
<section class="trust" aria-label="Why choose Rhino">
  <ul class="wrap trust-list">${site.trust.map(([ic, t, s]) => `<li>${icon(ic, 'light')}<span><b>${t}</b><small>${s}</small></span></li>`).join('')}</ul>
</section>`;

const sp = rates.spaces, sy = rates.systems;
const estimator = (h = 'h2') => `
<section id="estimate" class="sec estimate" aria-labelledby="est-title">
  <div class="wrap est-grid">
    <div class="est-copy">
      <${h} id="est-title" class="h2">A ballpark in 30 seconds</${h}>
      <p class="lede-sm">Pick your space, system and size. You see an indicative range straight away, with no contact details needed.</p>
    </div>
    <form class="est-form" data-estimator novalidate>
        <fieldset><legend>Space</legend><div class="chips">
          ${Object.entries(sp).map(([k, v], i) => `<label class="chip"><input type="radio" name="space" value="${k}"${i === 0 ? ' checked' : ''}><span>${esc(v.label)}</span></label>`).join('')}
        </div></fieldset>
        <fieldset><legend>System</legend><div class="chips">
          ${Object.entries(sy).map(([k, v]) => `<label class="chip"><input type="radio" name="system" value="${k}"${k === 'FB-400' ? ' checked' : ''}><span><i class="sw sw-${k.toLowerCase()}" aria-hidden="true"></i>${esc(v.label.replace('Rhino ', ''))} <small>${esc(v.finish)}</small></span></label>`).join('')}
        </div></fieldset>
        <fieldset><legend><label for="est-m2">Floor area</label></legend>
          <div class="range-row"><input id="est-m2" name="m2" type="range" min="${sp.single.min}" max="${sp.single.max}" step="1" value="${sp.single.m2}" class="range"><output for="est-m2" class="m2-out"><span data-m2>${sp.single.m2}</span> m²</output></div>
          <p class="hint">Not sure? A single garage is usually 15 to 18 m², a double 30 to 36 m².</p>
        </fieldset>
    </form>
    <div class="est-card" aria-live="polite">
      <p class="est-label">Indicative range</p>
      <p class="est-price"><span data-low>£0</span><span class="to">to</span><span data-high>£0</span></p>
      <p class="est-sub"><span data-sum>Single garage, 17 m², Rhino FB-400</span></p>
      <p class="est-fin">${icon('percent')}<span>or from <b data-monthly>£0</b>/month over 12 months interest-free</span></p>
      <p class="est-note">Indicative, confirmed after free survey. Slab condition, repairs and moisture treatment can move the figure.</p>
      <a class="btn btn-primary btn-block" href="#quote" data-lock data-track="estimator_lock">Lock in<span class="hide-sm"> a fixed</span> quote ${icon('arrow-right')}</a>
    </div>
  </div>
</section>`;

const layerStack = () => `
<section id="layers" class="layers" aria-labelledby="layers-title" data-layers>
  <div class="layers-sticky">
    <div class="wrap layers-grid">
      <div class="layers-copy">
        <h2 id="layers-title" class="h2">Seven layers. That is why it lasts.</h2>
        <p class="lede-sm">Most resin floors fail because of what is underneath. Scroll to take a Rhino FB-400 floor apart.</p>
        <ol class="layer-list" data-layer-list>
          ${[...site.layers].reverse().map((l, i) => `<li data-li="${site.layers.length - 1 - i}"><b>${esc(l.name)}</b><span>${esc(l.benefit)}</span></li>`).join('')}
        </ol>
      </div>
      <div class="stack-stage" aria-hidden="true">
        <div class="stack" data-stack>
          ${site.layers.map((l, i) => `<div class="slab slab-${l.key}" style="--i:${i}">${l.img ? `<img src="/img/${l.img}.webp" alt="" width="512" height="512" loading="lazy" decoding="async">` : ''}<span class="slab-tag">${esc(l.name)}</span></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>`;

const systemsBlock = (h = 'h2') => {
  const [f, ...rest] = site.systems;
  const card = (s, big) => `
    <article class="sys${big ? ' sys-feature' : ''}" id="${s.code.toLowerCase()}">
      <div class="sys-media">${img(s.img, s.imgAlt, { sizes: big ? '(max-width: 760px) 100vw, 55vw' : '(max-width: 760px) 100vw, 30vw' })}${s.render ? '<span class="render-note">Render of the finish</span>' : ''}</div>
      <div class="sys-body">
        <p class="sys-type">${esc(s.type)}</p>
        <h3 class="h3">${esc(s.name)}</h3>
        <p>${esc(s.line)}</p>
        <ul class="ticks">${s.points.map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>
      </div>
    </article>`;
  return `
<section id="systems" class="sec systems" aria-labelledby="sys-title">
  <div class="wrap">
    <${h} id="sys-title" class="h2">Three systems. One standard of preparation.</${h}>
    <div class="sys-grid">${card(f, true)}<div class="sys-side">${rest.map((s) => card(s, false)).join('')}</div></div>
    <div class="compare-wrap" role="region" aria-label="System comparison" tabindex="0">
      <table class="compare">
        <thead><tr><th scope="col"><span class="sr">Feature</span></th>${site.systems.map((s) => `<th scope="col">${esc(s.name)}</th>`).join('')}</tr></thead>
        <tbody>
          ${[['Who it suits', 'suits'], ['Finish', 'finish'], ['Durability', 'durability'], ['Where it is used', 'where']].map(([lab, k]) => `<tr><th scope="row">${lab}</th>${site.systems.map((s) => `<td>${esc(s[k])}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="fine">General guidance only. Final system selection follows a site survey and is confirmed in your written specification.</p>
  </div>
</section>`;
};

const processBlock = (h = 'h2', id = 'process') => `
<section id="${id}" class="sec process" aria-labelledby="${id}-title">
  <div class="wrap">
    <${h} id="${id}-title" class="h2">Four stages, every floor</${h}>
    <ol class="steps">${site.process.map(([t, d], i) => `<li><span class="step-n">${i + 1}</span><h3 class="h4">${t}</h3><p>${d}</p></li>`).join('')}</ol>
    <dl class="timings">${site.timings.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
    <p class="fine">Typical for a single garage. Curing depends on temperature and humidity, and we confirm timings for your floor.</p>
  </div>
</section>`;

const gallery = ({ filter = true, limit = 99, h = 'h2', title = 'Real Rhino floors' } = {}) => {
  const items = site.gallery.slice(0, limit);
  return `
<section id="projects" class="sec gallery" aria-labelledby="gal-title">
  <div class="wrap">
    <${h} id="gal-title" class="h2">${title}</${h}>
    <p class="lede-sm">Every photo here is a Rhino Coating installation, photographed on site.</p>
    ${filter ? `<div class="chips filter" role="group" aria-label="Filter projects">
      ${[['all', 'All'], ['garage', 'Garages'], ['commercial', 'Commercial'], ['process', 'On site']].map(([k, t], i) => `<button type="button" class="chip-btn" data-filter="${k}" aria-pressed="${i === 0}">${t}</button>`).join('')}
    </div>` : ''}
    <ul class="masonry" data-gallery>
      ${items.map((g) => `<li data-space="${g.space}"><figure>${img(g.img, g.alt, { sizes: '(max-width: 760px) 50vw, 25vw', small: true })}<figcaption>${esc(g.cap)}</figcaption></figure></li>`).join('')}
    </ul>
  </div>
</section>`;
};

const ytFeature = () => `
<section class="sec yt" aria-labelledby="yt-title">
  <div class="wrap yt-grid">
    <div class="yt-copy">
      <h2 id="yt-title" class="h2">Featured on ${esc(biz.youtubeChannel)}'s YouTube</h2>
      <p>Josh Sanderson built a dream garage for a friend, and Rhino Coating laid the floor. Watch the install in "${esc(biz.youtubeTitle)}".</p>
    </div>
    <button type="button" class="yt-lite" data-yt="${biz.youtubeId}" aria-label="Play video: ${esc(biz.youtubeTitle)}">
      <img src="/img/youtube-josh-sanderson.webp" alt="" width="960" height="540" loading="lazy" decoding="async">
      <span class="yt-play">${icon('play', 'fill')}</span>
    </button>
  </div>
</section>`;

const GOOGLE_G = '<svg class="g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
const reviews = () => `
<section id="reviews" class="sec reviews" aria-labelledby="rev-title">
  <div class="wrap rev-grid">
    <figure class="rev-photo">${img('happy-customer', 'A Rhino Coating customer holding a 100% Satisfied sign in his newly coated garage', { sizes: '(max-width: 760px) 100vw, 34vw', small: true })}</figure>
    <div>
      <h2 id="rev-title" class="h2">What customers say</h2>
      <div class="rev-slot" data-google-reviews>
        <p class="rev-head">${GOOGLE_G}<b>Google reviews</b></p>
        <p class="rev-empty">Your Google reviews appear here. This panel connects to Rhino Coating's Google Business Profile at launch, so only real, verified reviews are shown.</p>
      </div>
      <p class="fine">No sample or invented reviews are used on this site.</p>
    </div>
  </div>
</section>`;

const finance = () => `
<section id="finance" class="sec finance" aria-labelledby="fin-title">
  <div class="wrap fin-grid">
    <div>
      <h2 id="fin-title" class="h2">Spread the cost</h2>
      <p class="lede-sm">12 months interest-free, then 9% APR on the remaining balance. Check a monthly figure before you ask for a quote.</p>
      <p class="fine fin-legal">${esc(site.financeWording)}</p>
    </div>
    <form class="fin-calc" data-finance novalidate>
      <div class="field"><label for="fin-cost">Project cost</label><div class="money"><span>£</span><input id="fin-cost" name="cost" type="number" inputmode="numeric" min="500" max="50000" step="50" value="3000" class="input"></div></div>
      <div class="field"><label for="fin-dep">Deposit</label><div class="money"><span>£</span><input id="fin-dep" name="deposit" type="number" inputmode="numeric" min="0" max="25000" step="50" value="300" class="input"></div></div>
      <div class="field"><label for="fin-term">Repayment term: <b data-term-out>24 months</b></label><input id="fin-term" name="term" type="range" min="6" max="60" step="6" value="24" class="range"></div>
      <dl class="fin-out">
        <div><dt>Monthly payment</dt><dd data-f-monthly>£0</dd></div>
        <div><dt>Amount financed</dt><dd data-f-financed>£0</dd></div>
        <div><dt>Interest</dt><dd data-f-interest>£0</dd></div>
        <div><dt>Total repayable</dt><dd data-f-total>£0</dd></div>
      </dl>
      <p class="fine" data-f-explain>Illustration only. Your lender confirms the final figures.</p>
    </form>
  </div>
</section>`;

const warrantySummary = () => `
<section id="warranty" class="sec warranty" aria-labelledby="war-title">
  <div class="wrap war-grid">
    <div class="war-seal">${icon('seal-check', 'duotone')}<p><b>10</b><span>year workmanship warranty</span></p></div>
    <div>
      <h2 id="war-title" class="h2">In writing, for ten years</h2>
      <p>Valid for 10 years from practical completion, for the original purchaser. If a valid claim is accepted, Rhino repairs or replaces the affected area at no cost to you.</p>
      <div class="war-cols">
        <div><h3 class="h4">Covered</h3><ul class="ticks">${['Loss of adhesion caused by installation defects', 'Defects in workmanship', 'Coating failure from incorrect installation', 'Delamination where the slab was suitable at installation'].map((x) => `<li>${icon('check')}${x}</li>`).join('')}</ul></div>
        <div><h3 class="h4">Not covered</h3><ul class="crosses">${['Existing or future cracking in the concrete', 'Existing moisture, rising damp or hydrostatic pressure', 'Impact, dragging or incorrect cleaning', 'Tyre staining and normal wear'].map((x) => `<li>${icon('minus')}${x}</li>`).join('')}</ul></div>
      </div>
      <a class="link-arrow" href="/warranty">Read the full warranty terms ${icon('arrow-right')}</a>
    </div>
  </div>
</section>`;

const faqBlock = (list, { title = 'Straight answers', h = 'h2', id = 'faq' } = {}) => `
<section id="${id}" class="sec faq" aria-labelledby="${id}-title">
  <div class="wrap faq-grid">
    <div><${h} id="${id}-title" class="h2">${title}</${h}><p class="lede-sm">Still unsure? Call <a href="${tel}" data-track="call" data-loc="faq">${biz.phone}</a>.</p></div>
    <div class="faq-list">${list.map(([q, a]) => `<details><summary>${esc(q)}${icon('plus')}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join('')}</div>
  </div>
</section>`;

const quoteForm = ({ area = '', h = 'h2', title = 'Get your fixed quote' } = {}) => `
<section id="quote" class="sec quote" aria-labelledby="quote-title">
  <div class="wrap quote-grid">
    <div class="quote-copy">
      <${h} id="quote-title" class="h2">${title}</${h}>
      <p class="lede-sm">Four quick steps. Send three photos of your floor and we come back with a fixed quotation, a system recommendation and available dates.</p>
      <ul class="ticks">${['Free survey, no obligation', 'Fixed quote, not an estimate', biz.replyTime].map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>
      <a class="btn btn-ghost" href="${WA_PHOTOS}" data-track="whatsapp" data-loc="quote" rel="noopener">${icon('whatsapp-logo')} Or WhatsApp 3 photos</a>
    </div>
    <form class="qf" data-quote novalidate ${area ? `data-area="${esc(area)}"` : ''} action="/thank-you" method="post" enctype="multipart/form-data">
      <div class="qf-progress" aria-hidden="true"><span data-qf-bar></span></div>
      <p class="qf-step-label" aria-live="polite"><span data-qf-n>Step 1 of 4</span>: <span data-qf-name>Your space</span></p>
      <fieldset class="qf-step" data-step="1">
        <legend class="sr">Your space</legend>
        <div class="tiles">${Object.entries(sp).map(([k, v], i) => `<label class="tile"><input type="radio" name="space" value="${esc(v.label)}"${i === 0 ? ' checked' : ''}><span>${icon(['garage', 'warehouse', 'barbell', 'buildings'][i], 'light')}${esc(v.label)}</span></label>`).join('')}</div>
        <div class="field-row">
          <div class="field"><label for="qf-system">System</label><select id="qf-system" name="system" class="input"><option value="Not sure yet">Not sure yet</option>${Object.values(sy).map((v) => `<option>${esc(v.label)} (${esc(v.finish)})</option>`).join('')}</select></div>
          <div class="field"><label for="qf-m2">Approx. area (m²) <span class="opt">Optional</span></label><input id="qf-m2" name="area_m2" type="number" inputmode="numeric" min="1" class="input"></div>
        </div>
      </fieldset>
      <fieldset class="qf-step" data-step="2" hidden>
        <legend class="sr">Your postcode</legend>
        <div class="field"><label for="qf-pc">Postcode</label><input id="qf-pc" name="postcode" autocomplete="postal-code" class="input pc" required data-req="Add your postcode so we can check coverage." placeholder="e.g. M20 2AB"><p class="err" aria-live="polite"></p></div>
        <p class="cover" data-cover aria-live="polite">${icon('check-circle')}<span data-cover-text></span></p>
      </fieldset>
      <fieldset class="qf-step" data-step="3" hidden>
        <legend class="sr">Photos of your floor</legend>
        <label class="drop" for="qf-photos">${icon('camera', 'light')}<b>Add up to 3 photos</b><span>One wide shot of the whole floor, one close-up of any cracks or old coating, one of the doorway or access.</span></label>
        <input id="qf-photos" name="photos" type="file" accept="image/*" multiple class="sr-file">
        <ul class="thumbs" data-thumbs></ul>
        <p class="hint">No photos to hand? Skip this and WhatsApp them later.</p>
      </fieldset>
      <fieldset class="qf-step" data-step="4" hidden>
        <legend class="sr">Your details</legend>
        <div class="field"><label for="qf-name">Name</label><input id="qf-name" name="name" autocomplete="name" class="input" required data-req="Please add your name."><p class="err"></p></div>
        <div class="field-row">
          <div class="field"><label for="qf-phone">Phone</label><input id="qf-phone" name="phone" type="tel" autocomplete="tel" class="input" required data-kind="phone" data-req="Add a UK phone number."><p class="err"></p></div>
          <div class="field"><label for="qf-email">Email</label><input id="qf-email" name="email" type="email" autocomplete="email" class="input" required data-kind="email" data-req="Add your email for the written quote."><p class="err"></p></div>
        </div>
        <div class="field"><label for="qf-msg">Anything we should know? <span class="opt">Optional</span></label><textarea id="qf-msg" name="message" rows="3" class="input"></textarea></div>
        <input type="text" name="company_website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="fine">We use your details only to reply to your enquiry. ${esc(biz.replyTime)}</p>
      </fieldset>
      <input type="hidden" name="estimate" value="">
      <div class="qf-nav">
        <button type="button" class="btn btn-ghost" data-qf-back hidden>${icon('arrow-left')} Back</button>
        <button type="button" class="btn btn-primary" data-qf-next>Continue ${icon('arrow-right')}</button>
        <button type="submit" class="btn btn-primary" data-qf-submit hidden>Send my quote request</button>
      </div>
      <p class="form-status" aria-live="polite"></p>
    </form>
  </div>
</section>`;

const ctaBand = (t = 'Ready for a floor that lasts?') => `
<section class="cta-band"><div class="wrap cta-inner">
  <p class="h3">${t}</p>
  <div class="ctas"><a class="btn btn-primary" href="/#quote" data-track="cta" data-loc="band">Get my fixed quote ${icon('arrow-right')}</a><a class="btn btn-ghost" href="${WA_PHOTOS}" data-track="whatsapp" data-loc="band" rel="noopener">${icon('whatsapp-logo')} WhatsApp 3 photos</a></div>
</div></section>`;

const pageHero = ({ kicker = '', h1, lede, image = null, alt = '', ctas = true }) => `
<section class="phero${image ? ' has-img' : ''}">
  ${image ? `<div class="phero-bg" aria-hidden="true">${img(image, alt, { sizes: '(max-width: 760px) 360px, 100vw', eager: true })}</div>` : ''}
  <div class="wrap phero-inner">
    ${kicker ? `<p class="crumb">${kicker}</p>` : ''}
    <h1 class="h1">${h1}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
    ${ctas ? `<div class="ctas"><a class="btn btn-primary btn-lg" href="#quote" data-track="cta" data-loc="page-hero">Get my fixed quote ${icon('arrow-right')}</a><a class="btn btn-ghost btn-lg" href="${WA_PHOTOS}" data-track="whatsapp" data-loc="page-hero" rel="noopener">${icon('whatsapp-logo')} WhatsApp 3 photos</a></div>` : ''}
  </div>
</section>`;
const crumbNav = (trail) => trail.map(([n, p], i) => i < trail.length - 1 ? `<a href="${p}">${esc(n)}</a>` : `<span aria-current="page">${esc(n)}</span>`).join(' <span aria-hidden="true">/</span> ');
const prose = (blocks) => blocks.map((b) => b.t === 'li' ? `<li>${esc(b.x)}</li>` : `<${b.t === 'h1' ? 'h2' : b.t}>${esc(b.x)}</${b.t === 'h1' ? 'h2' : b.t}>`).join('\n').replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

/* ---------- pages ---------- */
const pages = [];
const add = (p, opts) => pages.push({ p, ...opts });

// HOME
const heroPreload = `<link rel="preload" as="image" href="/img/hero-flake-m.webp" media="(max-width: 760px)" fetchpriority="high"><link rel="preload" as="image" href="/img/hero-flake-1600.webp" imagesrcset="/img/hero-flake-960.webp 960w, /img/hero-flake-1600.webp 1600w" imagesizes="100vw" media="(min-width: 761px)" fetchpriority="high">`;
add('/', {
  title: 'Epoxy Resin Flooring Manchester | Garage Floors | Rhino Coating',
  meta: 'Epoxy resin flooring in Manchester, Cheshire and nationwide. Garage floors in 2 to 3 days, diamond-ground, with a 10-year workmanship warranty and 0% finance.',
  preload: heroPreload,
  schema: [bizSchema(), ...site.systems.map(serviceSchema), faqSchema(site.faqs)],
  body: `
<section class="hero" aria-labelledby="hero-title">
  <picture class="hero-bg" aria-hidden="true">
    <source media="(max-width: 760px)" srcset="/img/hero-flake-m.webp" width="540" height="825">
    <img src="/img/hero-flake-1600.webp" srcset="/img/hero-flake-960.webp 960w, /img/hero-flake-1600.webp 1600w" sizes="100vw" alt="" width="1600" height="1000" fetchpriority="high" decoding="async">
  </picture>
  <div class="wrap hero-inner">
    <h1 id="hero-title" class="display"><span class="h1-kicker">Epoxy resin flooring, Manchester</span>A showroom floor for your garage, built in 2 to 3 days.</h1>
    <p class="lede">Diamond-ground, moisture-tested and backed by a <span class="nw">10-year</span> workmanship warranty. Installed by our own team across Cheshire and the UK.</p>
    <div class="ctas">
      <a class="btn btn-primary btn-lg" href="#quote" data-track="cta" data-loc="hero">Get my fixed quote ${icon('arrow-right')}</a>
      <a class="btn btn-ghost btn-lg" href="${WA_PHOTOS}" data-track="whatsapp" data-loc="hero" rel="noopener">${icon('whatsapp-logo')} WhatsApp 3 photos</a>
    </div>
  </div>
</section>
${trustStrip()}
${estimator()}
${layerStack()}
${systemsBlock()}
${processBlock()}
${gallery({ limit: 8 })}
${ytFeature()}
${reviews()}
${finance()}
${warrantySummary()}
${faqBlock(site.faqs)}
${quoteForm()}
<aside class="nudge" data-nudge hidden aria-label="Quick estimate">
  <p><b>Get a ballpark in 30 seconds</b><span>No contact details needed.</span></p>
  <a class="btn btn-primary btn-sm" href="#estimate" data-track="nudge">Show me</a>
  <button type="button" class="nudge-x" data-nudge-x aria-label="Dismiss">${icon('x')}</button>
</aside>`,
});

// GARAGE FLOORING
const garageFaqs = [
  ['What does a full flake garage floor cost?', 'It depends on the size of the floor, the condition of the concrete and how much preparation is needed. A worn, oil-contaminated slab needs more work than a sound one. Use the estimator for an indicative range, then we survey and give you a fixed quote.'],
  site.faqs[0], site.faqs[1], site.faqs[11], site.faqs[6], site.faqs[9],
  ['Why is preparation so important for a flake floor?', 'Epoxy bonds mechanically to the concrete. If the surface is dusty, painted, sealed or oil-contaminated, the resin has nothing sound to grip and lifts, usually around the wheels where loads are highest. Grinding, crack repair and moisture testing make the difference, and they are the stages cheaper quotes skip.'],
];
add('/epoxy-garage-flooring', {
  title: 'Epoxy Garage Flooring UK | Full Flake Garage Floors | Rhino Coating',
  meta: 'Epoxy garage flooring and full flake garage floors. Diamond-ground prep, hand-broadcast flake, UV-stable top coat, 10-year workmanship warranty, 0% finance.',
  cur: '/epoxy-garage-flooring',
  schema: [bizSchema(), ...site.systems.map(serviceSchema), faqSchema(garageFaqs), crumbs([['Home', '/'], ['Epoxy Garage Flooring', '/epoxy-garage-flooring']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Epoxy garage flooring', '/epoxy-garage-flooring']]), h1: 'Epoxy resin garage flooring, installed properly', lede: 'A seamless, sealed floor that resists oil, chemicals and abrasion, built in layers over a diamond-ground slab by our own City &amp; Guilds trained team.', image: 'double-garage-flake', alt: 'Double garage with a grey full flake epoxy floor installed by Rhino Coating' })}
${trustStrip()}
<section class="sec split-copy"><div class="wrap two-col">
  <div><h2 class="h2">What a full flake floor actually is</h2>
  <p>A flake floor is not a single tin of paint. It is a build-up of separate resin layers, each doing a different job, over a correctly prepared slab. Coloured flakes are broadcast by hand into wet epoxy until no more will stick, then sealed under a clear top coat.</p>
  <p>Broadcasting to refusal gives a dense, even surface with real texture. That is why full flake copes with hot tyres, road salt, dropped tools and oil drips on one continuous surface, and why it is the finish most Rhino customers choose.</p></div>
  <ul class="feature-list">${['Seamless, jointless finish', 'Resists oil and chemicals', 'Sweeps and mops clean in minutes', 'Abrasion and impact resistant', 'Sealed, dust-free surface', 'UV-stable, so the colour stays put'].map((x) => `<li>${icon('check-circle', 'light')}${x}</li>`).join('')}</ul>
</div></section>
${estimator()}
${layerStack()}
${systemsBlock()}
${processBlock()}
${gallery({ limit: 8, title: 'Garage floors we have laid' })}
${faqBlock(garageFaqs, { title: 'Garage flooring questions' })}
${quoteForm({ title: 'Get your garage floor quote' })}`,
});

// COMMERCIAL
const comFaqs = [
  ['Can you work around our operations?', 'We plan the programme around your operations where the site allows, and agree any downtime in advance. Cure times between coats mean a resin floor cannot be walked on immediately.'],
  ['Do you supply method statements and risk assessments?', 'Yes. Method statements and risk assessments are provided for commercial and industrial projects before work starts.'],
  ['Is resin right for every commercial floor?', 'No. We assess each site individually, including slab condition, moisture and intended use, and will tell you honestly if a resin system is not the right answer for your space.'],
];
add('/services', {
  title: 'Commercial & Industrial Epoxy Flooring UK | Rhino Coating',
  meta: 'Commercial and industrial resin flooring for workshops, showrooms, retail units and warehouses. Specified around your slab, with method statements and a 10-year warranty.',
  cur: '/services',
  schema: [bizSchema(), faqSchema(comFaqs), crumbs([['Home', '/'], ['Commercial & Industrial Epoxy Flooring', '/services']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Commercial & industrial', '/services']]), h1: 'Commercial and industrial epoxy flooring', lede: 'From single-unit workshops to warehousing and showrooms. Every project is specified around the slab, its condition and how the floor is actually used.', image: 'workshop-flake', alt: 'Commercial unit with a flake epoxy floor installed by Rhino Coating' })}
<section class="sec"><div class="wrap">
  <h2 class="h2">Spaces we survey and specify for</h2>
  <div class="bento">
    ${[['Showrooms', 'Automotive, trade and retail showrooms where presentation is part of the brand.', 'storefront'], ['Workshops', 'Fabrication, maintenance and engineering workshops that need a clean, durable surface.', 'wrench'], ['Retail and commercial units', 'Shops, studios and units that need a seamless, easy-to-clean floor.', 'shopping-bag'], ['Warehouses and stores', 'Storage and distribution areas assessed for load, traffic and abrasion first.', 'package']].map(([t, d, ic], i) => `<article class="bento-cell b${i}">${icon(ic, 'light')}<h3 class="h4">${t}</h3><p>${d}</p></article>`).join('')}
  </div>
  <p class="fine">A guide to where our systems are commonly used, not a guarantee. Resin flooring is not suitable for every floor or environment.</p>
</div></section>
<section class="sec split-copy"><div class="wrap two-col">
  <div><h2 class="h2">Commercial floors present well and clean easily</h2><p>A continuous floor means no grout lines or joints where dirt and spillage collect. Solid colour, full flake and marble effect finishes all work commercially, and a decorative finish can carry a brand colour or match an existing interior.</p></div>
  <div><h2 class="h2">Industrial floors are specified for duty</h2><p>Load, abrasion and the working environment come first. Heavily used concrete is often cracked, worn, contaminated or previously coated, so preparation is frequently the larger part of the job. Heavier duty may call for a thicker build and, in some cases, other resin chemistries alongside epoxy.</p></div>
</div></section>
${systemsBlock()}
<section class="sec"><div class="wrap"><h2 class="h2">What decides the specification</h2>
  <dl class="spec-grid">${[['Floor condition', 'Age, strength, flatness, cracks, old coatings and contamination.'], ['Moisture', 'Decides whether a DPM is needed and which primer is right.'], ['Area', 'Drives materials, programme length and staging around your operations.'], ['Intended use', 'Foot traffic, vehicles, point loads, chemicals and cleaning methods.'], ['Access', 'Vehicle access, parking and how equipment reaches the floor.'], ['Programme', 'Cure times between coats, agreed with you in advance.']].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
</div></section>
${faqBlock(comFaqs, { title: 'Commercial questions' })}
${quoteForm({ title: 'Tell us about your commercial floor' })}`,
});

// PROCESS
const procFaqs = [
  ['Do I always need diamond grinding?', 'In almost every case, yes. Mechanical diamond grinding creates the surface profile the resin bonds to. A floor in good condition may need less than one that is worn or contaminated.'],
  site.faqs[7],
  ['Can you repair cracks in the floor?', 'Cracks, joints and surface defects are assessed during preparation and repaired where that falls within the scope of the installation. Larger repairs or screed work may need separate assessment and are quoted accordingly.'],
  site.faqs[1],
];
add('/process', {
  title: 'Epoxy Resin Floor Installation Process | Rhino Coating',
  meta: 'How Rhino Coating installs an epoxy resin floor in four stages: prep, repair and prime, base coat, finish and topcoat. Single garage 2 to 3 days, cars after 72 hours.',
  cur: '/process',
  schema: [bizSchema(), faqSchema(procFaqs), crumbs([['Home', '/'], ['Our Installation Process', '/process']]),
    { '@context': 'https://schema.org', '@type': 'HowTo', name: 'How Rhino Coating installs an epoxy resin floor', totalTime: 'P3D', step: site.process.map(([n, t], i) => ({ '@type': 'HowToStep', position: i + 1, name: n, text: t })) }],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Process', '/process']]), h1: 'Our epoxy flooring installation process', lede: 'A durable resin floor comes down to two things: correct preparation, and a system chosen for the slab and how the floor will be used.', ctas: true })}
${processBlock('h2', 'stages')}
<section class="sec"><div class="wrap two-col media-row">
  <figure>${img('moisture-testing', 'Moisture meter on a concrete slab with readings logged on a phone', { small: true })}<figcaption>Moisture readings taken before anything is opened.</figcaption></figure>
  <figure>${img('crack-repair', 'Installer repairing a joint in a concrete floor', { small: true })}<figcaption>Cracks and joints repaired so the coating is not laid over a weakness.</figcaption></figure>
</div></section>
${layerStack()}
<section class="sec"><div class="wrap"><h2 class="h2">What helps us quote accurately</h2>
  <dl class="spec-grid">${[['Your postcode', 'To confirm coverage and account for travel.'], ['Photos of the floor', 'Wide shots plus close-ups of cracks, coatings or damage.'], ['Rough measurements', 'Length and width is enough to estimate the area.'], ['Current condition', 'Bare, previously coated, cracked, damp or newly laid.'], ['Intended use', 'Garage, workshop, showroom, commercial or industrial.'], ['Desired finish', 'Solid, full flake or marble, or tell us you are undecided.']].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
</div></section>
${faqBlock(procFaqs, { title: 'Process questions' })}
${quoteForm()}`,
});

// PORTFOLIO
add('/portfolio', {
  title: 'Completed Projects | Epoxy Flooring Case Studies | Rhino Coating',
  meta: 'Genuine Rhino Coating epoxy and resin floor installations: garages, workshops and commercial units, photographed on site. No stock imagery.',
  cur: '/portfolio',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Projects', '/portfolio']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Projects', '/portfolio']]), h1: 'Completed projects', lede: 'Real substrates, real preparation and the exact systems we delivered. If it is on this page, it is a Rhino Coating floor.', ctas: false })}
<section class="sec"><div class="wrap two-col cases">
  <a class="case" href="/projects/residential-flake-garage-floor">${img('flake-garage-open-door', 'Full flake garage floor seen through an open garage door', { small: true })}<span><b>Residential full flake garage floor</b><small>FB-400 · bare concrete to finished flake</small></span></a>
  <a class="case" href="/full-flake-garage-floor">${img('flake-closeup', 'Close-up of a grey and white full flake epoxy garage floor', { small: true })}<span><b>Full flake garage floor, Greater Manchester</b><small>FB-400 · before and after</small></span></a>
</div></section>
${gallery({ title: 'Installation archive', h: 'h2' })}
${ytFeature()}
${ctaBand('Your floor could be next')}`,
});

// CASE STUDIES
const caseSteps = (list) => `<ol class="steps steps-v">${list.map(([t, d], i) => `<li><span class="step-n">${i + 1}</span><h3 class="h4">${t}</h3><p>${d}</p></li>`).join('')}</ol>`;
add('/projects/residential-flake-garage-floor', {
  title: 'Residential Full Flake Garage Floor | Project | Rhino Coating',
  meta: 'Case study: a residential garage taken from bare concrete to a seamless full flake epoxy floor. Genuine before, during and after photography.',
  cur: '/portfolio',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Projects', '/portfolio'], ['Residential Flake Garage Floor', '/projects/residential-flake-garage-floor']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Projects', '/portfolio'], ['Residential flake garage floor', '/projects/residential-flake-garage-floor']]), h1: 'Residential full flake garage floor', lede: 'A domestic garage taken from bare, dusty concrete to a seamless, fully broadcast flake epoxy floor, installed and photographed on site.', image: 'flake-garage-open-door', alt: 'Finished full flake garage floor seen through the open garage door', ctas: false })}
<section class="sec"><div class="wrap two-col">
  <div><h2 class="h2">The brief</h2><p>The garage had the floor most UK garages have: a bare, unsealed slab carrying years of dust, surface dusting and hairline cracking. The brief was a hard-wearing, seamless floor that could take daily vehicle use, clean up easily and lift the whole space.</p>
  <dl class="spec-list"><div><dt>System</dt><dd>Full flake epoxy (FB-400)</dd></div><div><dt>Finish</dt><dd>Broadcast decorative flake, clear topcoat</dd></div><div><dt>Substrate</dt><dd>Existing concrete garage slab</dd></div><div><dt>Preparation</dt><dd>Diamond grinding and full surface preparation</dd></div></dl></div>
  ${caseSteps([['Inspection and testing', 'Checked for laitance, contamination, cracking and moisture.'], ['Diamond grinding', 'Opened the pores for a permanent mechanical key.'], ['Crack and defect repair', 'Cracks and hollows filled with structural repair resin.'], ['Base coat and flake', 'Solid epoxy base, flake broadcast to full refusal.'], ['Clear topcoat and handover', 'Sealed for sheen and wear resistance, then fully cured.']])}
</div></section>
<section class="sec"><div class="wrap ba-row">
  <figure>${img('before-bare-concrete', 'Before: bare concrete garage ahead of preparation', { small: true })}<figcaption>Before</figcaption></figure>
  <figure>${img('flake-during-post', 'During: flake floor laid around a protected support post', { small: true })}<figcaption>During</figcaption></figure>
  <figure>${img('flake-closeup', 'After: completed seamless flake finish', { small: true })}<figcaption>After</figcaption></figure>
</div></section>
${ctaBand('Want a floor like this?')}`,
});
add('/full-flake-garage-floor', {
  title: 'Full Flake Garage Floor Project | FB-400 Installation | Rhino Coating',
  meta: 'Case study: a full flake FB-400 garage floor in Greater Manchester. Substrate preparation, diamond grinding and before-and-after photography.',
  cur: '/portfolio',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Projects', '/portfolio'], ['Full Flake Garage Floor', '/full-flake-garage-floor']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Projects', '/portfolio'], ['Full flake garage floor', '/full-flake-garage-floor']]), h1: 'Full flake garage floor', lede: 'A tired, dusting garage slab in Greater Manchester turned into a hard-wearing decorative flake floor over a properly prepared substrate.', image: 'flake-closeup', alt: 'Low angle view of a grey, white and black full flake garage floor', ctas: false })}
<section class="sec"><div class="wrap two-col">
  <div><h2 class="h2">A working garage that had to look good too</h2><p>The slab had been laid purely as a structural base: trowel-finished, slightly uneven and dusting underfoot. The requirement was a decorative finish that would take a car, a workbench and daily footfall without chipping or lifting.</p>
  <dl class="spec-list"><div><dt>Location</dt><dd>Greater Manchester</dd></div><div><dt>Project</dt><dd>Residential garage</dd></div><div><dt>System</dt><dd>FB-400 full flake</dd></div><div><dt>Finish</dt><dd>Speckled flake, satin</dd></div></dl></div>
  ${caseSteps([['Moisture testing and survey', 'Readings taken before any product is opened.'], ['Diamond grinding', 'Laitance and cured surface removed, then vacuumed.'], ['Crack and defect repair', 'Cracks chased out and filled with resin mortar.'], ['Primer and base coat', 'Penetrating epoxy primer, then the coloured base coat.'], ['Flake broadcast and seal', 'Vinyl flake at full refusal, scraped back, clear sealing coat.'], ['Cure and handover', 'Use held back until cured, with a full care schedule.']])}
</div></section>
<section class="sec"><div class="wrap ba-row two">
  <figure>${img('before-bare-concrete', 'Before: dusty, untreated garage slab', { small: true })}<figcaption>Before: dusty, untreated slab</figcaption></figure>
  <figure>${img('double-garage-flake', 'After: finished flake garage floor in daily use', { small: true })}<figcaption>After: in daily use</figcaption></figure>
</div></section>
${ctaBand('Want a floor like this?')}`,
});

// NEW BUILD
const nbFaqs = [
  ['How long after the slab is laid can you coat it?', 'New concrete needs to dry before resin goes down. As a working guide we look for around four weeks of curing for a typical garage slab, and we always moisture-test on site first.'],
  ['Will it hold up on a power-floated slab?', 'Yes, with proper preparation. Power-floated slabs have a dense, closed surface that a coating cannot key to. Diamond grinding removes that layer, and it is included in every specification we quote.'],
  ['Do you provide samples for a sales suite?', 'Yes. Physical sample boards of the flake blends are available on request, and photography of completed garages can be supplied for brochures.'],
  ['What warranty applies to a development installation?', 'Every installation carries our 10-year workmanship warranty, subject to our published terms. Documentation can be provided to support what is offered to the homebuyer at handover.'],
];
add('/new-build-garage-flooring', {
  title: 'New Build Garage Flooring for UK Housing Developers | Rhino Coating',
  meta: 'Full flake epoxy garage flooring for UK housing developers as a homebuyer upgrade. Plot-by-plot scheduling, sample boards and method statements.',
  schema: [bizSchema(), faqSchema(nbFaqs), crumbs([['Home', '/'], ['New Build Garage Flooring', '/new-build-garage-flooring']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['New-build developers', '/new-build-garage-flooring']]), h1: 'New build garage flooring for UK housing developers', lede: 'A finished full flake garage floor is a surface a buyer notices on the first viewing. We deliver it as an optional upgrade, scheduled around your build programme.', image: 'flake-garage-led', alt: 'Garage with a grey flake floor under LED lighting' })}
<section class="sec"><div class="wrap"><h2 class="h2">Why a finished garage sells the rest of the house</h2>
  <div class="bento">${[['Presentation-ready', 'Seamless and consistent plot to plot, and it photographs well for sales literature.', 'camera'], ['Dust-free', 'Seals the slab, so no concrete dust on stored items.', 'sparkle'], ['Tougher than paint', 'A commercial-grade resin system, not a builder\'s coat.', 'shield-check'], ['A genuine upsell', 'Offered at reservation, it becomes a margin-positive extra.', 'trend-up']].map(([t, d, ic], i) => `<article class="bento-cell b${i}">${icon(ic, 'light')}<h3 class="h4">${t}</h3><p>${d}</p></article>`).join('')}</div>
</div></section>
<section class="sec split-copy"><div class="wrap two-col">
  <div><h2 class="h2">Coordinated with your site team</h2><p>We plan the phase with your site manager so flooring never holds up a handover or gets damaged by trades working after us: specification agreed in writing up front, plots sequenced to completion dates, dust-controlled grinding, and method statements and risk assessments for your health and safety file.</p></div>
  <div><h2 class="h2">Flake blends buyers choose</h2><ul class="feature-list">${['Grey and white: the most requested on residential plots', 'Blue and grey: cooler, suits modern kitchens and utility spaces', 'Neutral grey: calm tone-on-tone for doubles, gyms and workshops'].map((x) => `<li>${icon('check-circle', 'light')}${x}</li>`).join('')}</ul></div>
</div></section>
${faqBlock(nbFaqs, { title: 'Questions developers ask' })}
${quoteForm({ title: 'Discuss a development' })}`,
});

// ABOUT
add('/about', {
  title: 'About Rhino Coating | Manchester Epoxy Flooring Specialists',
  meta: 'Rhino Coating Ltd is a Manchester epoxy resin flooring specialist, founded in 2025. City & Guilds trained, fully insured, 10-year workmanship warranty.',
  schema: [bizSchema(), crumbs([['Home', '/'], ['About', '/about']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['About', '/about']]), h1: 'Built on preparation, not shortcuts', lede: 'Rhino Coating Ltd is a Manchester epoxy resin flooring specialist, founded in 2025 and based in Middleton. We install garages, workshops and commercial floors across Greater Manchester and nationwide.', image: 'rhino-van', alt: 'Rhino Coating van parked on a customer driveway', ctas: false })}
${trustStrip()}
<section class="sec"><div class="wrap two-col">
  <div><h2 class="h2">What you can expect</h2><p>Most epoxy floors that fail do so because of poor surface preparation. So every Rhino installation begins with diamond grinding, moisture testing and substrate repair, long before any resin is poured, using industrial-grade materials and a documented system.</p></div>
  <ul class="feature-list">${['Proper preparation on every project, no exceptions', 'Industrial-grade epoxy and UV-stable top coats', 'Our own City & Guilds trained and approved team', 'A written 10-year workmanship warranty, subject to terms'].map((x) => `<li>${icon('check-circle', 'light')}${esc(x)}</li>`).join('')}</ul>
</div></section>
${ytFeature()}
${ctaBand()}`,
});

// CONTACT
add('/contact', {
  title: 'Contact Rhino Coating | Epoxy & Resin Flooring Enquiries',
  meta: 'Contact Rhino Coating for epoxy and resin flooring. Get a fixed quote, WhatsApp floor photos, or call our Manchester team on 07822 032335.',
  cur: '/contact',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Contact', '/contact']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Contact', '/contact']]), h1: 'Contact Rhino Coating', lede: 'Tell us about your floor and we will come back with a fixed quotation, a system recommendation and indicative availability.', ctas: false })}
<section class="sec contact-ways"><div class="wrap ways">
  <a href="${tel}" data-track="call" data-loc="contact">${icon('phone', 'light')}<b>Call</b><span>${biz.phone}</span></a>
  <a href="${WA_PHOTOS}" data-track="whatsapp" data-loc="contact" rel="noopener">${icon('whatsapp-logo', 'light')}<b>WhatsApp</b><span>Send floor photos and measurements</span></a>
  <a href="mailto:${biz.email}">${icon('envelope-simple', 'light')}<b>Email</b><span>${biz.email}</span></a>
  <div>${icon('map-pin', 'light')}<b>Office</b><span>${esc(biz.street)}, ${biz.locality}, ${biz.region}, ${biz.postcode}</span></div>
</div><p class="wrap fine">${esc(biz.replyTime)}</p></section>
${quoteForm({ h: 'h2' })}`,
});

// SHOW (event landing page)
add('/show', {
  title: 'Rhino Coating | Request Your Free Floor Quote',
  meta: 'Thanks for visiting Rhino Coating at the show. Leave your details and we will be in touch about your garage, workshop or commercial epoxy floor. No obligation.',
  schema: [bizSchema()],
  body: `
${pageHero({ h1: 'Leave your details for a free floor quote', lede: 'Thanks for stopping by. It takes less than a minute, with no obligation: just a proper conversation about your floor.', ctas: false })}
${quoteForm({ title: 'Your free floor quote' })}`,
});

// LEGAL / GUIDE PAGES (ported verbatim from the live site)
const legalPage = (slug, { title, meta, cur = '', crumb, extra = '' }) => {
  const L = legacy[slug];
  const [h1, ...rest] = L.blocks;
  add('/' + slug, {
    title: title || L.title, meta: meta || L.meta, cur,
    schema: [bizSchema(), crumbs([['Home', '/'], [crumb, '/' + slug]])],
    body: `
${pageHero({ kicker: crumbNav([['Home', '/'], [crumb, '/' + slug]]), h1: esc(h1.x), lede: '', ctas: false })}
${extra}
<section class="sec tight"><div class="wrap prose">${prose(rest)}</div></section>
${ctaBand()}`,
  });
};
legalPage('warranty', { extra: warrantySummary().replace('id="warranty" class="sec warranty"', 'class="sec warranty tight"').replace(/<a class="link-arrow" href="\/warranty">[\s\S]*?<\/a>/, '<p class="fine">The full terms follow below.</p>'), title: '10-Year Workmanship Warranty | Rhino Coating Epoxy Flooring', meta: 'The full terms of Rhino Coating\'s 10-year workmanship warranty on epoxy and resin flooring: what is covered, what is not, and how to make a claim.', crumb: 'Warranty' });
legalPage('floor-preparation', { title: 'Floor Preparation Guide for Epoxy Installation | Rhino Coating', meta: 'How to prepare for your Rhino Coating epoxy installation: clearing the space, what to expect on the day, curing times and caring for your new floor.', crumb: 'Floor preparation' });
legalPage('terms-and-conditions', { crumb: 'Terms & conditions' });
legalPage('complaints', { crumb: 'Complaints' });

// BLOG
const posts = Object.entries(legacy).filter(([k]) => k.startsWith('blog/'));
add('/blog', {
  title: 'Epoxy Flooring Blog & Guides | Rhino Coating',
  meta: 'Epoxy flooring guides from Rhino Coating: cost, epoxy vs polyurethane, DIY risks, preparation, lifespan and colours and finishes.',
  schema: [bizSchema(), crumbs([['Home', '/'], ['Blog', '/blog']])],
  body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Blog', '/blog']]), h1: 'Epoxy flooring blog and guides', lede: 'Straight advice on cost, preparation, lifespan and finishes from the team that installs the floors.', ctas: false })}
<section class="sec"><div class="wrap post-list">${posts.map(([k, v]) => `<a class="post" href="/${k}"><h2 class="h4">${esc(v.blocks[0].x)}</h2><p>${esc(v.meta)}</p><span class="link-arrow">Read the guide ${icon('arrow-right')}</span></a>`).join('')}</div></section>
${ctaBand()}`,
});
for (const [k, v] of posts) {
  const [h1, ...rest] = v.blocks;
  add('/' + k, {
    title: v.title, meta: v.meta,
    schema: [bizSchema(), crumbs([['Home', '/'], ['Blog', '/blog'], [h1.x, '/' + k]]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: h1.x, description: v.meta, author: { '@id': BIZ_ID }, publisher: { '@id': BIZ_ID }, mainEntityOfPage: abs('/' + k) }],
    body: `
${pageHero({ kicker: crumbNav([['Home', '/'], ['Blog', '/blog'], ['Guide', '/' + k]]), h1: esc(h1.x), lede: '', ctas: false })}
<article class="sec tight"><div class="wrap prose">${prose(rest)}</div></article>
${ctaBand('Want a fixed price for your floor?')}`,
  });
}

// CITY PAGES
for (const c of cities) {
  const sys = site.systems.find((s) => s.code === c.emphasis);
  const p = `/epoxy-flooring-${c.slug}`;
  add(p, {
    title: c.title, meta: c.meta,
    schema: [bizSchema(), faqSchema(c.faqs), crumbs([['Home', '/'], [`Epoxy Flooring ${c.name}`, p]]), serviceSchema(sys)],
    body: `
${pageHero({ kicker: crumbNav([['Home', '/'], [`Epoxy flooring ${c.name}`, p]]), h1: esc(c.h1), lede: esc(c.lede), image: c.home ? 'double-garage-flake' : null, alt: 'Double garage with full flake epoxy floor by Rhino Coating' })}
${trustStrip()}
<section class="sec city-intro"><div class="wrap two-col">
  <div class="prose">${c.intro.map((x) => `<p>${esc(x)}</p>`).join('')}<p class="cover-note">${icon('map-trifold', 'light')}<span>${esc(c.coverage)}</span></p></div>
  <dl class="spec-grid one">${c.notes.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
</div></section>
<section class="sec city-sys"><div class="wrap two-col">
  <figure class="sys-media">${img(sys.img, sys.imgAlt, { small: true })}${sys.render ? '<span class="render-note">Render of the finish</span>' : ''}</figure>
  <div><p class="sys-type">Most specified in ${esc(c.region)}</p><h2 class="h2">${esc(sys.name)}: ${esc(sys.type)}</h2><p>${esc(sys.line)}</p>
  <ul class="ticks">${sys.points.map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>
  <a class="link-arrow" href="/#systems">Compare all three systems ${icon('arrow-right')}</a></div>
</div></section>
<section class="sec"><div class="wrap"><h2 class="h2">Areas we cover in ${esc(c.region)}</h2>
  <ul class="town-pills">${c.towns.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
  <p class="fine">Not listed? We install nationwide. Call <a href="${tel}">${biz.phone}</a> to check availability.</p>
</div></section>
${processBlock()}
${faqBlock(c.faqs, { title: `${c.name} questions` })}
${quoteForm({ area: c.name, title: `Request a quote in ${c.name}` })}`,
  });
}

// THANK YOU + 404
add('/thank-you', {
  title: 'Thank you | Rhino Coating', meta: 'Your quote request has reached Rhino Coating.', noindex: true,
  body: `
<section class="sec thanks"><div class="wrap narrow">
  <p class="thanks-ic">${icon('check-circle', 'duotone')}</p>
  <h1 class="h1">Thank you. Your request is in.</h1>
  <p class="lede">${esc(biz.replyTime)}</p>
  <div class="ty-sum" data-ty-summary hidden></div>
  <h2 class="h3">What happens next</h2>
  <ol class="steps steps-v">${[['Survey', 'We look at your photos and arrange a free survey of the slab, its condition and moisture.'], ['Fixed quote', 'You get a written fixed quotation with the system, colour advice and preparation spelled out.'], ['Install date', 'Pick a date. A typical single garage takes 2 to 3 days on site.']].map(([t, d], i) => `<li><span class="step-n">${i + 1}</span><h3 class="h4">${t}</h3><p>${d}</p></li>`).join('')}</ol>
  <div class="ctas"><a class="btn btn-primary" href="${WA_PHOTOS}" data-track="whatsapp" data-loc="thank-you" rel="noopener">${icon('whatsapp-logo')} WhatsApp your photos</a><a class="btn btn-ghost" href="/">Back to the home page</a></div>
</div></section>`,
});

/* ---------- write ---------- */
let sitemap = [];
for (const pg of pages) {
  const html = layout(pg);
  if (/[—–]/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) console.warn('dash found on', pg.p);
  const out = pg.p === '/' ? 'index.html' : pg.p.slice(1) + '.html';
  fs.mkdirSync(path.dirname(path.join(DIST, out)), { recursive: true });
  fs.writeFileSync(path.join(DIST, out), html);
  if (!pg.noindex) sitemap.push(abs(pg.p));
}
fs.writeFileSync(path.join(DIST, '404.html'), layout({ p: '/404', title: 'Page not found | Rhino Coating', meta: 'This page could not be found.', noindex: true, body: `${pageHero({ h1: 'That page has moved or no longer exists', lede: 'Try the home page, or get a fixed quote for your floor.', ctas: false })}${ctaBand()}` }));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), site.noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`Built ${pages.length + 1} pages into dist/`);
