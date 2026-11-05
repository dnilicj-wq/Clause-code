import { useCallback, useRef } from 'react';
import { HeroScrub } from '@/components/library/hero-scrub/HeroScrub';

const frameUrl = (i: number) => `/demo/scrub/pour-${String(i).padStart(2, '0')}-v1.webp`;

// Runs inside its own scroll box here; on a page it scrubs with the window.
export default function Demo() {
  const box = useRef<HTMLDivElement>(null);
  const scroller = useCallback(() => box.current, []);
  return (
    <div className="relative">
      <div ref={box} className="h-[260px] overflow-y-auto overscroll-contain rounded-[calc(var(--radius)*.6)]" style={{ scrollbarWidth: 'none' }}>
        <HeroScrub frameCount={32} frameUrl={frameUrl} titleTop="Bare slab" titleBottom="to gloss" scroller={scroller} stageHeight="260px" defaultAspect={800 / 356} />
      </div>
      <span className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">Scroll inside ↓ · Illustration</span>
    </div>
  );
}
