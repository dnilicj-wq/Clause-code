import { LiquidCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/library/liquid-glass-card/LiquidGlassCard';

const cards = [
  { img: '/demo/look-copper-metallic-v2.webp', title: 'Copper metallic', text: 'Swirled by hand, so no two floors match.' },
  { img: '/demo/look-graphite-flake-v2.webp', title: 'Graphite flake', text: 'Hides dust and gives grip underfoot.' },
];
export default function Demo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((c) => (
        <div key={c.title} className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl p-4" style={{ backgroundImage: `url(${c.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <span className="ex-tag right-3 top-3">Example image</span>
          <LiquidCard tone="dark" className="gap-3 py-5 text-white [text-shadow:0_1px_12px_rgba(0,0,0,.55)]">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{c.title}</CardTitle>
              <CardDescription className="!text-white/90">{c.text}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-white/85">From the finish lookbook</CardContent>
          </LiquidCard>
        </div>
      ))}
    </div>
  );
}
