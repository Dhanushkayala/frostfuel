# Frostfuel agency and Studio dashboard

Website: https://frostfuel-studio.dearbrioche16.chatgpt.site/
Dashboard: https://frostfuel-studio.dearbrioche16.chatgpt.site/admin

Use the existing studio password from C:/Users/DHANUSH/Frostfuel-studio-access.txt. The Site retains its private review audience and may require ChatGPT sign-in first.

## Install on your laptop

Open the dashboard in Edge or Chrome, sign in and click Install app. If no native prompt appears, use the address bar install icon or browser menu > Apps > Install this site as an app. The Codex browser may not support installation. Internet is required for client data and publishing; sensitive records are not cached offline.

## Manage the agency

- Overview: real enquiry counts, active projects, recorded payments, outstanding balances, pipeline and deadlines.
- Clients: add/edit clients, projects, stages, agreed values, payments, deadlines and private notes.
- Enquiries: follow up on website requests, update statuses and convert them to client records.
- Portfolio: add/edit/delete work, upload JPG/PNG/WebP covers up to 20 MB and add website or video links. Direct video uploads are not implemented.
- Website: edit homepage headline, introduction, availability and contact email, then publish.

Saved portfolio and homepage updates use the same online storage read by the website. New page loads see updates immediately; open visible tabs sync within 30 seconds. No code deployment is needed for content updates. Client records and enquiries stay private behind authenticated APIs.

Bookings are requests, not confirmed appointments. Email links open your mail app. Automatic email notifications, invoices, payment collection and calendar bookings are not configured.

Public visitor access still needs enabling before sharing with prospective clients. Concept previews are labelled and disappear after publishing your first real project.

## Develop

## Picture and video samples

## Customize website colors

Go to Dashboard > Website > Website color palette. Choose Frost, Light, Forest or Ember, or enter custom six-digit hex colors using the color pickers. The embedded website preview shows unpublished changes. Publish palette saves the colors online; open visitor tabs update within 30 seconds. Discard changes restores the last published palette. Contrast feedback flags difficult-to-read combinations, and button/form text chooses a readable light or dark color automatically. Logo and uploaded media colors are unchanged. Palette settings use a separate storage record, preserving homepage content, email and client data. Run node verify-palette.mjs to check permissions, persistence and validation.

Open Dashboard > Samples > Add sample. Upload a JPG, PNG, WebP, MP4 or WebM file (20 MB maximum), add a title/caption and click Publish sample. Videos play directly in the website's Samples section. Optional poster images can also be uploaded. A direct HTTPS video-file URL can be used for larger videos; YouTube/Vimeo page URLs are not direct media files.

The default gallery contains two labelled demo pictures and an original six-second silent motion video. Publishing your first sample replaces the demo set. You can hide demo samples explicitly, and edit or delete your own samples. Deleting the final sample leaves an empty gallery; demos do not reappear. Published changes sync to open website tabs within 30 seconds.

Run node verify-media.mjs to test upload permissions, real image/video uploads, video ranges, publication and deletion. Sample-related files live under samples/ and worker/samples.js.

Run npm run build, node verify.mjs, then npm run dev. Local preview runs at http://localhost:4173 with disposable memory storage and password local-test-only. Production records are not changed by local testing.

Edit landing.html for the website, dashboard.html for Studio, worker/studio.js for client and settings APIs, worker/api.js for existing auth/portfolio/upload APIs, and sw.js for the PWA service worker. build.mjs embeds assets and outputs dist/server/index.js. Preserve .openai/hosting.json when deploying updates.

index.html and brand/brand.css retain the previous design and are no longer deployment inputs.
