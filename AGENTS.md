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
