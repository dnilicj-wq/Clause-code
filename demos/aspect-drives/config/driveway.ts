// Driveway trade pack for Aspect Drives & Patios. Prices and blends are EXAMPLES (labelled on the page).
// Facts about the business live in config/site.ts with sources in content-inventory.md.
import type { Blend } from '@/components/signature/drive-pour/drive';

export type BlendOpt = Blend & { key: string; name: string; note: string };
// Example resin blends: generic names, not a supplier's product range.
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

// The surface you want. Example rates per m² (labelled "Example range" everywhere they show). Rounded to £50.
// photo = one of his own jobs in that surface (public/client/); concrete has no photo of his yet, so it shows an illustration.
export const surfaces = [
  { key: 'block', label: 'Block paving', long: 'Block-paved driveway', low: 65, high: 100, photo: 'block-border', note: 'Patterns, borders and colours to suit the house.' },
  { key: 'resin', label: 'Resin', long: 'Resin-bound driveway', low: 70, high: 110, photo: 'resin-border', note: 'Smooth, porous stone finish in the blend you pick.' },
  { key: 'concrete', label: 'Concrete', long: 'Concrete driveway', low: 55, high: 90, photo: '', note: 'Clean, hard-wearing slab, brushed or polished.' },
] as const;

// Hero surface switcher (the 3D background): what Gerald lays, per his Checkatrade skills. Block paving first: the hero opens on it.
export const types = [
  { key: 'block', label: 'Block paving', short: 'Block' },
  { key: 'resin', label: 'Resin', short: 'Resin' },
  { key: 'patio', label: 'Patio', short: 'Patio' },
  { key: 'concrete', label: 'Concrete', short: 'Concrete' },
] as const;
export type TypeKey = (typeof types)[number]['key'];

export const rounding = 50;
export function estimate(m2: number, surface: (typeof surfaces)[number]) {
  const r = (n: number) => Math.round(n / rounding) * rounding;
  return { low: r(m2 * surface.low), high: r(m2 * surface.high) };
}
export const gbp = (n: number) => '£' + Math.round(n).toLocaleString('en-GB');
