// Suparesin finish pack. Prices, blend names and colours are EXAMPLES (labelled "Example" wherever they show).
// The services themselves are from his website (see content-inventory.md).
import type { Finish } from '@/components/signature/resin-studio/surfaces';

export type Mode = 'drive' | 'floor';
export type FinishOpt = Finish & { name: string; short: string; mode: Mode; note: string; photo: string };

// Hero + designer swatches. Driveway blends are generic example names, not a supplier's product range.
export const finishes: FinishOpt[] = [
  { key: 'golden', kind: 'resin', mode: 'drive', name: 'Golden gravel', short: 'Golden', c1: '#8C6A3F', c2: '#C49A62', c3: '#E9D3A6', note: 'Warm and light. Suits red brick.', photo: 'drive-gold' },
  { key: 'silver', kind: 'resin', mode: 'drive', name: 'Silver grey', short: 'Silver', c1: '#6B6D70', c2: '#A3A5A7', c3: '#E2E2DF', note: 'Cool and crisp. Suits render and grey windows.', photo: 'drive-grey' },
  { key: 'cream', kind: 'resin', mode: 'drive', name: 'Cream stone', short: 'Cream', c1: '#9C8F7C', c2: '#CFC4B1', c3: '#F3EDE1', note: 'Bright and soft. Lifts a shady front.', photo: 'drive-wall' },
  { key: 'autumn', kind: 'resin', mode: 'drive', name: 'Autumn quartz', short: 'Autumn', c1: '#7A4426', c2: '#B5814E', c3: '#E8D2B0', note: 'Amber, rust and cream.', photo: 'path-side' },
  { key: 'flake', kind: 'flake', mode: 'floor', name: 'Flake floor', short: 'Flake', c1: '#3E4146', c2: '#16181B', c3: '#C9CBCC', c4: '#7D8186', note: 'Grey base, broadcast with flakes, sealed in gloss.', photo: 'flake-garage' },
  { key: 'pearl', kind: 'metallic', mode: 'floor', name: 'Metallic pearl', short: 'Pearl', c1: '#8E9196', c2: '#C9CBCE', c3: '#F4F4F2', c4: '#5D6168', note: 'Pearl and smoke swirls. Never the same twice.', photo: 'metallic-grey' },
  { key: 'copper', kind: 'metallic', mode: 'floor', name: 'Metallic copper', short: 'Copper', c1: '#5A2A10', c2: '#B5642A', c3: '#F2B26B', c4: '#2A1408', note: 'Deep copper with bright lacing.', photo: 'metallic-copper' },
  { key: 'highbuild', kind: 'highbuild', mode: 'floor', name: 'High-build grey', short: 'High-build', c1: '#8A8F95', c2: '#A6ABB0', c3: '#6F747A', note: 'One hard-wearing colour, high gloss.', photo: 'highbuild-grey' },
];
export const byKey = (k: string) => finishes.find((f) => f.key === k) || finishes[0];
export const modeFinishes = (m: Mode) => finishes.filter((f) => f.mode === m);
export const FIRST: Record<Mode, string> = { drive: 'golden', floor: 'pearl' };

// What he installs (his website's service list). Example rates per m², rounded; "Example range" everywhere they show.
export const services = [
  { key: 'resin', label: 'Resin driveway', long: 'Resin-bound driveway', mode: 'drive' as Mode, low: 60, high: 95, sizes: 'drive' },
  { key: 'flake', label: 'Flake floor', long: 'Flake floor', mode: 'floor' as Mode, low: 45, high: 75, sizes: 'floor' },
  { key: 'metallic', label: 'Metallic epoxy', long: 'Metallic epoxy floor', mode: 'floor' as Mode, low: 75, high: 120, sizes: 'floor' },
  { key: 'highbuild', label: 'High-build epoxy', long: 'High-build epoxy floor', mode: 'floor' as Mode, low: 40, high: 70, sizes: 'floor' },
] as const;
export type Service = (typeof services)[number];
// the finish each service shows by default, and which finishes belong to it
export const serviceFinishes: Record<string, string[]> = { resin: ['golden', 'silver', 'cream', 'autumn'], flake: ['flake'], metallic: ['pearl', 'copper'], highbuild: ['highbuild'] };
export const serviceOf = (finishKey: string) => services.find((s) => serviceFinishes[s.key].includes(finishKey))!;

export const sizes = {
  drive: [{ key: 's', label: '1-car', m2: 18 }, { key: 'm', label: '2-car', m2: 36 }, { key: 'l', label: '3-car', m2: 54 }],
  floor: [{ key: 's', label: 'Single garage', m2: 16 }, { key: 'm', label: 'Kitchen', m2: 25 }, { key: 'l', label: 'Double garage', m2: 36 }],
} as const;

export const rounding = 50;
export function estimate(m2: number, s: Service) {
  const r = (n: number) => Math.round(n / rounding) * rounding;
  return { low: r(m2 * s.low), high: r(m2 * s.high) };
}
export const gbp = (n: number) => '£' + Math.round(n).toLocaleString('en-GB');
