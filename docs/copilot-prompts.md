# Copilot Prompts

## Snowflake layer
"Create a Snowflake repository layer for Next.js server actions using the schema in `src/sql/001_schema_mvp.sql`. Keep query code out of React components."

## RBAC
"Implement RBAC utilities with role checks and row filtering based on brand_id, department_id, and assigned user id."

## SOP register
"Build the SOP register slice with create, edit, submit, approve, reject, activate, and archive actions. Require main file metadata before submission."

## Assignments
"Build SOP assignment and implementation pages using `SOP_ASSIGNMENTS`. Enforce one row per sop_id + brand_id + department_id."

## Audits
"Build checklist template management and audit execution for Food Safety using `CHECKLIST_TEMPLATES`, `CHECKLIST_ITEMS`, `AUDITS`, and `AUDIT_RESPONSES`."

## Corrective actions
"Build the CAPA tracker with assignment, status changes, verification, closure, and evidence attachment."

## KPIs
"Build KPI definitions and monthly results pages with Green/Amber/Red status support."

## Dashboard
"Implement dashboard cards using the Snowflake views in `src/sql/010_views_mvp.sql`."
