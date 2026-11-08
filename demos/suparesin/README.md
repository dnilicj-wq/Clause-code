# Suparesin: resin driveway + epoxy floor demo

Pitch demo for Darren Jones at Suparesin (Supacivil Resin Ltd, Wrexham). Built from the Aspect Drives demo on branch `claude/suparesin-demo`.

- Live: https://clientgateway-suparesin.dnilicj.workers.dev (Cloudflare Workers static assets, noindex via public/_headers)
- Facts and sources: content-inventory.md
- Hero: components/signature/resin-studio (Driveways = resin-bound pour over an old drive; Floors = flake / metallic / high-build epoxy pour under strip lights)
- Designer + instant quote: src/pe/v3/Price.tsx, config/finishes.ts (prices are examples)
- Loader: inline in index.html, ported from 21st.dev Mercury Rail Loader (MIT), see CREDITS.md and demos/master/loaders-used.md
- His photos: scripts/prep-client.mjs (research/raw -> public/client)
- Posters / designer stills / swatches: `BASE=http://localhost:5241 V=v2 PV=sr1 node tools/gen-assets.mjs [posters|views|swatches]`

## Ask Darren
Which website photos are his own installs (some may be supplier images), Instagram job photos, before/after pairs, real prices per m2, guarantee terms, OK to use "Daz"/Darren and reviewers' first names.

## Deploy (Cloudflare)
Build here (`npm run build`), then from an EMPTY scratch dir with wrangler.jsonc
`{ "name": "clientgateway-suparesin", "compatibility_date": "2026-11-01", "assets": { "directory": "<abs>/demos/suparesin/dist", "not_found_handling": "single-page-application" } }`
and `npx wrangler@latest deploy` (CLOUDFLARE_* from the shell env, never printed or committed).
