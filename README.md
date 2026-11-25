# Hotel Kausi — Website & Property Dashboard

A production-oriented Next.js/React website for Hotel Kausi, Pokhara, with a guest booking flow and an authenticated property-management dashboard.

## Included

- Responsive luxury hotel website built from the supplied Hotel Kausi photography
- SEO metadata, canonical URL, Open Graph, `Hotel` structured data, robots and sitemap
- Room discovery and reservation-request flow
- Admin login, booking status management and offline booking entry
- Date-wise room pricing, availability and sales closure calendar
- Room inventory, homepage content, contact details and package editing
- Cloudinary image upload API and MongoDB persistence
- Safe in-memory demo mode for local preview before credentials are connected

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin is at [http://localhost:3000/admin](http://localhost:3000/admin).

The production admin is stored in MongoDB. Keep the login password out of Git and share it only with authorized Hotel Kausi staff.

## Production configuration

1. Set `MONGODB_URI` to the Hotel Kausi MongoDB Atlas connection string.
2. Set the three `CLOUDINARY_*` variables.
3. Generate a strong `JWT_SECRET`.
4. Generate the admin password hash with:

   ```bash
   node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" 'your-new-password'
   ```

5. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `DEMO_MODE=false`, and the final public `NEXT_PUBLIC_SITE_URL`.
6. Run `npm run build` before deploying to a Node.js-compatible host such as Vercel, Render, Railway or a managed VPS.

Never commit `.env.local` or paste credentials into source files.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```
