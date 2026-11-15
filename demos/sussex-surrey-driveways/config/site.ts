// Business facts. This is the ONLY file /new-lead edits for a prospect.
// Every claim here must have a source line in demos/<slug>/content-inventory.md,
// or stay clearly labelled as an example (demo: true).

export type Review = {
  name: string;          // as written on the source (e.g. "Sarah K.")
  town?: string;
  text: string;          // word for word
  rating?: number;       // only if the source shows it
  source: 'Google' | 'Facebook' | 'Checkatrade' | 'Trustpilot' | 'Website' | 'Example' | 'Sample';
  url?: string;
  job?: string;
  title?: string;        // the review's own heading, if it has one
  date?: string;
};

export const site = {
  demo: false,
  sample: false,
  company: 'Sussex & Surrey Driveways',
  shortName: 'Sussex & Surrey',
  trade: 'epoxy' as string, // unused on this demo: the page reads config/driveway.ts
  preset: 'stag-royal' as const,
  town: 'Horsham',
  region: 'West Sussex',
  areaLine: 'Sussex and Surrey',
  phone: '01403 541202',
  whatsapp: '447480370898',
  whatsappDisplay: '07480 370898',
  email: 'info@sussexandsurreydrivewaysltd.co.uk',
  owner: { first: '', name: '', photo: '' as string, photoIsStandIn: false, signature: '' },
  ownerNote: '',
  hours: '',
  responseTime: 'quickly',
  // towns named on their own site or in their testimonials (content-inventory.md)
  areas: ['Horsham', 'Crawley', 'Guildford', 'Farnham', 'Leatherhead'],
  socials: { facebook: '', instagram: '', google: 'https://www.google.com/maps?cid=14095722858543339866' },
  proof: { rating: 5.0, reviewCount: 13, yearsTrading: 0, floorsDone: 0 },
  guarantee: { title: '', text: '' },
  // Their four testimonials, word for word from sussexandsurreydrivewaysltd.co.uk (home page), names exactly as shown.
  reviews: [
    { name: 'James Badham', town: 'Crawley', title: 'Tarmac driveway', job: 'Tarmac driveway', source: 'Website', url: 'https://sussexandsurreydrivewaysltd.co.uk/',
      text: 'We obtained several quotes with a massive difference in price. Sussex & Surrey Driveways were very competitive in price but were also the most impressive with their knowledge and enthusiasm.\nThe job included widening the drive plus adding a turning area. We were so pleased with the result that we gave him another job almost immediately.\nThoroughly recommended and very happy with our new driveway. Thank you.' },
    { name: 'Mr & Mrs Hodgeson', town: 'Guildford', title: 'Absolutely transformed our garden', job: 'Patio and garden landscaping', source: 'Website', url: 'https://sussexandsurreydrivewaysltd.co.uk/',
      text: 'We used Sussex & Surrey Driveways for our new patio and garden landscaping.\nThey have absolutely transformed our garden and we are so pleased with the results.\nFriendly and hard working team. Thank you!' },
    { name: 'Bill Rawson', town: 'Farnham', title: 'New block paving driveway', job: 'Block paving driveway', source: 'Website', url: 'https://sussexandsurreydrivewaysltd.co.uk/',
      text: 'First class job! Everything from start to finish was excellent and to a really high standard. My wife and I are so pleased with the way its looks. The drive and the front of our house has been transformed. We would highly recommend the team.\nAttention to detail was everything you could wish for and nothing was too much trouble.' },
    { name: 'Mrs Stacey', town: 'Leatherhead', title: 'New garden fencing', job: 'Garden fencing', source: 'Website', url: 'https://sussexandsurreydrivewaysltd.co.uk/',
      text: 'Fantastic workmanship by all the team \u2013 Very impressed with the quality of the work and I wouldn\u2019t hesitate to recommend Sussex & Surrey Driveways to anyone looking for fencing work to be done.\nCourteous, polite and tidy workforce who did not damage any of my plants or flowers despite working within inches of them. I could not be any happier.' },
  ] as Review[],
  heroStyle: 'slabs' as 'slabs' | 'gravel',
  slabPosters: { d: '/posters/ssd-d-v1.webp', m: '/posters/ssd-m-v1.webp' },
  posters: { d: '/posters/ssd-d-v1.webp', m: '/posters/ssd-m-v1.webp' },
  formEndpoint: '', // empty = no data stored; the request is handed to WhatsApp
};

export type Site = typeof site;

// ?company=&town=&phone= personalisation for outreach links (demo only).
export function personalise(s: Site): Site {
  if (typeof window === 'undefined') return s;
  const q = new URLSearchParams(location.search);
  const out = { ...s };
  const c = q.get('company'); const t = q.get('town'); const p = q.get('phone');
  if (c) { out.company = c.slice(0, 60); out.shortName = c.split(' ')[0].slice(0, 30); }
  if (t) { out.town = t.slice(0, 40); out.areas = [t.slice(0, 40), ...s.areas.filter(a => a !== t)]; }
  if (p && /^[0-9 +()-]{6,20}$/.test(p)) { out.phone = p; out.whatsapp = p.replace(/\D/g, '').replace(/^0/, '44'); }
  return out;
}
