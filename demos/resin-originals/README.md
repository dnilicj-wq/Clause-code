# Clientgateway master template (v3)

Premium demo site template for trades businesses. Default demo: **Northfield Surfaces**, an epoxy floor company in Leeds (fictional, all examples labelled).

## Pages
- `/` – the demo page (pour hero → services → full-bleed garage expansion → layers → comparison + spill test → price → "how fast we reply" chat → gallery → reviews → owner → guarantee → FAQ → finale → large name footer)
- `/lab`, `/lab/<category>` – every component in the library, live, with source, licence, status and score
- `/preview/<id>` – one library demo on its own page (for screenshots and review)
- `/presets` – the 5 visual presets side by side
- `/capture` – internal: renders shader stills for `scripts/capture.mjs`

URL options: `?preset=<key>`, `?trade=epoxy|microcement`, `?company=&town=&phone=` (personalise on the fly), `?gl=off|force`.

## The only files a new lead changes
- `config/site.ts` – business details, reviews, photos, preset, form endpoint
- (optionally) a trade pack in `config/trades/` – services, finishes, layers, pricing, FAQ, and `copy` (every section's trade wording)
- `index.html` – title, loader colours and hero poster preloads (see `/new-lead`)

## Trade packs
`config/trades/index.ts` registers them; `site.trade` picks one.
- `epoxy` (default): pour hero, spill test, hot-tyre tile, example renders.
- `microcement`: trowel hero (procedural tiled wall, no client assets), seamless-vs-tiles comparison, colour swatches instead of photos until the business adds its own. Use with the `microcement-stone` preset: `/?trade=microcement&preset=microcement-stone`.
A pack's `copy.expand` or `copy.gallery.beforeAfter` set to `null` hides that block (no image that contradicts its label).

## New lead
Run `/new-lead <name> | <facebook> | <website> | <phone> | <trade>` from the repo root (`.claude/commands/new-lead.md`). It copies this folder to `demos/<slug>`, fills `config/site.ts` from sourced facts only, runs the honesty scan and deploys `clientgateway-<slug>`. Test run: `demos/apex-resin-floors` (fictional) → https://clientgateway-apex-resin-floors.vercel.app

Presets live in `config/presets.ts`. Components read colours and fonts only through CSS variables, so a preset swap re-skins everything.

## Rules baked in
- Price shown before contact details, always labelled "Example range" until the business sets its rates.
- No invented reviews, stats, certifications or owner photos. Examples say "(example)" / "Example image".
- Changed image = new filename (`-v2`), never overwrite.
- `vercel.json` sends `X-Robots-Tag: noindex` on everything.

## Visualiser – disabled (needs paid API)
Removed from the demo page and from the build: there is no `/api` route and no Gemini call ships. The client UI stays in `components/signature/visualiser/` and the old server handler in `visualiser/disabled/` (not deployed). It shows in /lab as "needs paid API, disabled".

## Commands
```bash
npm install
npm run dev          # http://localhost:5190
npm run build        # static dist/ + api/ (+ prerendered hero shell)
# deploy (prebuilt: the prerender needs local Playwright)
npx vercel@latest build --prod --yes && npx vercel@latest deploy --prebuilt --prod --yes
node scripts/capture.mjs http://localhost:5190 posters   # re-render shader stills (posters|tex|ba|look)
CAPTURE_PRESET=industrial-steel CAPTURE_VER=steel-v1 node scripts/capture.mjs http://localhost:5190 posters   # posters in another preset
node scripts/capture-trowel.mjs                          # trowel hero posters
node --experimental-strip-types scripts/credits.mjs      # rebuild CREDITS.md from the registry
node tools/walk.mjs <url> <outDir> 390 844               # phone contact sheet + screen count
```

## Library
`components/library/registry.ts` lists every component with `{ id, name, category, slot, source, author, tradeFit, vibe, perfCost, mobileSafe, needs, status, notes, score }`. `/new-lead` picks from it; `needs` stops a component being used without real content (e.g. `realReviews`). Raw sources sit in `library-inbox/` (not deployed). Signature interactions are in `components/signature/` (pour hero, layer explode, visualiser, flake broadcast, metallic swirl, hot-tyre test, spill test, UV slider). Max 3 per page including the hero.

To add a component to `/lab`: put it in `components/library/<id>/`, add a registry entry, and add `src/pages/lab/demos/<id>.tsx` (default export). The lab picks the demo file up automatically.

## Prep video (Dean, due Friday)

The Prep and screeding section has a 16:9 video slot (`PrepVideo` in `src/sections/More.tsx`). Until the video arrives it shows a still from Dean's V61 clip with a "Video coming soon" tag.

To drop the video in:

1. Put Dean's original somewhere outside the repo (never edit the original), e.g. `~/dev/dean-media/src/prep.mp4`.
2. Encode into `public/client/dean/prep/` (H.264, no audio unless Dean wants sound; drop `-an` to keep it):

```bash
IN=~/dev/dean-media/src/prep.mp4; OUT=public/client/dean/prep
ffmpeg -i "$IN" -vf "scale=-2:1080" -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k "$OUT/prep-1080.mp4"
ffmpeg -i "$IN" -vf "scale=-2:720"  -c:v libx264 -preset veryfast -crf 25 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k  "$OUT/prep-720.mp4"
ffmpeg -i "$IN" -frames:v 1 -vf "scale=-2:1080" "$OUT/prep-poster.png" && python3 -c "from PIL import Image; Image.open('$OUT/prep-poster.png').convert('RGB').save('$OUT/prep-poster.webp', quality=82)" && rm "$OUT/prep-poster.png"
```

   If his video is portrait, crop to 16:9 first (add `crop=iw:iw*9/16` before `scale`) or ask Dan how to frame it.
3. In `src/sections/More.tsx` set `const PREP_VID: string = 'prep';`. Phones (under 768px) get the 720p file, everything else gets 1080p. It's tap to play, no autoplay, starts unmuted with controls.
4. `npm run build`, check it, then deploy to the demo URL only.
