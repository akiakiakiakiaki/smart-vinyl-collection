# AGENTS

- TypeScript strict; no `any`.
- Do not change public API contracts.
- Keep layers separated: raw API data, cache, adapters, UI.
- Mapping belongs in adapters, not components or routes.
- Prefer minimal diffs; modify only what is necessary.
- Reuse existing utilities; no duplication.
- No new dependencies unless strictly necessary.
- Keep logging minimal; remove debug logs after use.
- Verify framework APIs if unsure.
- When changing existing code, update the relevant tests in the same change.
- When adding new code, add corresponding tests in the same change.
- Run all changed or newly added tests and verify that the implementation behaves as expected.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
