// benefit-illustrations: large cards, each a simple animated diagram of a REAL benefit of the material,
// a bold heading and 1–2 plain-English lines (from Proficient Essex "Rain drains through" / "No weeds in the joins").
// Only benefits true of the material, or claimed on the client's own site.
//
// render({ eyebrow?, heading?, lead?, items: [{ illo, title, text, props? }] })
// illo keys by trade (illos.mjs):
//   resin bound: drain, weeds, uv (only if the client's resin is UV-stable / they say so)
//   block paving: interlock, lift, edge
//   polished concrete / microcement: seamless, wipe, heat, floorwall
//   epoxy: tyre, bead, slip
//   porcelain: stain, slip, frost
import { illo } from '../sig-runtime/illos.mjs';
import { scene, hasScene } from '../sig-runtime/scenes.mjs';
// Each card is a dark stage scene (scenes.mjs) when one exists for the key; flat illos.mjs drawing otherwise.
// stage: shared scene props for every card (e.g. { night: true } or the client's resin colours).
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function render({ eyebrow, heading, lead, items = [], stage = {} } = {}) {
  if (!items.length) return '';
  return `<div class="sig sig-ben">${heading ? `<div class="sig-ben__head">${eyebrow ? `<span class="sig-eye">${esc(eyebrow)}</span>` : ''}<h2 class="sig-h sig-ben__h">${esc(heading)}</h2>${lead ? `<p class="sig-p">${esc(lead)}</p>` : ''}</div>` : ''}`
    + `<div class="sig-ben__grid" data-n="${items.length}">${items.map((it) => `<article class="sig-ben__card" data-sig-play>${hasScene(it.illo) ? `<div class="sig-stage sig-stage--wide">${scene(it.illo, { label: it.title, ...stage, ...(it.props || {}) })}</div>` : `<div class="sig-ben__art">${illo(it.illo, { label: it.title, ...(it.props || {}) })}</div>`}<h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`).join('')}</div></div>`;
}
