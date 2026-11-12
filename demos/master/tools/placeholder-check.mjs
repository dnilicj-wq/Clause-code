// Fails (exit 1) if any built page or script contains placeholder text. Runs automatically after
// `npm run build` (postbuild), so a deploy with leftovers like "[CONFIRM: aftercare offer]" can't ship.
// Usage: node tools/placeholder-check.mjs [dir=dist]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2] || 'dist';
const RE = /\[CONFIRM|\bTODO\b|\bTBC\b|lorem ipsum|\{\{/i;
const bad = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) return walk(p);
  if (!/\.(html|js|mjs|json)$/.test(f)) return;
  const t = readFileSync(p, 'utf8'); const m = t.match(RE);
  if (m) bad.push(`${p}: "${t.slice(Math.max(0, m.index - 50), m.index + 50).replace(/\s+/g, ' ')}"`);
});
walk(dir);
if (bad.length) { console.error('PLACEHOLDER GATE FAILED (remove the claim or use the client\'s real wording):\n' + bad.join('\n')); process.exit(1); }
console.log('placeholder gate: clean (' + dir + ')');
