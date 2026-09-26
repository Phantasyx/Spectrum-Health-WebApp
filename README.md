# First Look

A static web app for looking around an illustrated care room and reading a plain-language label for the things in it. A second screen lets you upload a panorama and mark new points of interest. Those additions stay in the browser.

## What this is

First Look is a 2026 portfolio demo for [PhantasyX](https://phantasyx.com). It was rebuilt from early student work on a room-orientation viewer: 360° photos, labeled objects, and a form for marking them. This public version does not use that project’s organization name, logo, or outcome claims. The rooms here are illustrations, not photographs of a real facility. The labels are demo text, not medical advice, and this is not a client product.

The 2018 ASP.NET Core sources are in [`legacy/`](legacy/README.md) for provenance only. Do not deploy that folder. A database password that had been committed with those sources has been removed. Rotate it anyway, because it remains in git history.

To publish First Look as its own repository, create `Phantasyx/first-look` and push this tree. The `legacy/` folder can be left out of that repo.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:5173/

## Build the static site

```bash
npm install
npm test
npm run build
```

The build writes `dist/`. Copy the **contents** of that directory to the host folder. Asset URLs are relative, so the folder can live at any path.

Suggested path on phantasyx.com: `/examples/first-look/`

After `npm run build`, copy:

- `dist/index.html`
- `dist/favicon.svg`
- `dist/assets/` (bundled CSS and JavaScript; the hashed filenames change when the source changes)

`npm run preview` serves that folder at http://127.0.0.1:4173/

## Cloudflare Workers

`wrangler.jsonc` is an assets-only Worker: static files, no Worker script. From this directory, after a build:

```bash
npx wrangler login
npx wrangler deploy
```

That publishes `dist/` to the Worker named `first-look`. For a path on an existing site, attach the Worker to a route such as `phantasyx.com/examples/first-look/*`. Relative asset URLs still resolve correctly when the HTML is loaded from that path. `npx wrangler check` validates the config without deploying.
