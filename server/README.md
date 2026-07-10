# WorkNest Server

Node.js + Express backend for the WorkNest freelance platform.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Structure

- `src/config/` — App configuration (DB, JWT, Cloudinary, etc.)
- `src/controllers/` — Request handlers
- `src/services/` — Business logic
- `src/repositories/` — Data access layer
- `src/models/` — Mongoose models
- `src/routes/` — API routes
- `src/middlewares/` — Express middlewares
- `src/validators/` — Request validation
- `src/utils/` — Shared utilities
