// Page content for the Sussex & Surrey Driveways demo. Every claim is sourced in content-inventory.md.
// Photos are the ones on their own website (sussexandsurreydrivewaysltd.co.uk). Captions say where they came from.

export type Photo = { key: string; title: string; alt: string; big: boolean };
export const photos: Photo[] = [
  { key: 'block-herringbone', title: 'Herringbone block paving', alt: 'Herringbone block paving path with a dark block border', big: true },
  { key: 'resin-front', title: 'Resin driveway', alt: 'Golden resin driveway with a red brick border in front of a brick house', big: false },
  { key: 'tarmac-edging', title: 'Tarmac driveway with edging', alt: 'Black tarmac driveway with a block edging along a lawn and hedge', big: true },
  { key: 'patio-stone', title: 'Natural stone patio', alt: 'Pale natural stone patio with garden furniture beside a brick wall', big: true },
  { key: 'block-curve', title: 'Block paved drive', alt: 'Red block paved drive curving past a gravel border', big: true },
  { key: 'resin-red-edge', title: 'Resin with a brick border', alt: 'Grey resin driveway edged with a red brick border', big: true },
  { key: 'patio-steps', title: 'Patio and steps', alt: 'Natural stone patio stepping down to a lawn', big: true },
  { key: 'tarmac-house', title: 'Tarmac driveway', alt: 'Black tarmac drive with a light block border in front of a brick house', big: true },
];
export const photoSrc = (p: Photo | string, size: 640 | 1280 = 1280) => {
  const ph = typeof p === 'string' ? photos.find((x) => x.key === p) : p;
  const key = typeof p === 'string' ? p : p.key;
  return `/client/${key}-${size === 1280 && (ph ? ph.big : true) ? 1280 : 640}-v1.webp`;
};

// Their process, from their driveways page ("From initial planning and choice of materials through to project
// management and installation ... ground works and drainage ... kerbs and sealant"). Shortened, same steps.
export const process = [
  { title: 'Free site visit', text: 'They come to you, talk through what you need and give a free, no obligation estimate.' },
  { title: 'Design and planning', text: 'A free design and planning service: the layout, the materials and the look, chosen with you.' },
  { title: 'Groundworks and drainage', text: 'The ground is prepared and any drainage the surface needs goes in first.' },
  { title: 'Installation', text: 'Your new surface is laid, with any extra features such as kerbs and sealant. Project managed start to finish.' },
];

export const faq = [
  { q: 'Which driveway surface should I choose?', a: 'Their site covers four: block paving for patterns and colours, resin for a gravel look without loose stones, tarmac for a hard-wearing finish in black or red, and gravel when a large area needs covering at low cost. They advise on the visit.' },
  { q: 'Does a resin driveway need drainage?', a: 'The resin bonded surface they describe is non-permeable, so water cannot drain through it. Talk to them about drainage to clear run-off rainwater.' },
  { q: 'What size gravel do they recommend?', a: 'A minimum of 6-10 mm gravel for pathways and 10-20 mm for driveways. They can also advise on driveway grids to stop gravel moving around.' },
  { q: 'Can they repair my existing drive instead?', a: 'Yes. They carry out driveway repairs: repairing, patching or cleaning your existing driveway.' },
  { q: 'What does the visit cost?', a: 'Nothing. They offer a free site survey, a free design and planning service and a free, no obligation estimate.' },
];
