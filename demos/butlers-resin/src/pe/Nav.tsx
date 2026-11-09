import { useSite } from '@/src/lib/ctx';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

// Solid, blurred bar from the first frame: page content never shows through or runs under the logo.
export function Nav() {
  const { site } = useSite();
  const links: [string, string][] = [['Before & after', '#before-after'], ['Our work', '#work'], ['Reviews', '#reviews'], ['Areas', '#areas']];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)]" data-nopour
      style={{ background: 'rgba(11,15,21,.9)', borderColor: 'rgba(169,195,227,.12)', backdropFilter: 'blur(16px) saturate(140%)', WebkitBackdropFilter: 'blur(16px) saturate(140%)' }}>
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-4 md:px-12">
        <a href="#top" className="flex shrink-0 items-center" aria-label={`${site.company}, back to top`}>
          <img src="/brand/logo-v1.svg" alt={site.company} width={520} height={150} className="block h-[34px] w-auto md:h-[40px]" />
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map(([l, h]) => <a key={h} href={h} className="rounded-full px-3.5 py-2 text-[14px] transition-colors hover:bg-white/10" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{l}</a>)}
        </div>
        <div className="flex items-center gap-2">
          <a href={tel(site.phone)} aria-label={`Call ${site.phone}`} className="press flex h-10 items-center justify-center rounded-full px-3 text-[14px] font-medium sm:px-4" style={{ color: 'color-mix(in srgb, var(--ink) 88%, transparent)', border: '1px solid var(--line)' }}>
            <svg className="sm:hidden" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
            <span className="hidden sm:inline">{site.phone}</span>
          </a>
          <a href="#survey" className="btn-gold press flex h-10 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-semibold">Book free survey</a>
        </div>
      </nav>
    </header>
  );
}
