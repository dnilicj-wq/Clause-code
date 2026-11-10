# AAS Group Construction — outdoor works demo (Clientgateway)

Pitch demo for Ardian (AAS Group Construction Ltd, Northampton). One goal: book a free site visit.
Live: https://clientgateway-aas-group.dnilicj.workers.dev (noindex)

## Run
    npm install
    npm run dev      # http://localhost:5240
    npm run build    # -> dist/

## Deploy (Cloudflare Workers static assets)
Build, then from an EMPTY scratch folder containing only this `wrangler.jsonc`:

    { "name": "clientgateway-aas-group", "compatibility_date": "2026-11-01",
      "assets": { "directory": "<absolute path to demos/aas-group/dist>", "not_found_handling": "single-page-application" } }

run `npx wrangler deploy`. Never run wrangler inside this folder. Credentials live in Dan's shell profile.

## Form
`src/form.ts` builds the full brief and opens WhatsApp to 07777 792227. To also send it to a real
endpoint later, set `FORM_ENDPOINT` at the top of that file (it POSTs JSON, then still opens WhatsApp).

## CONFIRM with Ardian before going live
- Guarantee / aftercare wording (FAQ currently says "ask Ardian at the site visit").
- How fast he replies (success screen says "shortly").
- Postcode coverage list in `src/form.ts` (`coverage()`), built from the towns on his site.
- Swap the 3D visualisations for real photos/video if he prefers; all are labelled "Visualisation".
- His photo, if he wants a face on the page.
