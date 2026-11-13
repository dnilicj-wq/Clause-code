import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { blends, sizes, jobs, types, typeToJob, type BlendOpt, type TypeKey, type JobKey } from '@/config/driveway';
import { site } from '@/config/site';

// Shared quote state: the hero picker and the quote form edit the same request. No prices: their site publishes none.
type Q = {
  job: (typeof jobs)[number]; setJob: (k: JobKey) => void;
  size: (typeof sizes)[number] | null; setSize: (k: string) => void;
  blend: BlendOpt; setBlend: (k: string) => void;
  type: (typeof types)[number]; setType: (k: TypeKey) => void;
};
const C = createContext<Q | null>(null);
const jobToType: Record<JobKey, TypeKey> = { drive: 'resin', patio: 'resin', micro: 'micro', floor: 'coat' };

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [jobKey, setJobKey] = useState<JobKey>('drive');
  const [sizeKey, setSizeKey] = useState<string>('');
  const [blendKey, setBlendKey] = useState<string>(blends[0].key);
  const [typeKey, setTypeKey] = useState<TypeKey>('resin');
  const v = useMemo<Q>(() => ({
    job: jobs.find((j) => j.key === jobKey)!,
    size: sizes.find((s) => s.key === sizeKey) ?? null,
    blend: blends.find((b) => b.key === blendKey)!,
    type: types.find((t) => t.key === typeKey)!,
    // the hero background and the quote's job stay in step
    setJob: (k) => { setJobKey(k); setTypeKey(jobToType[k]); },
    setType: (k) => { setTypeKey(k); setJobKey((j) => (jobToType[j] === k ? j : typeToJob[k])); },
    setSize: (k) => setSizeKey(k),
    setBlend: (k) => setBlendKey(k),
  }), [jobKey, sizeKey, blendKey, typeKey]);
  return <C.Provider value={v}>{children}</C.Provider>;
}
export function useQuote() { const c = useContext(C); if (!c) throw new Error('QuoteProvider missing'); return c; }

export function summary(q: Q) {
  const out = [`• ${q.job.label}`];
  if (q.size) out.push(`• Size: ${q.size.label.toLowerCase()} (${q.size.hint})`);
  if (q.job.key === 'drive' || q.job.key === 'patio') out.push(`• Colour idea: ${q.blend.name} (from the examples on your site)`);
  return out;
}

// The form has no backend: it opens an email to them with everything typed out.
export function mailLink(q: Q, who: { name?: string; postcode?: string; phone?: string; note?: string } = {}) {
  const lines = [`Hi ${site.owner.first},`, '', 'I would like a quote:', ...summary(q)];
  if (who.note) lines.push('', who.note);
  lines.push('');
  if (who.name) lines.push(`Name: ${who.name}`);
  if (who.postcode) lines.push(`Postcode: ${who.postcode.toUpperCase()}`);
  if (who.phone) lines.push(`Phone: ${who.phone}`);
  const subject = `Quote request: ${q.job.label}${who.postcode ? ` in ${who.postcode.toUpperCase()}` : ''}`;
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}
export const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;
