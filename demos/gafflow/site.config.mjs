// Gafflow Resin Finishes: every fact on the site comes from gafflowresinfinishes.com
// (crawled 2 Nov 2026, see content-inventory.md). Nothing here is invented.
// Estimator rates live in rates.config.mjs and are PLACEHOLDERS for Gafflow to set.
export default {
  siteUrl: 'https://clientgateway-gafflow.vercel.app',
  noindex: true, // prospect demo: keep out of search engines until launch

  biz: {
    name: 'Gafflow Resin Finishes',
    legalName: 'Gafflow Resin Systems Ltd',
    companyNo: '15986799',
    street: 'Unit 12 Birch Industrial Estate',
    locality: 'Eastbourne',
    region: 'East Sussex',
    postcode: 'BN23 6PH',
    londonCentre: 'Unit 4, 232 Selsdon Road, South Croydon, CR2 6PL',
    phone: '07552 036785',
    phoneIntl: '+447552036785',
    whatsapp: '447552036785',
    email: 'yo@gafflowresinfinishes.com',
    replyTime: 'Leave us a message and we will be back to you really soon.',
    social: {
      instagram: 'https://www.instagram.com/gafflowresinfinishes/',
      facebook: 'https://www.facebook.com/gafflow',
      tiktok: 'https://www.tiktok.com/@resinfloorexpert',
      youtube: 'https://www.youtube.com/@Gafflowresinfinishes',
    },
    store: 'https://gafflowresinfinishes.com', // live WooCommerce store: product "Buy" buttons hand off here in the demo
  },

  // Trust strip: each line is a claim made on the live site.
  trust: [
    ['trophy', 'Award winners', 'National Flooring Awards 2025'],
    ['flask', 'Our own product range', 'Primer to top coat'],
    ['chalkboard-teacher', 'We train the trade', 'Trainers who still install'],
    ['shield-check', 'Fully insured', 'UK-based team'],
    ['globe-hemisphere-west', 'UK, Europe and beyond', 'We travel for the right job'],
  ],

  // The Gafflow Metallic Epoxy System, in the order the live site says to apply it.
  layers: [
    { key: 'concrete', name: 'Prepared substrate', benefit: 'Mechanically prepared by diamond grinding or shot blasting to an open texture. Inadequate preparation leads to loss of adhesion.', product: null },
    { key: 'primer', name: 'The DPM Primer Coat', benefit: 'Two-component epoxy primer that slows water vapour through the slab, so the floor can go onto concrete with up to 98% relative humidity.', product: 'the-dpm-primer-coat' },
    { key: 'base', name: 'The Big Base', benefit: '100% solids epoxy base coat with excellent build-up and levelling, formulated for the Gafflow Metallic Epoxy System.', product: 'the-big-base-15kg' },
    { key: 'design', name: 'The Money Coat + metallic pigment', benefit: 'Clear, UV-resistant epoxy where the design happens: swirling, marbling and layering Gafflow metallic pigments.', product: 'the-money-coat' },
    { key: 'seal', name: 'Matt PU or G2000 seal', benefit: 'A non-yellowing matt PU, or a G2000 gloss that resists chemicals, abrasion, UV and graffiti.', product: 'the-matt-pu' },
  ],

  // Metallic powder pigments sold in the shop. Hex values approximate the tub photos.
  metallics: [
    ['gafflow-pink', 'Gafflow Pink', '#e46fc6'], ['fuchsia-pink', 'Fuchsia Pink', '#d4307f'], ['hot-pink', 'Hot Pink', '#ff3d9a'], ['bubblegum-pink', 'Bubblegum Pink', '#f6a3cb'],
    ['royal-purple-300g', 'Royal Purple', '#8e6ad6'], ['punchy-purple', 'Punchy Purple', '#8a2bd6'], ['ruby-red', 'Ruby Red', '#b0132f'], ['poppy-red', 'Poppy Red', '#e5372c'],
    ['pumpkin-orange', 'Pumpkin Orange', '#ef7a1c'], ['sunflower-yellow', 'Sunflower Yellow', '#f2c21a'], ['lime-green', 'Lime Green', '#9ccf36'], ['apple-green', 'Apple Green', '#36b54a'],
    ['sage-pearl-green', 'Sage Pearl Green', '#9fb398'], ['tiff-blue', 'Tiff Blue', '#78d3cb'], ['frozen-blue', 'Frozen Blue', '#bfe1f0'], ['arctic-blue', 'Arctic Blue', '#8cc4ec'],
    ['blush-blue', 'Blush Blue', '#a8c2e6'], ['pacific-blue', 'Pacific Blue', '#2470d0'], ['electric-blue', 'Electric Blue', '#1f48ff'], ['denim-blue', 'Denim Blue', '#3c5d8c'],
  ],
  bases: [
    ['the-super-black-epoxy-pigment', 'Super-Black', '#0c0b0e'],
    ['the-super-white-epoxy-pigment', 'Super-White', '#f4f3f1'],
    ['light-ivory-epoxy-pigment-500g-or-1kg', 'Light Ivory (RAL 1005)', '#e9dcc0'],
    ['cream-epoxy-pigment-500g-or-1kg', 'Cream (RAL 9001)', '#efe7d6'],
  ],

  // Finishes Gafflow installs (live site: "Marble Effects, Flake Systems, Metallics, Single Colours", PU comfort, resin bound).
  finishes: [
    { code: 'metallic', name: 'Metallic epoxy', line: 'Swirled, marbled and layered metallic pigment in a clear Money Coat. No two floors are the same.', img: 'pink-bar-lounge', alt: 'Pink and red metallic epoxy floor in a bar lounge with pink seating', where: 'Homes, bars, salons, showrooms' },
    { code: 'marble', name: 'Marble effect', line: 'White, ivory and grey veining that reads as stone, without the grout lines or the cold.', img: 'hotel-marble', alt: 'Marble effect resin floor installed across a hotel event space', where: 'Hallways, kitchens, hotels' },
    { code: 'flake', name: 'Flake and single colour', line: 'Hard-wearing flake systems and solid colours for garages, workshops and working floors.', img: 'grey-marble', alt: 'Grey resin floor with subtle marble movement', where: 'Garages, warehouses, workshops' },
    { code: 'pu', name: 'PU comfort flooring', line: 'The Arturo polyurethane system: softer underfoot, acoustic options, and it copes with movement and underfloor heating.', img: 'pu-mistral', alt: 'Arturo PU comfort floor in a warm neutral living space (manufacturer image)', where: 'Hospitals, schools, offices, homes', maker: true },
    { code: 'bound', name: 'Resin bound driveways', line: 'Aggregate mixed into resin for a smooth, permeable, weed-resistant drive. SuDS compliant, never overlaid on old tarmac.', img: 'drive-large', alt: 'Large resin bound driveway in front of a detached house', where: 'Driveways, paths, patios, terraces' },
  ],

  // Gallery: every photo is from gafflowresinfinishes.com. Captions follow the site's own alt text.
  gallery: [
    ['pink-bar-floor', 'commercial', 'Cerise metallic floor, bar and lounge'],
    ['entrance-black-white', 'residential', 'Black and white entrance hall'],
    ['nightclub', 'commercial', 'Gloss black with colour swirls, nightclub'],
    ['bathroom-black-gold', 'residential', 'Black and gold swirled bathroom floor'],
    ['restaurant-blue', 'commercial', 'Bright blue swirl, restaurant bar'],
    ['kitchen-ivory', 'residential', 'Ivory and beige swirl, open-plan kitchen'],
    ['drive-large', 'outdoor', 'Resin bound driveway'],
    ['cocktail-bar', 'commercial', 'Pink and gold, cocktail bar'],
    ['hallway-white', 'residential', 'White with grey veining, hallway'],
    ['river-floor', 'commercial', 'Blue and turquoise resin river, cream floor'],
    ['wall-art', 'bespoke', 'Large framed resin wall art'],
    ['bathroom-copper', 'residential', 'Copper resin walls and floor, shower'],
    ['hotel-marble', 'commercial', 'Marble effect, hotel'],
    ['living-neutral', 'residential', 'Cream resin floor, lounge and dining'],
    ['drive-gold', 'outdoor', 'All gold resin driveway'],
    ['salon-pink', 'commercial', 'Metallic and pink, salon'],
    ['restaurant-orange', 'commercial', 'Bright blue floor, restaurant'],
    ['worktop-copper', 'bespoke', 'Metallic resin worktop'],
    ['living-white', 'residential', 'White marble effect living room'],
    ['terrace-grey', 'outdoor', 'Grey resin roof terrace'],
    ['wardrobe-doors', 'bespoke', 'Resin wardrobe doors'],
    ['garden-bar', 'commercial', 'Garden bar floor'],
    ['kitchen-open', 'residential', 'Finished resin kitchen'],
    ['drive-butterscotch', 'outdoor', 'Butterscotch resin driveway'],
    ['feature-wall', 'bespoke', 'Silver feature wall surround'],
    ['cloakroom', 'residential', 'White resin cloakroom floor'],
    ['art-silver', 'bespoke', 'Resin art panel, silver and blue'],
    ['patio-gold', 'outdoor', 'Gold resin patio with planting'],
  ],

  // From gafflowresinfinishes.com/testimonials and /courses. Wording unchanged; long ones shortened at a sentence end, emoji removed.
  testimonials: [
    { name: 'Joe Knowles', what: '2 Day Resin Floor Course', text: 'Lou and his team are very professional and very clued up in this industry. I have been to previous courses where all they seem to want to do is sell you their products, these guys showed us many designs and also had us design our own boards which we got the take home so we actually had a feel how everything works.' },
    { name: 'Rebecca Hill', what: 'Resin products', date: "Nov '24", text: 'Amazing products at reasonable prices! Easy to work with, outstanding results. Beginner or expert these products are for you. Lou has been absolutely amazing and answered any questions I’ve had within seconds, day or night!' },
    { name: 'Scott Stanfield', what: 'Resin Training Course', text: 'The 2 day Resin course was a learning experience from every aspect from preparation to the final product. Lou and Harry hold back no secrets on what they have learnt over the years, I’ve walked away with knowledge on how the product works and can’t wait to start my own projects.' },
    { name: 'Nicky', what: 'Resin course', date: "Jan '26", text: 'After many years away from the paint effects industry, I recently completed a course to refresh my resin skills. I am delighted to share that I gained invaluable insights and updated information relevant to this field. I highly recommend this course to anyone looking to enhance their expertise.' },
    { name: 'Josh Hayward', what: '2 Day Resin Floor Course', text: 'I’ve just spent two fantastic days with the boys from Gafflow. The course was highly enjoyable and I’ve learnt a huge amount as the training given was first class! Would highly recommend this course as it’s brilliant value for money!' },
    { name: 'M Bird', what: 'Resin course', text: 'The Gafflow team really looked after us for 2 days, made us feel very welcome and shared their expert knowledge of the epoxy resin flooring process, it was amazing to see how it all works and actually have a go ourselves.' },
    { name: 'Ben Thomas', what: 'Resin course', date: "Nov '25", text: 'Brilliant course, straight forward and extremely helpful. If you get stuck or unsure Lou will go through it with you and help you understand better. Would 100% recommend' },
    { name: 'Sam Hazel', what: '2 Day Resin Floor Course', text: 'Very friendly team made me very welcome. Bought lunch for us all, explained everything more than once as there was a few things I couldn’t understand but Lou and Kay both made sure everyone understood before they moved on they took time with us all.' },
    { name: 'Tom Mason', what: 'Resin Floor Course', text: 'Found the course on Gafflow resin finishes TikTok page, I would recommend this course to anyone the possibilities are pretty much endless and the guys teaching the course are top notch really friendly.' },
    { name: 'Ben Donovan', what: 'Resin Training Course', text: 'Amazing course, so helpful about problem solving due to his experience and knowledge about epoxy resin. I highly recommend gafflow and look forward to what the future holds in this industry' },
    { name: 'Michaela Greeley', what: '2 Day Resin Course', text: 'Just spent two days with the Gafflow Team. Really enjoyed the course and the training given was 5 stars. Learnt so much and highly recommend this course.' },
    { name: 'A J Resin Woodcraft', what: 'Resin course', text: 'Real great team of lads, very welcoming and full of knowledge in the resin game, willing to help as much as they can and get you where you need to be!' },
  ],

  // Courses as listed on the live site (2 Nov 2026).
  courses: [
    { slug: 'intensive-resin-training-london', name: '3-day intensive, London', price: 995, start: '2026-11-18', dates: '18, 19 and 20 November 2026', where: 'New London Training Centre, South Croydon (5 miles off J6 of the M25)', img: 'poster-london', points: ['Floors, worktops, splashbacks and industrial coatings', 'Run with Resin Kings: residential and commercial', 'All materials, lunch each day, certificate of completion', 'Small groups, maximum hands-on time'], flag: 'First course at the new London centre' },
    { slug: 'epoxy-flooring-course-eastbourne', name: '2-day intensive, Eastbourne', price: 795, start: '2026-11-26', dates: '26 and 27 November 2026', where: 'Unit 12 Birch Industrial Estate, Eastbourne', img: 'poster-eastbourne', points: ['The full floor process, preparation to finish', 'Make your own sample board to take home', 'Free digital Resin Bible with every booking', 'Lunch included, easy parking'] },
  ],
  coursesOther: [
    ['5-day 1-to-1 training', '£3,500', 'The most advanced course: one to one with industry professionals, a full installation from preparation to finish, theory, special effects and marketing advice.'],
    ['On-site masterclass', 'POA', 'Every so often the team runs an on-site masterclass. Ask to be added to the list.'],
    ['Flooring showroom training', 'Bespoke', 'For flooring businesses: train your staff by installing a new resin floor in your own showroom, with trade discount on products.'],
    ['Resin craft workshops', 'Register interest', 'Three-hour workshops making coasters and a charcuterie board with Gafflow craft kits.'],
  ],

  // Install FAQs: from gafflowresinfinishes.com/installations (answers lightly trimmed, meaning unchanged).
  faqs: [
    ['How much does resin flooring cost?', 'It depends on floor size, preparation work, design and the resin system being installed. Use the estimator for an indicative range. The accurate figure comes from a site survey and consultation.'],
    ['How long do resin floors last?', 'A professionally installed resin floor can last 10 to 20 years or more depending on the system used, traffic levels and maintenance. High-quality products and expert installation play a major role in longevity.'],
    ['Can resin go over my existing floor?', 'In many cases, yes. Resin can often be installed over concrete, tiles and other suitable substrates, but the existing floor must be assessed to make sure it is structurally sound and properly prepared first.'],
    ['How long does installation take?', 'Most residential resin floors are completed within a few days, depending on the size of the area and the condition of the existing surface. Larger commercial projects can take longer because of preparation and curing times.'],
    ['Are resin floors slippery?', 'Resin can be installed with anti-slip finishes for extra grip. We recommend the right finish for the space, whether it is a home, commercial premises or an industrial workspace.'],
    ['Are resin floors suitable for homes and businesses?', 'Yes. Resin is used in homes, garages, kitchens, bathrooms, warehouses, restaurants, salons, showrooms and industrial environments. It is durable, seamless and easy to maintain.'],
    ['Why use experienced installers?', 'A resin floor is only as good as the preparation beneath it. Experienced installers understand moisture, substrate preparation, product compatibility and technique, which prevents bubbling, cracking, peeling and premature wear. Done badly, it can cost a considerable amount to fix.'],
    ['Do you install across the UK?', 'Yes. Gafflow installs residential and commercial floors throughout the UK and regularly takes on projects further afield.'],
    ['What makes Gafflow different?', 'We are installers, trainers and product makers. Every floor benefits from the people who formulated the products and teach the trade how to lay them.'],
  ],

  team: [['lou', 'Lou'], ['harry', 'Harry'], ['ollie', 'Ollie']],
};
