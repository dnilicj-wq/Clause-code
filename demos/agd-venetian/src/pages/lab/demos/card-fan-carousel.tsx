import CardFanCarousel from '@/components/library/card-fan-carousel/CardFanCarousel';

const look = (k: string) => `/demo/look-${k}-v2.webp`;
const cards = [
  { imgUrl: look('graphite-flake'), label: 'Graphite flake' },
  { imgUrl: look('copper-metallic'), label: 'Copper metallic' },
  { imgUrl: look('pearl-metallic'), label: 'Pearl metallic' },
  { imgUrl: look('midnight-metallic'), label: 'Midnight metallic' },
  { imgUrl: look('storm-solid'), label: 'Storm grey solid' },
  { imgUrl: look('quartz-sand'), label: 'Quartz sand' },
  { imgUrl: '/demo/tex-flake-v1.webp', label: 'Flake close-up' },
  { imgUrl: '/demo/tex-base-v1.webp', label: 'Solid base coat' },
];
export default function Demo() {
  return (
    <div className="relative">
      <span className="ex-tag left-0 top-0">Example images</span>
      <CardFanCarousel cards={cards.map((c) => ({ ...c, alt: c.label }))} />
    </div>
  );
}
