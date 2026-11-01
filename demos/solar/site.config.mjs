// ─────────────────────────────────────────────────────────────
//  ONE FILE TO TAILOR THIS DEMO TO A PROSPECT.
//  Change the business details below (and `areas` further down), run `npm run build`, deploy.
//  Reviews, jobs and team can use {Company}, {Town}, {Owner}, {OwnerFirst}.
//  Every page, title, meta tag, schema block and form updates from here.
//
//  The defaults are a believable FICTIONAL business ("Brightside Solar")
//  so the demo never shows a blank or a {Token}. The build fails if any
//  token used on a page is left empty.
//
//  Quick preview without a rebuild:
//    /?company=Northlight%20Solar&town=Leeds&phone=0113%20496%200123
// ─────────────────────────────────────────────────────────────
export default {
  siteUrl: 'https://clientgateway-solar.vercel.app',
  country: 'GB',
  locale: 'en-GB',
  currency: 'GBP',
  service: 'Solar panel installation',
  schemaType: 'HomeAndConstructionBusiness',
  priceRange: '££',
  openingHours: ['Mo-Fr 08:00-18:00', 'Sa 09:00-13:00'],

  // Logo (path in src/img, e.g. '/img/logo.svg') and brand colour (any CSS colour).
  // Leave null to use the built-in mark and amber accent.
  brand: { logo: null, accent: null },

  tokens: {
    Company: 'Brightside Solar',
    Town: 'Harrogate',
    County: 'North Yorkshire',
    Phone: '0113 496 0482',
    Email: 'hello@brightside-solar.co.uk',
    Street: '14 Station Parade',
    Postcode: 'HG1 1UF',
    Owner: 'Sam Whitaker',
    OwnerRole: 'Founder',
    YearFounded: '2014',
    Years: '12',
    OwnerStory: 'eight years as an electrician fixing systems that door-to-door firms had mis-sold to local families',
    Rating: '4.9',
    ReviewCount: '187',
    MaxDeposit: '25%',
    InstallDays: '1 to 2',
    PanelWarranty: '25 years',
    InverterWarranty: '12 years',
    BatteryWarranty: '10 years',
    WorkmanshipWarranty: '10 years',
    MCSNumber: 'NAP-58210',
    RECCNumber: '00061947',
    ResponseTime: '5 minutes',
    Hours: 'Mon to Fri 8am to 6pm, Sat 9am to 1pm',
    InstallsDone: '1,400',
  },

  // Meta title + description. Tokens are filled in at build.
  seo: {
    MetaTitle: 'Solar Panels & Batteries in {Town} | {Company}',
    MetaDescription: 'MCS-certified solar panel and battery installer in {Town}, {County}. See an honest price range in 60 seconds, never more than {MaxDeposit} deposit, {Rating}★ from {ReviewCount} Google reviews.',
  },

  lists: {
    jobs: [
      { img: '/img/job-1.webp', town: 'Knaresborough', size: '4.35', battery: '5 kWh battery', quote: '{OwnerFirst} talked us out of the bigger system. Bills are down by about half.' },
      { img: '/img/job-2.webp', town: '{Town}', size: '5.22', battery: 'Panels only', quote: 'Scaffold up Monday, switched on Tuesday afternoon. Tidy the whole way through.' },
      { img: '/img/job-3.webp', town: 'Ripon', size: '3.48', battery: '9.5 kWh battery', quote: 'The figures on the quote are almost exactly what we got in year one.' },
      { img: '/img/job-4.webp', town: 'Wetherby', size: '6.09', battery: 'Battery added later', quote: 'They came back two years on to add a battery. Same team, same price they quoted.' },
    ],
    reviews: [
      { name: 'Helen Marsh', town: 'Knaresborough', rating: '5', date: '3 weeks ago', text: 'Three companies came round. {Company} were the only ones who didn\'t push a battery or ask me to sign that night. Their quote wasn\'t the cheapest, but it listed every panel and the savings were cautious. Six months in, we\'re ahead of their figures.' },
      { name: 'David Okafor', town: '{Town}', rating: '5', date: '2 months ago', text: 'Sent them a quote I\'d had from a national firm. {OwnerFirst} rang back within ten minutes and told me honestly it was a fair price, just with a cheaper inverter. We went with {Company} anyway because of the aftercare.' },
      { name: 'Claire & Tom Pickering', town: 'Ripon', rating: '5', date: '4 months ago', text: 'Survey, quote and install all done by the same two lads. They protected the garden, cleared up every scrap and showed us the app before they left. Deposit was small and nothing else was due until it was working.' },
    ],
    team: [
      { name: '{Owner}', role: 'Founder, does every survey' },
      { name: 'Priya Desai', role: 'Lead installer, NICEIC electrician' },
      { name: 'Josh Kerr', role: 'Installer & aftercare' },
    ],
  },

  // Warranty bar lengths in years (visual only).
  warrantyYears: { panels: 25, inverter: 12, battery: 10, workmanship: 10 },

  // Service-area pages generated at /areas/<town>/ (the home town is always included).
  // Swap these for the prospect's real neighbouring towns.
  areas: ['Harrogate', 'Knaresborough', 'Ripon', 'Wetherby', 'York'],

  // Where forms post (JSON). Empty = simulated success for the demo.
  // Works with a GHL / Zapier / Make inbound webhook.
  formEndpoint: '',

  deadline: { date: '2027-03-31' },

  // ── Estimator assumptions (conservative UK figures) ──
  estimator: {
    unitRate: 0.27,            // £/kWh import price
    exportRate: 0.12,          // £/kWh export (SEG), kept cautious
    panelWatts: 435,
    minPanels: 8,
    maxPanels: 16,
    sizeToUsage: 0.7,          // size the array to ~70% of annual use
    yieldPerKwp: { south: 900, eastwest: 760, unsure: 800 }, // kWh/kWp/yr, cautious for the north
    selfUse: { panels: 0.4, battery: 0.75 },                 // share of generation used at home
    costPerKwp: { low: 1550, high: 1900 },                   // £ installed (4.35 kWp ≈ £6,750–£8,250)
    batteryCost: { low: 3000, high: 5000 },
    savingsBand: [0.85, 1.05], // range around the central savings figure
  },

  analytics: {
    // Every action is pushed to window.dataLayer (GTM / GA4) and, if present,
    // gtag() and fbq(). Add an endpoint to also beacon events.
    beaconEndpoint: '',
  },
};
