import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { blends, services, types, type BlendOpt, type TypeKey } from '@/config/driveway';

// Shared state: the hero surface switcher, its resin blend and the survey form's service stay in step.
type Q = {
  type: (typeof types)[number]; setType: (k: TypeKey) => void;
  blend: BlendOpt; setBlend: (k: string) => void;
  service: string; setService: (k: string) => void;
};
const C = createContext<Q | null>(null);

const serviceFor: Record<TypeKey, string> = { resin: 'resin-drive', block: 'block', concrete: 'concrete', patio: 'patio' };

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [typeKey, setTypeKey] = useState<TypeKey>('resin');
  const [blendKey, setBlendKey] = useState<string>(blends[0].key);
  const [service, setServiceRaw] = useState<string>('resin-drive');
  const type = types.find((t) => t.key === typeKey)!;
  const blend = blends.find((b) => b.key === blendKey)!;
  const v = useMemo<Q>(() => ({
    type, blend, service,
    setType: (k) => { setTypeKey(k); setServiceRaw(serviceFor[k]); },
    setBlend: (k) => setBlendKey(k),
    setService: (k) => { setServiceRaw(k); const t = services.find((s) => s.key === k)?.type; if (t) setTypeKey(t as TypeKey); },
  }), [type, blend, service]);
  return <C.Provider value={v}>{children}</C.Provider>;
}
export function useQuote() { const c = useContext(C); if (!c) throw new Error('QuoteProvider missing'); return c; }
