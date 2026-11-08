import { useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { blends, sizes, surfaces } from '@/config/driveway';
import { photoSrc } from '@/config/content';
import { Ticker } from '../lite';
import { useQuote, waLink, smsLink, EXAMPLE_LABEL, sizeLabel } from '../quote';
import { WaIcon } from '../Hero';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

// Act four: the one colour-block on the page. Size, surface, price, then straight to Gerald on WhatsApp.
export function Price() {
  const { site } = useSite();
  const q = useQuote();
  const [who, setWho] = useState({ name: '', postcode: '' });
  const resin = q.surface.key === 'resin';

  return (
    <section id="price" aria-labelledby="priceH" className="theme-yellow relative py-20 md:py-28" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 md:grid-cols-[1.05fr_1fr] md:gap-14 md:px-12">
        <div>
          <h2 id="priceH" className="d-l">Price your drive.</h2>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed" style={{ color: 'var(--muted)' }}>Pick a size and a surface. When it looks right, it goes to {site.owner.first} on WhatsApp with everything filled in.</p>

          <div className="mt-9 grid gap-7">
            <fieldset>
              <legend className="mb-3 text-[13px] font-semibold">Size</legend>
              <div className="seg">
                {sizes.map((s) => <button type="button" key={s.key} aria-pressed={q.sizeKey === s.key} onClick={() => q.setSize(s.key)}>{s.label}</button>)}
              </div>
              <label className="mt-4 flex items-center gap-4">
                <input type="range" min={10} max={150} step={1} value={q.m2} onChange={(e) => q.setM2(+e.target.value)} className="yrange flex-1" aria-label="Driveway area in square metres" />
                <span className="w-[72px] text-right font-display text-[18px] font-semibold tabular-nums">{q.m2} m²</span>
              </label>
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-[13px] font-semibold">Surface</legend>
              <div className="seg">
                {surfaces.map((x) => <button type="button" key={x.key} aria-pressed={q.surface.key === x.key} onClick={() => q.setSurface(x.key)}>{x.label}</button>)}
              </div>
              {resin && (
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  {blends.map((b) => (
                    <button type="button" key={b.key} onClick={() => q.setBlend(b.key)} aria-label={`${b.name} (example blend)`} aria-pressed={q.blend.key === b.key}
                      className="h-11 w-11 rounded-full bg-cover transition-transform duration-150 active:scale-95"
                      style={{ backgroundImage: `url(/blends/${b.key}-160-v1.webp)`, boxShadow: q.blend.key === b.key ? '0 0 0 3px #F4C21B, 0 0 0 5px #121315' : 'inset 0 0 0 1px rgba(0,0,0,.2)' }} />
                  ))}
                  <span className="ml-1 text-[14px] font-medium">{q.blend.name}</span>
                </div>
              )}
            </fieldset>
          </div>

          <div className="mt-10 border-t pt-7" style={{ borderColor: 'var(--line)' }}>
            <p className="text-[13px] font-semibold">Example range</p>
            <p className="mt-1 whitespace-nowrap font-display text-[clamp(40px,7vw,80px)] font-semibold leading-none tracking-[-.035em]">
              £<Ticker value={q.low} /> <span className="text-[.5em] font-medium" style={{ color: 'var(--muted)' }}>to</span> £<Ticker value={q.high} />
            </p>
            <p className="mt-3 text-[14px]" style={{ color: 'var(--muted)' }}>{EXAMPLE_LABEL}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-[14px]" style={{ aspectRatio: '4 / 3', background: '#121315', boxShadow: '0 40px 70px -40px rgba(60,40,0,.6)' }}>
            {surfaces.filter((x) => x.key !== 'resin').map((x) => (
              <img key={x.key} src={x.photo ? photoSrc(x.photo, 1280) : `/types/${x.key}-view-v2.webp`} alt={x.key === q.surface.key ? (x.photo ? `${x.long} by ${site.company}` : `Illustration of a ${x.long.toLowerCase()}`) : ''}
                loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: x.key === q.surface.key ? 1 : 0 }} />
            ))}
            {blends.map((b) => (
              <img key={b.key} src={`/blends/${b.key}-view-640-v1.webp`} srcSet={`/blends/${b.key}-view-640-v1.webp 640w, /blends/${b.key}-view-1200-v1.webp 1200w`} sizes="(min-width: 900px) 600px, 100vw"
                alt={resin && b.key === q.blend.key ? `Illustration of a resin-bound driveway in the ${b.name} example blend` : ''} loading="lazy" decoding="async" width={1200} height={900}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: resin && b.key === q.blend.key ? 1 : 0, filter: 'brightness(1.1)' }} />
            ))}
            <span className="absolute left-3 top-3 rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: 'rgba(18,19,21,.78)', color: '#ECECE8' }}>
              {resin ? 'Example blend, illustration' : q.surface.photo ? `${site.owner.first}’s job` : 'Illustration'}
            </span>
          </div>

          <form className="grid gap-4 rounded-[14px] p-5 md:p-6" style={{ background: 'var(--surface)' }}
            onSubmit={(e) => { e.preventDefault(); window.open(waLink(q, who), '_blank', 'noopener'); }}>
            <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
              <label className="field"><span>Your name <i className="font-normal not-italic" style={{ color: 'var(--muted)' }}>(optional)</i></span>
                <input className="inp" autoComplete="name" value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} /></label>
              <label className="field"><span>Postcode <i className="font-normal not-italic" style={{ color: 'var(--muted)' }}>(optional)</i></span>
                <input className="inp" autoComplete="postal-code" value={who.postcode} onChange={(e) => setWho({ ...who, postcode: e.target.value })} /></label>
            </div>
            <button className="btn btn-ink w-full"><WaIcon /> WhatsApp {site.owner.first} your design</button>
            <div className="grid grid-cols-2 gap-2">
              <a href={smsLink(q, who)} className="btn !h-12 !text-[15px]" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(18,19,21,.25)' }}>Text it instead</a>
              <a href={tel(site.phone)} className="btn !h-12 !text-[15px]" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(18,19,21,.25)' }}>{`Call ${site.phone}`}</a>
            </div>
            <p className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
              {`Sends “${sizeLabel(q)}, ${q.surface.long.toLowerCase()}${resin ? `, ${q.blend.name}` : ''}” to ${site.mobile}. Nothing is stored on this website.`}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
