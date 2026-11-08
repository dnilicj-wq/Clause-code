# Proficient Essex: resin driveway demo

Pitch demo for Matt at Proficient Essex (Tilbury). Built from master template V3 on branch `claude/proficient-essex-demo`.

- Live: https://clientgateway-proficient-essex.vercel.app (noindex)
- Facts and sources: content-inventory.md
- Hero engine: components/signature/drive-pour/drive.ts (WebGL1, swipe to pour resin over a cracked drive; auto-demo on phones; poster on slow devices)
- Sections: src/pe/ (Hero, Design configurator, Corridor gallery, sections.tsx)
- Prices and blends: config/driveway.ts (all examples)
- Textures: scripts/prep-tex.mjs (CC0 Poly Haven). Posters and blend stills: scripts/capture-pe.mjs

## Before going live for real
Confirm with Matt: prices per m², blends he offers, hours, guarantee terms, which Google listing is his, real Google reviews with first names, resin job photos (a before/after pair would replace the corridor's opener).

## Deploy
```
npx vercel@latest link --yes --project clientgateway-proficient-essex --scope dnilicj-2275s-projects
npx vercel@latest build --prod --yes --scope dnilicj-2275s-projects
npx vercel@latest deploy --prebuilt --prod --yes --scope dnilicj-2275s-projects
```
