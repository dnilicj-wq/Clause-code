// Post-build: snapshot nav + hero as static HTML into dist/index.html so the headline paints before JS (LCP).
import { preview } from 'vite';
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const server = await preview({ preview: { port: 5199, strictPort: true }, logLevel: 'silent' });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.emulateMedia({ reducedMotion: 'no-preference' });
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
const shell = await p.evaluate(() => {
  const top = document.getElementById('top').cloneNode(true);
  top.classList.remove('polished');
  top.querySelectorAll('canvas').forEach((c) => c.remove());
  return document.querySelector('.skip').outerHTML + document.querySelector('header.nav').outerHTML + '<main id="main">' + top.outerHTML + '</main>';
});
await b.close(); await server.close();
const file = new URL('../dist/index.html', import.meta.url);
let html = readFileSync(file, 'utf8');
html = html.replace('<div id="root"></div>', `<div id="root"><div id="shell">${shell}</div></div>`);
// Load the app after the prerendered hero has painted (the loader covers the hand-over), so LCP never waits on JS.
const m = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
if (m) {
  html = html.replace(m[0], '').replace(/<link rel="modulepreload"[^>]*>/g, '');
  html = html.replace('</body>', `<script>addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src='${m[1]}';document.body.appendChild(s)},30)})</script></body>`);
}
writeFileSync(file, html);
console.log('prerendered shell', (shell.length / 1024).toFixed(1), 'KB');
