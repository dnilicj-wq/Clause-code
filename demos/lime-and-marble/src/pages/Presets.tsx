import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { presets, presetKeys, presetVars } from '@/config/presets';
import { useSite } from '@/src/lib/ctx';

// Each card scopes its own preset's CSS variables, so all 5 render side by side.
export default function Presets() {
  const { preset, setPreset } = useSite();
  useEffect(() => { document.title = 'Presets · Clientgateway master'; }, []);
  return (
    <div className="min-h-screen px-5 py-10" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">Presets</h1>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Pick one and open the demo page in it. /new-lead sets this in config/site.ts.</span>
          <Link to="/lab" className="ml-auto rounded-full border px-3 py-1.5 text-sm" style={{ borderColor: 'var(--line)' }}>Component lab</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {presetKeys.map((k) => {
            const p = presets[k];
            return (
              <div key={k} style={{ ...(presetVars(p) as any), background: 'var(--bg)', color: 'var(--ink)', borderColor: preset.key === k ? 'var(--accent)' : 'var(--line)', fontFamily: 'var(--font-body)' }}
                className="overflow-hidden rounded-[var(--radius)] border-2">
                <div className="relative h-40 overflow-hidden" style={{ background: `radial-gradient(120% 90% at 30% 10%, ${p.metal[2]}33, transparent 60%), linear-gradient(160deg, ${p.resin.base}, ${p.resin.metal})` }}>
                  <span className="absolute left-4 top-4 rounded-full bg-black/45 px-2.5 py-1 text-[11px] uppercase tracking-wider text-white">{p.vibe}</span>
                </div>
                <div className="p-6">
                  <h2 className="text-[28px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{p.name}</h2>
                  <p className="mt-1 text-[22px]" style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent2)' }}>Floors poured like liquid.</p>
                  <p className="mt-3 text-[15px]" style={{ color: 'var(--muted)' }}>Body text in this preset. Price before contact details, every time.</p>
                  <div className="mt-4 flex gap-1.5">
                    {[p.bg, p.bg2, p.surface, p.ink, p.muted, p.accent, p.accent2, ...p.metal].map((c, i) => <span key={i} title={c} className="h-6 w-6 rounded-full border" style={{ background: c, borderColor: 'rgba(128,128,128,.35)' }} />)}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={`/?preset=${k}`} onClick={() => setPreset(k)} className="rounded-full px-4 py-2.5 text-sm font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Open demo in this preset</Link>
                    <button onClick={() => setPreset(k)} className="rounded-full border px-4 py-2.5 text-sm" style={{ borderColor: 'var(--line)' }}>{preset.key === k ? 'Active' : 'Use here'}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
