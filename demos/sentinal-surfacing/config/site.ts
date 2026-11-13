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
  company: 'Sentinal Surfacing',
  legalName: '',
  companyNo: '',
  shortName: 'Sentinal',
  trade: 'epoxy' as string, // unused on this demo: the page reads config/driveway.ts
  preset: 'sentinal-amber' as const,
  town: 'Consett',
  region: 'the North East, Cumbria and Scotland',
  areaLine: 'the North of England and Scotland',
  phone: '01207 260757',
  mobile: '07802 676777',
  whatsapp: '', // no WhatsApp on their site: none offered here
  email: 'info@sentinalsurfacing.co.uk',
  address: 'Delves Ln, Consett DH8 7LF',
  owner: { first: 'Neil', name: 'Neil Conway', photo: '' as string, photoIsStandIn: false, signature: 'Neil' },
  ownerNote: '',
  hours: 'Mon to Fri 9am - 5pm',
  responseTime: 'quickly',
  since: 2006,
  areas: ['Newcastle', 'Durham', 'Northumberland', 'Cumbria', 'Scotland'],
  socials: { facebook: 'https://www.facebook.com/Sentinalsurfacing/', instagram: 'https://www.instagram.com/sentinal_surfacing/', youtube: 'https://www.youtube.com/@sentinalsurfacingltd3642', google: 'https://maps.app.goo.gl/4Ha5eQuRM3ecFA5B7' },
  // Trustindex Google widget on their site: "EXCELLENT, Based on 26 reviews". It shows no number, so none is shown here.
  proof: { rating: 0, ratingWord: 'Excellent', reviewCount: 26, yearsTrading: 0, floorsDone: 0 },
  guarantee: { title: '', text: '' },
  // Word for word from the Google reviews shown on sentinalsurfacing.co.uk (Trustindex widget, each shown with 5 stars).
  reviews: [
    { name: "Jeff Irving", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', job: "Garden path", text: "Finally decided to have the garden pathway done with resin. Contacted Neil at Sentinel Surfacing who came to our home and provided his expert advice as to what would be the best resin mix to have. His lads came a few days later and did an excellent job - each person we encountered from Sentinel was friendly and professional - an excellent job." },
    { name: "Patrick Creedon", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', job: "Driveway", text: "Delighted with our new drive from Neil and the Sentinal lads. Neil was as pleasure to deal with from start to finish. He was approachable, responsive and it felt like dealing with a mate whilst remaining professional throughout. Our job was far from straightforward but their problem solving attitude made the experience as stress free as possible. When a problem arose - they had an answer. There are plenty of cowboys laying resin but Sentinal Surfacing are  legit and I would thoroughly recommend them." },
    { name: "Jason Knight", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', text: "Neil and the team provided great service, and delivered a perfect product from start to finish. My particular install was a challenge as the previous contractor left me with a huge  problem. Neil and his team corrected all the issues and finished it perfectly in resin. Could not recommend this business enough!" },
    { name: "Bobby Chai", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', text: "Fantastic service from Neil and team. Highly recommend this company to anyone." },
    { name: "Richard Defty", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', text: "From the initial contact, through to the end product and follow up checks, Sentinal have been totally professional, thorough and hard working delivering a quality product with customer satisfaction paramount.\nNeil is a hands on and experienced business owner. His team are committed to meeting customers requirements. We were very pleased with the finished article so much so that our neighbours have also had similar work done by Sentinal" },
    { name: "David Milligan", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', text: "Constructive dialogue prior to finalising details of job\nIntelligent and flexible approach to resolving an unexpected problem\nRapid response to initial request and start of work\nExcellent standard of finished job\nReasonable price (and lower than competition)\nI would recommend the firm highly" },
    { name: "Louise Pugh", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', text: "Excellent service, and the result looks fabulous. Really tidied up our garden and no more weeds! Communication was spot on, highly reccommend this company." },
    { name: "Diane Read", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', job: "Driveway", text: "Recommended by another satisfied customer. Excellent company to deal with from Neil doing quote , Ellie in office keeping us informed and then the lads who installed the drive. The team were friendly and hard working (tidy workers noticed by neighbours)\nWe are delighted with the completed job which has transformed the look of the house.would highly recommend\nThank you again" },
    { name: "Bill Ogden", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', job: "Forecourt and patio", text: "Excellent resin surfacing of our garage forecourt and raised patio. The work started and finished on time and we were kept updated all the way. All at a reasonable price.\nCan't fault this company and would highly recommend." },
    { name: "Maureen Arnold", rating: 5, source: 'Google', url: 'https://www.sentinalsurfacing.co.uk/', job: "Driveway", text: "We have just had our driveway completely transformed by Sentinel Surfacing. Polite, professional and a joy to work with. From quotation to completion the lads were a pleasure. Great price and outstanding work. Thank you." },
  ] as Review[],
  posters: { d: '/posters/hero-d-ss1.webp', m: '/posters/hero-m-ss1.webp' },
  formEndpoint: '', // empty = nothing stored; the quote opens an email to them with the details filled in
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
