import { LoopingWords } from '@/components/library/looping-words/LoopingWords';
export default function Demo() {
  return (
    <div className="py-4 text-center">
      <p className="eyebrow">Resin floors for</p>
      <LoopingWords words={['Garages', 'Kitchens', 'Showrooms', 'Workshops', 'Gyms', 'Salons']} className="mx-auto mt-2 max-w-[520px]" style={{ fontSize: 'clamp(40px, 8vw, 72px)', ['--lw-bg' as any]: 'var(--bg)' }} />
    </div>
  );
}
