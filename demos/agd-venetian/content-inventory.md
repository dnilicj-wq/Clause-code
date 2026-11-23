# AGD Venetian Plastering: content inventory

Every fact on the site, with its source. Read 2026-11-23. Format: `- fact | value | source`.

Sources:
- G = Google Maps listing "AGD Venetian Plastering": https://www.google.com/maps/search/AGD+Venetian+Plastering
- IG = Instagram @agd_venetian_plastering (his own page): https://www.instagram.com/agd_venetian_plastering/

## Business
- name | AGD Venetian Plastering | G, IG
- phone | 07546 402673 (WhatsApp 447546402673) | G; Dan's WhatsApp thread
- rating | 5.0 | G
- review count | 6 | G ("AGD Venetian Plastering 5.0(6) Interior designer · 07546 402673", https://maps.google.com/?cid=8061078434396207726, checked 2026-11-23). A second listing "Agd Venetian plastering" (same number) has no reviews.
- category | Interior designer | G (not shown on site)
- what he does | "Venetian plaster specialist." | IG bio
- who for | "restaurants, hotels and homes" | IG bio (full bio: "Venetian plaster specialist. ♦️bespoke surface design ♦️custom art pieces ♦️restaurants, hotels and homes Contact us for your next project."). No single post shows a restaurant or hotel job, so the site only says it in the "Commercial spaces" tile, from the bio.
- custom work | "custom art pieces" | IG bio
- logo example | "Black textured Venetian plaster with a bronze Liquid Metal logo", "in a dentists" | https://www.instagram.com/p/C35yuC1oQz5/ (28 Feb 2024)
- commercial example | "a photography and event studios … this job we did last year" | https://www.instagram.com/p/C40Ke-JoQct/ (22 Mar 2024)
- torch wall | "Clients wanted an aged look and something rustic for this extension feature wall. We used a variety of materials and colour washes" | https://www.instagram.com/p/CTMsFWPI3XD/
- areas | Essex and London (no towns) | the lead, WhatsApp reply to Dan, 2026-11-23
- hero | no photo: procedural WebGL "polish the wall" (veins matched by eye to his close-ups CTZJWBGoo8v, CR0jeE7BBb1, CYBuGVcIGd7) | code
- logo + brand colour | AGD wordmark, berry #721036 on grey | IG profile picture
- website | none live (IG bio links www.agdvenetianplastering.uk, which has no DNS on 2026-11-23) | checked with dig

## Reviews (Google, word for word, only spacing fixed)
- Dan Luesley, 5 stars, 8 months ago | full text in src/agd/data.ts | G
- Ryan Higgleton, 5 stars, 8 months ago | full text in data.ts (fixed "see,it’s" to "see, it’s") | G
- Danielle Rasor (DanniR), 5 stars, 8 months ago | full text in data.ts | G
- Jinesh Patel, 5 stars, 8 months ago | full text in data.ts | G
- Sam Downing, 5 stars, 8 months ago | full text in data.ts | G
- 6th review | NOT visible without a Google sign-in (limited view shows 5) | TODO(Dan)
- Pull quotes | "The attention to detail is impeccable" (Dan Luesley), "He arrived exactly when he said he would" (Ryan Higgleton), "Great creative eye" (Danielle Rasor) | quoted exactly from the reviews above

## Photos (all his own; files in public/client/)
- Hero + gallery: 32 Instagram posts, file name = post shortcode, e.g. ig-CTMulAKozgi-v1.webp = https://www.instagram.com/p/CTMulAKozgi/ | IG
- google-1-v1.webp | the 1 Google listing photo we could open (uploaded by "Teds Adventures", Feb 2020) | G
- Google listing has 3 photos; the other 2 do not open without signing in to Google | TODO(Dan) if wanted
- Left out on purpose: a mountain painting post, a flowers post, a polished floor post (unclear if it is his plaster)
- Gallery labels (Bathrooms, Feature walls, Kitchens, Stairs & halls) and alt text describe what is visible in each photo. No finish names are claimed.
- No stock, AI or "Example image" fillers used.

## Generic craft text (not claims about AGD)
- FAQ answers | from config/trades/venetian-plaster.ts (general Venetian plaster facts), labelled on page as general answers
- "Plasterers check a wall with a light held flat against it" | general trade practice, torch section

## Not on the site (deliberately)
- Owner name. Reviews say "Ant" and "Antony"; LinkedIn shows Antony Degutis, Director, AGD Venetian plastering. Not confirmed. TODO(Dan): owner name.
- Towns. Yell/MyBuilder/Companies House point to Colchester; not shown. Areas shown are only what the lead confirmed: Essex and London.
- Hours. Google showed "Closes 7 pm" today only. TODO(Dan): hours.
- Google search panel says "5+ years in business"; MyBuilder says "Over the last 8 years" and shows 5.0 from 14 reviews; Yell shows 5.0 (4). Third-party pages, not used.
- Prices, guarantees, insurance, years trading, project counts: none published, none shown.
