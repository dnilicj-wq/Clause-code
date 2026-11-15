// owner-signature: the owner's first name draws itself as a handwriting stroke when it scrolls into view,
// under a short line in the owner's voice built from facts on their site (from the master template "Tom").
// ONLY when the first name is confirmed (their site, Companies House or their own messages). Otherwise omit.
//
// render({ name, sig: signaturePaths(name, font), line?, role? })   (sig comes from signature-path.mjs at build time)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function render({ name, sig, line, role } = {}) {
  if (!name || !sig) return '';
  const n = sig.glyphs.length, per = 1.6 / Math.max(1, n);
  const swash = `M${sig.x1 + 4} ${sig.base} C ${sig.x1 + (sig.x2 - sig.x1) * .35} ${sig.base - 6}, ${sig.x1 + (sig.x2 - sig.x1) * .7} ${sig.base + 6}, ${sig.x2 + 6} ${sig.base - 3}`;
  return `<figure class="sig sig-os" data-sig-in>${line ? `<blockquote class="sig-os__line">${esc(line)}</blockquote>` : ''}`
    + `<svg class="sig-os__svg" viewBox="${sig.viewBox}" role="img" aria-label="Signed, ${esc(name)}">${sig.glyphs.map((d, i) => `<path class="sig-os__g" pathLength="1" d="${d}" style="--d:${(i * per).toFixed(2)}s;--l:${per.toFixed(2)}s"/>`).join('')}`
    + `<path class="sig-os__swash" pathLength="1" d="${swash}" style="--d:${(n * per).toFixed(2)}s"/></svg>`
    + `${role ? `<figcaption class="sig-os__role">${esc(name)}, ${esc(role)}</figcaption>` : ''}</figure>`;
}
