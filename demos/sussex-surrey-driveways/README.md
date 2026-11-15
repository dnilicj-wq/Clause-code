# Sussex & Surrey Driveways demo

Pitch demo for Sussex & Surrey Driveways (Horsham), built from demos/master (V3) with the Proficient Essex surface-switcher hero.

- Live: https://clientgateway-sussex-surrey-driveways.dnilicj.workers.dev (noindex)
- Pages: `/` and area pages `/driveways-horsham|crawley|guildford|farnham|leatherhead` (SPA routes)
- Hero: live 3D drive; tap Block / Resin / Tarmac / Gravel / Stone to re-lay it (starts on block paving)
- Design your drive (#design): size, what's there now, new surface, resin colour → WhatsApp request. No prices (they publish none).
- Facts and sources: `content-inventory.md`. Credits: `CREDITS.md`.

## Build and deploy
```
npm ci && npm run build      # vite build + hero prerender + placeholder gate
```
Deploy from an EMPTY scratch dir with a wrangler.jsonc `{ name: "clientgateway-sussex-surrey-driveways", compatibility_date, assets: { directory: "<abs path>/dist", not_found_handling: "single-page-application" } }`, then `npx wrangler@4 deploy`.

Changed image = new filename (cache). Posters: `node scripts/capture-pe.mjs ssd-posters` against a running dev server.
