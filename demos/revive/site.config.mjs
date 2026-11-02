// ─────────────────────────────────────────────────────────────
//  ONE FILE TO TAILOR THIS DEMO TO A PROSPECT.
//  Change the business details below (and `areas` further down), run `npm run build`, deploy.
//  Reviews and jobs can use {Company}, {Town}.
//  Every page, title, meta tag, schema block and form updates from here.
//
//  The build fails if any token used on a page is left empty.
// ─────────────────────────────────────────────────────────────
export default {
  // Prospect demo: Revive Coatings LLC, Boise / Nampa ID
  // (revivecoatingsllc.com, instagram.com/revive.epoxycoatingsllc).
  // Confirmed from their site: name, logo, phone (call or text), Boise + Nampa,
  // services (flake, metallic, solid, polyaspartic, patio/outdoor, commercial),
  // "We don't paint floors", licensed / insured / locally owned,
  // 5+ years industrial-grade coating experience, starting at $4/sq ft,
  // warranty against peeling or coating failure, 3 job photos (after-1/2/3).
  // DEMO content to swap once they reply: reviews, rating, review count, hours, owner story.
  siteUrl: 'https://clientgateway-revive.vercel.app',
  noindex: true,             // prospect demo: keep out of search engines
  country: 'US',
  locale: 'en-US',
  currency: 'USD',
  service: 'Epoxy & polyaspartic floor coating',
  schemaType: 'HomeAndConstructionBusiness',
  priceRange: '$$',
  openingHours: ['Mo-Sa 08:00-18:00'],

  brand: { logo: '/img/logo.webp', accent: null },

  tokens: {
    Company: 'Revive Coatings',
    Town: 'Boise',
    State: 'ID',
    Phone: '(208) 247-1781',
    TextNumber: '(208) 247-1781',
    Email: '',                       // unknown: schema only
    Street: '',                      // unknown
    Postcode: '83702',
    Owner: '',                       // unknown: copy is written without an owner name
    Years: '5+',
    OwnerStory: 'too many Treasure Valley floors were peeling within a year of a rushed, painted-on coating',
    Rating: '5.0',                   // demo
    ReviewCount: '27',               // demo
    WarrantyLength: 'No-peel',
    CureTime: '48 hours',
    License: '',
    ResponseTime: '15 minutes',
    Hours: 'Mon to Sat 8am to 6pm',  // demo
  },

  seo: {
    MetaTitle: 'Epoxy & Metallic Garage Floors in {Town} & Nampa, {State} | {Company}',
    MetaDescription: 'Flake, metallic and polyaspartic floor coatings in {Town}, Nampa and the Treasure Valley. Diamond-ground prep, written no-peel warranty. Floors from {SolidPrice}/sq ft. See your price instantly.',
  },

  lists: {
    pairs: [
      { before: '/img/before-1.webp', after: '/img/after-1.webp', town: '{Town}', space: 'Garage', finish: 'Crimson metallic', quote: 'Red, black and pearl, poured right there in the garage. Nobody believes it\'s concrete underneath.' },
      { before: '/img/before-2.webp', after: '/img/after-2.webp', town: 'Meridian', space: 'Garage', finish: 'Pearl & smoke metallic', quote: 'It looks like marble. Everyone who comes over asks who did it.' },
      { before: '/img/before-3.webp', after: '/img/after-3.webp', town: 'Nampa', space: 'Shop garage', finish: 'Black & white flake', quote: 'Old floor was stained and cracked. Now it looks like a showroom and wipes clean.' },
    ],
    drives: [
      { before: '/img/drive-before.webp', after: '/img/drive-after.webp', town: 'Eagle', space: 'Garage apron', finish: 'Graphite flake with grit', quote: 'Clean line right to the edge, and it isn\'t slick when it rains.' },
    ],
    reviews: [
      { name: 'Jessica H.', town: 'Meridian', rating: '5', date: '2 weeks ago', text: 'Got three quotes. {Company} wasn\'t the cheapest, but they were the only ones who moisture-tested the slab and explained why. The metallic floor came out better than the pictures.' },
      { name: 'Dave K.', town: '{Town}', rating: '5', date: '1 month ago', text: 'Saw the price online before anyone came out, and the final quote was right in that range. No upsell, no surprises.' },
      { name: 'Priya N.', town: 'Nampa', rating: '5', date: '3 months ago', text: 'Our old DIY epoxy was peeling everywhere. They ground the whole thing off and the new flake floor looks like a showroom. Texted them a question on a Saturday and had an answer in minutes.' },
    ],
    team: [],
  },

  // Service-area pages generated at /areas/<town>/ (the home town is always included).
  areas: ['Boise', 'Nampa', 'Meridian', 'Eagle', 'Caldwell', 'Kuna', 'Star'],

  formEndpoint: '',
  leadTimeDays: 21,
  finance: { apr: 9.99, months: 60 },

  // ── Estimator pricing ($ per sq ft, all-in). Their site: "starting at $4/sq ft". ──
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
      flake: [5, 8],         // 2-car (484 sq ft) ≈ $2,420–$3,870
      metallic: [8, 12],
      solid: [4, 6.5],
    },
    condition: { good: 0, cracks: 0.75, coated: 1.5 }, // $ per sq ft added
    minimumJob: 1500,
  },

  analytics: { beaconEndpoint: '' },
};
