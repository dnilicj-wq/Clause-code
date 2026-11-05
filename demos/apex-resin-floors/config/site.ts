// Business facts. This is the ONLY file /new-lead edits for a prospect.
// Every claim here must have a source line in demos/<slug>/content-inventory.md,
// or stay clearly labelled as an example (demo: true).

export type Review = {
  name: string;          // as written on the source (e.g. "Sarah K.")
  town?: string;
  text: string;          // word for word
  rating?: number;       // only if the source shows it
  source: 'Google' | 'Facebook' | 'Checkatrade' | 'Trustpilot' | 'Website' | 'Example';
  url?: string;
  job?: string;
};

export const site = {
  demo: true, // master only. Shows "(example)" on reviews and "Example image" on images.
  company: 'Apex Resin Floors',
  shortName: 'Apex',
  trade: 'epoxy' as string, // key in config/trades/index.ts
  preset: 'industrial-steel' as const,
  town: 'Sheffield',
  region: 'South Yorkshire',
  phone: '0114 496 0518',          // Ofcom drama number: safe for a demo
  whatsapp: '441144960518',
  email: 'hello@example.com',
  owner: { first: '', name: '', photo: '' as string, signature: '' }, // unknown,
  hours: '', // unknown: hidden on the page
  responseTime: 'quickly',
  areas: ['Sheffield', 'Rotherham', 'Barnsley', 'Doncaster', 'Chesterfield'],
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
    { name: 'Example customer', town: 'Sheffield', job: 'Double garage, flake finish', source: 'Example',
      text: 'Example review. Real reviews from the business go here word for word, with where they came from.' },
    { name: 'Example customer', town: 'Rotherham', job: 'Kitchen, metallic finish', source: 'Example',
      text: 'Example review. We never write reviews for a business; this card shows the layout only.' },
    { name: 'Example customer', town: 'Barnsley', job: 'Workshop, solid colour', source: 'Example',
      text: 'Example review. Swap in Google or Facebook reviews, each one linked to where it was posted.' },
  ] as Review[],
  // Gemini visualiser. Off until a working (paid) GEMINI_API_KEY is set in Vercel; the button then becomes "See your price".
  visualiser: false,
  // Hero first-frame stills (rendered by scripts/capture.mjs in this site's preset). Keep index.html preloads in step.
  posters: { d: '/posters/pour-d-steel-v1.webp', m: '/posters/pour-m-steel-v1.webp' },
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
