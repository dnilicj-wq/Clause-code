// Page content for the Aspect Drives & Patios demo. Business claims are sourced in content-inventory.md.
// "Why resin" is general facts about resin-bound surfaces, written as such (not as their claims).

export type Photo = { key: string; title: string; alt: string; w: number; h: number; big: boolean; kind: string };
/// His own job photos (Checkatrade album and review photos of his work, 8 Nov 2026).
export const photos: Photo[] = [
  { key: 'block-herringbone', title: 'Herringbone block paving', alt: 'Red brindle herringbone block-paved driveway with a charcoal border beside a lawn', w: 1280, h: 1706, big: true, kind: 'Block paving' },
  { key: 'resin-border', title: 'Resin drive, block border', alt: 'Grey resin-bound driveway framed by a charcoal block border, in front of a semi', w: 1280, h: 1707, big: true, kind: 'Resin' },
  { key: 'patio-curve', title: 'Sandstone patio round a lawn', alt: 'Sandstone patio curving round a lawn, with a charcoal kerb', w: 1280, h: 1706, big: true, kind: 'Patio' },
  { key: 'block-wide', title: 'A big grey block drive', alt: 'Wide grey block-paved driveway with a curved gravel bed', w: 1280, h: 960, big: true, kind: 'Block paving' },
  { key: 'patio-porcelain', title: 'Dark porcelain patio', alt: 'Dark porcelain patio across the back of a house with a conservatory', w: 1280, h: 960, big: true, kind: 'Patio' },
  { key: 'block-diamond', title: 'Block paving with a diamond inlay', alt: 'Grey block driveway with a diamond inlay and charcoal border to a front door', w: 1280, h: 1706, big: true, kind: 'Block paving' },
  { key: 'patio-sandstone', title: 'Indian sandstone patio', alt: 'Warm Indian sandstone patio beside a fence', w: 1207, h: 1600, big: true, kind: 'Patio' },
  { key: 'block-silver', title: 'Charcoal drive, silver border', alt: 'Charcoal block-paved driveway with a silver-grey border in front of a house', w: 1280, h: 1706, big: true, kind: 'Block paving' },
];
export const photoSrc = (p: Photo | string, size: 640 | 1280 = 1280) => {
  const k = typeof p === 'string' ? p : p.key; const big = typeof p === 'string' ? true : p.big;
  return `/client/${k}-${size === 1280 && big ? 1280 : 640}-v1.webp`;
};

// How it works: from his Checkatrade profile ("Free Estimates", design) and what reviewers describe (a visit to talk through ideas, kept informed on site).
export const process = [
  { title: 'Get in touch', text: 'Call, WhatsApp or send your design from this page.' },
  { title: 'A visit and a free estimate', text: 'Gerald comes out, talks through ideas, colours and what suits your home, and prices it. Free estimates.' },
  { title: 'Kept in the loop', text: 'Reviewers say they were told who would be on site, how long each stage would take and what came next.' },
  { title: 'Laid and finished', text: 'In his own words: “All our work is guaranteed for many years.”' },
];

// General facts about resin-bound surfaces (not claims about this business).
export const whyResin = [
  { key: 'drain', title: 'Rain drains through', text: 'Resin-bound stone is porous, so rainwater soaks through the surface instead of sitting in puddles or running into the road.' },
  { key: 'weeds', title: 'No weeds in the joins', text: 'There are no joints or cracks for seeds to settle in, so you are not pulling weeds out of the drive every spring.' },
  { key: 'sweep', title: 'Easy to look after', text: 'The stones are locked in place, so there is no loose gravel. An occasional sweep and wash keeps it looking good.' },
];

// From his own Checkatrade profile (description, skills, company info), plus one about this page's prices.
export const faq = [
  { q: 'Is there a guarantee?', a: 'Yes. In his own words: “All our work is guaranteed for many years.” Ask Gerald for the terms for your job.' },
  { q: 'Is the estimate free?', a: 'Yes. Free estimates, for domestic and commercial work.' },
  { q: 'What do you lay?', a: 'Block paving, resin bound and bonded driveways, patios and paving, concrete and polished concrete, gravel and shingle drives and permeable paving. Driveway repairs, cleaning and sealing, and design too.' },
  { q: 'Is the price on this page my quote?', a: 'No. It is an example range to help you plan. Gerald gives you the real price in a free estimate.' },
];
