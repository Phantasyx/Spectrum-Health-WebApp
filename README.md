# First Look

First Look is a browser room tour. A visitor can look around a 360° photograph and read labeled points of interest for orientation, training, or a facility walkthrough.

Sample photographs are ready to open, including care rooms, an office, a market hall, and a lakeshore, so Annotate and Explore work without a file upload. A room you add stays in this browser.

The care rooms are CC0 photographs by Oliksiy Yakovlyev. The office is by Sergej Majboroda, the market hall by Andreas Mischok, and the lakeshore by Greg Zaal. All are CC0 via [Poly Haven](https://polyhaven.com/).

## Images you add

Uploads stay on this device. First Look accepts JPEG, PNG, and WebP files up to 8 MB. The file has to be a complete image, and the contents have to match the declared type. Other types, truncated files, and renamed documents are rejected. An accepted upload is redrawn as a JPEG before it is kept, which drops the file name and camera data. Nothing is stored or executed on a server.

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
