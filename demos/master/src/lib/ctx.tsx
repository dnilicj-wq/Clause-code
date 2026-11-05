import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { site as baseSite, personalise, type Site } from '@/config/site';
import { presets, presetVars, type Preset } from '@/config/presets';
import { type TradePack } from '@/config/trades/epoxy';
import { trades } from '@/config/trades';

type Ctx = { site: Site; preset: Preset; trade: TradePack; setPreset: (k: string) => void };
const C = createContext<Ctx | null>(null);

export function SiteProvider({ children, presetKey }: { children: ReactNode; presetKey?: string }) {
  const q = typeof window !== 'undefined' ? new URLSearchParams(location.search).get('preset') : null;
  const [key, setKey] = useState<string>(presetKey || (q && presets[q] ? q : baseSite.preset));
  const site = useMemo(() => personalise(baseSite), []);
  const tq = typeof window !== 'undefined' ? new URLSearchParams(location.search).get('trade') : null;
  const trade = trades[tq && trades[tq] ? tq : site.trade] || trades.epoxy;
  const preset = presets[key] || presets['obsidian-copper'];
  const value = useMemo(() => ({ site, preset, trade, setPreset: setKey }), [site, preset, trade]);
  const vars = presetVars(preset);
  if (typeof document !== 'undefined') {
    const r = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => r.style.setProperty(k, v));
    r.style.colorScheme = preset.dark ? 'dark' : 'light';
  }
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useSite() { const c = useContext(C); if (!c) throw new Error('SiteProvider missing'); return c; }
export const fill = (s: string, site: Site) => s.replace('{areas}', `${site.town} and ${site.region}`).replace('{town}', site.town).replace('{company}', site.company);
