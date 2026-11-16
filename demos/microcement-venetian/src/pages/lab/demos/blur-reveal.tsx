import { BlurReveal } from '@/components/library/blur-reveal/BlurReveal';
import { Replay } from '../text-demo-helpers';
export default function Demo() {
  const words = 'A floor that looks poured yesterday, ten years from now.'.split(' ');
  return (
    <Replay className="py-6">
      {(k) => (
        <h3 key={k} className="font-display text-[clamp(30px,5vw,48px)] font-semibold leading-[1.05] tracking-[-.025em]">
          {words.map((w, i) => <BlurReveal key={i} delay={0.08 * i} duration={0.8} className="mr-[.25em]">{w}</BlurReveal>)}
        </h3>
      )}
    </Replay>
  );
}
