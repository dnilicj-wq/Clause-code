// AGD Venetian Plastering. Every fact here has a source line in content-inventory.md. Nothing invented.
// TODO(Dan): owner name (reviews say "Ant" / "Antony"; not confirmed). Until then, the site only says "AGD Venetian Plastering".
// TODO(Dan): areas covered. No town or area is named anywhere on purpose.
export const site = {
  company: 'AGD Venetian Plastering',
  short: 'AGD',
  phone: '07546 402673',
  phoneIntl: '447546402673',
  instagram: 'https://www.instagram.com/agd_venetian_plastering/',
  google: 'https://www.google.com/maps/search/AGD+Venetian+Plastering',
  rating: '5.0',
  reviewCount: 6,
  // TODO(Dan): Web3Forms access key for AGD's inbox. Empty = WhatsApp only.
  formKey: '',
};

export const wa = (text: string) => `https://wa.me/${site.phoneIntl}?text=${encodeURIComponent(text)}`;

// Google reviews, word for word (only spacing fixed). Source: Google Maps listing, read 2026-11-23.
// Google shows 6 reviews; only these 5 are visible without signing in. TODO(Dan): paste the 6th if it has text.
export const reviews = [
  { name: 'Dan Luesley', when: '8 months ago', text: 'I recently had Venetian plaster done and couldn’t be happier with the final result. The attention to detail is impeccable, and the overall look and finish exceeded my expectations.\n\nAntony was very professional, reliable, and clearly takes great pride in his work. Highly recommend!' },
  { name: 'Ryan Higgleton', when: '8 months ago', text: 'I honestly couldn’t be happier with the work carried out. From start to finish, the service was exceptional. He arrived exactly when he said he would, was incredibly punctual, polite, and professional throughout.\n\nThe quality of the Venetian plastering is absolutely outstanding, the finish is flawless and truly transformed the space. The level of craftsmanship and attention to detail is clear to see, it’s real artistry. He took great care in preparation, kept everything tidy and clearly takes huge pride in his work.\n\nIt’s rare to find someone who combines skill, reliability and professionalism to this level. If you’re looking for a Venetian plasterer who delivers a premium finish and an stress-free experience, I wouldn’t hesitate to recommend him.\n\nAn absolute 10/10.' },
  { name: 'Danielle Rasor (DanniR)', when: '8 months ago', text: 'Ant has done a couple of plastering producers for me and I’m thrilled with the results. Great creative eye and really brings my visions to life and the work is done to a high standard. Would highly recommend.' },
  { name: 'Jinesh Patel', when: '8 months ago', text: 'Ant did a fantastic job on our media wall, taking on our ideas and making us aware of the full context of the possibilities. His attention to detail is great and he is easy to work with.' },
  { name: 'Sam Downing', when: '8 months ago', text: 'Did kitchen feature walk for me a few years back. Really happy with results' },
];

// Short phrases lifted word for word from the reviews above.
export const pulls = [
  { q: 'The attention to detail is impeccable', who: 'Dan Luesley' },
  { q: 'He arrived exactly when he said he would', who: 'Ryan Higgleton' },
  { q: 'Great creative eye', who: 'Danielle Rasor' },
];

export type Cat = 'Bathrooms' | 'Feature walls' | 'Kitchens' | 'Stairs & halls';
export type Shot = { id: string; w: number; h: number; alt: string; cat: Cat; src: 'Instagram' | 'Google' };
// His own photos: Instagram @agd_venetian_plastering posts (shortcode = id) and 1 from his Google listing.
const ig = (id: string, w: number, h: number, cat: Cat, alt: string): Shot => ({ id, w, h, cat, alt, src: 'Instagram' });
export const shots: Shot[] = [
  ig('CTMulAKozgi', 900, 900, 'Feature walls', 'Dark polished plaster wall with two filament pendant lights'),
  ig('C3zpS13oBQA', 900, 1125, 'Kitchens', 'Kitchen walls in a dark blue-grey polished plaster'),
  ig('CI1NiYOn3JA', 900, 900, 'Bathrooms', 'Charcoal bathroom walls behind a freestanding bath'),
  ig('C3v3ucIIWMS', 900, 1125, 'Stairs & halls', 'Staircase wall in a warm metallic plaster'),
  ig('CNcxIhVHKqV', 900, 900, 'Feature walls', 'Close-up of a grey polished plaster wall with cloudy movement'),
  ig('C315n0IoGDp', 900, 1125, 'Bathrooms', 'Soft grey bathroom walls with a lit niche'),
  ig('C40Ke-JoQct', 900, 1125, 'Feature walls', 'Long rust-toned feature wall in a commercial space'),
  ig('CNcznh-HP50', 790, 610, 'Feature walls', 'Gold metallic feature wall behind a TV unit'),
  ig('C37lOlvogx1', 900, 1125, 'Bathrooms', 'Shower enclosure with seamless grey walls'),
  ig('C32-kmiomVD', 900, 1125, 'Feature walls', 'Bronze media wall with built-in shelving'),
  ig('Cc57XqkoXAB', 900, 900, 'Kitchens', 'Kitchen with a grey polished island'),
  ig('CTMsFWPI3XD', 900, 900, 'Feature walls', 'Close-up of a raised lace-pattern plaster finish'),
  ig('C7Z7coGIOdV', 900, 1125, 'Bathrooms', 'Bathroom with pale plaster walls and a roll-top bath'),
  ig('CYBuGVcIGd7', 900, 669, 'Feature walls', 'Marble-effect feature wall behind a TV'),
  ig('CNGKgHpnQJq', 900, 900, 'Bathrooms', 'Walk-in shower with pale seamless walls and niches'),
  ig('C3v3WZVI90p', 900, 1125, 'Kitchens', 'Kitchen island in a white marble-effect finish'),
  ig('CKCfE3wHx1z', 900, 675, 'Feature walls', 'Living room with a soft gold feature wall'),
  ig('CTZJWBGoo8v', 900, 900, 'Bathrooms', 'Shower walls in a white marble-effect plaster'),
  ig('CR0jeE7BBb1', 900, 900, 'Feature walls', 'Marble-effect chimney breast with a TV and fire'),
  ig('CPWO-LbH2AZ', 900, 1091, 'Bathrooms', 'Shower with grey walls under an oak beam'),
  ig('CNCwvNlnzok', 900, 899, 'Feature walls', 'Pale grey plaster wall with a coat rail'),
  ig('CNk7f4LHrlz', 900, 900, 'Bathrooms', 'Shower with soft white walls and a built-in seat'),
  ig('CfHwCgsIrLC', 900, 1125, 'Feature walls', 'Dining room with a grey polished plaster wall'),
  ig('CUqTJs7otbZ', 900, 900, 'Bathrooms', 'Walk-in shower with pale walls and a towel rail'),
  ig('C3w3F5potZH', 900, 900, 'Feature walls', 'Living room with a dark plaster feature wall'),
  ig('CPvkxAuhaDu', 900, 900, 'Bathrooms', 'Bathroom with an arched ceiling and pale walls'),
  ig('CWT_EjUI08T', 900, 1125, 'Bathrooms', 'Grey bathroom with a white vanity and round mirror'),
  ig('CNImbcTHfim', 900, 900, 'Bathrooms', 'Shower with white walls and a green stone floor'),
  ig('Ccn4usZojgb', 900, 1125, 'Bathrooms', 'Cloakroom with soft green-grey walls'),
  ig('CcJKeOnIJpC', 900, 599, 'Bathrooms', 'Bright bathroom with pale plaster walls'),
  ig('C7Z7GJWoHkq', 900, 1125, 'Bathrooms', 'Cloakroom with grey walls and a small basin'),
  ig('C35yuC1oQz5', 900, 1125, 'Feature walls', 'Dark plaster wall with a gold logo worked into it'),
  { id: 'google-1', w: 900, h: 1200, cat: 'Stairs & halls', alt: 'Hallway wall in a white and silver polished plaster', src: 'Google' },
];

export const img = (s: Shot, small = false) => `/client/${s.src === 'Google' ? s.id : `ig-${s.id}`}${small ? '-s' : ''}-v1.webp`;

// Quote planner options. No prices anywhere.
export const ROOMS = ['Living room', 'Bathroom or shower', 'Kitchen', 'Hallway or stairs', 'Bedroom', 'Restaurant, bar or hotel', 'Something else'];
export const FINISHES = ['Soft polished', 'High polish', 'Stone or textured look', 'Metallic', 'Not sure yet'];
export const SIZES = ['One feature wall', 'A whole room', 'A few rooms', 'Commercial space'];
