# WorkNest

A full-stack freelance marketplace that connects clients with freelancers — from job posting and proposals through interviews, project workspaces, and escrow payments.

**Live app:** [work-nest-eight.vercel.app](https://work-nest-eight.vercel.app)  
**API:** [worknest-17xd.onrender.com](https://worknest-17xd.onrender.com)

---

## Features

- **Authentication** — Email/password with verification, JWT access & refresh tokens, Google and GitHub OAuth, password reset
- **Jobs & proposals** — Clients post jobs; freelancers submit proposals with cover letter, price, and timeline
- **Interviews** — Schedule, confirm, and manage interview sessions between clients and freelancers
- **Project workspaces** — Kanban tasks, file attachments, deliverables, and hire-to-completion workflows
- **Escrow payments** — Stripe Checkout with held/released/refunded payment states and platform fees
- **Realtime notifications** — In-app alerts via Socket.IO
- **Role-based dashboards** — Dedicated experiences for clients, freelancers, and admins
- **Admin tools** — User management, analytics, PDF reports, categories, skills, and system logs

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, TypeScript, Vite, React Router |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT (HTTP-only cookies), bcrypt, Google OAuth, GitHub OAuth |
| Payments | Stripe (Checkout + webhooks) |
| Realtime | Socket.IO |
| Email | Nodemailer (SMTP), SendGrid, Elastic Email |
| Validation | Zod |
| Deployment | Vercel (frontend), Render (API) |

---

## Project Structure

```
workNest/
├── client/                 # React SPA (Vite)
│   └── src/
│       ├── api/            # HTTP clients
│       ├── components/     # Shared UI
│       ├── context/        # Auth, notifications, toasts
│       ├── dashboards/     # Client, freelancer, admin
│       ├── pages/          # Public & auth pages
│       └── routes/
├── server/                 # Express API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── models/
│       ├── routes/
│       ├── middlewares/
│       └── validators/
├── package.json            # Root scripts
├── vercel.json             # Frontend deploy config
└── render.yaml             # Backend deploy config
```

Server request flow: **routes → controllers → services → repositories → models**

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20.x or later (24.x recommended)
- [MongoDB](https://www.mongodb.com/) running locally, or a MongoDB Atlas connection string
- Stripe, Google OAuth, and GitHub OAuth credentials (optional for basic local development)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd workNest
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` with at least:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `CLIENT_URL` | Frontend origin (default `http://localhost:5173`) |

Optional: email provider keys, Stripe keys, and OAuth client IDs. See `server/.env.example` and `client/.env.example` for the full list.

### 3. Run in development

Use two terminals:

```bash
npm run dev:server    # API at http://localhost:5000
npm run dev:client    # App at http://localhost:5173
```

The Vite dev server proxies `/api`, `/uploads`, and `/socket.io` to the backend.

### 4. Production build

```bash
npm run build:client   # Build frontend
npm run build          # Build backend
npm start              # Start compiled API
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install server and client dependencies |
| `npm run dev:server` | Start API with hot reload |
| `npm run dev:client` | Start Vite development server |
| `npm run build` | Compile the TypeScript server |
| `npm run build:client` | Build the React client for production |
| `npm start` | Run the compiled server |

---

## Deployment

| Service | Platform | Notes |
|---------|----------|--------|
| Frontend | [Vercel](https://vercel.com) | Configured via `vercel.json` |
| Backend | [Render](https://render.com) | Configured via `render.yaml` |
| Database | MongoDB Atlas (or equivalent) | Set `MONGO_URI` in the host environment |

Ensure production env vars (JWT secrets, email, Stripe, OAuth, `CLIENT_URL`, `APP_URL`) are set in the hosting dashboards.

---


