// Venetian plaster trade pack (reusable for future plaster leads). Built for Lime & Marble, 2026-11-13.
// Generic craft facts only. No prices, product names, timings or performance numbers: each business adds its own, with sources.
// Prices stay DEMO rates, always labelled "Example range".
import type { TradePack, Finish, Layer } from './epoxy';

export const venetianPlaster: TradePack = {
  key: 'venetian-plaster',
  noun: 'Venetian plaster finish',
  hero: {
    eyebrow: 'Venetian plaster walls',
    lines: ['Polished stone,', 'by hand.'],
    sub: 'Lime and marble dust, trowelled and burnished across {areas}. Move across the wall to burnish it.',
    hint: { mouse: 'Move to burnish', touch: 'Swipe to burnish' },
  },
  rooms: ['Living rooms', 'Bedrooms', 'Bathrooms', 'Hallways', 'Feature walls'],
  services: ['Feature walls', 'Whole rooms', 'Bathrooms', 'Ceilings', 'Archways', 'Fireplaces', 'Over-tile renovations', 'Custom textures'],
  finishes: [
    { key: 'marmorino', name: 'Soft polished', type: 'smooth', base: '#E6E0D5', metal: '#F6F2EA', note: 'Satin, cloudy movement' },
    { key: 'marble', name: 'High polish', type: 'smooth', base: '#D8D0C3', metal: '#FBF8F2', note: 'Burnished to a marble shine' },
    { key: 'travertine', name: 'Travertine look', type: 'textured', base: '#CDBDA5', metal: '#E4D7C3', note: 'Open, stone-like texture' },
    { key: 'limestone', name: 'Limestone look', type: 'textured', base: '#D9D1C2', metal: '#EAE4D8', note: 'Matte, chalky, calm' },
    { key: 'greige', name: 'Warm greige', type: 'smooth', base: '#B8AD9D', metal: '#D7CEC0', note: 'Deeper tone' },
    { key: 'charcoal', name: 'Charcoal', type: 'smooth', base: '#45433F', metal: '#6A6761', note: 'Moody, dramatic' },
  ] as Finish[],
  layers: [
    { key: 'prep', colour: '#9A958E', name: 'Prepared wall', what: 'Sound, smooth and primed', why: 'Plaster is only as good as the wall under it, so cracks and patches are fixed first.' },
    { key: 'base', colour: '#C9C1B4', name: 'Base coats', what: 'Lime plaster, by trowel', why: 'Builds an even body for the finish to sit on.' },
    { key: 'finish', colour: '#DDD5C8', name: 'Finish coats', what: 'Thin coats with marble dust', why: 'Where the colour, depth and movement come from.' },
    { key: 'burnish', colour: '#EFEAE2', name: 'Burnish', what: 'Steel trowel, pressed and polished', why: 'Compresses the surface until it shines like stone.' },
    { key: 'wax', colour: '#F7F4EE', name: 'Wax (optional)', what: 'Protective wax', why: 'Adds depth and helps repel dust and marks.' },
  ] as Layer[],
  pricing: {
    label: 'Example range',
    perM2: { smooth: [90, 140], textured: [100, 155] } as Record<string, [number, number]>,
    defaultSpace: 'bathroom',
    condition: { sound: 0, tiled: 12, uneven: 20 } as Record<string, number>,
    minimumJob: 1500,
    spaces: {
      shower: { label: 'Shower enclosure', m2: 12 },
      bathroom: { label: 'Bathroom', m2: 30 },
      kitchen: { label: 'Kitchen floor', m2: 25 },
      open: { label: 'Open-plan floor', m2: 60 },
    } as Record<string, { label: string; m2: number }>,
    days: { shower: 3, bathroom: 4, kitchen: 4, open: 5 } as Record<string, number>,
  },
  compare: {
    cols: ['Venetian plaster', 'Paint', 'Wallpaper'],
    rows: [
      ['Look', 'Depth like polished stone', 'Flat colour', 'Printed pattern'],
      ['Joints', 'Seamless', 'Seamless', 'Seams every roll'],
      ['Repairs', 'Patch a layer, not the room', 'Repaint the wall', 'Replace the drop'],
      ['Cleaning', 'Mild soap and water', 'Wipeable paints only', 'Varies'],
    ],
    note: 'General comparison of finish types, not of any named product.',
  },
  faq: [
    { q: 'What is Venetian plaster made of?', a: 'Traditionally slaked lime and marble dust, applied in thin coats and burnished to a shine.' },
    { q: 'Can it go in a bathroom?', a: 'On walls, yes, with the right system and finish. Ask what goes on your walls before you book.' },
    { q: 'How do I clean it?', a: 'Mild soap and water. A wax coat helps repel dust and dirt.' },
    { q: 'How long does a room take?', a: 'It depends on the wall and the finish. Each coat needs to dry, so ask for a timeline on your survey.' },
  ],
  chat: [],
  copy: {
    surface: 'finish',
    hero: 'trowel', // TODO: a burnish hero variant (see demos/lime-and-marble/src/lime/Burnish.tsx)
    expand: null,
    photoBreak: null, // add once there is a real or labelled example microcement photo
    layers: { eyebrow: 'What goes into a microcement finish', h1: 'Five layers.', h2: 'All of them by hand.', lede: 'A cheap quote is usually a skipped coat. Scroll to take the wall apart.', tag: 'Colour swatches' },
    bento: {
      eyebrow: 'The part you never see', h1: 'Prepared properly,', h2: 'it stays seamless.',
      spill: null,
      gauge: { title: 'We check the surface first', text: 'Damp or moving surfaces crack finishes. We test before we quote, and say so if it is not suitable.' },
      tyre: null,
      timelineTitle: (days: number) => `About ${days} days for a bathroom`,
      steps: [['Day 1', 'Prep & primer'], ['Day 2', 'Base coats & mesh'], ['Day 3', 'Finish coats'], ['Day 4', 'Seal'], ['After', 'Let it cure, then shower']],
    },
    compare: { eyebrow: 'Before you choose', h1: 'Venetian plaster is not', h2: 'just posh paint.', short: ['Plaster', 'Paint', 'Paper'] },
    quote: { conditionLabel: 'Surface now', conditions: [['sound', 'Sound'], ['tiled', 'Old tiles'], ['uneven', 'Uneven']] },
    chat: { space: 'shower', finish: 'smooth', finishWord: 'a smooth finish', ask: (town: string, m2: number) => `Hi, walk-in shower in ${town}, about ${m2}m² of walls. Can you go over the tiles? Rough price?`, img: null, photoTip: 'Any phone photo of the room is fine.' },
    gallery: { h1: 'Pick a tone.', h2: 'Every wall is hand-made.', kind: 'microcement', extra: [], beforeAfter: null },
    finale: "Let's see your space.",
    finaleSub: 'A free survey: we measure, check the surface and give you a fixed written price.',
    finaleCta: 'Book a free survey',
  },
  offersUvStable: false,
};
