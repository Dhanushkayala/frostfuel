# Deploy Frostfuel to your Vercel account

This repository includes the agency website, installable admin dashboard, client tracking, bookings, pictures/videos, portfolio and palette editor. The existing Sites deployment remains separate. Importing this GitHub repository does not deploy to your Vercel account until you complete the setup below.

## 1. Import the repository

In Vercel, choose **Add New > Project > Import Git Repository**, then select `Dhanushkayala/frostfuel` and branch `main`.

- Framework preset: **Other** (no Next.js migration is required).
- Root directory: repository root.
- Build command: `npm run build`.
- Output directory: `public`.
- Node.js: **22.x**.
- `vercel.json` supplies the server function and routes. Do not deploy this as a static-only site or point the output directory at `dist`.

Vercel's Hobby plan is for personal/non-commercial projects. Frostfuel is an agency website; choose a plan permitted for commercial use. Hosting, storage and bandwidth have usage charges/allowances; this setup is not a lifetime-free guarantee.

## 2. Create two Blob stores

Create these in Vercel's Storage tab:

| Store | Access | Environment variable | Purpose |
| --- | --- | --- | --- |
| Frostfuel records | **Private** | `BLOB_READ_WRITE_TOKEN` | Client details, enquiries, project metadata, homepage and palette settings |
| Frostfuel media | **Public** | `MEDIA_BLOB_READ_WRITE_TOKEN` | Only published website pictures/videos and covers |

Connect both stores to your project. Ensure each environment variable holds the token for the correct store; a public store must never be used for client records. Vercel usually sets `BLOB_READ_WRITE_TOKEN` when connecting a store; rename/copy the public store's token into `MEDIA_BLOB_READ_WRITE_TOKEN` without overwriting the private token. Set them for Production, and Preview only if that preview should use those stores. Separate preview stores are preferable when testing changes to avoid altering production data.

Add `ADMIN_PASSWORD` as a strong secret environment variable. It is the password you will enter at `/admin`. Never add these values to GitHub, browser code or README files. `.env.example` lists names only.

Redeploy after configuring the stores and variables. The homepage can render without stores, but publishing, requests and dashboard records require storage.

## 3. Existing data from the Sites deployment

GitHub contains the source and demo assets, not your client records or later uploads. If you have created live records, do not disable the existing Site yet.

The optional migration script copies clients, enquiries, portfolio, samples, homepage content, palette and locally uploaded media from the existing Site to the new Blob stores. It does not delete anything from the source. External media URLs remain external.

Before running it, stop editing the source and accepting new requests while you copy the final state. Start with an empty target private store and do not accept new target records until the copy is verified.

Create an ignored `.env.local` on your laptop with:

```dotenv
SITES_ORIGIN=https://frostfuel-studio.dearbrioche16.chatgpt.site
SITES_ADMIN_PASSWORD=your-existing-studio-password
BLOB_READ_WRITE_TOKEN=your-new-private-store-token
MEDIA_BLOB_READ_WRITE_TOKEN=your-new-public-store-token
```

Then run:

```sh
npm ci
node --env-file=.env.local scripts/migrate-from-sites.mjs
```

The script prints counts only. It refuses a non-empty target by default. If your own migration is interrupted before you have accepted new target data, rerun with `--resume`; that deliberately overwrites the copied records with the source state. Never use `--resume` on a target already receiving new clients or enquiries.

The source API currently returns up to 1,000 portfolio projects/enquiries per request. If either collection is at that size, stop and arrange a paginated export before treating this migration as complete. The script checks for that limit and stops rather than copying an uncertain partial dataset.

## 4. Verify before switching visitors

- Open the new Vercel URL and confirm your services, email, portfolio and samples.
- Visit `/admin`; an anonymous visitor should see the studio password screen.
- Sign in and check client/enquiry counts against the original dashboard.
- Test a new enquiry and check that it reaches the inbox.
- Upload a picture and an MP4/WebM sample, publish, and check playback.
- Publish a palette change and confirm it reaches the website.
- Reload the dashboard and verify records persist.
- Set up your custom domain in Vercel if desired, and share that address after verification.

The dashboard's Install app button works on supported browsers over HTTPS. Reinstall it from the new URL; the old installed app still points at the old Site.

## Implementation and limits

- A Vercel Node.js function adapts the existing Fetch-handler application.
- Private record reads bypass Blob CDN caching so dashboard saves are read consistently.
- Pictures/videos upload directly from the browser to the public media store using authenticated, short-lived tokens; this preserves the 20 MB upload cap without relying on the larger-request-body beta.
- Uploaded file headers are checked before the dashboard receives the final media URL. Public media is intentionally public; never upload client-confidential files as portfolio samples.
- Changes to homepage, palette, portfolio and samples still sync to open website tabs within 30 seconds.
- This small-agency storage model is not a transactional accounting system; concurrent edits to the same record use last-write-wins.
- `npm run dev` uses disposable in-memory preview storage. It does not connect to Vercel Blob. Use a Vercel preview deployment to test real Blob storage and its completion callback.

References: [Vercel Blob private storage](https://vercel.com/docs/vercel-blob/private-storage), [client uploads](https://vercel.com/docs/vercel-blob/client-upload), [Node.js functions](https://vercel.com/docs/functions/runtimes/node-js), [Hobby plan restrictions](https://vercel.com/docs/plans/hobby).
