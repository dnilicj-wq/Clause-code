import { StickyScrollCards, type StickyCard } from '@/components/library/sticky-scroll-cards/StickyScrollCards';
import { ScrollBox } from '../text-demo-helpers';

const cards: StickyCard[] = [
  { kicker: '01', title: 'Ground slab', description: 'Diamond ground to open the concrete, cracks and holes repaired, dust vacuumed off.', image: '/demo/tex-slab-v1.webp', tag: 'Rendered texture' },
  { kicker: '02', title: 'Primer', description: 'Soaks into the slab and seals it, so the coats above have something to grip.', image: '/demo/tex-primer-v1.webp', tag: 'Rendered texture' },
  { kicker: '03', title: 'Base coat', description: 'The colour and the thickness. This is the layer that takes the knocks.', image: '/demo/tex-base-v1.webp', tag: 'Rendered texture' },
  { kicker: '04', title: 'Flake or metallic', description: 'Broadcast flake or a hand-worked metallic: the look you chose.', image: '/demo/tex-flake-v1.webp', tag: 'Rendered texture' },
  { kicker: '05', title: 'Topcoat', description: 'A clear, hard-wearing seal on top. Spills wipe off and it cleans like a worktop.', image: '/demo/tex-top-v1.webp', tag: 'Rendered texture' },
];
export default function Demo() {
  return (
    <ScrollBox h={440}>
      {(ref) => (
        <div className="[&_section]:!py-10 [&_.mb-12]:!mb-8 [&_h2]:!text-[30px]">
          <StickyScrollCards container={ref} top={14} heading="Five layers. Skip one and it fails." intro="Each card slides over the last, the same way the coats go down." cards={cards} />
        </div>
      )}
    </ScrollBox>
  );
}
