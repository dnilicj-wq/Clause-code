// Resin-driveway trade pack for Proficient Essex. Prices and blends are EXAMPLES (labelled on the page).
// Facts about the business live in config/site.ts with sources in content-inventory.md.
import type { Blend } from '@/components/signature/drive-pour/drive';

export type BlendOpt = Blend & { key: string; name: string; note: string };
// Example blends: generic names, not a supplier's product range.
export const blends: BlendOpt[] = [
  { key: 'golden', name: 'Golden gravel', note: 'Warm and light. Suits red brick.', c1: '#8C6A3F', c2: '#C49A62', c3: '#E9D3A6' },
  { key: 'silver', name: 'Silver grey', note: 'Cool and crisp. Suits render and grey windows.', c1: '#6B6D70', c2: '#A3A5A7', c3: '#E2E2DF' },
  { key: 'charcoal', name: 'Charcoal mix', note: 'Dark and modern. Hides tyre marks.', c1: '#2A2B2D', c2: '#4C4E51', c3: '#9A9C9E' },
  { key: 'autumn', name: 'Autumn quartz', note: 'Mixed amber, rust and cream.', c1: '#7A4426', c2: '#B5814E', c3: '#E8D2B0' },
  { key: 'cream', name: 'Cream stone', note: 'Bright and soft. Lifts a shady front.', c1: '#9C8F7C', c2: '#CFC4B1', c3: '#F3EDE1' },
  { key: 'bronze', name: 'Bronze blend', note: 'Deep gold and brown. Pairs with a dark border.', c1: '#4A3220', c2: '#8E6538', c3: '#D2AE72' },
];

export const sizes = [
  { key: '1car', label: '1-car', m2: 18 },
  { key: '2car', label: '2-car', m2: 36 },
  { key: '3car', label: '3-car', m2: 54 },
] as const;

// Example rates per m², by what is there now (more prep = higher rate). Rounded to £50.
export const surfaces = [
  { key: 'tarmac', label: 'Tarmac', low: 60, high: 85, prep: 'If the tarmac is sound it can often be resurfaced. Matt checks this on the survey.' },
  { key: 'concrete', label: 'Concrete', low: 60, high: 85, prep: 'Sound concrete can often take a resin surface. Cracks are checked on the survey.' },
  { key: 'block', label: 'Block paving', low: 85, high: 115, prep: 'Block paving usually comes up and a new base goes down first.' },
  { key: 'gravel', label: 'Gravel or soil', low: 95, high: 130, prep: 'Dig out and a new sub-base before the resin goes down.' },
] as const;

// What goes down. Sources in content-inventory.md: resin, block paving and natural stone from their site
// (resin driveways page; driveways page "the classic appeal of brick"; patios page "natural stone"), porcelain from Dan.
// Rates are EXAMPLES per m² over sound tarmac or concrete; the "what's there now" prep is added on top.
export const types = [
  { key: 'porcelain', label: 'Porcelain', short: 'Porcelain', name: 'porcelain paving', low: 85, high: 125 },
  { key: 'resin', label: 'Resin', short: 'Resin', name: 'resin-bound surface', low: 60, high: 85 },
  { key: 'block', label: 'Block paving', short: 'Block', name: 'block paving', low: 70, high: 105 },
  { key: 'stone', label: 'Natural stone', short: 'Stone', name: 'natural stone paving', low: 80, high: 120 },
] as const;
export type TypeKey = (typeof types)[number]['key'];
// extra prep per m² by what's there now (block paving and gravel/soil need digging out and a new base)
const prep: Record<string, [number, number]> = { tarmac: [0, 0], concrete: [0, 0], block: [25, 30], gravel: [35, 45] };

export const rounding = 50;
export function estimate(m2: number, surface: (typeof surfaces)[number], type: (typeof types)[number] = types[1]) {
  const r = (n: number) => Math.round(n / rounding) * rounding;
  const [pl, ph] = prep[surface.key] ?? [0, 0];
  return { low: r(m2 * (type.low + pl)), high: r(m2 * (type.high + ph)) };
}
export const gbp = (n: number) => '£' + Math.round(n).toLocaleString('en-GB');
