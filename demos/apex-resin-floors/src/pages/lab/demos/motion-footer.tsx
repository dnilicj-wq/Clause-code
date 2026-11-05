import { useSite } from '@/src/lib/ctx';
import { footerData } from '@/components/library/large-name-footer/footer-data';
import { MotionFooter } from '@/components/library/motion-footer/MotionFooter';
// Contained mode: the curtain-reveal footer runs inside the card instead of the viewport.
export default function Demo() {
  const { site, trade } = useSite();
  return <div className="-m-5 h-[560px] overflow-hidden"><MotionFooter contained data={footerData(site, trade)} /></div>;
}
