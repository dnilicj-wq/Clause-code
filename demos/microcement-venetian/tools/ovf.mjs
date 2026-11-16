import { chromium } from 'playwright';
const b=await chromium.launch({args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await p.goto(process.argv[2]);await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}});
console.log('scrollWidth',await p.evaluate(()=>document.documentElement.scrollWidth),'screens',await p.evaluate(()=>(document.documentElement.scrollHeight/844).toFixed(1)));
const d=await b.newPage({viewport:{width:1440,height:900}});await d.goto(process.argv[2]);await d.waitForTimeout(1900);await d.screenshot({path:'/Users/daniilsgoloveckis/dev/mv-raw/qa/d-mid.png'});await d.waitForTimeout(3500);await d.mouse.move(900,300);for(let i=0;i<30;i++){await d.mouse.move(900+i*12,300+Math.sin(i/4)*80);await d.waitForTimeout(16);}await d.screenshot({path:'/Users/daniilsgoloveckis/dev/mv-raw/qa/d-after.png'});
await b.close();
