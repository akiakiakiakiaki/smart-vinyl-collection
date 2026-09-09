# Smart Vinyl Collection

## Overview

Web app that connects to the Discogs API, fetches a user's collection, caches raw data locally, and displays it in a structured UI.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- MUI (DataGrid)
- Zustand (state + persistence)
- Discogs API (OAuth 1.0a)

## Core Concepts

### Data Flow

1. Fetch raw data from Discogs API
2. Store raw data in local cache
3. Transform data via adapters
4. Render UI using transformed data

### Architecture Rules

- Raw API data is never modified
- Cache stores raw data only
- All mapping logic lives in adapters
- UI consumes adapter output only

## Project Structure (relevant parts)

- `app/api/discogs/` → API routes + OAuth flow
- `lib/` → adapters, utilities
- `types/` → type definitions
- `store/` → client state and persistance
- `.cache/discogs/` → local raw data cache

## Development

Run dev server:

```bash
npm run dev
```

Enable the repository Git hooks once after cloning:

```bash
npm run setup:hooks
```

The pre-commit hook runs Vitest, TypeScript, and lint checks. The pre-push hook runs the complete unit, integration, and Playwright test suite. SourceTree uses these hooks automatically when it uses this repository's Git configuration.

## Notes

- Do not introduce new dependencies unless necessary
- Keep changes minimal and localized
- Prefer extending adapters over modifying existing data structures
