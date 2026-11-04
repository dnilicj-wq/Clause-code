# Rhino Coating: URL map and redirects

The new site keeps every live URL from rhinocoating.co.uk's sitemap at the same path. **No page-level 301s are needed.**

## Kept, same path (32 URLs from the live sitemap)
| Path | Status |
|---|---|
| `/` | kept (new funnel home) |
| `/epoxy-garage-flooring` | kept |
| `/services` | kept (commercial and industrial) |
| `/process` | kept (one consistent 4-stage process) |
| `/portfolio` | kept |
| `/projects/residential-flake-garage-floor` | kept |
| `/full-flake-garage-floor` | kept |
| `/new-build-garage-flooring` | kept |
| `/floor-preparation` | kept (text ported verbatim) |
| `/warranty` | kept (full terms ported verbatim, summary added on top) |
| `/about` | kept |
| `/contact` | kept |
| `/show` | kept (event landing page) |
| `/terms-and-conditions` | kept (verbatim) |
| `/complaints` | kept (verbatim) |
| `/blog` | kept |
| `/blog/epoxy-flooring-cost-uk-2026` | kept, full article migrated |
| `/blog/epoxy-vs-polyurethane-flooring` | kept, full article migrated |
| `/blog/diy-epoxy-flooring-vs-professional` | kept, full article migrated |
| `/blog/how-to-prepare-garage-floor-epoxy` | kept, full article migrated |
| `/blog/how-long-does-epoxy-flooring-last` | kept, full article migrated |
| `/blog/garage-flooring-ideas-colours-finishes` | kept, full article migrated |
| `/epoxy-flooring-manchester` | kept, rewritten local copy |
| `/epoxy-flooring-london` | kept, rewritten local copy |
| `/epoxy-flooring-birmingham` | kept, rewritten local copy |
| `/epoxy-flooring-leeds` | kept, rewritten local copy |
| `/epoxy-flooring-liverpool` | kept, rewritten local copy |
| `/epoxy-flooring-sheffield` | kept, rewritten local copy |
| `/epoxy-flooring-bristol` | kept, rewritten local copy |
| `/epoxy-flooring-newcastle` | kept, rewritten local copy |
| `/epoxy-flooring-nottingham` | kept, rewritten local copy |
| `/epoxy-flooring-glasgow` | kept, rewritten local copy |

## New URLs
- `/thank-you` (noindex): the quote form lands here.

## 301s to add at launch (host level)
| From | To | Why |
|---|---|---|
| `https://rhinocoating.co.uk/*` | `https://www.rhinocoating.co.uk/*` | The live site mixes non-www and www canonicals (home, garage, about, portfolio and the city pages point at non-www; contact, process and services at www). The new site canonicalises everything to `https://www.` |
| `/*/` (trailing slash) | `/*` (no slash) | One version of each URL. `vercel.json` already has `"trailingSlash": false` and `"cleanUrls": true` |
| `/*.html` | `/*` | Handled by `cleanUrls` |
| `/testimonials` | `/#reviews` | Linked as "Reviews" in the old footer but returns 404 today |
| `/finance` | `/#finance` | Commonly guessed URL that returns 404 today; the calculator lives on the home page |

## Launch checklist
1. In `site.config.mjs`, set `noindex: false`. That removes the robots `noindex` meta and switches `robots.txt` to `Allow` plus the sitemap.
2. Point the domain at the Vercel project and add the www/non-www redirect in Vercel's Domains settings.
3. Submit `https://www.rhinocoating.co.uk/sitemap.xml` in Google Search Console.
