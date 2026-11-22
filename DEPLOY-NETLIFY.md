# Update frostfu.netlify.app to the latest Frostfuel app

The live address is a **Netlify** site. Use this guide for that deployment; DEPLOY-VERCEL.md is only for a separate Vercel deployment.

## Deploy from GitHub

1. Open the `frostfu` project in Netlify.
2. Under Build & deploy, link **Dhanushkayala/frostfuel** and production branch **main** if the site is not already connected. A manual drag-and-drop deployment does not receive future GitHub pushes automatically.
3. Use the repository root as the base directory. Let **netlify.toml** configure:
   - Build command: `npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
   - Node.js: `22`
4. Remove any old build settings that publish the repository root, or any old SPA redirect that sends every request to index.html. The generated `public/index.html` is the current landing page; the Netlify function handles `/admin`, `/api/*`, uploads and other dynamic routes.

## Set the admin password

In Netlify **Project configuration > Environment variables**, add **ADMIN_PASSWORD** with a strong password and include the **Functions** scope. Then trigger a fresh production deployment.

The password is a runtime secret. It is deliberately not in GitHub, .env.example, index.html, or netlify.toml. There is no public default production password. If you want to keep the previous Studio password, use the value from your local studio-access file when setting this Netlify variable yourself.

## Storage

The Netlify deployment uses native **Netlify Blobs**, with a site-scoped store named `frostfuel-data`. Netlify Functions supplies storage credentials automatically. Enable Blobs for the site if your account prompts for it. **No Vercel account or Vercel Blob tokens are required on Netlify.**

Client records, enquiry messages and settings are only returned through password-protected APIs. Only the explicit picture/video media routes are public. Reads use strong consistency. Uploads are sent in authenticated 3 MB chunks to preserve the 20 MB file limit while respecting Netlify's per-request limits.

Netlify usage/credit limits still apply. This configuration does not promise lifetime-free hosting.

## Verify the actual deployed version

After deployment, open:

- `/build-info.json`: the deployed source commit and build date.
- `/api/runtime`: must return `platform: "netlify"` and `adminConfigured: true`.
- `/`: must show **Cool ideas. Powerful execution.**, not the old oversized wordmark-only page.
- `/admin`: sign in using the password you set in Netlify.

Test the enquiry inbox, publish a project and a picture/video sample, change the palette, and reload to confirm persistence. Anonymous requests to `/api/clients` and `/api/bookings` must return 401.

## Existing Sites data

Source code updates do not copy live client records from the original chatgpt.site address. Keep the original site online until its data has been migrated and checked. The optional migration script supports Netlify:

```dotenv
SITES_ORIGIN=https://frostfuel-studio.dearbrioche16.chatgpt.site
SITES_ADMIN_PASSWORD=your-old-studio-password
NETLIFY_SITE_ID=your-netlify-project-site-id
NETLIFY_AUTH_TOKEN=your-netlify-access-token
```

Put those values in an ignored `.env.local` on your laptop, never GitHub, then run:

```sh
npm ci
node --env-file=.env.local scripts/migrate-from-sites.mjs --netlify
```

The Netlify site ID is shown in its project settings. The access token is for the local migration only; it is not required in the deployed Netlify function. Use an empty target store, stop incoming writes during the final copy, and compare record counts. See the migration safeguards in DEPLOY-VERCEL.md; `--resume` is only for an interrupted migration before the target accepts new data.

If the new page does not appear after a successful build, confirm the deploy's commit matches GitHub main, clear the Netlify build cache and redeploy, and verify the production domain points to that deploy. Do not upload the old repository-root files through Netlify Drop.
