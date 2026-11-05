import { BeamsBackground } from '@/components/library/beams-background/BeamsBackground';
export default function Demo() {
  return (
    <div className="relative h-[300px] overflow-hidden rounded-2xl">
      <BeamsBackground intensity="strong" className="!min-h-0 absolute inset-0">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[.16em]" style={{ color: 'var(--muted)' }}>Commercial &amp; showroom floors</p>
          <p className="mt-2 font-display text-[34px] font-semibold leading-none md:text-[44px]" style={{ color: 'var(--ink)' }}>Showroom-grade <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent2)' }}>gloss.</span></p>
        </div>
      </BeamsBackground>
    </div>
  );
}
