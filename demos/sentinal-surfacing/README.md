# Sentinal Surfacing: resin + inside floors demo

Pitch demo for Neil Conway at Sentinal Surfacing (Consett; North of England and Scotland). Built from the Wolverhampton Driveways demo on branch `claude/sentinal-surfacing-demo`.

- Live: https://clientgateway-sentinal-surfacing.dnilicj.workers.dev (noindex via public/_headers)
- Facts and sources: content-inventory.md · credits: CREDITS.md
- Hero: resin pours over a cracked concrete drive on load; picker re-pours as microcement or floor coating (components/signature/brick-drop, surfaces.ts)
- Sections: src/pe/ (Hero, Design = mailto quote form, Corridor, sections.tsx incl. Floors and Story map)
- Photos: scripts/prep-client.mjs (scratch raw -> public/client); swatches: scripts/swatches.mjs
- Posters: `BASE=http://localhost:5241 VER=ss1 node scripts/capture-pe.mjs hero-posters`

## Ask Neil
info@ or neil@ for quotes; a WhatsApp number if he wants one; which photos are which towns/materials; a form endpoint (now mailto); any guarantee or accreditation he wants shown.

## Deploy (Cloudflare Workers)
`npm run build`, then from an EMPTY scratch dir with wrangler.jsonc
`{name:"clientgateway-sentinal-surfacing", compatibility_date, assets:{directory:"<abs>/dist", not_found_handling:"single-page-application"}}` run `npx wrangler deploy`. Never run wrangler in this folder.
