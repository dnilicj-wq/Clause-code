import RuixenBentoCards from '@/components/library/ruixen-bento-cards/RuixenBentoCards';
import { FitWidth } from '@/components/library/_shared/FitWidth';

export default function Demo() {
  return (
    <FitWidth width={1100}>
      <RuixenBentoCards
        cards={[
          { title: 'Metallic', description: 'Pigment swirled through the base by hand. Every floor is one of a kind.', img: '/demo/look-copper-metallic-v2.webp' },
          { title: 'Flake', description: 'Coloured flakes broadcast into the base. Hides dust, adds grip.', img: '/demo/look-graphite-flake-v2.webp' },
          { title: 'Quartz', description: 'Coloured quartz in clear resin. A hard-wearing, textured finish for busy floors.' },
          { title: 'Solid colour', description: 'One clean colour, sealed. Simple and easy to keep clean.' },
          { title: 'Anti-slip', description: 'Grit in the topcoat where floors get wet.' },
        ]}
        heading={<>Every finish. <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic', color: 'var(--accent2)' }}>One proper system.</span></>}
        text="Every finish goes on the same way: ground, primed and built up in coats, then sealed."
      />
    </FitWidth>
  );
}
