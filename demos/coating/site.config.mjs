// ─────────────────────────────────────────────────────────────
//  ONE FILE TO TAILOR THIS DEMO TO A PROSPECT.
//  Fill a token and it is baked into every page on `npm run build`.
//  Leave it null and the page shows the {Token} as a highlighted slot.
//
//  Quick previews without a rebuild: any token can be set from the URL,
//  e.g.  /?company=Summit%20Coatings&town=Boise&phone=(208)%20555-0147
//  Estimator capture mode for testing: ?capture=before  or  ?capture=after
// ─────────────────────────────────────────────────────────────
export default {
  siteUrl: 'https://clientgateway-coating-demo.vercel.app',
  country: 'US',
  locale: 'en-US',
  currency: 'USD',
  service: 'Garage floor coating',
  schemaType: 'HomeAndConstructionBusiness',

  tokens: {
    Company: null,         // e.g. "Summit Floor Coatings"
    Town: null,            // e.g. "Boise"
    Phone: null,           // e.g. "(208) 555-0147"  (PhoneTel is derived)
    Email: null,
    Street: null,
    Postcode: null,        // ZIP
    Owner: null,           // e.g. "Marcus Reyes"
    YearFounded: null,
    Years: null,
    OwnerStory: null,      // e.g. "he got tired of fixing floors other crews rushed"
    Rating: null,
    ReviewCount: null,
    WarrantyLength: null,  // e.g. "Lifetime" or "15-year"
    CureTime: null,        // e.g. "24 hours"
    FlakePrice: null,      // e.g. "$5.50"  (per sq ft, starting)
    MetallicPrice: null,
    SolidPrice: null,
    License: null,         // contractor license number
  },

  lists: {
    pairs: [
      { before: '/img/before-1.webp', after: '/img/after-1.webp', town: null, space: '2-car garage', finish: null, quote: null },
      { before: '/img/before-2.webp', after: '/img/after-2.webp', town: null, space: 'Basement', finish: null, quote: null },
      { before: '/img/before-3.webp', after: '/img/after-3.webp', town: null, space: '3-car garage', finish: null, quote: null },
    ],
    reviews: [
      { name: null, town: null, rating: null, date: null, text: null },
      { name: null, town: null, rating: null, date: null, text: null },
      { name: null, town: null, rating: null, date: null, text: null },
    ],
    team: [
      { name: null, role: null },
      { name: null, role: null },
      { name: null, role: null },
    ],
  },

  areas: ['Boise', 'Meridian', 'Nampa', 'Eagle', 'Kuna'],

  // Where forms post (JSON). Leave empty to simulate success in the demo.
  formEndpoint: '',

  // 'after' = show the price, then ask for details. 'before' = ask first.
  estimatorCapture: 'after',

  // ── Estimator pricing (PLACEHOLDERS: the owner supplies real numbers) ──
  pricingIsPlaceholder: true,
  estimator: {
    spaces: {
      one: { label: '1-car garage', sqft: 264 },
      two: { label: '2-car garage', sqft: 484 },
      three: { label: '3-car garage', sqft: 790 },
      driveway: { label: 'Driveway', sqft: 600 },
      patio: { label: 'Patio', sqft: 300 },
      basement: { label: 'Basement', sqft: 800 },
    },
    perSqft: {               // [low, high] $ per sq ft, all-in
      flake: [5.5, 7.5],
      metallic: [8.5, 11.5],
      solid: [5.0, 6.75],
    },
    condition: { good: 0, cracks: 0.75, coated: 1.5 }, // $ per sq ft added
    minimumJob: 1500,
  },

  analytics: { beaconEndpoint: '' },
};
