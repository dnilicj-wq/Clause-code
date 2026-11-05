// Port of Large Name Footer (Spectrum UI / 21st.dev @arihantcodes_1f7b8c4d, MIT). Same layout: brand block with a
// secondary button and copyright on the left, link columns on the right, giant gradient wordmark underneath.
// Re-skinned to preset tokens. Content swapped for trade facts (Pages→Services, Socials only if the business has
// them, Legal→Contact/Areas). Icons supplied locally (./icons). next/link → <a>. shadcn Button → token pill.
import type { FooterData } from './footer-data';
import { Icons } from './icons';
import { Phone } from 'lucide-react';

const linkCls = 'transition-colors text-[var(--muted)] hover:text-[var(--ink)]';

export function LargeNameFooter({ data, ctaHref = '#price', ctaLabel = 'Get your price', wordmark }: {
  data: FooterData; ctaHref?: string; ctaLabel?: string; wordmark?: string;
}) {
  const cols: { title: string; items: { label: string; href?: string }[] }[] = [
    { title: 'Services', items: data.services.slice(0, 5).map((s) => ({ label: s, href: '#services' })) },
    { title: 'Contact', items: [{ label: data.phone, href: data.tel }, { label: 'WhatsApp', href: data.whatsapp }, ...(data.email ? [{ label: data.email, href: `mailto:${data.email}` }] : []), { label: data.hours }] },
    { title: 'Areas', items: data.areas.slice(0, 5).map((a) => ({ label: a })) },
    ...(data.socials.length ? [{ title: 'Socials', items: data.socials.map((s) => ({ label: s.label, href: s.href })) }] : []),
  ];
  return (
    <footer className="px-4 py-12 md:px-6" style={{ containerType: 'inline-size', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="mb-8 md:mb-0">
            <a href="#top" className="flex items-center gap-2">
              <Icons.logo className="w-8" />
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>{data.company}</h2>
            </a>
            <p className="mt-4" style={{ color: 'var(--muted)' }}>
              {data.tagline} in <span style={{ color: 'var(--accent)' }}>{data.town}</span> and across {data.region}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={ctaHref} className="inline-flex h-10 items-center rounded-[calc(var(--radius)*.5)] px-4 text-sm font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>{ctaLabel}</a>
              <a href={data.tel} className="inline-flex h-10 items-center gap-1.5 rounded-[calc(var(--radius)*.5)] px-4 text-sm font-medium" style={{ border: '1px solid var(--line)' }}><Phone className="w-3.5" /> Call</a>
            </div>
            <p className="mt-5 text-sm" style={{ color: 'var(--muted)' }}>© {data.year} {data.company}. All rights reserved.</p>
            {data.demoNote && <p className="mt-1 max-w-xs text-xs" style={{ color: 'var(--muted)', opacity: 0.75 }}>{data.demoNote}</p>}
          </div>
          <div className={`grid grid-cols-2 gap-8 ${cols.length > 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {cols.map((c) => (
              <div key={c.title}>
                <h3 className="mb-4 font-semibold">{c.title}</h3>
                <ul className="space-y-2 text-sm">
                  {c.items.map((it, i) => <li key={i}>{it.href ? <a href={it.href} className={linkCls}>{it.label}</a> : <span style={{ color: 'var(--muted)' }}>{it.label}</span>}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex w-full items-center justify-center">
          <p aria-hidden className="select-none text-center font-bold"
            style={{ fontSize: 'clamp(48px, 18cqw, 10rem)', fontFamily: 'var(--font-display)', letterSpacing: '-.04em', lineHeight: 1, backgroundImage: 'linear-gradient(to bottom, color-mix(in srgb, var(--ink) 34%, transparent), color-mix(in srgb, var(--ink) 6%, transparent))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            {wordmark ?? data.shortName}
          </p>
        </div>
      </div>
    </footer>
  );
}
