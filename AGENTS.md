# Repository Guidelines

## Project Structure & Module Organization

This is a React 19 + Vite family trip dashboard. Main client code lives in `src/`: `App.jsx` owns the shell and page state, `CommandMap.jsx` handles map playback, `InspectorRail.jsx` renders selected-entity details, and `tripModel.js` contains pure trip helpers. Static seed data is in `src/tripData.js`; persistence is in `src/usePersistedTripState.js`; assets are in `src/assets/`. API handlers live under `api/` (`agent`, `directions`, `tour`), while `server.js` runs the local API server. Screenshots and product docs are in `docs/`. `_backup/` is not active source.

## Build, Test, and Development Commands

Run `npm install` once. Use `npm run dev` for the Vite app, `npm run server` for the local Express API, or `npm run dev:all` to start both. Use `npm run build` to create `dist/`, and `npm run preview` to serve that build locally. No test, lint, or format script is configured; validate changes with `npm run build` at minimum.

## Coding Style & Naming Conventions

Use ES modules, React function components, and existing JSX patterns. Component files use PascalCase (`AttractionCard.jsx`); hooks use `use...` names; data/model modules use camelCase filenames. Keep business logic in `tripModel.js` and seed constants in `tripData.js`.

Before UI changes, read `DESIGN.md`. Preserve the dark command-center style, dense layouts, minimal radius, semantic status colors, and mono/tabular styling for numeric data. Prefer existing helpers and libraries such as `lucide-react`, `clsx`, and `tailwind-merge`.

## Testing Guidelines

There is no established automated test suite. For logic-heavy changes, add focused tests only after introducing an agreed test runner. Until then, manually exercise affected flows and run `npm run build`. For map, agent, TourAPI, or directions work, verify with realistic `.env` values and note API-key-dependent coverage in the PR.

## Commit & Pull Request Guidelines

Recent commits use Conventional Commit-style prefixes, often in Korean, such as `feat: ...` and `chore: ...`. Keep that pattern: `feat: add attraction filters`, `fix: handle missing route geometry`, or `chore: update dependencies`. Pull requests should include a concise summary, affected screens or APIs, environment variables needed, and manual verification steps. Include screenshots or recordings for visible UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` and fill local keys only. Do not commit real values for `VITE_GOOGLE_MAPS_API_KEY`, `TOUR_API_KEY`, or `OPENAI_API_KEY`. Keep trip data public-demo-safe unless asked otherwise.
