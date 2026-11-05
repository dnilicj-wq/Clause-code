import { useEffect, useRef, useState } from 'react';
import { CardStack } from '@/components/library/card-stack/CardStack';

const look = (k: string) => `/demo/look-${k}-v2.webp`;
const items = [
  { id: 1, title: 'Graphite flake', description: 'Example image · hides dust, adds grip', imageSrc: look('graphite-flake') },
  { id: 2, title: 'Copper metallic', description: 'Example image · swirled by hand', imageSrc: look('copper-metallic') },
  { id: 3, title: 'Pearl metallic', description: 'Example image · bright and reflective', imageSrc: look('pearl-metallic') },
  { id: 4, title: 'Midnight metallic', description: 'Example image · deep and glossy', imageSrc: look('midnight-metallic') },
  { id: 5, title: 'Storm grey solid', description: 'Example image · clean and simple', imageSrc: look('storm-solid') },
  { id: 6, title: 'Quartz sand', description: 'Example image · textured and hard-wearing', imageSrc: look('quartz-sand') },
];
export default function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect();
  }, []);
  const cw = Math.round(w < 500 ? w * 0.74 : Math.min(420, w * 0.62));
  return (
    <div ref={ref} className="overflow-hidden py-4">
      <CardStack items={items} cardWidth={cw} cardHeight={Math.round(cw * 0.66)} autoAdvance intervalMs={2600} spreadDeg={w < 500 ? 36 : 48} minStageHeight={w < 500 ? 0 : 380} />
    </div>
  );
}
