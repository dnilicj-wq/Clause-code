# Handover: Clientgateway demo sites (solar + coating)

Paste this whole file into the new session as the first message.

---

## 0. First thing: check what state things are in

A previous session may have made changes after the last known-good commit. Before doing anything else:

```bash
cd /home/user/Clause-code
git fetch origin claude/luxury-agency-website-funnel-yBr8n
git log --oneline -8 origin/claude/luxury-agency-website-funnel-yBr8n
git diff 046fc0c origin/claude/luxury-agency-website-funnel-yBr8n --stat -- demos/
```

- **Last known-good commit: `046fc0c`** ("Demo sites: demo mode, price-first estimators, cheaper-quote filters"). It passed every acceptance test in section 6.
- If there are commits after it, review each one against this brief. Keep the good ones and revert the rest. Don't rewrite history: use `git revert`, or fix forward.
- Then run the acceptance tests (section 6) on the local build **and** on the live URLs. Report what you find to the user before making big changes.

## 1. What this is

These are two demo websites for **Clientgateway**, an agency selling high-converting sites to trades businesses. The agency sends the demos to cold prospects on Facebook so they can see their own business on a site that sells. The pitch: "this site filters out tyre kickers and wins against the cheaper quote." The demos must prove that claim, and **must never look unfinished**.

| Site | Niche | Live URL | Vercel project |
|---|---|---|---|
| `demos/solar/` | UK solar + battery installer | https://clientgateway-solar.vercel.app | `clientgateway-solar` |
| `demos/coating/` | US epoxy/polyaspartic garage + driveway coating | https://clientgateway-coating.vercel.app | `clientgateway-coating` |
| `demos/lethal-precision/` | Prospect: Lethal Precision, Hervey Bay QLD (from coating template) | https://clientgateway-lethal-precision.vercel.app | `clientgateway-lethal-precision` |
| `demos/revive/` | Prospect: Revive Coatings, Boise/Nampa ID (from coating template) | https://clientgateway-revive.vercel.app | `clientgateway-revive` |
| `demos/rhino/` | Prospect: Rhino Coating Ltd, Middleton, Manchester (owner David O'Rourke). Standalone static generator, not the coating template | https://clientgateway-rhino.vercel.app | `clientgateway-rhino` |
| `demos/gafflow/` | Prospect: Gafflow Resin Finishes, Eastbourne (installs + courses + shop). Built on the Rhino generator | https://clientgateway-gafflow.vercel.app | `clientgateway-gafflow` |
| `demos/colt/` | Prospect: COLT Building Contractors, High Wycombe roofers. Single-file static page with a 5-step quote form | https://clientgateway-colt.vercel.app | `clientgateway-colt` |

### Prospect demos (session 2026-11-02)
- **Prospect pattern:** copy the coating template, then tailor `site.config.mjs`, the palette in `styles.css` and the images. Set `noindex: true`.
  - Use only the prospect's real facts (phone, areas, prices, claims).
  - Mark unknowns (reviews, hours) as demo values in the config.
  - Never invent owner names, licence numbers or addresses.
- **Revive:**
  - Palette taken from their crimson metallic floor: black `#0B0A0C`, crimson `#C91E48`, pearl `#ECE6E3`.
  - New "Crimson" metallic finish.
  - Logo is their round badge `src/img/logo.png` (white ring, readable on dark).
  - Phone (208) 247-1781; prices start at $4/sq ft.
  - Site shows "Revive Coatings", but the badge says "Revive Epoxy Coatings". The user hasn't decided which.
- **Rhino** (read `demos/rhino/README.md` first):
  - **Content:** built only from a full crawl of rhinocoating.co.uk, recorded in `content-inventory.md`. All 32 live URL slugs are kept (`trailingSlash: false`). `redirects.md`, `beats-current-site.md` and `DESIGN.md` sit alongside.
  - **Editable config:** estimator £/m² rates and the form key (Web3Forms/Formspree, empty = demo mode) are in `rates.config.mjs`. The rates are placeholders for David to set.
  - **Images:** Rhino's own photos only. The hero is the McLaren purple flake image from their Instagram, re-cropped so the whole car shows; it is mood only, never captioned. Their 7-layer Instagram graphic is on `/process` and the garage page. The kitchen photo was excluded as likely stock.
  - **No fake content:** no invented reviews; the reviews section is a labelled Google slot.
  - **Finance maths:** 0% for 12 months, then 9% APR, as a level payment `M = P/(k + annuity)`. His live site's example is wrong.
  - **Mobile layout:** the 3D layer stack fits itself to the viewport. The comparison table becomes a segmented switcher.
  - **Audit build:** `NOINDEX=0 OUT=dist-launch node build.mjs`. Last Lighthouse mobile result: home 100/100/100/100, LCP 1.8s.
- **Gafflow** (read `demos/gafflow/README.md` first):
  - **Base and content:** built on the Rhino generator (UK, multi-page), not the coating template. Content comes from a full crawl of gafflowresinfinishes.com, recorded in `content-inventory.md`. All 65 live URLs are kept with trailing slashes (`trailingSlash: true`), including 41 `/product/<slug>/` pages.
  - **Shop:** every shop, product and course-booking link goes to their existing pages on gafflowresinfinishes.com. `/checkout/` and `/my-account/` redirect there.
  - **Signature:** "Design your floor", a WebGL2 metallic pour shader (`src/js/pour.js`) using their 4 base and 20 metallic pigments, each linked to its product. "Every layer is a Gafflow product" is the layer stack.
  - **Honesty:** testimonials are quoted from their site (there are none for installs, so a Google slot is shown). Estimator rates in `pricing.config.mjs` are placeholders, labelled "Example range". Phone number is one value in `site.config.mjs`. The Arturo PU images are labelled as manufacturer images.
  - **Lighthouse mobile (live, noindex):** home 95/100/100, LCP 1.7s. Their current site scores 28 with LCP 8.4s.
  - **node_modules:** a symlink to `../rhino/node_modules`.
- **Branch note:** this session worked on `claude/awesome-shannon-10jt2i`. Revive, Rhino and Gafflow are on draft PR dnilicj-wq/Clause-code#3, which targets `claude/luxury-agency-website-funnel-yBr8n` and isn't merged yet.

- **Vercel team scope:** `dnilicj-2275s-projects`
- **Do NOT touch** the other Vercel projects in that team: `enrollflo` (the repo-root project described in `/CLAUDE.md`) and `clientgateway`.
- **Note:** `/CLAUDE.md` describes the EnrollFlo project at the repo root, which is a different project. Only its "User preference" line applies here.

## 2. Repo, branch, environment

- **GitHub repo:** `dnilicj-wq/Clause-code`
- **Branch:** `claude/luxury-agency-website-funnel-yBr8n`. This is the repo's default branch, so push straight to it and don't open a PR.
- **Container:** a Claude Code cloud container with outbound HTTPS through an agent proxy.
- **Vercel token:** stored by the user in the environment settings as **`VERCEL_TOKEN`** (Network secrets / env var).
  - Check it with `[ -n "$VERCEL_TOKEN" ] && echo set`.
  - **Never print it, echo it, write it to a file or commit it.**
  - If it isn't set, tell the user and stop the deploy step. Don't try to recover old tokens from chat history.
- **Tools already in the container:**
  - Node 22, npm, ffmpeg.
  - Playwright + Chromium. `require('playwright')` works and `chromium.launch()` needs no options; don't reinstall it. The Chrome binary is `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`.
  - Lighthouse: `CHROME_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx -y lighthouse@12 <url> --only-categories=performance --chrome-flags="--headless=new --no-sandbox"`.
- **No `gh` CLI.** Use the GitHub MCP tools (`mcp__github__*`) for anything on GitHub.

### Deploy (each site separately)
```bash
cd /home/user/Clause-code/demos/solar      # then repeat for demos/coating
npm ci && npm run build                    # must succeed locally first (build fails on any empty token)
npx vercel@latest link --yes --project clientgateway-solar --scope dnilicj-2275s-projects --token "$VERCEL_TOKEN"
npx vercel@latest deploy --prod --yes --scope dnilicj-2275s-projects --token "$VERCEL_TOKEN"
```
- Use `clientgateway-coating` as the project name for the coating site.
- `.vercel/` is gitignored, so re-link in every new session.
- Vercel runs the build itself (`vercel.json`: `npm run build` → `dist`). `.vercelignore` excludes `node_modules`, `dist`, `tools`, `.vercel` and `.env*.local`.
- After deploying, check that the home page, `/areas/<town>/` and `/img/*` all return 200 on the live URL, then run the acceptance tests against the live site.

## 3. How the sites are built

Each folder holds a self-contained static site:
- `site.config.mjs`: **the one file used to tailor the site to a prospect.** It holds tokens, SEO templates, lists (jobs/pairs/drives, reviews, team), areas, `brand` (logo, accent colour), form endpoint, estimator pricing, finance (coating) and deadline (solar).
- `build.mjs` (the same file in both folders, so keep them in sync) does the following:
  - Bundles JS/CSS with esbuild (Three.js is code-split) and inlines Phosphor icons.
  - Bakes `{Token}` values into the HTML.
  - Expands `<!--LIST:name-->…{{field}}…<!--/LIST-->` blocks. `{{initials}}` is derived from the name, and list text may contain `{Company}`, `{Town}`, `{Owner}` or `{OwnerFirst}`.
  - Fills `<!--AREAS-->`, injects `window.__SITE__` and the LocalBusiness JSON-LD, and writes the area pages, sitemap and robots file.
  - **Fails the build if any `{Token}` is left visible** (demo mode). Override with `allowPlaceholders: true`, but never do that for a deployed demo.
  - Adds the home town to `areas` automatically.
  - Wraps any text that contains tokens and follows an icon in a `<span>`. Flex gaps would otherwise add stray spaces around the filled-in values.
- `src/derive.js`: pure functions shared by the build and the browser.
  - **Solar:** `estimate()` (price, saving and payback ranges), plus `DaysLeft` to 31 March 2027, `DeadlineDate`, the sample figures and the battery range.
  - **Coating:** `estimate()`, `monthly()` for finance, `BookingMonth` (today + 21 days), the "From $X" per-sq-ft prices, `MinimumJob`, `FinanceFrom`, and the typical 2-car range.
  - The values are baked into the HTML at build time and refreshed in the browser on load (`refreshDerived`), so they never go stale.
- `src/core.js` contains:
  - personalisation from URL parameters (`?company=&town=&phone=`, which also updates the title and meta tags)
  - `track()`, which sends events to dataLayer, gtag, fbq and an optional beacon (`?debug` shows them as toasts)
  - forms (`wireForm`; radios and file inputs are handled)
  - reveals, count-ups, the FAQ, the sticky header and mobile bar, Lenis smooth scroll on desktop only, `scrollProgress`/`viewProgress`, and `whenReadyFor3D()`
- `whenReadyFor3D()` decides when the 3D loads:
  - **Desktop:** once the page is idle.
  - **Touch devices:** on the first scroll or tap.
  - **Software renderers** (no GPU, e.g. SwiftShader): never; they get poster images.
  - `?gl=force` and `?gl=off` override it. This is what keeps Lighthouse mobile above 85, so **don't load WebGL on page load on mobile.**
- `src/scene.js`: the Three.js r187 scenes.
  - **Solar:** a model house where panels are lowered onto the roof, then a scroll story (survey scan → quote → install → battery at dusk).
  - **Coating:** a garage where a bucket tips and the pour spreads over cracked concrete, with procedural flake/metallic/solid finishes, a mirror floor and a click-to-preview configurator.
- `tools/capture.html` + `tools/capture.js` render stills from the scenes. Bundle `capture.js` with esbuild to `tools/capture.bundle.js` (gitignored), serve the folder, then call `window.capture({...})` from Playwright. The coating capture accepts `outdoor`, `mirror: 0` and `noenv`.
- Images: all are 3D renders in `src/img/`.
  - `hero-poster-m.webp` is the mobile hero poster and loads through `<picture>`.
  - The coating site's `drive-before/after.webp` are close-up floor renders.
  - When tailoring, swap in the prospect's real photos at the same paths.

## 4. The fix brief (already done in `046fc0c`; verify it's all still true)

**Priority 1**
1. **Demo mode with no visible placeholders.** The fictional defaults are **Brightside Solar, Harrogate** (phone `0113 496 0482`, an Ofcom drama number; owner Sam Whitaker) and **Summit Coatings, Boise, ID** (`(208) 555-0147`, a fictional 555 number; owner Marcus Reyes). Reviews, team, warranties, deposit terms, install days, ratings and prices all have realistic sample values. Changing the name, town, phone and logo in the config must restyle the whole site.
2. **No internal notes.** The "Sample renders shown…" and "Demo pricing" text are gone.
3. **Estimators give real numbers.**
   - **Solar:** conservative UK figures; 4.35 kWp ≈ £6,750–£8,250 (~£7.5k mid), a battery adds £3k–£5k, and it shows a savings range plus payback years. The VAT countdown is the number of days to 31 March 2027, calculated from today.
   - **Coating:** $ per sq ft by finish — flake $5–9, metallic $8–12, solid $4.50–7. Cracks add $0.75/sq ft and a previous coating adds $1.50. Minimum job $1,800. A 2-car (484 sq ft) flake floor ≈ $2,420–$4,360. The finishes show "From $X/sq ft".
4. **Price range before contact details.** Visitors answer the questions, see the range instantly, then get "Want the exact figure? Book a free survey/visit". The booking form asks for name, phone, postcode/ZIP and best time to call; coating also asks the timeline question.
5. **Tyre-kicker / cheaper-quote filter.**
   - **Coating:** "Most floors we do land between $2,400 and $4,400. If you've been quoted $1.50 a square foot, here's what got skipped", followed by grinding, moisture test, crack repair, topcoat thickness and warranty. Also "Projects start from $1,800" and the qualifier "This month / 1–3 months / Just researching".
   - **Solar:** "Why our quote might not be the cheapest (and why that matters)", a comparison table (panel/inverter, battery, scaffolding, MCS paperwork, workmanship warranty, aftercare) and a "Got another quote? Send it over" form.

**Priority 2**
- **Mobile sticky bar:** Call + Get my estimate (coating adds Text us via `sms:`). Keep the repeated calls to action.
- **SEO:**
  - LocalBusiness schema built from the config.
  - Meta title and description from `seo` in the config; they must be real tags, not visible text.
  - Canonical and OG tags.
  - `viewport-fit=cover`.
- **Images and reviews:**
  - Every project image has alt text with its town and job type.
  - Reviews look like Google reviews: G logo, stars, count, "Reviews from Google", and avatars with initials.
- **Every form** promises "We reply within 5 minutes during working hours" (`{ResponseTime}`).
- **Solar only:**
  - A "Already got panels? Add a battery" section that mentions 0% VAT.
  - "We don't push finance" plus the full amount payable shown before signing.
  - "Never more than 25% deposit".
  - An EV charger mention.
- **Coating only:**
  - A "Driveways & patios" section with its own before/after (UV stable, no yellowing, slip resistance).
  - "From $52/month" financing (example at 9.99% APR over 60 months, with fine print).
  - "Now booking <month> installs", calculated as today + 3 weeks.
  - "Tap a finish to preview it".
  - System steps in the order Grind → Repair → Base coat → Flake → Topcoat.

## 5. Rules and conventions

- **Spelling and currency:** UK site in British spelling and £; US site in American spelling and $.
- **Demo content:** the sample values are fictional by design (this is demo mode). Don't present them as a real business's facts anywhere outside the demo, and don't invent real certification numbers for a real prospect.
- **Copy style:** plain, honest copy; no hype, no fake urgency beyond the calculated booking month and VAT deadline; no em dashes in the copy.
- **Look:** keep the premium look:
  - **Solar:** warm cream palette from the client's reference: sage `#A3BF6F`, orange `#FF8234` (buttons, dark text on it), cream `#FAE6D8`, deep forest-olive ink. Archivo font. Google Fonts load asynchronously on solar.
  - **Coating:** palette from the client's reference: midnight `#02070A` background, electric blue `#0297DE` for actions (dark text on it for contrast), cantaloupe `#FC734D` for prices and highlights. Big Shoulders Display + Geist, self-hosted in `src/fonts/` and preloaded (Google Fonts caused a hero layout shift).
- **Caching:** `/assets/main.js` and `styles.css` are cached as immutable, so `build.mjs` appends `?v=<hash>` to them. Never remove that, or returning visitors get old CSS/JS with new HTML.
- **Image caching:** `/img/*` is cached for 7 days, so `build.mjs` stamps every image URL in HTML and CSS with `?v=<content hash>` (and exposes `window.__SITE__.imgv` for images set from JS). The build fails if an image attribute is left unstamped. Replacing an image under the same filename is safe.
- **Prospect demos:** copy `demos/coating` (or solar) to `demos/<prospect>`, set `noindex: true` and `lite: true` in its config, deploy as its own Vercel project `clientgateway-<prospect>`. Example: `demos/lethal-precision`.
- **Coating configurator** works without 3D: tabs/swatches are wired up front and swap `src/img/finish-<type>-<key>.webp` stills; the 3D floor takes over when it loads. Re-render those stills (tools/capture, `mode: 'config'`, 1200x840) if `FINISHES` in `src/finishes.js` changes.
- **Changes:** keep them minimal and targeted. Run the acceptance tests before every deploy.
- **Pronouns:** don't assume the owner's gender in templates (`{OwnerStory}` text must not use he/she).
- **Commits:** end every message with the attribution lines your session's system reminder gives you. Never put a model name in commits.
- **User preference:** keep messages minimal and only message when it's important. The user will ask if they need more.

## 6. Acceptance tests (run before saying "done", locally AND on the live URLs)

Serve `dist/` locally with any static server (for Lighthouse, use one that sends brotli/gzip so the result is closer to Vercel).

1. **No placeholders:** at a 390px mobile viewport, the visible text (`document.body.innerText`) of `/`, `/areas/<town>/` and `/privacy.html` contains **zero** `{` or `}`, and no `£0`, `$0`, `0 days` or `0 panels`. No console errors.
2. **Estimators:**
   - **Solar:** fill in postcode → bill → roof → battery. The range, saving, payback and system size appear, and the booking form is hidden until "Book my free survey" is clicked.
   - **Coating:** a price shows on page load and updates when inputs change. The booking form is hidden until "Book my free visit" is clicked.
   - Submitting either form fires `form_submit` and `estimator_lead`.
3. **Config swap:** copy a site to `/tmp`, change Company, Town and Owner, and build. The title, meta tags, reviews, team, schema and area pages all update. The old town should remain only as a service area.
4. **Lighthouse mobile performance ≥ 85.** The last local results were solar 99 and coating 89–90, with accessibility, SEO and best practices at 100.
5. **3D still works on real devices:** with `?gl=force`, the hero stage gets the class `is-live` and there are no errors.

## 7. Connectors, skills and other tools in this account

- **Connectors (MCP) that matter here:**
  - **GitHub** (`mcp__github__*`): repo `dnilicj-wq/Clause-code` only.
  - **Higgsfield** (`mcp__higgsfield__*`): image and video generation. The balance was **1.72 credits** at last check, so check `balance` first and **ask the user before spending credits**.
  - Others connected but not needed for this work: MailerLite, Meta Ads, Supabase, Claude Docs, Claude artifacts, and Claude Code Remote (sessions, scheduled tasks, docs).
- **Skills used to build these sites:** load them via the Skill tool when doing design work.
  - `anthropic-skills:impeccable`: UI audit, polish and hardening.
  - `anthropic-skills:frontend-design`: distinctive, production-grade UI.
  - `anthropic-skills:design-taste-frontend`: anti-template design checks.
  - `anthropic-skills:emil-design-eng`: animation and micro-interaction polish.
  - `anthropic-skills:3d-animation-creator`: scroll-driven 3D/video patterns.
  - `anthropic-skills:trade-prospect-audit`: for tailoring a demo to a real solar or epoxy prospect and writing the outreach.
  - Built-in `code-review`, `simplify` and `run` (to launch the app and screenshot it) are also available.
- **Agent/permission note:** reading credentials back out of chat transcripts is blocked by the environment's auto mode. That's expected; use `$VERCEL_TOKEN`.

## 8. Known caveats (deliberate, not bugs)

- On phones the 3D starts on the first scroll or tap, so the first view is a still poster image. This is what gets Lighthouse above 85.
- The driveway before/after images are close-up renders of the floor, not photos.
- The owner and crew photos are a job image with an owner quote and initials avatars, because there are no real photos.
- On mobile, the solar comparison table labels the right-hand column "Us", because CSS can't print the company name.
- The service-area list keeps the default towns when only the home town changes. Replace `areas` for each prospect.
