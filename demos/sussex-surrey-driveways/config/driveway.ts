// Driveway designer for Sussex & Surrey Driveways. Their site publishes no prices, so the designer builds a
// quote REQUEST (no £ figures) that goes to them on WhatsApp for a free site visit and estimate.
// Surfaces and notes are from their own pages (sources in content-inventory.md).
import type { Blend } from '@/components/signature/drive-pour/drive';

export type BlendOpt = Blend & { key: string; name: string; note: string };
// Example colour mixes to show the idea (generic names, not a supplier's range). Their site: "a range of colours and textures".
export const blends: BlendOpt[] = [
  { key: 'golden', name: 'Golden gravel', note: 'Warm and light. Suits red brick.', c1: '#8C6A3F', c2: '#C49A62', c3: '#E9D3A6' },
  { key: 'silver', name: 'Silver grey', note: 'Cool and crisp. Suits render and grey windows.', c1: '#6B6D70', c2: '#A3A5A7', c3: '#E2E2DF' },
  { key: 'charcoal', name: 'Charcoal mix', note: 'Dark and modern.', c1: '#2A2B2D', c2: '#4C4E51', c3: '#9A9C9E' },
  { key: 'autumn', name: 'Autumn quartz', note: 'Mixed amber, rust and cream.', c1: '#7A4426', c2: '#B5814E', c3: '#E8D2B0' },
  { key: 'cream', name: 'Cream stone', note: 'Bright and soft. Lifts a shady front.', c1: '#9C8F7C', c2: '#CFC4B1', c3: '#F3EDE1' },
  { key: 'bronze', name: 'Bronze blend', note: 'Deep gold and brown.', c1: '#4A3220', c2: '#8E6538', c3: '#D2AE72' },
];

export const sizes = [
  { key: '1car', label: '1-car', m2: 18 },
  { key: '2car', label: '2-car', m2: 36 },
  { key: '3car', label: '3-car', m2: 54 },
] as const;

export const surfaces = [
  { key: 'tarmac', label: 'Tarmac' },
  { key: 'concrete', label: 'Concrete' },
  { key: 'block', label: 'Block paving' },
  { key: 'gravel', label: 'Gravel or soil' },
] as const;

// What goes down. All five are on sussexandsurreydrivewaysltd.co.uk (driveways + patios pages).
export const types = [
  { key: 'block', label: 'Block paving', short: 'Block', name: 'a block paving driveway', note: 'Herringbone shown. Patterns, inlays, curves and kerbs to choose.' },
  { key: 'resin', label: 'Resin', short: 'Resin', name: 'a resin driveway', note: 'Looks like gravel, without the loose stones.' },
  { key: 'tarmac', label: 'Tarmac', short: 'Tarmac', name: 'a tarmac driveway', note: 'Hard-wearing. Black or red finish.' },
  { key: 'gravel', label: 'Gravel', short: 'Gravel', name: 'a gravel driveway', note: 'Low maintenance. Rain drains straight through.' },
  { key: 'stone', label: 'Natural stone', short: 'Stone', name: 'a natural stone patio', note: 'Natural stone laid in a random pattern.' },
] as const;
export type TypeKey = (typeof types)[number]['key'];
