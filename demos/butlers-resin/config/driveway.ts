// Driveway pack for Butler's Resin & Construction. NO prices anywhere on this demo.
// Blend NAMES are ones he has laid (butlersrc.co.uk recent projects); the swatch colours are illustrations.
import type { Blend } from '@/components/signature/drive-pour/drive';

export type BlendOpt = Blend & { key: string; name: string; note: string };
export const blends: BlendOpt[] = [
  { key: 'dove', name: 'Dove Grey', note: 'Laid in Warboys with composite fencing.', c1: '#62666B', c2: '#A4A8AC', c3: '#E2E3E1' },
  { key: 'verona', name: 'Verona', note: 'Laid as a patio in Huntingdon, charcoal edge.', c1: '#8A6A4C', c2: '#C6A27C', c3: '#EBD8BE' },
  { key: 'rose', name: 'Evening Rose', note: 'Laid as a driveway in Yaxley, Peterborough.', c1: '#6E4038', c2: '#AE7A69', c3: '#E2C2B4' },
  { key: 'aspen', name: 'Aspen', note: 'Laid on a drive and steps in Rochester.', c1: '#85827C', c2: '#C4C1BA', c3: '#F0EEE9' },
];

// Hero surface switcher (the 3D background): what he lays. Resin first: the hero opens on it.
export const types = [
  { key: 'resin', label: 'Resin', short: 'Resin' },
  { key: 'block', label: 'Block paving', short: 'Block' },
  { key: 'concrete', label: 'Concrete', short: 'Concrete' },
  { key: 'patio', label: 'Patio', short: 'Patio' },
] as const;
export type TypeKey = (typeof types)[number]['key'];

// Survey form: what the customer wants done (his services, resin first).
export const services = [
  { key: 'resin-drive', label: 'Resin driveway', type: 'resin' },
  { key: 'resin-patio', label: 'Resin patio or path', type: 'resin' },
  { key: 'block', label: 'Block paving', type: 'block' },
  { key: 'concrete', label: 'Concrete driveway', type: 'concrete' },
  { key: 'patio', label: 'Patio', type: 'patio' },
  { key: 'kerb', label: 'Dropped kerb', type: '' },
  { key: 'other', label: 'Landscaping or tiling', type: '' },
] as const;

// Rough size: plain words, no numbers to commit to.
export const sizes = [
  { key: 'path', label: 'Path or small patio' },
  { key: '1car', label: '1-car drive' },
  { key: '2car', label: '2-car drive' },
  { key: 'big', label: 'Bigger than that' },
  { key: 'unsure', label: 'Not sure' },
] as const;
