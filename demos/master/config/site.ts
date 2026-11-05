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
  demo: true, // shows "(example)" on reviews and "Example" labels on anything not yet sourced.
  sample: true, // MASTER ONLY: fictional business, swaps placeholders for sample content (config/sample.ts). /new-lead sets false.
  company: 'Northfield Surfaces',
  shortName: 'Northfield',
  trade: 'epoxy' as string, // key in config/trades/index.ts
  preset: 'obsidian-copper' as const,
  town: 'Leeds',
  region: 'West Yorkshire',
  phone: '0113 496 0372',          // Ofcom drama number: safe for a demo
  whatsapp: '441134960372',
  email: 'hello@example.com',
  owner: { first: 'Tom', name: 'Tom', photo: '' as string, photoIsStandIn: false, signature: 'Tom' },
  ownerNote: '', // the owner's own words, with a source; empty shows the labelled example note
  hours: 'Mon to Fri 8am to 6pm, Sat 9am to 1pm',
  responseTime: 'within 2 hours on working days',
  areas: ['Leeds', 'Wakefield', 'Harrogate', 'Bradford', 'York', 'Huddersfield', 'Halifax', 'Dewsbury'],
  socials: { facebook: '', instagram: '', google: '' },
  // Proof: real numbers only. Leave empty when the prospect has none to cite.
  proof: {
    rating: 0,          // e.g. 4.9 (only with a source)
    reviewCount: 0,
    yearsTrading: 0,
    floorsDone: 0,
  },
  guarantee: {
    title: 'Example guarantee',
    text: 'Set this to the business\'s real written guarantee. Example: if the coating lifts or peels within the guarantee period because of how we laid it, we come back and fix it free.',
  },
  reviews: [
    { name: 'Example customer', town: 'Leeds', job: 'Double garage, flake finish', source: 'Example',
      text: 'Example review. Real reviews from the business go here word for word, with where they came from.' },
    { name: 'Example customer', town: 'Harrogate', job: 'Kitchen, metallic finish', source: 'Example',
      text: 'Example review. We never write reviews for a business; this card shows the layout only.' },
    { name: 'Example customer', town: 'Wakefield', job: 'Workshop, solid colour', source: 'Example',
      text: 'Example review. Swap in Google or Facebook reviews, each one linked to where it was posted.' },
  ] as Review[],
  // Hero first-frame stills (rendered by scripts/capture.mjs in this site's preset). Keep index.html preloads in step.
  posters: { d: '/posters/pour-d-v1.webp', m: '/posters/pour-m-v1.webp' },
  formEndpoint: '', // empty = demo mode (thank-you shown, lead handed to WhatsApp)
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
