import { useSite } from '@/src/lib/ctx';
import { footerData } from '@/components/library/large-name-footer/footer-data';
import { HalftoneWordmarkFooter } from '@/components/library/halftone-wordmark-footer/HalftoneWordmarkFooter';
export default function Demo() {
  const { site, trade } = useSite();
  return <div className="-m-5 overflow-hidden"><HalftoneWordmarkFooter data={footerData(site, trade)} /></div>;
}
