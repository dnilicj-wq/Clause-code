# Butler's Resin & Construction: resin driveway demo

Pitch demo for Butler's Resin & Construction Ltd, Chatteris (Cambridgeshire & the Fens). Built from the Wolverhampton Driveways demo on branch `claude/butlers-resin-demo`.

- Live: https://clientgateway-butlers-resin.dnilicj.workers.dev (Cloudflare Workers, noindex)
- Facts and sources: content-inventory.md (incl. "Unverified / ask Yaz")
- Hero: his job photos full-bleed per surface (scripts/prep-hero.mjs), crossfade + Ken Burns + CSS scroll-driven parallax; blend chips feed the survey email
- Sections: src/pe/ (Hero, Survey stepper, sections.tsx: Proof, BeforeAfter, Services, Process, Reviews, Areas, Faq, Footer, StickyBar)
- Survey form: 5 steps, builds a pre-filled email to info@butlersrc.co.uk (no backend)
- Loader: inline in index.html (Preloader pattern, @info-mdshakeeb on 21st.dev, rebuilt)
- No prices, no guarantees, no "fully insured" (not found in his sources)
- His photos: scripts/prep-client.mjs (research/raw -> public/client)
- Polish screenshots: research/polish/

## Deploy
Build with `npm run build`, then `npx wrangler@4 deploy` from a folder whose wrangler.jsonc has
name `clientgateway-butlers-resin` and assets.directory pointing at this dist (SPA not_found_handling).
