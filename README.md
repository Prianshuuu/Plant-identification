# PlantID: React + Express + MongoDB

React (Vite, TypeScript) frontend, Express API, MongoDB (Mongoose), JWT auth in httpOnly cookies,
role-based authorization, and Multer image uploads.

## Run it

```bash
# 1. Copy your existing shadcn files over (see "Keep from your old project" below)
# 2. Install and configure
npm install
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, API keys
# 3. Optional: create the admin user + starter blog posts
npm run seed
# 4. Develop (API on :5000, React on :5173 with /api proxied)
npm run dev
```

Production: `npm run build && npm start` (Express serves `dist/` and the API on one port).

## Folder structure (same top-level layout as before)

| Old (Next.js)                  | New                                             |
| ------------------------------ | ----------------------------------------------- |
| `app/layout.tsx`               | `app/layout.tsx` (React Router layout) + `index.html` (metadata) |
| `app/*/page.tsx`               | `app/*/page.tsx` (same routes, lazy-loaded)     |
| `app/loading.tsx`              | `app/loading.tsx` (Suspense fallback)           |
| `app/api/plantid/route.ts`     | `server/routes/plantid.js`                      |
| `app/api/trefle/route.ts`      | `server/routes/trefle.js`                       |
| `components/`, `hooks/`, `lib/`| unchanged location; auth added                  |
| (new)                          | `server/` (config, models, routes, middleware)  |

## Keep from your old project (copy over unchanged)

`components/ui/*`, `components/theme-provider.tsx`, `hooks/use-toast.ts`, `hooks/use-mobile.tsx`,
`lib/utils.ts`, `app/globals.css`, `public/*`. Set `"rsc": false` in `components.json`.
Move `app/search/images.webp` into `public/`.

Delete: `.next/`, `next.config.mjs`, `next-env.d.ts`, `pnpm-lock.yaml`, `app/api/`, and the per-route `loading.tsx` files.

## API

| Method | Route                  | Access        | Notes                                     |
| ------ | ---------------------- | ------------- | ----------------------------------------- |
| POST   | `/api/auth/register`   | public        | First user with `ADMIN_EMAIL` becomes admin |
| POST   | `/api/auth/login`      | public        | Sets httpOnly cookie                      |
| POST   | `/api/auth/logout`     | public        |                                           |
| GET    | `/api/auth/me`         | user          |                                           |
| PATCH  | `/api/users/me`        | user          | name, bio                                 |
| PUT    | `/api/users/me/avatar` | user          | Multer, field `avatar`, 2 MB              |
| POST   | `/api/plantid`         | guest/user    | Multer (memory), field `image`, 8 MB; requires a valid `PLANTID_API_KEY`; 10/h guests, 60/h users |
| GET    | `/api/trefle?q=`       | public        | Cached proxy                              |
| GET/POST/DELETE | `/api/garden` | user          | Owner-only delete (admin override); Multer field `image` |
| GET    | `/api/posts`, `/:slug` | public        |                                           |
| POST/PATCH/DELETE | `/api/posts` | admin        | Multer field `cover`                      |
| POST   | `/api/contact`         | public        | 5/hour per IP                             |
| GET/DELETE | `/api/contact`     | admin         |                                           |

## Security notes

- Passwords hashed with bcrypt (cost 12); login errors don't reveal whether an email exists.
- JWT lives in an httpOnly, SameSite=Lax cookie (not readable by JS). Serving the API and
  React app from the same origin keeps this simple; for separate domains you'd need `SameSite=None; Secure` plus CSRF protection.
- Uploads: MIME allow-list (JPG/PNG/WebP), random filenames, size limits, orphan cleanup on failure.
  Uploaded files live in `uploads/`. Use object storage (S3/Cloudinary) if you deploy to a host with an ephemeral disk.
- Request bodies validated with Zod; Helmet, CORS, and rate limiting enabled.
