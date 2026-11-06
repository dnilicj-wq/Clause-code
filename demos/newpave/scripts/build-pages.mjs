// Builds the lean service and area landing pages from the homepage's header, icon sprite
// and footer, so every page shares one source of truth. Run after editing index.html.
//   node scripts/build-pages.mjs
import fs from 'node:fs';
const PUB = new URL('../public/', import.meta.url).pathname;
const home = fs.readFileSync(PUB + 'index.html', 'utf8');
const cut = (a, b) => { const i = home.indexOf(a), j = home.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker ' + a); return home.slice(i, j + b.length); };
const sprite = cut('<svg width="0" height="0"', '</svg>\n');
const header = cut('<header class="hd"', '</header>').replace(/href="#(services|design|work|areas|faq|book)"/g, 'href="/#$1"');
const footer = cut('<footer class="ft">', '</footer>');
const dock = cut('<nav class="dock"', '</nav>').replace('href="#book"', 'href="/#book"');
const SITE = 'https://newpaveltd.co.uk', DEMO = 'https://clientgateway-newpave.vercel.app';
const jobs = Object.fromEntries(JSON.parse(fs.readFileSync(PUB + 'img/jobs.json', 'utf8')).map(j => [j.slug, j]));
const WA = t => 'https://wa.me/447787707154?text=' + encodeURIComponent(t);

const pic = (slug, alt, sizes = '(max-width:760px) 100vw, 33vw', eager = false) => {
  const j = jobs[slug]; if (!j) throw new Error('no job ' + slug);
  const ws = j.widths; const set = ext => ws.map(w => `/img/${slug}-${w}${j.v}.${ext} ${w}w`).join(', ');
  return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img src="/img/${slug}-1280${j.v}.webp" srcset="${set('webp')}" sizes="${sizes}" alt="${alt}" width="${j.w}" height="${j.h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
};

const SERVICES = {
  'resin-drives': {
    name: 'Resin drives', svc: 'resin', title: 'Resin Driveways in Telford & Shropshire | Newpave Ltd',
    desc: 'Resin bound and resin bonded driveways laid by our own family team in Telford, Shropshire and the West Midlands. Pick a colour online and book a free survey.',
    h1: 'Resin drives, laid by our own team.', hero: 'resin-amber', heroAlt: 'Amber resin bound driveway laid by Newpave',
    lede: 'A smooth, permeable finish with no loose stones, in a wide choice of natural aggregate blends.',
    body: `<h2>Resin bound or resin bonded</h2>
<p>Resin bound is the stone and resin mixed together before it is laid and trowelled smooth. The finish is even, there are no loose stones to kick onto the pavement, and water drains through it. Resin bonded is a layer of resin with loose stone scattered over the top, which gives a textured, gravel look.</p>
<h2>What goes into a resin drive</h2>
<ul><li>A sound, well-drained base. If your old surface is not up to it, we dig it out and build a new one.</li><li>Your choice of aggregate blend and colour.</li><li>Borders, edging and inlays, such as the diamond and contrasting block borders in our photos.</li><li>Clean edges where the drive meets the house, the lawn and the pavement.</li></ul>
<h2>Why people choose it</h2>
<p>Resin is low maintenance, it looks smart all year and the permeable finish helps with surface water. <span class="confirm">[CONFIRM: resin aftercare and any guarantee offered]</span></p>`,
    photos: [['resin-diamond', 'Resin drive with a diamond inlay'], ['resin-silver', 'Silver resin with a black block border'], ['resin-bungalow', 'Resin drive to a bungalow']],
    faq: [['Can resin go over my old concrete or tarmac?', 'Sometimes, if the old surface is sound and drains properly. Charles will check this on the free survey and tell you straight if it needs digging out.'], ['Do I need planning permission?', 'Resin bound is permeable, so in most cases a front drive does not need planning permission. If anything about your drive needs it, we will tell you at the survey.']],
  },
  'block-paving': {
    name: 'Block paving', svc: 'block', title: 'Block Paving Driveways in Telford | Newpave Ltd',
    desc: 'Block paving drives, paths and patios in herringbone, basketweave and stretcher bond. Family-run, no subcontractors. Free surveys across Telford and Shropshire.',
    h1: 'Block paving, set out properly.', hero: 'block-red-herringbone', heroAlt: 'Red herringbone block paved driveway by Newpave',
    lede: 'New concrete block or reclaimed brick, laid in the pattern you choose on a properly built base.',
    body: `<h2>Patterns and colours</h2>
<p>Herringbone is the strongest pattern for a drive you park on. Basketweave and stretcher bond suit paths, patios and smaller areas. You can mix colours, add a contrasting border or set in a feature.</p>
<h2>How we lay it</h2>
<ul><li>Dig out to the right depth and lay a geotextile membrane.</li><li>Build up and compact an MOT Type 1 sub-base.</li><li>Screed a sharp sand bed, lay the blocks and cut in the edges.</li><li>Kiln-dried sand brushed into the joints and the whole drive compacted.</li></ul>
<h2>Steps and features</h2>
<p>We build steps, kerbs and raised edges in matching blocks so the whole frontage ties together, like the curved front step and grey herringbone in our photos below.</p>`,
    photos: [['block-step', 'Curved block paved front step'], ['block-grey-step', 'Grey herringbone block paving with a step'], ['block-charcoal', 'Charcoal block paved drive']],
    faq: [['Will weeds come through?', 'A membrane under the base and properly filled joints keep weeds to a minimum. Re-sanding the joints now and then keeps it that way.'], ['Can you match my neighbour\'s blocks?', 'Often, yes. Show us on the survey and we will find the closest match.']],
  },
  'tarmac-driveways': {
    name: 'Tarmac driveways', svc: 'tarmac', title: 'Tarmac Driveways in Telford & Shropshire | Newpave Ltd',
    desc: 'Black and red tarmac driveways with block edging, for homes and commercial sites across Telford, Shropshire and the West Midlands. Book a free survey.',
    h1: 'Tarmac drives that stay flat.', hero: 'tarmac-double', heroAlt: 'Tarmac driveway to a double garage by Newpave',
    lede: 'A practical, hard-wearing drive in black or red tarmac, finished with block edging.',
    body: `<h2>Black or red tarmac</h2>
<p>Black tarmac is the classic, cost-effective finish. Red tarmac gives a warmer look and pairs well with brick houses. Both can be edged with block paving for a crisp border.</p>
<h2>New drives and resurfacing</h2>
<p>For a new drive we dig out, lay a membrane and build a compacted sub-base before the base and surface courses go down. If your existing drive is sound, resurfacing may be an option. Charles will tell you which on the survey.</p>
<h2>Homes and commercial sites</h2>
<p>We lay tarmac on house drives, shared drives and lanes, and car parks for commercial customers.</p>`,
    photos: [['tarmac-red-edge', 'Tarmac drive with red block edging'], ['tarmac-lane', 'Shared drive laid in tarmac'], ['tarmac-curve', 'Curved tarmac driveway']],
    faq: [['How soon can I drive on it?', 'Usually soon after it has cooled and set. We will give you the exact advice for your drive on the day. <span class="confirm">[CONFIRM: wait time after laying]</span>'], ['Do you do car parks?', 'Yes. We work for commercial customers as well as homeowners.']],
  },
  'patios': {
    name: 'Patios and paths', svc: 'porcelain', title: 'Patios & Garden Paths in Telford | Newpave Ltd',
    desc: 'Porcelain, sandstone and slate patios and garden paths, laid level with the drainage thought through. Family-run team covering Telford and Shropshire.',
    h1: 'Patios you will actually sit on.', hero: 'patio-raised', heroAlt: 'Patio with a raised bed laid by Newpave',
    lede: 'Porcelain, sandstone and slate patios and paths, laid level with a proper fall so water runs away.',
    body: `<h2>Choosing a stone</h2>
<p>Porcelain is hard-wearing, easy to clean and very consistent in colour. Sandstone has natural variation and warmth. Slate gives a darker, more modern look. We can show you samples on the survey.</p>
<h2>Done properly underneath</h2>
<ul><li>A compacted sub-base sized for the area.</li><li>Slabs bedded on a full mortar bed, not dabs.</li><li>A gentle fall away from the house so rain runs off.</li><li>Pointed joints and clean cut edges.</li></ul>
<h2>Paths, borders and raised beds</h2>
<p>We join the patio to the rest of the garden with paths, brick or block borders, and raised beds or walls to match.</p>`,
    photos: [['patio-grey-slabs', 'Grey slab patio'], ['patio-brick-edge', 'Buff patio with a brick edge'], ['patio-garden', 'Garden patio']],
    faq: [['Can you lay a patio on a slope?', 'Yes. We level the ground or build a retaining wall and steps so it works with your garden.'], ['Do you take the old patio away?', 'Yes, we can dig out and remove an old patio as part of the job.']],
  },
  'hard-landscaping': {
    name: 'Hard landscaping', svc: null, title: 'Hard Landscaping in Telford: Walls, Steps & Fencing | Newpave Ltd',
    desc: 'Fencing, decking, retaining walls, steps, turf, raised beds and ponds by a family-run Telford team. All work done in-house. Book a free survey.',
    h1: 'The garden around the drive.', hero: 'resin-path-curve', heroAlt: 'Curved resin garden path laid by Newpave',
    lede: 'Fencing, decking, walls and steps, plus turf, raised beds, planters and ponds. All done by our own team.',
    body: `<h2>Hard landscaping</h2>
<ul><li>Fencing and gates</li><li>Decking</li><li>Retaining walls</li><li>Steps</li><li>Paths and borders</li></ul>
<h2>Soft landscaping</h2>
<ul><li>New turf and lawns</li><li>Raised beds and planters</li><li>Ponds and water features</li></ul>
<h2>One team for the whole job</h2>
<p>Because we do the drive, the patio and the garden ourselves, there is one person to talk to and nobody waiting on another trade.</p>`,
    photos: [['resin-path-wall', 'Resin path beside a garden wall'], ['resin-path-lawn', 'Resin path through a lawn'], ['block-path', 'Block paved garden path']],
    faq: [['Can you do the drive and garden together?', 'Yes. Many customers have the drive, patio and garden done as one job.'], ['Do you build retaining walls?', 'Yes, along with steps and raised beds.']],
  },
};

const AREAS = {
  telford: { name: 'Telford', title: 'Driveways in Telford | Resin, Block & Tarmac | Newpave Ltd', desc: 'Newpave is based in Donnington, Telford. Resin, block paving and tarmac drives, patios and landscaping across Telford. Free surveys, same-day reply.', h1: 'Driveways in Telford.', hero: 'resin-silver', heroAlt: 'Silver resin driveway by Newpave', pc: 'TF',
    body: `<p>We are based at Barn Close in Donnington, so Telford is home turf. We lay resin drives, block paving, tarmac, patios and garden landscaping right across the town.</p><p>Every job is done by our own family team: the person who quotes is the person who lays it.</p>` },
  wolverhampton: { name: 'Wolverhampton', title: 'Driveways in Wolverhampton | Resin & Block Paving | Newpave Ltd', desc: 'Resin, block paving and tarmac driveways, patios and landscaping in Wolverhampton by a family-run team. Design your drive and book a free survey.', h1: 'Driveways in Wolverhampton.', hero: 'block-red-island', heroAlt: 'Block paved driveway by Newpave', pc: 'WV',
    body: `<p>We cover Wolverhampton and the surrounding West Midlands for driveways, patios and landscaping, travelling from our base in Telford.</p><p>All work is done in-house by our own team, with honest pricing and no subcontractors.</p>` },
  birmingham: { name: 'Birmingham', title: 'Driveways in Birmingham | Resin, Block & Tarmac | Newpave Ltd', desc: 'Family-run driveway and patio specialists covering Birmingham. Resin, block paving and tarmac, all laid by our own team. Book a free survey.', h1: 'Driveways in Birmingham.', hero: 'resin-red', heroAlt: 'Resin driveway by Newpave', pc: 'B',
    body: `<p>We take on driveway, patio and landscaping work in Birmingham and across the West Midlands.</p><p>You deal with one family firm from the survey to the final sweep, with no subcontractors.</p>` },
};

const css = `<style>
.sub-sec{background:var(--light);color:var(--t-l);padding:clamp(56px,9vw,120px) 0}
.sub-aside .btn{width:100%}
.sub-aside ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.sub-aside li a{display:flex;gap:10px;align-items:center;text-decoration:none;font-weight:700}
.sub-aside li svg{width:18px;height:18px;color:var(--acc)}
.sub-faq{margin-top:40px;max-width:68ch}
.sub-faq details{border-top:1px solid var(--line-l);padding:16px 0}
.sub-faq summary{font-weight:700;cursor:pointer;list-style:none}
.sub-faq summary::-webkit-details-marker{display:none}
.sub-faq p{margin:10px 0 0;color:var(--m-l)}
.sub-more{display:flex;flex-wrap:wrap;gap:8px;margin-top:32px}
.sub-more a{padding:10px 16px;border-radius:999px;border:1px solid var(--line-l);text-decoration:none;font-weight:600;font-size:.92rem}
.sub-more a:hover{border-color:var(--t-l)}
.sub-hero .lede{color:var(--t-d);max-width:52ch;font-size:clamp(1.05rem,1.6vw,1.25rem)}
.sub-hero .ctas{display:flex;flex-wrap:wrap;gap:10px}
</style>`;

function page({ path, title, desc, h1, lede, hero, heroAlt, crumbs, main, aside, schema }) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#131211">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="website"><meta property="og:locale" content="en_GB"><meta property="og:site_name" content="Newpave Ltd">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:image" content="${DEMO}/img/og-c.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png" type="image/png"><link rel="icon" href="/brand/mark.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/brand/icon-180.png"><link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css?v=2">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
${css}
</head>
<body class="sub">
${sprite}<a class="skip" href="#main">Skip to content</a>
<div class="grain" aria-hidden="true"></div>
${header}
<main id="main">
<section class="sub-hero">
  ${pic(hero, heroAlt, '100vw', true)}
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">${crumbs}</nav>
    <h1>${h1}</h1>
    <p class="lede">${lede}</p>
    <div class="ctas"><a class="btn btn-acc" href="/#book" data-track="book_click" data-loc="sub-hero">Book free survey <svg aria-hidden="true"><use href="#i-arrow"/></svg></a><a class="btn btn-line" href="tel:+447787707154" data-track="call" data-loc="sub-hero"><svg aria-hidden="true"><use href="#i-phone"/></svg>07787 707154</a></div>
  </div>
</section>
<section class="sub-sec on-light">
  <div class="wrap sub-grid">
    <div class="prose">${main}</div>
    <aside class="sub-aside">${aside}</aside>
  </div>
</section>
</main>
${footer}
${dock}
<script>document.documentElement.classList.add('js')</script>
<script src="/js/sub.js?v=2" defer></script>
</body>
</html>
`;
}

const asideFor = (label, design) => `<h3>Free survey, no obligation</h3>
<p>Charles replies the same day. <span class="confirm">[CONFIRM: same-day reply promise]</span></p>
${design ? `<a class="btn btn-acc" href="/?design=${design}#design" data-track="design_click" data-loc="sub">Design your ${label.toLowerCase()} <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>` : `<a class="btn btn-acc" href="/?service=landscaping#book" data-track="book_click" data-loc="sub">Book free survey <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>`}
<a class="btn btn-wa" href="${WA(`Hi Charles, I'd like a free survey for ${label.toLowerCase()}.`)}" data-track="whatsapp" data-loc="sub"><svg aria-hidden="true"><use href="#i-wa"/></svg>WhatsApp Charles</a>
<ul><li><a href="tel:+447787707154"><svg aria-hidden="true"><use href="#i-phone"/></svg>07787 707154</a></li><li><a href="mailto:newpavelimited1@gmail.com"><svg aria-hidden="true"><use href="#i-mail"/></svg>newpavelimited1@gmail.com</a></li></ul>`;
const biz = { '@id': SITE + '/#business' };
const bizFull = { '@type': ['HomeAndConstructionBusiness', 'LocalBusiness'], '@id': SITE + '/#business', name: 'Newpave Ltd', telephone: '+447787707154', url: SITE + '/', image: DEMO + '/img/og-c.jpg', address: { '@type': 'PostalAddress', streetAddress: '39 Barn Close, Donnington', addressLocality: 'Telford', addressRegion: 'Shropshire', postalCode: 'TF2 7QT', addressCountry: 'GB' } };
const crumbsLd = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })) });
const photosHtml = ps => `<div class="photo-row">${ps.map(([s, c]) => `<figure>${pic(s, c + ', a Newpave job')}<figcaption>${c}</figcaption></figure>`).join('')}</div>`;
const svcLinks = cur => `<div class="sub-more">${Object.entries(SERVICES).filter(([k]) => k !== cur).map(([k, v]) => `<a href="/services/${k}/">${v.name}</a>`).join('')}</div>`;

for (const [slug, s] of Object.entries(SERVICES)) {
  const path = `/services/${slug}/`;
  const faq = `<div class="sub-faq"><h2>Questions</h2>${s.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
  const html = page({
    path, title: s.title, desc: s.desc, h1: s.h1, lede: s.lede, hero: s.hero, heroAlt: s.heroAlt,
    crumbs: `<a href="/">Home</a> / <a href="/#services">Services</a> / ${s.name}`,
    main: s.body + `<h2>Recent ${s.name.toLowerCase()} by our team</h2>` + photosHtml(s.photos) + faq + `<h2>Other services</h2>` + svcLinks(slug),
    aside: asideFor(s.name.replace(/s$/, '').replace('Patios and path', 'patio'), s.svc),
    schema: { '@context': 'https://schema.org', '@graph': [bizFull, { '@type': 'Service', name: s.name, serviceType: s.name, provider: biz, areaServed: ['Telford', 'Shropshire', 'Wolverhampton', 'Birmingham', 'West Midlands'], description: s.desc }, crumbsLd([['Home', '/'], ['Services', '/#services'], [s.name, path]]), { '@type': 'FAQPage', mainEntity: s.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '').replace(/\[CONFIRM[^\]]*\]/g, '').trim() } })) }] },
  });
  fs.mkdirSync(PUB + path, { recursive: true }); fs.writeFileSync(PUB + path + 'index.html', html);
}
for (const [slug, a] of Object.entries(AREAS)) {
  const path = `/areas-covered/${slug}/`;
  const main = `<h2>Covering ${a.name}</h2>${a.body}
<h2>What we do in ${a.name}</h2><ul>${Object.entries(SERVICES).map(([k, v]) => `<li><a href="/services/${k}/">${v.name}</a></li>`).join('')}<li><a href="/#emergency">24-hour emergency call-out</a></li></ul>
<h2>Recent work</h2>${photosHtml([['resin-diamond', 'Resin drive with a diamond inlay'], ['block-grey-step', 'Grey herringbone block paving'], ['tarmac-red-edge', 'Tarmac with red block edging']])}
<p style="font-size:.9rem;color:var(--m-l)">Photos are recent Newpave jobs. <span class="confirm">[CONFIRM: which towns these jobs were in]</span></p>
<h2>Other areas</h2><div class="sub-more">${Object.entries(AREAS).filter(([k]) => k !== slug).map(([k, v]) => `<a href="/areas-covered/${k}/">${v.name}</a>`).join('')}<a href="/#areas">Check your postcode</a></div>`;
  const html = page({
    path, title: a.title, desc: a.desc, h1: a.h1, lede: `Resin drives, block paving, tarmac, patios and landscaping in ${a.name}, laid by our own family team.`, hero: a.hero, heroAlt: a.heroAlt,
    crumbs: `<a href="/">Home</a> / <a href="/#areas">Areas covered</a> / ${a.name}`,
    main, aside: asideFor('drive', 'resin'),
    schema: { '@context': 'https://schema.org', '@graph': [{ ...bizFull, areaServed: { '@type': 'City', name: a.name } }, crumbsLd([['Home', '/'], ['Areas covered', '/#areas'], [a.name, path]])] },
  });
  fs.mkdirSync(PUB + path, { recursive: true }); fs.writeFileSync(PUB + path + 'index.html', html);
}
// 404
fs.writeFileSync(PUB + '404.html', page({ path: '/404', title: 'Page not found | Newpave Ltd', desc: 'This page could not be found.', h1: 'That page has moved.', lede: 'Our site has a new look. Everything is on the home page, or call Charles on 07787 707154.', hero: 'resin-path-curve', heroAlt: 'Curved resin path by Newpave', crumbs: '<a href="/">Home</a>', main: `<h2>Try one of these</h2>${svcLinks('')}`, aside: asideFor('drive', 'resin'), schema: { '@context': 'https://schema.org', ...bizFull } }).replace('<link rel="canonical" href="https://newpaveltd.co.uk/404">', '<meta name="robots" content="noindex">'));
console.log('pages built:', Object.keys(SERVICES).length + Object.keys(AREAS).length + 1);
