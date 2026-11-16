// RESINOVA: every fact here has a source line in content-inventory.md. Nothing invented.
export const site = {
  company: 'RESINOVA',
  // TODO(Dan): confirm 07854 270816 is OK to show as the business number (it's the WhatsApp he messaged from).
  // TODO(Dan): digits are hidden on the page until the owner OKs showing this number; links still use it.
  phone: '07854 270816',
  phoneIntl: '447854270816',
  instagram: 'https://www.instagram.com/resinovauk/',
  handle: '@resinovauk',
  // TODO(Dan): Web3Forms access key for his inbox (free at web3forms.com). Empty = WhatsApp only.
  formKey: '',
};

export const wa = (text: string) => `https://wa.me/${site.phoneIntl}?text=${encodeURIComponent(text)}`;
export const WA_HI = 'Hi RESINOVA, I’ve just been looking at your website.';

// Hidden until real Google reviews exist. Paste them word for word: { who, text, source: 'Google' }.
export const reviews: { who: string; text: string; source: string }[] = [];

export type SpaceId = 'kitchen' | 'living' | 'garage' | 'bathroom' | 'wall' | 'driveway';
export type FinishId = 'metallic' | 'solid' | 'flake' | 'micro' | 'venetian' | 'bound';
export type ToneId = 'carrara' | 'onyx' | 'ocean' | 'smoke' | 'champagne';

// Finish names come from his services flyer (Instagram, May 2026).
export const SPACES: { id: SpaceId; label: string; img: string; fins: FinishId[] }[] = [
  { id: 'kitchen', label: 'Kitchen worktop', img: 'space-kitchen', fins: ['metallic', 'solid', 'micro'] },
  { id: 'living', label: 'Living floor', img: 'space-living', fins: ['metallic', 'solid', 'micro'] },
  { id: 'garage', label: 'Garage', img: 'space-garage', fins: ['flake', 'solid', 'metallic'] },
  { id: 'bathroom', label: 'Bathroom', img: 'space-bathroom', fins: ['micro', 'metallic', 'venetian'] },
  { id: 'wall', label: 'Feature wall', img: 'space-wall', fins: ['venetian', 'micro', 'metallic'] },
  { id: 'driveway', label: 'Driveway', img: 'space-driveway', fins: ['bound'] },
];
export const FINISHES: { id: FinishId; label: string; note: string }[] = [
  { id: 'metallic', label: 'Metallic marble', note: 'Metallic epoxy, poured so the pigment flows into veins.' },
  { id: 'solid', label: 'Solid gloss', note: 'One colour, poured flat to a deep gloss.' },
  { id: 'flake', label: 'Flake', note: 'Colour flakes sealed under a clear coat.' },
  { id: 'micro', label: 'Microcement', note: 'Hand-trowelled, seamless and soft to the eye.' },
  { id: 'venetian', label: 'Venetian plaster', note: 'Layered and burnished by hand.' },
  { id: 'bound', label: 'Resin bound', note: 'Natural stone, bound in clear resin.' },
];
export const TONES: { id: ToneId; label: string; sw: string }[] = [
  { id: 'carrara', label: 'Carrara white', sw: 'linear-gradient(135deg,#f4f2ee,#cfcac2 60%,#a9a49c)' },
  { id: 'onyx', label: 'Onyx & gold', sw: 'linear-gradient(135deg,#0d0d0e 35%,#b8955a 50%,#0d0d0e 65%)' },
  { id: 'ocean', label: 'Ocean blue', sw: 'linear-gradient(135deg,#0b2c55,#1f6fb4 55%,#8fd0e6)' },
  { id: 'smoke', label: 'Smoke grey', sw: 'linear-gradient(135deg,#3b3d40,#8a8c8f 55%,#c9cacb)' },
  { id: 'champagne', label: 'Champagne', sw: 'linear-gradient(135deg,#f1e6cf,#cdb27c 55%,#9c7f4a)' },
];

export type Spec = { space: string; finish: string; tone: string };

export const faqs: { q: string; a: string }[] = [
  { q: 'Is resin waterproof?', a: 'Poured resin and microcement finishes are seamless, so there are no grout lines or joins for water to get into. That’s why they suit bathrooms and kitchens.' },
  { q: 'Can it go over my existing floor?', a: 'Usually, yes. It depends on what’s there now and its condition, so we check it before we quote.' },
  { q: 'Is it slippery?', a: 'Anti-slip finishes are available, and we’ll suggest one for bathrooms, garages and anywhere that gets wet.' },
  { q: 'Can you match a colour?', a: 'Every design is bespoke. Send us a photo or a sample of the colour you’re after and we’ll work from that.' },
  { q: 'How do I clean it?', a: 'With no grout lines, day-to-day it’s a soft mop or cloth and a mild cleaner. We’ll talk you through aftercare for your finish.' },
  { q: 'How much does it cost?', a: 'Every design is bespoke, so we quote after a quick look at the space. Send a photo on WhatsApp to get started.' },
];
