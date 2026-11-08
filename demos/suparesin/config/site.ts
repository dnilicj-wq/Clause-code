// Business facts. Every claim here has a source line in demos/suparesin/content-inventory.md.

export type Review = {
  name: string;          // first name only, as written on the source
  text: string;          // word for word
  town?: string;
  rating?: number;
  source: 'Google' | 'Sample';
  url?: string;
  job?: string;
  date?: string;
};

const GMAPS = 'https://www.google.com/maps/place/Suparesin+Ltd/@53.0750866,-3.02622,17z/data=!4m6!3m5!1s0x2f97c4aed8fdac8b:0x9bea93e9122c0f6e';

export const site = {
  demo: false,
  sample: false,
  company: 'Suparesin',
  legalName: 'Supacivil Resin Ltd',
  companyNo: '14882252',
  shortName: 'Suparesin',
  trade: 'epoxy' as string, // unused: the page reads config/finishes.ts
  preset: 'suparesin-gold' as const,
  town: 'Wrexham',
  region: 'Wrexham, Chester, the Wirral, Cheshire, Shropshire and North Wales',
  areaLine: 'North Wales and the borders',
  phone: '01978 257083',
  mobile: '07944 366154',
  whatsapp: '447944366154',
  email: 'info@suparesin.co.uk',
  owner: { first: 'Darren', name: 'Darren Jones', photo: '' as string, photoIsStandIn: false, signature: 'Darren' },
  ownerNote: '',
  hours: '',
  responseTime: 'quickly',
  areas: ['Wrexham', 'Chester', 'Wirral', 'Cheshire', 'Shropshire', 'North Wales'],
  socials: { facebook: '', instagram: 'https://www.instagram.com/suparesin_ltd/', google: GMAPS, checkatrade: '' },
  // Google Business Profile "Suparesin Ltd", checked live 8 Nov 2026
  proof: { rating: 5.0, reviewCount: 10, yearsTrading: 0, floorsDone: 0 },
  guarantee: { title: '', text: '' },
  // Word for word, as shown on his Google listing (8 Nov 2026). First names only.
  reviews: [
    { name: 'Angela', source: 'Google', rating: 5, url: GMAPS, job: 'Driveway', date: '6 months ago',
      text: 'Well wat can I say these guys r absolutely amazing there work is 1st class really cant thank them enough 4 the transformation off my drive daz and his team r 5 star workers once again thanyou suparesin amazing' },
    { name: 'Ryan', source: 'Google', rating: 5, url: GMAPS, job: 'Driveway', date: '7 months ago',
      text: 'Daz and team transformed our drive, great workmanship, fast efficient, price very competitive, highly recommended' },
    { name: 'Landscaping customer', source: 'Google', rating: 5, url: GMAPS, job: 'Landscaping', date: 'a year ago',
      text: 'We use Darren and his team to do a large landscaping project which other firms are tried away from Daren. We must thank you for an amazing job. You and your team have done quality of work. Price everything we were over the moon with.' },
  ] as Review[],
  posters: { d: '/posters/studio-d-sr1.webp', m: '/posters/studio-m-sr1.webp' },
  formEndpoint: '', // empty = nothing stored; the lead is handed to WhatsApp
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
  if (p && /^[0-9 +()-]{6,20}$/.test(p)) { out.phone = p; out.mobile = p; out.whatsapp = p.replace(/\D/g, '').replace(/^0/, '44'); }
  return out;
}
