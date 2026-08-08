# WorkNest

Freelance marketplace platform for clients, freelancers, and admins — job posting, proposals, project workspaces, escrow payments, interviews, and role-based dashboards.

## Tech stack

| Layer | Stack |
|-------|--------|
| Client | React 18, Vite, TypeScript, React Router, Axios, Socket.IO client, Recharts |
| Server | Node.js 20+, Express, TypeScript, Mongoose, Zod, Pino, Socket.IO |
| Data | MongoDB |
| Auth | JWT (httpOnly cookies) + refresh rotation; Google / GitHub OAuth |
| Payments | Stripe (Checkout + webhooks) |

## Monorepo layout

```
workNest/
├── client/          # Vite React SPA
├── server/          # Express API + Socket.IO
├── package.json     # Root scripts (install, typecheck, seed)
└── README.md
```

### Server (`server/src`)

Feature-first modules: `routes → controller → service → repository → model`.

```
src/
├── app.ts / server.ts
├── config/              # Env (Zod), JWT cookies, OAuth, multer
├── common/              # Middleware, utils, errors, validators, DB
├── shared/              # Sockets + integrations (email, Stripe, upload)
├── modules/             # auth, users, jobs, proposals, projects, payments,
│                        # workspace, notifications, dashboard, …
└── routes/index.ts      # Mounts feature routers under /api/v1
```

| Mount | Purpose |
|-------|---------|
| `/api/auth` | Authentication (login, register, refresh, OAuth, `/me`) |
| `/api/v1/*` | Domain APIs (jobs, proposals, projects, payments, …) |
| `/api/v1/health` | Health check |
| `/uploads/...` | Profile (public) and workspace files (auth-gated) |

### Client (`client/src`)

| Folder | Use for |
|--------|---------|
| `app/` | Providers, layouts, route map |
| `pages/` | Public and auth screens |
| `features/` | Domain UI (job form, OAuth buttons, landing) |
| `components/` | Shared presentational UI |
| `dashboards/<role>/` | Admin, client, or freelancer experience |
| `dashboards/shared/` | Cross-role screens (workspace, payments, interviews) |
| `api/` | HTTP clients |
| `context/` | Auth, toast, confirm, notifications |

Path alias: `@/` → `src/`.

## Prerequisites

- Node.js **≥ 20**
- MongoDB running locally (or a remote `MONGO_URI`)

## Quick start

```bash
# Install dependencies
npm run install:all

# Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# Terminal 1 — API (http://localhost:5000)
npm run dev:server

# Terminal 2 — SPA (http://localhost:5173)
npm run dev:client
```

Optional demo data:

```bash
npm run seed
```

### Local development notes

- Leave `VITE_API_URL` **empty** in the client `.env`. Vite proxies `/api`, `/uploads`, and `/socket.io` to the server.
- Set `VITE_API_URL` to the API origin only for production builds.
- Never commit real secrets or OAuth client IDs.

## Root scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install server + client deps |
| `npm run dev:server` | API with hot reload |
| `npm run dev:client` | Vite dev server |
| `npm run typecheck` | Typecheck server and client |
| `npm run build` | Build server for production |
| `npm run build:client` | Typecheck + build client |
| `npm start` | Run compiled server (`server/dist`) |
| `npm run seed` | Seed demo data |

## Environment

### Server (`server/.env`)

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Access-token signing key |
| `JWT_REFRESH_SECRET` | Yes | Refresh-token signing key |
| `CLIENT_URL` | Yes | Frontend origin(s); comma-separated for multiple |
| `PORT` | No | Default `5000` |
| `APP_URL` | No | Public API URL (emails, OAuth callbacks) |
| `GOOGLE_CLIENT_ID` | No | Google Sign-In |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | No | GitHub OAuth |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | No | Escrow payments |
| Email vars | No | SMTP / SendGrid / Elastic Email |

See `server/.env.example` for the full list.

### Client (`client/.env`)

| Variable | Notes |
|----------|--------|
| `VITE_API_URL` | Empty in local dev; required in production |
| `VITE_GOOGLE_CLIENT_ID` | Google Identity Services |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth App |

## Roles & main features

| Role | Capabilities |
|------|----------------|
| **Client** | Post jobs, review proposals, hire, escrow, workspace, interviews |
| **Freelancer** | Browse jobs, submit proposals, deliver work, track payouts |
| **Admin** | Platform oversight — users, jobs, projects, reports, logs |

Shared product surfaces: notifications (HTTP + Socket.IO), dashboards, profiles, and Stripe-backed escrow.

## Authentication

- Access JWT in httpOnly cookie (Bearer also supported for non-browser clients)
- Refresh token in httpOnly cookie (scoped to `/api/auth`), rotated on use
- Client keeps access token **in memory** only (not `localStorage`)
- Role checks on the API (`authorize`); ownership checks in services
- Frontend role routes are UX gating only — never rely on them for security

## API conventions

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": null,
  "requestId": "...",
  "timestamp": "..."
}
```

Error:

```json
{
  "success": false,
  "message": "...",
  "errors": [],
  "requestId": "...",
  "timestamp": "..."
}
```

Auth session endpoints (`login`, `refresh`, `/me`) also return `user` and `accessToken` for the SPA bootstrap flow.

List endpoints are paginated (limit capped at 100). Postman collections live under `server/postman/`.

## Production

- Server: multi-stage `server/Dockerfile`, health probes (`/health/live`, `/health/ready`), graceful shutdown
- Client: set `VITE_API_URL` at build time; fail-fast if missing in production
- CI: GitHub Actions under `.github/workflows/`
- Uploads on ephemeral disks need object storage for durable production files

## License

Private / ISC — see `package.json`.
