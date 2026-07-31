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

## Super admin

1. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in the environment.
2. Run the latest `database/schema.sql` in Neon.
3. Restart the development server after changing environment variables.
4. Open `http://localhost:3000/admin` and sign in with `ADMIN_PASSWORD`.

The dashboard shows deliberate responses and visit timelines recorded only after the visitor explicitly chooses **Allow visit timeline**. It does not collect IP addresses, device fingerprints, inferred phone numbers, or typing activity.
## Direct SMTP visit alerts

Set the following server-only environment variables and restart the server:

- `SMTP_HOST`
- `SMTP_PORT` (`465` for direct TLS or `587` for STARTTLS)
- `SMTP_SECURE` (`true` for port `465`, otherwise `false`)
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM` (falls back to `SMTP_USER`)
- `VISIT_NOTIFICATION_EMAIL` (falls back to `CONTACT_EMAIL`)

For a personal Gmail account, use `smtp.gmail.com`, port `465`, and a Google
App Password created after enabling 2-Step Verification. Never put your normal
Gmail password in the project.

Each new consented visit or named-section stamp sends one email with the subject
**Your site is being reviewed**. Duplicate stamps are ignored by Neon and do not
send duplicate messages. The super admin shows whether each event email was sent
or failed.