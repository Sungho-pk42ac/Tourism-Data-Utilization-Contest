# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A Palantir-style trip "command center" — an intentionally overbuilt React dashboard that treats trip logistics like a military operation: convoy routes, timeline playback, mission launches, and dark command-center aesthetics.

The codebase began as a Yosemite/Pine Mountain Lake family-trip dashboard (this is still the wording in `package.json` and `README.md`) and has been extended into a **Korean Tourism Data Utilization Contest** entry: the seed data was swapped to a Jeju family trip and a tourism layer was added on top — TourAPI 4.0 attraction search, visitor-statistics charts, and an OpenAI-powered AI travel agent. Expect both vocabularies ("command center" base + "tourism/관광지" overlay) in the code.

## Design System
**Always read `DESIGN.md` before making any visual or UI decisions.** All font, color, spacing, and aesthetic direction live there; do not deviate without explicit user approval.

Key constraints from DESIGN.md:
- Dark-only: primary background `#0A0C10`, surface `#161B22`
- Semantic colors only (never decorative): Critical `#F85149`, Warning `#D29922`, Success `#3FB950`, Info `#58A6FF`
- Typography: Inter for UI, Geist Mono for all numerical data and timestamps
- Border radius: sharp/minimal (2–4px). No decorative rounding.
- Motion: transitions only on state changes, 50–250ms duration

`AGENTS.md` is a parallel contributor guide (commit/PR conventions, structure notes) — keep it consistent with this file when either changes.

## Commands
```bash
npm install
npm run dev       # Vite dev server (UI only) → http://127.0.0.1:5173
npm run server    # Local Express API only (api/app.js) → http://localhost:3001
npm run dev:all   # UI + API together via concurrently (use this for AI/TourAPI work)
npm run build     # Production build → dist/
npm run preview   # Preview the production build
```

No test runner, lint, or format script is configured. Validate changes with `npm run build` at minimum. AI-agent / TourAPI / map flows are API-key dependent — note that coverage gap when verifying.

## Environment
Copy `.env.example` to `.env` before running locally. On Vercel, set the same values in the project's Environment Variables screen.

```bash
# Client-side (read at build time, shipped in the browser bundle — VITE_*)
VITE_GOOGLE_MAPS_API_KEY=your_browser_maps_key_here
VITE_GOOGLE_MAP_ID=your_optional_google_map_id          # optional
VITE_DISABLE_LEGACY_GOOGLE_ROUTING=true                 # dev only, skips deprecated Google routing/places

# Server-side (stay on the server, used by /api/* routes)
OPENAI_API_KEY=your_openai_key
TOUR_API_KEY=your_tourapi_key
OPENAI_MODEL=gpt-4o
```
Without the browser Maps key the UI still renders, but the Google Maps layer won't fully initialize.

## Architecture

### Frontend data layer
- **`src/tripData.js`** — Pure static seed data: `INITIAL_FAMILIES`, `INITIAL_MEALS`, `INITIAL_EXPENSES`, `ACTIVITIES`, `MAP_POINTS`, `MAP_ROUTES`, `DAYS`, etc. No logic, only exported constants.
- **`src/tripModel.js`** — All business logic. Entity helpers (`getEntityById`, `getEntitySummary`, `getEntityTitle`), collection accessors, route simulation, search, and `getInitialTripDocument()` which hydrates seed data into the trip-document shape.
  - Entity types: `family`, `location`, `route`, `itineraryItem`, `meal`, `activity`, `stayItem`, `expense`, `task`
  - Storage keys: `TRIP_DOCUMENT_STORAGE_KEY` (`trip-command-center/v4-public`), `VIEWER_PROFILE_STORAGE_KEY`
- **`src/usePersistedTripState.js`** — Thin `useState` + `localStorage` hook for both the trip document and viewer profile.
- **`src/publishConfig.js`** — Feature flags: `visibilityMode` (`'public'`/`'private'`) and `liveExternalData`.
- **`src/weather.js`** — Live weather via the US National Weather Service (`api.weather.gov`), keyed to `basecamp`/`yosemite` targets. This is part of the original Yosemite layer (no API key needed) — it is unrelated to the Korean tourism endpoints.

### Frontend UI layer
- **`src/App.jsx`** — Main shell. Owns all state (trip document, viewer profile, timeline playback, map selection, search, overlays) and renders the top nav, day selector, timeline, the content pages, and the mission-launch overlay. `cn()` helper (`clsx` + `tailwind-merge`) lives here.
- **`src/CommandMap.jsx`** — Google Maps integration via `@googlemaps/js-api-loader`: route rendering, timeline-driven convoy playback, map points, facility markers. (Google Maps only — there is no Kakao SDK dependency despite older commit messages.)
- **`src/InspectorRail.jsx`** — Right-side detail panel; renders entity-specific views for the current selection.
- **Tourism panels** (the contest layer):
  - `src/AttractionSearchPanel.jsx` — TourAPI region/attraction search UI.
  - `src/AttractionCard.jsx` — Attraction card used in the results grid.
  - `src/VisitorStatsPanel.jsx` — Visitor-statistics charts (Recharts).
  - `src/AgentChatPanel.jsx` — AI travel-agent chat; calls the `/api/agent` endpoint.

### Backend / API layer
The same Express app serves both the local dev server and Vercel serverless functions — keep route logic in one place. In dev, `vite.config.js` proxies `/api` → `http://localhost:3001`, so **`npm run dev` alone is not enough for AI/TourAPI features — the API server must also be running** (use `npm run dev:all`).
- **`api/app.js`** — The Express app (CORS for the Vite origins + JSON body parsing). Mounts `tourRouter` at `/api/tour`, `agentRouter` at `/api/agent`, and a `/api/health` check. Single source of truth for API behavior.
- **`server.js`** — Local entry point: imports `api/app.js` and listens on `API_PORT` (default `3001`). Started by `npm run server` / `npm run dev:all`.
- **`api/[...path].js`** — Vercel catch-all serverless function that re-exports the same Express app, so all `/api/*` routes work identically in production.
- **`api/tour/index.js`** — TourAPI 4.0 proxy (`apis.data.go.kr/.../KorService1`, uses `TOUR_API_KEY`). Routes: `GET /search`, `POST /recommend` (route-distance ranked, uses `locationBasedList1`), `GET /detail/:contentId`, `GET /stats` (visitor stats). Normalizes TourAPI items into the app's `location` shape (`category` mapped from `contentTypeId`).
- **`api/agent/index.js`** — OpenAI-backed AI travel agent (`POST /`, uses `OPENAI_API_KEY`, `OPENAI_MODEL` default `gpt-4o`). Returns `{ reply, toolCalls }` where `toolCalls` are OpenAI function calls (`searchAndMarkLocations`, `setMapCenter`, `showCongestionHeatmap`, `buildOptimalRoute`, `filterByCategory`, `clearMarkers`) that the **frontend executes against the Google map** — this is how the chat remote-controls the map.

**Key pattern:** every external-API route degrades to realistic Jeju **mock data** when its key is missing (`isMock: true` in the response), so the UI works end-to-end without keys. Preserve this fallback when editing routes.

### Data flow
App owns the trip document in state (persisted via `usePersistedTripState`). Selections flow down to `InspectorRail` and `CommandMap`; map/nav interactions bubble back up to App via callbacks. `tripModel` functions are pure — they take the document and return derived data without mutating. Tourism panels (`AttractionSearchPanel`, `AgentChatPanel`) fetch through the `/api/*` proxy rather than calling external APIs directly, so secrets stay on the server. The AI agent's returned `toolCalls` flow into `CommandMap` to drive search markers, map centering, and the route/heatmap overlays.

## Tech Stack
- React 19 + Vite 8
- Tailwind CSS v4 (`@tailwindcss/postcss`, no `tailwind.config` — v4 config-in-CSS)
- Lucide React (icons), `clsx` + `tailwind-merge` (via `cn()`)
- Recharts (visitor-stats charts)
- `@googlemaps/js-api-loader` (map)
- Backend: Express 5, `cors`, `dotenv`, `openai`; `concurrently` (optional) for `dev:all`
- Deploy: Vercel (`vercel.json` → build `npm run build`, output `dist/`, plus the `api/` catch-all function)

Note: Framer Motion, react-query, and zustand are **not** installed despite older references — do not import them.

## Development Rules
- Maintain high information density — avoid whitespace-heavy layouts.
- Use semantic colors strictly for status, never decoratively.
- All numerical data must use Geist Mono / `font-mono tabular-nums`.
- Keep business logic in `tripModel.js` and seed constants in `tripData.js`; keep all API logic in `api/app.js` (shared by local + Vercel).
- Never expose `OPENAI_API_KEY` or `TOUR_API_KEY` to the client — only `VITE_*` values reach the browser. Keep seed/trip data public-demo-safe.
- Optimized for large dashboard displays; responsive is secondary.
- Commits follow Conventional Commit prefixes (often in Korean), e.g. `feat: ...`, `fix: ...`, `chore: ...`.
