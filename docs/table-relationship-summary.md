# Table Relationship Summary

## Core master data
### `ROLES`
Defines application roles such as Admin, Business Excellence, Auditor, and Executive Viewer.

### `USERS`
Stores user identity and default organizational scope.
Relationships:
- optional default `BRAND_ID`
- optional default `DEPARTMENT_ID`
- optional default `LOCATION_ID`
- many-to-many with `ROLES` through `USER_ROLES`

### `USER_ROLES`
Maps users to roles.

### `BRANDS`
Master table for Swish brands.
Referenced by SOPs, assignments, audits, corrective actions, KPI definitions/results, and brand-location mappings.

### `DEPARTMENTS`
Master table for company departments.
Referenced by SOPs, assignments, audits, corrective actions, KPI definitions/results, and users.

### `LOCATIONS`
Master table for physical store branches.
Referenced by users, SOPs, assignments, audits, corrective actions, KPI definitions/results, and brand-location mappings.

### `BRAND_LOCATIONS`
Bridge table that defines which brands operate in which locations.
This is required for valid brand + location and brand + department + location scenarios.

## SOP and implementation
### `SOPS`
Central register for policies, procedures, SOPs, and similar documents.
Main relationships:
- optional `BRAND_ID`
- optional `DEPARTMENT_ID`
- optional `LOCATION_ID`
- `OWNER_USER_ID`
- `SUBMITTED_BY`
- `APPROVED_BY`
- logical attachments from `EVIDENCE_FILES`
- logical audit entries in `AUDIT_LOG`

### `SOP_ASSIGNMENTS`
Tracks implementation of a specific SOP for a specific scope.
Main relationships:
- `SOP_ID`
- `BRAND_ID`
- optional `DEPARTMENT_ID`
- optional `LOCATION_ID`
- `OWNER_USER_ID`
- `VERIFIED_BY`

This table is the operational implementation tracker.

## Audits and checklists
### `CHECKLIST_TEMPLATES`
Header table for audit/checklist templates.

### `CHECKLIST_ITEMS`
Checklist questions/items linked to a template.

### `AUDITS`
Execution header for a checklist against a scope.
Main relationships:
- `TEMPLATE_ID`
- `BRAND_ID`
- optional `DEPARTMENT_ID`
- optional `LOCATION_ID`
- `PERFORMED_BY`

### `AUDIT_RESPONSES`
Stores one response per checklist item per audit.
Main relationships:
- `AUDIT_ID`
- `ITEM_ID`

## Corrective action management
### `CORRECTIVE_ACTIONS`
Tracks findings and actions raised from audits, SOP gaps, KPI issues, or manual entries.
Main relationships:
- optional `BRAND_ID`
- optional `DEPARTMENT_ID`
- optional `LOCATION_ID`
- `ASSIGNED_TO`
- `SUBMITTED_BY`
- `VERIFIED_BY`

## Evidence and document security
### `EVIDENCE_FILES`
Stores file metadata and storage identifiers for evidence attachments.
This table is polymorphic via `ENTITY_TYPE` and `ENTITY_ID`.
It can attach to SOPs, assignments, audits, corrective actions, and KPI results.

### `FILE_ACCESS_RULES`
Stores app-level access rules for secured files.
This table is also polymorphic via `ENTITY_TYPE` and `ENTITY_ID`.
It allows access to be scoped by:
- role
- user
- brand
- department
- location

This is the key app-side security layer for SharePoint-backed documents.

## KPI tracking
### `KPI_DEFINITIONS`
Defines KPIs and target rules.
Can be scoped by brand, department, and location.

### `KPI_RESULTS`
Stores actual KPI values by reporting month.
Can also be scoped by brand, department, and location.

## Auditability
### `AUDIT_LOG`
Generic audit trail using `ENTITY_TYPE` and `ENTITY_ID`.
Tracks important lifecycle and workflow changes across modules.

## View strategy
The current views in `src/sql/010_views_mvp.sql` provide:
- status summaries
- implementation summaries
- corrective action summaries
- overdue actions
- KPI detail and summary
- audit score summary
- dashboard summary

The views compute `SCOPE_LEVEL` dynamically based on which of `BRAND_ID`, `DEPARTMENT_ID`, and `LOCATION_ID` are populated.
