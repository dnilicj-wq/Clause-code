// Microcement trade pack. Structure follows the KT demo (services, layer system, finishes, FAQ),
// but no KT photos, facts or wording. Prices are DEMO rates, always labelled "Example range".
// No product names, certifications or performance numbers: the business adds its own, with sources.
import type { TradePack, Finish, Layer } from './epoxy';

export const microcement: TradePack = {
  key: 'microcement',
  noun: 'microcement finish',
  hero: {
    eyebrow: 'Microcement walls & floors',
    lines: ['Seamless stone,', 'by hand.'],
    sub: 'Bathrooms, showers, kitchens and floors across {areas}. Swipe the wall to trowel a coat on.',
    hint: { mouse: 'Move to trowel', touch: 'Swipe to trowel' },
  },
  rooms: ['Bathrooms', 'Wet rooms', 'Kitchens', 'Living spaces', 'Stairs'],
  services: [
    'Bathrooms', 'Walk-in showers', 'Wet rooms', 'Kitchen floors', 'Worktops & splashbacks',
    'Living-room floors', 'Stairs', 'Feature walls', 'Fireplaces', 'Over-tile renovations',
  ],
  finishes: [
    { key: 'chalk', name: 'Chalk white', type: 'smooth', base: '#E9E4DC', metal: '#F7F4EE', note: 'Soft, bright, minimal' },
    { key: 'greige', name: 'Warm greige', type: 'smooth', base: '#BDB2A3', metal: '#D9D0C3', note: 'The most asked-for tone' },
    { key: 'clay', name: 'Terracotta clay', type: 'textured', base: '#A86F55', metal: '#C99579', note: 'Earthy, Mediterranean' },
    { key: 'stone', name: 'Grey stone', type: 'textured', base: '#8C8A85', metal: '#B3B0AA', note: 'Natural cloud movement' },
    { key: 'charcoal', name: 'Charcoal', type: 'smooth', base: '#3A3936', metal: '#5E5C57', note: 'Moody, dramatic' },
    { key: 'sage', name: 'Sage', type: 'textured', base: '#9AA592', metal: '#BCC5B4', note: 'Calm and organic' },
  ] as Finish[],
  layers: [
    { key: 'prep', colour: '#9A958E', name: 'Prepared surface', what: 'Cleaned, levelled and keyed', why: 'Tiles, plaster or screed are checked, fixed and keyed so the coats have something to grip.' },
    { key: 'primer', colour: '#C9B9A1', name: 'Primer', what: 'Bonding primer', why: 'Locks the surface and stops the base coat drying out too fast.' },
    { key: 'base', colour: '#B7AEA2', name: 'Base coats', what: 'Coarse microcement with mesh', why: 'The strength layer. Mesh helps resist hairline cracking over joints.' },
    { key: 'finish', colour: '#D9D0C3', name: 'Finish coats', what: 'Fine microcement, hand trowelled', why: 'The colour and the cloudy, hand-made movement you actually see.' },
    { key: 'seal', colour: '#EFEAE2', name: 'Sealer', what: 'Protective sealer coats', why: 'Keeps water and stains on the surface. Wet areas get a system made for them.' },
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
    cols: ['Microcement', 'Tiles', 'Paint or plaster'],
    rows: [
      ['Joints', 'Seamless, no grout', 'Grout line every tile', 'Seamless'],
      ['Wet areas', 'Sealed system for showers', 'Yes, grout needs upkeep', 'Not for showers'],
      ['Over old tiles', 'Often, after prep', 'Strip out first', 'No'],
      ['Thickness', 'A few millimetres', 'Tile plus adhesive', 'Very thin'],
      ['Look', 'Hand-made, cloudy stone', 'Uniform, repeating', 'Flat colour'],
    ],
    note: 'General comparison of finish types, not of any named product.',
  },
  faq: [
    { q: 'Can it go over my existing tiles?', a: 'Often, yes. Sound, well-fixed tiles are cleaned, keyed and the grout lines filled first. Loose or hollow tiles come off. We check on the survey.' },
    { q: 'Can I use it in a shower?', a: 'Yes, with the right system: a suitable base, mesh and a sealer made for wet areas. We explain exactly what goes on your walls before you book.' },
    { q: 'Will it crack?', a: 'Movement in the building is what cracks finishes. Prep, mesh in the base coats and allowing for existing joints keep the risk low. We will be honest if a surface is not suitable.' },
    { q: 'How long does a bathroom take?', a: 'Usually a few days, because each coat needs to dry before the next. We confirm the timeline for your room before we start.' },
    { q: 'How do I clean it?', a: 'Warm water and a pH-neutral cleaner. No bleach or abrasive pads. We leave you simple care notes.' },
  ],
  chat: [],
  copy: {
    surface: 'finish',
    hero: 'trowel',
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
    compare: { eyebrow: 'Before you choose', h1: 'Microcement is not', h2: 'just thin plaster.', short: ['Microcement', 'Tiles', 'Paint'] },
    quote: { conditionLabel: 'Surface now', conditions: [['sound', 'Sound'], ['tiled', 'Old tiles'], ['uneven', 'Uneven']] },
    chat: { space: 'shower', finish: 'smooth', finishWord: 'a smooth finish', ask: (town: string, m2: number) => `Hi, walk-in shower in ${town}, about ${m2}m² of walls. Can you go over the tiles? Rough price?`, img: null, photoTip: 'Any phone photo of the room is fine.' },
    gallery: { h1: 'Pick a tone.', h2: 'Every wall is hand-made.', kind: 'microcement', extra: [], beforeAfter: null },
    finale: "Let's see your room.",
    finaleSub: 'A free survey: we measure, check the surface and give you a fixed written price.',
  },
  offersUvStable: false,
};
