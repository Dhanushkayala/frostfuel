# Frostfuel — latest website and Studio dashboard

**Your existing deployment is Netlify: https://frostfu.netlify.app**

Use **[DEPLOY-NETLIFY.md](DEPLOY-NETLIFY.md)** for this site. The earlier Vercel guide applies only if you choose a separate Vercel deployment.

## What changed

- `index.html` is now the latest **Cool ideas. Powerful execution.** landing page.
- Removed the obsolete landing-page copy, old JavaScript and old styles so they cannot be mistaken for the current app.
- `npm run build` creates `public/index.html` with logo, sample gallery and palette behavior embedded.
- `netlify.toml` sets the correct build, publish directory and backend functions.
- `/build-info.json` identifies the deployed commit and build time.
- Netlify uses native Netlify Blobs with strong-consistency reads. No Vercel Blob tokens are needed for Netlify.
- Protected uploads use authenticated chunks, preserving the 20 MB limit.
- The real admin password is an environment secret and is never stored in GitHub.

## Netlify setup

Connect this repository and branch **main** to your Netlify project. Use:

| Setting | Value |
| --- | --- |
| Base directory | Repository root |
| Build command | `npm run build` |
| Publish directory | `public` |
| Functions directory | `netlify/functions` |
| Node | `22` |

Set **ADMIN_PASSWORD** in Netlify environment variables with **Functions** scope, then redeploy. Enable Netlify Blobs if your account prompts for it. See [the complete guide](DEPLOY-NETLIFY.md) for version checks and troubleshooting.

## Features

- Responsive agency landing page with interactive previews, services, work samples and enquiry form.
- Installable password-protected Studio at `/admin`.
- Client pipeline, deadlines, private notes, agreed project values and payment balances.
- Enquiry follow-up and client conversion.
- Portfolio, picture and playable video publishing with covers/posters.
- Homepage and contact-email controls.
- Six-color palette editor with presets, preview and contrast feedback.
- Published changes refresh in visible website tabs within 30 seconds.

The dashboard needs internet. It does not cache private records offline. Automatic email notifications, invoicing, payment collection and confirmed calendar bookings are not configured.

## Existing data

GitHub stores code and demo assets, **not** live client records or later uploads from the original Sites deployment. Keep the original site online until migration and verification are complete.

The optional `scripts/migrate-from-sites.mjs --netlify` copies source data and media to Netlify without deleting the old data. Read [migration instructions](DEPLOY-NETLIFY.md#existing-sites-data) before using it; credentials stay in an ignored local environment file.

## Develop and verify

```sh
npm ci
npm run build
npm test
npm run dev
```

The local preview runs at http://localhost:4173 and uses disposable memory storage with the test password `local-test-only`. It does not modify production. The real Netlify storage context and deployed secrets must be verified after deployment.

## Files

- `index.html`, `dashboard.html`: current website and dashboard source.
- `worker/`: shared application APIs.
- `netlify/functions/app.mjs`, `platform/netlify-*`: Netlify backend, persistence and uploads.
- `samples/`, `palette-*`: media gallery and customizable palette.
- `build.mjs`: generated website, backend bundle and upload client.
- `sw.js`: network-only PWA service worker.

For Vercel instead, [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md), `vercel.json` and `api/app.js` remain available as a separate deployment option. Its storage requirements differ from Netlify.

The previous Site remains at https://frostfuel-studio.dearbrioche16.chatgpt.site; GitHub/Netlify updates do not change that separate deployment.

## Direct UPI payments

The website Pay section accepts a client’s agreed amount in INR and generates a QR and UPI app link for `kayaladhanush8@pingpay`. QR codes are generated in the browser, without a third-party QR service. Clients submit their 12-digit UTR/RRN after paying. The site records this as **Under review**, never automatic payment success.

In **Admin → Payments**, verify the recipient, exact amount and transaction reference in your bank/UPI app, then check the verification box and confirm receipt. Confirmed totals exclude unverified submissions. The Clients tab’s manually entered paid balance stays separate to avoid double-counting existing records.

The Payments tab also allows changing the UPI ID, display name and instructions, pausing payments, reviewing/rejecting references, cancelling unpaid requests and copying checkout links. Existing requests retain the UPI recipient captured when they were created. A global pause disables all outstanding checkouts. Share checkout links only with the relevant client; they are unguessable access links showing project, amount and payment status. Client names, email addresses and submitted UTRs are admin-only.

This is direct UPI with manual reconciliation, not a gateway integration. No bank API/webhook is connected, and validity/settlement of the supplied UPI account cannot be independently verified by this code. Confirm the receiver in a UPI app and perform a small real payment yourself before relying on it for customer payments. No live money transfer is performed by the automated tests.
