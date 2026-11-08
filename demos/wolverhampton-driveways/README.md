# Wolverhampton Driveways: driveway demo

Pitch demo for Steven at Wolverhampton Driveways Ltd. Built from the Proficient Essex resin-driveway build (master template V3) on branch `claude/wolverhampton-driveways-demo`.

- Live: https://clientgateway-wolverhampton-driveways.vercel.app (noindex)
- Facts and sources: content-inventory.md
- Hero engine: components/signature/drive-pour/drive.ts (swipe to pour resin; auto-demo on phones; poster first)
- Sections: src/pe/ (Hero + instant quote, Design, Compare, Corridor, sections.tsx)
- Prices, surfaces, blends: config/driveway.ts (all examples)
- Their photos: scripts/prep-client.mjs (research/raw -> public/client)
- Posters: `BASE=http://localhost:<port> VER=wd1 node scripts/capture-pe.mjs posters`

## Ask Steven
Real Google reviews with first names, a before/after pair, prices per m², guarantee period/terms, hours, OK to use his first name.

## Deploy
```
npx vercel@latest link --yes --project clientgateway-wolverhampton-driveways --scope dnilicj-2275s-projects
npx vercel@latest build --prod --yes --scope dnilicj-2275s-projects
npx vercel@latest deploy --prebuilt --prod --yes --scope dnilicj-2275s-projects
```
