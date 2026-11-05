// The component library. /new-lead picks from here using tradeFit, vibe and needs.
// `needs` stops a component being picked when the prospect has no real content for it.
// score: Clientgateway quality score out of 10 after a /lab review (null = not reviewed yet). Under 9 = redo.

export type Slot = 'hero' | 'proof' | 'process' | 'pricing' | 'gallery' | 'reviews' | 'about' | 'cta' | 'footer' | 'global';
export type Need = 'realReviews' | 'realPhotos' | 'realPrices' | 'ownerPhoto' | 'geminiKey' | 'realStats' | 'uvStable';
export type Entry = {
  id: string; name: string; category: Category; slot: Slot;
  source: string; author: string; licence?: string;
  tradeFit: string[]; vibe: ('luxury' | 'industrial' | 'clean' | 'bold')[];
  perfCost: 'low' | 'med' | 'high'; mobileSafe: boolean; needs: Need[];
  status: 'ported' | 'in-progress' | 'rejected'; usedOnHome: boolean;
  score: number | null; notes: string;
};
export type Category = 'signature' | 'hero-bg' | 'scroll' | 'features' | 'charts' | 'gallery' | 'reviews' | 'buttons' | 'text' | 'nav-cta-footer';

export const categories: { key: Category; name: string }[] = [
  { key: 'signature', name: 'Signature interactions' },
  { key: 'hero-bg', name: 'Heroes & backgrounds' },
  { key: 'scroll', name: 'Scroll storytelling' },
  { key: 'features', name: 'Features, bento & proof' },
  { key: 'charts', name: 'Charts & live diagrams' },
  { key: 'gallery', name: 'Gallery & before/after' },
  { key: 'reviews', name: 'Reviews' },
  { key: 'buttons', name: 'Buttons & micro-interactions' },
  { key: 'text', name: 'Text effects' },
  { key: 'nav-cta-footer', name: 'Navigation, CTA & footer' },
];

const ALL = ['epoxy', 'resin', 'microcement', 'tiling', 'roofing'];
const FLOORS = ['epoxy', 'resin', 'microcement'];
const CAT = 'https://github.com/Deepender25/21st.dev-Component-Skill- (scraped 21st.dev catalogue, pinned 3de2165)';

export const registry: Entry[] = [
  // ---------- signature (custom, Clientgateway) ----------
  { id: 'pour-hero', name: 'Pour & self-level hero', category: 'signature', slot: 'hero', source: 'custom', author: 'Clientgateway (pattern from KT trowel hero + Gafflow pour.js)', tradeFit: ['epoxy', 'resin'], vibe: ['luxury', 'bold', 'industrial'], perfCost: 'med', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Raw WebGL1. Poster frame (real render) first, live on idle/first touch. Auto-demo pour on load; Finish floor fills + reflection sweep. 4 finish kinds: metallic, flake, solid, quartz.' },
  { id: 'layer-explode', name: 'Layer explode (rendered textures)', category: 'signature', slot: 'process', source: 'custom', author: 'Clientgateway (logic from demos/gafflow layers.js)', tradeFit: FLOORS, vibe: ['luxury', 'industrial', 'bold'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'CSS 3D, textures rendered from the pour shader (scripts/capture.mjs). Paired with Stacking Cards.' },
  { id: 'visualiser', name: '"See it in your garage" visualiser', category: 'signature', slot: 'pricing', source: 'custom', author: 'Clientgateway', tradeFit: FLOORS, vibe: ['luxury', 'clean', 'bold', 'industrial'], perfCost: 'low', mobileSafe: true, needs: ['geminiKey'], status: 'ported', usedOnHome: true, score: null, notes: 'api/visualise.ts → gemini-2.5-flash-image. 3/visitor, 50/day, 8 MB. Falls back to "Visualiser busy" + example still when no key or capped.' },
  { id: 'quote-configurator', name: 'Quote configurator (price before contact)', category: 'signature', slot: 'pricing', source: 'custom', author: 'Clientgateway (pricing from demos/coating/src/derive.js)', tradeFit: FLOORS, vibe: ['luxury', 'clean', 'bold', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Shows "Example range" until the business sets rates in the trade pack. Inside Container Scroll on desktop.' },
  { id: 'bento-diagrams', name: 'Live diagram bento (moisture, hot tyre, spill, timeline)', category: 'charts', slot: 'proof', source: 'custom', author: 'Clientgateway', tradeFit: FLOORS, vibe: ['luxury', 'industrial', 'clean'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'All labelled Illustration / Typical. Wave 2 replaces tiles with the full hot-tyre and spill signature tests.' },
  { id: 'pour-wipe-compare', name: 'Pour-wipe before/after', category: 'gallery', slot: 'gallery', source: 'custom (KT compare pattern)', author: 'Clientgateway', tradeFit: FLOORS, vibe: ['luxury', 'clean', 'bold', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Uses rendered concrete→copper pair (Illustration). Swap for Gemini-matched photo pairs or the client\'s real before/after.' },

  // ---------- heroes & backgrounds ----------
  { id: 'lamp', name: 'Lamp', category: 'hero-bg', slot: 'cta', source: 'https://21st.dev/@manuarora700/components/lamp', author: 'Aceternity UI', tradeFit: ALL, vibe: ['luxury', 'bold'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: `Copy from ${CAT}. Colours re-skinned to preset.` },
  { id: 'beams-background', name: 'Beams Background', category: 'hero-bg', slot: 'hero', source: 'https://21st.dev/@kokonutd/components/beams-background', author: 'Kokonut UI', tradeFit: ALL, vibe: ['bold', 'luxury'], perfCost: 'med', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT}.` },
  { id: 'tilted-grid-hero', name: 'Tilted Grid Hero', category: 'hero-bg', slot: 'hero', source: 'https://21st.dev/@ruixen.ui/components/tilted-grid-hero', author: 'Ruixen UI', tradeFit: ALL, vibe: ['bold', 'luxury'], perfCost: 'med', mobileSafe: true, needs: ['realPhotos'], status: 'ported', usedOnHome: false, score: null, notes: 'Medium-confidence copy (Swopnab/Unstuck, 4 near-identical copies on GitHub). A wall of finished floors.' },
  { id: 'scroll-expansion-hero', name: 'Scroll Expansion Hero', category: 'scroll', slot: 'proof', source: 'https://21st.dev/@arunachalam/components/scroll-expansion-hero', author: 'arunachalam', tradeFit: ALL, vibe: ['luxury', 'bold'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: `Copy from ${CAT}. Added controlled \`progress\` prop so it runs mid-page from a sticky section instead of hijacking the wheel at page top.` },

  // ---------- scroll storytelling ----------
  { id: 'container-scroll', name: 'Container Scroll Animation', category: 'scroll', slot: 'pricing', source: 'https://21st.dev/@manuarora700/components/container-scroll-animation', author: 'Aceternity UI', tradeFit: ALL, vibe: ['luxury', 'bold', 'clean'], perfCost: 'low', mobileSafe: false, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Copied via 21st.dev "Copy prompt" (verbatim). Desktop only on the page; phones get a flat device frame so the form stays usable.' },
  { id: 'stacking-cards', name: 'Stacking Cards', category: 'scroll', slot: 'process', source: 'https://21st.dev/@danielpetho/components/stacking-cards', author: 'Daniel Petho / fancy (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['luxury', 'bold', 'clean', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'From github.com/danielpetho/fancy.' },
  { id: 'timeline', name: 'Timeline (Aceternity)', category: 'scroll', slot: 'process', source: 'https://21st.dev/@manuarora700/components/timeline', author: 'Aceternity UI', tradeFit: ALL, vibe: ['clean', 'luxury'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT}. Survey → grind → coats → cure.` },
  { id: 'sticky-scroll-cards', name: 'Sticky Scroll Cards', category: 'scroll', slot: 'process', source: 'https://21st.dev/@minhxthanh/components/sticky-scroll-cards-section', author: 'minhxthanh', tradeFit: ALL, vibe: ['clean', 'luxury'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT}. Ships as a fixed demo section; needs props wiring before use.` },
  { id: 'svg-follow-scroll', name: 'SVG Follow Scroll', category: 'scroll', slot: 'global', source: 'https://21st.dev/@reuno-ui/components/svg-follow-scroll', author: 'reuno-ui', tradeFit: FLOORS, vibe: ['bold', 'luxury'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT}. Idea: a resin line pours down the page.` },
  { id: 'text-reveal', name: 'Text Reveal (scroll)', category: 'text', slot: 'about', source: 'https://magicui.design/docs/components/text-reveal', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['luxury', 'clean'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: 'github.com/magicuidesign/magicui.' },

  // ---------- features ----------
  { id: 'magic-card', name: 'Magic Card', category: 'features', slot: 'proof', source: 'https://magicui.design/docs/components/magic-card', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['luxury', 'bold', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'next-themes replaced by a dark shim.' },
  { id: 'border-beam', name: 'Border Beam', category: 'features', slot: 'proof', source: 'https://magicui.design/docs/components/border-beam', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['luxury', 'bold'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Guarantee card.' },
  { id: 'dotted-map', name: 'Dotted Map', category: 'features', slot: 'proof', source: 'https://magicui.design/docs/components/dotted-map', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['clean', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: 'Service-area map (UK markers from site.areas).' },

  // ---------- charts ----------
  { id: 'radar-chart', name: 'Radar Chart', category: 'charts', slot: 'proof', source: 'https://21st.dev/@LegionWebDev/components/radar-chart', author: 'LegionWebDev', tradeFit: FLOORS, vibe: ['clean', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT} (recharts chart primitives). Lab demo: resin vs floor paint, labelled Illustrative.` },
  { id: 'number-ticker', name: 'Number Ticker', category: 'charts', slot: 'pricing', source: 'https://magicui.design/docs/components/number-ticker', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['luxury', 'clean', 'bold', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Live price range.' },

  // ---------- gallery ----------
  { id: 'circular-gallery', name: 'Circular Gallery', category: 'gallery', slot: 'gallery', source: 'https://21st.dev/@ravikatiyar162/components/circular-gallery', author: 'ravikatiyar', tradeFit: ALL, vibe: ['luxury', 'bold'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: `Copy from ${CAT}. CSS 3D (not the OGL React Bits one). Caption prefix removed.` },
  { id: 'glassy-coverflow', name: 'Glassy Coverflow Carousel', category: 'gallery', slot: 'gallery', source: 'https://21st.dev/@troyjlorents-gh/components/glassy-coverflow-carousel', author: 'troyjlorents-gh', tradeFit: ALL, vibe: ['luxury'], perfCost: 'low', mobileSafe: true, needs: [], status: 'in-progress', usedOnHome: false, score: null, notes: 'No faithful copy on GitHub and the 21st.dev free copy quota is used up. Needs Dan to paste "Copy prompt" into library-inbox/glassy-coverflow-carousel.md.' },

  // ---------- reviews ----------
  { id: 'animated-testimonials', name: 'Animated Testimonials', category: 'reviews', slot: 'reviews', source: 'https://21st.dev/@manuarora700/components/animated-testimonials', author: 'Aceternity UI', tradeFit: ALL, vibe: ['luxury', 'clean', 'bold'], perfCost: 'low', mobileSafe: true, needs: ['realReviews'], status: 'ported', usedOnHome: true, score: null, notes: `Copy from ${CAT}. Image slot shows the job (floor), not a face.` },
  { id: 'animated-cards-stack', name: 'Animated Cards Stack', category: 'reviews', slot: 'reviews', source: 'https://21st.dev/@youcefbnm/components/animated-cards-stack', author: 'YoucefBnm', tradeFit: ALL, vibe: ['bold', 'clean'], perfCost: 'low', mobileSafe: true, needs: ['realReviews'], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT}.` },
  { id: 'infinite-moving-cards', name: 'Infinite Moving Cards', category: 'reviews', slot: 'reviews', source: 'https://21st.dev/@nexus-ui/components/infinite-moving-cards', author: 'Aceternity UI', tradeFit: ALL, vibe: ['clean', 'luxury'], perfCost: 'low', mobileSafe: true, needs: ['realReviews'], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT}.` },

  // ---------- buttons ----------
  { id: 'liquid-metal-button', name: 'Liquid Metal Button', category: 'buttons', slot: 'cta', source: 'https://21st.dev/@johuniq/components/liquid-metal-button', author: 'johuniq', tradeFit: ALL, vibe: ['luxury', 'bold', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Copy found at arupdas0825/CodeFolio (matches 21st code seen in Copy prompt). @paper-design/shaders pinned 0.0.77. MetalCTA wrapper mounts shader only on screen.' },
  { id: 'shiny-button', name: 'Shiny Button', category: 'buttons', slot: 'cta', source: 'https://magicui.design/docs/components/shiny-button', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['clean', 'luxury'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: '' },
  { id: 'interactive-hover-button', name: 'Interactive Hover Button', category: 'buttons', slot: 'cta', source: 'https://21st.dev/@dillionverma/components/interactive-hover-button', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['clean', 'bold'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: '' },
  { id: 'glass-button', name: 'Glass Button', category: 'buttons', slot: 'cta', source: 'https://21st.dev/@easemize/components/glass-button', author: 'easemize', tradeFit: ALL, vibe: ['luxury', 'clean'], perfCost: 'low', mobileSafe: true, needs: [], status: 'in-progress', usedOnHome: false, score: null, notes: `Copy from ${CAT}. The catalogue copy is missing its glass-button CSS, so it renders flat. Needs the CSS block from 21st Copy prompt.` },
  { id: 'liquid-glass-button', name: 'Liquid Glass Button', category: 'buttons', slot: 'cta', source: 'https://21st.dev/@designali-in/components/liquid-glass-button', author: 'aliimam / designali', tradeFit: ALL, vibe: ['luxury', 'clean'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT}.` },

  // ---------- text ----------
  { id: 'vertical-cut-reveal', name: 'Vertical Cut Reveal', category: 'text', slot: 'hero', source: 'https://21st.dev/@cnippet-dev/components/vertical-cut-reveal', author: 'Daniel Petho / fancy (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['luxury', 'bold', 'clean', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Hero headline.' },
  { id: 'morphing-text', name: 'Morphing Text', category: 'text', slot: 'hero', source: 'https://21st.dev/@dillionverma/components/morphing-text', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['bold', 'luxury'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: 'Garages / Kitchens / Showrooms.' },
  { id: 'word-rotate', name: 'Word Rotate', category: 'text', slot: 'hero', source: 'https://21st.dev/@molecule-lab-rushil/components/word-rotate', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['clean', 'bold'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: '' },
  { id: 'blur-fade', name: 'Blur Fade', category: 'text', slot: 'global', source: 'https://magicui.design/docs/components/blur-fade', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['clean', 'luxury'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: '' },

  // ---------- nav / cta / footer ----------
  { id: 'marquee', name: 'Glass pill marquee', category: 'nav-cta-footer', slot: 'proof', source: 'https://magicui.design/docs/components/marquee', author: 'Magic UI (MIT)', licence: 'MIT', tradeFit: ALL, vibe: ['luxury', 'clean', 'bold', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: 'Services the business really offers.' },
  { id: 'message-dock', name: 'Message Dock (mobile bar)', category: 'nav-cta-footer', slot: 'cta', source: 'https://21st.dev/@isaiahbjork/components/message-dock', author: 'isaiahbjork', tradeFit: ALL, vibe: ['luxury', 'clean', 'bold', 'industrial'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: true, score: null, notes: `Copy from ${CAT}. Call / WhatsApp / Quote.` },
  { id: 'limelight-nav', name: 'Limelight Nav', category: 'nav-cta-footer', slot: 'global', source: 'https://21st.dev/@easemize/components/limelight-nav', author: 'easemize', tradeFit: ALL, vibe: ['luxury', 'bold'], perfCost: 'low', mobileSafe: true, needs: [], status: 'ported', usedOnHome: false, score: null, notes: `Copy from ${CAT}.` },
  { id: 'large-name-footer', name: 'Large Name Footer', category: 'nav-cta-footer', slot: 'footer', source: 'https://21st.dev/@arihantcodes_1f7b8c4d/components/large-name-footer', author: 'arihantcodes', tradeFit: ALL, vibe: ['luxury', 'bold', 'clean'], perfCost: 'low', mobileSafe: true, needs: [], status: 'in-progress', usedOnHome: true, score: null, notes: 'Catalogue copy imports a missing @/components/ui/icons; the page uses a same-pattern wordmark footer for now. Port in Wave 2.' },
];
