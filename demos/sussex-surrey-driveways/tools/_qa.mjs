import { chromium } from 'playwright';
const U='http://localhost:5291';
const b=await chromium.launch({args:['--enable-gpu','--ignore-gpu-blocklist','--use-angle=metal']});
const out={};
// timing + loader, mobile touch
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const bad=[]; p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});
const t0=Date.now(); await p.goto(U,{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>{const h=document.querySelector('h1');return h&&h.getBoundingClientRect().height>0});
out.h1ms=Date.now()-t0;
await p.waitForFunction(()=>!document.getElementById('ld')||getComputedStyle(document.getElementById('ld')).display==='none'||document.getElementById('ld').classList.contains('gone')||!document.body.contains(document.getElementById('ld')),null,{timeout:5000}).catch(()=>out.loader='still-present');
out.loaderGoneMs=Date.now()-t0;
out.paint=await p.evaluate(()=>performance.getEntriesByType('paint').map(e=>e.name+':'+Math.round(e.startTime)));
out.lcp=await p.evaluate(()=>new Promise(r=>{new PerformanceObserver(l=>{const e=l.getEntries();r(Math.round(e[e.length-1].startTime))}).observe({type:'largest-contentful-paint',buffered:true});setTimeout(()=>r('n/a'),2000)}));
await p.waitForLoadState('networkidle');
// tap hero types
for(const t of ['Resin','Tarmac','Gravel','Natural stone','Block paving']){ await p.tap(`[role=radiogroup][aria-label="New surface"] [aria-label="${t}"] >> nth=0`); await p.waitForTimeout(250);}
out.heroType=await p.locator('[role=radiogroup][aria-label="New surface"] [aria-checked=true]').first().getAttribute('aria-label');
// configurator
await p.locator('#design').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
await p.locator('#design button',{hasText:'3-car'}).first().tap();
await p.locator('#design button',{hasText:'Concrete'}).first().tap();
await p.locator('#design button:has-text("Resin")').first().tap();
const slider=p.locator('#design input[type=range]').first();
if(await slider.count()){ const bb=await slider.boundingBox(); await p.touchscreen.tap(bb.x+bb.width*0.3,bb.y+bb.height/2); }
await p.locator('#design input[placeholder="Your name"]').fill('Test'); await p.locator('#design input[placeholder="Phone"]').fill('07000000000'); await p.locator('#design input[placeholder="Postcode"]').fill('RH12');
const [pop]=await Promise.all([p.waitForEvent('popup',{timeout:4000}).catch(()=>null), p.locator('#design button',{hasText:'Send on WhatsApp'}).tap()]);
out.waUrl=pop?decodeURIComponent(pop.url()).slice(0,400):'no popup'; if(pop) await pop.close();
// links
out.links=await p.evaluate(()=>[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')))]);
const ids=await p.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.querySelector(h)));
out.deadAnchors=[...new Set(ids)];
out.sticky=await p.evaluate(()=>[...document.querySelectorAll('.sticky-bar a, .sticky-bar button')].map(a=>a.textContent.trim()+' -> '+(a.getAttribute('href')||'btn')));
// claim scan
const txt=await p.evaluate(()=>document.body.innerText);
const re=/[^\n]*(\d|£|%|\byears?\b|guarantee|\bLtd\b|Limited|insured|certified|warrant|accredit|rated|award)[^\n]*/gi;
out.claims=[...new Set(txt.match(re))];
out.errs=errs; out.bad=bad;
// area page
const a=await b.newPage({viewport:{width:1440,height:900}});
const r=await a.goto(U+'/driveways-guildford',{waitUntil:'networkidle'}); await a.waitForTimeout(1200);
out.area={status:r.status(),title:await a.title(),h1:await a.locator('h1').innerText()};
console.log(JSON.stringify(out,null,1));
await b.close();
