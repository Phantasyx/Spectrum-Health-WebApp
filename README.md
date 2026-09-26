# First Look

Look around an illustrated care room and read what is in it. Upload a panorama and mark new points of interest. Additions stay in this browser.

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

## Host

This site is meant to stand alone at https://firstlook.phantasyx.com/

`wrangler.jsonc` publishes `dist/` as a static Worker and requests that custom domain. `phantasyx.com` must be a zone on the same Cloudflare account, and `firstlook.phantasyx.com` must not already have a CNAME. Cloudflare creates the DNS record and certificate.

```bash
npm run build
npx wrangler login
npx wrangler deploy
```

Public URL: https://firstlook.phantasyx.com/

The deploy also serves `https://first-look.<account>.workers.dev`.
