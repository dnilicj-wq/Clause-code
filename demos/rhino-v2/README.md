# Rhino Coating demo v2 (master template V3)

Live: https://clientgateway-rhino.dnilicj.workers.dev (Cloudflare Workers, noindex header + meta). The old demo at https://clientgateway-rhino.vercel.app (`demos/rhino`) stays up until David approves this one.

Built from `demos/master` (branch `claude/signature-sections`, which includes the Lamp CTA). Branch `claude/rhino-v2`.

- Facts and photo sources: `content-inventory.md` (everything from rhinocoating.co.uk, fetched 2026-11-15).
- Business facts: `config/site.ts`. Trade pack: `config/trades/rhino.ts`. Preset: `rhino-violet` in `config/presets.ts` (+ `--accent3` mint in `index.html`).
- Loader: Radial Intro (arhamkhnz), inline in `index.html`, first visit only, done by 0.9s.
- Prices are "Example range" until David gives his rates (`pricing.perM2` in the trade pack).
- Form: `formEndpoint` is empty, so a lead shows the thank-you and hands over to WhatsApp.

## Build, check, deploy
```bash
npm install && npm run build            # vite build + prerendered hero shell + placeholder gate
node tools/gate.mjs [url]               # claim scan, broken images, dead anchors, hero timing, loader timing
node tools/walk.mjs <url> /tmp/rh 390 844
node tools/lamp-check.mjs <url> /tmp/rh-lamp
```
Deploy: `npx wrangler@4 deploy` from an empty folder with a `wrangler.jsonc` whose `assets.directory` points at this `dist/` (name `clientgateway-rhino`, `not_found_handling: single-page-application`).
Posters: `CAPTURE_PRESET=rhino-violet CAPTURE_VER=rhino-v1 node scripts/capture.mjs http://localhost:5233 posters` with the dev server up.
