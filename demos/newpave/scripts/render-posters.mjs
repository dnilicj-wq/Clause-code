// Renders the hero posters (shown before WebGL starts and on devices without it),
// the designer poster and the OG image from the live page. Needs the local server on :4610.
import { chromium } from 'playwright';
import sharp from 'sharp';
const B = 'http://localhost:4610', OUT = new URL('../public/img/', import.meta.url).pathname;
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const hide = `.hero-copy,.hero-dock,.hd,#doneNote,.grain,.glow,.dock,.cfg-badge,.cfg-hint,.cfg-scene,.cfg-car,.cfg-note{visibility:hidden!important}`;
async function hero(name, w, h, dpr) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: w < 600, hasTouch: w < 600 });
  await p.goto(B + '/?posterRender', { waitUntil: 'load' }); await p.addStyleTag({ content: hide });
  await p.waitForFunction(() => window.__posterReady, null, { timeout: 20000 }); await p.waitForTimeout(500);
  const png = await (await p.$('#heroGL')).screenshot();
  await sharp(png).avif({ quality: 52, effort: 6 }).toFile(OUT + name + '.avif');
  await sharp(png).webp({ quality: 74 }).toFile(OUT + name + '.webp');
  await p.close(); return png;
}
const d = await hero('hero-d-b', 1440, 900, 1.25);
await hero('hero-m-b', 390, 844, 2);
// designer poster
{ const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5 });
  await p.goto(B + '/?posterRender', { waitUntil: 'load' }); await p.addStyleTag({ content: hide });
  await p.evaluate(() => document.querySelector('#design').scrollIntoView()); await p.waitForTimeout(3500);
  const png = await (await p.$('#cfgView')).screenshot();
  await sharp(png).resize(1200).webp({ quality: 74 }).toFile(OUT + 'cfg-poster-c.webp'); await p.close(); }
// OG image 1200x630
{ const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const bg = 'data:image/png;base64,' + (await sharp(d).resize(1200, 630, { fit: 'cover', position: 'top' }).png().toBuffer()).toString('base64');
  const logo = (await (await fetch(B + '/brand/logo.svg')).text()).replace(/<\?xml[^>]*>/, ''); await p.goto(B + '/');
  await p.setContent(`<html><head><style>@font-face{font-family:A;src:url(${B}/fonts/archivo.woff2)}body{margin:0;width:1200px;height:630px;font-family:A;background:url(${bg}) center/cover;color:#f3f3f1;position:relative}
  .s{position:absolute;inset:0;background:linear-gradient(90deg,rgba(19,18,17,.9) 0,rgba(19,18,17,.55) 55%,rgba(19,18,17,0) 100%)}
  .c{position:absolute;left:64px;top:64px;bottom:64px;display:flex;flex-direction:column;justify-content:space-between}
  .l svg{height:46px;width:auto}.l svg [fill='#34343C'],.l svg [fill='#34343c']{fill:#f3f3f1}h1{font-stretch:72%;font-weight:800;text-transform:uppercase;font-size:88px;line-height:.92;letter-spacing:-.02em;margin:0;max-width:760px}
  p{font-size:28px;margin:18px 0 0;color:#e8e4dc}b{color:#f26a1b}</style></head><body><div class="s"></div><div class="c"><div class="l">${logo}</div><div><h1>Your driveway, done properly.</h1><p>Resin, block paving and tarmac in Telford and the West Midlands. <b>07787 707154</b></p></div></div></body></html>`);
  await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + 'og-b.jpg', type: 'jpeg', quality: 86 }); await p.close(); }
await b.close(); console.log('posters done');
