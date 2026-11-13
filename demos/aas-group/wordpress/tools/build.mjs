// Builds the WordPress deliverables from the demo source (run from demos/aas-group: node wordpress/tools/build.mjs)
//   wordpress/aas-landing-assets.zip   plugin: PHP + scoped CSS + page script + fonts/film/textures
//   wordpress/aas-outdoor-landing.json Elementor template (native widgets for content, HTML widgets for the locked code parts)
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import postcss from 'postcss';

const ROOT = process.cwd();
const WP = path.join(ROOT, 'wordpress');
const OUT = path.join(WP, '.build');
const PLUG = path.join(OUT, 'aas-landing-assets');
const ASSETS = path.join(PLUG, 'assets');
const DEMO = 'https://clientgateway-aas-group.dnilicj.workers.dev'; // photos are downloaded from here into the Media Library on import
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ---------------------------------------------------------------- 1. script + stylesheet
fs.rmSync(OUT, { recursive: true, force: true });
execSync('npx vite build -c vite.wp.config.ts --logLevel warn', { stdio: 'inherit' });
fs.mkdirSync(path.join(ASSETS, 'js'), { recursive: true });
const entry = fs.readdirSync(path.join(OUT, 'js')).find((f) => /^aas-[\w-]{8,}\.js$/.test(f) && fs.readFileSync(path.join(OUT, 'js', f), 'utf8').includes('AAS_CFG'));
if (!entry) throw new Error('entry chunk not found');
fs.mkdirSync(PLUG, { recursive: true });
fs.writeFileSync(path.join(PLUG, 'entry.php'), `<?php return '${entry}';\n`);
for (const f of fs.readdirSync(path.join(OUT, 'js'))) {
  if (f.endsWith('.js')) fs.copyFileSync(path.join(OUT, 'js', f), path.join(ASSETS, 'js', f));
}

const FONT = { Fraunces: "'AAS Fraunces'", Geist: "'AAS Geist'", "'Instrument Serif'": "'AAS Instrument Serif'" };
const COLORS = { limestone: 'aaslime', paper: 'aaspaper', moss: 'aasmoss', stone: 'aasstone', ink: 'aasink', clay: 'aasclay', sage: 'aassage', red: 'aasred' };

// scope every rule to body.aas-landing so nothing leaks onto the rest of his site
function scopeSel(sel) {
  sel = sel.trim();
  const B = 'body.aas-landing.aas-landing';
  if (sel === ':root') return B;
  if (sel === 'html') return `html:has(>${B})`;
  if (sel === 'html.lenis') return `html.lenis:has(>${B})`;
  if (sel === 'html.lenis body') return `html.lenis ${B}`;
  if (sel === '.lenis.lenis-smooth') return `html.lenis.lenis-smooth:has(>${B})`;
  if (sel === 'body') return B;
  if (sel.startsWith('body::') || sel.startsWith('body:')) return B + sel.slice(4);
  if (sel.startsWith('body ')) return B + sel.slice(4);
  if (sel.startsWith('.js ')) return `html.js ${B} ` + sel.slice(4);
  if (sel.startsWith('.seen ')) return `html.seen ${B} ` + sel.slice(6);
  if (sel.startsWith('.elementor-editor-active ')) return `${B}.elementor-editor-active ` + sel.slice(25);
  return `${B} ${sel}`;
}
// the demo's <a class="btn btn--primary"> becomes Elementor's button: wrapper .b-btn.b-btn--primary > a.elementor-button
function btnVariant(sel) {
  const parts = sel.split(/(\s*[>+~]\s*|\s+)/);
  let hit = false;
  const out = parts.map((p) => {
    if (!p.trim() || /^\s*[>+~]\s*$/.test(p)) return p;
    if (!/\.btn(?![\w-])|\.btn--/.test(p)) return p;
    hit = true;
    const m = p.match(/^([^:]*)(:.*)?$/);
    const cls = m[1].replace(/\.btn(?![\w-])/g, '.b-btn').replace(/\.btn--/g, '.b-btn--');
    return `.elementor-widget-button${cls} .elementor-button${m[2] || ''}`;
  });
  return hit ? out.join('') : null;
}
function processCss(css, { btn = false, base = '' } = {}) {
  const root = postcss.parse(css);
  const kf = new Set();
  root.walkAtRules('keyframes', (a) => { kf.add(a.params); a.params = 'aas-' + a.params; });
  root.walkRules((r) => {
    if (r.parent && r.parent.type === 'atrule' && /keyframes/.test(r.parent.name)) return;
    let sels = r.selectors;
    // in the Elementor editor the page script doesn't run, so show the top bar in its solid (readable) state
    sels = sels.flatMap((s) => (s.includes('.nav.is-solid') ? [s, '.elementor-editor-active ' + s.replace('.nav.is-solid', '.nav')] : [s]));
    if (btn) sels = sels.flatMap((s) => { const v = btnVariant(s); return v ? [s, v] : [s]; });
    r.selectors = sels.map(scopeSel);
  });
  // Elementor caps widget width with .elementor.elementor .e-con > .elementor-widget{max-width:100%} (4 classes):
  // the demo's own max-widths get one extra notch so text measures stay identical
  const mwRules = []; root.walkRules((r) => mwRules.push(r));
  mwRules.forEach((r) => {
    if (r.parent && r.parent.type === 'atrule' && /keyframes/.test(r.parent.name)) return;
    const mw = r.nodes.filter((d) => d.type === 'decl' && d.prop === 'max-width');
    if (!mw.length) return;
    const c = r.clone({ nodes: [] }); mw.forEach((d) => c.append(d.clone()));
    c.selectors = r.selectors.map((s) => s.replace(/body\.aas-landing\.aas-landing(?![.\w-])/, 'body.aas-landing.aas-landing.aas-landing'));
    r.after(c);
  });
  root.walkDecls((d) => {
    if (/^animation(-name)?$/.test(d.prop)) for (const k of kf) d.value = d.value.replace(new RegExp(`(^|[\\s,])${k}(?=[\\s,;]|$)`, 'g'), `$1aas-${k}`);
    if (d.prop === '--serif') d.value = "var(--e-global-typography-aasdisp-font-family,'AAS Fraunces'),'AAS Fraunces','Times New Roman',serif";
    else if (d.prop === '--ital') d.value = "var(--e-global-typography-aasital-font-family,'AAS Instrument Serif'),'AAS Instrument Serif','AAS Fraunces',serif";
    else if (d.prop === '--sans') d.value = "var(--e-global-typography-aasbody-font-family,'AAS Geist'),'AAS Geist',system-ui,-apple-system,sans-serif";
    else if (d.prop.startsWith('--') && COLORS[d.prop.slice(2)]) d.value = `var(--e-global-color-${COLORS[d.prop.slice(2)]},${d.value})`;
    else if (d.prop === 'font-family' || d.prop === 'font') for (const [a, b] of Object.entries(FONT)) d.value = d.value.replace(new RegExp(`(^|[\\s,])${a.replace(/'/g, "'?")}(?=[\\s,;]|$)`, 'g'), `$1${b}`);
    d.value = d.value
      .replace(/url\(\/fonts\/fraunces-300-700\.woff2\)/g, `url(${base}fonts/aas-fraunces.woff2)`)
      .replace(/url\(\/fonts\/geist-var\.woff2\)/g, `url(${base}fonts/aas-geist.woff2)`)
      .replace(/url\(\/fonts\/instrument-serif-400-italic\.woff2\)/g, `url(${base}fonts/aas-instrument-serif-italic.woff2)`)
      .replace(/url\(\/(tex|poster|brand|work)\//g, `url(${base}$1/`);
  });
  root.walkAtRules('font-face', (a) => a.walkDecls('font-family', (d) => { for (const [k, v] of Object.entries(FONT)) if (d.value.replace(/'/g, '') === k.replace(/'/g, '')) d.value = v; }));
  return root.toString();
}

const demoCss = fs.readFileSync(path.join(OUT, 'js', 'aas.css'), 'utf8');
const adapter = fs.readFileSync(path.join(WP, 'tools', 'adapter.css'), 'utf8');
fs.writeFileSync(path.join(ASSETS, 'aas.css'), processCss(demoCss, { btn: true }) + '\n' + processCss(adapter));

// critical CSS: the first <style> of the demo page (fonts, first screen, loader), with absolute asset URLs filled in by PHP
const indexHtml = rd('index.html');
const crit = indexHtml.match(/<style>([\s\S]*?)<\/style>/)[1];
fs.writeFileSync(path.join(ASSETS, 'critical.css'), processCss(crit, { base: '{{BASE}}/' }).replace(/\n\s*/g, ''));
// the live page inlines everything (critical + page + adapter) with absolute asset URLs filled in by PHP
const min = (c) => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,>])\s*/g, '$1');
fs.writeFileSync(path.join(ASSETS, 'aas-inline.css'), min(processCss(crit, { base: '{{BASE}}/' }) + processCss(demoCss, { btn: true, base: '{{BASE}}/' }) + processCss(adapter, { base: '{{BASE}}/' })));

// ---------------------------------------------------------------- 2. static assets
const cp = (from, to) => fs.cpSync(path.join(ROOT, from), path.join(ASSETS, to), { recursive: true });
fs.mkdirSync(path.join(ASSETS, 'fonts'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'public/fonts/fraunces-300-700.woff2'), path.join(ASSETS, 'fonts/aas-fraunces.woff2'));
fs.copyFileSync(path.join(ROOT, 'public/fonts/geist-var.woff2'), path.join(ASSETS, 'fonts/aas-geist.woff2'));
fs.copyFileSync(path.join(ROOT, 'public/fonts/instrument-serif-400-italic.woff2'), path.join(ASSETS, 'fonts/aas-instrument-serif-italic.woff2'));
cp('public/film', 'film'); cp('public/tex', 'tex'); cp('public/poster', 'poster'); cp('public/brand', 'brand');
fs.mkdirSync(path.join(ASSETS, 'work'), { recursive: true });
for (const n of ['talbot-after', 'talbot-before']) for (const s of ['800', '1600']) for (const e of ['webp', 'avif'])
  fs.copyFileSync(path.join(ROOT, `public/work/${n}-${s}.${e}`), path.join(ASSETS, `work/${n}-${s}.${e}`));
fs.copyFileSync(path.join(WP, 'plugin-src', 'aas-landing-assets.php'), path.join(PLUG, 'aas-landing-assets.php'));
fs.writeFileSync(path.join(PLUG, 'readme.txt'), `=== AAS Landing Assets ===\nStable tag: 1.0.0\nRequires at least: 6.2\nRequires PHP: 7.4\nLicense: GPLv2 or later\n\nStyles, scripts and fonts for the AAS Group outdoor landing page (Elementor). Loads only on that page.\n`);
fs.writeFileSync(path.join(ASSETS, 'index.php'), '<?php // Silence is golden.\n');

// ---------------------------------------------------------------- 3. Elementor template
const meta = JSON.parse(rd('public/work/meta.json'));
const lqip = JSON.parse(rd('lqip.json'));
// pull an element (outerHTML) out of the demo page, balancing nested tags of the same name
function grab(html, start) {
  const i = html.indexOf(start);
  if (i < 0) throw new Error('not found: ' + start);
  const tag = start.match(/^<([a-z0-9-]+)/)[1];
  const re = new RegExp(`<${tag}[\\s>]|</${tag}>`, 'g');
  re.lastIndex = i;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(i, m.index + m[0].length);
  }
  throw new Error('unbalanced: ' + start);
}
// locked HTML: images resolve to the plugin's folder at runtime (data-aas-src), the marker lets the plugin recognise the page
function lockHtml(h) {
  return h
    .replace(/<x-img\s+([^>]*?)\/?>(<\/x-img>)?/g, (_m, attrs) => {
      const a = {}; attrs.replace(/([\w-]+)(?:="([^"]*)")?/g, (_x, k, v) => ((a[k] = v ?? ''), ''));
      const n = a.name, [w, h2] = meta[n] || [1600, 1200], sizes = a.sizes || '(max-width: 800px) 100vw, 50vw';
      const set = (e) => `/work/${n}-800.${e} 800w, /work/${n}-1600.${e} 1600w`;
      const extra = Object.entries(a).filter(([k]) => !['name', 'alt', 'sizes', 'eager', 'class', 'style'].includes(k)).map(([k, v]) => ` ${k}="${v}"`).join('');
      return `<picture${a.class ? ` class="${a.class}"` : ''}${a.style ? ` style="${a.style}"` : ''}><source type="image/avif" data-aas-srcset="${set('avif')}" sizes="${sizes}"><img data-aas-src="/work/${n}-800.webp" data-aas-srcset="${set('webp')}" sizes="${sizes}" width="${w}" height="${h2}" alt="${a.alt ?? ''}"${lqip[n] ? ` style="background:#d8d3c8 url(${lqip[n]}) center/cover no-repeat"` : ''} loading="lazy" decoding="async"${extra}></picture>`;
    })
    .replace(/ src="(\/(?:poster|brand)\/[^"]+)"/g, ' data-aas-src="$1" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="')
    .replace(/\n\s*/g, '\n');
}
const MARK = ' data-aas-landing="1"';
const markSvg = fs.readFileSync(path.join(ROOT, 'public/brand/mark.svg'), 'utf8').replace(/<\?xml[^>]*>/, '').trim()
  .replace('<svg', '<svg class="brand__img" width="34" height="28" aria-hidden="true"');

let n = 0;
const nid = () => ((0x5a1c3e7 + ++n * 104729) % 0xfffffff).toString(16).padStart(7, '0');
const con = (title, cls, kids, extra = {}) => ({ id: nid(), elType: 'container', isInner: false, settings: { _title: title, content_width: 'full', css_classes: cls, ...extra }, elements: kids, });
// Elementor gives new widgets the site's global "Primary/Text/Accent" colours and fonts by default; on Ardian's site
// those are his theme's, so every widget here opts out and takes the page's own design instead
const NO_GLOBALS = {
  heading: { title_color: 'inherit', typography_typography: 'custom' },
  'text-editor': { text_color: 'inherit', typography_typography: 'custom' },
  button: { typography_typography: 'custom' },
  'icon-list': { text_color: 'inherit', icon_typography_typography: 'custom' },
  accordion: { title_color: 'inherit', tab_active_color: 'inherit', content_color: 'inherit', title_typography_typography: 'custom', content_typography_typography: 'custom' },
};
// 'inherit' / 'custom' are real values, so Elementor stops filling in the site's global colour and font;
// the page's own design shows through, and any colour or font picked later in the panel still wins
const wdg = (type, title, s) => ({ id: nid(), elType: 'widget', widgetType: type, isInner: false, settings: { _title: title, ...(NO_GLOBALS[type] || {}), ...(NO_GLOBALS[type] ? { __globals__: Object.fromEntries(Object.keys(NO_GLOBALS[type]).map((k) => [k, ''])) } : {}), ...s }, elements: [] });
const heading = (title, cls, html, tag = 'h2', id = '') => wdg('heading', title, { title: html, header_size: tag, _css_classes: cls, ...(id ? { _element_id: id } : {}) });
const text = (title, html, cls = '') => wdg('text-editor', title, { editor: html, _css_classes: cls });
const LOCK = (title, html) => wdg('html', '⚠ ' + title + ' – don’t edit', { html: lockHtml(html) });
const link = (url) => ({ url, is_external: /^https?:/.test(url) ? 'on' : '', nofollow: '', custom_attributes: '' });
const noIcon = { value: '', library: '' };
const button = (title, label, url, cls, icon = noIcon) => wdg('button', title, { text: label, link: link(url), _css_classes: cls, selected_icon: icon });
const image = (title, name, cls, size = 'large') => wdg('image', title, { image: { url: `${DEMO}/work/${name}-1600.webp`, id: '', source: 'library', alt: '' }, image_size: size, _css_classes: cls });
const iconList = (title, items, cls) => wdg('icon-list', title, { view: 'inline', _css_classes: cls, icon_list: items.map(([t, u]) => ({ _id: nid(), text: t, selected_icon: noIcon, link: u ? link(u) : { url: '' } })) });
const kicker = (tag, label, light = false) => text('Kicker', `<p class="kicker${light ? ' kicker--light' : ''}"><span class="lvl-tag">${tag}</span> ${label}</p>`, 'kicker-w');
const WA_ICON = { value: 'fab fa-whatsapp', library: 'fa-brands' };
const PHONE_ICON = { value: 'fas fa-phone-alt', library: 'fa-solid' };
const MAPS = 'https://www.google.com/maps/search/?api=1&query=AAS+Group+Construction+Ltd+Northampton';
const WA_URL = "https://wa.me/447777792227?text=Hi%20Ardian%2C%20I%27d%20like%20a%20free%20site%20visit.";
const TEL = 'tel:+447777792227';
const primary = (label, url = '#visit') => button('Button', label, url, 'b-btn b-btn--primary magnetic btn-arrow');
const gbadge = (lg, label) => `<a class="gbadge${lg ? ' gbadge--lg' : ''}" href="${MAPS.replace(/&/g, '&amp;')}" target="_blank" rel="noopener"><span class="gbadge__g" aria-hidden="true">G</span><span class="gbadge__score">5.0</span><span class="gbadge__stars" aria-hidden="true">★★★★★</span><span class="gbadge__n">${label}</span></a>`;

// --- locked pieces, taken straight from the live demo's markup
const loaderHtml = grab(indexHtml, '<div id="loader"').replace('<div id="loader" aria-hidden="true">', `<div id="loader" aria-hidden="true"${MARK}>`);
const loaderJs = indexHtml.match(/<script>\s*\(function\(\)\{if\(document\.documentElement\.classList\.contains\('seen'\)\)[\s\S]*?<\/script>/)[0];
const heroStage = grab(indexHtml, '<div class="hero__stage">');
const heroFilm = [
  '<canvas class="hero__canvas" id="heroCanvas" aria-hidden="true"></canvas>',
  '<div class="hero__shade" aria-hidden="true"></div>',
  '<div class="hero__grid" aria-hidden="true"></div>',
  grab(heroStage, '<aside class="plan"'),
  grab(heroStage, '<div class="hero__scroll"'),
  heroStage.match(/<span class="vis-chip"[^>]*>Visualisation<\/span>/)[0],
].join('\n').replace('<canvas class="hero__canvas"', `<canvas${MARK} class="hero__canvas"`);
const studio = grab(indexHtml, '<div class="studio wrap">').replace('<div class="studio wrap">', `<div class="studio wrap"${MARK}>`);
const layersPin = grab(indexHtml, '<div class="layers__pin" id="layersPin">');
const reveal = grab(indexHtml, '<div class="reveal-drag" id="reveal"');
const qnav = grab(indexHtml, '<div class="quotes__nav">').replace('<span class="quotes__count" id="qCount">6 real reviews</span>', '<span class="quotes__count" id="qCount">Swipe for more</span>');
const specMini = grab(indexHtml, '<article class="spec spec--mini" id="specMini" hidden>');
const wiz = grab(indexHtml, '<form class="wiz" id="wiz"').replace('<form class="wiz" id="wiz"', `<form${MARK} class="wiz" id="wiz"`);

// --- editable content, pulled from the demo page so copy stays identical
const cards = [...indexHtml.matchAll(/<article class="card-svc">([\s\S]*?)<\/article>/g)].map((m) => {
  const b = m[1];
  return {
    img: b.match(/<x-img name="([^"]+)"/)[1],
    h3: b.match(/<h3>([\s\S]*?)<\/h3>/)[1],
    p: b.match(/<\/h3>\s*<p>([\s\S]*?)<\/p>/)[1],
    meta: b.match(/<p class="card-svc__meta">([\s\S]*?)<\/p>/)[1],
    cap: b.match(/<p class="card-svc__cap">([\s\S]*?)<\/p>/)[1],
  };
});
const quotes = [...indexHtml.matchAll(/<figure class="quote[^"]*"><blockquote>([\s\S]*?)<\/blockquote><figcaption>([\s\S]*?)<\/figcaption><\/figure>/g)].map((m) => [m[1], m[2]]);
const steps = [...indexHtml.matchAll(/<li><span class="steps__n">([\s\S]*?)<\/span><p>([\s\S]*?)<\/p><\/li>/g)].map((m) => [m[1], m[2]]);
const faqs = [...indexHtml.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map((m) => [m[1], m[2]]);
const foot = [...grab(indexHtml, '<div class="wrap foot__grid">').matchAll(/<div>\s*<p class="foot__h">([\s\S]*?)<\/p>\s*<p>([\s\S]*?)<\/p>\s*<\/div>/g)].map((m) => [m[1], m[2]]);
if (cards.length !== 5 || quotes.length !== 6 || steps.length !== 5 || faqs.length !== 6 || foot.length !== 4) throw new Error(`content parse: ${cards.length} ${quotes.length} ${steps.length} ${faqs.length} ${foot.length}`);

const content = [
  { ...LOCK('Loader', loaderHtml + '\n' + loaderJs), settings: { ...LOCK('Loader', loaderHtml + '\n' + loaderJs).settings, _css_classes: 'aas-loader-w' } },
  con('Top bar', 'nav', [
    wdg('html', 'Logo (HTML)', { html: `<a class="brand" href="#hero" aria-label="AAS Group Construction, back to top">${markSvg}<span class="brand__word">AAS Group<small>Construction</small></span></a>` }),
    iconList('Menu links', [['Design yours', '#design'], ['Our work', '#services'], ['How it works', '#process'], ['Reviews', '#reviews']], 'nav__links'),
    con('Top bar buttons', 'nav__cta', [
      button('Phone', '07777 792227', TEL, 'nav__phone'),
      button('Button', 'Free site visit', '#visit', 'b-btn b-btn--ink b-btn--sm'),
    ]),
  ], { html_tag: 'header', _element_id: 'nav' }),

  con('Hero', 'hero', [
    con('Hero stage', 'hero__stage', [
      LOCK('Hero film', heroFilm),
      con('Hero text', 'hero__copy', [
        iconList('Chips', [['5.0 · 25 Google reviews', MAPS], ['Groundworks-led'], ['Northants · MK · Leics']], 'chips'),
        heading('Headline', 'hero__title', 'Gardens and driveways, built <em>from the ground&nbsp;up.</em>', 'h1'),
        text('Intro', '<p class="hero__sub">Patios, driveways and full garden transformations across Northamptonshire and Milton Keynes, by a groundworks team that gets the base, levels and drainage right first.</p>'),
        con('Hero buttons', 'hero__ctas', [
          primary('Book a free site visit'),
          button('WhatsApp button', 'WhatsApp 07777 792227', WA_URL, 'b-btn b-btn--glass', WA_ICON),
        ]),
      ], { _element_id: 'heroCopy' }),
    ]),
  ], { html_tag: 'section', _element_id: 'hero' }),

  con('Design your outdoor space', 'design', [
    con('Intro', 'design__head wrap', [
      kicker('+0.00', 'Design your outdoor space'),
      heading('Heading', 'h2', 'Plan the garden <em>before we dig.</em>', 'h2', 'design-h'),
      text('Intro', '<p class="lede">Pick a surface, a lawn and a boundary. Your choices build a spec card you can send to Ardian with one tap, and he’ll bring it to your free site visit.</p>'),
    ]),
    LOCK('Configurator', studio),
  ], { html_tag: 'section', _element_id: 'design' }),

  con('Services', 'services', [
    con('Intro', 'wrap services__head', [
      kicker('−0.15', 'What we build'),
      heading('Heading', 'h2', 'Five things we build, <em>properly underneath.</em>', 'h2', 'svc-h'),
      text('Swipe hint (phones)', '<p class="services__hint">Swipe for all five →</p>'),
    ]),
    con('Service cards', 'stack wrap', cards.map((c) => con('Card: ' + c.h3.replace(/&amp;/g, '&'), 'card-svc', [
      image('Photo', c.img, 'card-svc__img'),
      con('Card text', 'card-svc__body', [
        heading('Title', '', c.h3, 'h3'),
        text('Text', `<p>${c.p}</p>`),
        text('Materials', `<p class="card-svc__meta">${c.meta}</p>`),
        text('Real job caption', `<p class="card-svc__cap">${c.cap}</p>`),
      ]),
    ], { html_tag: 'article' }))),
  ], { html_tag: 'section', _element_id: 'services' }),

  con('How a patio is built + Slopes', 'layers', [
    LOCK('Patio layers animation', layersPin),
    con('Slopes', 'slope wrap', [
      con('Slopes text', 'slope__copy', [
        kicker('+0.90', 'Slopes', true),
        heading('Heading', 'h2 h2--light', 'Got a slope? <em>We build gardens on ground other landscapers walk away from.</em>'),
        text('Text', '<p class="lede lede--light">On Talbot Road North in Wellingborough the garden fell away from the house. We built a 10-metre retaining wall, 900mm high, split the garden into two levels joined by central steps, and laid 40m² of natural turf.</p>'),
      ]),
      LOCK('Before/after slider', reveal),
      con('Rootlok', 'rootlok', [
        image('Photo', 'rootlok-run', 'rootlok__pic'),
        text('Caption', '<p class="rootlok__cap"><strong>50m Rootlok living wall, Wellingborough.</strong> Tough geotextile bags, filled on site and locked together with interlocking plates, then seeded so grass and wildflowers grow through. It holds the slope like a hard wall, and it looks green.</p>'),
      ]),
    ]),
  ], { html_tag: 'section', _element_id: 'layers' }),

  con('Reviews', 'reviews', [
    con('Reviews inner', 'wrap', [
      con('Reviews heading', 'reviews__head', [
        kicker('+0.00', 'Reviews'),
        heading('Heading', 'h2', 'What the neighbours <em>say on Google.</em>', 'h2', 'rev-h'),
        text('Google badge', `<p>${gbadge(true, 'from 25 Google reviews')}</p>`),
      ]),
      con('Review cards', 'quotes', quotes.map(([q, c], i) => text('Review: ' + c.split(' ·')[0], `<blockquote>${q}</blockquote><p class="quote__cap">${c}</p>`, 'quote' + (i === 0 ? ' is-on' : ''))), { _element_id: 'quotes' }),
      LOCK('Review arrows', qnav),
    ]),
  ], { html_tag: 'section', _element_id: 'reviews' }),

  con('How it works', 'process', [
    con('How it works inner', 'wrap process__grid', [
      con('Intro', 'process__head', [
        kicker('+0.00', 'How it works', true),
        heading('Heading', 'h2 h2--light', 'Five steps, <em>no surprises.</em>', 'h2', 'proc-h'),
        text('Intro', '<p class="lede lede--light">Every job starts with a site visit, not a one-size quote.</p>'),
        button('Button', 'Book the first step', '#visit', 'b-btn b-btn--light'),
      ]),
      con('Steps', 'steps', steps.map(([t, p], i) => con(`Step ${i + 1}`, 'steps__item', [heading('Step title', 'steps__n', t, 'h3'), text('Step text', `<p>${p}</p>`)])), { _element_id: 'steps' }),
    ]),
  ], { html_tag: 'section', _element_id: 'process' }),

  con('Free site visit', 'visit', [
    con('Free site visit inner', 'wrap visit__grid', [
      con('Intro', 'visit__side', [
        kicker('+0.00', 'Free site visit'),
        heading('Heading', 'h2', 'Book your <em>free site visit.</em>', 'h2', 'visit-h'),
        text('Intro', '<p class="lede">Six quick taps. Ardian gets your brief on WhatsApp and arranges a time to come and look.</p>'),
        LOCK('Spec card (filled in by the configurator)', specMini),
        text('Trust line', `<p class="trust">${gbadge(false, '25 Google reviews')}<span class="trust__line">No obligation · written quote</span></p>`),
      ]),
      LOCK('Booking form', wiz),
    ]),
  ], { html_tag: 'section', _element_id: 'visit' }),

  con('FAQ', 'faq', [
    con('FAQ inner', 'wrap faq__grid', [
      con('Intro', 'faq__intro', [
        kicker('+0.00', 'Questions'),
        heading('Heading', 'h2', 'Good questions <em>to ask a landscaper.</em>', 'h2', 'faq-h'),
      ]),
      wdg('accordion', 'Questions', { _css_classes: 'faq__list', tabs: faqs.map(([q, a]) => ({ _id: nid(), tab_title: q, tab_content: `<p>${a}</p>` })), selected_icon: { value: 'fas fa-plus', library: 'fa-solid' }, selected_active_icon: { value: 'fas fa-minus', library: 'fa-solid' }, title_html_tag: 'div' }),
    ]),
  ], { html_tag: 'section', _element_id: 'faq' }),

  con('Final call to action', 'final', [
    image('Background photo', 'shelley-after', 'final__img', 'full'),
    con('Final text', 'wrap final__copy', [
      heading('Headline', 'final__title', 'Start with the ground. <em>We’ll do the rest.</em>', 'h2', 'final-h'),
      con('Buttons', 'hero__ctas', [primary('Book a free site visit'), button('Call button', 'Call 07777 792227', TEL, 'b-btn b-btn--glass')]),
      text('Caption', '<p class="final__cap">Real job · Shelley Rd, Wellingborough</p>'),
    ]),
  ], { html_tag: 'section' }),

  con('Footer', 'foot', [
    con('Footer columns', 'wrap foot__grid', foot.map(([h, p]) => text('Column: ' + h, `<p class="foot__h">${h}</p><p>${p.replace(/\n\s*/g, '')}</p>`))),
    text('Big name', '<p class="foot__name" aria-hidden="true"><span>AAS</span> Group</p>', 'foot__name-w'),
    con('Legal line', 'wrap foot__legal', [text('Company details', '<p>AAS Group Construction Ltd · Company no. 16288736</p>')]),
  ], { html_tag: 'footer' }),

  con('Phone quick-contact bar', 'dock', [
    button('Call', 'Call', TEL, 'dock__btn dock__call'),
    button('WhatsApp', 'WhatsApp', WA_URL, 'dock__btn', WA_ICON),
    button('Free visit', 'Free visit', '#visit', 'dock__btn dock__main'),
  ], { html_tag: 'nav', _element_id: 'dock' }),
];

// nested containers are "inner" in Elementor's data
const mark = (els, depth) => els.forEach((e) => { if (e.elType === 'container') { e.isInner = depth > 0; mark(e.elements, depth + 1); } });
mark(content, 0);

const tpl = { title: 'AAS Outdoor Landing', type: 'page', version: '0.4', page_settings: { template: 'elementor_canvas' }, content };
fs.writeFileSync(path.join(WP, 'aas-outdoor-landing.json'), JSON.stringify(tpl, null, 1));

// ---------------------------------------------------------------- 4. zip
fs.rmSync(path.join(WP, 'aas-landing-assets.zip'), { force: true });
execSync('zip -qr -X ../aas-landing-assets.zip aas-landing-assets', { cwd: OUT });
const kb = (p) => Math.round(fs.statSync(p).size / 1024);
console.log('template', kb(path.join(WP, 'aas-outdoor-landing.json')) + 'KB', '· plugin zip', kb(path.join(WP, 'aas-landing-assets.zip')) + 'KB', '· css', kb(path.join(ASSETS, 'aas.css')) + 'KB');
