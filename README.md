# Spectrum Health Virtual Reality Experience

Based in Grand Rapids, Michigan, Spectrum Health is a not-for-profit integrated health-care system including 12 hospitals,
8 urgent care facilities and 48 lab centers, making them the largest employer in West Michigan.
For patients and their families, a trip to a hospital or other medical facility is often confusing and stressful.
Strange devices, some rather large and others rather intimidating, seem to be everywhere.
The Spectrum Health Virtual Reality Experience app gives patients and their families the ability to explore Spectrum Health’s many
facilities virtually, from the convenience and comfort of home.
Patients enjoy an interactive experience with a full 360° view. As they look around, items in the room are identified and explained.
From operating rooms to treatment rooms to patient rooms, users learn what’s what before ever entering a Spectrum Health facility,
thereby reducing confusion and stress.
The Spectrum Health Virtual Reality Experience app runs within any desktop or mobile web browser. In addition, the app supports various
virtual reality devices such as an Oculus Rift or a Google Cardboard to provide a completely immersive experience.
Spectrum Health employees use our companion administrative web portal to add new rooms, which includes uploading 360° images and
annotating points of interest within a room.
The Virtual Reality Experience app is written in HTML and JavaScript. A-Frame is used for 360° image browser support. ASP.NET Core
and MSSQL provide server integration.

## Portfolio demo

The public 360° viewer is not in this repository (the admin portal, models, and services are). `demo/` is a static reconstruction of the same product: browse a facility, look around a room, read each point of interest, and use the staff flow to upload a panorama and mark items. Sample rooms are illustrated stand-ins, not photographs of a Spectrum Health facility. Rooms you add stay in the browser; nothing is uploaded.

### Run locally

Requires Node.js 20 or newer.

```bash
cd demo
npm install
npm test
npm run dev
```

Open http://127.0.0.1:5173/

### Build the static site

```bash
cd demo
npm install
npm test
npm run build
```

The build writes `demo/dist/`. Copy the contents of that directory to the host path (for example `phantasyx.com/examples/spectrum-health/`, or a GitHub Pages folder). Asset URLs are relative, so the folder does not have to live at the domain root.

After `npm run build`, the files to copy are:

- `demo/dist/index.html`
- `demo/dist/favicon.svg`
- `demo/dist/assets/` (bundled CSS and JavaScript)

`npm run preview` serves that folder at http://127.0.0.1:4173/ so you can check it before copying.

### Legacy ASP.NET Core app

The original host targets `netcoreapp2.0` and expects SQL Server. The checked-in Azure SQL password has been removed. Put a connection string in configuration only on a machine that should reach the database:

- `ConnectionStrings:DefaultConnection` in `appsettings.json` (left empty in git), or user secrets
- `SHVR_CONNECTION_STRING` for design-time Entity Framework commands in `SHVRAPI.Data/ApplicationDbContextFactory.cs`

Do not commit credentials. Rotate the database password that used to be stored in this repository; it remains in git history.
