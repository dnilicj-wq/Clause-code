import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { blends, sizes, surfaces, types, estimate, gbp, type BlendOpt, type TypeKey } from '@/config/driveway';
import { site } from '@/config/site';

// Shared quote state: the hero card and the "Design your driveway" section edit the same quote.
type Q = {
  m2: number; setM2: (n: number) => void;
  sizeKey: string; setSize: (k: string) => void;
  surface: (typeof surfaces)[number]; setSurface: (k: string) => void;
  blend: BlendOpt; setBlend: (k: string) => void;
  type: (typeof types)[number]; setType: (k: TypeKey) => void;
  low: number; high: number; touched: boolean;
};
const C = createContext<Q | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [m2, setM2Raw] = useState<number>(sizes[1].m2);
  const [sizeKey, setSizeKey] = useState<string>(sizes[1].key);
  const [surfaceKey, setSurfaceKey] = useState<string>(surfaces[0].key);
  const [blendKey, setBlendKey] = useState<string>(blends[0].key);
  const [typeKey, setTypeKey] = useState<TypeKey>('porcelain');
  const [touched, setTouched] = useState(false);
  const type = types.find((t) => t.key === typeKey)!;
  const surface = surfaces.find((s) => s.key === surfaceKey)!;
  const blend = blends.find((b) => b.key === blendKey)!;
  const v = useMemo<Q>(() => {
    const { low, high } = estimate(m2, surface, type);
    return {
      m2, sizeKey, surface, blend, type, low, high, touched,
      setType: (k) => { setTypeKey(k); setTouched(true); },
      setM2: (n) => { setM2Raw(n); setSizeKey(''); setTouched(true); },
      setSize: (k) => { const s = sizes.find((x) => x.key === k)!; setSizeKey(k); setM2Raw(s.m2); setTouched(true); },
      setSurface: (k) => { setSurfaceKey(k); setTouched(true); },
      setBlend: (k) => { setBlendKey(k); setTypeKey('resin'); setTouched(true); window.dispatchEvent(new CustomEvent('pe:blend', { detail: k })); },
    };
  }, [m2, sizeKey, surface, blend, type, touched]);
  return <C.Provider value={v}>{children}</C.Provider>;
}
export function useQuote() { const c = useContext(C); if (!c) throw new Error('QuoteProvider missing'); return c; }

export function sizeLabel(q: Q) { const s = sizes.find((x) => x.key === q.sizeKey); return s ? `${s.label} size (about ${q.m2} m²)` : `${q.m2} m²`; }

export function waLink(q: Q, who: { name?: string; postcode?: string; phone?: string } = {}) {
  const lines = [
    `Hi ${site.owner.first}, I priced ${q.type.name} on your website:`,
    `• ${sizeLabel(q)}`,
    `• Now: ${q.surface.label.toLowerCase()}`,
    ...(q.type.key === 'resin' ? [`• Blend: ${q.blend.name}`] : []),
    `• Example range: ${gbp(q.low)} to ${gbp(q.high)}`,
  ];
  if (who.name) lines.push(`Name: ${who.name}`);
  if (who.postcode) lines.push(`Postcode: ${who.postcode.toUpperCase()}`);
  if (who.phone) lines.push(`Phone: ${who.phone}`);
  lines.push('Could you book me in for a free survey?');
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export const EXAMPLE_LABEL = `Example range — ${site.owner.first} confirms on a free survey`;
export { gbp };
