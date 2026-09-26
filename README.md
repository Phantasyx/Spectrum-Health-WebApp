# First Look

Look around an illustrated care room and read what is in it. Upload a panorama and mark new points of interest. Additions stay in this browser.

Public site: [https://firstlook.phantasyx.com](https://firstlook.phantasyx.com)

Public repository to create: [Phantasyx/first-look](https://github.com/Phantasyx/first-look)

## What this is

First Look is a 2026 portfolio demo for [PhantasyX](https://phantasyx.com). It was rebuilt from early work on a room-orientation viewer. It does not use that earlier project’s organization name, logo, or outcome claims. The rooms are illustrations, not a real facility. The labels are orientation text, not medical advice, and this is not a client product.

## Publish Phantasyx/first-look

Publish this tree as its own repository with a new git history, so the public project name stands alone and the older history is not copied.

```bash
git clone --branch cursor/modernize-spectrum-health-demo-99bc --single-branch \
  https://github.com/Phantasyx/Spectrum-Health-WebApp.git first-look
cd first-look
rm -rf .git
git init -b main
git add .
git commit -m "Publish the First Look portfolio demo."
gh repo create Phantasyx/first-look --public \
  --description "Browser tour of illustrated care rooms. A PhantasyX portfolio demo." \
  --source=. --remote=origin --push
```

Leave the 2018 repository as the archive. Do not merge this branch into it. That repository’s history still contains a database password that was removed from the files. Rotate the password.

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

`wrangler.jsonc` is an assets-only Worker. It has no Worker script. It already requests the custom domain:

```jsonc
"routes": [
  { "pattern": "firstlook.phantasyx.com", "custom_domain": true }
]
```

Requirements, from [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/):

1. `phantasyx.com` is an active zone on the same Cloudflare account you deploy with.
2. No DNS record already exists for the hostname `firstlook.phantasyx.com`. A custom domain cannot be created on a name that already has a CNAME. In the dashboard, open the DNS records for `phantasyx.com` and delete any record whose name is `firstlook`.
3. Do not add a CNAME yourself. Deploy creates the DNS record and the certificate.

```bash
npm install
npm test
npm run build
npx wrangler login
npx wrangler deploy
```

Then open https://firstlook.phantasyx.com/

Wrangler also prints the workers.dev URL. Its shape is `https://first-look.<your-workers-subdomain>.workers.dev`. The workers subdomain is the value under Workers & Pages → Your subdomain, not the Cloudflare account name. `workers_dev` is enabled, so that hostname stays up next to the custom domain.

Dashboard path, if you deploy once without the `routes` block and attach the name afterward: Workers & Pages → `first-look` → Settings → Domains & Routes → Add → Custom domain → `firstlook.phantasyx.com`.
