import sharp from 'sharp'; import fs from 'fs'; import path from 'path';
const dir=process.argv[2], out=process.argv[3], start=+process.argv[4]||0, n=+process.argv[5]||20;
const fs_=fs.readdirSync(dir).filter(f=>f!=='t.jpg').sort().slice(start,start+n);
const W=360,H=270,cols=5; const rows=Math.ceil(fs_.length/cols);
const comps=[];
for(const [i,f] of fs_.entries()){ const b=await sharp(path.join(dir,f)).resize(W,H,{fit:'cover'}).toBuffer();
 const x=(i%cols)*W,y=Math.floor(i/cols)*(H+30); comps.push({input:b,left:x,top:y});
 comps.push({input:Buffer.from(`<svg width="${W}" height="30"><text x="4" y="20" font-size="16" font-family="Arial">${start+i} ${f.replace('WhatsApp-Image-2026-','')}</text></svg>`),left:x,top:y+H});}
await sharp({create:{width:cols*W,height:rows*(H+30),channels:3,background:'#fff'}}).composite(comps).jpeg({quality:75}).toFile(out);
