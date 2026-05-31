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

## Key decisions
- Database: Snowflake (fixed)
- Scope grain: Brand + Department
- App: Next.js (App Router) + TypeScript + Tailwind
- File storage: SharePoint or OneDrive for actual files; Snowflake stores metadata/URLs
- Approval owner: IBE Manager for Business Excellence approvals
- Pattern: UI → server action/API → service → repository/query → Snowflake
- Timezone display: Kuwait (`Asia/Kuwait`); store timestamps as `TIMESTAMP_TZ`

## Local development
- Dev server port: `3001`
- Install dependencies: `npm install`
- Start app: `npm run dev`
- Lint: `npm run lint`

## Snowflake run order
1. `src/sql/001_schema_mvp.sql`
2. `src/sql/010_views_mvp.sql`
3. `src/sql/020_seed_reference_data.sql`

## Current status
The project is scaffolded and ready for the next development step: auth/RBAC foundation, Snowflake connection layer, and the first usable SOP register slice.
