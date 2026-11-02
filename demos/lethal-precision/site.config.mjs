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
//    /?company=Lethal%20Precision&town=Hervey%20Bay&phone=0491%20570%20156
// ─────────────────────────────────────────────────────────────
export default {
  // Prospect demo: Lethal Precision, Hervey Bay QLD (facebook.com/profile.php?id=61553341318128).
  // Confirmed: name, logo, town, tagline "Calculated. Crafted. Complete.", services
  // (metallic flooring, epoxy, concrete coatings). Everything else is demo content
  // to swap once they reply: owner, phone, street, reviews, team, numbers.
  siteUrl: 'https://clientgateway-lethal-precision.vercel.app',
  noindex: true,             // prospect demo: keep out of search engines
  country: 'AU',
  locale: 'en-AU',
  currency: 'AUD',
  service: 'Epoxy & metallic flooring',
  schemaType: 'HomeAndConstructionBusiness',
  priceRange: '$$',
  openingHours: ['Mo-Fr 07:00-17:00', 'Sa 07:00-12:00'],

  brand: { logo: '/img/logo.png', accent: null },

  tokens: {
    Company: 'Lethal Precision',
    Town: 'Hervey Bay',
    State: 'QLD',
    Phone: '0491 570 156',           // ACMA fictional range: swap for the real number
    TextNumber: '0491 570 156',
    Email: '',                       // unknown: add the real address (schema only)
    Street: '',                      // unknown: home-based trade, leave blank
    Postcode: '4655',
    Owner: 'Jake Mitchell',          // demo name: swap for the real owner
    YearFounded: '2023',
    Years: '3',
    OwnerStory: 'too many Fraser Coast floors were peeling within a year of a rushed, cheap coating',
    Rating: '5.0',
    ReviewCount: '41',
    WarrantyLength: '10-year',
    CureTime: '48 hours',
    License: '',
    ResponseTime: '15 minutes',
    Hours: 'Mon to Fri 7am to 5pm, Sat 7am to 12pm',
    FloorsDone: '180',
  },

  seo: {
    MetaTitle: 'Metallic Epoxy & Garage Floors in {Town}, {State} | {Company}',
    MetaDescription: 'Metallic epoxy, flake and concrete coatings in {Town} and the Fraser Coast. Diamond-ground prep, {WarrantyLength} written warranty. See your price instantly. {Rating}★ from {ReviewCount} Google reviews.',
  },

  lists: {
    pairs: [
      { before: '/img/before-2.webp', after: '/img/after-2.webp', town: 'Urangan', space: 'Living area', finish: 'Midnight metallic', quote: 'Deep blue, like looking into water. It\'s the first thing anyone mentions when they walk in.' },
      { before: '/img/before-1.webp', after: '/img/after-1.webp', town: 'Point Vernon', space: 'Double garage', finish: 'Graphite flake', quote: 'Old floor was stained and cracked. Now it looks like a showroom and wipes clean.' },
      { before: '/img/before-3.webp', after: '/img/after-3.webp', town: '{Town}', space: 'Triple garage', finish: 'Tidal flake', quote: 'They ground out an old peeling DIY job nobody else wanted to touch.' },
    ],
    drives: [
      { before: '/img/drive-before.webp', after: '/img/drive-after.webp', town: 'Torquay', space: 'Driveway', finish: 'Sandstone flake with grit', quote: 'Looks brand new, and it isn\'t slippery when the storms come through.' },
    ],
    reviews: [
      { name: 'Kylie Henderson', town: 'Urangan', rating: '5', date: '2 weeks ago', text: 'Got three quotes. {Company} weren\'t the cheapest, but they were the only ones who moisture-tested the slab and explained why. The metallic floor in our living area is unreal. {OwnerFirst} was meticulous from start to finish.' },
      { name: 'Dean Walsh', town: '{Town}', rating: '5', date: '1 month ago', text: 'Saw the price online before anyone came out, and the final quote was right in that range. No upsell, no surprises.' },
      { name: 'Bec & Tom Nguyen', town: 'Maryborough', rating: '5', date: '3 months ago', text: 'Our old DIY epoxy was peeling everywhere. They ground the whole thing off and the new floor looks like a showroom. Messaged them a question on a Saturday and had an answer within the hour.' },
    ],
    team: [
      { name: '{Owner}', role: 'Owner, on every quote and every pour' },
      { name: 'Ryan Cooper', role: 'Lead applicator' },
      { name: 'Sophie Mitchell', role: 'Bookings & aftercare' },
    ],
  },

  // Service-area pages generated at /areas/<town>/ (the home town is always included).
  areas: ['Hervey Bay', 'Maryborough', 'Urangan', 'Torquay', 'Point Vernon', 'Burrum Heads'],

  formEndpoint: '',
  leadTimeDays: 21,
  finance: { apr: 9.99, months: 60 },

  // ── Estimator pricing (AUD per m², all-in; field names say sqft for template compatibility) ──
  estimator: {
    spaces: {
      one: { label: 'Single garage', sqft: 18 },
      two: { label: 'Double garage', sqft: 36 },
      three: { label: 'Triple garage', sqft: 54 },
      driveway: { label: 'Driveway', sqft: 50 },
      patio: { label: 'Patio / alfresco', sqft: 25 },
      basement: { label: 'Interior', sqft: 60 },
    },
    perSqft: {               // [low, high] $/m²
      flake: [65, 95],       // double garage (36 m²) ≈ $2,340–$3,420
      metallic: [100, 150],
      solid: [55, 80],
    },
    condition: { good: 0, cracks: 10, coated: 18 }, // $ per m² added
    minimumJob: 1500,
  },

  analytics: { beaconEndpoint: '' },
};
