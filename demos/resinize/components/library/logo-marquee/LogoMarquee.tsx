// Logo Marquee — rebuilt; original source not reachable (21st.dev/@grootstudio/components/logo-marquee is not in the free catalogue copy).
// Pattern: a heading over an edge-faded, infinitely scrolling row of brand marks that slows on hover (built on InfiniteSlider).
// Honesty: only for material brands the business is VERIFIED to use. With no `brands`, it shows labelled placeholder tiles.
import { InfiniteSlider } from '@/components/library/infinite-slider/InfiniteSlider';

export type Brand = { name: string; logo?: string };

export function LogoMarquee({ title = 'Materials we lay', brands, note }: { title?: string; brands?: Brand[]; note?: string }) {
  const placeholder = !brands?.length;
  const list: Brand[] = placeholder ? Array.from({ length: 6 }, (_, i) => ({ name: `Material brand ${i + 1}` })) : brands!;
  return (
    <div className="w-full">
      <p className="text-center text-[13px] uppercase tracking-[.16em]" style={{ color: 'var(--muted)' }}>{title}</p>
      <div className="relative mt-6 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
        <InfiniteSlider gap={44} duration={30} durationOnHover={70}>
          {list.map((b, i) => b.logo ? (
            <img key={i} src={b.logo} alt={`${b.name} logo`} className="h-7 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
          ) : (
            <span key={i} className="flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium" style={{ borderColor: 'var(--line)', color: 'var(--muted)', borderStyle: placeholder ? 'dashed' : 'solid' }}>
              <span className="h-4 w-4 rounded-[4px]" style={{ background: 'linear-gradient(135deg, var(--metal2), var(--metal1))', opacity: 0.6 }} />{b.name}
            </span>
          ))}
        </InfiniteSlider>
      </div>
      {(placeholder || note) && <p className="mt-4 text-center text-[11.5px]" style={{ color: 'var(--muted)' }}>{note ?? 'Placeholder tiles. Only brands the business is verified to use go here.'}</p>}
    </div>
  );
}
export default LogoMarquee;
