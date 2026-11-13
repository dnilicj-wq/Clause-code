// Where static assets live. The demo serves them from the site root; the WordPress plugin sets
// window.AAS_CFG.base to its assets folder, and the WhatsApp number / lead endpoint from Settings → AAS Landing.
type Cfg = { base?: string; wa?: string; tel?: string; endpoint?: string; editor?: boolean };
export const CFG: Cfg = (window as any).AAS_CFG || {};
export const asset = (p: string) => (CFG.base || '') + p;
