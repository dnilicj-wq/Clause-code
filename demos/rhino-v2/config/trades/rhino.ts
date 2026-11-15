// Rhino Coating trade pack: copy of the epoxy pack, cut to Rhino's own systems, blends, process and wording.
// Every line is sourced in demos/rhino-v2/content-inventory.md. Prices stay "Example range" (Rhino publish none).
import { epoxy, type TradePack, type Finish, type GalleryExtra } from './epoxy';

const job = 'Rhino Coating job';

export const rhino: TradePack = {
  ...epoxy,
  key: 'rhino',
  noun: 'resin floor',
  hero: {
    eyebrow: 'Epoxy & resin floors',
    lines: ['Built on prep,', 'not shortcuts.'],
    sub: 'Garage, workshop and commercial epoxy floors. Manchester based, installing across the UK with our own team. Drag across the slab to pour one.',
    hint: { mouse: 'Move to pour', touch: 'Swipe to pour' },
  },
  rooms: ['Garages', 'Workshops', 'Showrooms', 'Home gyms', 'Commercial units'],
  services: [
    'Garage flooring', 'Full flake · FB-400', 'Solid high build · HB-200', 'Marble effect · M-Flow', 'Commercial epoxy',
    'Industrial flooring', 'Showroom floors', 'Home gyms', 'New-build developments', 'Diamond grinding', 'Moisture testing',
  ],
  finishes: [
    { key: 'fb400-grey-white', name: 'Grey & white flake', type: 'flake', base: '#2C2D31', metal: '#9C9FA4', note: 'FB-400 · the most requested blend', img: '/client/look-grey-white-v1.webp', photo: true, by: job },
    { key: 'fb400-blue-grey', name: 'Blue & grey flake', type: 'flake', base: '#33495A', metal: '#A9CADB', note: 'FB-400 · a cooler, modern blend', img: '/client/look-blue-grey-v1.webp', photo: true, by: job },
    { key: 'fb400-neutral', name: 'Neutral grey flake', type: 'flake', base: '#5B5E62', metal: '#C9CBCC', note: 'FB-400 · calm, tone on tone', img: '/client/look-neutral-grey-v3.webp', photo: true, by: job },
    { key: 'hb200-solid', name: 'HB-200 solid', type: 'solid', base: '#C4CAD0', metal: '#EEF1F4', note: 'Seamless solid colour', img: '/client/look-solid-white-v2.webp', photo: true, by: job },
    { key: 'mflow-marble', name: 'M-Flow marble', type: 'metallic', base: '#E4E0EA', metal: '#7D68B0', note: 'A one-off pattern every time' },
  ] as Finish[],
  layers: [
    { key: 'slab', tex: '/demo/tex-slab-v1.webp', name: 'Ground slab', what: 'Diamond-ground concrete', why: 'Removes laitance, old coatings and contamination, and opens a profile the resin can key into.' },
    { key: 'primer', tex: '/client/tex-primer-rhino-v1.webp', name: 'Primer or DPM', what: 'Moisture-tolerant epoxy primer', why: 'Seals the slab after the moisture test. Where readings are high, a damp-proof membrane goes down instead.' },
    { key: 'base', tex: '/client/tex-base-rhino-v1.webp', name: 'High-build epoxy', what: 'Industrial-grade body coat', why: 'The structural layer: it carries jack stands, trolley jacks and dropped tools.' },
    { key: 'flake', tex: '/client/tex-flake-rhino-v1.webp', name: 'Flake broadcast', what: 'Vinyl flake, broadcast by hand to refusal', why: 'Dense, even and textured. It hides dust and tyre marks and adds grip.' },
    { key: 'top', tex: '/client/tex-top-rhino-v1.webp', name: 'UV-stable top coat', what: 'Clear protective seal', why: 'Locks the flake in, takes the tyres and cleaning, and stops the floor yellowing in daylight.' },
  ],
  pricing: {
    ...epoxy.pricing,
    label: 'Example range',
    perM2: { flake: [45, 70], solid: [35, 55], metallic: [70, 110] },
    defaultSpace: 'single',
    spaces: {
      single: { label: 'Single garage', m2: 18 },
      double: { label: 'Double garage', m2: 36 },
      workshop: { label: 'Workshop', m2: 80 },
      showroom: { label: 'Showroom', m2: 120 },
    },
    days: { single: 3, double: 3, workshop: 4, showroom: 5 },
    daysText: { single: '2–3 days on site' },
    note: 'Example figures only. Rhino quote every floor individually and confirm a fixed written price. 12 months interest-free finance available, subject to status.',
  },
  compare: {
    cols: ['Rhino resin system', 'Garage floor paint', 'DIY epoxy kit'],
    rows: [
      ['Surface prep', 'Diamond ground, moisture tested', 'Swept and washed', 'Usually skipped'],
      ['Build', 'Primer, high-build epoxy, top coat', 'One or two thin coats', 'Retail-grade, thin'],
      ['Hot tyres & road salt', 'Specified with both in mind', 'Prone to lifting', 'Prone to lifting'],
      ['Top coat', 'Clear, UV-stable', 'None', 'Varies'],
      ['Warranty', '10-year workmanship, subject to terms', '—', '—'],
    ],
    note: 'General comparison of system types, not of any named product.',
  },
  faq: [
    { q: 'How long does it take to install?', a: 'A typical single garage takes two to three days on site: diamond grinding, repairs, primer, the epoxy base coat, the flake broadcast and the top coat, with curing time between each stage. Larger commercial floors take longer, and the programme is agreed before work starts.' },
    { q: 'When can I use the floor?', a: 'Light foot traffic is typically fine after about 24 hours and vehicles after about 72 hours. Temperature and humidity change this, so we confirm the times for your floor at handover.' },
    { q: 'How is it priced?', a: 'Every floor is quoted individually rather than from a flat rate, because the honest figure depends on the system, the area and the condition of the slab. You get a fixed written quotation. The ranges in the price tool on this page are examples only.' },
    { q: 'What if my concrete is damp or cracked?', a: 'Moisture is assessed before any coating goes down; the answer may be a moisture-tolerant primer or a dedicated DPM. Cracks, joints and defects are repaired during preparation. Larger repairs or screed work are assessed and quoted separately.' },
    { q: 'Can you go over a painted or sealed floor?', a: 'In many cases, yes, but existing coatings usually need removing or mechanically preparing first so the new system bonds properly. We check this at survey.' },
    { q: 'Do you cover my area?', a: 'We are based in Greater Manchester, with South Manchester our home patch, and our own team installs nationwide. Send your postcode and we will confirm.' },
    { q: 'Is finance available?', a: '12 months interest-free finance is available through our third-party finance partner, subject to status. Rhino Coating Ltd acts as a credit broker, not a lender.' },
  ],
  copy: {
    ...epoxy.copy,
    expand: { title: 'Your garage, finished.', image: '/client/garage-grey-flake-1920-v1.webp', imageM: '/client/garage-in-use-1600-v1.webp', alt: 'Garage with a grey full flake epoxy floor, workbench and shelving, installed by Rhino Coating', bg: '', pos: '50% 60%', posM: '50% 55%', by: job },
    photoBreak: { img: '/client/workshop-1600-v1.webp', imgM: '/client/flake-blue-grey-1600-v1.webp', alt: 'Empty workshop with a finished resin floor, installed by Rhino Coating', line: 'The preparation decides the result.', by: job },
    layers: { eyebrow: 'Inside an FB-400 floor', h1: 'Five layers.', h2: 'Prep is most of the job.', lede: 'Most epoxy floors that fail do so because of poor surface preparation. Scroll to take a Rhino floor apart.', tag: 'Rendered textures' },
    bento: {
      eyebrow: 'The difference you cannot see', h1: 'The preparation', h2: 'decides the result.',
      spill: { title: 'Spills wipe up', text: 'Tap to spill. Oil and chemical spills wipe up rather than soaking into the slab.' },
      gauge: { title: 'We test the slab first', text: 'Concrete holds moisture, and a floor that traps it will blister and lift. We assess moisture before coating.' },
      tyre: { title: 'Hot tyres, road salt', text: 'The two things that ruin cheap coatings. A properly specified system is chosen with both in mind.' },
      timelineTitle: () => 'Two to three days for a typical garage',
      steps: [['Stage 1', 'Diamond grind & repair'], ['Stage 2', 'Moisture test & primer'], ['Stage 3', 'High-build epoxy & flake'], ['Stage 4', 'UV-stable top coat'], ['After', 'Feet ~24h · cars ~72h']],
    },
    compare: { eyebrow: 'Before you compare quotes', h1: 'Not all floor coatings', h2: 'are the same thing.', short: ['Rhino', 'Paint', 'DIY kit'] },
    quote: { conditionLabel: 'Concrete now', conditions: [['good', 'Sound'], ['cracked', 'Cracked'], ['coated', 'Old coating']] },
    chat: { space: 'double', finish: 'flake', finishWord: 'full flake', ask: (town: string, m2: number) => `Hi, double garage near ${town}, about ${m2}m². Thinking full flake. Rough price?`, img: '/client/before-garage-800-v1.webp', photoTip: 'Wide shots plus any cracks or old coatings.' },
    gallery: {
      h1: 'Pick a blend.', h2: 'All photographed on site.', kind: 'finish',
      extra: [
        { name: 'Workshop', note: 'Commercial floor', img: '/client/workshop-800-v1.webp', alt: 'Workshop with a finished resin floor, installed by Rhino Coating', by: job },
        { name: 'Garage in daily use', note: 'Full flake', img: '/client/garage-in-use-800-v1.webp', alt: 'Garage with a full flake floor, tools on the wall, in daily use', by: job },
        { name: 'Car-lift garage', note: 'HB-200 solid', img: '/client/solid-white-lift-800-v1.webp', alt: 'Garage with a solid white high build epoxy floor under a car lift', by: job },
        { name: 'Finished garage', note: 'Grey flake', img: '/client/garage-finished-800-v1.webp', alt: 'Empty garage with a grey flake epoxy floor and the door open to the drive', by: job },
      ] as GalleryExtra[],
      beforeAfter: { before: '/client/before-garage-1600-v1.webp', after: '/client/after-garage-1600-v1.webp', beforeAlt: 'Timber-lined garage with a bare, dusty concrete floor', afterAlt: 'The same garage with a finished full flake epoxy floor', by: job },
    },
    finale: "Let's see your floor.",
    finaleSub: 'Free, no-obligation quote. Send a few details and we come back with a fixed quotation, a system recommendation and indicative availability.',
    finaleCta: 'Get my free quote',
  },
  offersUvStable: true, // "UV Stable Top Coats" on rhinocoating.co.uk
};
