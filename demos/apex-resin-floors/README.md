# Clientgateway master template (v3)

Premium demo site template for trades businesses. Default demo: **Northfield Surfaces**, an epoxy floor company in Leeds (fictional, all examples labelled).

## Pages
- `/` – the demo page (pour hero → services → visualiser → layers → bento with spill test → comparison → price → "how fast we reply" chat → gallery → reviews → owner → guarantee → FAQ → finale → large name footer)
- `/lab`, `/lab/<category>` – every component in the library, live, with source, licence, status and score
- `/preview/<id>` – one library demo on its own page (for screenshots and review)
- `/presets` – the 5 visual presets side by side
- `/capture` – internal: renders shader stills for `scripts/capture.mjs`

URL options: `?preset=<key>`, `?company=&town=&phone=` (personalise on the fly), `?gl=off|force`.

## The only files a new lead changes
- `config/site.ts` – business details, reviews, photos, preset, form endpoint
- (optionally) a trade pack in `config/trades/` – services, finishes, layers, pricing, FAQ

Presets live in `config/presets.ts`. Components read colours and fonts only through CSS variables, so a preset swap re-skins everything.

## Rules baked in
- Price shown before contact details, always labelled "Example range" until the business sets its rates.
- No invented reviews, stats, certifications or owner photos. Examples say "(example)" / "Example image".
- Changed image = new filename (`-v2`), never overwrite.
- `vercel.json` sends `X-Robots-Tag: noindex` on everything.

## Visualiser (Gemini)
`api/visualise.ts` calls `gemini-2.5-flash-image`. Set `GEMINI_API_KEY` in Vercel (Production). Without it the visualiser shows "busy" with an example image. Limits: 3 per visitor, 50 per day, 8 MB upload.

## Commands
```bash
npm install
npm run dev          # http://localhost:5190
npm run build        # static dist/ + api/
node scripts/capture.mjs http://localhost:5190 posters   # re-render shader stills (posters|tex|ba|look)
node --experimental-strip-types scripts/credits.mjs      # rebuild CREDITS.md from the registry
node tools/walk.mjs <url> <outDir> 390 844               # phone contact sheet + screen count
```

## Library
`components/library/registry.ts` lists every component with `{ id, name, category, slot, source, author, tradeFit, vibe, perfCost, mobileSafe, needs, status, notes, score }`. `/new-lead` picks from it; `needs` stops a component being used without real content (e.g. `realReviews`). Raw sources sit in `library-inbox/` (not deployed). Signature interactions are in `components/signature/` (pour hero, layer explode, visualiser, flake broadcast, metallic swirl, hot-tyre test, spill test, UV slider). Max 3 per page including the hero.

To add a component to `/lab`: put it in `components/library/<id>/`, add a registry entry, and add `src/pages/lab/demos/<id>.tsx` (default export). The lab picks the demo file up automatically.
