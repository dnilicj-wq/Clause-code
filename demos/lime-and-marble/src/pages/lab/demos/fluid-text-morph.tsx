import { FluidTextMorph } from '@/components/library/fluid-text-morph/FluidTextMorph';
export default function Demo() {
  return (
    <div className="grid min-h-[220px] place-items-center text-center">
      <div>
        <FluidTextMorph wordPairs={[['Dusty', 'Glossy'], ['Cracked', 'Sealed'], ['Grey', 'Copper']]} auto={1800} className="text-[clamp(56px,10vw,104px)] tracking-[-.03em]" />
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Hover to morph, tap for the next pair. Auto-plays on phones.</p>
      </div>
    </div>
  );
}
