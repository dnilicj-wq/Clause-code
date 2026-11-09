// Page content for the Butler's Resin & Construction demo. Business claims are sourced in content-inventory.md.

export type Photo = { key: string; title: string; alt: string; w: number; h: number; big: boolean; kind: string };
// His own job photos (butlersrc.co.uk home + recent projects, Checkatrade job photos).
export const photos: Photo[] = [
  { key: 'resin-dusk', title: 'Resin drive, lit at dusk', alt: 'Light grey resin driveway with a charcoal border in front of a house at dusk, lights on', w: 1600, h: 1200, big: true, kind: 'Resin driveway' },
  { key: 'resin-circles', title: 'Lawn to resin garden, circular beds', alt: 'Golden resin garden with round planted beds and dark edging', w: 1600, h: 1200, big: true, kind: 'Resin garden' },
  { key: 'resin-steps', title: 'Resin drive with resin steps', alt: 'Resin-bound steps with dark block nosings and brick walls up to a front door', w: 1600, h: 1200, big: true, kind: 'Resin + steps' },
  { key: 'resin-compass', title: 'Custom compass design', alt: 'Drone view of a golden resin driveway with a compass pattern set into it', w: 1600, h: 1200, big: true, kind: 'Custom pattern' },
  { key: 'patio-porcelain', title: 'Porcelain patio', alt: 'Large-format porcelain patio slabs along the back of a house', w: 1200, h: 1600, big: true, kind: 'Patio' },
  { key: 'resin-circle-patio', title: 'Round resin patio', alt: 'Circular light grey resin patio with a dark border set into a lawn behind a bungalow', w: 1600, h: 1200, big: true, kind: 'Resin patio' },
  { key: 'resin-palms', title: 'Silver resin frontage', alt: 'Silver resin driveway with a charcoal block border beside palms', w: 1600, h: 1200, big: true, kind: 'Resin driveway' },
  { key: 'block-herringbone', title: 'Herringbone block paving', alt: 'Charcoal herringbone block-paved driveway with a contrast border in front of a black-clad porch', w: 1600, h: 1200, big: true, kind: 'Block paving' },
  { key: 'resin-farm', title: 'Big golden resin drive', alt: 'Long golden resin driveway in front of a detached house in open fenland', w: 1600, h: 1200, big: true, kind: 'Resin driveway' },
  { key: 'resin-bay', title: 'Resin path to the door', alt: 'Light resin path and frontage in front of a bay window', w: 1600, h: 1200, big: true, kind: 'Resin path' },
];
export const photoSrc = (p: Photo | string, size: 640 | 1280 = 1280) => {
  const k = typeof p === 'string' ? p : p.key; const big = typeof p === 'string' ? true : p.big;
  return `/client/${k}-${size === 1280 && big ? 1280 : 640}-v1.webp`;
};

// How a resin drive goes down. Steps and timings from his own site (FAQ + "Why Butler's" cards).
export const process = [
  { title: 'Free survey', text: 'Tell us the surface you have now, roughly how big it is, and send a photo or two. We come and look before we quote.', img: '' },
  { title: 'A proper base', text: 'Every surface we lay starts with a properly prepared base. A weak base means a full dig-out and rebuild, not a cover-up.', img: 'base-dig' },
  { title: 'Laid by hand', text: 'Resin and stone are fully mixed before laying, then trowelled smooth, with block edging, steps or a pattern if you want one.', img: 'resin-grey-path' },
  { title: 'Off it for a day or two', text: 'Most standard domestic driveways take 4–6 days. Wait 24 to 48 hours before walking or driving on new resin while it cures.', img: 'resin-garage' },
];

// His own FAQ answers, word for word (butlersrc.co.uk home page).
export const faq = [
  { q: 'What’s the difference between resin-bound and resin-bonded surfaces?', a: 'Resin-bound is permeable, smooth, and ideal for driveways. The stones are fully mixed with resin before being laid. Resin-bonded is rougher, less durable, and uses resin as a base with loose stone scattered over it.' },
  { q: 'How long does a resin driveway or paved surface last?', a: 'A properly installed resin-bound surface can last 10 to 15 years or more with basic maintenance and care. Block paving and tarmac also have similar lifespans, depending on weather and use.' },
  { q: 'Can resin be laid over existing surfaces?', a: 'Sometimes. Resin can be installed over concrete or tarmac if the base is structurally sound. However, we always assess the condition first, a weak base means we recommend a full dig-out and rebuild.' },
  { q: 'Can you combine resin with other features?', a: 'Absolutely. We can integrate block edging, steps, ramps, fencing, garden borders, and even custom patterns to match your design vision.' },
  { q: 'How long does installation take?', a: 'Most standard domestic driveways take 4-6 days. Larger or more complex sites may take longer, but we always confirm timelines in advance.' },
  { q: 'Can I drive on my resin driveway straight after installation?', a: 'We recommend waiting 24 to 48 hours before walking or driving on your new resin surface. This ensures the resin fully cures and reaches its maximum strength.' },
  { q: 'Will weeds grow through my resin or paving surface?', a: 'No. Resin-bound surfaces are sealed and compact , so weeds can’t grow through. However, seeds landing on top can still sprout, so occasional sweeping or light weeding is advised.' },
];
