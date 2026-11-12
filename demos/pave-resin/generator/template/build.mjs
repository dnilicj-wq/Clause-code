// node build.mjs <leadDir>  ->  <leadDir>/dist
// Reads <leadDir>/data.json (scraped facts) merged with <leadDir>/site.json (build choices). Nothing here invents facts:
// every claim, review, service and town comes from the lead's data files.
import sharp from 'sharp';
// Signature sections: GENERATED copies of the Clause-code library (./sync-sig.sh), never edit template/sig/ here.
import { render as sigLayer } from './sig/layer-build/render.mjs';
import { render as sigRail } from './sig/step-rail/render.mjs';
import { render as sigBen } from './sig/benefit-illustrations/render.mjs';
import { render as sigProof } from './sig/proof-tiles/render.mjs';
import { render as sigGuar } from './sig/guarantee-stack/render.mjs';
import { render as sigOwner } from './sig/owner-signature/render.mjs';
import { signaturePaths } from './sig/owner-signature/signature-path.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync, readdirSync } from 'fs';
import { dirname, join, extname, basename, resolve } from 'path';

const LEAD = resolve(process.argv[2]);
const T = dirname(new URL(import.meta.url).pathname);
const DIST = join(LEAD, 'dist');
const CACHE = join(LEAD, '.imgcache');
const D = { ...JSON.parse(readFileSync(join(LEAD, 'data.json'), 'utf8')), ...JSON.parse(readFileSync(join(LEAD, 'site.json'), 'utf8')) };
const S = D; // shorthand
// Premium art direction: site.json `theme` sets display/body fonts, light + dark palettes and a body class.
const TH = S.theme || null;
if (TH?.display) S.font = TH.display;
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'img'), { recursive: true });
mkdirSync(join(DIST, 'fonts'), { recursive: true });
mkdirSync(CACHE, { recursive: true });
copyFileSync(join(T, 'inter-var.woff2'), join(DIST, 'fonts/inter-var.woff2'));
if (S.font?.file) copyFileSync(join(LEAD, S.font.file), join(DIST, 'fonts', basename(S.font.file)));
if (TH?.body?.file && TH.body.file !== S.font?.file) copyFileSync(join(LEAD, TH.body.file), join(DIST, 'fonts', basename(TH.body.file)));

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- colour ----------
const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const toHex = (a) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const lum = (h) => { const [r, g, b] = hex(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const P = TH?.p || S.brand.primary;
const PD = TH?.pd ? TH.pd : S.brand.primaryDark && contrast(S.brand.primaryDark, '#ffffff') >= 4.5 ? S.brand.primaryDark : (() => { let c = P; for (let i = 0; i < 20 && contrast(c, '#ffffff') < 4.6; i++) c = mix(c, '#000000', 0.12); return c; })();
const ON = TH?.on || (contrast(P, '#ffffff') >= 3 ? '#ffffff' : '#141414');
const INK = TH?.ink ? TH.ink : S.brand.ink && lum(S.brand.ink) < 0.08 ? S.brand.ink : '#1b1c1f';

// ---------- images ----------
const meta = {};
const SRC = (file) => { const u = join(LEAD, 'assets/up', basename(file, extname(file)) + '.png'); return existsSync(u) ? u : join(LEAD, file); };
async function m(file) {
  if (meta[file]) return meta[file];
  const p = SRC(file);
  if (!existsSync(p)) throw new Error('missing image ' + file);
  const md = await sharp(p).metadata();
  const rot = md.orientation >= 5;
  return (meta[file] = { w: rot ? md.height : md.width, h: rot ? md.width : md.height });
}
const jobs = new Map();
async function variants(file, widths) {
  const { w: W } = await m(file);
  const stem = slug(basename(file, extname(file))).slice(0, 40) + '-' + Buffer.from(file).toString('base64url').slice(-6).toLowerCase() + (SRC(file).includes('/assets/up/') ? 'u' : '');
  let ws = widths.filter((w) => w <= W * 1.05);
  if (!ws.length) ws = [Math.min(widths[0], W)];
  return ws.map((w) => { const n = `${stem}-${w}.webp`; jobs.set(n, { src: SRC(file), w }); return [n, w]; });
}
async function img(file, alt, { sizes = '100vw', widths = [480, 800, 1200], eager = false, cls = '' } = {}) {
  const v = await variants(file, widths), mm = await m(file), w = v[v.length - 1][1];
  return `<img src="/img/${v[Math.min(1, v.length - 1)][0]}" srcset="${v.map(([n, w]) => `/img/${n} ${w}w`).join(', ')}" sizes="${sizes}" width="${w}" height="${Math.round((w * mm.h) / mm.w)}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>`;
}
const srcset = async (file, widths = [480, 800, 1200]) => (await variants(file, widths)).map(([n, w]) => `/img/${n} ${w}w`).join(', ');
const imgUrl = async (file, w = 1200) => '/img/' + (await variants(file, [w]))[0][0];
async function lqip(file) {
  const buf = await sharp(SRC(file)).rotate().resize(24).webp({ quality: 40 }).toBuffer();
  const st = await sharp(SRC(file)).rotate().resize(32).stats();
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
  drive: sv('<path d="M3 10.5L12 4l9 6.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9 20l1-6h4l1 6"/><path d="M10.4 17h3.2"/>'),
  patio: sv('<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 9h18M3 15h18M10 3v6M15 9v6M8 15v6M16 15v6"/>'),
  block: sv('<path d="M3 5h8v4H3zM11 5h10v4H11zM3 9h5v4H3zM8 9h9v4H8zM17 9h4v4h-4zM3 13h8v4H3zM11 13h10v4H11zM3 17h5v3H3zM8 17h9v3H8z"/>', ' stroke-width="1.5"'),
  resin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="8" r="1.1"/><circle cx="11" cy="9.5" r=".9"/><circle cx="15.5" cy="8" r="1.2"/><circle cx="8.5" cy="12.5" r="1"/><circle cx="13" cy="13" r="1.2"/><circle cx="17" cy="12" r=".9"/><circle cx="6.5" cy="16" r="1"/><circle cx="10.5" cy="16.5" r="1.2"/><circle cx="15" cy="16.5" r="1"/></svg>',
  fence: sv('<path d="M4 21V7l2-3 2 3v14M10 21V7l2-3 2 3v14M16 21V7l2-3 2 3v14M2 11h20M2 17h20"/>'),
  garden: sv('<path d="M12 22v-7"/><path d="M12 15c-4 0-6-3-6-6 3 0 6 2 6 6zM12 13c0-4 2-7 6-8 0 4-2 8-6 8z"/><path d="M3 22h18"/>'),
  tarmac: sv('<path d="M5 21L9 3M19 21L15 3M12 5v2.5M12 11v2.5M12 17v2.5"/>'),
  floor: sv('<path d="M2 20l5-8h10l5 8z"/><path d="M7 12V4h10v8"/><path d="M9 16h6"/>'),
  wall: sv('<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7c2 1 6 1 8 0M8 12c3 1 5 1 8-.5M8 17c2 .8 6 .8 8 0"/>'),
  bath: sv('<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M6 12V5a2 2 0 0 1 4 0"/><path d="M7 20l-1 2M17 20l1 2"/>'),
  worktop: sv('<path d="M2 9h20v3H2z"/><path d="M4 12v9M20 12v9M8 12v9h8v-9"/><path d="M14 9V5a2 2 0 0 1 4 0"/>'),
  other: sv('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'),

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

// ---------- inline quote form (5 steps) ----------
function quoteForm() {
  const tiles = S.quoteTiles;
  const sizes = S.quoteSizes || ['Small (under 20m²)', 'Medium (20–50m²)', 'Large (50m²+)', 'Not sure yet'];
  const opts = (k, arr) => `<div class="opts">${arr.map((v) => `<button type="button" data-v="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join('')}</div>`;
  const own = S.ownerFirst || S.owner;
  return `<div class="qcard" id="quote"><form class="qf" novalidate data-owner="${esc(own)}" data-wa="${WA || ''}"${S.formDirect ? ` data-direct="1" data-word="${esc(S.formWord || 'free quote')}" data-done="${esc(S.formDone || '')}"` : ''} aria-label="${esc(S.formLabel || 'Free quote')}">
<div class="qtop"><button type="button" class="qbk" aria-label="Back to previous step">${I.left}Back</button><span class="qstep" aria-live="polite">Step 1 of 5</span><span class="qfree">${esc(S.qfree || 'Free · no obligation')}</span></div>
<div class="qbar" aria-hidden="true"><i></i></div>
<div class="chip" hidden>${I.tick}<span></span></div>
<input type="hidden" name="design">
<div class="qview">
<fieldset class="cur" data-k="service"><legend>What do you need?</legend><div class="tiles">${tiles.map(([v, ic]) => `<button type="button" data-v="${esc(v)}" aria-pressed="false">${I[ic] || I.tick}<span>${esc(v)}</span></button>`).join('')}</div></fieldset>
<fieldset data-k="size"><legend>Roughly how big?</legend><p class="hint">A best guess is fine. ${esc(own)} measures up for free.</p>${opts('size', sizes)}</fieldset>
<fieldset data-k="surface"><legend>${esc(S.q3Title)}</legend>${opts('surface', S.q3Opts)}</fieldset>
<fieldset data-k="postcode"><legend>What's the postcode?</legend><p class="hint">So we can check we cover you.</p><label class="fld"><span class="sr">Postcode</span><input name="postcode" autocomplete="postal-code" autocapitalize="characters" enterkeyhint="next" placeholder="e.g. ${esc(S.postcodeEg || 'TN1 1XP')}"></label><div class="err" data-for="postcode">Please add your postcode (the first part is fine).</div><button type="button" class="btn wide qnext">Next ${I.arrow}</button></fieldset>
<fieldset data-k="contact"><legend>Who should ${esc(own)} call?</legend><div class="sum"></div>
<label class="fld"><span>Your name</span><input name="name" autocomplete="name" enterkeyhint="next"></label><div class="err" data-for="name">Please add your name.</div>
<label class="fld"><span>Phone number</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="send"></label><div class="err" data-for="phone">Please add a phone number we can reach you on.</div>
<label class="hp" aria-hidden="true">Company<input name="company" tabindex="-1" autocomplete="off"></label>
${S.offer ? `<p class="qoffer">${S.offer}</p>` : ''}<button class="btn wide send" type="submit">${esc(S.submitLabel || 'Get my free quote')} ${I.arrow}</button><div class="err" data-for="send">Sorry, that didn't send. Please call <a href="tel:${tel}">${esc(S.phoneDisplay)}</a>.</div>
</fieldset>
</div></form></div>`;
}
const bookDialog = () => (S.bookModal ? `<dialog class="bk" aria-label="${esc(S.formLabel || 'Book a free survey')}"><button type="button" class="bkx" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>${quoteForm()}</dialog>` : '');
const quoteSection = (title = 'Get your free quote') => S.bookModal ? `<section class="sec alt qsec qsec--btn"><div class="wrap"><h2>${esc(title)}</h2><p class="lead">5 quick steps, or call ${esc(S.ownerFirst || S.owner)} on <a href="tel:${tel}">${esc(S.phoneDisplay)}</a>.</p><button type="button" class="btn" data-book>${esc(S.ctaLabel || 'Get a free quote')} ${I.arrow}</button></div></section>` : `<section class="sec alt qsec"><div class="wrap qwrap"><div class="qintro"><span class="eyebrow">Free quote</span><h2>${esc(title)}</h2><p class="lead">5 quick steps, or call ${esc(S.ownerFirst || S.owner)} on <a href="tel:${tel}">${esc(S.phoneDisplay)}</a>.</p></div>${quoteForm()}</div></section>`;

// ---------- configurator ----------
const configurator = () => !S.configurator ? '' : `<section class="sec${TH ? ' alt' : ''} cfgsec" id="design"><div class="wrap"><div class="head"><div><span class="eyebrow">${esc(S.configurator.eyebrow || 'Try it')}</span><h2>${esc(S.configurator.title)}</h2></div><p class="lead">${esc(S.configurator.lead)}</p></div>
<div class="cfg" data-cfg='${esc(JSON.stringify(S.configurator))}'><div class="cfg-stage" style="aspect-ratio:${S.configurator.aspect || '4/3'}"><canvas aria-label="${esc(S.configurator.alt || 'Illustration of your design')}" role="img"></canvas>${cfgPh()}</div><div class="cfg-ui"></div></div>
<p class="note">Illustration: your finished job will be measured and quoted on site.</p></div></section>`;

// ---------- layout ----------
let LOGO_HTML = '', HEROLQ;
const NAV = [['/services/', 'Services'], ['/gallery/', 'Our work'], [S.areaChips ? '/#areas' : '/areas/', 'Areas'], ['/reviews/', 'Reviews']];
const header = (cur) => `<a class="skip" href="#main">Skip to content</a>
<header class="hdr"><div class="wrap">
<a class="logo" href="/" aria-label="${esc(S.name)}, home">${LOGO_HTML}</a>
<nav class="nav" aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${cur === h ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
<a class="tel${S.telPill ? ' tel-pill' : ''}" href="tel:${tel}">${I.phone}${esc(S.phoneDisplay)}</a>
<a class="btn sm" href="#quote" data-quote>${esc(S.ctaShort || 'Free quote')}</a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Menu">${I.menu}</button>
</div>
<nav class="drawer" id="drawer" aria-label="Mobile">${S.menuFull ? `<button class="dx" type="button" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>` : ''}${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}${S.menuFull ? `<div class="dbtns"><a class="dbtn" href="tel:${tel}">Call ${esc(S.phoneDisplay)}</a><a class="dbtn p" href="/#quote" data-quote>${esc(S.ctaLabel || 'Get a free quote')}</a></div>` : `<a href="tel:${tel}">Call ${esc(S.phoneDisplay)}</a>`}</nav>
</header>`;
const bbar = (q = '') => `<nav class="bbar" aria-label="Quick contact"><a href="tel:${tel}">${I.phone}Call</a><a class="wa" href="${waLink(S.waText || `Hi ${S.owner || ''}, I'd like a quote please`)}" target="_blank" rel="noopener">${I.wa}WhatsApp</a><a class="q" href="#quote" data-quote="${esc(q)}">${esc(S.ctaShort || 'Free quote')}</a></nav>`;
const footer = () => `<footer class="ftr"><div class="wrap"><div class="g">
<div><a class="lg" href="/">${LOGO_HTML}</a>
<p>${esc(S.footerLine)}</p>
${S.contacts ? `<ul class="fcon">${S.contacts.map((c) => `<li><span>${esc(c.label)}</span><a href="${esc(c.href)}"${/^https/.test(c.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(c.display)}</a></li>`).join('')}</ul>` : `<p><a href="tel:${tel}"><b>${esc(S.phoneDisplay)}</b></a>${S.email ? `<br><a href="mailto:${S.email}">${esc(S.email)}</a>` : ''}${S.address ? `<br>${esc(S.address)}` : ''}</p>`}
${(S.socials || []).length ? `<p>${S.socials.map((u) => `<a href="${esc(u)}" rel="noopener" target="_blank">${/facebook/.test(u) ? 'Facebook' : /instagram/.test(u) ? 'Instagram' : /checkatrade/.test(u) ? 'Checkatrade' : /tiktok/.test(u) ? 'TikTok' : /linkedin/.test(u) ? 'LinkedIn' : /youtube/.test(u) ? 'YouTube' : /x\.com|twitter/.test(u) ? 'X' : 'Profile'}</a>`).join(' · ')}</p>` : ''}</div>
<div><h3>Services</h3><ul>${SERVICES.map((s) => `<li><a href="/services/${s.slug}/">${esc(s.name)}</a></li>`).join('')}</ul></div>
<div><h3>Areas we cover</h3><ul>${AREAS.slice(0, 14).map((a) => S.areaChips ? `<li>${esc(a.town)}</li>` : `<li><a href="/areas/${a.slug}/">${esc(a.town)}</a></li>`).join('')}</ul></div>
</div>
<div class="bt"><span>© 2026 ${esc(S.legalName || S.name)}</span><span>Demo by Clientgateway</span></div></div></footer>`;

let CSS = readFileSync(join(T, 'styles.css'), 'utf8') + readFileSync(join(T, 'lamp.css'), 'utf8');
CSS += ['sig-runtime/sig-tokens.css', 'sig-runtime/illos.css', 'layer-build/layer-build.css', 'step-rail/step-rail.css', 'benefit-illustrations/benefit-illustrations.css', 'proof-tiles/proof-tiles.css', 'guarantee-stack/guarantee-stack.css', 'owner-signature/owner-signature.css', 'sig-runtime/scenes.css']
  .map((f) => readFileSync(join(T, 'sig', f), 'utf8')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s{2,}/g, ' ')
  + '.sec.alt .sig{--sig-bg:var(--alt)}.card .sig-lb{border-top:0}' + readFileSync(join(T, 'premium.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '');
const SIG = S.sig || {};

// ---------- Lamp CTA finale (mandatory last section before the footer on every page) ----------
// Same component as the master template's lamp-cta (CSS copied into lamp.css by sync-lamp.sh). Dark stage = the
// client's own footer colour so it flows into the footer; accent = their brand colour, lifted until it glows there.
// Copy comes from site.json `lamp` and must only state what the client really offers.
const LAMP = S.lamp || {};
if (!LAMP.heading || !LAMP.cta) throw new Error('site.json lamp.heading and lamp.cta are required (Lamp CTA finale)');
const LBG = LAMP.bg || S.brand.footerBg || '#17181b';
let LA = LAMP.accent || P; for (let i = 0; i < 12 && contrast(LA, LBG) < 3; i++) LA = mix(LA, '#ffffff', 0.18);
const LA2 = LAMP.accent2 || mix(LA, '#ffffff', 0.45);
const MOBILE = /^447\d{9}$/.test(String(S.whatsapp || ''));
function vars() {
  const f = S.font || {};
  const ff = f.family ? `@font-face{font-family:'${f.family}';src:url(/fonts/${basename(f.file)}) format('woff2');font-weight:${f.range || f.weight || 700};font-display:swap}` : '';
  return ff + `:root{--p:${P};--pd:${PD};--on:${ON};--ink:${INK};--mut:#56585e;--bg:#fff;--alt:${S.brand.alt || mix(P, '#ffffff', 0.94)};--tint:${mix(P, '#ffffff', 0.86)};--line:#e3e4e7;--r:${S.radius ?? 10}px;--br:${S.btnRadius ?? 8}px;--hf:${f.family ? `'${f.family}',` : ''}Inter,system-ui,sans-serif;--hw:${f.weight || 700};--ht:${f.transform || 'none'};--hl:${f.spacing || '-.01em'};--hbg:${S.brand.headerBg || '#fff'};--hink:${S.brand.headerInk || INK};--hline:${S.brand.headerBg && lum(S.brand.headerBg) < 0.3 ? 'rgba(255,255,255,.16)' : '#e6e6e9'};--fbg:${S.brand.footerBg || '#17181b'};--lgbg:${S.brand.logoBg || '#fff'};--heroc:${HEROLQ.col};--lqip:url(${HEROLQ.uri});--sig-bg:var(--bg);--sig-surface:#fff;--sig-ink:var(--ink);--sig-muted:var(--mut);--sig-line:var(--line);--sig-accent:${SIG.accent || P};--sig-accent2:${SIG.accent2 || mix(SIG.accent || P, '#ffffff', 0.4)};--sig-accent-ink:var(--on);--sig-serif:var(--hf);--sig-serif-weight:var(--hw);--sig-display:var(--hf);--sig-radius:calc(var(--r) + 4px);--sig-dark:${SIG.dark || S.brand.footerBg || '#17181b'};--sig-dark-ink:#fff}.lamp-cta{--lamp-bg:${LBG};--lamp-accent:${LA};--lamp-accent2:${LA2};--lamp-ink:#fff;--lamp-muted:rgba(255,255,255,.74);--lamp-display:var(--hf);--lamp-hw:var(--hw);--accent:${LA};--accent2:${LA2};--metal0:${mix(LBG, '#000000', 0.35)};--metal2:#ffffff}` + themeVars();
}
function themeVars() {
  const t = TH || {}, b = t.body || {};
  const bf = b.family && b.family !== S.font?.family ? `@font-face{font-family:'${b.family}';src:url(/fonts/${basename(b.file)}) format('woff2');font-weight:${b.range || 400};font-display:swap}` : '';
  const dk = t.dark || S.brand.footerBg || '#17181b', acc = t.accent || P;
  return bf + `:root{--bf:${b.family ? `'${b.family}',` : ''}Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;--card:${t.card || '#fff'};--onpd:${t.onpd || '#fff'};--dk:${dk};--dk2:${t.dark2 || mix(dk, '#ffffff', 0.08)};--dk-ink:${t.darkInk || '#f4f2ee'};--dk-mut:${t.darkMut || 'rgba(244,242,238,.74)'};--dk-acc:${acc};--dk-acc2:${t.accent2 || mix(acc, '#ffffff', 0.4)};--dk-acc-ink:${t.accentInk || '#111'};--dk-glow:${t.glow || acc};--hgrad:${t.heroGrad || 'linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,.2) 40%,rgba(0,0,0,.74) 100%)'};--sig-display-weight:var(--hw);--sig-body:var(--bf);--sig-st-bg:${t.stage || mix(dk, '#000000', 0.25)};--sig-st-bg2:${t.stage2 || mix(dk, '#ffffff', 0.12)};--sig-st-glow:${t.stageGlow || acc};${t.vars || ''}}`;
}
const BIZ = () => ({
  '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', name: S.name, url: S.url + '/', telephone: tel, ...(S.email ? { email: S.email } : {}),
  address: { '@type': 'PostalAddress', ...(S.street ? { streetAddress: S.street } : {}), addressLocality: S.town, ...(S.county ? { addressRegion: S.county } : {}), addressCountry: 'GB' },
  areaServed: AREAS.map((a) => ({ '@type': 'City', name: a.town })), sameAs: S.socials || [],
  ...(G.rating && G.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: G.rating, reviewCount: G.count } } : {}),
});
function cfgPh() { // the real photo shows at once (cropped exactly as the live render), then the live surface fades in over it
  const P = S.configurator?.photo; if (!P) return '<span class="cfg-load" aria-hidden="true"></span>';
  const [x, y, w, h] = P.crop, pc = (v) => +(v * 100).toFixed(3) + '%';
  return `<span class="cfg-load cfg-ph" aria-hidden="true"><img src="/cfg-photo.webp" alt="" loading="lazy" decoding="async" width="${P.w}" height="${P.h}" style="position:absolute;max-width:none;height:auto;width:${pc(P.w / w)};left:${pc(-x / w)};top:${pc(-y / h)}"></span>`;
}
async function page({ path, title, desc, body, cur, preload = '', quoteFor = '', ld = [] }) {
  body = body.replace(/<image href="(\/[^"]+)"/g, '<image data-lzh="$1"'); // below-fold SVG textures load when near (app.js)
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${S.url + path}"><meta name="robots" content="noindex">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${S.url}${await imgUrl(S.hero.img, 1200)}">
<meta name="theme-color" content="${S.brand.headerBg || '#ffffff'}"><link rel="icon" href="${S.favicon || '/img/' + LOGO_FILE}">
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>${S.font?.file ? `<link rel="preload" href="/fonts/${basename(S.font.file)}" as="font" type="font/woff2" crossorigin>` : ''}${preload}
<style>${vars()}${CSS}</style>
<script type="application/ld+json">${JSON.stringify([BIZ(), ...ld])}</script>
</head><body${TH?.name ? ` class="t-${TH.name}"` : ''}${S.motion ? ' data-motion="1"' : ''}>${header(cur)}<main id="main">${body}${lampCta()}</main>${footer()}${bbar(quoteFor)}${bookDialog()}<script src="/app.js?v=${BUILD}" defer></script></body></html>`;
  const out = join(DIST, path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html.replace(/\n/g, '').replace(S.bookModal ? /href="\/?#quote"/g : /$^/, `href="tel:${tel}" role="button" data-book`).replace(TH ? /<span class="eyebrow">[\s\S]*?<\/span>/g : /$^/, ''));
  PAGES.push(path);
}
const BUILD = Date.now().toString(36);

// ---------- sections ----------
const lampCta = () => `<section class="lamp-cta" data-lamp aria-label="${esc(LAMP.cta)}"><div class="lamp-cta__stage" aria-hidden="true"><div class="lamp-cta__cone lamp-cta__cone--l"><i class="b"></i><i class="s"></i></div><div class="lamp-cta__cone lamp-cta__cone--r"><i class="s"></i><i class="b"></i></div><div class="lamp-cta__fade"></div><div class="lamp-cta__frost"></div><div class="lamp-cta__glow"></div><div class="lamp-cta__glow2"></div><div class="lamp-cta__bar"></div><div class="lamp-cta__cap"></div></div>
<div class="lamp-cta__body"><h2 class="lamp-cta__h">${esc(LAMP.heading)}</h2>${LAMP.sub ? `<p class="lamp-cta__sub">${esc(LAMP.sub)}</p>` : ''}<div class="lamp-cta__ctas"><a class="glint-btn" href="#quote" data-quote>${esc(LAMP.cta)} <span aria-hidden="true">→</span></a>${LAMP.call ? `<a class="lamp-cta__alt" href="tel:${tel}">Call ${esc(S.phoneDisplay)}</a>` : ''}${MOBILE ? `<a class="lamp-cta__alt" href="${waLink(LAMP.waText || `Hi ${S.ownerFirst || S.owner || ''}, I'd like a quote please`)}" target="_blank" rel="noopener">WhatsApp</a>` : `<a class="lamp-cta__alt" href="tel:${tel}">Call</a>`}</div></div></section>`;
const crumbs = (items) => `<nav class="crumbs wrap" aria-label="Breadcrumb"><a href="/">Home</a>${items.map(([h, t]) => ` › ${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}`).join('')}</nav>`;
const gchip = () => (G.rating ? `<a class="gchip" href="/reviews/">${I.g}<span><b>${RT(G.rating)}</b> <span class="st">${stars(G.rating)}</span> ${G.count ? `${G.count} Google reviews` : 'on Google'}</span></a>` : '');
const rvCard = (r) => `<figure class="rv"><div class="stars" aria-label="${r.stars || 5} out of 5">${stars(r.stars)}</div><blockquote class="tx">${esc(r.text)}</blockquote><button class="rm" type="button" hidden>Read more</button><figcaption class="who"><b>${esc(r.author)}</b><span>${esc(S.reviewLabel || 'Google')}${r.when ? ' · ' + esc(r.when) : ''}</span></figcaption></figure>`;
const rvSum = () => (G.rating ? `<a class="rv-sum" href="${esc(G.url || '#')}" target="_blank" rel="noopener">${I.g}<span><b>${RT(G.rating)}</b> <span class="st">${stars(G.rating)}</span><small>${G.count ? `from ${G.count} reviews on Google` : 'on Google'}</small></span></a>` : '');
function reviewsRail(list = REVIEWS, title = 'What customers say', eyebrow = 'Google reviews') {
  if (!list.length) return '';
  return `<section class="sec alt" id="reviews"><div class="wrap"><div class="head"><div><span class="eyebrow">${eyebrow}</span><h2>${esc(title)}</h2></div><div class="rail-nav"><button type="button" data-rail="-1" aria-label="Previous reviews">${I.left}</button><button type="button" data-rail="1" aria-label="Next reviews">${I.right}</button></div></div>
${rvSum()}<div class="rail">${list.map(rvCard).join('')}</div>${REVIEWS.length > list.length || list === REVIEWS ? `<p><a class="btn line" href="/reviews/">Read all ${REVIEWS.length} reviews ${I.arrow}</a></p>` : ''}</div></section>`;
}
function reviewsFeature() {
  if (!REVIEWS.length) return '';
  const fi = S.featuredReview ?? REVIEWS.findIndex((r) => r.text.length > 110 && r.text.length < 340);
  const f = REVIEWS[Math.max(0, fi)], rest = REVIEWS.filter((r) => r !== f).slice(0, 10);
  const cards = (h) => rest.map((r) => rvCard(r).replace('<button class="rm" type="button" hidden>Read more</button>', '').replace('<figure class="rv"', h ? '<figure class="rv" aria-hidden="true"' : '<figure class="rv"')).join('');
  return `<section class="sec" id="reviews"><div class="wrap"><figure class="rv-feat"><div><div class="stars" aria-label="${f.stars || 5} out of 5">${stars(f.stars)}</div><blockquote>${esc(f.text.trim())}</blockquote><figcaption><b>${esc(f.author)}</b>, Google review</figcaption></div>${rvSum()}</figure>
${rest.length ? `<div class="mq"><div class="mq-t">${cards(false)}${cards(true)}</div></div>` : ''}<p style="margin-top:26px"><a class="btn line" href="/reviews/">Read all ${REVIEWS.length} reviews ${I.arrow}</a></p></div></section>`;
}
async function baSection() {
  const pairs = S.pairs || [];
  if (!pairs.length) return '';
  const P2 = await Promise.all(pairs.map(async (p) => ({ a: await srcset(p.after, [640, 1080, 1600]), b: await srcset(p.before, [640, 1080, 1600]), cap: p.caption || p.label })));
  const p0 = pairs[0];
  return `<section class="sec" id="before-after"><div class="wrap"><div class="head"><div><span class="eyebrow">Before &amp; after</span><h2>${esc(S.baTitle || 'See the difference')}</h2></div><p class="lead">Drag the slider. Real ${esc(S.name)} jobs, before and after.</p></div>
${pairs.length > 1 ? `<div class="ba-tabs" role="tablist">${pairs.map((p, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(p.label)}</button>`).join('')}</div>` : ''}
<div class="ba" data-pairs='${esc(JSON.stringify(P2))}' aria-label="Before and after comparison">
${(await img(p0.after, 'After: ' + p0.label, { sizes: '(min-width:1000px) 1000px, 100vw', widths: [640, 1080, 1600] })).replace('<img ', '<img class="af" ')}
${(await img(p0.before, 'Before: ' + p0.label, { sizes: '(min-width:1000px) 1000px, 100vw', widths: [640, 1080, 1600] })).replace('<img ', '<img class="bf" ')}
<span class="lbl l1">Before</span><span class="lbl l2">After</span><span class="bar"><span class="knob">${I.lr}</span></span>
<input type="range" min="0" max="100" value="50" aria-label="Slide to compare before and after"></div>
<p class="ba-cap">${esc(p0.caption || p0.label)}</p></div></section>`;
}
async function galleryFiltered(items) {
  const cats = [...new Set(items.map((g) => g.cat).filter(Boolean))];
  const fig = async (g, i) => { const big = g.size === 'big', tall = g.size === 'tall'; return `<figure class="gi${big ? ' gb' : ''}${tall ? ' gt' : ''}" data-cat="${esc(g.cat || '')}"><button type="button" class="gzoom" data-full="${await imgUrl(g.img, (await m(g.img)).w >= 1200 ? 1200 : (await m(g.img)).w)}" aria-label="View larger: ${esc(g.caption || '')}">${await img(g.img, g.caption || S.name, { sizes: big ? '(min-width:900px) 50vw, 100vw' : '(min-width:900px) 25vw, 50vw', widths: big ? [600, 1000] : [400, 700] })}</button>${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`; };
  return `<div class="gchips" role="group" aria-label="Filter photos"><button type="button" aria-pressed="true" data-f="">All</button>${cats.map((c) => `<button type="button" aria-pressed="false" data-f="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="egal">${(await Promise.all(items.map(fig))).join('')}</div><dialog class="lbox" aria-label="Photo"><button type="button" class="lbx" aria-label="Close">×</button><img alt=""><p></p></dialog>`;
}
const casesSec = async () => !S.cases?.length ? '' : `<section class="sec dk cases" id="case-studies"><div class="wrap"><div class="head"><div><h2>${esc(S.casesTitle || 'Recent jobs')}</h2></div><p class="lead">${esc(S.casesLead || '')}</p></div><div class="cgrid">${(await Promise.all(S.cases.map(async (c) => `<article class="case"><div class="cph">${await img(c.img, c.alt || c.title, { sizes: '(min-width:900px) 50vw, 100vw', widths: [600, 1000, 1200] })}</div><div class="cbd"><span class="cloc">${esc(c.where)}</span><h3>${esc(c.title)}</h3><ul class="cfacts">${c.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>${c.text ? `<p>${esc(c.text)}</p>` : ''}</div></article>`))).join('')}</div></div></section>`;
async function galleryGrid(items, { big = true } = {}) {
  return `<div class="gal">${(await Promise.all(items.map(async (g, i) => `<figure${big && i === 0 ? ' class="big"' : ''}>${await img(g.img, g.caption || g.service || S.name, { sizes: big && i === 0 ? '(min-width:1180px) 1130px, 100vw' : '(min-width:760px) 33vw, 50vw', widths: big && i === 0 ? [480, 800, 1200] : [360, 600] })}${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`))).join('')}</div>`;
}
async function serviceCards(list = SERVICES) {
  return `<div class="cards${S.svcSwipe ? ' cards--swipe' : ''}">${(await Promise.all(list.map(async (s) => `<a class="card${s.noPhotoCard ? ' nophoto' : ''}" href="/services/${s.slug}/">${s.noPhotoCard ? '' : `<div class="ph">${await img(s.imgs[0], s.name, { sizes: '(min-width:980px) 33vw, (min-width:620px) 50vw, 100vw', widths: [400, 700] })}</div>`}${s.build ? sigLayer({ ...s.build, id: 'lb-' + s.slug }) : ''}<div class="bd"><h3>${esc(s.name)}</h3><p>${esc(s.cardLine || (s.copy || '').split(/(?<=\.)\s/)[0])}</p><span class="go">See ${esc((s.short || s.name).toLowerCase())} ${I.arrow}</span></div></a>`))).join('')}</div>`;
}
const areaLinks = (except) => S.areaChips ? `<ul class="areas achips">${AREAS.map((a) => `<li${a.recent ? ' class="recent"' : ''}>${esc(a.town)}${a.recent ? `<small>${esc(a.recent)}</small>` : ''}</li>`).join('')}</ul>` : `<ul class="areas">${AREAS.filter((a) => a.slug !== except).map((a) => `<li><a href="/areas/${a.slug}/">${esc(a.town)}${I.pin}</a></li>`).join('')}</ul>`;
const band = (q = '') => quoteSection(S.bandTitle || 'Get your free, no-obligation quote');
const band0 = (q = '') => `<section class="band"><div class="wrap"><div><h2>${esc(S.bandTitle || 'Get your free, no-obligation quote')}</h2><p>5 quick steps, or call ${esc(S.owner || 'us')} on ${esc(S.phoneDisplay)}.</p></div><div class="ctas"><a class="btn" href="#quote" data-quote="${esc(q)}">Book a free quote ${I.arrow}</a><a class="btn alt" href="tel:${tel}">${I.phone}Call now</a></div></div></section>`;
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

if (S.brand.logoInline) LOGO_HTML = readFileSync(join(LEAD, S.brand.logoInline), 'utf8').trim();
if (S.faviconFile) copyFileSync(join(LEAD, S.faviconFile), join(DIST, basename(S.faviconFile)));
// ---------- signature sections (from the library; content + sources in site.json `sig`) ----------
const DK = TH ? 'sec dk' : 'sec alt';
const benefitsSec = () => (SIG.benefits ? `<section class="${DK}" id="benefits"><div class="wrap">${sigBen(SIG.benefits)}</div></section>` : '');
const proofSec = () => (SIG.proof ? `<section class="${DK}" id="proof"><div class="wrap">${sigProof(SIG.proof)}</div></section>` : '');
const railSec = () => (SIG.rail ? `<section class="${TH ? 'sec dk' : 'sec'}" id="how"><div class="wrap">${sigRail(SIG.rail)}</div></section>` : '');
const guarSec = () => { const h = SIG.guarantee ? sigGuar(SIG.guarantee) : ''; return h ? `<section class="${TH ? 'sec dk' : 'sec'}" id="promises"><div class="wrap">${h}</div></section>` : ''; };
const ownerSig = () => (SIG.owner ? sigOwner({ ...SIG.owner, sig: signaturePaths(SIG.owner.name, SIG.owner.font || 'caveat') }) : '');

// HOME
{
  const hs = await srcset(S.hero.img, [1080, 1920, 2560]);
  const hm = await m(S.hero.img);
  const ms = S.hero.mobileImg ? await srcset(S.hero.mobileImg, S.hero.mobileWidths || [1080, 1920]) : '';
  const heroImg = `<picture>${ms ? `<source media="(max-width:759px)" srcset="${ms}" sizes="100vw">` : ''}<img src="${(await imgUrl(S.hero.img, 1920))}" srcset="${hs}" sizes="100vw" width="1920" height="${Math.round((1920 * hm.h) / hm.w)}" alt="${esc(S.hero.alt || S.hero.what || S.name)}" fetchpriority="high" decoding="async"></picture>`;
  const trust = (S.trust || []).map(([ic, b, t]) => `<li><span class="ic">${I[ic] || I.tick}</span><span><b>${esc(b)}</b>${esc(t)}</span></li>`).join('');
  const HP = S.heroPicker;
  const hpTiles = HP ? HP.surfaces.map((x, i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-s="${esc(x.key)}" data-tile="${esc(x.tile)}" data-cfg="${esc(x.cfg || '')}" data-label="${esc(x.label)}"><i class="hp-sw hp-sw--${esc(x.key)}${HP.swatch ? ' on' : ''}"${HP.swatch ? ` style="background-image:url(/sw-${esc(x.key)}.webp)"` : ''} aria-hidden="true"></i><span>${esc(x.short || x.label)}</span></button>`).join('') : '';
  const heroPicker = HP ? `<section class="hero hpk" id="top" aria-label="Choose your new surface"><div class="hp-stage" aria-hidden="true">${HP.gl ? `<picture class="hp-poster"><source media="(prefers-reduced-motion: reduce) and (max-width: 899px)" srcset="/posters/hero-m-done.webp"><source media="(prefers-reduced-motion: reduce)" srcset="/posters/hero-d-done.webp"><source media="(max-width: 899px)" srcset="/posters/hero-m.webp"><img src="/posters/hero-d.webp" alt="" width="1440" height="820" fetchpriority="high" decoding="async"></picture><canvas class="hp-gl"></canvas>` : '<div class="hp-plane"><div class="hp-move"><canvas class="hp-a"></canvas><canvas class="hp-b"></canvas></div></div><i class="hp-sweep"></i>'}<i class="hp-lamp"></i><i class="hp-shade"></i></div>
${HP.gl ? '' : '<span class="hp-tag">Live illustration</span>'}${S.offer ? `<p class="hoffer">${S.offer}</p>` : ''}
<div class="wrap hp-in"><div class="hp-copy"><a class="hp-rate" href="${esc(G.url || '/reviews/')}" target="_blank" rel="noopener"><span class="st" aria-hidden="true">★★★★★</span> ${RT(G.rating)} <span>· ${G.count} Google reviews</span></a>
<h1>${HP.h1.map((l, i) => `<span${i ? ' class="hp-em"' : ''}>${esc(l)}</span>`).join(' ')}</h1>${HP.noSub ? '' : `<p class="sub">${esc(HP.sub || S.heroSub)}</p>`}</div>
<div class="hp-side"><div class="hp-card" data-nopour><div class="hp-row"><p class="hp-k">Choose your surface</p><p class="hp-v" aria-live="polite">${esc(HP.surfaces[0].label)}</p></div><div class="hp-tiles" role="radiogroup" aria-label="New surface">${hpTiles}</div>
<button type="button" class="btn wide hp-go" data-book>${esc(HP.cta || 'Design it & book')} ${I.arrow}</button><a class="hp-see" href="#design">or see it on a real drive ↓</a></div></div></div></section>` : '';
  const body = `
${HP ? heroPicker : `<section class="hero" style="--hpos:${S.hero.pos || 'center'};--hposm:${S.hero.posM || S.hero.pos || 'center'}${ms ? `;--lqipm:url(${(await lqip(S.hero.mobileImg)).uri})` : ''}"><div class="hbg">${heroImg}${S.hero.tag ? `<span class="tag">${esc(S.hero.tag)}</span>` : ''}</div><div class="wrap hgrid"><div class="hcopy">
${gchip()}<h1>${S.heroHeadlineHtml || esc(S.heroHeadline)}</h1><p class="sub">${esc(S.heroSub)}</p>
<div class="ctas"><a class="btn" href="#quote" data-quote>${esc(S.ctaLabel || 'Get a free quote')} ${I.arrow}</a><a class="btn ghost" href="${waLink(S.waText || `Hi ${S.ownerFirst || S.owner || ''}, I'd like a quote please`)}" target="_blank" rel="noopener"><span class="wa-i">${I.wa}</span>WhatsApp ${esc(S.ownerFirst || S.owner || 'us')}</a></div>${S.heroProof ? `<p class="hproof">${S.heroProof}</p>` : ''}${S.offer ? `<p class="hoffer">${S.offer}</p>` : ''}</div>${quoteForm()}</div></section>`}
${TH && S.statLine ? `<section class="stat"><div class="wrap"><p>${G.rating ? `<span class="st" aria-hidden="true">★★★★★</span>` : ''}${S.statLine}</p></div></section>` : trust ? `<section class="trust"><div class="wrap"><ul>${trust}</ul></div></section>` : ''}
<section class="sec" id="services"><div class="wrap"><div class="head"><div><span class="eyebrow">What we do</span><h2>${esc(S.servicesTitle || 'Our services')}</h2></div><p class="lead">${esc(S.servicesLead || '')}</p></div>${await serviceCards()}</div></section>
${configurator()}
${benefitsSec()}
${await baSection()}
${proofSec()}
${TH ? reviewsFeature() : S.sig ? reviewsRail(REVIEWS.slice(0, 9)).replace('class="sec alt" id="reviews"', 'class="sec" id="reviews"') : reviewsRail(REVIEWS.slice(0, 9))}
<section class="sec${S.sig ? ' alt' : ''}" id="work"><div class="wrap"><div class="head"><div><span class="eyebrow">Our work</span><h2>${esc(S.galleryTitle || 'Recent jobs')}</h2></div><a class="btn line" href="/gallery/">See all our work ${I.arrow}</a></div>${S.galleryFilters ? await galleryFiltered(S.gallery) : await galleryGrid((S.gallery || []).slice(0, 7))}</div></section>
${await casesSec()}
${railSec()}
${S.intro ? `<section class="sec${TH ? '' : ' alt'}"><div class="wrap about"><div class="ph">${await img(S.aboutImg || S.gallery[1]?.img || S.hero.img, S.name, { sizes: '(min-width:900px) 50vw, 100vw', widths: [480, 800] })}</div><div><span class="eyebrow">About ${esc(S.name)}</span><h2>${esc(S.aboutTitle || 'Who we are')}</h2><div class="prose" style="margin-top:14px">${S.intro.split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join('')}</div>${S.why?.length && !SIG.dropWhy ? `<ul class="ticks">${S.why.map((w) => `<li>${I.tick}<span>${esc(w)}</span></li>`).join('')}</ul>` : ''}<a class="btn" href="#quote" data-quote>Get a free quote ${I.arrow}</a>${ownerSig()}</div></div></section>` : ''}
${guarSec()}
<section class="sec${guarSec() || TH ? ' alt' : ''}" id="areas"><div class="wrap"><div class="head"><div><span class="eyebrow">Areas we cover</span><h2>${esc(S.areasTitle || 'Local to you')}</h2></div><p class="lead">${esc(S.areasLead || '')}</p></div>${areaLinks()}</div></section>
${faq()}`;
  await page({ path: '/', title: S.homeTitle, desc: S.homeDesc, body, preload: HP?.gl ? `<link rel="preload" as="image" media="(max-width:899px)" href="/posters/hero-m.webp" fetchpriority="high"><link rel="preload" as="image" media="(min-width:900px)" href="/posters/hero-d.webp" fetchpriority="high">` : ms ? `<link rel="preload" as="image" media="(max-width:759px)" imagesrcset="${ms}" imagesizes="100vw" fetchpriority="high"><link rel="preload" as="image" media="(min-width:760px)" imagesrcset="${hs}" imagesizes="100vw" fetchpriority="high">` : `<link rel="preload" as="image" imagesrcset="${hs}" imagesizes="100vw" fetchpriority="high">`, ld: ld_faq() });
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
<section class="sec"><div class="wrap"><div class="head"><div><span class="eyebrow">Areas</span><h2>${esc(S.areaChips ? 'Areas we cover' : s.name + ' near you')}</h2></div></div>${areaLinks()}</div></section>${band(s.short || s.name)}`;
  await page({ path: `/services/${s.slug}/`, cur: '/services/', title: `${s.title || s.name} | ${S.name}`, desc: (s.copy || '').slice(0, 155), body, quoteFor: s.short || s.name });
}

// AREAS
if (!S.areaChips) await page({ path: '/areas/', cur: '/areas/', title: `Areas we cover | ${S.name}`, desc: `${S.name} covers ${AREAS.map((a) => a.town).join(', ')}.`, body: `${crumbs([[null, 'Areas']])}<section class="sec" style="padding-top:20px"><div class="wrap"><div class="head"><div><span class="eyebrow">Areas we cover</span><h1>${esc(S.areasTitle || 'Areas we cover')}</h1></div><p class="lead">${esc(S.areasLead || '')}</p></div>${areaLinks()}</div></section>${band()}` });
let ai = 0;
for (const a of (S.areaChips ? [] : AREAS)) {
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
if (S.heroPicker) {
  const gen = readFileSync(join(T, 'surface-gen.js'), 'utf8');
  writeFileSync(join(DIST, 'surface-worker.js'), gen + `\nonmessage = (e) => { const { id, kind, w, h, m, seed } = e.data; const d = genSurface(kind, w, h, m, { seed }); if (typeof OffscreenCanvas !== 'undefined') { const c = new OffscreenCanvas(w, h); c.getContext('2d').putImageData(new ImageData(d, w, h), 0, 0); c.convertToBlob({ type: 'image/webp', quality: 0.92 }).then((blob) => postMessage({ id, w, h, blob }), () => postMessage({ id, w, h, d }, [d.buffer])); } else postMessage({ id, w, h, d }, [d.buffer]); };\n`);
  const genSurface = new Function(gen + ';return genSurface')();
  const RW = 640, RH = 300, rd = genSurface('resin', RW, RH, 0.5, { seed: 5 });
  await sharp(Buffer.from(rd.buffer), { raw: { width: RW, height: RH, channels: 4 } }).webp({ quality: 72 }).toFile(join(DIST, 'resin-agg.webp'));
}
if (S.heroPicker?.gl) {
  const { build: esb } = await import(join(T, 'node_modules/esbuild/lib/main.js'));
  await esb({ entryPoints: [join(T, 'hero3d/engine.js')], bundle: true, format: 'esm', minify: true, target: 'es2020', outfile: join(DIST, 'hero3d.js'), logLevel: 'error' });
  writeFileSync(join(DIST, 'hero3d-tex.js'), readFileSync(join(T, 'hero3d/tile-gen.js'), 'utf8') + `\nonmessage = (e) => { const { id, kind, N, P } = e.data; const d = genTile(kind, N, P); postMessage({ id, alb: d.alb, nrm: d.nrm, tile: d.tile }, [d.alb.buffer, d.nrm.buffer]); };\n`);
  mkdirSync(join(DIST, 'tex'), { recursive: true });
  for (const f of readdirSync(join(T, 'hero3d/tex'))) copyFileSync(join(T, 'hero3d/tex', f), join(DIST, 'tex', f));
  mkdirSync(join(DIST, 'posters'), { recursive: true });
  const PD = join(LEAD, 'assets/posters');
  if (existsSync(PD)) for (const f of readdirSync(PD)) copyFileSync(join(PD, f), join(DIST, 'posters', f));
}
if (S.heroPicker?.swatch) { // exactly the swatches the live hero cut from its own renders (1536 px wide, seed 7)
  const gen = readFileSync(join(T, 'surface-gen.js'), 'utf8'), genSurface = new Function(gen + ';return genSurface')();
  const M = { resin: 2.6, tarmac: 4, block: 7.5, porcelain: 10 }, Q = { resin: 0.07, tarmac: 0.1, block: 0.22, porcelain: 0.4 }, CD = join(LEAD, '.cache');
  mkdirSync(CD, { recursive: true });
  for (const k of Object.keys(M)) {
    const out = join(CD, `sw-${k}.webp`);
    if (!existsSync(out)) {
      const TW = 1536, TH = 2304, d = genSurface(k, TW, TH, M[k], { seed: 7 });
      const w = Math.round(TW * Q[k]), h = Math.round(TW * Q[k] * 64 / 120);
      await sharp(Buffer.from(d.buffer), { raw: { width: TW, height: TH, channels: 4 } }).extract({ left: Math.round(TW * 0.4), top: Math.round(TH * 0.7), width: w, height: h }).resize(120, 64).webp({ quality: 85 }).toFile(out);
    }
    copyFileSync(out, join(DIST, `sw-${k}.webp`));
  }
}
writeFileSync(join(DIST, 'app.js'), readFileSync(join(T, 'app.js'), 'utf8') + `\n;(() => {\n${readFileSync(join(T, 'sig/sig-runtime/sig-runtime.js'), 'utf8').replace(/^export /m, '')}\ninitSig();\n})();\n`);
copyFileSync(join(T, 'cfg.js'), join(DIST, 'cfg.js'));
if (S.configurator?.photo?.file) await sharp(join(LEAD, S.configurator.photo.file)).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 86 }).toFile(join(DIST, 'cfg-photo.webp'));
if (S.motion) copyFileSync(join(T, 'node_modules/lenis/dist/lenis.min.js'), join(DIST, 'lenis.min.js'));

// images
let n = 0;
await Promise.all([...jobs].map(async ([name, j]) => {
  const c = join(CACHE, name);
  if (!existsSync(c)) { await sharp(j.src).rotate().resize({ width: j.w, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(c); n++; }
  copyFileSync(c, join(DIST, 'img', name));
}));
console.log(`built ${PAGES.length} pages, ${jobs.size} images (${n} new) -> ${DIST}`);

// ---------- quality gate: no placeholder text may ship ----------
{
  const { readdirSync, statSync } = await import('fs');
  const bad = [];
  const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(html|js)$/.test(f)) { const t = readFileSync(p, 'utf8'); const m = t.match(/\[CONFIRM|\bTODO\b|\bTBC\b|lorem ipsum|\{\{/i); if (m) bad.push(`${p.slice(DIST.length)}: "${t.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ')}"`); } });
  walk(DIST);
  if (bad.length) { console.error('PLACEHOLDER GATE FAILED:\n' + bad.join('\n')); process.exit(1); }
}
