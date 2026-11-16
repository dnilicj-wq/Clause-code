import { HorizontalScrollCarousel } from '@/components/library/horizontal-scroll-carousel/HorizontalScrollCarousel';
import { ScrollBox } from '../text-demo-helpers';
import { AutoScroll } from '../auto-scroll';

const look = (k: string) => `/demo/look-${k}-v2.webp`;
const cards = [
  { id: 1, title: 'Flake', url: look('graphite-flake') },
  { id: 2, title: 'Metallic', url: look('copper-metallic') },
  { id: 3, title: 'Pearl', url: look('pearl-metallic') },
  { id: 4, title: 'Midnight', url: look('midnight-metallic') },
  { id: 5, title: 'Solid', url: look('storm-solid') },
  { id: 6, title: 'Quartz', url: look('quartz-sand') },
];
export default function Demo() {
  return (
    <ScrollBox h={340}>
      {(ref) => (
        <>
          <AutoScroll target={ref} speed={1.2} />
          <HorizontalScrollCarousel cards={cards} scroller={ref} height="1100px" stage="340px" cardSize="260px" endX="-78%" label="Example images" />
        </>
      )}
    </ScrollBox>
  );
}
