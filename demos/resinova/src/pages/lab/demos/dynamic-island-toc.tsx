import { useRef } from 'react';
import { DynamicIslandTOC } from '@/components/library/dynamic-island-toc/DynamicIslandTOC';
import { AutoScroll } from '../auto-scroll';

const sections = [
  ['What goes into a floor', 'Five layers, each bonded to the last. Skip one and the floor fails early.'],
  ['Testing the slab', 'Damp concrete pushes coatings off, so we test moisture before we quote.'],
  ['Grinding and repairs', 'Diamond grinding opens the surface; cracks are filled and levelled.'],
  ['Choosing a finish', 'Flake, metallic, quartz or solid colour. Samples on the survey.'],
  ['Curing and aftercare', 'Light foot traffic usually after a day; cars after a few. Your survey confirms it.'],
];
export default function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-[360px] overflow-hidden rounded-xl border border-line">
      <div ref={ref} className="h-full overflow-y-auto px-6 pb-40 pt-6" style={{ overscrollBehavior: 'contain' }}>
        <AutoScroll target={ref} speed={0.8} />
        <article className="prose max-w-none">
          {sections.map(([h, p]) => (
            <section key={h} className="mb-10">
              <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{h}</h2>
              <p className="mt-2 text-muted">{p}</p>
              <div className="mt-4 h-28 rounded-lg bg-bg2" />
            </section>
          ))}
        </article>
      </div>
      <DynamicIslandTOC scroller={ref} contained selector="article h2" />
    </div>
  );
}
