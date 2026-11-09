// Business facts for Butler's Resin & Construction. Every claim here has a source line in content-inventory.md.

export type Review = {
  name: string;          // first name only, as shown on the source
  town?: string;
  text: string;          // word for word
  rating?: number;       // only if the source shows it
  source: 'Google' | 'Facebook' | 'Checkatrade' | 'Trustpilot' | 'Website' | 'Example' | 'Sample';
  url?: string;
  job?: string;
  title?: string;        // the review's own heading, if it has one
  date?: string;
};

const CT = 'https://www.checkatrade.com/trades/butlersresinandconstructionltd/reviews';

export const site = {
  demo: false,
  sample: false,
  company: "Butler's Resin & Construction",
  legalName: "BUTLER'S RESIN & CONSTRUCTION LTD",
  companyNo: '',
  shortName: "Butler's",
  trade: 'epoxy' as string, // unused on this demo: the page reads config/driveway.ts
  preset: 'butlers-fen' as const,
  town: 'Chatteris',
  region: 'Cambridgeshire',
  areaLine: 'Cambridgeshire and the Fens',
  phone: '0333 339 9898',
  mobile: '',
  whatsapp: '', // no mobile or WhatsApp published: Call + survey form only
  email: 'info@butlersrc.co.uk',
  owner: { first: '', name: '', photo: '' as string, photoIsStandIn: false, signature: '' },
  ownerNote: '',
  hours: '',
  responseTime: 'quickly',
  // areaServed list on butlersrc.co.uk (structured data), in that order
  areas: ['Chatteris', 'March', 'Ely', 'Huntingdon', 'Warboys', 'Littleport', 'Sawtry', 'Mepal', 'Thorney'],
  socials: {
    facebook: 'https://www.facebook.com/profile.php?id=61564695405415',
    instagram: 'https://www.instagram.com/butlersresinco/',
    google: 'https://www.google.com/maps/search/Butlers+Resin+and+Construction+Chatteris',
    checkatrade: 'https://www.checkatrade.com/trades/butlersresinandconstructionltd',
  },
  // Checkatrade 10/10 from 18 reviews; Google 5.0 from 21 reviews (both checked live 2026-11-09)
  proof: { rating: 5.0, reviewCount: 21, checkatradeScore: 10, checkatradeCount: 18, yearsTrading: 0, floorsDone: 0 },
  // his own badges, from butlersrc.co.uk
  creds: ['Resin Mill Elite Installer', 'NRSWA qualified', '10+ years in the industry'],
  guarantee: { title: '', text: '' },
  // Word for word from Checkatrade (every one scored 10/10). First name only where Checkatrade shows one.
  reviews: [
    { name: 'Suzanne', source: 'Checkatrade', url: CT, job: 'Resin drive', title: 'Five-Star Review', date: 'Oct 2025', rating: 10,
      text: 'These guys recently installed a resin drive and I couldn’t be more thrilled with the results. From start to finish, their professionalism, attention to detail and genuine pride in their work were evident. They arrived promptly each day and worked with impressive speed and coordination. I wouldn’t hesitate to recommend them to anyone considering a resin driveway. It’s rare to find tradesmen who combine skill, reliability and genuine customer care—these guys nailed it.' },
    { name: '', source: 'Checkatrade', url: CT, job: 'Driveway', title: 'Highly professional and skilled.', date: 'Apr 2026', rating: 10,
      text: 'Just had Bill and Jordan back for a third time, this time a complete transformation of my driveway. These guys are truly amazing and their work is exceptional. From initial enquiry to job completion has been straightforward. They always keep me informed of each stage of the process. They are professional and so helpful and polite. Everywhere is left clean and tidy. Would definitely recommend.' },
    { name: 'Richard', source: 'Checkatrade', url: CT, job: 'Block paving', date: 'Sep 2025', rating: 10,
      text: 'Bill and team did an amazing job transforming the patch of grass at the front and block paving it. Matches the existing drive and was done ahead of schedule. Extremely efficient and professional left everything spic and span at the end of the day and at the end of the job.' },
    { name: '', source: 'Checkatrade', url: CT, job: 'Resin driveway', date: 'Sep 2025', rating: 10,
      text: 'I had an issue with my old driveway & after many months of trying to get someone to sort it out, I was just about to give up until then I heard about Bill & his team. When I spoke to him he didn’t hesitate in coming round & having a look. He was so lovely & I was so happy that I finally found someone that could do the job as well as wanted the job. Bill totally knew what was needed to be done to sort the problem out from previous company that hadn’t done it right. Excellent Service from start to finish, very conscientious with great attention to detail. Very thorough, clean & tidy as they go.' },
    { name: '', source: 'Checkatrade', url: CT, job: 'Dropped kerb', date: 'Aug 2025', rating: 10,
      text: 'I recently had our dropped kerb installed by BUTLER’S RESIN & CONSTRUCTION LTD. They are Very professional and knowledgeable in their work field, the drop kerb was done to the highest standard, left the place clean & tidy. Will highly recommend them.' },
    { name: '', source: 'Checkatrade', url: CT, job: 'Resin driveway + fencing', date: 'Apr 2025', rating: 10,
      text: 'Bill and his team did an amazing job transforming our tired concrete driveway into a beautiful new driveway. We’ve received so many compliments. Bill and the team were professional from start to finish, conscientious, polite and considerate too. Highly recommend.' },
    { name: '', source: 'Checkatrade', url: CT, job: 'Custom pattern driveway', date: 'Jan 2025', rating: 10,
      text: 'The Butler’s team are very professional, we had excellent communications and they were very responsive to our needs. They created a unique, customised pattern for our driveway, just as we wanted. The work was carried out promptly and for a fair price. Highly recommended.' },
    { name: '', source: 'Checkatrade', url: CT, job: 'Driveway', date: 'Nov 2024', rating: 10,
      text: 'I cant praise these guys enough for the professionalism, honesty, efficiency and fantastic work they have done on my drive.. It looks fantastic, Nothing was too much.' },
    { name: '', source: 'Checkatrade', url: CT, job: 'Resin pathways', date: 'Nov 2024', rating: 10,
      text: 'Really great experience with this company - they are the very first resin bound pathways we have ever had installed and they look fantastic and the price was exceptionally competitive. The team that arrived on installation day were courteous and attentive, they listened and discussed any reasonable adjustments and carried out a first class job. They also cleaned up after themselves and left our premises looking cleaner and tidier than when they first started, which shows their brilliant customer commitment. I would highly recommend them to anyone who wants an exceptional job carrying out.' },
    { name: '', source: 'Checkatrade', url: CT, job: 'Resin patio', date: 'May 2025', rating: 10,
      text: 'The lads did a fantastic job laying our patio highly recommend them' },
  ] as Review[],
  posters: { d: '/posters/br-d-v1.webp', m: '/posters/br-m-v1.webp' },
  formEndpoint: '', // demo: the survey opens an email to info@butlersrc.co.uk with everything filled in
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
  if (p && /^[0-9 +()-]{6,20}$/.test(p)) { out.phone = p; }
  return out;
}
