// Transcendent Design: every fact here has a source line in content-inventory.md. Nothing invented.
export const site = {
  company: 'Transcendent Design',
  phone: '07923 163813',
  phoneIntl: '447923163813',
  phone2: '07940 035554',
  phone2Intl: '447940035554',
  web: 'https://www.transcendentdesignuk.com/',
  facebook: 'https://m.facebook.com/TDtranscendentDesign',
  topcret: 'https://topcret.com/en/ecocemento/',
  address: ['Back Eckersley Road', 'BL1 8EA'],
  maps: 'https://www.google.com/maps/search/?api=1&query=Back+Eckersley+Road+BL1+8EA',
  // TODO(Dan): Web3Forms access key for their inbox (free at web3forms.com). Empty = WhatsApp only.
  formKey: '',
};

export const wa = (text: string, intl = site.phoneIntl) => `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;

export type Shot = { src: string; w: number; h: number; alt: string; tag: string };
// Their own job photos, from transcendentdesignuk.com. Topcret brochure photos on their site are NOT used.
export const gallery: Shot[] = [
  { src: 'kitchen-run', w: 768, h: 1024, alt: 'Long kitchen with a seamless pale floor', tag: 'Microcement floor' },
  { src: 'shower-niche', w: 750, h: 1000, alt: 'Lit shower niche in a seamless finish', tag: 'Wet room' },
  { src: 'metallic-dining', w: 800, h: 600, alt: 'Marble-effect metallic epoxy floor under a dining table', tag: 'Metallic epoxy' },
  { src: 'spiral-stair', w: 750, h: 1000, alt: 'Curved staircase finished in a seamless surface', tag: 'Stair & walls' },
  { src: 'vanity', w: 1536, h: 1024, alt: 'Bathroom with a floating vanity and backlit mirror', tag: 'Microcement bathroom' },
  { src: 'feature-wall', w: 1080, h: 1440, alt: 'Dark textured feature wall with lit shelves', tag: 'Feature wall' },
  { src: 'kitchen-island', w: 1024, h: 768, alt: 'Kitchen island on a continuous floor', tag: 'Microcement floor' },
  { src: 'wetroom', w: 750, h: 1000, alt: 'Walk-in shower with seamless walls and floor', tag: 'Wet room' },
  { src: 'open-plan', w: 1000, h: 750, alt: 'Open-plan room with a seamless resin floor', tag: 'Resin floor' },
  { src: 'shower-slats', w: 800, h: 834, alt: 'Shower with timber slats and seamless walls', tag: 'Wet room' },
  { src: 'metallic-kitchen', w: 800, h: 600, alt: 'Kitchen with a metallic epoxy floor', tag: 'Metallic epoxy' },
  { src: 'lounge', w: 750, h: 1000, alt: 'Lounge with a seamless floor', tag: 'Living space' },
];

// Real before/after pairs from their own service pages.
export const pairs = [
  { k: 'wetroom', label: 'Wet room', before: 'ba-wetroom-before', after: 'ba-wetroom-after', w: 800, h: 1067, say: 'Stripped to the boards, then one seamless skin: floor, walls and shower. No grout lines.', from: 'Microcement bathroom page' },
  { k: 'kitchen', label: 'Kitchen', before: 'ba-kitchen-before', after: 'ba-kitchen-after', w: 750, h: 1000, say: 'Tired tiles out, marble-effect epoxy resin in. Applied at 3mm, sealed in satin, matte or gloss.', from: 'Epoxy resin page' },
  { k: 'garage', label: 'Garage', before: 'ba-garage-before', after: 'ba-garage-after', w: 1284, h: 1279, say: 'Prepped bare concrete to a hard-wearing epoxy garage floor. Available in all RAL colours.', from: 'Epoxy resin page' },
] as const;

// Word for word from the Google reviews widget on transcendentdesignuk.com (Trustindex: source Google).
// Rachel Whittingham left a rating with no text, so she isn't quoted.
export const reviews = [
  { who: 'Dan Gardner', text: 'Kieran and Josh are knowledgable, dedicated, trustworthy and pure craftsmen in their trade. All round decent lads. We are very pleased with the installation of approximately 150m2 of Microcement flooring throughout our house. I would highly recommend them.' },
  { who: 'MrsAseel87', text: 'I had the pleasure of working with Keiran and Josh, and I was incredibly impressed by both their professionalism and kindness. They took great care with every aspect of the job, leaving everything clean and tidy. It’s clear that they are not just focused on making money, but on delivering high-quality work and doing things the right way. Their advice and willingness to go the extra mile really stood out. I can’t thank them enough for the excellent service they provided!' },
  { who: 'Justin Hartstone', text: 'Amazing work completed by Kieran, couldn’t ask for a better job. Turned my bar into a unique design that I can honestly say I’m proud off. Thank you so much, future works are also in the pipeline' },
  { who: 'Sidrs Ikhlas', text: 'Great work from both Kieran and Josh. From prep work to finish, absolutely stunning work. We’ve been fortunate enough to have the pleasure of working with transcendent design in turning our home into a creative landscape. The epoxy resin flooring and specially designed feature walls we’re created as unique and bespoke pieces of artwork. From prep work to finish, only the best of the best materials we’re used, all tailored to our taste and choice. The samples are absolutely stunning which truly left us spoilt for choice. Thank you to both kieran and josh for the work done so far, we’re excited to commence with further creative features and eagerly await for you to return.' },
  { who: 'Tom Figas', text: 'These guys never let me down. We have worked together on a number of occasions on various high end projects. Highest quality, very knowledgeable and cool people. Thank you and see you again' },
  { who: 'ken h', text: 'Before and after shots of the completed work - the lads worked very hard and the outcome is incredible, thank you.' },
  { who: 'Alison Howieson', text: 'Excellent professional job , really delighted. We could highly recommend Thankyou' },
];

// Their six services, wording trimmed from their services page.
export const services = [
  { k: 'mc-floor', t: 'Microcement flooring', d: 'A 3mm seamless floor that goes straight over tiles, concrete or screed. Matte or polished.', img: 'kitchen-island' },
  { k: 'mc-bath', t: 'Microcement bathrooms & wet rooms', d: 'Grout-free walls, floors and showers. Coats directly over existing tiles, with proper waterproofing layers.', img: 'wetroom' },
  { k: 'mc-wall', t: 'Microcement walls', d: 'A joint-free finish with movement, colour and texture for clean, minimalist interiors.', img: 'spiral-stair' },
  { k: 'epoxy', t: 'Epoxy resin flooring', d: 'Metallic, solid colour or flake. Applied at 3mm and sealed in satin, matte or gloss. Garages too.', img: 'metallic-dining' },
  { k: 'venetian', t: 'Venetian & decorative plaster', d: 'Natural lime and marble dust, polished to a high shine or left matte. Also called stucco.', img: '' },
  { k: 'polished', t: 'Polished concrete', d: 'Your existing slab, diamond-ground, densified and sealed. High-gloss, satin, semi-gloss or matte.', img: 'open-plan-2' },
];

// Their FAQ page, answers trimmed, nothing added.
export const faqs: { q: string; a: string }[] = [
  { q: 'Can microcement go over my existing floor?', a: 'In most cases, yes. It can go directly over tiles, concrete or screed, so there’s no ripping out the old floor first.' },
  { q: 'Is it waterproof enough for a bathroom?', a: 'Yes. Installed with proper waterproofing layers and sealed correctly, microcement is fully waterproof and suits showers, walls and bathroom floors.' },
  { q: 'Is it slippery?', a: 'No. The finish can go from smooth to anti-slip depending on the area. For wet or busy areas an anti-slip sealant is recommended. Epoxy can take anti-slip additives too.' },
  { q: 'How do I look after it?', a: 'Clean with mild, non-abrasive cleaners and skip the harsh chemicals. No grout lines means nothing to scrub.' },
  { q: 'How long does epoxy resin flooring last?', a: 'With professional installation and proper care, 10–20 years or more.' },
  { q: 'Can I see colours before I decide?', a: 'Yes. Kieran & Josh make up samples and show you colour and design options before anything goes down.' },
];
