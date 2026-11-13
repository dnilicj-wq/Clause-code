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
writeFileSync(file, html);
console.log('prerendered shell', (shell.length / 1024).toFixed(1), 'KB');
