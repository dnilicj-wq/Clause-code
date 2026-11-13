// Lime & Marble: every fact here has a source line in content-inventory.md. Nothing invented.
export const site = {
  company: 'Lime & Marble',
  legal: 'Lime & Marble Ltd',
  phone: '07535 969540',
  phoneIntl: '447535969540',
  email: 'info@limeandmarble.com',
  instagram: 'https://www.instagram.com/limeandmarble/',
  qube: 'https://qubefurniture.com/',
  episode: 'https://www.channel4.com/programmes/grand-designs/on-demand/68196-001',
  address: ['Unit 2, St James Industrial Estate', 'Westhampnett Road', 'Chichester, West Sussex', 'PO19 7JU'],
  maps: 'https://www.google.com/maps/search/?api=1&query=Unit+2+St+James+Industrial+Estate+Westhampnett+Road+Chichester+PO19+7JU',
  // TODO(Dan): Web3Forms access key for Craig's inbox (free at web3forms.com). Empty = WhatsApp only.
  formKey: '',
  // TODO(Dan): Craig's Google reviews link.
  googleReviews: '',
};

export const wa = (text: string) => `https://wa.me/${site.phoneIntl}?text=${encodeURIComponent(text)}`;

export type Shot = { src: string; w: number; h: number; alt: string; tag: string; page: 'Microcement' | 'Venetian plaster' | 'Home page' | 'Showroom' };
// Their own project photos, from limeandmarble.com. Tag = the page each photo appears on.
export const gallery: Shot[] = [
  { src: 'kitchen-floor', w: 1600, h: 1200, alt: 'Open kitchen with a seamless pale microcement floor', tag: 'Kitchen floor', page: 'Microcement' },
  { src: 'spiral-stair', w: 1600, h: 1600, alt: 'Spiral staircase rising from a seamless floor', tag: 'Floor & stair', page: 'Home page' },
  { src: 'round-bathroom', w: 1200, h: 1174, alt: 'Curved bathroom finished wall to floor', tag: 'Bathroom', page: 'Microcement' },
  { src: 'stair-wall', w: 1544, h: 2058, alt: 'Sculpted white stair wall', tag: 'Walls', page: 'Venetian plaster' },
  { src: 'living-floor', w: 1508, h: 2010, alt: 'Curved living room with a continuous floor under timber ceiling', tag: 'Living floor', page: 'Microcement' },
  { src: 'vanity-walls', w: 1048, h: 2214, alt: 'Bathroom vanity with polished walls and a backlit mirror', tag: 'Bathroom walls', page: 'Venetian plaster' },
  { src: 'fireplace', w: 1600, h: 1200, alt: 'Fireplace wall and log store in a seamless finish', tag: 'Fireplace', page: 'Microcement' },
  { src: 'shower', w: 1441, h: 1921, alt: 'Walk-in shower with seamless walls and floor', tag: 'Shower', page: 'Microcement' },
  { src: 'lounge-corner', w: 1525, h: 2033, alt: 'Lounge corner with soft plaster walls', tag: 'Walls', page: 'Venetian plaster' },
  { src: 'curved-kitchen', w: 1200, h: 1672, alt: 'Curved kitchen with a continuous floor', tag: 'Kitchen', page: 'Home page' },
  { src: 'wc-walls', w: 1600, h: 2483, alt: 'Cloakroom with seamless walls', tag: 'Cloakroom', page: 'Microcement' },
  { src: 'bedroom-wall', w: 1600, h: 2151, alt: 'Bedroom feature wall in a soft polished finish', tag: 'Bedroom wall', page: 'Home page' },
];

export const team = [
  { key: 'craig', name: 'Craig Robbins', role: 'Company Director & Master applicator', img: 'team-craig' },
  { key: 'daniel', name: 'Daniel Jones', role: 'Microcement applicator', img: 'team-daniel' },
  { key: 'owen', name: 'Owen Ruddock', role: 'Apprentice applicator', img: 'team-owen' },
  { key: 'laura', name: 'Laura Robbins', role: 'Admin & social media', img: 'team-laura' },
];

// Word for word from limeandmarble.com (home page). No star ratings shown: none published.
export const reviews = [
  {
    who: 'Mr Southwell',
    text: '“Craig and team did a phenomenal job with our living space and bathroom floors. The attention to detail and level of craft was exceptional. The floor is a piece of art! We’d highly recommend Craig and team, the whole process has been smooth and professional, and he was happy to flex around the inevitable moving goal posts of self-building. We’re very proud of our new floor.”',
  },
  {
    who: 'Mr Agnoli',
    text: '“We engaged Craig to install microcement floors throughout the ground floor of our property and to install microcement floors and walls in our bathrooms. Craig is friendly, professional and highly diligent. From quote to installation communication was fantastic and we couldn’t be happier with the finished work! Craig provided us with a clear timeline and stuck to it keeping us updated with pictures as he went through each stage. We only wish we had found him sooner! We would highly recommend Craig to anyone looking for a beautiful bespoke, high quality finish.”',
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: 'Can it go over my existing tiles?',
    a: 'Usually, yes. Microcement can be applied over existing surfaces, so there’s no ripping out old tiles first. Craig will check yours on the visit.',
  },
  {
    q: 'Is it waterproof?',
    a: 'We install Forcrete, a decorative microcement system that Forcrete describes as “100% waterproof before sealers”, with low-VOC, solvent-free resins. That’s why it suits showers, bathrooms and kitchens.',
  },
  {
    q: 'Indoors and outdoors?',
    a: 'Both. Inside: floors, walls, worktops, splashbacks and furniture. Outside: patios, pool surrounds and terraces.',
  },
  {
    q: 'What’s the difference between microcement and Venetian plaster?',
    a: 'Microcement is a thin, seamless coating of cement, fine aggregates, resins and pigments for floors, walls and worktops. Venetian plaster is slaked lime and marble dust, polished to look like marble or natural stone. Pop into the showroom and touch both.',
  },
  {
    q: 'How do I keep it clean?',
    a: 'Microcement has no grout lines to trap dirt, so a sweep or a mop does it. Venetian plaster just needs mild soap and water.',
  },
  {
    q: 'Can I see it before I decide?',
    a: 'Please do. The showroom in Chichester is open by appointment, Monday to Friday, 8am to 3pm. If that’s too far, ask for a video tour.',
  },
  {
    q: 'How long does it take?',
    a: 'Every job’s different, so Craig will tell you on the visit.',
  },
];
