// ─────────────────────────────────────────────────────────────
//  ONE FILE TO TAILOR THIS DEMO TO A PROSPECT.
//  Change the business details below (and `areas` further down), run `npm run build`, deploy.
//  Reviews, jobs and team can use {Company}, {Town}, {Owner}, {OwnerFirst}.
//  Every page, title, meta tag, schema block and form updates from here.
//
//  The defaults are a believable FICTIONAL business ("Summit Coatings")
//  so the demo never shows a blank or a {Token}. The build fails if any
//  token used on a page is left empty.
//
//  Quick preview without a rebuild:
//    /?company=Ridgeline%20Floors&town=Meridian&phone=(208)%20555-0199
// ─────────────────────────────────────────────────────────────
export default {
  siteUrl: 'https://clientgateway-coating.vercel.app',
  country: 'US',
  locale: 'en-US',
  currency: 'USD',
  service: 'Garage floor coating',
  schemaType: 'HomeAndConstructionBusiness',
  priceRange: '$$',
  openingHours: ['Mo-Fr 07:00-19:00', 'Sa 08:00-16:00'],

  // Logo (path in src/img, e.g. '/img/logo.svg') and brand color (any CSS color).
  // Leave null to use the built-in mark and blue accent.
  brand: { logo: null, accent: null },

  tokens: {
    Company: 'Summit Coatings',
    Town: 'Boise',
    State: 'ID',
    Phone: '(208) 555-0147',
    TextNumber: '(208) 555-0147',   // number that accepts texts (often a cell)
    Email: 'hello@summit-coatings.com',
    Street: '2150 W Main St',
    Postcode: '83702',             // ZIP
    Owner: 'Marcus Reyes',
    YearFounded: '2015',
    Years: '11',
    OwnerStory: 'too many local garage floors were peeling within a year of a rushed one-coat job',
    Rating: '4.9',
    ReviewCount: '236',
    WarrantyLength: 'Lifetime',
    CureTime: '24 hours',
    License: 'RCE-51234',
    ResponseTime: '5 minutes',
    Hours: 'Mon to Fri 7am to 7pm, Sat 8am to 4pm',
    FloorsDone: '1,900',
  },

  seo: {
    MetaTitle: 'Garage Floor Coating in {Town}, {State} | {Company}',
    MetaDescription: 'Polyaspartic garage floor and driveway coatings in {Town}, {State}. Diamond-ground prep, one-day install, {WarrantyLength} warranty. See your price instantly. {Rating}★ from {ReviewCount} Google reviews.',
  },

  lists: {
    pairs: [
      { before: '/img/before-1.webp', after: '/img/after-1.webp', town: 'Meridian', space: '2-car garage', finish: 'Graphite flake', quote: 'Done in a day. We parked on it the next evening and it still looks brand new.' },
      { before: '/img/before-2.webp', after: '/img/after-2.webp', town: 'Eagle', space: 'Basement', finish: 'Pewter metallic', quote: 'Our basement gym finally feels like part of the house.' },
      { before: '/img/before-3.webp', after: '/img/after-3.webp', town: '{Town}', space: '3-car garage', finish: 'Tidal flake', quote: 'They ground out an old peeling kit nobody else wanted to touch.' },
    ],
    drives: [
      { before: '/img/drive-before.webp', after: '/img/drive-after.webp', town: 'Nampa', space: 'Driveway', finish: 'Sandstone flake with grit', quote: 'Looks brand new, and it isn\'t slick when it rains.' },
    ],
    reviews: [
      { name: 'Jessica Halvorsen', town: 'Meridian', rating: '5', date: '2 weeks ago', text: 'Got three quotes. {Company} wasn\'t the cheapest, but they were the only ones who moisture-tested the slab and explained why. {OwnerFirst}\'s crew ground, patched and coated in one day. Six months of hot tires and snowmelt and not a mark.' },
      { name: 'Dave Kowalski', town: '{Town}', rating: '5', date: '1 month ago', text: 'Saw the price online before anyone came out, and the final quote was right in that range. No upsell, no surprises.' },
      { name: 'Priya & Sam Nolan', town: 'Eagle', rating: '5', date: '3 months ago', text: 'Our old DIY epoxy was peeling everywhere. They ground the whole thing off and the new floor looks like a showroom. Texted them a question on a Saturday and had an answer in minutes.' },
    ],
    team: [
      { name: '{Owner}', role: 'Owner, on every estimate' },
      { name: 'Luis Ortega', role: 'Crew lead, 9 years coating floors' },
      { name: 'Hannah Pierce', role: 'Scheduling & aftercare' },
    ],
  },

  // Service-area pages generated at /areas/<town>/ (the home town is always included).
  // Swap these for the prospect's real neighboring towns.
  areas: ['Boise', 'Meridian', 'Nampa', 'Eagle', 'Kuna'],

  // Where forms post (JSON). Empty = simulated success for the demo.
  formEndpoint: '',

  // "Now booking <month> installs": today + this many days.
  leadTimeDays: 21,

  // Example finance figure shown as "From $X/month".
  finance: { apr: 9.99, months: 60 },

  // ── Estimator pricing ($ per sq ft, all-in) ──
  estimator: {
    spaces: {
      one: { label: '1-car garage', sqft: 264 },
      two: { label: '2-car garage', sqft: 484 },
      three: { label: '3-car garage', sqft: 790 },
      driveway: { label: 'Driveway', sqft: 600 },
      patio: { label: 'Patio', sqft: 300 },
      basement: { label: 'Basement', sqft: 800 },
    },
    perSqft: {               // [low, high]
      flake: [5, 9],         // 2-car (484 sq ft) ≈ $2,420–$4,360
      metallic: [8, 12],
      solid: [4.5, 7],
    },
    condition: { good: 0, cracks: 0.75, coated: 1.5 }, // $ per sq ft added
    minimumJob: 1800,
  },

  analytics: { beaconEndpoint: '' },
};
