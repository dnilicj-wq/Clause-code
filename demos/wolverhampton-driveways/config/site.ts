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
  company: 'Wolverhampton Driveways',
  legalName: 'WOLVERHAMPTON DRIVEWAYS LTD',
  companyNo: '16435261',
  shortName: 'Wolverhampton Driveways',
  trade: 'epoxy' as string, // unused on this demo: the page reads config/driveway.ts
  preset: 'wolves-red' as const,
  town: 'Wolverhampton',
  region: 'West Midlands',
  areaLine: 'the West Midlands',
  phone: '01902 276379',
  mobile: '07717 518083',
  whatsapp: '447717518083',
  email: 'wolverhamptondrivewaysltd@gmail.com',
  owner: { first: 'Steven', name: 'Steven', photo: '' as string, photoIsStandIn: false, signature: 'Steven' },
  ownerNote: '',
  hours: '',
  responseTime: 'quickly',
  areas: ['Wolverhampton', 'Cannock', 'Stafford', 'Telford', 'Rugeley', 'Walsall', 'Penkridge', 'Dudley'],
  socials: { facebook: '', instagram: '', google: 'https://www.google.com/maps/place/Wolverhampton+Driveways+Ltd/data=!4m7!3m6!1s0x44e7583962f4f0db:0x6f4058a567c64367' },
  proof: { rating: 5.0, reviewCount: 50, yearsTrading: 0, floorsDone: 0 },
  guarantee: { title: 'Quality guarantee', text: 'A comprehensive quality guarantee on our workmanship and materials.' },
  // Word for word from the reviews on wolverhamptondrivewaysltd.co.uk (no names or dates shown there).
  reviews: [
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/', job: 'Resin driveway',
      text: 'Brilliant lads, very professional Done my driveway in resin Couldn’t be any happier with the finish' },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/',
      text: 'Great lads, did an amazing job and they did everything asked for. They were punctual and made sure I was happy throughout. Would recommend to everyone!' },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/',
      text: 'Excellent prompt service, new drive finished in one day. Looks very good and sturdy. Lovely lads worked very hard and professionally.  Highly recommended' },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/', job: 'Block paving',
      text: 'Thanks Wolverhampton driveways Ltd for doing my driveway in a beautiful block paving couldn’t be any happier these guys are incredible' },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/',
      text: "Wolverhampton completed my driveway and I'm over the moon with the final result. The lads were friendly and their work is excellent." },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/',
      text: 'Polite, hard-working and a pleasure to have around. Nothing too much trouble for them.' },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/',
      text: 'Responded super fast, good quote and team did a good job sorting my back garden out. Thank you guys ! Much appreciated' },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/',
      text: 'Highly impressed by the work completed. The guys are polite and friendly. Thank you' },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/',
      text: 'Friendly reliable service, very pleasant and efficient, highly recommended' },
    { name: '', source: 'Google', url: 'https://wolverhamptondrivewaysltd.co.uk/',
      text: 'Positive experience and efficient workforce!' },
  ] as Review[],
  posters: { d: '/posters/brick-d-wd2.webp', m: '/posters/brick-m-wd2.webp' },
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
