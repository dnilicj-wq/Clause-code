import { ReadingTextReveal } from '@/components/library/reading-text-reveal/ReadingTextReveal';
import { ScrollBox } from '../text-demo-helpers';
export default function Demo() {
  return (
    <ScrollBox h={320}>
      {(ref) => (
        <div className="px-4 pt-36 pb-56">
          <ReadingTextReveal container={ref} pClassName="!text-[28px] md:!text-[34px]" segments={[
            'Day one, we grind the old surface back to sound concrete.',
            'We fill the cracks, prime it, and lay the base coat.',
            'Day two, the finish goes on: flake, metallic or solid.',
            'Then a clear topcoat, and you can walk on it the next day.',
          ]} />
        </div>
      )}
    </ScrollBox>
  );
}
