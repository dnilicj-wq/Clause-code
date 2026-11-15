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
  company: 'Rhino Coating',
  shortName: 'Rhino',
  trade: 'rhino' as string,
  preset: 'rhino-violet' as const,
  town: 'Manchester',
  region: 'nationwide',
  phone: '07822 032335',
  whatsapp: '447822032335',
  email: 'info@rhinocoating.co.uk',
  // David is the contact (Dan's brief); the site names no owner and says "our own installation team", so the page says "we".
  owner: { first: '', name: '', photo: '/client/van-800-v1.webp' as string, photoAlt: 'The Rhino Coating van parked on a gravel drive', photoIsStandIn: false, signature: '' },
  ownerNote: "Most epoxy floors that fail do so because of poor surface preparation. That's why every Rhino Coating installation begins with proper diamond grinding, moisture testing and substrate repair, long before any resin is poured.",
  hours: '',
  responseTime: 'within one working day',
  areas: ['Didsbury', 'Chorlton', 'Sale', 'Timperley', 'Altrincham', 'Hale', 'Wilmslow', 'Alderley Edge', 'Nationwide'],
  socials: { facebook: '', instagram: 'https://www.instagram.com/rhino.coating/', google: '' },
  proof: { rating: 0, reviewCount: 0, yearsTrading: 0, floorsDone: 0 },
  guarantee: {
    title: '10-year workmanship warranty',
    text: 'In writing, on every installation, for 10 years from practical completion. If a defect comes from how we installed the floor, we repair or replace the affected area at no cost to you. Subject to our published terms; your statutory rights are unaffected.',
  },
  // shown as chips in the warranty card; each sourced in content-inventory.md
  credentials: ['City & Guilds trained & approved', 'Fully insured', '12 months interest-free finance, subject to status'] as string[],
  reviews: [] as Review[],
  posters: { d: '/posters/pour-d-rhino-v1.webp', m: '/posters/pour-m-rhino-v1.webp' },
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
