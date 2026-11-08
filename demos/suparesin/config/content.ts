// Page content for the Suparesin demo. Business claims are sourced in content-inventory.md.

export type Photo = { key: string; title: string; alt: string; w: number; h: number; big: boolean; kind: 'Driveways' | 'Floors' | 'Worktops & more' };
// Photos published on suparesin.co.uk (home, services, gallery pages; saved 8 Nov 2026).
export const photos: Photo[] = [
  { key: 'drive-gold', title: 'Golden resin drive', alt: 'Light golden resin-bound driveway with a charcoal edge in front of a white house', w: 900, h: 600, big: false, kind: 'Driveways' },
  { key: 'metallic-copper', title: 'Copper metallic, mid-pour', alt: 'Copper metallic epoxy floor being poured, glossy with swirled pigment', w: 900, h: 1200, big: false, kind: 'Floors' },
  { key: 'drive-wall', title: 'Resin drive along a brick wall', alt: 'Pale resin-bound driveway curving along a brick garden wall', w: 900, h: 303, big: false, kind: 'Driveways' },
  { key: 'metallic-grey', title: 'Pearl metallic floor', alt: 'Glossy pearl-grey metallic epoxy floor with smoky swirls', w: 900, h: 675, big: false, kind: 'Floors' },
  { key: 'drive-grey', title: 'Grey resin, block border', alt: 'Grey resin-bound driveway with a dark block-paved border in front of a modern brick house', w: 1200, h: 800, big: false, kind: 'Driveways' },
  { key: 'highbuild-pour', title: 'High-build epoxy, laid', alt: 'Grey high-build epoxy floor being spread to a high gloss', w: 1920, h: 1080, big: true, kind: 'Floors' },
  { key: 'drive-garage', title: 'Resin drive to the garage', alt: 'Cream resin-bound driveway up to a garage, framed by a dark border', w: 1024, h: 683, big: false, kind: 'Driveways' },
  { key: 'metallic-room', title: 'Dark metallic, open plan', alt: 'Dark metallic epoxy floor reflecting ceiling lights in an open-plan room', w: 900, h: 506, big: false, kind: 'Floors' },
  { key: 'path-side', title: 'Golden resin path', alt: 'Golden resin-bound path running beside a red-brick house', w: 800, h: 600, big: false, kind: 'Driveways' },
  { key: 'flake-garage', title: 'Flake floor', alt: 'Flake epoxy floor in a large garage', w: 500, h: 500, big: false, kind: 'Floors' },
  { key: 'worktop-wood', title: 'Metallic epoxy worktop', alt: 'Metallic epoxy kitchen worktop with a sink, in warm wood tones', w: 900, h: 600, big: false, kind: 'Worktops & more' },
  { key: 'drive-house', title: 'Resin drive, red-brick home', alt: 'Light resin-bound driveway in front of a red-brick detached house', w: 1024, h: 683, big: false, kind: 'Driveways' },
  { key: 'highbuild-white', title: 'High-build epoxy, white', alt: 'White high-build epoxy floor with a mirror shine in an industrial unit', w: 1165, h: 777, big: false, kind: 'Floors' },
  { key: 'worktop-slate', title: 'Slate-grey epoxy worktop', alt: 'Slate-grey metallic epoxy kitchen worktop', w: 800, h: 1067, big: false, kind: 'Worktops & more' },
  { key: 'rubber-play', title: 'Wet-pour rubber play area', alt: 'Blue wet-pour rubber crumb play surface with yellow shapes', w: 900, h: 600, big: false, kind: 'Worktops & more' },
];
export const photoSrc = (p: Photo | string, size: 640 | 1280 = 1280) => {
  const k = typeof p === 'string' ? p : p.key;
  return `/client/${k}-${size}-v1.webp`;
};

// What he installs (suparesin.co.uk home page, services and quote form).
export const services = [
  'Resin bound driveways', 'Resin paths and patios', 'Flake flooring', 'High-build epoxy floors', 'Metallic epoxy floors',
  'Metallic epoxy worktops', 'Wet-pour rubber crumb', 'Decorative walling', 'Savoro flooring', 'Landscaping',
];

// How it works: his own process words (FAQ, contact page). Times are from his FAQ.
export const process = [
  { title: 'Price it here', text: 'Pick the job, the size and a finish. Send it to Darren on WhatsApp in one tap.' },
  { title: 'Free site survey', text: 'A free, no-obligation site survey to check the base, then a tailored quote. No pressure, no sales.' },
  { title: 'Laid in days', text: 'From his FAQ: a typical resin drive takes 1–3 days, depending on size and base prep.' },
  { title: 'Walk on it, drive on it', text: 'From his FAQ: foot traffic after about 24 hours, vehicles after about 48.' },
];

// From his FAQ page (suparesin.co.uk/faqs), shortened, his facts only; plus one about this page's prices.
export const faq = [
  { q: 'How long will a resin bound driveway last?', a: 'His FAQ says a professionally installed, maintained resin bound driveway typically lasts 15–25 years. It depends on resin quality and the sub-base preparation.' },
  { q: 'Will rain drain through it?', a: 'Yes. Properly installed resin bound is fully permeable (SuDS compliant), so water drains through into the sub-base. That usually removes the need for planning permission.' },
  { q: 'Can it go over my old concrete or tarmac?', a: 'Often, yes, if the base is structurally sound. A site survey checks it first.' },
  { q: 'Is it slippery when wet?', a: 'No. The aggregates give strong slip resistance, and anti-slip granules can be added for extra grip in wet or icy weather.' },
  { q: 'How do I keep it clean?', a: 'An occasional sweep and rinse with a hose, or a pressure washer on a fan setting. Avoid boiling water and solvent cleaners.' },
  { q: 'Is the price on this page my quote?', a: 'No. It is an example range to help you plan. Darren gives you the real price after a free, no-obligation site survey.' },
];
