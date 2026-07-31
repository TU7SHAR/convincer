# Private page setup

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Replace `PRIVATE_PAGE_TOKEN` with a long random token.
3. Create a Neon project and paste its pooled connection string into
   `DATABASE_URL`.
4. Run `database/schema.sql` in the Neon SQL editor.
5. Fill in only the contact choices you want to offer.
6. Start the site with `npm run dev`.
7. Open `http://localhost:3000/p/YOUR_TOKEN`.

When `PRIVATE_PAGE_TOKEN` is missing in development, the preview route is
`/p/preview`. Production never accepts this fallback.

## Deployment

Add the same environment variables to the Vercel project before deploying.
The original `public/palak/` folder is excluded by both `.gitignore` and
`.vercelignore`; only reviewed assets under `public/memories/` should be
deployed.

Do not publish until every enabled image, clip, caption, accountability point,
contact link, and response path has been reviewed manually.
