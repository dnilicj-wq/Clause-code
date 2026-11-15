import { site } from '@/config/site';

// Area pages: /driveways-<town> for the towns their own site or testimonials name (site.areas). Same page, local hero.
export const areaSlug = (t: string) => `/driveways-${t.toLowerCase()}`;
export function areaFromPath(path = typeof location === 'undefined' ? '/' : location.pathname) {
  return site.areas.find((t) => areaSlug(t) === path.replace(/\/$/, '').toLowerCase()) || '';
}
export const useArea = () => areaFromPath();
