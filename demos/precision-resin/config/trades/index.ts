import { type TradePack } from './epoxy';
import { precision } from './precision-resin';

// Every trade pack. site.trade picks one; ?trade=<key> overrides it on demo links.
export const trades: Record<string, TradePack> = { precision };
