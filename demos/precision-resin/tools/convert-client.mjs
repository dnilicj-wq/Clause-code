import sharp from 'sharp';
const names = {1:'blue-gloss-loft',2:'grey-gloss-warehouse',3:'dark-gloss-barriers',4:'yellow-hatch-lines',5:'factory-yellow-walkways',6:'footprint-safety-markings',7:'amber-gloss-warehouse',8:'grinding-floor',9:'grinding-scissor-lifts',10:'pouring-resin',11:'resin-bound-driveway',12:'grinding-old-coating',13:'blue-flake-hall',14:'logo'};
for (const [n,name] of Object.entries(names)) {
  const src = `img/raw/pr-${String(n).padStart(2,'0')}.jpg`;
  const { width } = await sharp(src).metadata();
  const sizes = [640,1280,1920].filter(w => w <= width);
  if (!sizes.length || sizes.at(-1) < width && width < 1280) sizes.push(width); // keep native size for small portraits
  for (const w of [...new Set(sizes)]) {
    const tag = [640,1280,1920].includes(w) ? w : 'full';
    await sharp(src).rotate().resize({ width: w }).webp({ quality: 76 }).toFile(`public/client/${name}-${tag}-v1.webp`);
    await sharp(src).rotate().resize({ width: w }).avif({ quality: 50 }).toFile(`public/client/${name}-${tag}-v1.avif`);
  }
  console.log(name, width, sizes.join(','));
}
