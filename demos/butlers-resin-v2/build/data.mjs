// Every fact here comes from butlersrc.co.uk (incl. iframe content), their Checkatrade profile or the
// Facebook reviews shown on their site. Sources are noted. Anything we could not verify is a PLACEHOLDER.
import { readFileSync } from 'fs';

export const SITE = {
  url: 'https://clientgateway-butlers-resin-v2.dnilicj.workers.dev',
  name: "Butler's Resin & Construction",
  legal: "Butler's Resin & Construction Ltd", // Checkatrade: BUTLER'S RESIN & CONSTRUCTION LTD
  phone: '0333 339 9898',
  tel: '+443333399898',
  email: 'info@butlersrc.co.uk',
  whatsapp: '', // PLACEHOLDER: no WhatsApp/mobile number published anywhere on their site
  town: 'Chatteris',
  county: 'Cambridgeshire',
  facebook: 'https://www.facebook.com/profile.php?id=61564695405415',
  instagram: 'https://www.instagram.com/butlersresinco/',
  checkatrade: 'https://www.checkatrade.com/trades/butlersresinandconstructionltd',
  sameAs: [
    'https://www.facebook.com/profile.php?id=61564695405415',
    'https://www.instagram.com/butlersresinco/',
    'https://x.com/ButlersrcUK',
    'https://www.checkatrade.com/trades/butlersresinandconstructionltd',
    'https://www.mybuilder.com/profile/butler-s-resin-construction-ltd',
    'https://ratedpeople.com/profile/butlers-resin-and-construction',
  ],
  // Checkatrade profile, read 2026-11-10: 10/10 from 18 reviews (not a Checkatrade member)
  ctScore: '10/10',
  ctCount: 18,
};

// Their homepage FAQ, word for word.
export const FAQ = [
  ['What’s the difference between resin-bound and resin-bonded surfaces?', 'Resin-bound is permeable, smooth, and ideal for driveways. The stones are fully mixed with resin before being laid. Resin-bonded is rougher, less durable, and uses resin as a base with loose stone scattered over it.'],
  ['How long does a resin driveway or paved surface last?', 'A properly installed resin-bound surface can last 10 to 15 years or more with basic maintenance and care. Block paving and tarmac also have similar lifespans, depending on weather and use.'],
  ['Is a resin driveway permeable/SUDS compliant?', 'Yes - resin-bound driveways are fully permeable if installed on a proper open-graded base. This can help avoid planning permission in some areas.'],
  ['Can resin be laid over existing surfaces?', 'Sometimes. Resin can be installed over concrete or tarmac if the base is structurally sound. However, we always assess the condition first, a weak base means we recommend a full dig-out and rebuild.'],
  ['Can you combine resin with other features?', 'Absolutely. We can integrate block edging, steps, ramps, fencing, garden borders, and even custom patterns to match your design vision.'],
  ['How long does installation take?', 'Most standard domestic driveways take 4-6 days. Larger or more complex sites may take longer, but we always confirm timelines in advance.'],
  ['Can I drive on my resin driveway straight after installation?', 'We recommend waiting 24 to 48 hours before walking or driving on your new resin surface. This ensures the resin fully cures and reaches its maximum strength.'],
  ['Will weeds grow through my resin or paving surface?', 'No. Resin-bound surfaces are sealed and compact, so weeds can’t grow through. However, seeds landing on top can still sprout, so occasional sweeping or light weeding is advised.'],
];

// "Why Butler's" block on their homepage (iframe), word for word.
export const WHY = [
  ['clock', 'Fast installation', 'Most projects are completed in 4–6 days, and we confirm your timeline before we start.'],
  ['palette', 'Custom colours & designs', 'Pick your blend, then add borders, steps or patterns, right up to one-off inlays like our compass designs.'],
  ['shield', 'Durable & long-lasting', 'A properly installed resin bound surface can last 10–15 years or more with basic care.'],
  ['drop', 'No planning consent', 'Laid on an open-graded base, resin bound is fully permeable and SUDS compliant, which can avoid the need for planning permission.'],
  ['grip', 'Slip-resistant finish', "A textured finish that's comfortable underfoot and keeps its grip, even in the wet."],
  ['check', 'Guaranteed workmanship', 'We assess every site first. If the base is weak, we dig out and rebuild rather than cover it up.'],
];

// Their services page (iframe SERVICES list). Copy and bullet points are theirs.
export const SERVICES = [
  { slug: 'resin-bound-driveways', name: 'Resin bound driveways', short: 'Resin driveways', kind: 'resin',
    title: 'Resin Bound Driveways in Cambridgeshire',
    copy: "We're passionate about delivering high-quality resin bound driveways that transform your property. Our team, with over a decade in the industry, crafts custom designs using Resin Mill products, ensuring durability and style. Kerb appeal comes as standard.",
    points: ['Resin Mill Elite Approved Installers', 'Custom colours & border designs', 'Permeable, low-maintenance finish'],
    imgs: ['223.jpg', '484808449_122149990130489846_85722087907043665.jpg', 'WhatsApp Image 2025-09-10 at 12.18.59 AM.jpeg', 'dji_fly_20241223_143928_0027_1734965263233_pho.jpg', 'IMG-20241106-WA0008.jpg', 'IMG-20241103-WA0024.jpg', 'IMG-20241026-WA0010.jpg', 'IMG-20240829-WA0002-5867964.jpg', 'WhatsApp Image 2025-07-19 at 2.08.01 PM (3).jpeg', '474112068_122141477042489846_51661432191794287.jpg', 'WhatsApp Image 2025-10-05 at 3.40.14 PM.jpeg'] },
  { slug: 'resin-patios-paths', name: 'Resin patios & paths', short: 'Patios & paths', kind: 'resin',
    title: 'Resin Bound Patios & Paths in Cambridgeshire',
    copy: "Resin isn't just for driveways. Yards, pathways, patios and surrounds get the same durable, permeable finish, laid wherever you need it. Smooth underfoot, easy to maintain, and built to handle British weather.",
    points: ['Yards, paths, patios & surrounds', 'Same Resin Mill quality throughout', 'Smooth, permeable, weed-free finish'],
    imgs: ['558901806_122180026970489846_13156635436352577.jpg', 'WhatsApp Image 2025-08-11 at 8.39.46 AM (1).jpeg', 'WhatsApp Image 2025-08-01 at 10.24.08 AM (4).jpeg', 'WhatsApp Image 2025-07-05 at 12.35.33 PM.jpeg', 'rest.jpg'] },
  { slug: 'block-paving', name: 'Block paving', short: 'Block paving', kind: 'block',
    title: 'Block Paving Driveways & Patios in Cambridgeshire',
    copy: "Discover the charm of block paving with Butler's. We craft beautiful driveways, patios and outdoor spaces using top-quality materials, tailored to your preferences. Every project is completed to a high standard, adding value to your property.",
    points: ['Herringbone, basketweave & custom patterns', 'Proper sub-base preparation', 'Adds real value to your property'],
    imgs: ['WhatsApp Image 2026-05-10 at 12.32.51 PM.jpeg', 'WhatsApp Image 2026-06-03 at 8.05.12 PM.jpeg', 'WhatsApp Image 2025-07-11 at 7.22.32 PM.jpeg', 'butlersrscn.jfif'] },
  { slug: 'fencing', name: 'Fencing', short: 'Fencing', kind: 'fence',
    title: 'Fencing in Chatteris & Cambridgeshire',
    copy: "Enhance your property's privacy and style with Butler's fencing. Our team crafts sturdy, attractive fences tailored to your needs, blending seamlessly with your outdoor space to create a secure and welcoming environment.",
    points: ['Closeboard, panel & sleeper options', 'Concrete or timber posts', 'Straight lines, solid footings'],
    imgs: ['WhatsApp Image 2026-04-12 at 10.13.25 PM (1).jpeg', '686937751_122202943262489846_36299747764834677.jpg', 'WhatsApp Image 2026-07-14 at 4.25.04 AM.jpeg', 'WhatsApp Image 2025-06-27 at 11.33.46 PM.jpeg'] },
  { slug: 'drop-kerbs', name: 'Drop kerbs', short: 'Drop kerbs', kind: 'kerb',
    title: 'Drop Kerbs by NRSWA Qualified Installers',
    copy: 'Need vehicle access to your new driveway? As NRSWA Qualified professionals, we handle drop kerb installations properly, from council approval to final finish, so your driveway is legal, accessible and done right.',
    points: ['NRSWA Qualified for highway work', 'Guidance through council approval', 'Tied in cleanly with your driveway'],
    imgs: ['533237719_122173023290489846_63775818444234112.jpg'] },
  { slug: 'pressure-washing', name: 'Pressure washing', short: 'Pressure washing', kind: 'wash',
    title: 'Driveway & Patio Pressure Washing',
    copy: "Refresh your outdoor areas with Butler's pressure washing. We expertly clean driveways, patios and more, restoring them to their original shine and preparing them for their next transformation.",
    points: ['Driveways, patios & paths', 'Restores colour & finish', 'Ideal prep before resealing'],
    imgs: ['IMG-20241005-WA0021.jpg', 'IMG-20241005-WA0017.jpg', 'WhatsApp Image 2026-04-26 at 12.10.56 AM (1).jpeg'] },
  { slug: 'tiling-flooring', name: 'Tiling & flooring', short: 'Tiling & flooring', kind: 'interior',
    title: 'Tiling & Interior Flooring',
    copy: "Whether it's a kitchen splashback, bathroom walls or a full wet room, Butler's delivers tiling that's built to last and finished to perfection. We work with porcelain, ceramic and natural stone, handling everything from surface prep to grouting.",
    copy2: 'From luxury vinyl and laminate to engineered hardwood, Butler\'s can transform any room from the ground up. We handle full floor preparation, underlay and fitting, making sure every plank sits flush and every transition is clean.',
    points: ['Kitchens, bathrooms & wet rooms', 'LVT, laminate & engineered wood', 'Full prep & underlay included'],
    imgs: ['WhatsApp Image 2026-06-18 at 3.49.50 PM (1).jpeg', 'WhatsApp Image 2026-04-03 at 9.28.41 AM (3).jpeg', '469893793_122135631308489846_56260155980723971.jpg', 'WhatsApp Image 2026-04-03 at 9.28.41 AM.jpeg'] },
];

// Resin Mill blends they name on their project pages, with the swatch photos from their site.
export const BLENDS = [
  { key: 'verona', name: 'Verona', img: 'verona-stone-mix-1-5mm-100kg-977969.webp', tone: '#b48c5e' },
  { key: 'dove-grey', name: 'Dove Grey', img: 'images.jpg', tone: '#9a9ea2' },
  { key: 'aspen', name: 'Aspen', img: 'aspen-uv-resin-bound-mix-933513.jpg', tone: '#c9c3b8' },
  { key: 'sorrento', name: 'Sorrento', img: 'sorrento.webp', tone: '#b9b2a6' },
  { key: 'cotswold', name: 'Cotswold', img: 'cotswold-stone-mix-1-5mm-100kg-133690.webp', tone: '#c8ab78' },
  { key: 'spring-haze', name: 'Spring Haze', img: 'spring-haze-336817.webp', tone: '#b98d4f' },
  { key: 'evening-rose', name: 'Evening Rose', img: 'evening-rose-non-uv-resin-bound-mix-823326.jpg', tone: '#9a5a44' },
  { key: 'transcendence', name: 'Transcendence', img: 'transcendence-234801.jpg', tone: '#a0703f' },
];
const SWATCH = new Set(BLENDS.map((b) => b.img).concat(['sorrento-stone-mix-1-5mm-100kg-804709.webp', 'AspexnUvMix.webp']));

// Their before/after slider pairs (homepage iframe), in their order.
export const PAIRS = [
  { label: 'Steps & drive', before: '483104742_122149989704489846_27989574506441670.jpg', after: '484069291_122149990076489846_44392655556235403.jpg', project: 'garden-to-driveway-conversion-rochester' },
  { label: 'Block paving', before: 'WhatsApp Image 2026-05-10 at 12.32.33 PM.jpeg', after: 'WhatsApp Image 2026-05-10 at 12.32.51 PM.jpeg' },
  { label: 'Bathroom', before: 'fda4100b-b67f-4afe-82da-f0dfcc3597e2.jpeg', after: 'WhatsApp Image 2026-04-03 at 9.28.41 AM (3).jpeg', project: 'full-interior-renovation-cambridgeshire' },
  { label: 'Garden', before: 'WhatsApp Image 2026-03-21 at 6.22.41 PM (4).jpeg', after: 'WhatsApp Image 2026-03-21 at 6.22.41 PM.jpeg', project: 'full-garden-transformation-with-porcelain-patio-thorney' },
];

// Cover photo per project = the photo their Recent Projects page uses on the card.
const COVER = {
  '/fencing-%26-resin-warboys': 'WhatsApp Image 2026-04-12 at 10.13.25 PM (2).jpeg',
  '/resin-bound-huntingdon': 'WhatsApp Image 2026-04-12 at 10.09.21 PM.jpeg',
  '/interior-renovation': '660997968_122199604070489846_62875111072589199.jpg',
  '/project-thorney-porcelain': 'WhatsApp Image 2026-03-21 at 6.22.40 PM (4).jpeg',
  '/sawtry-resin-upgrade': 'WhatsApp Image 2025-12-13 at 6.24.00 PM.jpeg',
  '/chatteris-front-entrance': 'WhatsApp Image 2025-10-05 at 3.40.14 PM.jpeg',
  '/norwich-resin-upgrade': 'WhatsApp Image 2025-12-01 at 10.29.30 PM (1).jpeg',
  '/huntingdon-garden-trans': 'WhatsApp Image 2025-10-09 at 9.59.33 PM.jpeg',
  '/path-in-mepal': 'WhatsApp Image 2025-09-27 at 5.18.37 PM (3).jpeg',
  '/ely-fence-and-resin-trans': 'WhatsApp Image 2025-09-10 at 12.18.59 AM.jpeg',
  '/saffronwalden': 'WhatsApp Image 2025-08-17 at 12.40.07 AM.jpeg',
  '/resinpathlittleport': 'WhatsApp Image 2025-08-11 at 8.39.46 AM (1).jpeg',
  '/resinpathandpationewmarch': 'WhatsApp Image 2025-08-01 at 10.24.08 AM (1).jpeg',
  '/bedfordresin': 'WhatsApp Image 2025-07-19 at 2.08.01 PM (3).jpeg',
  '/precision-paving%2Ffence': 'WhatsApp Image 2025-07-11 at 7.22.32 PM.jpeg',
  '/project-evening-rose': 'WhatsApp Image 2025-07-05 at 12.35.33 PM.jpeg',
  '/project-fence-29%2F06%2F2025': 'WhatsApp Image 2025-06-27 at 11.33.46 PM.jpeg',
  '/project-recent-25%2F06%2F2025': 'WhatsApp Image 2025-06-24 at 11.43.13 PM.jpeg',
  '/garden-to-driveway': '484069291_122149990076489846_44392655556235403.jpg',
  '/project-spotlight': 'project_fencing_after.jpg',
};
// Short summaries = the card text on their Recent Projects page.
const CARD = {
  '/fencing-%26-resin-warboys': 'Old fencing out, composite panels and fresh resin in. This Warboys customer wanted full privacy, a clean patio and a low-maintenance path that worked year round.',
  '/resin-bound-huntingdon': "Old slabs out, fresh resin in. Verona resin bound with charcoal block edging, installed using Resin Mill products.",
  '/interior-renovation': 'New tiled flooring throughout, modern bathroom upgrade, walls and door installations and thorough layout planning.',
  '/project-thorney-porcelain': 'A returning customer: a premium porcelain patio (multicolour slate & anthracite edgings) alongside new natural turf.',
  '/sawtry-resin-upgrade': 'A complete front yard resin-bound transformation with precise new edging and a UV-stable aggregate blend.',
  '/chatteris-front-entrance': 'The old gravel surface was replaced with a clean resin-bound finish, without sacrificing the greenery of the trees.',
  '/norwich-resin-upgrade': 'New edging, smooth finish, UV-stable blend, and zero maintenance stress. Simple upgrade, big difference.',
  '/huntingdon-garden-trans': 'A traditional lawn turned into a resin-bound garden, accented by circular features and dark edging.',
  '/path-in-mepal': 'The old, tired concrete walkway was replaced with a sleek resin-bound finish.',
  '/ely-fence-and-resin-trans': 'An untidy gravel surface replaced with a smooth, hard-wearing resin-bound finish.',
  '/saffronwalden': 'Driveway and backyard: tired paving replaced with resin bound, framed with neat block edging.',
  '/resinpathlittleport': 'Cracked concrete turned into a resin-bound pathway and patio beside an artificial lawn.',
  '/resinpathandpationewmarch': 'Uneven surfaces replaced with a seamless resin-bound front walkway and a new rear patio.',
  '/bedfordresin': 'An overgrown front garden turned into a SUDS-compliant resin driveway and path with crisp block edging.',
  '/precision-paving%2Ffence': 'A patchy lawn and ageing concrete path reimagined into a clean, modern frontage.',
  '/project-evening-rose': 'The existing surface removed and replaced with an Evening Rose resin-bound driveway.',
  '/project-fence-29%2F06%2F2025': 'Worn, damaged fencing replaced with timber panels on clean concrete posts.',
  '/project-recent-25%2F06%2F2025': 'A light grey resin-bound patio framed with a bold charcoal edge border.',
  '/garden-to-driveway': 'A multi-level front entrance: resin driveway and resin staircase with contrasting block edges, in Aspen.',
  '/project-spotlight': 'A resin-bound driveway paired with custom timber fencing.',
};
const KIND = {
  '/interior-renovation': 'interior', '/project-thorney-porcelain': 'patio', '/precision-paving%2Ffence': 'paving',
  '/project-fence-29%2F06%2F2025': 'fence',
};

// Approx. town centres (WGS84) for distance and nearby-work matching.
export const GEO = {
  Chatteris: [52.456, 0.053], March: [52.551, 0.088], Ely: [52.399, 0.262], Wisbech: [52.666, 0.159],
  Huntingdon: [52.331, -0.183], 'St Ives': [52.333, -0.075], Ramsey: [52.450, -0.106], Warboys: [52.400, -0.081],
  Sawtry: [52.437, -0.282], Whittlesey: [52.558, -0.130], Peterborough: [52.573, -0.243], Thorney: [52.620, -0.106],
  Mepal: [52.402, 0.112], Littleport: [52.458, 0.306], Yaxley: [52.515, -0.258], Norwich: [52.630, 1.297],
  'Saffron Walden': [52.022, 0.243], Bedford: [52.136, -0.467], Romford: [51.575, 0.183], Rochester: [51.388, 0.506],
  'Southend-on-Sea': [51.538, 0.714], Cambridgeshire: [52.40, 0.0],
};
export const miles = (a, b) => {
  const [la1, lo1] = GEO[a], [la2, lo2] = GEO[b], r = Math.PI / 180;
  const d = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2;
  return 3959 * 2 * Math.asin(Math.sqrt(d));
};

// Area pages. Intros are ours; geography only, nothing claimed about the business beyond their site.
export const AREAS = [
  { town: 'Chatteris', slug: 'chatteris', intro: "Chatteris is home. Butler's Resin & Construction is based here, so a site visit in town or out in the surrounding fen villages is a short drive for us, and so is popping back if you have a question once the job is finished.", local: 'Two of the projects on this site are in Chatteris itself: a front entrance laid round the existing trees, and a back garden turned into a light grey resin patio with a charcoal edge.' },
  { town: 'March', slug: 'march', intro: 'March sits just up the A141 from our Chatteris base, which makes it one of the easiest towns for us to cover. Front paths, side access and back patios come up a lot here, as well as full driveways.', local: 'In March we replaced uneven surfaces at the front and side of a property with a seamless resin-bound walkway, then built a new resin patio in the back garden.' },
  { town: 'Ely', slug: 'ely', intro: 'Ely, the cathedral city, is across the fen from Chatteris on the A142 through Mepal and Sutton. We lay resin driveways, paths and patios in the city and in the villages around it, from Littleport down to Sutton and Witchford.', local: 'Our Ely driveway replaced an untidy gravel surface with a smooth, hard-wearing resin-bound finish, and two more jobs sit either side of the city: a path in Mepal and a garden pathway and patio in Littleport.' },
  { town: 'Wisbech', slug: 'wisbech', intro: 'Wisbech, the Georgian port town on the River Nene, is in our patch to the north. Older town houses and newer estates both suit resin bound: it can follow curved edges and steps, and it lets rainwater drain straight through.', local: 'The nearest jobs on this site are our resin path and patio in March and the porcelain garden in Thorney, both a short run from Wisbech.' },
  { town: 'Huntingdon', slug: 'huntingdon', intro: 'Huntingdon, the market town on the River Great Ouse, is where several of our recent projects are. We have laid patios, gardens and fencing here.', local: 'Three of our recent projects are in Huntingdon: a Verona resin patio with charcoal block edging, a lawn turned into a resin garden with circular features, and a full timber fencing replacement.' },
  { town: 'St Ives', slug: 'st-ives', intro: "St Ives, the riverside town on the Great Ouse just east of Huntingdon, is a short drive from our base. We quote resin driveways, patios and paths here and in the villages around it, and we'll always assess the base before recommending anything.", local: 'Nearby work on this site includes our Warboys patio and path with composite fencing, and three jobs in Huntingdon a few miles along the river.' },
  { town: 'Ramsey', slug: 'ramsey', intro: 'Ramsey, the Fenland market town west of Chatteris, is well within our area. Turning a front garden into parking, or replacing tired gravel with resin, is exactly the kind of job we do.', local: 'The closest projects on this site are in Warboys, just south of Ramsey, and the resin front yard in Sawtry to the west.' },
  { town: 'Warboys', slug: 'warboys', intro: 'Warboys sits on the A141 between Chatteris and Huntingdon, a few minutes from our base, and we have worked in the village.', local: 'In Warboys we took out old timber fencing, put in dark grey composite panels, and laid a Dove Grey resin patio and path with block edging.' },
  { town: 'Sawtry', slug: 'sawtry', intro: 'Sawtry, the village just off the A1 north of Huntingdon, is on the western edge of the area we cover. Front gardens and driveways that need low maintenance are where resin bound earns its keep.', local: 'Our Sawtry project was a complete front yard resin-bound transformation, with precise new edging and a UV-stable aggregate blend laid round the existing planting.' },
  { town: 'Whittlesey', slug: 'whittlesey', intro: 'Whittlesey, the market town between Peterborough and March, is a straightforward drive from Chatteris. We quote driveways, paths, patios and drop kerbs here, and for the kerb we handle the highway side too as NRSWA qualified installers.', local: 'Jobs on this site close to Whittlesey include the porcelain garden in Thorney, our March path and patio, and an Evening Rose driveway in Yaxley.' },
  { town: 'Peterborough', slug: 'peterborough', intro: 'We cover Peterborough and its villages, from Yaxley in the south to Thorney in the east. Resin bound suits new-build frontages and older brick houses alike.', local: 'In Yaxley, Peterborough, we removed the existing surface and laid a durable Evening Rose resin-bound driveway that complements the surrounding brickwork.' },
  { town: 'Thorney', slug: 'thorney', intro: 'Thorney, the village east of Peterborough, is in our area and is where one of our returning customers lives. We do full garden transformations here as well as resin driveways and paths.', local: 'Our Thorney project turned an entire garden into a clean outdoor space: a premium porcelain patio with multicolour slate and anthracite edgings, laid alongside new natural turf.' },
];

const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Projects from their project pages.
export function loadProjects(manifest) {
  const raw = JSON.parse(readFileSync(new URL('../src/raw/projects.json', import.meta.url)));
  return raw.map((p) => {
    const [name, placeRaw] = p.title.split(/\s*[–-]\s*(?=[A-Z][^–-]*$)/);
    const place = (placeRaw || '').trim();
    const town = Object.keys(GEO).find((t) => place.startsWith(t) || place.includes(t)) || 'Cambridgeshire';
    const blendM = p.body.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?) (?:UV(?:-Stable)? )?Resin Mix/);
    const blend = blendM ? blendM[1] : null;
    const photos = p.imgs.map((s) => {
      const [u, alt] = s.split(' || ');
      const file = decodeURIComponent(u.split('/:/')[0].split('/').pop());
      return { file, alt: (alt || '').trim() };
    }).filter((x) => !SWATCH.has(x.file) && !/BeforeandAfter|Simple Before/.test(x.file) && manifest[x.file]);
    const cover = COVER[p.href];
    if (cover && !photos.find((x) => x.file === cover)) photos.unshift({ file: cover, alt: '' });
    const lines = p.body.split('\n').map((l) => l.trim()).filter(Boolean).slice(1); // drop the caps title
    return {
      href: p.href, slug: slugify(p.title), name: name.trim(), place: place || 'Cambridgeshire', town, blend,
      kind: KIND[p.href] || 'resin', cover: cover || photos[0]?.file, summary: CARD[p.href] || '', photos, lines,
      old: 'https://butlersrc.co.uk' + p.href,
    };
  });
}

const R = JSON.parse(readFileSync(new URL('./reviews.json', import.meta.url)));
// Checkatrade: name only where Checkatrade shows one; job location is the postcode district Checkatrade shows.
export const REVIEWS_CT = R.ct.map((r) => ({
  source: 'Checkatrade', title: r.title === 'Simarjit Sharma' ? null : r.title,
  name: r.title === 'Simarjit Sharma' ? 'Simarjit Sharma' : r.nameAfter || 'Verified reviewer',
  date: /\d{4}/.test(r.date) ? r.date.replace(/^0/, '') : r.date + ' 2026', loc: r.loc, text: r.text, job: r.cat, partial: r.truncated,
}));
export const REVIEWS_FB = R.fb.map((r) => ({ source: 'Facebook', name: r.name, date: r.date, text: r.text, stars: r.stars }));
