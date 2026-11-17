import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://localhost:4321/'); await p.waitForTimeout(1500);
console.log(await p.evaluate(async () => {
  await document.fonts.load('500 40px "Noto Serif Display"'); await document.fonts.load('italic 500 40px "Noto Serif Display"');
  const c = document.createElement('canvas').getContext('2d'); const t = 'Floors, walls and worktops, poured to be one of a kind.';
  const m = (f) => { c.font = f; return c.measureText(t).width; };
  return { bodoni: m('500 40px "Noto Serif Display"'), georgia: m('400 40px Georgia'), times: m('400 40px "Times New Roman"'), bi: m('italic 500 40px "Noto Serif Display"'), gi: m('italic 400 40px Georgia') };
}));
await b.close();
