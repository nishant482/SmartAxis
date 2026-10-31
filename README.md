# SmartAxis

React/Vite website with a MongoDB-backed Express API and a private admin workspace.

## Run locally

1. Install packages: `npm install`.
2. The public site works immediately in portfolio mode, without a database. To enable contact storage and admin access, copy `.env.example` to `.env` and set `MONGODB_URI`. Do not overwrite an existing `.env`.
3. When using MongoDB, run `npm run admin:setup` once. Initial login details are written to the ignored `.admin-access.local` file.
4. Run `npm run dev` to start Vite on port 5173 and the API on port 4000.
5. Website: http://localhost:5173. Admin: http://localhost:5173/admin.

This clone does not include database credentials or an admin account. Without MongoDB, the public catalogue remains available and contact submissions/admin operations return a clear configuration error. The contact button stays disabled until the API reports database availability. After configuring an account, change the initial password in **Admin > Account**. Do not put database credentials in `VITE_` variables, browser code, or Git.

## Real project portfolio

`src/data/portfolio.js` contains 30 owner projects and published applications, including 19 verified SmartAxis apps. Public headings use product-type descriptions rather than client names; original titles remain in the data for maintenance and admin matching. No installation counts, ratings, testimonials or outcomes are claimed.

The gallery and product detail pages share the dark studio theme. Real public website previews and sign-in screens appear in browser mockups; official Google Play screenshots appear in phone mockups. The fashion preview was refreshed after the live storefront photography finished loading. Authenticated workspaces and customer data are never captured. BMTIndiaTech and THLSemi block automated previews and use visibly labeled illustrative interface studies.

`src/data/previews.js` maps local previews to their public sources. `public/portfolio/screens/` contains 42 official app screenshots, and `public/portfolio/apps/` stores the official icons. Run `node scripts/refresh-product-previews.mjs` to refresh public sources, or append `apps` to fetch only missing application screens. `node scripts/fetch-app-assets.mjs` fetches missing official icons. These optional maintenance scripts require Playwright and installed Chrome.

Sources: [SmartAxis developer catalogue](https://play.google.com/store/apps/developer?id=SmartAxis), [Sanatan Wallpaper](https://play.google.com/store/apps/details?id=com.sanatan.hindu.wallpapers), [VBike Smart](https://play.google.com/store/apps/details?id=com.livsmart.vbike_app), [VBike HR](https://play.google.com/store/apps/details?id=com.livsmart.dealercomplaint).

The curated catalogue is prerendered and available without API connectivity. Published admin entries can add projects or override a curated entry by title. Edit curated entries in `src/data/portfolio.js`; they are not database records and cannot be deleted in the admin panel.

## Admin features

- Overview with project, published-project, inquiry, and unread counts.
- Add, edit, search, and delete projects.
- Project title, description, live URL, category, image, display order, published/draft state, and homepage feature flag.
- Upload JPG, PNG, or WebP files from your device (maximum 4 MB / 40 megapixels). Images are validated, resized, and converted to WebP.
- Published projects appear on the portfolio and their own detail pages. The homepage shows up to four featured projects, falling back to the first four published projects.
- Contact submissions are saved in MongoDB and appear in the admin inbox. View contact details, change inquiry status, reply using your mail application, or delete an inquiry. The application does not send email automatically.
- Eight-hour HTTP-only sessions, sign-out, and password changes. There is no public admin registration.

The public site uses one persistent header. Route changes replace page content, not the navbar. The admin area has its own layout and does not render the public header/footer.

## Data and images

The database name is configured by `MONGODB_DB` (default `smartaxis`). Collections are `admins`, `sessions`, `projects`, and `inquiries`. Existing portfolio examples are not automatically inserted into the database.

Local hosting stores images in `server/uploads` and serves them through `/uploads`; back up both MongoDB and this folder. The Vercel entrypoint stores processed images in the MongoDB `projectImages` collection and serves the same URLs, so redeploys do not lose images. Existing local files are not automatically migrated. Uploads are limited to 4 MB to leave room for multipart fields within Vercel's request limit.

Secrets, login details, uploads, and the local package cache are excluded from Git.

## Production

### Vercel

`vercel.json` builds the Vite frontend, sends `/api/*` and `/uploads/*` to `api/index.mjs`, and sends page URLs to `index.html` so direct visits and refreshes work.

On `https://smartxapp-studio.vercel.app`, the API base is **`https://smartxapp-studio.vercel.app/api`**. The browser deliberately uses relative `/api/...` URLs, keeping login cookies on the current domain and local development working without CORS. Do not put this address in `MONGODB_URI`.

In Vercel **Project > Settings > Environment Variables**, configure these server-only values for Production, then redeploy:

- `MONGODB_URI`: the connection string from your ignored local `.env`.
- `MONGODB_DB`: `smartaxis`.
- `PUBLIC_ORIGINS`: `https://smartxapp-studio.vercel.app` (comma-separated exact origins if adding a custom domain).
- `ADMIN_USERNAME`: `admin`.
- `ADMIN_PASSWORD_HASH`: the existing hash from `.env`, only needed to bootstrap an account in a new database. Existing database accounts keep their current password.

Keep secrets out of `VITE_` variables and Git. Atlas must allow connections from the deployment. Check `/api/health` for JSON with `database: "connected"`, then open and refresh `/about` and `/admin/projects`. A 503 JSON API response means the function is reachable but database configuration/connectivity still needs attention.

### Persistent Node server

Run `npm run build`, then `npm start` to serve the API and compiled website together on port 4000. For a public deployment configure `HOST`, `PORT`, `PUBLIC_ORIGINS` with the exact HTTPS website origin, and `NODE_ENV=production`. HTTPS is required for the production session cookie. Ensure the server IP can access your Atlas cluster. Keep `NODE_ENV=development` out of `.env` when building, so the React production build is used.

`npm run dev:client` and `npm run dev:server` can also start the two development processes separately. Restart the API after changing `.env`. `npm run preview` is a frontend preview only; the API must also be running.

## Search visibility

SEO targets businesses in India without inventing a local office or address. `npm run build` generates readable HTML for 18 public pages, unique titles/descriptions, canonical links, social previews and Organization/WebSite/Service structured data. The client hydrates this HTML and updates metadata during navigation. Dynamic project pages load their content and metadata from the API.

`/robots.txt` advertises `/sitemap.xml`. That sitemap index references static public pages and `/sitemap-projects.xml`, which lists currently published projects and refreshes within five minutes. Admin routes send `X-Robots-Tag: noindex, nofollow`; unknown static routes return the custom 404 page.

To request indexing, verify the URL-prefix property `https://smartxapp-studio.vercel.app/` in Google Search Console and submit `sitemap.xml`. If using HTML-tag verification, add Google's exact verification meta tag to `index.html` and redeploy. Use URL Inspection to request indexing of the homepage and important services. Search indexing and rankings are controlled by Google, not guaranteed by these changes. Update the canonical origin, sitemap URLs and structured data if moving to a custom domain.

## Verification commands

- `npm run build` and `npm run lint`.
- `node --test tests/portfolio.test.mjs tests/seo.test.mjs tests/origins.test.mjs`: no-database catalogue behavior, admin/contact rejection in portfolio mode, managed overrides, prerendered pages and production routes.
- `node scripts/check-portfolio-browser.mjs`: desktop/tablet/mobile layout, real portfolio filtering, keyboard tabs, app links, mobile navigation and unconfigured contact state. Uses an optional local Playwright install (`npm install --no-save --package-lock=false playwright`) and installed Chrome. Screenshots are saved in ignored `qa/`.
- `npm run test:backend`: creates a uniquely named temporary MongoDB database; verifies authentication, protected endpoints, validation, local image lifecycle, draft visibility, inquiry idempotency, statuses, password changes, and sign-out. Removes only its temporary database and upload folder afterward.
- `node admin-browser-check.cjs`: checks the persistent navbar, login, project uploads/publishing, public project rendering, contact-to-inbox flow, and responsive admin layouts. Creates clearly labeled browser-test records in the configured database and removes them in cleanup. Reads initial login details from `.admin-access.local`; update that local file if you change the test account password.
- `node browser-check.cjs`: checks public routes, responsive layouts, filters, solution tabs, FAQs, and mobile navigation.
- `node future-check.cjs`: checks the hero renderer and project tabs using isolated browser fixtures.

Browser scripts use the local Playwright and Chrome paths at the top of each script. Update those paths if moving to another computer.

## Main files

- `server/app.mjs`: validated API, authentication, local image processing, contact storage.
- `server/index.mjs`: database connection, indexes, account bootstrap, HTTP server.
- `src/pages/Admin.jsx`: admin workspace, project editor, inbox, and account settings.
- `src/lib/api.js`: browser API client and resource loading.
- `src/pages/Contact.jsx`: live contact submission with retry/error states.
- `src/components/WorkShowcase.jsx`, `ProjectCard.jsx`: database-driven public projects.
- `src/App.jsx`: persistent public shell and separate lazy-loaded admin layout.

Implementation references: [MongoDB Node driver](https://www.mongodb.com/docs/drivers/node/current/connect/), [Multer upload limits](https://expressjs.com/en/resources/middleware/multer/).

The homepage and app filters use compact cards linking directly to Google Play, with three app cards per row on mobile. Process navigation and its page were removed; the old /process URL redirects to the homepage. Decorative arrows have been removed from the studio interface.

## Category-wise apps and blog publishing

- `/apps` and the homepage group apps into Sanatan Bhakti & Devotional, Games, Study Material, and More Apps. Mobile grids retain three apps per row.
- `catalogueApps` includes 19 verified published apps and four owner-supplied testing games. Testing games carry a Testing label and open the exact supplied Play Store URLs; visibility depends on Google Play testing access. They are not counted as published apps.
- `/blogs` is a live, searchable, category-filtered journal. Only published articles are returned by public APIs and the blog sitemap. No demonstration articles are automatically published.
- Sign into the existing `/admin` account, then open `/admin/blogs`. Add a title, URL slug, category, excerpt and plain-text content; an image is optional. Category suggestions include the requested topics, and typing another category creates it through the saved article. Save a draft, preview it, then choose Published to make it visible.
- Drafts are available only to authenticated admins. Articles and their status are stored in MongoDB `blogPosts`; cover images use the existing validated local or MongoDB image storage. The database adds a unique slug index and a publication/category index. Changing an article slug changes its public URL.
- `GET /api/blogs`, `GET /api/blogs/:slug`, and `/sitemap-blogs.xml` are public read endpoints. Admin list/create/update/delete routes live under `/api/admin/blogs` and use the existing session, origin and upload checks.
- `node --test tests/blogs.test.mjs` verifies category classification, testing state, authenticated CRUD, draft visibility, filtering, slug conflicts and image cleanup without touching the production database.
- `node scripts/check-content-browser.mjs` checks app categories and mobile layout, testing links, and the admin editor with isolated browser fixtures. It does not create live articles.

## Homepage and search setup

The homepage is ordered hero, selected apps, websites, services, published articles (hidden when empty), and contact. /websites lists only websites and web platforms; /apps lists the complete Android collection. /portfolio redirects permanently to /websites.

Sanatan Wallpapers has a statically rendered landing page at https://smartxapp-studio.vercel.app/apps/sanatan-wallpapers with a canonical URL, SoftwareApplication schema, official screenshots, and an internal homepage link. It is included in sitemap-pages.xml. Organization and WebSite schema, public page canonical tags, robots.txt and the sitemap index are generated/published with the site.

Google Analytics uses measurement ID G-5B8S4H1W11 on production public pages; an Analytics property link alone does not grant Search Console or account access. Microsoft Clarity is deferred at the owner's request; no Clarity script is installed.

Search Console owner steps: verify the URL-prefix property for https://smartxapp-studio.vercel.app, submit sitemap.xml, then inspect /apps/sanatan-wallpapers and request indexing. Google decides indexing; deploying does not confirm inclusion. Google Business Profile is a separate account setup and needs the owner's real business/contact details and eligibility for in-person customer contact. No profile or address has been invented.
