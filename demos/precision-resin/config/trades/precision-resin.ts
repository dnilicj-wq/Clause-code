// Precision Resin Floors Ltd: commercial/industrial-first pack. Facts sourced in content-inventory.md.
// Prices are invented example rates, always shown as "Example range".
import { epoxy, type Finish, type Layer, type GalleryExtra, type TradePack } from './epoxy';

const C = '/client/';
const job = 'Precision Resin Floors job';

// Configurator finishes (commercial). type = pricing key. No photo swatches: chips show names.
const finishes: Finish[] = [
  { key: 'gloss', name: 'Gloss coating', type: 'gloss', base: '#0B2A6B', metal: '#3F8EE6', note: 'Epoxy primer + coloured gloss' },
  { key: 'lines', name: 'Line marking', type: 'lines', base: '#2A2C30', metal: '#F2C200', note: 'Walkways, hatching, bays' },
  { key: 'antislip', name: 'Anti-slip', type: 'antislip', base: '#3B4048', metal: '#9AA3AD', note: 'Textured, for wet or busy areas' },
  { key: 'bound', name: 'Resin bound', type: 'bound', base: '#6E5A44', metal: '#C9B08C', note: 'Driveways and paths' },
];

// Hero pour colours: taken from their own photographed floors.
const heroFinishes: Finish[] = [
  { key: 'blue', name: 'Blue gloss', type: 'metallic', base: '#0B2A6B', metal: '#3F8EE6', note: '' },
  { key: 'grey', name: 'Grey gloss', type: 'solid', base: '#5E656E', metal: '#B9C1CA', note: '' },
  { key: 'dark', name: 'Dark gloss', type: 'solid', base: '#1C2026', metal: '#5B6470', note: '' },
  { key: 'amber', name: 'Amber gloss', type: 'solid', base: '#8A5A1E', metal: '#E3A54A', note: '' },
  { key: 'flake', name: 'Blue flake', type: 'flake', base: '#123A86', metal: '#C9D6EA', note: '' },
];

const layers: (Layer & { edge: string })[] = [
  { key: 'grind', tex: '/demo/tex-grind-pr-v1.webp', edge: '#6E7175', name: 'Diamond grind', what: 'Old coatings, laitance and dust off', why: 'Resin bonds to open, clean concrete. This is the step cheap jobs skip.' },
  { key: 'repair', tex: '/demo/tex-repair-pr-v1.webp', edge: '#55595E', name: 'Repair', what: 'Cracks and joints filled, ground flush', why: 'Defects in the slab show straight through a gloss coat.' },
  { key: 'primer', tex: '/demo/tex-primer-pr-v1.webp', edge: '#6B4714', name: 'Epoxy primer', what: 'Soaks in and seals the slab', why: 'Stops pinholes and gives the coating something to grip.' },
  { key: 'body', tex: '/demo/tex-body-pr-v1.webp', edge: '#123A86', name: 'Epoxy coating', what: 'The colour and the build', why: 'This is what takes the traffic, the pallets and the spills.' },
  { key: 'finish', tex: '/demo/tex-top-pr-v1.webp', edge: '#1A4596', name: 'Lines or anti-slip', what: 'Walkways, hatching, grip where needed', why: 'Safety markings and texture go on last, where people walk.' },
];

const extra: GalleryExtra[] = [
  { name: 'Warehouse', note: 'Grey high-gloss', img: C + 'grey-gloss-warehouse-640-v1.webp', alt: 'Warehouse with a grey high-gloss resin floor', by: job },
  { name: 'Industrial unit', note: 'Dark gloss, yellow barriers', img: C + 'dark-gloss-barriers-640-v1.webp', alt: 'Dark gloss floor with yellow safety barriers', by: job },
  { name: 'Line marking', note: 'Yellow hatching', img: C + 'yellow-hatch-lines-640-v1.webp', alt: 'Yellow hatched line marking on a resin floor', by: job },
  { name: 'Factory floor', note: 'Yellow walkways', img: C + 'factory-yellow-walkways-640-v1.webp', alt: 'Factory floor with yellow walkway markings', by: job },
  { name: 'Safety markings', note: 'Footprint walkway', img: C + 'footprint-safety-markings-640-v1.webp', alt: 'Footprint safety markings on a floor', by: job },
  { name: 'Warehouse', note: 'Amber gloss', img: C + 'amber-gloss-warehouse-640-v1.webp', alt: 'Warehouse with an amber gloss resin floor', by: job },
  { name: 'Large hall', note: 'Blue flake gloss', img: C + 'blue-flake-hall-640-v1.webp', alt: 'Large hall with a blue flake gloss floor', by: job },
  { name: 'On the pour', note: 'Resin going down', img: C + 'pouring-resin-640-v1.webp', alt: 'Resin being poured onto a prepared floor', by: job },
  { name: 'Driveway', note: 'Resin bound', img: C + 'resin-bound-driveway-640-v1.webp', alt: 'Resin-bound driveway', by: job },
];

export const precision = {
  ...epoxy,
  key: 'precision',
  noun: 'resin floor',
  hero: {
    eyebrow: 'Industrial & commercial resin floors',
    lines: ['Ground flat.', 'Poured to last.'],
    sub: 'Resin floors for warehouses, factories and units across Nottingham and the East Midlands. Family-run, transforming spaces for over 13 years. Drag across the floor to pour one.',
    hint: { mouse: 'Move to pour', touch: 'Swipe to pour' },
  },
  rooms: ['Warehouses', 'Factories', 'Units', 'Driveways'],
  services: [
    'Floor preparation & grinding', 'Epoxy coatings & primers', 'Resin bound & decorative finishes',
    'Industrial floors', 'Commercial floors', 'Domestic floors', 'Line marking', 'Safety walkways',
  ],
  finishes,
  heroFinishes,
  quoteChips: true,
  layers,
  pricing: {
    label: 'Example range',
    perM2: { gloss: [22, 38], lines: [8, 16], antislip: [30, 48], bound: [60, 95] } as Record<string, [number, number]>,
    defaultSpace: 'unit',
    condition: { good: 0, cracked: 5, coated: 9 } as Record<string, number>,
    minimumJob: 900,
    spaces: {
      small: { label: 'Small unit', m2: 120 },
      unit: { label: 'Industrial unit', m2: 300 },
      warehouse: { label: 'Warehouse', m2: 700 },
      large: { label: 'Large site', m2: 1500 },
    } as Record<string, { label: string; m2: number }>,
    days: { small: 2, unit: 3, warehouse: 5, large: 8 } as Record<string, number>,
  },
  compare: {
    cols: ['Ground & primed resin', 'Floor paint', 'Sealer only'],
    rows: [
      ['Surface prep', 'Diamond ground', 'Swept', 'Swept'],
      ['Build', 'Primer + coating', 'Thin coat', 'Very thin'],
      ['Pallet & trolley traffic', 'Built for it', 'Wears through', 'Wears through'],
      ['Spills', 'Wipe clean', 'Can stain', 'Can stain'],
      ['Lines & anti-slip', 'Part of the system', 'Painted on top', 'Not usually'],
    ],
    note: 'General comparison of system types, not of any named product.',
  },
  faq: [
    { q: 'Do you do commercial and industrial floors?', a: 'Yes. Industrial, commercial and domestic projects: warehouses, factories and units, plus resin-bound driveways.' },
    { q: 'Why grind the floor first?', a: 'Resin bonds to clean, open concrete, not to dust, old paint or laitance. Grinding is the step that makes everything on top of it last.' },
    { q: 'Can you work around our site?', a: 'Lines are open 7am to 8pm, seven days. Talk to Ryan about timing the work around your operation.' },
    { q: 'Which areas do you cover?', a: 'Nottingham and the East Midlands. We are based in Hucknall.' },
    { q: 'Is there a guarantee?', a: 'Ask Ryan about our guarantee for your floor.' },
    { q: 'How do I get a proper price?', a: 'Use the price tool for an example range, then send Ryan the size and a photo of the floor on WhatsApp, or call 07767 081502.' },
  ],
  copy: {
    ...epoxy.copy,
    expand: { title: 'Laid by Precision.', image: C + 'blue-gloss-loft-1920-v1.webp', imageM: C + 'blue-gloss-loft-1280-v1.webp', imageAvif: C + 'blue-gloss-loft-1920-v1.avif', alt: 'Blue gloss resin floor in a brick-walled loft space', bg: '', pos: '50% 60%', posM: '55% 60%', by: job },
    photoBreak: { img: C + 'grinding-scissor-lifts-1920-v1.webp', imgM: C + 'grinding-scissor-lifts-1280-v1.webp', imgAvif: C + 'grinding-scissor-lifts-1920-v1.avif', alt: 'Floor being diamond ground in a unit with scissor lifts', line: 'Grind first. Coat second.', by: job },
    layers: { eyebrow: 'Grind first', h1: 'Five layers.', h2: 'Prep is most of the job.', lede: 'A coating is only as good as the slab under it. Scroll to take the floor apart.', tag: 'Illustration' },
    bento: {
      eyebrow: 'Why prep matters', h1: 'Done properly,', h2: 'it stays down.',
      spill: { title: 'Spills wipe off', text: 'Tap to spill. Oil sits on top of a sealed resin floor instead of soaking into bare concrete.' },
      gauge: { title: 'Check the slab first', text: 'Damp concrete pushes coatings off. The slab decides the system.' },
      tyre: null,
      timelineTitle: () => 'Grind first. Then everything else.',
      steps: [['01', 'Grind'], ['02', 'Repair'], ['03', 'Prime'], ['04', 'Coat'], ['05', 'Lines']] as [string, string][],
    },
    compare: { eyebrow: 'Before you compare quotes', h1: 'Not all floor coatings', h2: 'are the same thing.', short: ['Resin', 'Paint', 'Sealer'] },
    quote: { conditionLabel: 'Slab now', conditions: [['good', 'Sound'], ['cracked', 'Cracked'], ['coated', 'Old coating']] as [string, string][] },
    chat: { space: 'unit', finish: 'gloss', finishWord: 'grey gloss', ask: (town: string, m2: number) => `Hi, unit near ${town}, about ${m2}m². Old paint on it. Rough price for grey gloss?`, img: null, photoTip: 'Any phone photo of the floor is fine.' },
    gallery: {
      eyebrow: 'Our work', showFinishes: false,
      h1: 'Real floors.', h2: 'Our own photos.', kind: 'resin floor',
      extra,
      beforeAfter: null,
      pair: { a: C + 'grinding-old-coating-1280-v1.webp', aAlt: 'Old green coating being ground off a corridor floor', aLabel: 'Prep: old coating ground off',
        b: C + 'blue-flake-hall-1280-v1.webp', bAlt: 'Large hall with a finished blue flake gloss floor', bLabel: 'Finished: blue flake gloss', note: 'Two stages from Precision jobs.' },
    },
    finale: "Let's see your floor.",
    finaleSub: 'Send Ryan the size and a photo. Lines open 7am to 8pm, 7 days.',
  },
  offersUvStable: false,
} satisfies TradePack;
