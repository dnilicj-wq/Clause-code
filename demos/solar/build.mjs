// Build: bundles JS/CSS, bakes config tokens into HTML, inlines icons,
// adds LocalBusiness schema and generates one "{Service} in {Town}" page per area.
// Usage: node build.mjs            (uses site.config.mjs)
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import config from './site.config.mjs';

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

function tokensFor(extra = {}) {
  const t = { ...config.tokens, ...extra };
  if (t.Phone && !t.PhoneTel) t.PhoneTel = String(t.Phone).replace(/[^\d+]/g, '');
  return t;
}

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

function schema(tokens, area) {
  const filled = (v) => (v != null && !/^\{.*\}$/.test(v) ? v : undefined);
  const data = {
    '@context': 'https://schema.org',
    '@type': config.schemaType,
    name: filled(tokens.Company) || `{Company}`,
    telephone: filled(tokens.Phone),
    email: filled(tokens.Email),
    url: config.siteUrl,
    areaServed: area ? area : (config.areas || []),
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
    const items = (config.lists && config.lists[name]) || [];
    return items.map((item, i) => tpl.split(/(<[^>]+>)/g).map((part) => {
      const inTag = part.startsWith('<');
      return part.replace(/\{\{(\w+)(?:\|([^}]+))?\}\}/g, (m, f, label) => {
        if (f === 'n') return String(i + 1);
        const v = item[f];
        const lbl = label || f;
        if (v != null) return esc(v);
        return inTag ? lbl : `<span class="ph">{${esc(lbl)}}</span>`;
      });
    }).join('')).join('');
  });
}

function page(file, extraTokens = {}, area = null) {
  const tokens = tokensFor(extraTokens);
  let html = lists(fs.readFileSync(path.join(SRC, file), 'utf8'));
  html = html.replace(/<i data-icon="([a-z-]+)"(?: data-weight="([a-z]+)")?><\/i>/g, (_, n, w) => icon(n, w));
  const publicConfig = { ...config, tokens, area };
  html = html.replace('<!--SITE-->',
    `<script>window.__SITE__=${JSON.stringify(publicConfig).replace(/</g, '\\u003c')}</script>\n${schema(tokens, area)}`);
  html = html.replace(/<!--AREAS-->/g, (config.areas || [])
    .map((a) => `<li><a href="/areas/${slug(a)}/">${esc(config.service)} in ${esc(a)}</a></li>`).join(''));
  return bake(html, tokens);
}

fs.writeFileSync(path.join(OUT, 'index.html'), page('index.html'));
for (const area of config.areas || []) {
  const dir = path.join(OUT, 'areas', slug(area));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page('location.html', { Area: area, Service: config.service }, area));
}
if (fs.existsSync(path.join(SRC, 'privacy.html'))) fs.writeFileSync(path.join(OUT, 'privacy.html'), page('privacy.html'));

const urls = ['/', ...(config.areas || []).map((a) => `/areas/${slug(a)}/`)];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${config.siteUrl}${u}</loc></url>`).join('')}</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
console.log(`Built ${urls.length} pages into dist/`);
