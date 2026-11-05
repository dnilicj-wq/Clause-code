// Epoxy / resin flooring trade pack (default). Copy, layer system, finishes, pricing model.
// Prices are DEMO rates, always shown with the label "Example range" until the business sets its own.

export type Finish = { key: string; name: string; type: string; base: string; metal: string; note: string; img?: string };
export type Layer = { key: string; name: string; what: string; why: string; tex?: string; colour?: string };
export type GalleryExtra = { name: string; note: string; img: string; alt: string; by: string };

// A finish's look: its example image if the pack has one, otherwise a swatch drawn from its colours.
export const finishBg = (f: Finish) => f.img ? `url(${f.img})` : `radial-gradient(120% 90% at 30% 25%, ${f.metal}, ${f.base} 70%)`;
// Same as finishBg but as an image URL (for components that need <img src>): the example image, or an SVG swatch.
export const finishImg = (f: Finish) => f.img || 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><defs><radialGradient id="g" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="${f.metal}"/><stop offset=".7" stop-color="${f.base}"/></radialGradient><filter id="n"><feTurbulence baseFrequency=".012" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .18 0"/></filter></defs><rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" filter="url(#n)"/></svg>`);
export const layerBg = (l: Layer) => l.tex ? `url(${l.tex})` : `linear-gradient(135deg, ${l.colour || '#888'}, color-mix(in srgb, ${l.colour || '#888'} 70%, black))`;

export const epoxy = {
  key: 'epoxy',
  noun: 'resin floor',
  hero: {
    eyebrow: 'Resin & epoxy floors',
    lines: ['Floors poured', 'like liquid.'],
    sub: 'Garages, kitchens, showrooms and workshops across {areas}. Drag across the floor to pour one.',
    hint: { mouse: 'Move to pour', touch: 'Swipe to pour' },
  },
  rooms: ['Garages', 'Kitchens', 'Showrooms', 'Workshops', 'Commercial units'],
  services: [
    'Garage floors', 'Metallic epoxy', 'Flake systems', 'Kitchen floors', 'Showroom floors',
    'Workshop coatings', 'Anti-slip finishes', 'Crack & joint repair', 'Diamond grinding', 'Commercial units',
  ],
  finishes: [
    { key: 'graphite-flake', name: 'Graphite flake', type: 'flake', base: '#2B2C2E', metal: '#BFC3C7', note: 'Hides dust, grips well' },
    { key: 'copper-metallic', name: 'Copper metallic', type: 'metallic', base: '#140D09', metal: '#C98A57', note: 'One-off swirl pattern' },
    { key: 'pearl-metallic', name: 'Pearl metallic', type: 'metallic', base: '#CFCAC2', metal: '#F7F2EA', note: 'Bright, gallery feel' },
    { key: 'midnight-metallic', name: 'Midnight metallic', type: 'metallic', base: '#06080F', metal: '#4D6FA8', note: 'Deep, glassy, dramatic' },
    { key: 'storm-solid', name: 'Storm grey solid', type: 'solid', base: '#6D7175', metal: '#9EA3A8', note: 'Clean and practical' },
    { key: 'quartz-sand', name: 'Sand quartz', type: 'quartz', base: '#B9A88F', metal: '#E4D7C1', note: 'Textured, anti-slip' },
  ].map((f) => ({ ...f, img: `/demo/look-${f.key}-v2.webp` })) as Finish[],
  layers: [
    { key: 'slab', tex: '/demo/tex-slab-v1.webp', name: 'Ground slab', what: 'Diamond-ground concrete', why: 'Opens the pores so the resin bonds into the slab, not onto dust.' },
    { key: 'primer', tex: '/demo/tex-primer-v1.webp', name: 'Primer', what: 'Penetrating epoxy primer', why: 'Soaks in and seals the slab. Skip it and you get pinholes and bubbles.' },
    { key: 'base', tex: '/demo/tex-base-v1.webp', name: 'Base coat', what: 'Pigmented epoxy body coat', why: 'The colour and the thickness. This is what takes the knocks.' },
    { key: 'flake', tex: '/demo/tex-flake-v1.webp', name: 'Flake or metallic', what: 'Broadcast flake or metallic pigment', why: 'The look you choose, locked into the base while it is still wet.' },
    { key: 'top', tex: '/demo/tex-top-v1.webp', name: 'Topcoat', what: 'Clear sealer coat', why: 'The gloss, the grip and the stain resistance. The part you touch every day.' },
  ] as Layer[],
  // Pricing model: £ per m² by finish type, plus condition adders. DEMO numbers.
  pricing: {
    label: 'Example range',
    perM2: { flake: [45, 70], metallic: [70, 110], solid: [35, 55], quartz: [55, 85] } as Record<string, [number, number]>,
    defaultSpace: 'double',
    condition: { good: 0, cracked: 8, coated: 14 } as Record<string, number>,
    minimumJob: 1200,
    spaces: {
      single: { label: 'Single garage', m2: 18 },
      double: { label: 'Double garage', m2: 36 },
      kitchen: { label: 'Kitchen', m2: 25 },
      showroom: { label: 'Showroom', m2: 120 },
    } as Record<string, { label: string; m2: number }>,
    days: { single: 2, double: 2, kitchen: 2, showroom: 4 } as Record<string, number>,
  },
  compare: {
    cols: ['Proper resin system', 'Garage floor paint', 'DIY epoxy kit'],
    rows: [
      ['Surface prep', 'Diamond ground', 'Swept and washed', 'Acid etch, if any'],
      ['Thickness', 'Built in coats', 'One or two thin coats', 'One thin coat'],
      ['Hot tyres', 'Designed to resist', 'Prone to lifting', 'Often lifts'],
      ['Chemical spills', 'Wipe clean', 'Can stain', 'Can stain'],
      ['Finish options', 'Flake, metallic, quartz, solid', 'Solid colour', 'Solid with sprinkle flake'],
    ],
    note: 'General comparison of system types, not of any named product.',
  },
  faq: [
    { q: 'How long until I can use the floor?', a: 'Most floors take light foot traffic the next day. Cars usually go back on after a few days, depending on the system and temperature. We confirm the exact cure time for your floor before we start.' },
    { q: 'Will hot tyres lift it?', a: 'Hot-tyre pickup happens when a coating is thin or poorly bonded. A ground slab, a primer and a proper body coat are what stop it. We explain the system we use before you book.' },
    { q: 'What if my concrete is cracked or damp?', a: 'Cracks are filled and ground flush first. Damp slabs need testing; if moisture is high we use a suitable primer or tell you honestly if it is not worth coating.' },
    { q: 'Is it slippery?', a: 'Gloss can be slippery when wet, so we can add an anti-slip aggregate to the topcoat. You choose the level of grip.' },
    { q: 'How do I get an exact price?', a: 'Use the price tool for a range, then book a free survey. We measure, check the slab and give you a fixed written quote.' },
  ],
  chat: [
    { from: 'you', text: 'Hi, how much for a double garage? It has a few cracks.' },
    { from: 'us', text: 'Hi! Around 36 m² with crack repair, flake finish. Want a free survey this week?' },
    { from: 'you', text: 'Thursday afternoon?' },
    { from: 'us', text: 'Thursday at 2pm is booked. You will get a text the day before.' },
  ],
  // Section wording. Every section reads its trade-specific copy from here.
  copy: {
    surface: 'floor',
    hero: 'pour' as 'pour' | 'trowel',
    // Full-bleed finished floor that grows to fill the screen on scroll. null = skip (no matching image).
    expand: { title: 'Your garage, finished.', image: '/demo/home-garage-car-1600-v1.webp', imageM: '/demo/home-garage-car-800-v1.webp', alt: 'A car parked in a clean, finished home garage', bg: '' } as { title: string; image: string; imageM?: string; alt?: string; bg: string } | null,
    // Full-bleed photo break between sections. null = skip.
    photoBreak: { img: '/demo/living-gloss-1600-v1.webp', imgM: '/demo/living-gloss-800-v1.webp', alt: 'Bright home interior with a seamless gloss floor', line: 'Laid once. Looks like this for years.' } as { img: string; imgM?: string; alt: string; line: string } | null,
    layers: { eyebrow: 'What goes into a floor', h1: 'Five layers.', h2: 'Skip one and it fails.', lede: 'A cheap quote is usually a missing layer. Scroll to take the floor apart.', tag: 'Rendered textures' },
    bento: {
      eyebrow: 'The difference you cannot see', h1: 'Done properly,', h2: 'it stays down.',
      spill: { title: 'Spills wipe off', text: 'Tap to spill. Oil and brake fluid sit on top of the sealer instead of soaking into bare concrete.' } as { title: string; text: string } | null,
      gauge: { title: 'We test the slab first', text: 'Damp concrete pushes coatings off. We check moisture before we quote.' },
      tyre: { title: 'Hot tyres stay put', text: 'Thin paint softens under a hot tyre and lifts. A bonded system stays down.' } as { title: string; text: string } | null,
      timelineTitle: (days: number) => `About ${days} days for a double garage`,
      steps: [['Day 1', 'Grind & repair'], ['Day 1', 'Primer & base'], ['Day 2', 'Flake or metallic'], ['Day 2', 'Topcoat'], ['After', 'Cure, then drive on']] as [string, string][],
    },
    compare: { eyebrow: 'Before you compare quotes', h1: 'Not all floor coatings', h2: 'are the same thing.', short: ['Resin system', 'Floor paint', 'DIY kit'] },
    quote: { conditionLabel: 'Concrete now', conditions: [['good', 'Sound'], ['cracked', 'Cracked'], ['coated', 'Old coating']] as [string, string][] },
    chat: { space: 'double', finish: 'flake', finishWord: 'flake', ask: (town: string, m2: number) => `Hi, double garage in ${town}, about ${m2}m². Thinking flake. Rough price?`, img: '/demo/garage-before-800-v1.webp' as string | null, photoTip: 'Any phone photo of the floor is fine.' },
    gallery: {
      h1: 'Pick a look.', h2: 'Every pour is one-off.', kind: 'resin finish',
      extra: [
        { name: 'Double garage', note: 'Gloss floor, home garage', img: '/demo/garage-gloss-car-800-v1.webp', alt: 'Sports car in a home garage with a gloss floor (example image)', by: 'Example image · Pexels' },
        { name: 'Living space', note: 'Seamless gloss floor', img: '/demo/living-gloss-800-v1.webp', alt: 'Bright hallway and living space with a seamless gloss floor (example image)', by: 'Example image · Pexels' },
        { name: 'Garage gym', note: 'Hard-wearing gloss', img: '/demo/garage-gym-800-v1.webp', alt: 'Home gym in a converted garage (example image)', by: 'Example image · Pexels' },
        { name: 'Driveway', note: 'Outside the house', img: '/demo/driveway-800-v1.webp', alt: 'Wide driveway in front of a modern house (example image)', by: 'Example image · Pexels' },
      ] as GalleryExtra[],
      // Not the same garage: a bare garage next to a finished one, labelled "Illustration" (no free matched pair exists)
      beforeAfter: { before: '/demo/garage-bare-1600-v1.webp', after: '/demo/garage-gym-1600-v1.webp', beforeAlt: 'Empty garage with a bare concrete floor (example image)', afterAlt: 'A different garage with a finished gloss floor (example image)' } as { before: string; after: string; beforeAlt: string; afterAlt: string } | null,
    },
    finale: "Let's see your floor.",
    finaleSub: 'A free survey: we measure, test the slab and give you a fixed written price.',
  },
  offersUvStable: false, // true only if the business sells UV-stable topcoats (enables the UV slider)
};

export type TradePack = typeof epoxy;

export function estimate(P: TradePack['pricing'], o: { space: string; m2?: number; finish: string; condition: string }) {
  const m2 = Number(o.m2 || P.spaces[o.space]?.m2 || 36);
  const [lo, hi] = P.perM2[o.finish] || Object.values(P.perM2)[0];
  const add = P.condition[o.condition] || 0;
  const r50 = (n: number) => Math.round(n / 50) * 50;
  return {
    m2,
    low: r50(Math.max(P.minimumJob, m2 * (lo + add))),
    high: r50(Math.max(P.minimumJob * 1.25, m2 * (hi + add))),
    days: P.days[o.space] || 2,
  };
}

export const gbp = (n: number) => '£' + Math.round(n).toLocaleString('en-GB');
