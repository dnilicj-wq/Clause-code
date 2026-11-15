// Build-time helper (Node): converts the owner's first name to SVG glyph paths in a free script font,
// so the page needs no font file and each letter can draw itself as a stroke.
//   relaxed (trade presets):  'caveat'     Caveat, SIL OFL 1.1
//   elegant (luxury presets): 'delafield'  Mrs Saint Delafield, SIL OFL 1.1
//   'homemade'                             Homemade Apple, Apache 2.0
// Needs opentype.js (npm i opentype.js@1.3.4).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import opentype from 'opentype.js';
const HERE = dirname(fileURLToPath(import.meta.url));
const FILES = { caveat: 'Caveat.ttf', delafield: 'MrsSaintDelafield-Regular.ttf', homemade: 'HomemadeApple-Regular.ttf' };
const cache = {};
export function signaturePaths(name, font = 'caveat', fontsDir = join(HERE, 'fonts')) {
  if (!FILES[font]) throw new Error('owner-signature: unknown font ' + font);
  const f = cache[font] || (cache[font] = opentype.parse(readFileSync(join(fontsDir, FILES[font])).buffer));
  const size = 100;
  const paths = f.getPaths(name, 0, 0, size);
  const glyphs = paths.map((p) => ({ d: p.toPathData(1), bb: p.getBoundingBox() })).filter((g) => g.d);
  const x1 = Math.min(...glyphs.map((g) => g.bb.x1)), y1 = Math.min(...glyphs.map((g) => g.bb.y1));
  const x2 = Math.max(...glyphs.map((g) => g.bb.x2)), y2 = Math.max(...glyphs.map((g) => g.bb.y2));
  const pad = 6;
  return { viewBox: `${Math.floor(x1 - pad)} ${Math.floor(y1 - pad)} ${Math.ceil(x2 - x1 + pad * 2)} ${Math.ceil(y2 - y1 + pad * 2 + 14)}`, glyphs: glyphs.map((g) => g.d), base: Math.ceil(y2 + 8), x1: Math.floor(x1), x2: Math.ceil(x2) };
}
