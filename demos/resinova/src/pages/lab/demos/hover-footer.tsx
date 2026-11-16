import { useSite } from '@/src/lib/ctx';
import { footerData } from '@/components/library/large-name-footer/footer-data';
import { HoverFooter } from '@/components/library/hover-footer/HoverFooter';
export default function Demo() {
  const { site, trade } = useSite();
  return <div className="-m-5"><HoverFooter data={footerData(site, trade)} className="!m-2" /></div>;
}
