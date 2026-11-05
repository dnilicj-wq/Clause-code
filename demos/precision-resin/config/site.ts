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
};

export const site = {
  demo: false,
  sample: false,
  company: 'Precision Resin Floors Ltd',
  shortName: 'Precision',
  trade: 'precision' as string,
  preset: 'precision-navy' as const,
  town: 'Hucknall, Nottingham',
  region: 'the East Midlands',
  phone: '07767 081502',
  whatsapp: '447767081502',
  email: '',
  owner: { first: 'Ryan', name: 'Ryan', photo: '/client/grinding-floor-1280-v1.webp' as string, photoIsStandIn: false, signature: 'Ryan',
    photoAlt: 'Diamond grinding a concrete floor before coating', photoPos: '6% 50%', photoLabel: 'On the grinder' },
  ownerNote: 'A family-run business based in Nottingham, transforming spaces with quality resin flooring for over 13 years. Long-lasting, low-maintenance, professional results.',
  hours: '7am to 8pm, 7 days',
  responseTime: 'quickly',
  areas: ['Nottingham and the East Midlands'],
  socials: { facebook: 'https://www.facebook.com/EFSflooring', instagram: '', google: '' },
  proof: { rating: 0, reviewCount: 0, yearsTrading: 13, floorsDone: 0 },
  guarantee: {
    title: 'Ask Ryan about our guarantee',
    text: 'Every floor is different. Ask Ryan what is covered for yours before you book.',
  },
  reviews: [] as Review[],
  showReviews: false,
  posters: { d: '/posters/pour-d-precision-navy-v1.webp', m: '/posters/pour-m-precision-navy-v1.webp' },
  formEndpoint: '',
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
