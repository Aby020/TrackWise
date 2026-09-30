# TrackWise — Deployment Readiness (Render + Neon)

Target: **React (Render static site) · Express/Node.js (Render web service) · PostgreSQL (Neon)**.
Status: **Inspected 2026-08-28. Not yet deployed.** All steps below are prep only.

---

## 1. Inspection summary

| # | Check | Finding | Verdict |
|---|-------|---------|---------|
| 1 | Frontend build command | `npm run build` → `vite build` (client/package.json) | ✅ |
| 2 | Frontend output dir | Vite default `client/dist/` (no `outDir` override) | ✅ |
| 3 | Backend prod start | `npm start` → `node server.js` (server/package.json) | ✅ |
| 4 | Node.js version | No `engines` field. Local runs Node v24.18.0. Express 5 / Vite 8 are current; set Render to **Node 22** (LTS) or 24 | ⚠️ set on Render |
| 5 | Backend PORT | `process.env.PORT || 5000`; Express binds `app.listen(PORT)` (no host arg → `0.0.0.0`) | ✅ |
| 6 | Production host | `server.js` calls `app.listen(PORT)` with no host → binds all interfaces (`0.0.0.0`). Correct for Render | ✅ |
| 7 | Backend env vars | `PORT`, `NODE_ENV`, `DATABASE_URL` or `DB_*`, `JWT_SECRET`, `CORS_ORIGIN`, `ADMIN_*` | ✅ (configure on Render) |
| 8 | Frontend env vars | `VITE_API_URL` (consumed at build time by `client/src/services/api.js`) | ✅ (configure on Render) |
| 9 | PostgreSQL config | `db.js` uses `DATABASE_URL` if present (with `PGSSL=true` for TLS), else individual `DB_*`. Neon supplies `DATABASE_URL` | ✅ |
| 10 | DB init / migrations | `setupDatabase()` runs `schema.sql` (all `CREATE … IF NOT EXISTS`) + idempotent admin seed on every boot. No external migration tool needed | ✅ |
| 11 | CORS | `app.js` builds allowlist from `CORS_ORIGIN` (comma-separated), supports no-origin requests. Must include the Render frontend URL | ✅ (configure value) |
| 12 | Frontend API URL | `api.js` uses `import.meta.env.VITE_API_URL`. Must point at the Render backend `/api` | ✅ (configure value) |
| 13 | Hardcoded localhost | Only in `.env` files and `README.md` docs — none in shipped code. Safe localhost defaults exist as fallbacks only | ✅ |
| 14 | package.json scripts | client: `build`, `dev`, `preview`, `lint`. server: `start`, `dev`, `db:setup`, `db:check` | ✅ |
| 15 | .gitignore / secrets | `server/.env`, `client/.env`, `server.log` all gitignored; `git ls-files` shows no `.env`/secrets tracked | ✅ |
| 16 | Other blockers | See "Changes required" — local tarball dependency was blocking | 🔧 fixed |

---

## 2. Already ready ✅

- **Backend is production-shaped**: `node server.js`, uses `PORT`, binds `0.0.0.0`, has graceful SIGINT/SIGTERM shutdown, and a centralized error handler.
- **Database bootstrap is automatic**: schema + admin account are created/updated on every startup via `setupDatabase()`. No migration command or manual DB setup step is needed beyond Neon provisioning and supplying `DATABASE_URL`.
- **PostgreSQL connection is Render/Neon-ready**: `db.js` reads `DATABASE_URL` directly (Neon's format) and enables TLS via `PGSSL=true`.
- **CORS is env-driven and flexible**: `CORS_ORIGIN` accepts a comma-separated list — you can allow both the production frontend and a dev origin.
- **Secrets are not tracked**: both `.env` files and `server.log` are gitignored; no credentials exist in the committed tree.
- **Frontend build is standard Vite**: outputs to `client/dist/`, default `index.html`.

---

## 3. Changes required (code edits made)

Two minimal, functionality-preserving edits were applied so a clean `npm install` + `npm run build` succeeds on Render:

1. **`client/package.json`** — `@vitejs/plugin-react` was pinned to a local tarball that does **not exist in the repository**
   (`"file:vitejs-plugin-react-6.0.4.tgz"`). A fresh `npm install` on Render would fail with `ENOENT`.
   Changed to `"^6.0.4"` and regenerated `client/package-lock.json` from the public npm registry
   (`registry.npmjs.org`). Verified: `npm install @vitejs/plugin-react@6.0.4` succeeds in a clean dir.
2. **`client/static.json`** — added SPA rewrite rule so deep links (`/login`, `/admin/...`) resolve to `index.html`.
   Without this a Render static site returns 404 on refresh of a client-side route.

No application logic, schema, features, or credentials were changed.

---

## 4. Manual configuration required on Render

### Backend — Web Service (Node)
- **Type**: Web Service (not static).
- **Root directory**: `server`
- **Build command**: `npm install`
- **Start command**: `npm start`
- **Node version**: set **22** (LTS) or 24 in the Render dashboard.
- **Health check path**: `/` (index route responds).
- **Environment variables**:
  | Key | Value |
  |-----|-------|
  | `NODE_ENV` | `production` |
  | `PORT` | leave unset (Render injects it) |
  | `DATABASE_URL` | paste the Neon connection string |
  | `PGSSL` | `true` |
  | `JWT_SECRET` | a fresh random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
  | `CORS_ORIGIN` | `https://<your-frontend>.onrender.com` (comma-separate extra origins if needed) |
  | `ADMIN_EMAIL` | your admin email |
  | `ADMIN_EMPLOYEE_ID` | e.g. `ADMIN001` |
  | `ADMIN_PASSWORD` | a strong password |
  | `ATTENDANCE_ENFORCE_HOURS` | optional; defaults to `true` |

  > Note: `server/.env` (committed-locally, gitignored) still contains dev credentials. Render uses its own dashboard env vars, so the file's contents are irrelevant in production — but rotate `JWT_SECRET` and `ADMIN_PASSWORD` from the dev values regardless.

### Frontend — Static Site
- **Root directory**: `client`
- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist`
- **Node version**: same as backend (22/24).
- **Environment variable** (set **before** build):
  | Key | Value |
  |-----|-------|
  | `VITE_API_URL` | `https://<your-backend>.onrender.com/api` |
- The existing `client/.npmrc` (`include=dev`) ensures devDependencies (Vite, the React plugin) install even when Render exports `NODE_ENV=production`. This is required — do not remove it.

---

## 5. Manual configuration required on Neon

1. Create a Neon project (PostgreSQL 15/16/17).
2. Copy the **connection string** (the `postgresql://...` URL from Neon's dashboard, pooler or direct).
3. Paste it into the backend's Render `DATABASE_URL` env var.
4. Set backend `PGSSL=true` (Neon requires TLS).
5. **No schema/migration step is needed** — `setupDatabase()` creates tables and seeds the admin on first boot. Once the backend service starts with a valid `DATABASE_URL`, the database is ready.

---

## 6. Potential deployment problems ⚠️

- **Cold-start latency**: free Render web services spin down after inactivity; the first request after idle can take 30–60s. The admin-seed + schema bootstrap runs on each boot, so expect a brief delay on wake.
- **Free-tier database idle**: Neon free tier may suspend after 7 days of inactivity — the connection will re-establish on next use, but long-idle periods may require a manual wake.
- **CORS mismatch**: if `CORS_ORIGIN` doesn't exactly match the deployed frontend origin (incl. `https://` and no trailing slash), the browser blocks API calls. The backend logs `Not allowed by CORS` (403) on mismatch.
- **`VITE_API_URL` is build-time only**: it is baked into the JS bundle at build time. Changing it requires a **rebuild** of the frontend, not just a redeploy. If you change the backend URL, rebuild the static site.
- **Frontend/backend on separate Render subdomains**: cross-origin requests carry cookies/`Authorization` headers — `cors({ credentials: true })` is already set, which is correct, but it forbids `CORS_ORIGIN=*`; you must list the explicit origin (already handled by `CORS_ORIGIN`).
- **No static-asset cache headers / no CDN**: fine for free tier; acceptable for low traffic.
- **No health-check/DDoS considerations**: `/api` returns JSON 404s consistently; the index route is a safe health target.

---

## 7. Verdict

**TrackWise is ready for Render + Neon after applying the manual configurations above.**
The only code-level blocker (the missing local tarball dependency) has been fixed; the SPA rewrite rule was added.
Nothing else blocks deployment. No schema, functional, or credential changes were made.

---

## 8. Exact next deployment step

1. Push the prepared changes (`client/package.json`, `client/package-lock.json`, `client/static.json`) to GitHub **only when you intend to deploy** (not done here).
2. In Neon: create the project, copy the connection string.
3. In Render: create the **backend Web Service** (`server`, `npm install` → `npm start`) with the env vars in §4, paste the Neon `DATABASE_URL`, set `PGSSL=true`.
4. In Render: create the **frontend Static Site** (`client`, `VITE_API_URL` = backend `/api`, build → publish `dist`), after the backend URL is known.
5. Open the frontend URL, log in with the configured admin credentials.

> Nothing has been deployed, pushed, or committed in this session.
