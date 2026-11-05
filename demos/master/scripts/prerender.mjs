// Post-build: snapshot the hero + nav as static HTML into dist/index.html so the first paint
// (and LCP) does not wait for the JS bundle. React replaces it on mount (createRoot).
// Personalised links (?company=&town=&phone=, ?trade=, ?preset=) skip the shell so no wrong name ever flashes.
import { preview } from 'vite';
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const server = await preview({ preview: { port: 5199, strictPort: true }, logLevel: 'silent' });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:5199/?gl=off', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
const shell = await p.evaluate(() => {
  const top = document.getElementById('top').cloneNode(true);
  top.querySelectorAll('canvas').forEach((c) => c.remove());
  const nav = document.querySelector('#root > header, #root > nav')?.outerHTML || '';
  return nav + '<main class="grain relative">' + top.outerHTML + '</main>';
});
await b.close();
await server.close();

const file = new URL('../dist/index.html', import.meta.url);
let html = readFileSync(file, 'utf8');
html = html.replace('<div id="root"></div>', `<div id="root">${shell}</div>
  <script>if(/[?&](company|town|phone|trade|preset)=/.test(location.search)){document.getElementById('root').innerHTML=''}else{document.getElementById('boot').remove()}</script>`);
writeFileSync(file, html);
console.log('prerendered hero shell:', (shell.length / 1024).toFixed(1), 'KB');
