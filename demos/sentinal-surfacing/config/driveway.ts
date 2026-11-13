// Surfaces pack for Sentinal Surfacing. No prices anywhere: their site publishes none.
// Facts about the business live in config/site.ts with sources in content-inventory.md.
import type { Blend } from '@/components/signature/drive-pour/drive';

export type BlendOpt = Blend & { key: string; name: string; note: string };
// Example resin blends to show the idea: generic names, not their range (their FAQ: "over 40 different colour blends").
export const blends: BlendOpt[] = [
  { key: 'golden', name: 'Golden gravel', note: 'Warm and light. Suits red brick.', c1: '#8C6A3F', c2: '#C49A62', c3: '#E9D3A6' },
  { key: 'silver', name: 'Silver grey', note: 'Cool and crisp. Suits render and grey windows.', c1: '#6B6D70', c2: '#A3A5A7', c3: '#E2E2DF' },
  { key: 'charcoal', name: 'Charcoal mix', note: 'Dark and modern.', c1: '#2A2B2D', c2: '#4C4E51', c3: '#9A9C9E' },
  { key: 'autumn', name: 'Autumn quartz', note: 'Mixed amber, rust and cream.', c1: '#7A4426', c2: '#B5814E', c3: '#E8D2B0' },
  { key: 'cream', name: 'Cream stone', note: 'Bright and soft. Lifts a shady front.', c1: '#9C8F7C', c2: '#CFC4B1', c3: '#F3EDE1' },
  { key: 'bronze', name: 'Bronze blend', note: 'Deep gold and brown.', c1: '#4A3220', c2: '#8E6538', c3: '#D2AE72' },
];

// What the job is (the quote form). Labels use their own service names.
export const jobs = [
  { key: 'drive', label: 'Resin driveway', area: 'drive', photo: 'darras-hall', note: 'Resin-bound stone in a colour to suit your home.' },
  { key: 'patio', label: 'Patio or path', area: 'patio or path', photo: 'seaham', note: 'Resin-bound patios, paths and garden areas.' },
  { key: 'micro', label: 'Microcement', area: 'room', photo: 'portland-lounge', note: 'Floors and walls, indoor or outdoor.' },
  { key: 'floor', label: 'Commercial floor', area: 'floor', photo: 'int-hall', note: 'Seamless floors from industrial units to hospitals.' },
] as const;
export type JobKey = (typeof jobs)[number]['key'];

export const sizes = [
  { key: 's', label: 'Small', hint: 'up to 20 m²' },
  { key: 'm', label: 'Medium', hint: '20 to 60 m²' },
  { key: 'l', label: 'Large', hint: 'over 60 m²' },
] as const;

// Hero surface switcher (the 3D background): one per service on their site. Resin first: the hero opens on it.
export const types = [
  { key: 'resin', label: 'Resin bound', short: 'Resin' },
  { key: 'micro', label: 'Microcement', short: 'Micro' },
  { key: 'coat', label: 'Floor coating', short: 'Coating' },
] as const;
export type TypeKey = (typeof types)[number]['key'];
export const typeToJob: Record<TypeKey, JobKey> = { resin: 'drive', micro: 'micro', coat: 'floor' };
