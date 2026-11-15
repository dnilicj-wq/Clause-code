// proof-tiles: 2×3 grid of tiles, each a small live illustration over a serif heading
// (from the master template: "…what it looks like, live." moisture gauge, hot tyre, UV, timeline, warranty, 0 deposit).
// Tailor all 6 to the client: only promises they actually make (warranty length, deposit, install time,
// insurance, survey). No claim to support a tile → use a material-benefit tile instead. Never invent a promise.
// Stays a 2-column grid on phones (it must not read as an icon list).
//
// render({ eyebrow?, heading?, lead?, items: [{ illo, title, text?, props? }] })  (6 items)
import { illo } from '../sig-runtime/illos.mjs';
import { scene, hasScene } from '../sig-runtime/scenes.mjs';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function render({ eyebrow, heading, lead, items = [], stage = {} } = {}) {
  if (!items.length) return '';
  return `<div class="sig sig-pt">${heading ? `<div class="sig-pt__head">${eyebrow ? `<span class="sig-eye">${esc(eyebrow)}</span>` : ''}<h2 class="sig-h sig-pt__h">${esc(heading)}</h2>${lead ? `<p class="sig-p">${esc(lead)}</p>` : ''}</div>` : ''}`
    + `<div class="sig-pt__grid">${items.map((it) => `<article class="sig-pt__tile" data-sig-play>${hasScene(it.illo) ? `<div class="sig-stage sig-stage--tile">${scene(it.illo, { label: it.title, ...stage, ...(it.props || {}) })}</div>` : `<div class="sig-pt__art">${illo(it.illo, { label: it.title, ...(it.props || {}) })}</div>`}<h3 class="sig-h">${esc(it.title)}</h3>${it.text ? `<p>${esc(it.text)}</p>` : ''}</article>`).join('')}</div></div>`;
}
