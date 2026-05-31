# Suggested Next.js Project Structure (MVP)

Target: Next.js App Router + TypeScript + Tailwind, with a clean layering model.

## Folder layout
- `src/app/` — routes/pages/layouts (thin UI)
- `src/features/` — vertical slices (each module owns its UI + server actions + services + repos)
  - `sops/`
  - `implementation/`
  - `assessments/`
  - `audits/`
  - `capa/`
  - `evidence/`
  - `kpis/`
  - `dashboard/`
  - `admin/`
- `src/lib/` — shared infrastructure
  - `auth/` (session helpers, RBAC)
  - `snowflake/` (connection, query wrapper)
  - `time/` (Kuwait timezone formatting helpers)
  - `validation/` (shared zod schemas)
- `src/types/` — shared TypeScript types (DB row types, enums)
- `src/sql/` — Snowflake DDL/views (source-of-truth scripts)
- `docs/` — design + plan

## Vertical slice pattern (recommended)
For a module like SOPs:
- `src/features/sops/pages/` — components used by routes
- `src/features/sops/actions.ts` — server actions (or route handlers)
- `src/features/sops/service.ts` — business rules + audit log writes
- `src/features/sops/repository.ts` — Snowflake queries only
- `src/features/sops/validators.ts` — zod schemas
- `src/features/sops/types.ts` — SOP-specific types/enums

## Route ownership (example)
- `src/app/sops/page.tsx` uses `features/sops/*`
- `src/app/implementation/page.tsx` uses `features/implementation/*`

## Naming conventions
- Use consistent status enums matching SQL strings.
- Keep “export/report” queries in `src/features/reports/` or per-module `repository.ts` + `VW_*` views.

## Where business logic lives
- UI: display + form state only
- Server action: authentication + validation + call service
- Service: transitions/overdue rules/verification requirements/audit log
- Repository: parameterized SQL and mapping rows to types
