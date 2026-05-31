# SWiSH Phase 1 Implementation Plan

## Purpose

This document converts the approved Phase 1 PRD and gap analysis into an implementation sequence.

It answers four practical questions:

1. what should be built first
2. what schema changes are required
3. what routes and screens are needed
4. how to evolve the current MVP without unnecessary rework

## Inputs

This plan is based on:

- `docs/swish-phase-1-prd.md`
- `docs/swish-phase-1-entity-state-diagram.md`
- `docs/swish-phase-1-gap-analysis.md`

## Delivery Strategy

Phase 1 should be implemented by introducing the shared model first, then moving existing workflow slices onto it.

The rule is:

- schema and domain objects first
- workflow states and services second
- routes and screens third
- rollups and reporting after the source records exist

Do not start by building new dashboard or reporting pages first. Those should follow the shared model, not lead it.

Also preserve separation by work mode:

- `Dashboard` for situational awareness and management rollups
- `Action Center` for operational execution and accountability
- `Compliance` for governed source-of-truth records
- `Assurance` for audits, findings, and remediation
- `Reports` for cross-cutting analysis

## Recommended Workstreams

### Workstream A: Shared Domain Foundation

Introduces:

- programs
- program scopes
- program phases
- controls
- control mappings
- generic tasks
- richer activity/event model

Additional rule:

- treat `CONTROLS` as the reusable center of gravity across policies, documents, checks, audits, findings, and CAPA

### Workstream B: Policy / SOP Refactor

Introduces:

- parent record + version split
- approval steps
- audience rules
- acknowledgments
- control mapping from SOPs

### Workstream C: Documents / Evidence Refactor

Introduces:

- document parent record
- document versions
- document approval/review flow
- freshness and expiry handling
- linkage to controls, audits, findings, and SOPs

Workflow rule:

- audit evidence must follow an explicit loop of flagged -> updated -> resubmitted -> ready for review

### Workstream D: Checks / Validation Engine

Introduces:

- checks
- check results
- recalculation hooks
- failure-driven tasks

### Workstream E: Audit / Finding / CAPA Alignment

Introduces:

- findings as first-class objects
- audit requests
- control-linked audits
- CAPA linkage back to findings and controls

### Workstream F: Action Center / Program Plan / Reports

Introduces:

- Action Center route and queue logic
- Program Plan route and milestone UI
- role-oriented reports and dashboards

Guardrails:

- Action Center should be generated from shared workflow rules, not hand-curated cards per module
- Dashboard should summarize health and drill into queues, not duplicate queue execution
- Reports should remain downstream rollups over governed records, checks, and audit states

## Build Order

## Phase 1A: Shared Foundations

### Goal

Create the missing shared objects so later workflow modules do not need to be rebuilt twice.

### Schema Additions

Add new tables:

- `PROGRAMS`
- `PROGRAM_SCOPES`
- `PROGRAM_PHASES`
- `CONTROLS`
- `CONTROL_MAPPINGS`
- `TASKS`
- `TASK_ASSIGNMENTS`
- `ACTIVITY_EVENTS`
- `COMMENTS`

### Backend Work

- add domain types for programs, controls, tasks, and activity events
- add repository/service/actions slices for programs and controls
- add task generation utility patterns
- add scoped query helpers for the new entities

### Frontend Work

Add routes:

- `/programs`
- `/programs/[id]`
- `/controls`
- `/controls/[id]`

Longer-term route target:

- `/compliance/programs`
- `/compliance/programs/[id]`
- `/compliance/controls`
- `/compliance/controls/[id]`

### Screens Required

`/programs`
- list page with status, scope, owner, target date, completion metrics

`/programs/[id]`
- overview
- phases/milestones
- linked controls
- scope summary
- activity

`/controls`
- list page with category, owner, linked SOPs, linked checks, status

`/controls/[id]`
- overview
- linked programs
- linked SOPs
- linked evidence
- linked audits/findings
- activity

### Definition Of Done

- programs and controls exist as first-class records
- tasks can be created generically against source objects
- activity events can be written for new entities

## Phase 1B: SOP / Policy Refactor

### Goal

Convert current SOPs from single mutable records into governed parent/version workflow records.

### Schema Changes

Introduce:

- `POLICIES` or repurpose `SOPS` as parent record
- `POLICY_VERSIONS`
- `POLICY_APPROVALS`
- `POLICY_AUDIENCE_RULES`
- `POLICY_ACKNOWLEDGMENTS`
- `POLICY_CONTROL_LINKS`

If keeping `SOPS` as the parent table, move mutable version fields into `SOP_VERSIONS` instead of leaving all fields on the parent.

### Migration Strategy

- keep current `SOPS` rows as parent records
- create one initial version row per existing SOP
- move `VERSION_NO`, `FILE_*`, `SUBMITTED_*`, `APPROVED_*`, `APPROVAL_REMARKS`, `ACTIVE_FROM`, `NEXT_REVIEW_DATE`, and versioned remarks into the version table
- preserve current route behavior during migration by reading through a compatibility service layer

### Backend Work

- introduce parent/version-aware SOP service
- add approval-step service
- add audience and acknowledgment creation logic
- add event triggers for approval, activation, renewal, and acknowledgment
- add control linking service

### Frontend Work

Refactor existing routes:

- `/sops`
- `/sops/new`
- `/sops/[id]`

Longer-term route target:

- `/compliance/policies`
- `/compliance/policies/[id]`

### Screens Required

SOP list:

- show active version
- show approval state
- show next review date
- show linked control count
- show acknowledgment completion summary

SOP detail tabs:

- Overview
- Content
- Versions
- Approvals
- Audience
- Controls
- Evidence Use
- Activity

### Definition Of Done

- active SOP content is versioned
- approvals are explicit records
- acknowledgment audience can be assigned
- new version creation does not overwrite active version directly

## Phase 1C: Documents / Evidence Refactor

### Goal

Evolve evidence from simple attachments into reusable governed document records.

### Schema Changes

Add:

- `DOCUMENTS`
- `DOCUMENT_VERSIONS`
- `DOCUMENT_APPROVALS`
- `DOCUMENT_LINKS`

Keep `EVIDENCE_FILES` only if needed as a migration or low-level storage metadata table. Long-term, document versions should become the governed layer above raw file metadata.

### Backend Work

- add document parent/version service
- add review and approval flow
- add freshness/expiry evaluator
- add links to controls, audits, findings, and SOP attachments

### Frontend Work

Add routes:

- `/documents`
 - `/documents/[id]`

Longer-term route target:

- `/compliance/documents`
- `/compliance/documents/[id]`
- `/documents/[id]`

### Screens Required

Documents list:

- filters by type, freshness, owner, linked control, audit usage
- required vs uploaded grouping where useful

Document detail tabs:

- Overview
- File/Preview
- Versions
- Links
- Approvals/Reviews
- Audit Usage
- Activity

### Definition Of Done

- documents are first-class records
- file replacement produces version history
- evidence can be linked to controls and audits without duplication
- freshness state can be computed

## Phase 1D: Checks / Validation Engine

### Goal

Introduce reusable validations that connect source record state to control health and tasks.

### Schema Additions

- `CHECKS`
- `CHECK_RESULTS`

### Backend Work

- define check types
- create check evaluation service
- add result recalculation hooks from SOP approval, acknowledgment, document review, audit events, and expiry thresholds
- add task generation on failing/stale results

### Frontend Work

Add routes:

- `/checks`
- `/checks/[id]`

### Screens Required

Checks list:

- control
- check type
- latest result
- scope
- owner
- last evaluated

Check detail:

- linked control
- evaluation criteria
- result history
- linked evidence/SOPs/documents
- created tasks

### Definition Of Done

- checks produce results against real source records
- failing or stale results drive tasks and rollups
- controls can aggregate multiple check results

## Phase 1E: Audit / Finding / CAPA Alignment

### Goal

Move from checklist-only audit execution to audit records that reference controls, evidence, findings, and CAPA more explicitly.

### Schema Additions

- `AUDIT_REQUESTS`
- `FINDINGS`

### Schema Evolution

- keep current `AUDITS`, `CHECKLIST_TEMPLATES`, and `AUDIT_RESPONSES`
- extend audits to link to programs and controls
- allow findings to be raised from audit responses and document/evidence review

### Backend Work

- add findings service and repository
- connect CAPA creation from findings rather than directly only from generic source references
- connect findings and CAPA back to controls/checks where possible
- add audit evidence request tracking

### Frontend Work

Refactor or extend:

- `/audits`
- `/audits/[id]`
- `/capa`
- `/capa/[id]`

Optional new route:

- `/findings`

### Definition Of Done

- audits can raise first-class findings
- findings can create CAPA
- CAPA can be traced back to audit, finding, and impacted control

## Phase 1F: Action Center, Program Plan, Reports

### Goal

Expose the shared model to users through the right operating surfaces.

### Frontend Work

Add routes:

- `/action-center`
- `/program-plan` or use `/programs/[id]` as the main plan route
- `/reports`

### Action Center Requirements

- approvals pending decision
- acknowledgments pending action
- document review tasks
- evidence update tasks
- failed-check remediation tasks
- audit request tasks
- CAPA tasks

### Reports Requirements

- executive rollup
- manager rollup
- operator or personal summary
- drill-down into source records

### Dashboard Evolution

The current dashboard should not be discarded. It should become the transitional operational dashboard while:

- Action Center absorbs personal tasks
- Programs absorb milestone readiness
- Reports absorb structured role-based reporting

### Definition Of Done

- users have a unified queue
- managers can view program progress
- reports show computed rollups from shared source records

## Suggested Route Map

### New Or Expanded Routes

- `/programs`
- `/programs/[id]`
- `/controls`
- `/controls/[id]`
- `/documents`
- `/documents/[id]`
- `/checks`
- `/checks/[id]`
- `/action-center`
- `/reports`
- optional `/findings`

### Existing Routes To Refactor

- `/sops`
- `/sops/new`
- `/sops/[id]`
- `/audits`
- `/audits/[id]`
- `/capa`
- `/capa/[id]`
- `/dashboard`

## Suggested Technical Migration Order

1. add new schema objects without breaking current reads
2. add new domain services beside existing services
3. introduce compatibility adapters where current UI still reads from old shapes
4. migrate SOPs to parent/version reads
5. migrate evidence reads to document parent/version reads
6. introduce controls/checks links before redesigning reports
7. move tasks into Action Center after generation rules exist
8. finally rebalance dashboard and reports around shared rollups

## Current Module Reuse Strategy

### Reuse Mostly As-Is

- admin master data
- scope filtering foundation
- role mapping foundation
- current CAPA UI slice as a base

### Reuse With Structural Refactor

- SOP pages
- evidence handling
- audit detail flow
- dashboard metrics

### New Build Required

- programs
- controls
- checks
- action center
- reports
- findings
- acknowledgment engine

## Priority Order For Engineering

1. schema foundation
2. control layer
3. SOP versioning and approvals
4. acknowledgment engine
5. document model
6. checks engine
7. findings layer
8. action center
9. reports
10. dashboard realignment

## Definition Of Done For The Entire Plan

Phase 1 is complete when the current app has evolved from:

`SOP -> Assignment -> Audit -> CAPA`

to:

`Program -> Control -> Policy/Document -> Check -> Audit -> Finding -> CAPA -> Report`

with:

- scoped ownership
- versioned governance records
- reusable evidence
- computed rollups
- unified action queues
- traceable activity history

## Practical Note

Do not try to implement all new routes before the underlying schema and services exist. The safest execution path is to land the shared model first, then migrate one workflow slice at a time onto it.