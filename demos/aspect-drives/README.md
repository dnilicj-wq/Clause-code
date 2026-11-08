# Aspect Drives & Patios: driveway demo

Pitch demo for Gerald at Aspect Drives & Patios By Design Ltd (Grays, Thurrock). Built from the Wolverhampton Driveways demo on branch `claude/aspect-drives-demo`.

- Live: https://clientgateway-aspect-drives.<account>.workers.dev (Cloudflare Workers static assets, noindex via public/_headers)
- Facts and sources: content-inventory.md
- Hero: components/signature/brick-drop (block paving lays in; card switches block / resin / patio / concrete; concrete is new in surfaces.ts)
- Loader: inline in index.html, ported from 21st.dev Horizon Page Loader (MIT), see CREDITS.md and demos/master/loaders-used.md
- His photos: scripts/prep-client.mjs (research/raw -> public/client)
- Posters: `BASE=http://localhost:<port> VER=ad1 node scripts/capture-pe.mjs brick-posters`; swatches: `... types`; concrete still: `VER=v2 ... type-views`

## Ask Gerald
Before/after pairs, a concrete job photo, guarantee terms, prices per m², OK to use his first name, more Google reviews.

## Deploy (Cloudflare)
Build here (`npm run build`), then from an EMPTY scratch dir (never inside this folder: wrangler rewrites package.json):
```
cat > wrangler.jsonc <<J
{ "name": "clientgateway-aspect-drives", "compatibility_date": "2026-11-01", "assets": { "directory": "<abs path>/demos/aspect-drives/dist", "not_found_handling": "single-page-application" } }
J
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npx wrangler@4 deploy
```
