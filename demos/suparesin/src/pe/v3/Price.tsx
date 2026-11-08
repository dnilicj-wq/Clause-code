import { useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { finishes, serviceFinishes, services, sizes, byKey } from '@/config/finishes';
import { photoSrc } from '@/config/content';
import { Ticker } from '../lite';
import { useQuote, waLink, smsLink, EXAMPLE_LABEL, sizeLabel } from '../quote';
import { WaIcon } from '../Hero';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

// The designer + instant quote his site doesn't have: service, finish (seen as a render and next to his own job
// in a similar finish), size, a live example range, then name / phone / postcode straight to Darren on WhatsApp.
export function Price() {
  const { site } = useSite();
  const q = useQuote();
  const [who, setWho] = useState({ name: '', phone: '', postcode: '' });
  const [view, setView] = useState<'render' | 'job'>('render');
  const f = q.finish;
  const own = serviceFinishes[q.service.key];

  return (
    <section id="price" aria-labelledby="priceH" className="theme-yellow relative py-20 md:py-28" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 md:grid-cols-[1.02fr_1fr] md:gap-14 md:px-12">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[.16em]">The designer</p>
          <h2 id="priceH" className="d-l mt-3">Design it. <i>Price it.</i></h2>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed" style={{ color: 'var(--muted)' }}>Choose the job, the finish and the size. When it looks right, it goes to {site.owner.first} on WhatsApp with everything filled in.</p>

          <div className="mt-9 grid gap-7">
            <fieldset>
              <legend className="mb-3 text-[13px] font-semibold">1. The job</legend>
              <div className="grid grid-cols-2 gap-1 rounded-[22px] p-1 sm:grid-cols-4" style={{ background: 'rgba(20,14,2,.1)' }}>
                {services.map((s) => (
                  <button type="button" key={s.key} aria-pressed={q.service.key === s.key} onClick={() => q.setService(s.key)}
                    className="h-11 rounded-full px-2 text-[14px] font-semibold transition-colors duration-200"
                    style={q.service.key === s.key ? { background: '#140E02', color: 'var(--y)' } : undefined}>{s.label}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-[13px] font-semibold">2. The finish <span className="font-normal" style={{ color: 'var(--muted)' }}>(example {q.mode === 'drive' ? 'blends' : 'finishes'})</span></legend>
              <div className="flex flex-wrap items-center gap-2.5">
                {finishes.filter((x) => own.includes(x.key)).map((x) => (
                  <button type="button" key={x.key} onClick={() => q.setFinish(x.key)} aria-label={`${x.name} (example)`} aria-pressed={f.key === x.key}
                    className="h-12 w-12 rounded-full bg-cover transition-transform duration-150 active:scale-95"
                    style={{ backgroundImage: `url(/finish/${x.key}-160-v1.webp), linear-gradient(135deg, ${x.c1}, ${x.c2} 55%, ${x.c3})`, boxShadow: f.key === x.key ? '0 0 0 3px #140E02, 0 0 0 5px #F3B31E' : 'inset 0 0 0 1px rgba(0,0,0,.2)' }} />
                ))}
                <span className="ml-1 text-[15px] font-semibold">{f.name}</span>
                <span className="basis-full text-[14px]" style={{ color: 'var(--muted)' }}>{f.note}</span>
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-[13px] font-semibold">3. The size</legend>
              <div className="seg">
                {sizes[q.mode].map((s) => <button type="button" key={s.key} aria-pressed={q.sizeKey === s.key} onClick={() => q.setSize(s.key)} className="!text-[14px]">{s.label}</button>)}
              </div>
              <label className="mt-4 flex items-center gap-4">
                <input type="range" min={8} max={150} step={1} value={q.m2} onChange={(e) => q.setM2(+e.target.value)} className="yrange flex-1" aria-label="Area in square metres" />
                <span className="w-[72px] text-right font-display text-[20px] font-[500] tabular-nums">{q.m2} m²</span>
              </label>
            </fieldset>
          </div>

          <div className="mt-10 border-t pt-7" style={{ borderColor: 'var(--line)' }}>
            <p className="text-[13px] font-semibold">Example range</p>
            <p className="mt-1 whitespace-nowrap font-display text-[clamp(40px,7vw,82px)] font-[420] leading-none tracking-[-.035em]">
              £<Ticker value={q.low} /> <span className="text-[.45em] italic" style={{ color: 'var(--muted)' }}>to</span> £<Ticker value={q.high} />
            </p>
            <p className="mt-3 text-[14px]" style={{ color: 'var(--muted)' }}>{EXAMPLE_LABEL}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-[18px]" style={{ aspectRatio: '4 / 3', background: '#140E02', boxShadow: '0 40px 70px -40px rgba(60,40,0,.6)' }}>
            {finishes.map((x) => (
              <img key={x.key} src={`/finish/${x.key}-view-640-v2.webp`} srcSet={`/finish/${x.key}-view-640-v2.webp 640w, /finish/${x.key}-view-1200-v2.webp 1200w`} sizes="(min-width: 900px) 600px, 100vw"
                alt={view === 'render' && x.key === f.key ? `Illustration of a ${x.name.toLowerCase()} ${x.mode === 'drive' ? 'resin-bound driveway' : 'floor'}` : ''} loading="lazy" decoding="async" width={1200} height={900}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: view === 'render' && x.key === f.key ? 1 : 0 }} />
            ))}
            {[...new Set(finishes.map((x) => x.photo))].map((ph) => (
              <img key={ph} src={photoSrc(ph, 1280)} srcSet={`${photoSrc(ph, 640)} 640w, ${photoSrc(ph, 1280)} 1280w`} sizes="(min-width: 900px) 600px, 100vw"
                alt={view === 'job' && ph === f.photo ? `A ${site.company} job in a similar finish` : ''} loading="lazy" decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: view === 'job' && ph === f.photo ? 1 : 0 }} />
            ))}
            <div className="absolute left-3 top-3 flex gap-1 rounded-full p-1" style={{ background: 'rgba(20,14,2,.72)', backdropFilter: 'blur(8px)' }} role="tablist" aria-label="Preview">
              {([['render', 'Your design'], ['job', `${site.owner.first}’s job`]] as const).map(([k, l]) => (
                <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)} className="h-8 rounded-full px-3 text-[12.5px] font-semibold transition-colors"
                  style={view === k ? { background: '#F3B31E', color: '#140E02' } : { color: '#F4EFE6' }}>{l}</button>
              ))}
            </div>
            <span className="absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[11.5px] font-semibold" style={{ background: 'rgba(20,14,2,.78)', color: '#F4EFE6' }}>
              {view === 'render' ? 'Illustration, example finish' : 'Similar finish, from his website'}
            </span>
          </div>

          <form className="grid gap-4 rounded-[18px] p-5 md:p-6" style={{ background: 'var(--surface)' }}
            onSubmit={(e) => { e.preventDefault(); window.open(waLink(q, who), '_blank', 'noopener'); }}>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="field"><span>Your name</span>
                <input className="inp" autoComplete="name" required value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} /></label>
              <label className="field"><span>Phone</span>
                <input className="inp" type="tel" autoComplete="tel" inputMode="tel" value={who.phone} onChange={(e) => setWho({ ...who, phone: e.target.value })} /></label>
              <label className="field"><span>Postcode</span>
                <input className="inp" autoComplete="postal-code" value={who.postcode} onChange={(e) => setWho({ ...who, postcode: e.target.value })} /></label>
            </div>
            <button className="btn btn-ink w-full"><WaIcon /> WhatsApp {site.owner.first} my design</button>
            <div className="grid grid-cols-2 gap-2">
              <a href={smsLink(q, who)} className="btn !h-12 !text-[15px]" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(20,14,2,.25)' }}>Text it instead</a>
              <a href={tel(site.mobile)} className="btn !h-12 !text-[15px]" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(20,14,2,.25)' }}>Call {site.owner.first}</a>
            </div>
            <p className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
              {`Sends “${q.service.long}, ${byKey(f.key).name}, ${sizeLabel(q)}” to ${site.mobile}. Nothing is stored on this website.`}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
