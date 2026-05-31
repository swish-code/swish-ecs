# SWiSH Phase 1 Gap Analysis

## Purpose

This document compares the current SWiSH application and schema against the approved Phase 1 target defined in:

- `docs/swish-phase-1-prd.md`
- `docs/swish-phase-1-entity-state-diagram.md`

The goal is to show what already exists, what partially exists, and what is still missing so implementation can proceed in the right order.

## Summary Conclusion

The current application is a strong workflow MVP, but it is not yet a Phase 1 compliance operating system in the target shape.

What exists today is centered around:

- SOP register
- implementation assignments
- checklist-based audits
- CAPA
- dashboard rollups
- admin master data
- basic evidence attachment metadata
- generic audit log

What is still missing from the approved Phase 1 model is the shared compliance engine layer:

- programs
- controls
- checks
- policy/SOP parent-version model
- acknowledgment model
- document parent-version-review model
- generic task engine for Action Center
- milestone-based Program Plan model
- control-linked audit and evidence architecture

The current system is therefore best described as:

`workflow-capable MVP with compliance slices implemented`, not yet `shared-object Phase 1 platform`.

## Current Actual Surface

### App Routes Confirmed

Current route groups under `src/app`:

- `admin`
- `assignments`
- `audits`
- `capa`
- `dashboard`
- `sops`

Not present as first-class app routes:

- `programs`
- `controls`
- `checks`
- `documents`
- `reports`
- `action-center`
- `program-plan`

### Feature Folders Confirmed

Current feature groups under `src/features`:

- `admin`
- `assignments`
- `audits`
- `auth`
- `capa`
- `dashboard`
- `evidence`
- `home`
- `implementation`
- `kpis`
- `notifications`
- `shell`
- `sops`

Important current status:

- `evidence` feature folder exists but is not implemented as a real module
- `implementation` feature folder is empty
- `kpis` feature folder is empty
- `notifications` exists only as a conceptual placeholder service

## Gap By Domain Area

## 1. Programs / Program Plan

### Target

Phase 1 requires:

- `programs`
- `program_scopes`
- `program_phases`
- program-level milestone planning
- off-track / on-track rollups
- direct links from plan items into downstream work

### Current State

Status: `Missing`

Evidence:

- no `programs` route
- no `programs` or `program phases` feature slice
- no `PROGRAMS` or equivalent table in current schema
- no milestone-based planning structure in current app

### Interpretation

The current app has dashboard summaries and workflow modules, but there is no top-level program orchestration layer equivalent to the approved Program Plan.

## 2. Controls

### Target

Phase 1 requires controls as the shared hub connecting:

- policies and SOPs
- documents and evidence
- checks
- audits
- findings
- CAPA
- reports

### Current State

Status: `Missing`

Evidence:

- no `controls` route
- no `controls` feature module
- no `CONTROLS` table or mapping tables in current schema
- no current object that acts as a reusable many-to-many compliance hub

### Interpretation

This is one of the biggest architectural gaps. The current app connects workflows directly through SOPs, audits, and CAPA, but does not yet have the control layer needed for reuse and rollups.

## 3. Policies / SOPs

### Target

Phase 1 requires:

- parent policy/SOP record
- immutable version records
- approval workflow as explicit child records
- audience and acknowledgment flow
- control mapping
- activity history by record and version

### Current State

Status: `Partial`

Evidence:

- `sops` route exists with list, new, and detail pages
- current `SopRecord` includes fields for status, version number, owner, submitted/approved metadata, review date, and file metadata
- SOP workflow already supports draft, submitted, approved, active, rejected, and archived style transitions
- SOP detail page and approval panel exist

Structural limitation:

- `SOPS` is a single table holding both parent identity and current version fields together
- there is no `policy_version` or `sop_version` child table
- there is no parent/version split
- approved records can be revised conceptually, but not through a versioned workflow model
- there is no acknowledgment audience or acceptance tracking
- there is no control mapping layer

### Interpretation

Current SOP functionality is the closest existing slice to the target Phase 1 policy model, but it needs a structural redesign from `single mutable record` to `parent + version + approvals + audience + acknowledgments`.

## 4. Documents / Evidence

### Target

Phase 1 requires:

- parent document record
- versioned evidence records
- review or approval state where needed
- freshness/expiry handling
- linkage to controls, checks, audits, findings, and SOPs

### Current State

Status: `Partial`

Evidence:

- `EVIDENCE_FILES` table exists
- evidence attachments are polymorphic by `ENTITY_TYPE` and `ENTITY_ID`
- current schema supports attaching file metadata to SOPs, assignments, audits, CAPA, and KPI results
- the `evidence` feature folder exists

Structural limitation:

- there is no implemented first-class Evidence/Documents module in the app
- `EVIDENCE_FILES` is attachment metadata only, not a governed parent/version document model
- no document approval state
- no document version history
- no freshness or expiry state model
- no review workflow or audit-specific document state except indirect usage

### Interpretation

The app has the beginnings of a reusable evidence store, but it is still attachment-centric rather than document-centric.

## 5. Checks / Validations

### Target

Phase 1 requires:

- reusable `checks`
- scoped `check_results`
- automated recalculation from source record changes
- check-driven task creation and rollups

### Current State

Status: `Missing`

Evidence:

- no `checks` route
- no `checks` feature module
- no `CHECKS` or `CHECK_RESULTS` entities in schema
- audit checklist items exist, but those are audit-template questions, not reusable control validations

### Interpretation

The current audit checklist engine is useful, but it is not the same as a persistent checks framework that validates controls across SOPs, documents, approvals, and evidence freshness.

## 6. Action Center / Generic Task Engine

### Target

Phase 1 requires:

- user-facing Action Center
- generic `tasks` and `task_assignments`
- tasks generated by workflow events
- role- and scope-aware action queue

### Current State

Status: `Missing`

Evidence:

- no `Action Center` route
- no `tasks` table
- no `task_assignments` table
- no generic task engine in schema or features

Partial behavior exists via:

- assignment records for implementation
- audit actions on pages
- SOP approval panel
- CAPA action ownership

### Interpretation

The current app has workflow actions embedded inside module pages, but not a unified task surface. This is a major user-experience and architecture gap.

## 7. Audits

### Target

Phase 1 requires audits that consume:

- programs
- controls
- linked evidence
- findings
- CAPA linkage

### Current State

Status: `Partial`

Evidence:

- audit routes and pages exist
- checklist templates and checklist items exist
- audits can be created and completed
- responses are captured per checklist item
- score is calculated
- CAPA can be raised from audit flow

Structural limitation:

- audits are currently checklist-template driven, not control-driven
- audits are not linked to a program model
- evidence is not yet modeled as reusable document versions inside audits
- audit requests are not first-class entities
- findings are effectively represented through CAPA/source relationships rather than a separate findings model

### Interpretation

The current audit slice is functional and valuable, but it still needs to be elevated into the shared compliance model described in Phase 1.

## 8. Findings

### Target

Phase 1 requires findings as first-class records between audits and CAPA.

### Current State

Status: `Missing`

Evidence:

- no `findings` route
- no `FINDINGS` table
- current audit failures lead directly to CAPA creation or remain only in responses

### Interpretation

This is a structural gap. Findings should exist as reusable issue records rather than being implied only by audit responses or CAPA source references.

## 9. CAPA

### Target

Phase 1 requires CAPA linked back to findings, controls, checks, and reports.

### Current State

Status: `Partial / Strong`

Evidence:

- `capa` route exists with list, new, and detail pages
- `CORRECTIVE_ACTIONS` table exists
- assignee, severity, due date, status, submission, verification, and closure fields exist
- CAPA detail now has richer lifecycle visualization and checklist section

Structural limitation:

- CAPA is not yet linked through a first-class `finding`
- CAPA is not connected back to a `control`
- CAPA is not connected to a `check`
- no rollup service currently updates control health because controls/checks do not yet exist

### Interpretation

CAPA is one of the strongest current modules and can be retained, but it needs to be repositioned inside the shared Phase 1 model.

## 10. Dashboard / Reports

### Target

Phase 1 requires:

- executive, manager, and operator views
- program completion
- control health
- acknowledgment completion
- stale evidence
- open findings
- overdue CAPA
- audit readiness

### Current State

Status: `Partial`

Evidence:

- dashboard route exists
- dashboard service computes live rollups for SOPs, assignments, audits, and CAPA
- current dashboard has useful summary cards and panels

Structural limitation:

- no dedicated `reports` route/module yet
- no executive/manager/operator dashboard separation
- no program rollups
- no control health metrics
- no acknowledgment metrics
- no evidence freshness metrics
- no findings metrics

### Interpretation

The current dashboard is a good operational starting point, but not yet a full Phase 1 reporting layer.

## 11. Permissions And Scope

### Target

Phase 1 requires scoped access by:

- role
- brand
- site
- department
- process context where relevant

### Current State

Status: `Partial / Strong`

Evidence:

- roles, users, and user-role mapping exist
- brand/department/location scope model exists
- multi-scope support and filtering have already been implemented in the app
- file access rules exist for document security extension

Structural limitation:

- permission model is not yet expressed against programs, controls, checks, acknowledgments, or document review roles because those slices do not yet exist
- editor vs approver distinction is not modeled as a first-class workflow permission layer for versioned governance records

### Interpretation

The scope foundation is good and reusable. It is one of the strongest pieces already in place for Phase 1.

## 12. Notifications

### Target

Phase 1 requires workflow-driven notifications for approvals, acknowledgments, renewals, flagged evidence, and overdue tasks.

### Current State

Status: `Partial / Conceptual`

Evidence:

- `notifications/service.ts` exists
- current service is conceptual and returns `disabled` or `deferred`
- actual Outlook/Graph delivery is not implemented

### Interpretation

The event concept exists, but delivery and richer notification triggers are not implemented.

## 13. Current Schema vs Target Schema

### Already Present

- `ROLES`
- `USERS`
- `USER_ROLES`
- `BRANDS`
- `DEPARTMENTS`
- `LOCATIONS` via extension
- `SOPS`
- `SOP_ASSIGNMENTS`
- `CHECKLIST_TEMPLATES`
- `CHECKLIST_ITEMS`
- `AUDITS`
- `AUDIT_RESPONSES`
- `CORRECTIVE_ACTIONS`
- `EVIDENCE_FILES`
- `KPI_DEFINITIONS`
- `KPI_RESULTS`
- `AUDIT_LOG`

### Missing Against Phase 1 Target

- `PROGRAMS`
- `PROGRAM_SCOPES`
- `PROGRAM_PHASES`
- `CONTROLS`
- `CONTROL_MAPPINGS`
- `POLICY_VERSIONS`
- `POLICY_APPROVALS`
- `POLICY_AUDIENCE_RULES`
- `POLICY_ACKNOWLEDGMENTS`
- `DOCUMENTS`
- `DOCUMENT_VERSIONS`
- `DOCUMENT_APPROVALS`
- `CHECKS`
- `CHECK_RESULTS`
- `AUDIT_REQUESTS`
- `FINDINGS`
- `TASKS`
- `TASK_ASSIGNMENTS`
- `ACTIVITY_EVENTS` as a richer structured workflow log beyond the generic audit log
- `COMMENTS` as first-class collaboration records where needed

## 14. Gap Severity By Priority

### Critical Gaps

- controls layer absent
- programs and program phases absent
- policy/SOP version model absent
- acknowledgment model absent
- checks model absent
- generic Action Center task engine absent

### Important But Can Follow Immediately After Core Model

- document parent/version/review model
- first-class findings model
- report module
- richer notifications

### Already Strong Enough To Reuse

- scope model
- admin master data
- SOP workflow basics
- audit template and execution basics
- CAPA workflow basics
- dashboard KPI slice as a temporary operational view
- audit log concept

## 15. Recommended Immediate Implementation Order

1. introduce `programs`, `program_scopes`, and `program_phases`
2. introduce `controls` and `control_mappings`
3. refactor `SOPS` into a Phase 1 policy/SOP parent + version model
4. add `policy_approvals`, `policy_audience_rules`, and `policy_acknowledgments`
5. add document parent/version/review model over or alongside `EVIDENCE_FILES`
6. add `checks` and `check_results`
7. add `tasks` and `task_assignments` for Action Center
8. add `findings` between audits and CAPA
9. update dashboard into role-oriented reporting views
10. implement workflow notifications on the new task and approval events

## 16. Practical Interpretation

The current app is not far from the target in workflow spirit, but it is still using module-local records where Phase 1 needs shared domain records.

The biggest shift is this:

- Current model: `SOP -> Assignment -> Audit -> CAPA`
- Target model: `Program -> Control -> Policy/Document -> Check -> Audit -> Finding -> CAPA -> Report`

That is the exact architectural gap Phase 1 needs to close.