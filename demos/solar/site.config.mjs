// ─────────────────────────────────────────────────────────────
//  ONE FILE TO TAILOR THIS DEMO TO A PROSPECT.
//  Fill a token and it is baked into every page on `npm run build`.
//  Leave it null and the page shows the {Token} as a highlighted slot.
//
//  Quick previews without a rebuild: any token can be set from the URL,
//  e.g.  /?company=Brightroof%20Solar&town=Harrogate&phone=01423%20555%20019
//  Estimator capture mode for testing: ?capture=before  or  ?capture=after
// ─────────────────────────────────────────────────────────────
export default {
  siteUrl: 'https://clientgateway-solar-demo.vercel.app',
  country: 'GB',
  locale: 'en-GB',
  currency: 'GBP',
  service: 'Solar panel installation',
  schemaType: 'HomeAndConstructionBusiness',

  tokens: {
    Company: null,          // e.g. "Brightroof Solar"
    Town: null,             // e.g. "Harrogate"
    Phone: null,            // e.g. "01423 555 019"  (PhoneTel is derived)
    Email: null,
    Street: null,
    Postcode: null,
    Owner: null,            // e.g. "Sam Whitaker"
    OwnerRole: null,
    YearFounded: null,
    Years: null,
    OwnerStory: null,       // e.g. "ten years as an electrician watching neighbours get mis-sold"
    Rating: null,           // e.g. "4.9"
    ReviewCount: null,      // e.g. "212"
    DepositTerms: null,     // e.g. "nothing until the scaffold is up, then 25%"
    InstallDays: null,      // e.g. "1 to 2"
    PanelWarranty: null,    // e.g. "25 years"
    InverterWarranty: null, // e.g. "12 years"
    WorkmanshipWarranty: null, // e.g. "10 years"
    MCSNumber: null,
    RECCNumber: null,
  },

  // Repeating content. Leave a field null to show a labelled slot.
  lists: {
    jobs: [
      { img: '/img/job-1.webp', town: null, size: null, battery: null, quote: null },
      { img: '/img/job-2.webp', town: null, size: null, battery: null, quote: null },
      { img: '/img/job-3.webp', town: null, size: null, battery: null, quote: null },
      { img: '/img/job-4.webp', town: null, size: null, battery: null, quote: null },
    ],
    reviews: [
      { name: null, town: null, rating: null, date: null, text: null },
      { name: null, town: null, rating: null, date: null, text: null },
      { name: null, town: null, rating: null, date: null, text: null },
    ],
    team: [
      { name: null, role: null, photo: null },
      { name: null, role: null, photo: null },
      { name: null, role: null, photo: null },
    ],
  },

  // Warranty bar lengths in years (visual only). Replace with the business's real terms.
  warrantyYears: { panels: 25, inverter: 12, workmanship: 10 },

  // Service-area pages generated at /areas/<town>/
  areas: ['Harrogate', 'Knaresborough', 'Ripon', 'Wetherby', 'York'],

  // Where forms post (JSON). Leave empty to simulate success in the demo.
  // Works with a GHL / Zapier / Make inbound webhook.
  formEndpoint: '',

  // 'after' = show the figure, then ask for details. 'before' = ask first.
  estimatorCapture: 'after',

  // VAT deadline banner
  deadline: { date: '2027-03-31', label: '0% VAT on solar panels ends 31 March 2027' },

  // ── Estimator assumptions (PLACEHOLDERS: the owner supplies real ranges) ──
  pricingIsPlaceholder: true,
  estimator: {
    unitRate: 0.27,            // £/kWh import price
    exportRate: 0.12,          // £/kWh export (SEG) price, kept cautious
    panelWatts: 435,
    minPanels: 6,
    maxPanels: 16,
    yieldPerKwp: { south: 900, eastwest: 760, unsure: 800 }, // kWh/kWp/yr, cautious
    selfUse: { no: 0.35, maybe: 0.35, yes: 0.7 },            // share of generation used at home
    costPerKwp: { low: 1150, high: 1550 },                    // £ installed
    batteryCost: { low: 2800, high: 4200 },
    cautionFactor: 0.9,        // trims savings by 10% so the figure errs low
  },

  analytics: {
    // Every enquiry action is pushed to window.dataLayer (GTM / GA4) and,
    // if present, gtag() and fbq(). Add an endpoint to also beacon events.
    beaconEndpoint: '',
  },
};
