// Epoxy / resin flooring trade pack (default). Copy, layer system, finishes, pricing model.
// Prices are DEMO rates, always shown with the label "Example range" until the business sets its own.

export type Finish = { key: string; name: string; type: 'flake' | 'metallic' | 'solid' | 'quartz'; base: string; metal: string; note: string };

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
  ] as Finish[],
  layers: [
    { key: 'slab', name: 'Ground slab', what: 'Diamond-ground concrete', why: 'Opens the pores so the resin bonds into the slab, not onto dust.' },
    { key: 'primer', name: 'Primer', what: 'Penetrating epoxy primer', why: 'Soaks in and seals the slab. Skip it and you get pinholes and bubbles.' },
    { key: 'base', name: 'Base coat', what: 'Pigmented epoxy body coat', why: 'The colour and the thickness. This is what takes the knocks.' },
    { key: 'flake', name: 'Flake or metallic', what: 'Broadcast flake or metallic pigment', why: 'The look you choose, locked into the base while it is still wet.' },
    { key: 'top', name: 'Topcoat', what: 'Clear sealer coat', why: 'The gloss, the grip and the stain resistance. The part you touch every day.' },
  ],
  // Pricing model: £ per m² by finish type, plus condition adders. DEMO numbers.
  pricing: {
    label: 'Example range',
    perM2: { flake: [45, 70], metallic: [70, 110], solid: [35, 55], quartz: [55, 85] } as Record<Finish['type'], [number, number]>,
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
  offersUvStable: false, // true only if the business sells UV-stable topcoats (enables the UV slider)
};

export type TradePack = typeof epoxy;

export function estimate(P: TradePack['pricing'], o: { space: string; m2?: number; finish: Finish['type']; condition: string }) {
  const m2 = Number(o.m2 || P.spaces[o.space]?.m2 || 36);
  const [lo, hi] = P.perM2[o.finish];
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
