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
  // Facts: content-inventory.md (Facebook page https://www.facebook.com/profile.php?id=100089718113028)
  company: 'The Resin Originals',
  shortName: 'The Resin Originals',
  contact: 'Dean', // from his Meta ad form, not the page
  trade: 'epoxy' as string,
  preset: 'originals' as const,
  town: '',   // TODO(Dan): Dean's town / areas covered. Not on his Facebook page; don't guess.
  region: '', // not on his page
  phone: '07707 848717',
  whatsapp: '447707848717',
  email: '',
  owner: { first: '', name: '', photo: '' as string, photoIsStandIn: false, signature: '' },
  ownerNote: '',
  hours: '',
  responseTime: 'quickly',
  areas: [] as string[],
  socials: { facebook: 'https://www.facebook.com/profile.php?id=100089718113028', instagram: '', google: '' },
  proof: { rating: 0, reviewCount: 0, yearsTrading: 0, floorsDone: 0 },
  guarantee: { title: '', text: '' },
  reviews: [] as Review[],
  posters: { d: '/client/hero/metallic-poster-720-v1.webp', m: '/client/hero/metallic-poster-540-v1.webp' },
  formEndpoint: '',
};

export type Site = typeof site;

