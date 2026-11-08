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

const GMAPS = 'https://www.google.com/maps/place/Aspect+Drives+%26+Patios+By+Design+LTD/data=!4m7!3m6!1s0x47d8b78ff7fe72a5:0x3a1e02d9f1679e1e';
const CAT = 'https://www.checkatrade.com/trades/aspectdrivesandpatiosbydesign';

export const site = {
  demo: false,
  sample: false,
  company: 'Aspect Drives & Patios',
  legalName: 'ASPECT DRIVES & PATIOS BY DESIGN LTD',
  companyNo: '13338713',
  shortName: 'Aspect',
  trade: 'epoxy' as string, // unused on this demo: the page reads config/driveway.ts
  preset: 'aspect-navy' as const,
  town: 'Grays',
  region: 'Grays, Thurrock and south Essex',
  areaLine: 'Thurrock and south Essex',
  phone: '01375 308333',
  mobile: '07931 358769',
  whatsapp: '447931358769',
  email: 'aspectdrivesandpatios@gmail.com',
  owner: { first: 'Gerald', name: 'Gerald', photo: '' as string, photoIsStandIn: false, signature: 'Gerald' },
  ownerNote: '',
  hours: '',
  responseTime: 'quickly',
  areas: ['Grays', 'Basildon', 'Stanford-le-Hope', 'Thurrock'],
  socials: { facebook: '', instagram: '', google: 'https://www.google.com/maps/place/Aspect+Drives+%26+Patios+By+Design+LTD/data=!4m7!3m6!1s0x47d8b78ff7fe72a5:0x3a1e02d9f1679e1e', checkatrade: 'https://www.checkatrade.com/trades/aspectdrivesandpatiosbydesign' },
  proof: { rating: 4.9, reviewCount: 102, yearsTrading: 0, floorsDone: 0 },
  guarantee: { title: 'Guaranteed for many years', text: 'In his own words: “All our work is guaranteed for many years.”' },
  // Word for word. Google: the 3 reviews shown on his Maps listing; Checkatrade: the 6 newest on his profile (checked 8 Nov 2026).
  reviews: [
    { name: 'Rachel M.', source: 'Google', rating: 5, url: GMAPS, job: 'Block paving', date: 'a month ago',
      text: 'I recently had my front driveway transformed by Aspect Drives & Patios By Design, replacing a neglected grass area with block paving, and I couldn’t be happier with the result. Gerald and Patrick came out initially to quote the job and spent time discussing ideas, colour palettes, and what would best suit my home. Although I hadn’t seen much of their work in the Chelmsford area, their excellent reviews from clients across Essex gave me confidence — and they absolutely lived up to them. Both gentlemen were professional, patient, and clearly knowledgeable. They tailored their advice to my needs, and their calm, reassuring manner made it easy to trust them with the project. I needed the work completed quickly, and they organised their schedule to accommodate this without compromising quality. Throughout the process I was kept fully informed — who would be on site, how long each stage would take, and what was happening next. The final result is fantastic. My driveway looks better than I imagined, and the workmanship is excellent. I couldn’t have asked for a better company. Highly recommended. Thank you, Aspect Drives & Patios By Design - Rachel' },
    { name: 'Gail L.', source: 'Google', rating: 5, url: GMAPS, date: '5 months ago',
      text: 'Aspect were excellent 👍 & we highly recommend them. We are really happy with the workmanship & the finished result is just what we wanted. Gerald was great at keeping in touch & letting us know what was going on. The boys worked really hard & it was all done in 4 days.' },
    { name: '', source: 'Checkatrade', url: CAT, job: 'Block paving', title: 'New driveway', date: '18 September',
      text: 'Excellent new driveway and paving completed for me today. I’m extremely pleased with the quality of the work and the attention to detail. The team were very professional, friendly, reliable and very nice people to work with throughout. Everything was completed to a high standard, and the finished result looks fantastic. I would highly recommend them to anyone looking for quality driveway and paving work. Great job and excellent service!' },
    { name: 'Lynda K.', source: 'Google', rating: 5, url: GMAPS, job: 'Cleaning, repairs & sealing', date: '3 months ago',
      text: 'Had my large patio and drive cleaned, lose paving slabs repaired, re pointed and sealed.  2 men worked hard and non stop. They now both look like new ans i am soo pleased with the results. 😁 would use them again in the future and would recommend. Great job lads and thank you Gerard.' },
    { name: '', source: 'Checkatrade', url: CAT, job: 'Block paving', title: 'Hardworking and dedicated professionals!', date: '23 August',
      text: 'Patrick, Gerald and the rest of the team were straightforward, efficient and professional from start to finish. With competitive pricing on the spot and quality work to finish, we’re super pleased with the end product and happy we took the chance with them! If you’re looking for a new driveway, don’t miss checking these guys out.' },
    { name: '', source: 'Checkatrade', url: CAT, job: 'Resin driveway', title: 'Resin driveway with drainage and brick boarders', date: '21 August',
      text: 'Work was fantastic\' didn\'t take long was finished before the deadlines very happy thanks aspect' },
    { name: '', source: 'Checkatrade', url: CAT, job: 'Patio & fencing', title: 'New patio & fencing', date: '26 August',
      text: 'Good work with the patio & new fencing very happy with Gerald & the team looks great thanks' },
    { name: '', source: 'Checkatrade', url: CAT, job: 'Tarmac drive', title: 'Tarmac drive', date: '4 August',
      text: 'New tarmac drive laid. Very pleased with the result Gerald and his team very hard woking always polite and on time would highly recommend.' },
  ] as Review[],
  posters: { d: '/posters/brick-d-ad1.webp', m: '/posters/brick-m-ad1.webp' },
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
  if (p && /^[0-9 +()-]{6,20}$/.test(p)) { out.phone = p; out.mobile = p; out.whatsapp = p.replace(/\D/g, '').replace(/^0/, '44'); }
  return out;
}
