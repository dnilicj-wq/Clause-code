// Resinize: garage floors only. Copied from the epoxy pack, trimmed to garages. No prices, guarantees or job counts (none published).
import { epoxy, type TradePack, type Finish } from './epoxy';

const finishes: Finish[] = [
  { key: 'graphite-flake', name: 'Graphite flake', type: 'flake', base: '#2B2C2E', metal: '#BFC3C7', note: 'Dark and hard-working. Hides dust and tyre marks.', img: '/demo/look-graphite-flake-v3.webp', photo: true },
  { key: 'greywhite-flake', name: 'Grey/white flake', type: 'flake', base: '#9A9C9E', metal: '#F2F2F0', note: 'Light and bright. Makes a garage feel bigger.', img: '/demo/look-greywhite-flake-v1.webp' },
  { key: 'storm-solid', name: 'Solid grey', type: 'solid', base: '#6D7175', metal: '#9EA3A8', note: 'Clean, plain and practical. A workshop favourite.', img: '/demo/look-storm-solid-v2.webp' },
  { key: 'copper-metallic', name: 'Metallic', type: 'metallic', base: '#140D09', metal: '#C98A57', note: 'A one-off swirl. For the garage you show people.', img: '/demo/look-copper-metallic-v3.webp', photo: true },
];

export const resinize: TradePack = {
  ...epoxy,
  key: 'resinize',
  noun: 'garage floor',
  hero: {
    eyebrow: 'Garage floor specialists',
    lines: ['Epoxy garage', 'floors in Essex.'],
    sub: 'Seamless, hard-wearing garage floors that shrug off oil, salt and hot tyres, and sweep clean in seconds.',
    hint: { mouse: 'Move to pour', touch: 'Swipe to pour' },
  },
  rooms: ['Single garages', 'Double garages', 'Garage gyms', 'Workshops'],
  services: ['Single garages', 'Double garages', 'Flake finishes', 'Solid colour', 'Metallic finishes', 'Diamond grinding', 'Crack repair', 'Garage gyms', 'Workshops', 'Free quotes'],
  finishes,
  faq: [
    { q: 'How long before I can use the garage again?', a: 'It depends on the system and the temperature on the day. We tell you when you can walk on it and when the car can go back in before we start, so you can plan around it.' },
    { q: 'Will hot tyres lift it?', a: 'Hot-tyre pickup happens when a coating is thin or poorly bonded. Grinding the slab first and building the coating up properly is what stops it, and we explain the system we use when we quote.' },
    { q: 'My garage floor is cracked, painted or stained. Is that a problem?', a: 'Usually not. Old paint is ground off, cracks are filled and oil stains are dealt with before anything goes down. If something needs extra prep, we tell you at the survey.' },
    { q: 'Is it slippery?', a: 'A gloss floor can be slippery when wet, so grip can be added to the top coat. You choose how much.' },
    { q: 'How do I get a price?', a: 'Fill in the quick form below or send a WhatsApp with a photo of your floor. We come out, look at the slab and give you a clear written quote. It is free.' },
  ],
  copy: {
    ...epoxy.copy,
    expand: { ...epoxy.copy.expand!, title: 'Your garage, finished.' },
    photoBreak: null,
    gallery: { ...epoxy.copy.gallery, extra: [] },
    finale: 'Ready for a garage you actually like?',
    finaleSub: 'Tell us the size and the floor you have now. We will come and look, then give you a clear written quote.',
    finaleCta: 'Get a free quote',
  },
};
