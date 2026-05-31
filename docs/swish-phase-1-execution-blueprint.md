# SWiSH Phase 1 Execution Blueprint

## Purpose

This document turns the approved Phase 1 architecture into a practical execution plan.

It is optimized for the fastest realistic delivery path given:

- the current MVP already exists
- Snowflake lean Phase 1 tables have been created
- SOP parent/version migration has started in the app layer
- AI development support is available
- Vanta reference patterns are already understood
- internal workflow expectations are already known

## Delivery Assumptions

This plan assumes:

- one strong product-engineering stream with AI support working continuously
- Snowflake access, schema change rights, and test data are available from day one
- business owners can approve control taxonomy, approver matrix, and document rules quickly
- UI can reuse the current shell, dashboard foundation, and existing interaction patterns

## Recommended Target

Fastest practical Phase 1 target:

- start: Monday, June 1, 2026
- finish: Friday, July 24, 2026
- duration: 40 working days
- shape: production-ready internal Phase 1 release, not a prototype

This is already an aggressive schedule.

Anything materially shorter than 40 working days starts increasing the risk of:

- weak workflow edge-case handling
- incomplete migration safety
- fragile reporting rollups
- insufficient testing around approvals, audits, and remediation

## Architecture Guardrails

The build should stay aligned to these rules:

- keep Snowflake lean and additive
- keep the product separated by mode of work: `Dashboard` for summary, `Action Center` for execution, `Compliance` for governed source records, `Assurance` for audit/remediation, and `Reports` for analysis
- use `CONTROLS` as the shared hub
- use `TASKS` for generic work queues instead of module-specific task tables
- use `CONTROL_LINKS` for lightweight many-to-many linking
- keep `SOPS` and `DOCUMENTS` as parent records with version-aware children or payload layers
- use explicit lifecycle states plus computed health instead of a single overloaded status field
- treat audit evidence as a first-class loop: flag -> update -> resubmit -> ready for review
- avoid premature foreign-key-heavy modeling in Snowflake if it slows operational migration
- keep future extension paths open for KPI management, richer validations, and SWiSH Agent without redesigning the core model

## Operating Model Additions

The recent Vanta teardown reinforces several product-level rules that should now be treated as part of the blueprint, not optional polish:

- `Programs` or `Frameworks` are orchestration overlays, not the core of the graph
- `Controls` remain the center of gravity because they are the only reusable anchor across policies, documents, checks, audits, findings, and remediation
- `Dashboard` must stay summary-oriented and should not turn into a task list
- `Action Center` should aggregate approvals, reviews, rollouts, and remediation from shared workflow rules rather than each module inventing its own queue
- governed records should expose list/register pages for visibility and detail pages for lifecycle transitions, linked records, and activity
- audit readiness is a derived condition produced by linked evidence, current governed records, and resolved exceptions, not a manual checkbox

## Interaction Standard

Phase 1 should adopt a standard interaction contract for workflow-heavy pages.

Each major screen should be modeled as:

- intent
- permission check
- data fetch
- render model
- user action
- command
- domain transition
- persistence
- event emission
- projection refresh
- UI update

This is the internal pattern behind the Vanta-like behavior we are targeting, where approvals, document review, evidence resubmission, roadmap tasks, and readiness rollups behave like governed workflow commands instead of raw CRUD edits.

### Recommended Internal DSL

Use a lightweight `Compliance Interaction Language` for screen and command specs.

Each screen spec should define:

- route
- entity
- purpose: overview, queue, detail, governance, reporting, or audit
- auth rule
- read model
- derived fields
- visible actions
- command trigger per action
- refresh targets after success

Each command spec should define:

- actor rule
- target entity
- preconditions
- mutations
- emitted domain events
- side effects such as tasks, notifications, or audit logging
- affected projections to refresh

### RACE Screen Pattern

Use `RACE` as the implementation structure for major SWiSH screens:

- `Render`: route, entity, read model, permissions, sections, tabs, badges, metrics
- `Actions`: primary, secondary, row, bulk, and inline actions
- `Commands`: action-to-command mapping, validations, and mutations
- `Events`: emitted events, notifications, tasks created, projection refreshes, audit-log writes

### Page Design Rule

For governance and assurance modules, buttons should call explicit commands rather than inline table mutations. This includes flows such as:

- submit policy/SOP for approval
- approve or reject governed versions
- upload or replace a document version
- flag or resubmit audit evidence
- complete roadmap or rollout tasks
- open remediation from failing checks or findings

### Projection Rule

Dashboard, Action Center, control health, and audit readiness should remain projection-driven.

Do not hand-maintain rollup counters directly on UI actions when they can be derived from:

- check results
- version approvals
- document review state
- tasks
- findings
- CAPA closure
- audit transitions

### Target Route Hierarchy

Phase 1 should converge toward this route shape:

- `/dashboard`
- `/action-center`
- `/compliance/programs`
- `/compliance/programs/[id]`
- `/compliance/controls`
- `/compliance/controls/[id]`
- `/compliance/policies`
- `/compliance/policies/[id]`
- `/compliance/documents`
- `/compliance/documents/[id]`
- `/compliance/checks`
- `/compliance/checks/[id]`
- `/assurance/audits`
- `/assurance/audits/[id]`
- `/assurance/findings`
- `/assurance/findings/[id]`
- `/assurance/capa`
- `/assurance/capa/[id]`
- `/reports`
- `/admin/*`

The current Phase 1 slices can continue to use existing top-level routes while services and UI are migrated toward this hierarchy.

## 1. Next Immediate Implementation Step

The next immediate step is:

`finish the SOP versioning slice end-to-end`

This is the correct next move because the current product already depends on SOPs, and SOP versioning is the first real compatibility bridge from the MVP model into the Phase 1 architecture.

### Immediate Work Items

1. run the Snowflake backfill script for `SOPS -> SOP_VERSIONS` and `EVIDENCE_FILES -> DOCUMENTS` in development
2. validate that every current SOP has `CURRENT_VERSION_ID`
3. expose version-aware SOP behavior in the UI, not only in the repository layer
4. add an explicit `Create new version` flow so users understand that a version bump creates a new draft
5. add regression checks for approval transitions, version bumps, and active-version reads

### Immediate Definition Of Done

- SOP list and detail pages read the current version safely
- changing the version number creates a new draft version instead of mutating approved history
- approval timestamps stay attached to the correct version
- migrated SOPs still display correctly after backfill

## 2. Recommended Development Sequence

The fastest safe build order is:

1. schema backfill and compatibility reads
2. SOP parent/version workflow completion
3. document parent/version module
4. controls and control links
5. checks and check results
6. generic tasks and Action Center rules
7. audit, findings, and CAPA alignment
8. program plan and reports
9. dashboard realignment, UAT, and production hardening

This order now has one additional constraint: summary surfaces must follow source-of-truth workflows. Avoid building advanced reports, roadmap rollups, or executive drill-downs ahead of stable controls, governed records, checks, and evidence feedback loops.

### Why This Order Works

- it reuses the strongest existing slice first
- it introduces shared objects before advanced reporting
- it prevents building controls, checks, and tasks on top of unstable document and SOP models
- it preserves a lightweight architecture while unlocking future modules cleanly

## 3. Phase 1 Timeline

## Phase 0: Foundation And Migration Safety

Dates:

- June 1 to June 5

Focus:

- Snowflake backfill
- compatibility service stabilization
- baseline validation

Backend and database:

- run and verify the Phase 1 backfill script in development
- confirm `SOPS.CURRENT_VERSION_ID` and `DOCUMENTS` backfill quality
- add repository compatibility reads for version-aware SOP behavior
- define initial API and service contracts for documents and controls

Workflow engine:

- define the first reusable task-generation rules, but do not expose Action Center yet

UI:

- add visible SOP version-awareness cues
- prepare the SOP detail page for versions history and future document linking
- keep list/register pages distinct from execution queues so Action Center can stay module-agnostic later

Testing:

- migration smoke checks
- SOP regression checks on list, detail, edit, and approval transitions

Milestone:

- the app can safely run against the new schema without breaking the current SOP workflows

## Phase 1: SOP Governance Completion

Dates:

- June 8 to June 19

Focus:

- policies and SOPs as governed parent/version records
- approval-safe editing
- audit-safe active version behavior

Backend and APIs:

- finish SOP version queries and write rules
- add explicit new-version creation behavior
- separate parent metadata from version metadata in services
- prepare acknowledgment-ready interfaces even if the full acknowledgment engine lands later

Database:

- verify migration quality for all existing SOPs
- add any missing helper views needed for current-version reads

Workflow engine:

- enforce draft, submitted, approved, active, rejected, and archived transitions at the version level
- define approval event payloads for future tasks and notifications

UI:

- SOP detail tabs or sections for overview, content, versions, approvals, and controls placeholder
- add explicit version creation CTA
- make approval history clearly tied to the current version

Testing:

- version bump regression
- approval lifecycle tests
- read-path validation against migrated records

Milestone:

- SOP governance is Phase 1-shaped and no longer depends on a single mutable record model

## Phase 2: Documents And Controls Core

Dates:

- June 22 to July 3

Focus:

- governed documents
- first-class controls
- linking layer between controls and SOPs/documents

Backend and APIs:

- build `DOCUMENTS` service and repository
- build `CONTROLS` service and repository
- add `CONTROL_LINKS` patterns for SOPs and documents
- create list and detail query models for both modules

Database:

- verify `EVIDENCE_FILES.DOCUMENT_ID` quality
- seed initial control categories and statuses
- prepare starter control-link conventions

Workflow engine:

- add document review and renewal trigger rules
- define stale-document and missing-evidence task criteria

UI:

- add `/documents` and `/documents/[id]`
- add `/controls` and `/controls/[id]`
- show linked-control counts in SOP views
- expose document freshness and ownership clearly
- make document detail pages responsible for linked controls, audit usage context, and future evidence review actions rather than keeping documents as list-only records

Testing:

- document creation and file replacement flows
- control linking tests
- scope and permission checks for new modules

Milestone:

- controls become the reusable shared hub and documents stop behaving like raw attachments only

## Phase 3: Checks, Tasks, And Audit Alignment

Dates:

- July 6 to July 17

Focus:

- validation engine
- generic work queue model
- findings between audits and CAPA

Backend and APIs:

- build `CHECKS` and `CHECK_RESULTS` services
- add evaluation rules for SOP status, currentness, document freshness, and audit readiness
- build `FINDINGS` service and CAPA linkage from findings
- extend audits to reference controls and findings more directly
- add generic `TASKS` generation logic from failing checks and findings

Database:

- seed first operational checks
- validate audit-to-finding mappings
- align CAPA reads with `FINDING_ID` and `CONTROL_ID`

Workflow engine:

- failing checks create tasks
- findings create remediation work
- overdue task states and escalation flags are introduced
- audit evidence feedback should use the same shared workflow primitives as other tasks so flagged evidence can later move through update, comment, resubmit, and ready states without special-case logic

UI:

- add `/checks` and `/checks/[id]`
- refactor audit detail to show findings explicitly
- extend CAPA detail to show control and finding traceability
- introduce the first Action Center queue view if task generation is stable by the second week of this phase

Testing:

- check recalculation and stale state tests
- audit-to-finding-to-CAPA traceability tests
- task generation and due-date regression tests

Milestone:

- the compliance engine is now connected through controls, checks, findings, and remediation tasks

## Phase 4: Program Plan, Reports, Dashboard, And Release Hardening

Dates:

- July 20 to July 24

Focus:

- management surfaces
- reporting
- stabilization
- production readiness

Backend and APIs:

- add program rollup queries
- finalize Action Center query models
- build report datasets for executive and manager views

Database:

- add lean reporting views if needed for control health, stale documents, open findings, and overdue CAPA
- verify query performance on the initial data set

Workflow engine:

- finalize task grouping and queue prioritization
- ensure program-level rollups read from live source records only

UI:

- add `/action-center`
- add `/reports`
- add first Program Plan experience under `/programs` or `/programs/[id]`
- rebalance `/dashboard` into a transitional operational overview instead of trying to make it the only reporting surface

Testing:

- end-to-end UAT walkthroughs
- role and scope permission testing
- production smoke checklist
- release cutover checklist

Milestone:

- Phase 1 is ready for internal production rollout

## 4. Suggested Sprint Breakdown And Milestones

| Sprint | Dates | Primary Outcome | Exit Milestone |
| --- | --- | --- | --- |
| Sprint 0 | Jun 1 to Jun 5 | Schema backfill and compatibility stabilization | New schema works with current app reads |
| Sprint 1 | Jun 8 to Jun 19 | SOP governance completion | SOPs are truly parent/version driven |
| Sprint 2 | Jun 22 to Jul 3 | Documents and controls core | Documents and controls become first-class modules |
| Sprint 3 | Jul 6 to Jul 17 | Checks, tasks, audits, findings | Shared compliance engine is operational |
| Sprint 4 | Jul 20 to Jul 24 | Reports, Action Center, dashboard, release hardening | Internal production-ready Phase 1 release |

### Milestone Summary

1. June 5: backfill and compatibility complete
2. June 19: SOP workflow upgraded to version-safe governance
3. July 3: documents and controls live as reusable shared records
4. July 17: checks, tasks, findings, audits, and CAPA are connected
5. July 24: internal Phase 1 release ready

## 5. Critical Dependencies And Early Blockers

These must be planned early because they can slow the whole program even if coding moves fast.

### Business Dependencies

- control taxonomy approval
- first program seed definitions
- approver matrix by role and scope
- acknowledgment audience rules
- document categories and freshness rules

### Data Dependencies

- valid Snowflake development data set
- confirmed backfill quality for SOPs and evidence
- clean mapping rules for evidence types and source entities

### Technical Dependencies

- Snowflake worksheet and execution access for migration validation
- stable auth and RBAC rules for new routes
- SharePoint or file-storage conventions kept consistent for governed files
- a staging-like environment for UAT before production rollout

### Delivery Risks

- auto-seeding controls too early from messy historical data
- allowing module teams to bypass `CONTROLS`, `TASKS`, or `CONTROL_LINKS`
- building reports before shared object relationships are stable
- trying to ship KPI management or SWiSH Agent inside Phase 1
- insufficient UAT on approval and remediation edge cases

## Recommended Staffing Pattern

Fastest realistic path assumes:

- 1 product-engineering lead driving architecture and core code
- 1 supporting engineer or AI-assisted parallel stream for UI and service slices
- 1 consistent business reviewer for controls, approvals, and UAT decisions

If the business reviewer is not available quickly, the schedule will slip even if coding speed stays high.

## What Not To Add In Phase 1

To keep the delivery fast and clean, do not add these into the core Phase 1 build:

- dedicated KPI workflow tables
- separate module-specific task engines
- deep framework marketplace behavior
- SWiSH Agent automation logic
- extra reporting tables that duplicate source records

These can fit later on top of the current architecture by extending:

- `CHECKS`
- `CHECK_RESULTS`
- `TASKS`
- `CONTROL_LINKS`
- lean reporting views

## Final Recommendation

Plan against a 40-working-day baseline from June 1 to July 24.

Use the first 15 working days to lock the two foundational governance objects:

- SOP parent/version workflow
- document parent/version workflow

Then make controls, checks, tasks, findings, and reports sit on top of those stable objects instead of trying to build every module in parallel.

That is the fastest path that still keeps the system lightweight, scalable, and production-ready.