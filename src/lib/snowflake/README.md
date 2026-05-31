# Snowflake Foundation

This folder contains the application-side Snowflake foundation.

## Files
- `client.ts` — connection lifecycle helpers
- `query.ts` — query and command wrappers

## Notes
- Query code should stay in repositories, not in UI components.
- Environment variables are parsed from `src/lib/env.ts`.
- The current wrapper is connection-per-operation, which is acceptable for the MVP and easy to reason about.
