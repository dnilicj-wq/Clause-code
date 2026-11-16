// Microcement & Venetian Surfaces: every fact here has a source line in content-inventory.md. Nothing invented.
export const site = {
  company: 'Microcement & Venetian Surfaces',
  phone: '07752 287314',
  phoneIntl: '447752287314',
  email: 'j@microcement-venetian.com',
  instagram: 'https://www.instagram.com/microcement_venetian/',
  google: 'https://www.google.com/maps/place/Microcement+%26+Venetian+surfaces/@51.3674977,-1.3120828,17z/data=!4m6!3m5!1s0x4876a7bb94a2e31d:0x55f60304ea2ed69f!8m2!3d51.3674977!4d-1.3120828!16s%2Fg%2F11vkrmq55y',
  hours: 'Mon–Fri 8:30am–5pm · Sat 9am–4pm',
  // TODO(Dan): Web3Forms access key for j@microcement-venetian.com (free at web3forms.com). Empty = WhatsApp only.
  formKey: '',
};

export const wa = (text: string) => `https://wa.me/${site.phoneIntl}?text=${encodeURIComponent(text)}`;
export const WA_HI = 'Hi James, I’ve just been looking at your website.';

// Word for word from his Google profile (5.0, 8 reviews). Only the capital J in Pearl's review is fixed.
export const reviews = [
  { who: 'Valerie Bray', text: 'James has been changing my normal bathroom into a high standard wet room. He works extremely hard, taking great care to create a great finish. He is punctual, very respectful and kind. I have been more than pleased with the amazing effort he has put in and would highly recommend him.' },
  { who: 'Susan Butcher', text: 'We had micro cement over existing tiles in a wet room. The workmanship was very professional and the floor looks amazing. Highly recommend.' },
  { who: 'Tom Fortune', text: 'James was absolutely brilliant. Punctual, tidy and good value. Did a great job and would certainly recommend.' },
  { who: 'Alex Gaffney', text: 'Jimmy did a fantastic job of our bathroom. Really impressed with the finish and Jimmy was very professional.' },
  { who: 'Emma Thornton', text: 'Absolutely beautiful finish using Rock Plaster. James really went above and beyond to make sure everything was perfect in each bathroom. He’s helped make our dream bathrooms become a reality.' },
  { who: 'Pearl Lorenz', text: 'James did a lovely job applying micro cement to my walls and floor' },
  { who: 'James Elwes', text: 'Lovely job. Thanks Jimmy' },
  { who: 'Cris Payne', text: 'Some beautiful and resilient work, finished to a high standard.' },
];

export type Shot = { src: string; w: number; h: number; alt: string; tag: string };
// His own job photos, from microcement-venetian.com.
export const gallery: Shot[] = [
  { src: 'wetroom-long', w: 1600, h: 2133, alt: 'Walk-in wet room with seamless pale walls and floor and a skylight', tag: 'Wet room' },
  { src: 'bath-finished', w: 1440, h: 1920, alt: 'Bathroom with an arched alcove, round backlit mirror and walk-in shower', tag: 'Microcement walls & floor' },
  { src: 'column-office', w: 1440, h: 1800, alt: 'Green Venetian plaster column in an open-plan office', tag: 'Venetian plaster' },
  { src: 'utility', w: 1440, h: 1920, alt: 'Utility room with a grey microcement worktop and sink', tag: 'Worktop' },
  { src: 'goring-canopy', w: 1600, h: 2133, alt: 'Pale external canopy running over brick pillars beside a lawn', tag: 'Outdoor' },
  { src: 'drainer', w: 1600, h: 2133, alt: 'Microcement worktop with drainer grooves cut beside the sink', tag: 'Worktop' },
  { src: 'columns-floor', w: 1440, h: 1800, alt: 'Office floor with a row of polished green columns', tag: 'Venetian plaster' },
  { src: 'goring-house', w: 1600, h: 1164, alt: 'House in Goring with a pale external finish around the ground floor', tag: 'Outdoor' },
  { src: 'bath-stage2', w: 1600, h: 2133, alt: 'Bathroom mid-job, with the first coats on the walls and floor', tag: 'Work in progress' },
];

export const faqs: { q: string; a: string }[] = [
  { q: 'Can it go over my tiles?', a: 'Often, yes. Susan had microcement laid straight over the existing tiles in her wet room, and on one kitchen James coated over the old tiles and wooden worktops. He’ll check yours are sound first.' },
  { q: 'Is it waterproof?', a: 'In his own words, microcement is “waterproof” and suited to wet areas, which is why so much of his work is wet rooms and bathrooms.' },
  { q: 'Can it go outside?', a: 'Yes. James laid 150 m² of Luna microcement outside on a house in Goring, near Reading.' },
  { q: 'Can you match my colour?', a: 'Microcement can be tinted. On one job James matched the walls and floor to Farrow & Ball Hammock No. 38.' },
  { q: 'Is there grout to clean?', a: 'No. It’s one seamless surface with no grout lines, so there’s nothing to scrub out of the joins.' },
  { q: 'How long does it take, and how much?', a: 'Every room’s different, so James will tell you after a quick look. Send a photo on WhatsApp to get started.' },
];
