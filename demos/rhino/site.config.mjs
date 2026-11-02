// Business facts and page content for the Rhino Coating demo.
// Every fact here is taken from rhinocoating.co.uk (see content-inventory.md).
// Prices for the estimator live in rates.config.mjs.
export default {
  // Canonicals point at the live domain so the demo never competes with it in search.
  siteUrl: 'https://www.rhinocoating.co.uk',
  demoUrl: 'https://clientgateway-rhino.vercel.app',
  noindex: true, // demo deploy: keep out of search engines. Set false at launch.

  biz: {
    name: 'Rhino Coating',
    legalName: 'Rhino Coating Ltd',
    companyNo: '16707536',
    founded: '2025',
    phone: '07822 032335',
    phoneIntl: '+447822032335',
    whatsapp: '447822032335',
    email: 'info@rhinocoating.co.uk',
    street: '99 Long Street, Office 1B',
    locality: 'Middleton',
    region: 'Manchester',
    postcode: 'M24 6UN',
    youtube: 'https://youtu.be/syFZ8ohX7jY',
    youtubeId: 'syFZ8ohX7jY',
    youtubeTitle: 'I Built My Friends DREAM GARAGE - He Had No Clue!',
    youtubeChannel: 'Josh Sanderson',
    instagram: 'https://www.instagram.com/rhino.coating/',
    replyTime: 'We aim to reply to all enquiries within one working day.',
  },

  // FCA-style wording, verbatim from rhinocoating.co.uk.
  financeWording: 'Finance subject to status. 12 months interest-free (0% APR representative). After 12 months, interest charged at 9% p.a. on the remaining balance. Finance is provided by a third-party lender. Rhino Coating Ltd acts as a credit broker, not a lender. Full terms available on request.',

  trust: [
    ['seal-check', '10-year warranty', 'Workmanship, written, subject to terms'],
    ['shield-check', 'Fully insured', 'Public liability'],
    ['certificate', 'City & Guilds', 'Trained and approved team'],
    ['percent', '0% finance', '12 months interest-free'],
  ],

  // Layer stack: from Rhino's own Instagram system graphic, bottom to top.
  layers: [
    { key: 'concrete', name: 'Concrete substrate', img: 'layer-concrete', benefit: 'Surveyed and moisture-tested first. Nothing is specified until we know the slab.' },
    { key: 'cracks', name: 'Crack repairs', img: 'layer-cracks', benefit: 'Cracks and hollow spots are opened out and filled, so the floor is not laid over a weakness.' },
    { key: 'ground', name: 'Diamond-ground surface', img: 'layer-ground', benefit: 'Grinding removes laitance and old coatings and opens the pores. This is what the resin grips.' },
    { key: 'dpm', name: 'Damp proof membrane', img: 'layer-dpm', benefit: 'Where the slab reads damp, a DPM stops moisture lifting the floor from beneath.' },
    { key: 'hb200', name: 'Rhino HB-200 base coat', img: 'layer-hb200', benefit: 'The high-build epoxy body. It carries jack stands, dropped tools and vehicle loads.' },
    { key: 'flake', name: 'Full flake broadcast', img: 'layer-flake', benefit: 'Broadcast by hand to refusal. Adds texture and grip, and hides dust and marks.' },
    { key: 'top', name: 'UV-stable top coat', img: null, benefit: 'Locks the flake in and stops the colour yellowing in daylight. It can be refreshed years later.' },
  ],

  systems: [
    {
      code: 'FB-400', name: 'Rhino FB-400', type: 'Full Flake Broadcast', featured: true,
      img: 'flake-closeup', imgAlt: 'Close-up of a grey, white and black FB-400 full flake garage floor installed by Rhino Coating',
      line: 'The finish most Rhino customers choose. A multi-colour flake broadcast to refusal, sealed under a clear UV-stable top coat.',
      points: ['Textured, slip-resistant feel', 'Hides dust, tyre marks and scuffs', 'Wide choice of colour blends'],
      suits: 'Working garages, home gyms, showrooms, workshops',
      finish: 'Speckled multi-colour flake',
      durability: 'Flake texture disguises everyday wear',
      where: 'Residential garages, new-build plots, showrooms',
    },
    {
      code: 'HB-200', name: 'Rhino HB-200', type: 'Solid High Build Epoxy',
      img: 'solid-floor-car-lift', imgAlt: 'Solid light grey HB-200 epoxy floor under a two-post car lift, installed by Rhino Coating',
      line: 'A solid, single-colour high build epoxy for a clean, seamless surface where a plain finish suits.',
      points: ['Seamless, easy to clean', 'Solid colour, no aggregate', 'Workshops and utility areas'],
      suits: 'Workshops, garages, utility areas, commercial units',
      finish: 'One solid colour, seamless',
      durability: 'Hard-wearing; shows dust more than flake does',
      where: 'Workshops, warehouses, plant rooms, garages',
    },
    {
      code: 'M-Flow', name: 'Rhino M-Flow', type: 'Marble Effect',
      img: 'render-mflow', imgAlt: 'Render of a grey and white marble-effect resin floor, illustrating the M-Flow finish', render: true,
      line: 'A decorative marble-effect resin finish where the floor is part of the presentation. Every pour is unique.',
      points: ['Bespoke pattern per installation', 'Statement finish', 'Best in lighter-traffic areas'],
      suits: 'Display garages, receptions, high-end showrooms',
      finish: 'Flowing marble pattern, unique per pour',
      durability: 'Best suited to lighter-traffic presentation areas',
      where: 'Showroom garages, receptions, client spaces',
    },
  ],

  // One consistent process (their site said both 4 and 6 stages).
  process: [
    ['Prep', 'Survey, moisture test and diamond grinding with dust extraction. The single most important step for adhesion.'],
    ['Repair & prime', 'Cracks and hollow spots repaired, then a moisture-tolerant primer, or a DPM where the slab reads damp.'],
    ['Base coat', 'The Rhino HB-200 high-build epoxy body coat, rolled to the specified thickness.'],
    ['Finish & topcoat', 'Flake broadcast, marble or solid finish, sealed under a UV-stable top coat.'],
  ],
  timings: [
    ['2 to 3 days', 'on site for a typical single garage'],
    ['About 24 hours', 'until light foot traffic'],
    ['72 hours', 'until you can park on it'],
  ],

  // Real Rhino photos only. "space" drives the gallery filter.
  gallery: [
    { img: 'double-garage-flake', space: 'garage', alt: 'Double garage with grey full flake epoxy floor and workbench, installed by Rhino Coating', cap: 'FB-400 full flake, double garage' },
    { img: 'blue-grey-flake', space: 'garage', alt: 'Blue and grey full flake epoxy garage floor with red edge detail', cap: 'FB-400 in a blue and grey blend' },
    { img: 'solid-floor-car-lift', space: 'garage', alt: 'Solid light grey epoxy floor under a car lift', cap: 'HB-200 solid, with a car lift' },
    { img: 'workshop-flake', space: 'commercial', alt: 'Commercial workshop unit with a flake epoxy floor and glazed doors', cap: 'Flake floor in a commercial unit' },
    { img: 'flake-garage-led', space: 'garage', alt: 'Garage with grey flake floor under LED lighting and wall-mounted tools', cap: 'Flake garage with LED lighting' },
    { img: 'solid-grey-long-garage', space: 'garage', alt: 'Long single garage with solid grey epoxy floor and white brick walls', cap: 'Single garage, solid grey' },
    { img: 'flake-garage-open-door', space: 'garage', alt: 'Full flake garage floor seen through an open garage door, Greater Manchester', cap: 'Full flake garage, Greater Manchester' },
    { img: 'before-bare-concrete', space: 'process', alt: 'Before: bare, dusty concrete garage floor ahead of preparation', cap: 'Before: bare concrete slab' },
    { img: 'flake-during-post', space: 'process', alt: 'Flake floor laid around a protected timber support post', cap: 'During: supports protected' },
    { img: 'moisture-testing', space: 'process', alt: 'Moisture meter on a concrete slab with readings logged on a phone', cap: 'Moisture testing before coating' },
    { img: 'crack-repair', space: 'process', alt: 'Installer in an orange glove repairing a joint in a concrete floor', cap: 'Crack and joint repair' },
    { img: 'flake-samples', space: 'process', alt: 'Hand holding flake and solid colour sample tiles', cap: 'Colour samples at survey' },
  ],

  faqs: [
    ['How long does epoxy flooring take to install?', 'A typical single residential garage takes two to three days from start to finish: diamond grinding, crack repairs, primer, an epoxy base coat, the decorative flake broadcast and a protective top coat, with curing time between each stage. Larger commercial or industrial floors take longer, and the programme is agreed before work starts.'],
    ['How long until the floor can be used?', 'Light foot traffic is typically safe after approximately 24 hours. Vehicle traffic can resume after 72 hours. Heavy equipment or point loading should only be introduced following guidance from our installation team. These times may vary depending on temperature and humidity.'],
    ['How is epoxy flooring priced?', 'Every floor is quoted individually rather than from a flat rate, because the honest figure depends on the system chosen, the area and the condition of the slab. Floors that need crack repair, levelling or moisture treatment need more preparation, which is reflected in the quotation. The estimator on this page gives an indicative range only; your fixed price follows a free survey.'],
    ['How long does epoxy flooring last?', 'A professionally installed epoxy floor can last 15 to 25 years or more with proper care. Every installation carries our 10-year workmanship warranty, subject to our published terms. Longevity depends on use, maintenance and conditions; industrial floors naturally see more wear than residential garages.'],
    ['What is the difference between epoxy and polyurethane?', 'Epoxy gives exceptional adhesion to concrete, high compressive strength and durability. Polyurethane offers greater UV stability and flexibility. Our systems combine both: epoxy base layers for strength and adhesion, with a UV-stable top coat for lasting protection.'],
    ['DIY vs professional installation: what is the difference?', 'DIY kits often fail within one to two years because of poor surface preparation, moisture or incorrect application. Professional installation includes diamond grinding, moisture testing, commercial-grade materials and a UV-stable top coat. Poor preparation is the number one cause of epoxy failure, and it is the step most kits skip.'],
    ['Will hot tyres lift the floor?', 'Hot tyre pickup, where a warm tyre pulls a coating off the floor, is a classic failure of thin, poorly bonded coatings. Our systems are diamond-ground and built up in layers, and the top coat is specified with hot tyres and road salt in mind. Tyre plasticiser can leave light staining on any resin floor; that is normal wear and is not covered by the warranty.'],
    ['What if my slab is damp?', 'Moisture is tested before any coating goes down. Depending on the readings, the answer is a moisture-tolerant primer or a dedicated damp proof membrane. If moisture is high, we explain the options rather than coat over a known risk.'],
    ['Is it slippery?', 'Full flake adds real texture and a slip-resistant feel. For wet areas, anti-slip additives can be added to the top coat. We will recommend the right level of grip at survey.'],
    ['Will it go yellow in the sun?', 'Unsealed epoxy ambers in daylight. Our systems finish with a clear UV-stable top coat, which protects the colour in garages with windows or glazed doors.'],
    ['How do I clean it?', 'Sweep and mop with a soft brush or microfibre mop. Wipe up oil, fuel and chemical spills promptly, and avoid abrasive cleaners or harsh solvents unless we recommend them. You get an aftercare guide at handover.'],
    ['Can you install over an existing painted or sealed floor?', 'In many cases, yes, but existing coatings usually need removing or mechanically preparing first so the new system bonds properly. We assess this during your survey.'],
  ],

  // Postcode coverage messages. Outward-code areas map to a friendly name.
  homePatch: {
    M20: 'Didsbury', M21: 'Chorlton', M22: 'Wythenshawe', M23: 'Baguley', M33: 'Sale', M24: 'Middleton', M25: 'Prestwich', M45: 'Whitefield',
    WA14: 'Altrincham', WA15: 'Hale', WA16: 'Knutsford', SK7: 'Bramhall', SK8: 'Cheadle', SK9: 'Wilmslow and Alderley Edge', SK10: 'Macclesfield', SK1: 'Stockport', SK2: 'Stockport', SK3: 'Stockport', SK4: 'Stockport',
  },
  areas: {
    M: 'Greater Manchester', SK: 'Stockport and Cheshire', WA: 'Warrington and Cheshire', CW: 'Cheshire', CH: 'Chester and the Wirral', OL: 'Oldham', BL: 'Bolton', WN: 'Wigan', PR: 'Lancashire', L: 'Liverpool and Merseyside',
    B: 'Birmingham', CV: 'Coventry', WV: 'Wolverhampton', WS: 'Walsall', DY: 'Dudley', LS: 'Leeds', BD: 'Bradford', HG: 'Harrogate', WF: 'Wakefield', YO: 'York', HD: 'Huddersfield', HX: 'Halifax',
    S: 'Sheffield and South Yorkshire', DN: 'Doncaster', NG: 'Nottingham', DE: 'Derby', LE: 'Leicester', BS: 'Bristol', BA: 'Bath', NE: 'Newcastle and the North East', SR: 'Sunderland', DH: 'Durham', G: 'Glasgow', PA: 'Paisley', ML: 'Lanarkshire', EH: 'Edinburgh', FK: 'Stirling',
    E: 'London', EC: 'London', N: 'London', NW: 'London', SE: 'London', SW: 'London', W: 'London', WC: 'London', KT: 'Surrey', GU: 'Guildford', AL: 'St Albans', TN: 'Kent',
  },
};
