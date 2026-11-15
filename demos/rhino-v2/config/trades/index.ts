import { epoxy, type TradePack } from './epoxy';
import { microcement } from './microcement';
import { rhino } from './rhino';

// Every trade pack. site.trade picks one; ?trade=<key> overrides it on demo links.
export const trades: Record<string, TradePack> = { epoxy, microcement, rhino };
