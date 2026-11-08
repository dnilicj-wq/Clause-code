// Page content for the Wolverhampton Driveways demo. Business claims are sourced in content-inventory.md.
// "Why resin" is general facts about resin-bound surfaces, written as such (not as their claims).

export type Photo = { key: string; title: string; alt: string; w: number; h: number; big: boolean; kind: string };
// Their own job photos from wolverhamptondrivewaysltd.co.uk (gallery and service pages).
export const photos: Photo[] = [
  { key: 'resin-garage', title: 'Resin driveway with block edging', alt: 'Red-brown resin driveway with a brick border, in front of a garage', w: 1600, h: 1200, big: true, kind: 'Resin' },
  { key: 'tarmac-border', title: 'Tarmac drive with a grey border', alt: 'Black tarmac driveway with a light grey block border curving to a detached house', w: 1600, h: 1200, big: true, kind: 'Tarmac' },
  { key: 'block-herringbone', title: 'Herringbone block paving', alt: 'Brindle herringbone block-paved driveway with a charcoal border', w: 1440, h: 1080, big: true, kind: 'Block paving' },
  { key: 'resin-semi', title: 'Resin drive and path', alt: 'Golden resin driveway with a red diamond inlay and a brick edge beside a lawn', w: 1600, h: 1200, big: true, kind: 'Resin' },
  { key: 'patio-sandstone', title: 'Sandstone patio', alt: 'Sandstone patio curving round a lawn by a hedge', w: 1600, h: 1200, big: true, kind: 'Patio' },
  { key: 'block-bay', title: 'Block paving with a border', alt: 'Grey block-paved drive with a dark border to a front door', w: 1284, h: 1168, big: true, kind: 'Block paving' },
  { key: 'resin-trees', title: 'Resin driveway under the trees', alt: 'Resin driveway with a red brick edge, under a tree, in front of a house', w: 1024, h: 768, big: false, kind: 'Resin' },
  { key: 'tarmac-semi', title: 'Tarmac drive with paved edges', alt: 'Tarmac driveway with paved edging between two lawns', w: 1024, h: 768, big: false, kind: 'Tarmac' },
];
export const photoSrc = (p: Photo | string, size: 640 | 1280 = 1280) => {
  const k = typeof p === 'string' ? p : p.key; const big = typeof p === 'string' ? true : p.big;
  return `/client/${k}-${size === 1280 && big ? 1280 : 640}-v1.webp`;
};

// How to get started, from the FAQ on wolverhamptondrivewaysltd.co.uk (shortened, same steps and meaning).
export const process = [
  { title: 'Get in touch', text: 'Call, WhatsApp or send your details from this page.' },
  { title: 'Initial consultation', text: 'They talk through your project and help with design ideas and materials.' },
  { title: 'Free quotation', text: 'A no-obligation quote that sets out the scope of work, materials and estimated costs, with a timeline estimate.' },
  { title: 'The work', text: 'Done within the agreed timeframe, backed by their quality guarantee on workmanship and materials.' },
];

// General facts about resin-bound surfaces (not claims about this business).
export const whyResin = [
  { key: 'drain', title: 'Rain drains through', text: 'Resin-bound stone is porous, so rainwater soaks through the surface instead of sitting in puddles or running into the road.' },
  { key: 'weeds', title: 'No weeds in the joins', text: 'There are no joints or cracks for seeds to settle in, so you are not pulling weeds out of the drive every spring.' },
  { key: 'sweep', title: 'Easy to look after', text: 'The stones are locked in place, so there is no loose gravel. An occasional sweep and wash keeps it looking good.' },
];

// Their own FAQ answers (wolverhamptondrivewaysltd.co.uk home page), plus one about this page's prices.
export const faq = [
  { q: 'Are you insured and licensed?', a: 'Yes, we are fully insured and licensed to operate in our area. We prioritise safety and compliance with all local regulations to ensure a smooth and worry-free experience for our clients.' },
  { q: 'Do you offer a guarantee?', a: 'Yes, we offer a comprehensive quality guarantee on our workmanship and materials. If any issues arise within the specified guarantee period, we will address and rectify them promptly at no additional cost.' },
  { q: 'How long does a project take?', a: 'The duration of a project depends on its complexity and size. We will provide you with a timeline estimate during the quotation process, and we work efficiently to complete projects within agreed-upon timeframes.' },
  { q: 'Can you help with design ideas?', a: 'Absolutely! Our team is experienced in design and can provide recommendations and ideas to help you make the best choices for your project.' },
  { q: 'Is the price on this page my quote?', a: 'No. It is an example range to help you plan. Steven gives you the real price in a free, no-obligation quote.' },
];
