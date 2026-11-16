import { chromium } from 'playwright';
const URL='https://clientgateway-microcement-venetian.dnilicj.workers.dev';
const OUT='/Users/daniilsgoloveckis/dev/mv-raw/review/';
const b = await chromium.launch({args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage(); const errs=[];
p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
p.on('popup',pp=>{console.log('POPUP',pp.url()); pp.close();});
await p.route(/wa\.me|api\.whatsapp|formspree|web3forms/, r=>{console.log('BLOCKED',r.request().url()); r.abort();});
await p.goto(URL,{waitUntil:'networkidle'}); await p.waitForTimeout(4000);
await p.mouse.move(300,300); await p.mouse.down();
for(let i=0;i<40;i++){await p.mouse.move(300+i*25,300+Math.sin(i/4)*150,{steps:2});}
await p.mouse.up(); await p.waitForTimeout(500);
await p.screenshot({path:OUT+'i-hero-drag.png'});
for(let y=0;y<15000;y+=500){await p.evaluate(y=>scrollTo(0,y),y); await p.waitForTimeout(120);}
console.log('otabs',await p.locator('.otab').count(), await p.locator('[role=tab]').count());
const tabs=p.locator('[role=tab]');
for(let i=0;i<await tabs.count();i++){ const l=tabs.nth(i); const t=(await l.innerText()).split(' ')[0]; await l.scrollIntoViewIfNeeded(); await p.evaluate(()=>window.scrollBy(0,300)); await l.click(); await p.waitForTimeout(400); await p.screenshot({path:OUT+'i-tab-'+t+'-a.png'}); await p.waitForTimeout(3000); await p.screenshot({path:OUT+'i-tab-'+t+'.png'}); }
const sw=p.locator('button:has-text("Graphite")').first(); await sw.scrollIntoViewIfNeeded(); await p.evaluate(()=>window.scrollBy(0,200)); await sw.click(); await p.waitForTimeout(1200); await p.screenshot({path:OUT+'i-swatch.png'});
const chip=p.locator('button[type=button][role=radio]',{hasText:'Wet room'}); await chip.scrollIntoViewIfNeeded(); await p.evaluate(()=>window.scrollBy(0,300));
for(let s=0;s<7;s++){
  await p.waitForTimeout(500);
  await p.screenshot({path:OUT+`i-plan-${s}.png`});
  const info=await p.evaluate(()=>{
    let card=[...document.querySelectorAll('button.btn-ink')].find(b=>b.offsetParent)?.closest('section')||document.body;
    const vis=[...card.querySelectorAll('button[role=radio],input,textarea,select')].filter(e=>e.offsetParent);
    vis.forEach(i=>{ if(i.tagName==='BUTTON'||i.type==='checkbox'||i.type==='radio'||i.type==='file'){} else {const v=i.type==='tel'?'07000000000':(i.type==='email'?'test@example.com':'Test'); const st=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(i),'value').set; st.call(i,v); i.dispatchEvent(new Event('input',{bubbles:true}));}});
    const r=vis.find(e=>e.tagName==='BUTTON'); if(r) r.click();
    return [...card.querySelectorAll('button,a')].filter(e=>e.offsetParent).map(e=>e.innerText.trim().slice(0,30)+(e.disabled?'(dis)':'')+(e.href?'['+decodeURIComponent(e.href).slice(0,300)+']':'')).join(' | ');});
  console.log('STEP',s,info);
  await p.waitForTimeout(300);
  const next=p.locator('button.btn-ink:visible',{hasText:/^Next/}).last();
  if(await next.count()){ if(await next.isEnabled()) await next.click(); else {console.log('next disabled');} } else break;
}
await p.screenshot({path:OUT+'i-plan-final.png'});
const r=await p.goto(URL+'/some-missing-page'); console.log('404 status',r.status()); await p.waitForTimeout(2000); await p.screenshot({path:OUT+'i-404.png'});
console.log('ERRS',errs.join('\n')); await b.close();
