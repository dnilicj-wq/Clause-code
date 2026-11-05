import FlowArt, { FlowSection } from '@/components/library/story-scroll/StoryScroll';
import { ScrollBox } from '../text-demo-helpers';
import { AutoScroll } from '../auto-scroll';

const steps = [
  { n: '01', t: 'Grind', d: 'Diamond grinding opens the slab so the resin can grip.', img: '/demo/tex-slab-v1.webp' },
  { n: '02', t: 'Prime', d: 'A penetrating primer soaks in and seals the concrete.', img: '/demo/tex-primer-v1.webp' },
  { n: '03', t: 'Build', d: 'The base coat goes on, with flake or metallic worked in.', img: '/demo/tex-flake-v1.webp' },
  { n: '04', t: 'Seal', d: 'A clear topcoat locks it all in. Then it cures.', img: '/demo/tex-top-v1.webp' },
];
export default function Demo() {
  return (
    <ScrollBox h={340}>
      {(ref) => (
        <>
          <AutoScroll target={ref} speed={1.2} />
          <FlowArt scroller={ref}>
            {steps.map((s) => (
              <FlowSection key={s.n} height="340px" aria-label={s.t} className="text-white" style={{ background: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.65)), url(${s.img}) center/cover` }}>
                <div className="flex items-start justify-between">
                  <span className="text-[13px] uppercase tracking-[.18em] opacity-80">Step {s.n} of 04</span>
                  <span className="rounded-full bg-black/45 px-2 py-1 text-[10px] uppercase tracking-wider">Rendered texture</span>
                </div>
                <div>
                  <h3 className="text-[clamp(48px,10vw,84px)] font-semibold leading-[.9] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{s.t}</h3>
                  <p className="mt-3 max-w-[34ch] text-[15px] text-white/85">{s.d}</p>
                </div>
              </FlowSection>
            ))}
          </FlowArt>
        </>
      )}
    </ScrollBox>
  );
}
