# First Look

Look around a 360° photograph of a care room and read what is in it. Upload a panorama and mark new points of interest. Additions stay in this browser.

The three sample rooms are CC0 photographs by Oliksiy Yakovlyev from [Poly Haven](https://polyhaven.com/hdris/interiors/retail-commercial/medical-healthcare).

Public site: https://firstlook.phantasyx.com/

## Run

Node.js 20 or newer.

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:5173/

## Build

```bash
npm run build
```

Output is `dist/`. `npm run preview` serves it at http://127.0.0.1:4173/

## Host on firstlook.phantasyx.com

`wrangler.jsonc` publishes `dist/` as a static Worker and requests `firstlook.phantasyx.com`.

1. `phantasyx.com` is a zone on the same Cloudflare account.
2. `firstlook.phantasyx.com` must not already have a DNS record. A custom domain cannot be created on a hostname that already has a CNAME.
3. Do not add a CNAME yourself. Deploy creates the DNS record and the certificate.

```bash
npm run build
npx wrangler login
npx wrangler deploy
```

Then open https://firstlook.phantasyx.com/

The deploy also serves `https://first-look.<your-workers-subdomain>.workers.dev`.
