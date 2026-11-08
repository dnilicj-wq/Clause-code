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
  company: 'Proficient Essex',
  legalName: 'PROFICIENT ESSEX LTD',
  companyNo: '15008622',
  shortName: 'Proficient',
  trade: 'epoxy' as string, // unused on this demo: the page reads config/driveway.ts
  preset: 'proficient-gold' as const,
  town: 'Tilbury',
  region: 'Essex',
  areaLine: 'Essex and the surrounding areas',
  phone: '07402 743731',
  whatsapp: '447402743731',
  email: 'proficient.essex@gmail.com',
  owner: { first: 'Matt', name: 'Matt', photo: '' as string, photoIsStandIn: false, signature: 'Matt' },
  ownerNote: '',
  hours: 'Mon to Sat, 8am to 5pm',
  responseTime: 'quickly',
  areas: ['Tilbury', 'Essex and the surrounding areas'],
  socials: { facebook: '', instagram: '', google: 'https://www.google.com/maps/place/Proficient+Essex/data=!4m7!3m6!1s0xee2e3c0d1b4c405:0x1ef0ff5c742064eb!8m2!3d51.514285!4d0.4359656' },
  proof: { rating: 5.0, reviewCount: 56, yearsTrading: 0, floorsDone: 0 },
  guarantee: { title: 'All work is guaranteed', text: 'All work is guaranteed.' },
  reviews: [
    { name: '', title: 'Definitely recommend!', date: 'April 2023', source: 'Google', url: 'https://proficientessex.co.uk/',
      text: 'I could not be happier with the work Proficient have done for me, I would definitely recommend them to anyone!' },
    { name: '', title: 'Brilliant company', date: 'May 2023', source: 'Google', url: 'https://proficientessex.co.uk/',
      text: 'Brilliant company, Proficient are highly knowledgable and did way more than what was expected of them.' },
    { name: '', title: 'Very reliable', date: 'June 2023', source: 'Google', url: 'https://proficientessex.co.uk/', job: 'Resin driveway',
      text: 'Proficient Essex are very reliable, came always on time and never let us down. Very happy with the end results our new resin driveway looks fantastic.' },
    { name: '', title: 'High standard of work', date: 'June 2023', source: 'Google', url: 'https://proficientessex.co.uk/', job: 'Patio',
      text: 'The Proficient Essex team were very polite and answered my questions which put me right at ease, they knew exactly what they were talking about and the results showed that, superb work our garden has been transformed with the new patio!' },
  ] as Review[],
  posters: { d: '/posters/drive-d-v1.webp', m: '/posters/drive-m-v1.webp' },
  formEndpoint: '', // empty = no data stored; the lead is handed to WhatsApp
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
