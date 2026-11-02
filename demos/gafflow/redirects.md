# Gafflow: URL map and redirects

Every URL in the live Rank Math sitemaps keeps its exact path, trailing slash included (`vercel.json`: `"trailingSlash": true`). **No page-level 301s are needed.**

## Kept, same path
| Path | Status |
|---|---|
| `/` | kept, new home funnel |
| `/installations/` | kept |
| `/residential-services/` | kept |
| `/commercial-services/` | kept |
| `/resin-driveways/` | kept |
| `/pu-comfort-flooring/` | kept |
| `/bespoke-resin-commissions/` | kept |
| `/commercial-floor-installers/` | kept (showroom training) |
| `/courses/` | kept |
| `/resin-business-opportunities/` | kept (franchise) |
| `/gallery/` | kept |
| `/testimonials/` | kept |
| `/contact/` | kept, now with the quote form |
| `/shop/` | kept |
| `/epoxy-resin/` | kept |
| `/epoxy-pigments/` | kept |
| `/deep-cast-epoxy-resin/` | kept, with a working resin calculator |
| `/resin-bound/` | kept |
| `/resin-craft-kits/` | kept |
| `/policies/`, `/terms-and-conditions/`, `/refund-policy/`, `/privacy-policy/` | kept, text ported verbatim |
| `/product/<slug>/` (41 products and courses) | kept, every slug |

## New URLs
- `/thank-you/` (noindex): the quote form lands here.

## Redirects in `vercel.json`
| From | To | Why |
|---|---|---|
| `/checkout/`, `/my-account/` | the live WooCommerce store (302) | Demo only. Replace once the launch checkout is chosen (see README). |
| `/cliens-contract-gafflow-1/` | `/policies/` (308) | Linked from the live policies page, but it already redirects to the home page. |
| `/installations` (no slash) | `/installations/` | Handled by `trailingSlash: true` for every page. |

## Launch checklist
1. In `site.config.mjs`, set `noindex: false` and `siteUrl: 'https://gafflowresinfinishes.com'`.
2. Decide the checkout (README). Then update the two store redirects and the `biz.store` link.
3. Point the domain at the Vercel project and add the www to non-www redirect in Vercel's Domains settings.
4. Submit `https://gafflowresinfinishes.com/sitemap.xml` in Google Search Console.
