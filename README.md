# Frostfuel

Agency website and installable Studio dashboard for web development and video editing.

## Deploy to Vercel

**Start with [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md).** It covers GitHub import, the private records store, public media store, required secret environment variables and migration from the existing Site.

Vercel setup: Framework **Other**, Node **22.x**, build `npm run build`, output `public`. The repository's `vercel.json` routes website and API requests to the application function.

Required environment variables (values must never be committed):

- `ADMIN_PASSWORD`: your Studio password.
- `BLOB_READ_WRITE_TOKEN`: a **private** Blob store for client records, enquiries and settings.
- `MEDIA_BLOB_READ_WRITE_TOKEN`: a separate **public** Blob store for published pictures and videos.

The GitHub repository contains source and demo media. Live clients, enquiries and later uploads are **not** stored in GitHub. An optional migration script copies those to your own Blob stores without deleting the source; see the deployment guide before using it.

## Features

- Responsive black/cyan agency site with interactive Web/Video previews and enquiry form.
- Password-protected Studio at `/admin`, installable through supported browsers.
- Client pipeline, private notes, deadlines, agreed values, recorded payments and balances.
- Enquiry follow-up statuses and conversion to client records.
- Portfolio and pictures/video samples with cover/poster uploads and 20 MB media limit.
- Homepage copy and contact-email controls.
- Six-color palette editor with presets, preview, hex colors and contrast feedback.
- Published content refreshes in open website tabs within 30 seconds.

The dashboard requires internet. It does not cache private records for offline access. Email notifications, invoicing, payment collection and calendar reservations are not configured.

## Develop and verify

```sh
npm ci
npm run build
npm test
npm run dev
```

Local preview: http://localhost:4173, Studio password `local-test-only`. Preview data is disposable and does not change production records. Use a Vercel preview deployment with separate stores to test real Blob storage and upload callbacks.

## Source map

- `landing.html`, `dashboard.html`: website and Studio.
- `worker/`: shared application routes.
- `platform/`, `api/app.js`: Vercel storage, authentication and upload adapters.
- `samples/`: media editor, gallery and labelled demo media.
- `palette-*`: theme editor and site-wide palette application.
- `build.mjs`: bundles the Worker-style application and browser upload client.
- `sw.js`: network-only PWA service worker.
- `scripts/migrate-from-sites.mjs`: optional private migration to your stores.

The previous Sites deployment remains separate at https://frostfuel-studio.dearbrioche16.chatgpt.site. Pushing to this repository does not alter that Site; after you connect Vercel to GitHub, Vercel controls its own deployments.

The historical `index.html`, `main.js`, `style.css` and `brand/brand.css` are retained but are not current deployment inputs.
