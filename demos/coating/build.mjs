// Build: bundles JS/CSS, bakes config tokens into HTML, inlines icons,
// adds LocalBusiness schema and generates one "{Service} in {Town}" page per area.
// Usage: node build.mjs            (uses site.config.mjs)
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import config from './site.config.mjs';
import derive from './src/derive.js';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'dist');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

// ---------- JS + CSS ----------
await build({
  entryPoints: [path.join(SRC, 'main.js')],
  bundle: true, format: 'esm', splitting: true, minify: true,
  target: ['es2020'], outdir: path.join(OUT, 'assets'), chunkNames: 'chunk-[hash]',
  logLevel: 'warning',
});
await build({
  entryPoints: [path.join(SRC, 'styles.css')], bundle: true, minify: true, external: ['/img/*'],
  outfile: path.join(OUT, 'assets', 'styles.css'), logLevel: 'warning',
});

// ---------- static files ----------
const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const a = path.join(from, f), b = path.join(to, f);
    fs.statSync(a).isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
};
copyDir(path.join(SRC, 'img'), path.join(OUT, 'img'));

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const iconDir = path.join(ROOT, 'node_modules/@phosphor-icons/core/assets');

function icon(name, weight = 'regular') {
  const file = path.join(iconDir, weight, weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`);
  if (!fs.existsSync(file)) throw new Error(`Missing icon: ${name} (${weight})`);
  return fs.readFileSync(file, 'utf8')
    .replace('<svg ', '<svg class="i" aria-hidden="true" focusable="false" ');
}

// Values worked out from config + today's date (days to deadline, booking month,
// sample estimate). The runtime recalculates them on load so they never go stale.
const DERIVED = derive(config, new Date());
const fillText = (s, t) => String(s).replace(/\{([A-Z][A-Za-z0-9]*)\}/g, (m, k) => (t[k] != null ? t[k] : m));

function tokensFor(extra = {}) {
  const t = { ...config.tokens, ...DERIVED, ...extra };
  if (t.Phone && !t.PhoneTel) t.PhoneTel = String(t.Phone).replace(/[^\d+]/g, '');
  if (t.TextNumber && !t.TextTel) t.TextTel = String(t.TextNumber).replace(/[^\d+]/g, '');
  t.Year = String(new Date().getFullYear());
  t.SiteUrl = config.siteUrl;
  if (t.Owner && !t.OwnerFirst) t.OwnerFirst = String(t.Owner).split(/\s+/)[0];
  if (t.Owner && !t.OwnerInitials) t.OwnerInitials = String(t.Owner).split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  for (const [k, v] of Object.entries(config.seo || {})) t[k] = fillText(v, t);
  return t;
}

// Demo mode: a prospect must never see a {Token}. Fail the build instead.
const missing = new Set();

// Replace {Token} placeholders. In text, every token becomes a <span data-token>
// so the runtime can personalise it from the URL; unfilled ones get class "ph".
function bake(html, tokens) {
  const parts = html.split(/(<[^>]+>)/g);
  let raw = null; // inside <title>/<script>/<style>/<textarea>
  return parts.map((part) => {
    if (part.startsWith('<')) {
      const m = part.match(/^<\/?\s*([a-zA-Z0-9-]+)/);
      const tag = m && m[1].toLowerCase();
      if (['title', 'script', 'style', 'textarea'].includes(tag)) raw = part.startsWith('</') ? null : tag;
      return part.replace(/\{([A-Z][A-Za-z0-9]*)\}/g, (all, k) => (tokens[k] != null ? esc(tokens[k]) : all));
    }
    if (raw) return part.replace(/\{([A-Z][A-Za-z0-9]*)\}/g, (all, k) => (tokens[k] != null ? (raw === 'title' ? esc(tokens[k]) : tokens[k]) : all));
    return part.replace(/\{([A-Z][A-Za-z0-9]*)\}/g, (all, k) =>
      tokens[k] != null
        ? `<span data-token="${k}">${esc(tokens[k])}</span>`
        : `<span class="ph" data-token="${k}">{${k}}</span>`);
  }).join('');
}
function checkFilled(html, file) {
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  for (const m of visible.matchAll(/\{([A-Za-z][A-Za-z0-9 ]*)\}/g)) missing.add(`${file}: {${m[1]}}`);
}

function schema(tokens, area) {
  const filled = (v) => (v != null && !/^\{.*\}$/.test(v) ? v : undefined);
  const data = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', config.schemaType].filter((v, i, a) => v && a.indexOf(v) === i),
    '@id': config.siteUrl + '/#business',
    description: tokens.MetaDescription,
    image: config.siteUrl + '/img/og.jpg',
    logo: config.brand?.logo ? config.siteUrl + config.brand.logo : undefined,
    priceRange: config.priceRange,
    openingHours: config.openingHours,
    founder: filled(tokens.Owner) ? { '@type': 'Person', name: tokens.Owner } : undefined,
    foundingDate: filled(tokens.YearFounded),
    name: filled(tokens.Company) || `{Company}`,
    telephone: filled(tokens.Phone),
    email: filled(tokens.Email),
    url: config.siteUrl,
    areaServed: (area ? [area] : areas).map((a) => ({ '@type': 'City', name: a })),
    address: {
      '@type': 'PostalAddress',
      streetAddress: filled(tokens.Street),
      addressLocality: filled(tokens.Town),
      postalCode: filled(tokens.Postcode),
      addressCountry: config.country,
    },
    aggregateRating: filled(tokens.Rating) && filled(tokens.ReviewCount)
      ? { '@type': 'AggregateRating', ratingValue: tokens.Rating, reviewCount: tokens.ReviewCount }
      : undefined,
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

// <!--LIST:name--> ...{{field}}... <!--/LIST--> repeats per item in config.lists[name].
// Empty fields render as a labelled slot, e.g. {Job town}.
function lists(html) {
  return html.replace(/<!--LIST:(\w+)-->([\s\S]*?)<!--\/LIST-->/g, (_, name, tpl) => {
    const T = tokensFor();
    const items = ((config.lists && config.lists[name]) || []).map((it) =>
      Object.fromEntries(Object.entries(it).map(([k, v]) => [k, v == null ? v : fillText(v, T)])));
    return items.map((item, i) => tpl.split(/(<[^>]+>)/g).map((part) => {
      const inTag = part.startsWith('<');
      return part.replace(/\{\{(\w+)(?:\|([^}]+))?\}\}/g, (m, f, label) => {
        if (f === 'n') return String(i + 1);
        const v = f === 'initials' && item.name ? item.name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).map((w) => w[0]).join('').slice(0, 2).toUpperCase() : item[f];
        const lbl = label || f;
        if (v != null) return esc(v);
        return inTag ? lbl : `<span class="ph">{${esc(lbl)}}</span>`;
      });
    }).join('')).join('');
  });
}

// Brand: optional logo image + accent colour from config.brand
function brand(html) {
  const b = config.brand || {};
  if (b.logo) html = html.replace(/<span class="brand-mark" aria-hidden="true">(?:<span><\/span>)+<\/span>/g,
    `<img class="brand-logo" src="${esc(b.logo)}" alt="" width="32" height="32">`);
  if (b.accent) html = html.replace('</head>', `<style>:root{--accent:${b.accent};--accent-hi:color-mix(in oklch,${b.accent},white 16%);--accent-ink:color-mix(in oklch,${b.accent},black 38%);--accent-wash:color-mix(in oklch,${b.accent},white 86%);--accent-text:color-mix(in oklch,${b.accent},white 32%);--accent-soft:color-mix(in oklch,${b.accent},transparent 84%)}</style>\n</head>`);
  return html;
}

// The business's home town is always the first service area.
const areas = [...new Set([config.tokens.Town, ...(config.areas || [])].filter(Boolean))];

function page(file, extraTokens = {}, area = null) {
  const tokens = tokensFor(extraTokens);
  let html = brand(lists(fs.readFileSync(path.join(SRC, file), 'utf8')));
  html = html.replace(/<i data-icon="([a-z-]+)"(?: data-weight="([a-z]+)")?><\/i>/g, (_, n, w) => icon(n, w));
  // Icon + text with tokens inside a flex/gap container: keep the text as one
  // flex item so filled-in values don't get extra gaps around them.
  html = html.replace(/(<\/svg>)([^<]*\{[A-Z][A-Za-z0-9]*\}[^<]*)(<\/(?:li|a|span|p|button|b)>)/g, (_, a, t, c) => `${a}<span>${t.trim()}</span>${c}`);
  const publicConfig = { ...config, areas, tokens, area };
  html = html.replace('<!--SITE-->',
    `<script>window.__SITE__=${JSON.stringify(publicConfig).replace(/</g, '\\u003c')}</script>\n${schema(tokens, area)}`);
  html = html.replace(/<!--AREAS-->/g, areas
    .map((a) => `<li><a href="/areas/${slug(a)}/">${esc(config.service)} in ${esc(a)}</a></li>`).join(''));
  html = bake(html, tokens);
  checkFilled(html, file + (area ? ` (${area})` : ''));
  return html;
}

fs.writeFileSync(path.join(OUT, 'index.html'), page('index.html'));
for (const area of areas) {
  const dir = path.join(OUT, 'areas', slug(area));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page('location.html', { Area: area, AreaSlug: slug(area), Service: config.service }, area));
}
if (fs.existsSync(path.join(SRC, 'privacy.html'))) fs.writeFileSync(path.join(OUT, 'privacy.html'), page('privacy.html'));

if (missing.size && !config.allowPlaceholders) {
  console.error('\nUnfilled placeholders (fill them in site.config.mjs, or set allowPlaceholders: true):\n  ' + [...missing].join('\n  '));
  process.exit(1);
}
const urls = ['/', ...areas.map((a) => `/areas/${slug(a)}/`)];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${config.siteUrl}${u}</loc></url>`).join('')}</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
console.log(`Built ${urls.length} pages into dist/`);
