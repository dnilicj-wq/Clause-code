import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { byKey, estimate, gbp, serviceFinishes, serviceOf, services, sizes, FIRST, type FinishOpt, type Mode, type Service } from '@/config/finishes';
import { site } from '@/config/site';

// Shared state: the hero switcher, the designer and the instant quote all edit the same job.
type Q = {
  mode: Mode; finish: FinishOpt; service: Service;
  m2: number; sizeKey: string; low: number; high: number; touched: boolean;
  setMode: (m: Mode) => void; setFinish: (k: string) => void; setService: (k: string) => void;
  setM2: (n: number) => void; setSize: (k: string) => void;
};
const C = createContext<Q | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [finishKey, setFinishKey] = useState<string>(FIRST.drive);
  const [m2, setM2Raw] = useState<number>(sizes.drive[1].m2);
  const [sizeKey, setSizeKey] = useState<string>('m');
  const [touched, setTouched] = useState(false);
  const finish = byKey(finishKey);
  const service = serviceOf(finishKey);
  const mode = finish.mode;
  const v = useMemo<Q>(() => {
    const { low, high } = estimate(m2, service);
    // a mode change keeps the size slot (S/M/L) but swaps in that mode's typical area
    const pick = (k: string) => {
      const f = byKey(k);
      if (f.mode !== mode && sizeKey) setM2Raw(sizes[f.mode].find((s) => s.key === sizeKey)!.m2);
      setFinishKey(k); setTouched(true);
    };
    return {
      mode, finish, service, m2, sizeKey, low, high, touched,
      setMode: (m) => { if (m !== mode) pick(FIRST[m]); },
      setFinish: pick,
      setService: (k) => { const s = services.find((x) => x.key === k)!; if (serviceOf(finishKey).key !== k) pick(serviceFinishes[s.key][0]); },
      setM2: (n) => { setM2Raw(n); setSizeKey(''); setTouched(true); },
      setSize: (k) => { setSizeKey(k); setM2Raw(sizes[mode].find((s) => s.key === k)!.m2); setTouched(true); },
    };
  }, [finishKey, m2, sizeKey, touched, finish, service, mode]);
  return <C.Provider value={v}>{children}</C.Provider>;
}
export function useQuote() { const c = useContext(C); if (!c) throw new Error('QuoteProvider missing'); return c; }

export function sizeLabel(q: Q) {
  const s = sizes[q.mode].find((x) => x.key === q.sizeKey);
  const what = q.mode === 'drive' ? 'drive' : 'floor';
  return s ? `${s.label} ${q.mode === 'drive' ? 'drive ' : ''}(about ${q.m2} m²)` : `${q.m2} m² ${what}`;
}
export type Who = { name?: string; phone?: string; postcode?: string };
export function quoteText(q: Q, who: Who = {}) {
  const lines = [
    `Hi ${site.owner.first}, I priced a job on your website:`,
    `• ${q.service.long}: ${q.finish.name}`,
    `• ${sizeLabel(q)}`,
    `• Example range: ${gbp(q.low)} to ${gbp(q.high)}`,
  ];
  if (who.name) lines.push(`Name: ${who.name}`);
  if (who.phone) lines.push(`Phone: ${who.phone}`);
  if (who.postcode) lines.push(`Postcode: ${who.postcode.toUpperCase()}`);
  lines.push('Could I get a free, no-obligation quote, please?');
  return lines.join('\n');
}
export const waLink = (q: Q, who: Who = {}) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(quoteText(q, who))}`;
export const smsLink = (q: Q, who: Who = {}) => `sms:${site.mobile.replace(/\s/g, '')}?&body=${encodeURIComponent(quoteText(q, who))}`;
export const EXAMPLE_LABEL = `Example range to help you plan. ${site.owner.first} confirms the real price with a free, no-obligation quote.`;
export { gbp };
