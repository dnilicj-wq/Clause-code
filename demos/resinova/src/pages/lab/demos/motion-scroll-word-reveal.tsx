import { ScrollWordReveal } from '@/components/library/motion-scroll-word-reveal/ScrollWordReveal';
import { ScrollBox } from '../text-demo-helpers';
export default function Demo() {
  return (
    <ScrollBox h={300}>
      {(ref) => (
        <div className="px-4 pt-[110px] pb-[260px]">
          <ScrollWordReveal container={ref} accentWords={['seamless', 'price']} className="text-[clamp(30px,5vw,46px)]"
            text="One seamless floor. No grout lines, no dust, and your price before you give us a phone number." />
        </div>
      )}
    </ScrollBox>
  );
}
