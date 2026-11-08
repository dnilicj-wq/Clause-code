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
  const [surfaceKey, setSurfaceKey] = useState<string>('block');
  const [blendKey, setBlendKey] = useState<string>(blends[0].key);
  const [typeKey, setTypeKey] = useState<TypeKey>('block');
  const [touched, setTouched] = useState(false);
  const surface = surfaces.find((s) => s.key === surfaceKey)!;
  const blend = blends.find((b) => b.key === blendKey)!;
  const type = types.find((t) => t.key === typeKey)!;
  const v = useMemo<Q>(() => {
    const { low, high } = estimate(m2, surface);
    return {
      m2, sizeKey, surface, blend, type, low, high, touched,
      setM2: (n) => { setM2Raw(n); setSizeKey(''); setTouched(true); },
      setSize: (k) => { const s = sizes.find((x) => x.key === k)!; setSizeKey(k); setM2Raw(s.m2); setTouched(true); },
      setSurface: (k) => { setSurfaceKey(k); if (types.some((t) => t.key === k)) setTypeKey(k as TypeKey); setTouched(true); },
      // the hero background and the quote's surface stay in step (patio has no driveway price, so the quote keeps its surface)
      setType: (k) => { setTypeKey(k); if (surfaces.some((x) => x.key === k)) setSurfaceKey(k); setTouched(true); },
      setBlend: (k) => { setBlendKey(k); setTouched(true); window.dispatchEvent(new CustomEvent('pe:blend', { detail: k })); },
    };
  }, [m2, sizeKey, surface, blend, type, touched]);
  return <C.Provider value={v}>{children}</C.Provider>;
}
export function useQuote() { const c = useContext(C); if (!c) throw new Error('QuoteProvider missing'); return c; }

export function sizeLabel(q: Q) { const s = sizes.find((x) => x.key === q.sizeKey); return s ? `${s.label} drive (about ${q.m2} m²)` : `${q.m2} m² drive`; }

export function quoteText(q: Q, who: { name?: string; postcode?: string; phone?: string } = {}) {
  const lines = [
    `Hi ${site.owner.first}, I priced a driveway on your website:`,
    `• ${sizeLabel(q)}`,
    `• ${q.surface.long}${q.surface.key === 'resin' ? ` (${q.blend.name})` : ''}`,
    `• Example range: ${gbp(q.low)} to ${gbp(q.high)}`,
  ];
  if (who.name) lines.push(`Name: ${who.name}`);
  if (who.postcode) lines.push(`Postcode: ${who.postcode.toUpperCase()}`);
  if (who.phone) lines.push(`Phone: ${who.phone}`);
  lines.push('Could I get a free quote, please?');
  return lines.join('\n');
}
export const waLink = (q: Q, who: { name?: string; postcode?: string; phone?: string } = {}) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(quoteText(q, who))}`;
// for people not on WhatsApp: the same message as a text to his mobile
export const smsLink = (q: Q, who: { name?: string; postcode?: string; phone?: string } = {}) => `sms:${site.mobile.replace(/\s/g, '')}?&body=${encodeURIComponent(quoteText(q, who))}`;

export const EXAMPLE_LABEL = `Example range. ${site.owner.first} confirms it with a free, no-obligation quote.`;
export { gbp };
