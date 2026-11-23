import { useSite } from '@/src/lib/ctx';
import { footerData } from '@/components/library/large-name-footer/footer-data';
import { LargeNameFooter } from '@/components/library/large-name-footer/LargeNameFooter';
export default function Demo() {
  const { site, trade } = useSite();
  return <div className="-m-5 overflow-hidden"><LargeNameFooter data={footerData(site, trade)} /></div>;
}
