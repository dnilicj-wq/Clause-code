import { InfiniteSlider } from '@/components/library/infinite-slider/InfiniteSlider';
const looks = ['graphite-flake', 'copper-metallic', 'pearl-metallic', 'midnight-metallic', 'storm-solid', 'quartz-sand'];
const names: Record<string, string> = { 'graphite-flake': 'Graphite flake', 'copper-metallic': 'Copper metallic', 'pearl-metallic': 'Pearl metallic', 'midnight-metallic': 'Midnight metallic', 'storm-solid': 'Storm grey solid', 'quartz-sand': 'Quartz sand' };
// Finish swatches drifting past; hover slows it right down. Rendered example finishes.
export default function SliderDemo() {
  return (
    <div className="space-y-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      {[false, true].map((rev) => (
        <InfiniteSlider key={String(rev)} gap={12} duration={rev ? 34 : 28} durationOnHover={90} reverse={rev}>
          {(rev ? [...looks].reverse() : looks).map((k) => (
            <figure key={k} className="relative h-[96px] w-[150px] overflow-hidden rounded-[calc(var(--radius)*.6)] border" style={{ borderColor: 'var(--line)' }}>
              <img src={`/demo/look-${k}-v2.webp`} alt="" className="h-full w-full object-cover" loading="lazy" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-1.5 pt-5 text-[11.5px] font-medium text-white">{names[k]}</figcaption>
            </figure>
          ))}
        </InfiniteSlider>
      ))}
      <p className="text-center text-[11px]" style={{ color: 'var(--muted)' }}>Example finishes (rendered)</p>
    </div>
  );
}
