---
description: Build a Clientgateway demo site for a new trades prospect from the master template
argument-hint: "<business name> | <facebook url> | <website url or none> | <phone> | <trade: epoxy|microcement>"
---

# /new-lead

Build a personalised demo site for one prospect from `demos/master`, deploy it, and report to Dan.

Input (from `$ARGUMENTS`, separated by `|`): business name, Facebook URL, website URL (or `none`), phone, trade.
If anything is missing, ask Dan once for all of it, then carry on.

Dan doesn't code. Report in plain English, briefly: what was built, the URL, and what you need from him.

## Hard rules (never break these)

- **Never invent** reviews, ratings, review counts, stats, years trading, prices, product names or codes, certifications, guarantees, licence numbers, addresses or owner names.
- **Every claim needs a source line** in `content-inventory.md`, or it keeps an "Example" label. This covers every number, rating, price, colour code, guarantee and claim word ("waterproof", "fire", "eco", "UV", "years", "certified").
- **Reviews are word for word**, each with its source (`Google` / `Facebook` / …) and URL. If you can't fetch them, ask Dan to paste them. Never paraphrase or write them.
- **Photos:** the prospect's own photos stay in `demos/<slug>/` only. Never copy another client's photos into this demo or into `demos/master`. Never present an AI or stock image as their work; label it "Example image".
- **Image caching:** changed image = new filename (`-v2`), never overwrite.
- **Prices** stay "Example range" unless the prospect publishes their own rates (then cite the URL).
- **Never use** Fable, paid 21st.dev (API, MCP or registry), Higgsfield or any paid tool.
- **Never flat, never plain** (step 4c). Every demo gets a palette with at least three accents and visible depth. Dan rejected Suparesin's first version (flat black + yellow) as "boring, plain, flat".
- **Every lead gets its own premium loader** (step 4b). Never reuse a loader another client has: check `demos/master/loaders-used.md` first.
- **Deploying:** deploy only to the new project `clientgateway-<slug>`. Never touch any other Vercel project. Never print, echo or commit tokens or keys.
- **Git:** commit to the working branch only. Never push to or merge into the default branch without Dan's OK.

## Steps

### 1. Collect facts → `demos/<slug>/content-inventory.md`

`slug` = business name in kebab-case, e.g. `apex-resin-floors`.

1. **Website (if any).** Fetch the home, services, about, contact and gallery pages. Record the following:
   - Business details: name, phone, email, address/town, areas, hours, owner first name, years trading, services, finishes, prices, guarantee text and socials.
   - Logo and photo URLs (download their own photos into `demos/<slug>/public/client/` as WebP).
   - Brand colours: take them from the logo or CSS.
2. **Facebook.** Try to fetch it; it usually fails. If it does, ask Dan to paste:
   - the reviews (text, name, date)
   - the About text
   - 6–10 job photos, if he can save them
3. **Google reviews.** Only if Dan provides them, or a page you fetched shows them.
4. **Inventory format:** one fact per line, in the form `- fact | value | source URL (or "Dan, pasted <date>")`. Put anything you couldn't verify under `## Unverified`.

### 2. Copy the template and set the config

1. Run `cp -R demos/master demos/<slug>`, but exclude `node_modules`, `dist`, `.vercel` and `library-inbox`. Then run `npm install` in the new folder.
2. Edit **only** `demos/<slug>/config/site.ts`. Set `demo: false` and **`sample: false`** (sample content is for the fictional master demo only; a prospect site must never show it), and fill company, shortName, trade, preset, town, region, phone, whatsapp, email, owner, hours, responseTime, areas, socials, proof (real numbers only, otherwise 0), guarantee and reviews.
   - **Unknown fields** stay as the master's labelled examples. Don't guess.
   - **`responseTime`:** use the prospect's own wording if they state it; otherwise use `'quickly'`, never a number.
   - **Visualiser:** disabled and not in the build (needs a paid API). Don't add it back.
3. **Trade pack:** `trade: 'epoxy' | 'microcement'`. If the prospect doesn't offer a service or finish listed in the pack, copy the pack to `config/trades/<slug>.ts`, remove it there, and register it in `config/trades/index.ts`. Set `offersUvStable: true` only with a source.
4. **Preset:** choose from `config/presets.ts` using their logo and photo colours.
   - `obsidian-copper`: luxury, dark/warm.
   - `industrial-steel`: commercial, yellow/grey.
   - `luxury-metallic`
   - `clean-domestic`: bright domestic.
   - `microcement-stone`: microcement.
   - If their brand colour is distinctive, add a `<slug>` preset (copy the nearest one) and register it. Then build the full palette in step 4c: a preset that is only "dark background + their one brand colour" is not finished.
5. **Page shell for the chosen preset:**
   - In `index.html`, set the `<title>`, the `theme-color`, the html/body background and text colours, and the `#boot` loader colours to the preset's `bg`, `ink` and `accent`.
   - If the preset is not `obsidian-copper`, render new hero posters in that preset (never overwrite):
     `CAPTURE_PRESET=<preset> CAPTURE_VER=<preset>-v1 node scripts/capture.mjs http://localhost:5210 posters`
     This needs the dev server running. Then point `site.posters` and the two poster preloads in `index.html` at the new files.
   - For a microcement trade, the trowel hero uses `public/posters/trowel-*`; re-render those with `scripts/capture-trowel.mjs` if the preset differs.
6. **Unknown facts are blank, not examples:**
   - `hours: ''` and the hours line disappears.
   - `owner: { first: '', name: '', … }` and the wording becomes "We'll…" / "One team, start to finish". The monogram uses the company initials.
   - Only reviews, the guarantee and prices keep the labelled example versions.
7. **Their photos:**
   - Replace the gallery `extra` items and the before/after in their trade pack copy, if they have real job photos. Use `by: '<Company> job'`, never "Example".
   - Use a real owner photo only if they publish one.

### 3. Pick components (registry)

Read `components/library/registry.ts`. For each slot, choose entries where:
- `status === 'ported'` and `score >= 9`
- `tradeFit` includes their trade, and `vibe` matches the preset
- every item in `needs` is satisfied by real content:
  - `realReviews` needs at least 3 real reviews
  - `realPhotos` needs at least 6 of their photos
  - `realPrices` needs published prices
  - `ownerPhoto` needs a real photo
  - `uvStable` needs `offersUvStable`
  - `geminiKey` needs a working key

Allow max 3 signature interactions per page, including the hero. The default page in `src/sections/Below.tsx` already follows these rules; only swap a section's component when a better-fitting entry exists.

### 4. Honesty scan (must pass before deploy)

1. Build and run locally (`npx vite --port 5210`).
2. Load `/?gl=off`, scroll to the bottom, and dump `document.body.innerText`.
3. Grep it for: `£`, digits, `%`, `guarantee`, `warrant`, `waterproof`, `fire`, `eco`, `UV`, `years`, `certified`, `rated`, `stars`, `reviews` and hex colour codes.
4. Every hit must either match a line in `content-inventory.md` or sit next to an "Example" or "Illustration" label. Fix anything else.
5. The page must not contain "Demo site, sample content" or any of the master's sample reviews (`config/sample.ts`). If it does, `sample` is still `true`.
6. Check that no other client's images are referenced: grep `dist/` for other demo slugs and their image names.

### 4b. Premium loader (unique per client)

1. **Find one.** Search the free 21st.dev community pages for loaders, preloaders and intro animations, e.g. https://21st.dev/community/components/s/loader and https://21st.dev/community/components/s/text-animation. Quality bar: the Proficient Essex and Wolverhampton loaders.
   - Free routes only: web-fetch the page, or open it in a browser tool (the component page shows the code and usually a GitHub "Source" link with a licence; fetch the raw file from there), or the public scrape listed in `demos/master/library-inbox/SOURCES.md`. If a loader's code can't be reached, batch the misses and ask Dan once to paste "Copy prompt".
   - **Never** the paid 21st.dev API, Magic MCP or registry.
2. **Never reuse.** Read `demos/master/loaders-used.md`. Skip any loader already listed for another client.
3. **Port faithfully first, then re-skin.** Copy the component's structure, CSS and timings as published (inline in `index.html`, no extra JS bundle), then tailor it: the client's logo or wordmark, their brand colours, and a trade-relevant motion where it fits (paving blocks laying in, resin pouring, stone settling). Don't rewrite it your own way.
4. **Rules (check each one):**
   - Total loader time **under 1 s** on the first visit, measured from navigation to the loader being gone.
   - **Skipped on repeat visits** (`sessionStorage`; remove the element before first paint).
   - **Never blocks first paint of the hero poster** (the poster preload and `<picture>` load underneath; the loader is only an overlay).
   - Respects `prefers-reduced-motion` (no motion, short fade).
   - Works on phones (check 390x844 frames at ~200/450/700/900 ms).
   - Keep the `window.__ld` / `wd:loaded` signal the hero waits for.
5. **Credit it** in `demos/<slug>/CREDITS.md` (name, author, licence, 21st.dev URL, code source).
6. **Log it** after deploying: add `client slug | loader name | 21st.dev URL | date` to `demos/master/loaders-used.md` and commit.

### 4c. Colour and depth (no flat looks)

Dan's rule: interesting colours, unique, stands out, with depth. A dark page with one accent colour reads as cheap and boring, even if it's tidy.

1. **Palette = base + 3 accents, not 1.**
   - **Base:** a tinted dark, not pure or warm-neutral black (e.g. midnight petrol `#060A0D`, deep navy, aubergine). Give the body a subtle radial lift at the top, not a single flat fill.
   - **Accent 1 (brand):** their logo or brand colour, kept recognisable.
   - **Accent 2 (warm partner):** a colour that blends with the brand into a rich gradient (gold → copper, red → magenta, blue → violet). Use this gradient on primary buttons, key headline words, big numbers (rating, prices) and active states.
   - **Accent 3 (contrast pop):** a complementary colour used sparingly for labels/eyebrows, icons, focus rings, map lines, slider fills, status dots and glow edges (e.g. electric teal against gold/copper).
   - Look at professional references before choosing: the presets in `demos/master/config/presets.ts`, the coating template palette (midnight `#02070A`, electric blue `#0297DE`, cantaloupe `#FC734D`) and the solar palette. Reference build: Suparesin "Molten" (`demos/suparesin`: `#060A0D`, gold `#F3B31E`, copper `#F07A3E`, teal `#2FD3D9`).
   - Put the palette in CSS variables (accents plus one gradient token, e.g. `--molten`). Don't hard-code hexes in components.
2. **Depth: every section needs at least 2 of these:**
   - Soft coloured glows behind the content: large radial gradients in accents 2 and 3, slowly drifting (paused under reduced motion). Use gradients, not `filter: blur`, so it stays cheap on phones.
   - Glass cards: a translucent gradient fill, an inner top highlight, a big soft shadow and a 1px gradient edge (mask trick) running from accent 1 to accent 3.
   - A fine grain overlay on the page (SVG noise, ~5% opacity, `pointer-events: none`).
   - Gradient seams between sections (a 1px line that fades out at both ends, accent 3 → 1 → 2).
   - Buttons with depth: a gradient fill, an inner highlight, an inner bottom shade and a coloured glow shadow, not a flat fill.
   - Photos in framed cards with a gradient edge and a deep shadow, never just pasted on the background.
3. **No flat full-bleed blocks.** Don't paint a whole section in one flat brand colour (Suparesin's yellow designer block was rejected). Use a dark section lit by accent glows, or a gradient panel with a contrasting glow in one corner.
4. **The 3D/hero scene gets colour too.** Light it with coloured light bars or softboxes in the accent colours, so gloss, metallic and resin surfaces reflect colour instead of one white blur. Open the hero on the client's most striking finish, not the safest one.
5. **Check before deploy.** At 1440x900 and 390x844, every screen must show at least two accent colours and a visible depth cue. If any screen looks like "black + one colour", it fails: fix it.

### 5. Build, deploy and quality gate

1. Run `npm run typecheck`.
2. Deploy as a prebuilt build, because the prerender needs local Playwright:
   ```
   cd demos/<slug>
   npx vercel@latest link --yes --project clientgateway-<slug> --scope dnilicj-2275s-projects
   npx vercel@latest git disconnect --yes --scope dnilicj-2275s-projects   # deploys are prebuilt; Git builds only fail and email Dan
   npx vercel@latest build --prod --yes --scope dnilicj-2275s-projects
   npx vercel@latest deploy --prebuilt --prod --yes --scope dnilicj-2275s-projects
   ```
   `vercel.json` already sends `X-Robots-Tag: noindex` on everything.
3. Run the quality gate (tools are in `demos/<slug>/tools/`):
   - **Screens:** `node tools/walk.mjs <url> /tmp/<slug>-walk 390 844` must give 15 phone screens or fewer.
   - **Screenshots:** take them at 390x844 and 1440x900 with `tools/shot.mjs`, look at them, and fix anything broken or flat. Run the step 4c check on every screen: 3-accent palette visible, depth on every section, no flat single-colour blocks.
   - **Idle:** with no input for 5 seconds, at least 2 things still move.
   - **Lighthouse mobile** (3 runs, `npx lighthouse@12`): performance 85+, LCP under 2.5s, CLS under 0.05. Report the real numbers either way.
4. Commit `demos/<slug>` to the working branch and push.

### 6. Report to Dan (plain English, short)

- The live URL.
- **3 standout interactions** to mention in his DM, in one line each, written as he'd say them, e.g. "drag across the hero and it pours a resin floor".
- **Unverified items:** anything still labelled Example (reviews, guarantee, prices, owner photo).
- **What to ask the prospect for:** reviews, real job photos, prices, guarantee wording, owner photo.
- Lighthouse numbers and phone screen count, on one line.
- **Which loader this lead got** (name + 21st.dev URL).
