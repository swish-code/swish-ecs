# Final Lean MVP Schema

This is the locked step-1 schema direction for the Swish compliance MVP.

## Scope rule
The data model is centered on **brand + department**.
Location/outlet is intentionally excluded from the first schema to keep maintenance lower.

## Final table list
### Master tables
- `ROLES` — application roles
- `BRANDS` — the 10 Swish brands
- `DEPARTMENTS` — business departments
- `USERS` — users with optional brand/department ownership
- `USER_ROLES` — user-role mapping

### Core process tables
- `SOPS` — SOP register, main file metadata, approval tracking, lifecycle status
- `SOP_ASSIGNMENTS` — SOP implementation by brand + department
- `CHECKLIST_TEMPLATES` — audit template headers
- `CHECKLIST_ITEMS` — audit template items
- `AUDITS` — audit/checklist execution headers
- `AUDIT_RESPONSES` — Pass/Fail/N/A per item
- `CORRECTIVE_ACTIONS` — CAPA tracker
- `EVIDENCE_FILES` — uploaded file metadata attached to any entity
- `KPI_DEFINITIONS` — KPI setup
- `KPI_RESULTS` — monthly KPI actuals
- `AUDIT_LOG` — audit trail

## Why these tables are enough
- Approval tracking is kept inside `SOPS`, so there is no separate approval table.
- Main SOP file metadata is kept inside `SOPS`, so there is no separate SOP file table.
- Evidence remains separate because one pattern can serve SOPs, assignments, audits, corrective actions, and KPIs.
- Compliance assessments are deferred from the initial schema to keep the MVP lean. They can be added later if needed.

## Final SOP status model
- `Draft`
- `Submitted`
- `Approved`
- `Rejected`
- `Active`
- `Archived`

## Final assignment status model
- `Not Started`
- `In Progress`
- `Implemented`
- `Verified`
- `Delayed`
- `Not Applicable`

## Final corrective action status model
- `Open`
- `In Progress`
- `Submitted`
- `Verified`
- `Closed`

## File handling decision
The app should support file upload from day one, but Snowflake should store only file metadata and URLs.
Actual file storage should be handled by Azure Blob Storage, SharePoint, or OneDrive.

## Reporting direction
Current views support:
- SOP counts by status
- implementation %
- corrective action summary
- overdue actions
- KPI RAG summary
- audit score summary
- dashboard summary

A wider combined reporting view can be added later after the app workflow is stable.
