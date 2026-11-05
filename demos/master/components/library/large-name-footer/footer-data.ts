// Shared footer facts for every footer in the library. Reads only config/site.ts + the trade pack,
// so nothing is invented: socials/email only show when the business has them.
import type { Site } from '@/config/site';
import type { TradePack } from '@/config/trades/epoxy';

export type FooterData = {
  company: string; shortName: string; town: string; region: string;
  phone: string; tel: string; whatsapp: string; email?: string; hours: string;
  areas: string[]; services: string[];
  socials: { label: string; href: string }[];
  demoNote?: string; year: number;
};

export function footerData(site: Site, trade: TradePack): FooterData {
  const socials = Object.entries(site.socials || {}).filter(([, v]) => !!v).map(([k, v]) => ({ label: k[0].toUpperCase() + k.slice(1), href: v as string }));
  return {
    company: site.company, shortName: site.shortName, town: site.town, region: site.region,
    phone: site.phone, tel: `tel:${site.phone.replace(/\s/g, '')}`, whatsapp: `https://wa.me/${site.whatsapp}`,
    email: site.email && !site.email.endsWith('@example.com') ? site.email : undefined,
    hours: site.hours, areas: site.areas, services: trade.services.slice(0, 6), socials,
    demoNote: site.demo ? 'Demo site by Clientgateway. Images labelled "Example" are placeholders.' : undefined,
    year: new Date().getFullYear(),
  };
}
