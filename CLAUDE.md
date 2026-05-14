# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A Palantir-style family trip command center built as a fun, intentionally overbuilt React dashboard. Treats trip logistics like a military operation: convoy routes, timeline playback, mission launches, and dark command-center aesthetics.

## Design System
**Always read `DESIGN.md` before making any visual or UI decisions.**
All font choices, colors, spacing, and aesthetic direction are defined there. Do not deviate without explicit user approval.

Key constraints from DESIGN.md:
- Dark-only: primary background `#0A0C10`, surface `#161B22`
- Semantic colors only: Critical `#F85149`, Warning `#D29922`, Success `#3FB950`, Info `#58A6FF`
- Typography: Inter for UI, Geist Mono for all numerical data and timestamps
- Border radius: sharp/minimal (2–4px). No decorative rounding.
- Motion: transitions only on state changes, 50–250ms duration

## Commands
```bash
npm install
npm run dev      # Vite dev server → http://127.0.0.1:5173
npm run build    # Production build
npm run preview  # Preview production build
```

No test runner or lint script is configured in package.json.

## Environment
Copy `.env.example` to `.env` before running locally:
```
VITE_GOOGLE_MAPS_API_KEY=your_browser_maps_key_here
VITE_GOOGLE_MAP_ID=your_optional_google_map_id          # optional
VITE_DISABLE_LEGACY_GOOGLE_ROUTING=true                 # dev only, disables deprecated routing
```
Without a Maps key the UI renders fully but the Google Maps layer won't initialize.

## Architecture

### Data layer
- **`src/tripData.js`** — Pure static seed data: `INITIAL_FAMILIES`, `INITIAL_MEALS`, `INITIAL_EXPENSES`, `ACTIVITIES`, `MAP_POINTS`, `MAP_ROUTES`, `DAYS`, etc. No logic here, only exported constants.
- **`src/tripModel.js`** — All business logic. Exports entity helpers (`getEntityById`, `getEntitySummary`, `getEntityTitle`), collection accessors, route simulation helpers, search, and the `getInitialTripDocument()` factory that hydrates seed data into the trip document shape.
  - Entity types: `family`, `location`, `route`, `itineraryItem`, `meal`, `activity`, `stayItem`, `expense`, `task`
  - Storage keys: `TRIP_DOCUMENT_STORAGE_KEY` (`trip-command-center/v4-public`), `VIEWER_PROFILE_STORAGE_KEY`
- **`src/usePersistedTripState.js`** — Thin `useState` + `localStorage` hook used for both the trip document and viewer profile.
- **`src/publishConfig.js`** — Feature flags: `visibilityMode` (`'public'`/`'private'`) and `liveExternalData` toggle.

### UI layer
- **`src/App.jsx`** — Main shell. Owns all state (trip document, viewer profile, timeline playback, map selection, search, overlays). Renders the top navigation, day selector, timeline, all six content pages (Itinerary / Stay / Meals / Activities / Expenses / Families), and the mission-launch overlay.
- **`src/CommandMap.jsx`** — Google Maps integration. Handles route rendering with `@googlemaps/js-api-loader`, timeline-driven convoy playback animation, map points, and facility markers.
- **`src/InspectorRail.jsx`** — Right-side detail panel. Renders entity-specific detail views based on the current selection passed down from App.

### Data flow
App owns the trip document in state (persisted via `usePersistedTripState`). Selections flow down to `InspectorRail` and `CommandMap`. Map interactions and nav clicks bubble up to App via callbacks. `tripModel` functions are pure — they take the document and return derived data without mutating.

## Tech Stack
- React 19 + Vite
- Tailwind CSS v4
- Lucide React (icons)
- Framer Motion (state-change transitions only)
- `@googlemaps/js-api-loader` (map)
- `clsx` + `tailwind-merge` via local `cn()` helper in App.jsx

## Development Rules
- Maintain high information density — avoid whitespace-heavy layouts.
- Use semantic colors strictly for status (never decoratively).
- All numerical data must use Geist Mono / `font-mono tabular-nums`.
- Optimized for large dashboard displays; responsive is secondary.
