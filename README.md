# SmartAxis

React/Vite website with a MongoDB-backed Express API and a private admin workspace.

## Run locally

1. Install packages: `npm install`.
2. For a new installation, copy `.env.example` to `.env` and set `MONGODB_URI`. Do not overwrite an existing `.env`.
3. Run `npm run admin:setup` once. Initial login details are written to the ignored `.admin-access.local` file.
4. Run `npm run dev` to start Vite on port 5173 and the API on port 4000.
5. Website: http://localhost:5173. Admin: http://localhost:5173/admin.

This workspace already has its database and initial account configured. Change the initial password in **Admin > Account** after signing in. A password change signs out all current sessions. Do not put database credentials in `VITE_` variables, browser code, or Git.

## Admin features

- Overview with project, published-project, inquiry, and unread counts.
- Add, edit, search, and delete projects.
- Project title, description, live URL, category, image, display order, published/draft state, and homepage feature flag.
- Upload JPG, PNG, or WebP files from your device (maximum 5 MB / 40 megapixels). Images are validated, resized, and converted to WebP.
- Published projects appear on the portfolio and their own detail pages. The homepage shows up to four featured projects, falling back to the first four published projects.
- Contact submissions are saved in MongoDB and appear in the admin inbox. View contact details, change inquiry status, reply using your mail application, or delete an inquiry. The application does not send email automatically.
- Eight-hour HTTP-only sessions, sign-out, and password changes. There is no public admin registration.

The public site uses one persistent header. Route changes replace page content, not the navbar. The admin area has its own layout and does not render the public header/footer.

## Data and images

The database name is configured by `MONGODB_DB` (default `smartaxis`). Collections are `admins`, `sessions`, `projects`, and `inquiries`. Existing portfolio examples are not automatically inserted into the database.

Images are stored in `server/uploads`, outside the build output, and served through `/uploads`. MongoDB stores their paths and project metadata. Back up **both MongoDB and this folder**. Hosting requires a persistent writable disk; an ephemeral deployment filesystem will lose uploaded images. Rebuilding `dist` does not remove uploads.

Secrets, login details, uploads, and the local package cache are excluded from Git.

## Production

Run `npm run build`, then `npm start` to serve the API and compiled website together on port 4000. For a public deployment configure `HOST`, `PORT`, `PUBLIC_ORIGINS` with the exact HTTPS website origin, and `NODE_ENV=production`. HTTPS is required for the production session cookie. Ensure the server IP can access your Atlas cluster. Keep `NODE_ENV=development` out of `.env` when building, so the React production build is used.

`npm run dev:client` and `npm run dev:server` can also start the two development processes separately. Restart the API after changing `.env`. `npm run preview` is a frontend preview only; the API must also be running.

## Verification

- `npm run build` and `npm run lint`.
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
