// step-rail: numbered circles on a vertical line whose fill follows scroll (from Newpave "How it works").
// Each circle fills with the accent as the line reaches it; its text fades up at the same moment.
// Steps must be the client's own process. With none stated, use the neutral
// survey → written quote → install → handover, and never add aftercare they don't offer.
//
// render({ eyebrow?, heading, lead?, steps: [{ title, text }] })
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const NEUTRAL_STEPS = [
  { title: 'Survey', text: 'We look at the space, measure up and talk through what you want.' },
  { title: 'Written quote', text: 'You get the price in writing before any work is booked.' },
  { title: 'Install', text: 'The job is done by the team.' },
  { title: 'Handover', text: 'We go over the finished job with you.' },
];
export function render({ eyebrow = 'How it works', heading, lead, steps = NEUTRAL_STEPS, id } = {}) {
  const n = steps.length;
  return `<div class="sig sig-rail"${id ? ` id="${esc(id)}"` : ''}><div class="sig-rail__intro">${eyebrow ? `<span class="sig-rail__eye">${esc(eyebrow)}</span>` : ''}${heading ? `<h2 class="sig-h sig-rail__h">${esc(heading)}</h2>` : ''}${lead ? `<p class="sig-p">${esc(lead)}</p>` : ''}</div>`
    + `<ol class="sig-rail__list" data-sig-scroll data-sig-mode="rail" style="--n:${n}"><span class="sig-rail__track" aria-hidden="true"><i></i></span>`
    + steps.map((s, i) => `<li class="sig-rail__step" data-at="${(Math.max(0, (i + .15) / n - .02)).toFixed(3)}"><span class="sig-rail__dot" aria-hidden="true"><b>${i + 1}</b></span><div class="sig-rail__txt"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join('')
    + `</ol></div>`;
}
