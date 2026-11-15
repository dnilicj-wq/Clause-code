// guarantee-stack: big dark glass cards with a serif heading; a thin accent light runs along each
// card's bottom border as you scroll (from the master template: No deposit / 10-year warranty / Fixed price / Insured).
// ONLY promises the client really makes. Fewer than 2 → render nothing (leave the section out).
//
// render({ eyebrow?, heading?, items: [{ title, text, source }] })
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function render({ eyebrow, heading, items = [] } = {}) {
  if (items.length < 2) return '';
  return `<div class="sig sig-gs">${heading ? `<div class="sig-gs__head">${eyebrow ? `<span class="sig-eye">${esc(eyebrow)}</span>` : ''}<h2 class="sig-h sig-gs__h">${esc(heading)}</h2></div>` : ''}`
    + `<div class="sig-gs__grid" data-n="${items.length}">${items.map((it, i) => `<article class="sig-gs__card" data-sig-scroll data-a=".98" data-b=".45"><span class="sig-gs__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3 class="sig-h">${esc(it.title)}</h3><p>${esc(it.text)}</p><i class="sig-gs__beam" aria-hidden="true"></i></article>`).join('')}</div></div>`;
}
