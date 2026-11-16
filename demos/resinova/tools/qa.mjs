import { chromium } from 'playwright';
const U=process.argv[2]||'https://clientgateway-microcement-venetian.dnilicj.workers.dev', O='/Users/daniilsgoloveckis/dev/mv-raw/qa';
const b=await chromium.launch({args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(U);
for(const t of [250,550,850]){await p.waitForTimeout(t===250?250:300);await p.screenshot({path:`${O}/load-${t}.png`});}
await p.waitForTimeout(400);await p.screenshot({path:`${O}/hero-midwipe.png`});
await p.waitForTimeout(3000);await p.screenshot({path:`${O}/hero-done.png`});
// claims scan
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}});
const txt=await p.evaluate(()=>document.body.innerText);
const hits=new Set();for(const re of [/[£$€]\s?\d[\d,.]*/g,/\d+\s?%/g,/guarantee\w*/gi,/waterproof/gi,/\byears?\b/gi,/5\.0/g,/\breviews?\b/gi,/Luna|Florenzia|Rock Plaster|Farrow|Hammock/g,/\b\d{2,4}\s?(m²|mm|sqm)/g]){for(const m of txt.matchAll(re))hits.add(m[0]);}
console.log('CLAIMS',[...hits].join(' | '));
// idle test: hero 5s, compare frames
await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(800);
const a=await p.screenshot();await p.waitForTimeout(5000);const c=await p.screenshot();console.log('hero idle changed:',Buffer.compare(a,c)!==0);
await p.evaluate(()=>document.getElementById('reviews').scrollIntoView({block:'center'}));await p.waitForTimeout(600);
const r1=await p.screenshot();await p.waitForTimeout(2000);const r2=await p.screenshot();console.log('marquee moving:',Buffer.compare(r1,r2)!==0);
// over anything
await p.evaluate(()=>document.getElementById('over').scrollIntoView({block:'center'}));await p.waitForTimeout(1200);
await p.getByRole('tab',{name:'Wooden worktop'}).dispatchEvent('click');await p.waitForTimeout(700);await p.screenshot({path:`${O}/over-mid.png`});await p.waitForTimeout(1500);await p.screenshot({path:`${O}/over-done.png`});
// planner
await p.evaluate(()=>document.getElementById('quote').scrollIntoView({block:'center'}));await p.waitForTimeout(1200);
for(const n of ['Wet room','Microcement','Yes']){await p.locator('#quote').getByRole('radio',{name:n,exact:true}).dispatchEvent('click');await p.waitForTimeout(350);}
await p.locator('#quote').getByRole('radio',{name:'A full room'}).dispatchEvent('click');await p.fill('input[autocomplete=postal-code]','RG14 5AA');await p.getByRole('button',{name:'Next',exact:true}).dispatchEvent('click');
await p.fill('input[autocomplete=given-name]','Test');await p.fill('input[autocomplete=tel]','07700900123');
await p.locator('#quote').screenshot({path:`${O}/planner.png`});
const pop=p.context().waitForEvent('page',{timeout:5000}).catch(()=>null);
await p.getByRole('button',{name:'Send to James'}).dispatchEvent('click');const w=await pop;console.log('WA url:',w?decodeURIComponent(w.url()).slice(0,260):'none');
await p.waitForTimeout(500);console.log('after send:',(await p.locator('.plan').innerText()).slice(0,120));
const p4=await b.newPage({viewport:{width:390,height:844}});await p4.goto(U+'/no-such-page');await p4.waitForTimeout(2000);console.log('404 h1:',await p4.locator('h1').innerText());await p4.screenshot({path:`${O}/404.png`});
console.log('errors:',errs.join(' || ')||'none');await b.close();
