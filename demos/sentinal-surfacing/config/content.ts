// Page content for the Sentinal Surfacing demo. Business claims are sourced in content-inventory.md.
// Place names come from the file names of their own photos on sentinalsurfacing.co.uk.

export type Photo = { key: string; title: string; place: string; alt: string; w: number; h: number; kind: string };
// Their own resin jobs (portfolio / home page of sentinalsurfacing.co.uk).
export const photos: Photo[] = [
  { key: 'durham-court', title: 'Resin courtyard and drive', place: 'Durham', alt: 'Large resin-bound courtyard round a formal hedge garden in front of a stone house', w: 1600, h: 900, kind: 'Resin bound' },
  { key: 'darras-hall', title: 'Resin driveway', place: 'Darras Hall, Tyne and Wear', alt: 'Pale resin-bound driveway in front of a brick house with two cars', w: 2049, h: 1537, kind: 'Resin bound' },
  { key: 'wetherby-night', title: 'Lit resin drive', place: 'Wetherby', alt: 'Resin driveway at night with lit stone walls curving round it', w: 1200, h: 1600, kind: 'Resin bound' },
  { key: 'irthington', title: 'Sweeping resin drive', place: 'Irthington, Carlisle', alt: 'Grey resin-bound drive curving past a large house with a block border', w: 1600, h: 1200, kind: 'Resin bound' },
  { key: 'houghton', title: 'Golden resin forecourt', place: 'Houghton-le-Spring', alt: 'Golden resin-bound forecourt in front of a brick house', w: 2048, h: 1536, kind: 'Resin bound' },
  { key: 'gosforth', title: 'Resin drive with inlay', place: 'Gosforth', alt: 'Dark resin driveway with a light star inlay in front of a garage', w: 2048, h: 1152, kind: 'Resin bound' },
  { key: 'warkworth', title: 'Resin drive', place: 'Warkworth', alt: 'Grey resin-bound drive beside a white rendered house', w: 2048, h: 1536, kind: 'Resin bound' },
  { key: 'seaham', title: 'Resin footpath', place: 'Seaham Hall, Sunderland', alt: 'Resin-bound footpath winding through lawns', w: 900, h: 675, kind: 'Resin bound' },
];
export const photoSrc = (p: Photo | string, size: 640 | 1280 = 1280) => `/client/${typeof p === 'string' ? p : p.key}-${size}-v1.webp`;

// Inside floors: their microcement and floor photos (portfolio, Microcement tab).
export const floors = [
  { key: 'int-grey', title: 'Open-plan living floor', place: '', tag: 'Homes', w: 1280, h: 720 },
  { key: 'int-dining', title: 'Microcement bathroom walls', place: '', tag: 'Homes', w: 1280, h: 960 },
  { key: 'mc-kitchen', title: 'Kitchen floor', place: '', tag: 'Homes', w: 900, h: 675 },
  { key: 'morpeth-floor', title: 'Glossy kitchen floor', place: 'Morpeth', tag: 'Homes', w: 1280, h: 960 },
  { key: 'morpeth-gloss', title: 'Polished grey floor', place: 'Morpeth', tag: 'Homes', w: 900, h: 1600 },
  { key: 'portland-lounge', title: 'Reception floor', place: 'Portland House', tag: 'Commercial', w: 1280, h: 1271 },
  { key: 'int-hall', title: 'Open warehouse floor', place: '', tag: 'Commercial', w: 1280, h: 719 },
  { key: 'hanover', title: 'Seamless commercial floor', place: 'Hanover Point', tag: 'Commercial', w: 1280, h: 718 },
  { key: 'int-bath', title: 'Floor by the staircase', place: '', tag: 'Commercial', w: 900, h: 1600 },
] as const;

// Their story, from the "Growing With You" timeline on sentinalsurfacing.co.uk/about-us/ (wording kept, shortened slightly).
export const timeline = [
  { y: '2006', t: 'Company founded', d: 'Sentinal Surfacing established in Newcastle by Managing Director Neil Conway.' },
  { y: '2008', t: 'Sentinal Microcement', d: 'After bespoke training in Italy, Sentinal Microcement began providing walls, floors and ceilings.' },
  { y: '2010', t: 'Regional expansion', d: 'Expanded regionally and acquired Carlisle Clearstone Paving into the Sentinal family.' },
  { y: '2016', t: 'Scotland coverage', d: 'Began serving customers throughout Scotland.' },
  { y: '2017', t: 'European expansion', d: 'Swimming pool surrounds in Tenerife.' },
  { y: '2020', t: 'Increased capacity', d: 'New staff and vehicles to increase capacity.' },
  { y: '2024', t: 'Grand Designs', d: 'Selected to provide surfacing for a televised Grand Designs TV show.' },
  { y: 'Today', t: '1,000+ projects', d: 'Over 1,000 projects completed across the UK and Europe.' },
];

// How it works: their own words (contact form text + home-page FAQ).
export const process = [
  { title: 'Send your details', text: 'Fill in the form or call. Their team gets back to you with a detailed solution and a transparent quote.' },
  { title: 'Neil comes out', text: 'Customers say Neil visits, gives his expert advice on the best resin mix and does the quote himself.' },
  { title: 'Laid in days', text: 'A simple overlay is laid in one day and usable the next. With full groundworks, most projects take about 5 days start to finish.' },
];

// General facts about resin-bound surfaces (not claims about this business).
export const whyResin = [
  { key: 'drain', title: 'Rain drains through', text: 'Resin-bound stone is porous, so rainwater soaks through the surface instead of sitting in puddles.' },
  { key: 'weeds', title: 'No joints for weeds', text: 'There are no joints or cracks for seeds to settle in, so there is nothing to pull out every spring.' },
  { key: 'sweep', title: 'Easy to look after', text: 'The stones are locked in place, so there is no loose gravel. An occasional sweep and wash keeps it looking good.' },
];

// Their own FAQ answers (sentinalsurfacing.co.uk home page), word for word apart from spelling fixes, plus two about this page.
export const faq = [
  { q: 'How long does a resin driveway last?', a: 'We installed our first resin driveway over 20 years ago and it is still functional today.' },
  { q: 'How long does it take?', a: 'If it is a simple overlay, we can lay this in one day and it will be useable the next. If it requires full groundworks, we can generally from start to finish complete your project in 5 days.' },
  { q: 'What colours are available?', a: 'We can supply any colour but our standard range comprises of over 40 different colour blends to complement any style of home.' },
  { q: 'Do you do inside floors too?', a: 'Yes. Microcement floors, walls and ceilings for homes, and seamless floor coatings for commercial spaces, from high-traffic industrial units to hospital environments.' },
  { q: 'Can I get a price on this page?', a: 'No. Every job is different, so Neil gives you a transparent quote after looking at what you need. The form just sends him the details.' },
];
