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
  company: 'Resinize',
  shortName: 'Resinize',
  trade: 'resinize' as string,
  preset: 'obsidian-copper' as const,
  town: 'Upminster',
  region: 'Essex',
  phone: '07727 168484',
  whatsapp: '447727168484',
  email: 'info@resinizeuk.co.uk',
  owner: { first: '', name: '', photo: '' as string, photoIsStandIn: false, signature: '' },
  ownerNote: '',
  hours: '',
  responseTime: 'quickly',
  areas: ['Brentwood', 'Chelmsford', 'Colchester', 'Rayleigh', 'Epping', 'Billericay', 'Upminster', 'Chigwell', 'Braintree', 'Maldon', 'Wickford', 'Ingatestone', 'Witham', 'Hockley', 'Chipping Ongar', 'Tiptree'],
  socials: { facebook: '', instagram: 'https://www.instagram.com/resinizeuk/', google: '' },
  proof: { rating: 5.0, reviewCount: 6, yearsTrading: 0, floorsDone: 0 },
  guarantee: { title: '', text: '' },
  reviews: [
    { name: 'Beatrice Moody', source: 'Google', job: 'Garage floor', text: 'Mike and the Resinize team did a great job of transforming my garage floor. It used to be so dusty and constantly felt like I was cleaning it. Now it looks great, so smart and is easy to clean, which is needed with two children and dogs! Mike was professional and polite, would highly recommend.' },
    { name: 'Gaurav Mathur', source: 'Google', job: 'Garage floor',
      text: 'Mike helped us with our garage flooring and it was the best experience we have had with any contractor. The job was completed to a high degree of efficiency and exactly the way as he had described whilst quoting for the job. He\u2019s very pleasant to deal with and left the place fully cleaned and in the best possible way. We will surely get him back for future projects.' },
    { name: 'Harmony Marsh', source: 'Google',
      text: 'So happy with my resin flooring! Had the kitchen done in March and hallway and bathroom in October. Brilliant aftercare service as well and super accommodating. 1000% recommend Mike and Resinize.' },
    { name: 'Ed Barry', source: 'Google',
      text: 'Mike did an awesome job of the floor - it looks amazing. Super responsive & very professional... 10/10 would recommend..' },
    { name: 'Kate Kirwan', source: 'Google',
      text: 'Resinize provided a beautiful finished product. The floor is gorgeous and we\'re thrilled with it. The company were super efficient and kept to the time frame we wanted. We\'re so happy with the final product and it\'s completely revitalised the whole room. We hope we can work with the company again in the future.' },
  ] as Review[],
  posters: { d: '/posters/pour-d-v1.webp', m: '/posters/pour-m-v1.webp' },
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
