// Page content for the Proficient Essex demo. Business claims are sourced in content-inventory.md.
// "Why resin" and the FAQ are general facts about resin-bound surfaces, written as such (not as their claims).

export type Photo = { key: string; title: string; alt: string; w: number; h: number; big: boolean; year: string };
// Their own job photos from proficientessex.co.uk (uploads dated July 2023 and April 2025).
export const photos: Photo[] = [
  { key: 'drive-block', title: 'Block-paved driveway', alt: 'Charcoal block-paved driveway with a border, in front of a terraced house', w: 1500, h: 1125, big: true, year: '2025' },
  { key: 'patio-sleepers', title: 'Patio and sleeper beds', alt: 'Grey stone patio beside a new lawn with timber sleeper beds', w: 1600, h: 1200, big: true, year: '2023' },
  { key: 'drive-bungalow', title: 'Driveway', alt: 'Grey patterned driveway across the front of a brick bungalow', w: 1600, h: 720, big: true, year: '2023' },
  { key: 'patio-gardenroom', title: 'Patio by a garden room', alt: 'Grey slab patio running along a timber garden room', w: 1440, h: 1080, big: true, year: '2025' },
  { key: 'patio-planters', title: 'Patio with raised planters', alt: 'Terracotta-toned patio with white rendered raised planters', w: 1024, h: 768, big: false, year: '2023' },
  { key: 'patio-terrace', title: 'Patio terrace', alt: 'Light grey patio terrace with garden furniture and a raised lawn', w: 1600, h: 772, big: true, year: '2023' },
  { key: 'patio-lawn', title: 'Patio and lawn', alt: 'Pale patio beside a striped lawn and timber fence', w: 1500, h: 1125, big: true, year: '2025' },
  { key: 'patio-gardenroom-2', title: 'Patio by a garden room', alt: 'Grey slab patio and timber edging next to a garden room', w: 1440, h: 1080, big: true, year: '2025' },
];
export const photoSrc = (p: Photo, size: 640 | 1280 = 1280) => `/client/${p.key}-${size === 1280 && p.big ? 1280 : 640}-v1.webp`;

// Their resin driveway process, from proficientessex.co.uk/?page_id=642 (shortened, same steps and meaning).
export const process = [
  { title: 'Consultation and design', text: 'A visit to your property to understand what you want, assess the site and talk through design options for your taste and budget.' },
  { title: 'Groundwork', text: 'The site is prepared with a solid sub-base to support the resin surface, with any drainage it needs.' },
  { title: 'Installation', text: 'Your chosen aggregate is mixed with resin and laid evenly over the base, taking care to get a smooth, level surface.' },
  { title: 'Curing', text: 'The resin is left to set and harden properly, for a durable finish.' },
  { title: 'Inspection and completion', text: 'A final check of the finished driveway against their standards and your expectations.' },
];

// General facts about resin-bound surfaces (not claims about this business).
export const whyResin = [
  { key: 'drain', title: 'Rain drains through', text: 'Resin-bound stone is porous, so rainwater soaks through the surface instead of sitting in puddles or running into the road.' },
  { key: 'weeds', title: 'No weeds in the joins', text: 'There are no joints or cracks for seeds to settle in, so you are not pulling weeds out of the drive every spring.' },
  { key: 'sweep', title: 'Easy to look after', text: 'The stones are locked in place, so there is no loose gravel. An occasional sweep and wash keeps it looking good.' },
];

export const faq = [
  { q: 'What is the difference between resin-bound and resin-bonded?', a: 'Resin-bound stone is mixed with the resin first and trowelled flat, which gives a smooth, porous surface. Resin-bonded is resin spread on the base with loose stone scattered on top, which gives a rougher finish that is not porous.' },
  { q: 'Can resin go over my old drive?', a: 'Sometimes. Sound tarmac or concrete can often be resurfaced; block paving and gravel usually need a new base first. Matt checks what is under your drive on the free survey.' },
  { q: 'How do I look after a resin drive?', a: 'Sweep it now and then and give it an occasional wash. Because the stones are bound in, there is no loose gravel to rake back.' },
  { q: 'Is the price on this page my quote?', a: 'No. It is an example range to help you plan. Matt confirms the real price after a free survey of your drive.' },
];
