// ============================================================================
//  NEWPAVE SITE CONFIG: the one file to edit for prices, numbers and switches.
// ============================================================================

export const SITE = {
  name: 'Newpave Ltd',
  owner: 'Charles Quinn',
  // Primary CTA number everywhere (mobile, also WhatsApp)
  phone: { display: '07787 707154', tel: '+447787707154' },
  landline: { display: '01952 950167', tel: '+441952950167' },
  freephone: { display: '0800 933 0769', tel: '+448009330769' },
  whatsapp: '447787707154',
  email: 'newpavelimited1@gmail.com',
  facebook: 'https://www.facebook.com/people/Newpave-LTD/61594755655961/',
  // [CONFIRM: Google Business Profile review link from Charles]
  googleReview: '',
  companyNo: '16762535',
  address: '39 Barn Close, Donnington, Telford TF2 7QT',
  // Lead delivery. Empty = demo mode: the booking flow still completes and hands
  // the lead to WhatsApp. Set to a Web3Forms/Formspree URL that forwards to
  // newpavelimited1@gmail.com before go-live (same pattern as the KT build).
  formEndpoint: '',
  // Hidden until Charles confirms they are real customers (no source on his site).
  showTestimonials: false,
};

// ----------------------------------------------------------------------------
// [CONFIRM with Charles] Example rates per m², used only for the configurator's
// "example range". Change the numbers here; the page updates itself.
// ----------------------------------------------------------------------------
export const RATES = {
  resin: [70, 120],
  block: [60, 110],
  tarmac: [40, 80],
  porcelain: [90, 150],
};
// [CONFIRM with Charles] Extras, priced as example ranges.
export const EXTRAS = {
  edging: { label: 'New edging and kerbs', per: 'm', range: [25, 45], qty: a => Math.round(Math.sqrt(a) * 2.2) },
  drainage: { label: 'Drainage channel', per: 'item', range: [250, 450] },
  steps: { label: 'Steps', per: 'item', range: [400, 900] },
  lighting: { label: 'Lighting', per: 'item', range: [300, 650] },
  removal: { label: 'Dig out and remove old surface', per: 'm²', range: [12, 25] },
};

export const SIZES = [
  { id: 'one', label: '1 car', m2: 15 },
  { id: 'two', label: '2 cars', m2: 32 },
  { id: 'three', label: '3 to 4 cars', m2: 55 },
  { id: 'large', label: 'Large or commercial', m2: 120 },
];

// Example aggregate blends (generic descriptive names, not supplier codes)
export const BLENDS = [
  { id: 'silver', name: 'Silver grey', c: ['#b9b8b2', '#8d8c88', '#e3e1da'] },
  { id: 'barley', name: 'Barley', c: ['#cdb48a', '#a68b62', '#e8dcc2'] },
  { id: 'gold', name: 'Autumn gold', c: ['#c8933f', '#9a6a2c', '#e2c084'] },
  { id: 'copper', name: 'Copper', c: ['#a8653e', '#7c4529', '#cf9670'] },
  { id: 'charcoal', name: 'Charcoal', c: ['#4a4a4c', '#2c2c2f', '#7b7a78'] },
  { id: 'flint', name: 'Cream flint', c: ['#e2dccd', '#bdb4a2', '#f4f1ea'] },
];
export const BLOCK_COLOURS = [
  { id: 'brindle', name: 'Brindle', c: ['#8a4b33', '#6b3a2a', '#a5654a'] },
  { id: 'charcoal', name: 'Charcoal', c: ['#47474a', '#38383b', '#5b5a5c'] },
  { id: 'red', name: 'Red', c: ['#9a3b2a', '#7f2f22', '#b04a36'] },
  { id: 'buff', name: 'Buff', c: ['#c8ab7c', '#b19468', '#d8c19a'] },
  { id: 'silver', name: 'Silver', c: ['#9fa0a0', '#8a8b8c', '#b6b6b5'] },
];
export const PATTERNS = [
  { id: 'herringbone', name: 'Herringbone' },
  { id: 'basketweave', name: 'Basketweave' },
  { id: 'stretcher', name: 'Stretcher bond' },
];
export const PORCELAIN = [
  { id: 'grey', name: 'Light grey', c: ['#b9b9b6', '#a9a9a6', '#c8c8c4'] },
  { id: 'sand', name: 'Sandstone', c: ['#cbb592', '#b9a07a', '#d9c6a6'] },
  { id: 'slate', name: 'Slate', c: ['#4c5156', '#3f4448', '#5b6166'] },
];

export const SURFACES = [
  { id: 'resin', name: 'Resin bound', short: 'Resin' },
  { id: 'block', name: 'Block paving', short: 'Block' },
  { id: 'tarmac', name: 'Tarmac', short: 'Tarmac' },
  { id: 'porcelain', name: 'Porcelain patio', short: 'Porcelain' },
];

// Areas: postcode prefixes he covers (Telford, Shropshire, Wolverhampton, Birmingham, West Midlands)
export const AREA_PREFIXES = { TF: 'Telford', SY: 'Shropshire', WV: 'Wolverhampton', B: 'Birmingham', WS: 'Walsall and the West Midlands', DY: 'Dudley and the West Midlands' };

// Testimonials from his current site. No source given, so hidden (showTestimonials:false).
export const TESTIMONIALS = [
  { name: 'Sarah Thompson', job: 'Driveway', text: '[CONFIRM: copy word for word from Charles before showing]' },
  { name: 'James Carter', job: 'Patio', text: '[CONFIRM: copy word for word from Charles before showing]' },
  { name: 'Rebecca Jones', job: 'Car park', text: '[CONFIRM: copy word for word from Charles before showing]' },
];

export const wa = (text) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
