import { TextReveal } from '@/components/library/text-reveal/TextReveal';
import { ScrollBox } from '../text-demo-helpers';
import { AutoScroll } from '../auto-scroll';
export default function Demo() {
  return (
    <ScrollBox h={300}>
      {(ref) => <><AutoScroll target={ref as any} speed={1.1} /><TextReveal container={ref as any} className="!h-[900px] [&>div]:!py-6 [&_p]:!text-[26px] md:[&_p]:!text-[34px] [&_p]:![font-family:var(--font-display)] [&_p]:!tracking-tight">Every floor starts with the slab. We test it, repair it, then pour a system built to stay down.</TextReveal></>}
    </ScrollBox>
  );
}
