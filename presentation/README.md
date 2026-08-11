# WorkNest — Immersive Product Experience

A cinematic A→Z walkthrough of the **real WorkNest UI** for a non-technical KFW audience (~10 minutes).

## Run

```bash
cd presentation
npm run dev
```

Open the Vite URL → **F** fullscreen → **→ / Space** to advance.

## Controls

| Key | Action |
|-----|--------|
| → / Space | Next beat |
| ← | Previous |
| Click UI | Expand full screenshot |
| F | Fullscreen |
| Esc | Toggle chrome (or close lightbox) |

## Story arc

Enter → Client dashboard → Create job → Publish → Freelancer discovers → Proposal → Client accepts → Project → Deposit → Secure → Kanban / files → Complete → Payment release → Recap → Closing

**No milestones.** Full deposit → WorkNest holds → release on completion.

## Screenshots

```bash
node scripts/capture-authenticated.mjs
```

Uses installed Chrome + demo accounts. Saves to `public/screenshots/`.
