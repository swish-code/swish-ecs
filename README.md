# Swish Compliance — Establishing Compliance System (ECS)

Internal pilot MVP to track: SOP register → file upload → approval/status → assignment → implementation → audits/checklists → corrective actions → evidence → KPIs → dashboard.

## Scope (30-day MVP)
- SOP/Policy/Procedure register with file metadata and approval tracking
- SOP assignment and implementation tracking by brand + department
- Food safety checklist templates and audit execution
- Corrective actions (CAPA) with due dates, severity, verification
- Evidence file metadata linked to business records
- KPI definitions and monthly results
- Dashboard summary via Snowflake views
- Basic RBAC, audit trail, and Outlook notification placeholders

## Repo contents
- `docs/` — architecture, workflows, schema decisions, and build planning
- `src/app/` — Next.js App Router shell
- `src/features/` — vertical-slice modules for the MVP
- `src/lib/` — shared auth, time, validation, and Snowflake infrastructure
- `src/sql/` — Snowflake schema, views, and seed scripts
- `src/types/` — shared domain constants and types
- `scripts/` — node CLI helpers (e.g. `run-sql-file.mjs`)

## Key decisions
- Database: Snowflake (fixed)
- Scope grain: Brand + Department (Phase 1 adds Location)
- App: Next.js (App Router) + TypeScript + Tailwind
- File storage: SharePoint or OneDrive for actual files; Snowflake stores metadata/URLs
- Approval owner: IBE Manager for Business Excellence approvals
- Pattern: UI → server action/API → service → repository/query → Snowflake
- Timezone display: Kuwait (`Asia/Kuwait`); store timestamps as `TIMESTAMP_TZ`

## Local development

### 1. Install
```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in what you need:
```bash
cp .env.example .env.local
```

You can start the dev server with an **empty** `.env.local` — the app boots in mock mode (no auth, no DB). Add Snowflake credentials to enable the data layer; switch `AUTH_MODE=entra` and add Azure AD credentials to enable real sign-in. See [`.env.example`](.env.example) for the full list of variables with descriptions.

### 3. Run
```bash
npm run dev      # http://localhost:3001
npm run lint     # ESLint (Next.js core-web-vitals + TypeScript ruleset)
npm run build    # Production build
npm start        # Run the production build on :3001
```

## Authentication modes

The app supports two modes, switched via `AUTH_MODE`:

| Mode | Use for | Required env vars |
|------|---------|-------------------|
| `mock` (default) | Local UI development without Azure setup. Auto-signs you in as a configurable fake user. | `DEV_SESSION_*` (all optional — defaults work) |
| `entra` | Real Microsoft Entra ID (Azure AD) sign-in via NextAuth. | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` |

For Azure setup steps (app registration, Graph permissions, redirect URIs), see [`docs/it-access-request.md`](docs/it-access-request.md).

## Snowflake setup

### Connection
The app talks to Snowflake through the `snowflake-sdk` client in [`src/lib/snowflake/`](src/lib/snowflake/). Set these in `.env.local` (all six are required):

```env
SNOWFLAKE_ACCOUNT=<account_id>          # e.g. xy12345.eu-central-1
SNOWFLAKE_USERNAME=
SNOWFLAKE_PASSWORD=
SNOWFLAKE_DATABASE=SWISH_DOCUMENTS
SNOWFLAKE_SCHEMA=ECS_MVP
SNOWFLAKE_WAREHOUSE=
SNOWFLAKE_ROLE=
```

### Schema setup (run order)

There are 11 SQL files in [`src/sql/`](src/sql/). Apply them in this order — full notes in [`src/sql/README.md`](src/sql/README.md):

1. `001_schema_mvp.sql` — lean MVP tables
2. `030_enterprise_location_extension.sql` — location scope extension
3. `020_seed_reference_data.sql` — roles + brands
4. `021_seed_departments.sql`
5. `022_seed_locations.sql`
6. `023_seed_brand_locations.sql`
7. `031_document_security_extension.sql` — SharePoint document security
8. `032_user_scope_mappings.sql` — multi-scope user access
9. `033_phase_1_lean_extension.sql` — Phase 1 shared compliance tables
10. `034_phase_1_backfill.sql` — Phase 1 backfill + validation
11. `010_views_mvp.sql` — reporting views

### Applying SQL from the CLI

```bash
# Dry run — parses the file and prints the statements it would execute
npm run snowflake:sql -- src/sql/001_schema_mvp.sql

# Actually run it against the connected account (adds --execute)
npm run snowflake:sql -- src/sql/001_schema_mvp.sql --execute

# Shortcuts for Phase 1
npm run snowflake:phase1:ddl       # runs 033 with --execute
npm run snowflake:phase1:backfill  # runs 034 with --execute
```

Snowflake credentials are loaded from `.env.local` automatically via `@next/env`.

## Deployment

### Railway (recommended)
[`railway.json`](railway.json) is configured for one-click deploy:

1. Create a new Railway project from this GitHub repo.
2. Add the env vars from [`.env.example`](.env.example). At minimum: `AUTH_MODE`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, the four `AZURE_*`/`NEXTAUTH_*` for sign-in, and all six `SNOWFLAKE_*` for the DB.
3. Deploy. Railway runs `npm ci && npm run build` then `npm start` on port 3001.

### Other hosts
The project is a stock Next.js 16 app — `npm run build && npm start` works on Vercel, Cloud Run, Render, Fly, or any Node 20+ host. No DB migrations run at boot; the Snowflake schema must already be applied (see above).

## Documentation

The `docs/` folder has 35+ design and planning notes. For a new developer, start with these:

| Doc | Why |
|-----|-----|
| [`docs/project-structure.md`](docs/project-structure.md) | Folder layout and vertical-slice pattern — "where does feature X go?" |
| [`docs/mvp-plan-30-days.md`](docs/mvp-plan-30-days.md) | 4-week roadmap with acceptance criteria — what's done vs. pending |
| [`docs/ibe-confirmed-requirements-summary.md`](docs/ibe-confirmed-requirements-summary.md) | Scope, approval workflows, RBAC model |
| [`docs/roles-permissions.md`](docs/roles-permissions.md) | RBAC matrix per feature |
| [`docs/it-access-request.md`](docs/it-access-request.md) | IT prerequisites: Entra app, Graph permissions, SharePoint, Outlook sender |
| [`docs/database-diagram.md`](docs/database-diagram.md) | ER diagram of the Snowflake schema |
| [`src/sql/README.md`](src/sql/README.md) | SQL run order + per-file notes |

A fuller index lives in the `docs/` folder itself.

## Current status
The project is scaffolded with all vertical-slice features (`sops/`, `assignments/`, `audits/`, `capa/`, `evidence/`, `dashboard/`, `admin/`, …) stubbed with `actions.ts` / `service.ts` / `repository.ts` files ready for implementation. Next steps: complete the auth/RBAC foundation, finish the Snowflake repository layer, and ship the first usable SOP register slice.
