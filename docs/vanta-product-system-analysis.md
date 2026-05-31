# Vanta Product System Analysis For SWiSH

This document stores the core insights gathered from reviewing Vanta as a product system and translating the useful patterns into SWiSH's internal QSR-focused compliance platform direction.

## 1. Executive Summary

Vanta functions as a compliance operating system built around shared records, workflow state, and cross-module rollups rather than around isolated screens or static checklists. From the live workspace pages, the product appears to take a high-level assurance goal, instantiate it as a managed program, break it into phased work, attach reusable controls and evidence, assign owners, and continuously update readiness metrics that feed dashboards, task queues, and audit preparation.

As a product system, its strength is the way it connects strategic visibility and operational follow-through. Frameworks provide the program lens, roadmap orchestrates adoption, lower modules likely manage the proof and task execution, and summary metrics roll back upward into portfolio views and management status. For SWiSH, the main lesson is to build one internal compliance graph that supports SOPs, implementation, audits, CAPA, evidence, and KPI review through shared objects and workflow automation.

## 2. Product Operating Model

The core logic of the application is: turn an abstract compliance objective into a live operational system with owners, deadlines, proof, and measurable readiness. Instead of treating compliance as a one-time documentation exercise, the product appears to operationalize it through four layers: program definition, implementation planning, ongoing validation, and external/internal assurance output.

Direct observation shows a framework portfolio page and a roadmap page that already expose this model clearly. The framework page shows active programs, evidence completion, control completion, lifecycle state, and recommendations; the roadmap page shows sequenced milestones, assignees, due dates, task actions, and a top-level Off track signal plus Completed tests 20%.

Reasonable assumption: the system works by creating a tenant-specific framework instance, applying scoping rules, linking or generating controls, attaching tests and evidence expectations, and then surfacing the resulting work through roadmap steps, work queues, and dashboards. That is a generic pattern in mature compliance systems, but Vanta appears to package it in a more guided and productized way than many legacy GRC tools.

For SWiSH, the transferable operating model is:

- Goal layer: standards, operating requirements, or internal operating programs.
- Control layer: reusable control statements and operating checks.
- Workflow layer: assignments, reviews, reminders, CAPA, approvals.
- Proof layer: evidence, documents, acknowledgments, audit artifacts.
- Visibility layer: readiness, overdue work, exceptions, management review.

## 3. Navigation and UX Structure

The left-side navigation reveals the product's mental model better than the visible content does. It includes My Work, Roadmap, Vanta Agent, Tests, Reports, Compliance with Frameworks/Controls/Policies/Documents/Audits, then Customer trust, Risk, Vendors, Assets, Personnel, Integrations, and My security tasks.

That grouping suggests the system separates:

- Personal execution surfaces: My Work, My security tasks.
- Program and monitoring surfaces: Roadmap, Tests, Reports.
- Compliance source-of-truth surfaces: Frameworks, Controls, Policies, Documents, Audits.
- Supporting registries and operational context: Risk, Vendors, Assets, Personnel, Integrations.
- External assurance surfaces: Customer trust.

This is a strong UX pattern because it prevents the product from feeling like one giant checklist. It gives users multiple entry points based on role and intent: what is assigned to me, where is the program at, what is the source record, and what do I need to report.

From the pages observed, layout composition also appears consistent:

- A persistent shell with global nav and utilities.
- A content header with title, summary metrics, filters, or primary CTA.
- Main content built from list/table summaries, grouped cards, or milestone sections.
- Local actions placed close to work items, such as Connect, Add auditor, Create policy, or Mark complete.

That implies a UX designed around progressive drill-down: portfolio to program, program to tasks, task to action, then back to updated rollups. For SWiSH, this is worth reusing because QSR operations need the same separation between executive overview, regional/facility action tracking, and record-level evidence work.

## 4. Module Breakdown

### Frameworks

Purpose: portfolio view of enabled and available compliance programs.

Behavior: shows active program records, completion metrics, lifecycle state, and likely links into deeper framework detail.

Core actions: add framework, inspect active frameworks, review recommendations.

States: Active, Upcoming audit, plus progress percentages and audit timing columns.

Relationship: a rollup module dependent on controls, evidence, and audits.

### Roadmap

Purpose: structured implementation journey for a selected program.

Behavior: groups work into phases like Initial setup, Policies and Personnel, Test remediation, and Audit, with due dates and assignee states.

Core actions: start tasks, connect systems, create policies, add auditor, mark manual work complete.

States: Not started, Completed, grouped counters like 0 of 2 complete, overall health like Off track.

Relationship: orchestration layer over downstream modules.

### Tests

Direct observation is limited, but the existence of Completed tests 20% implies a module dedicated to validation status.

Purpose likely: convert raw evidence and manual attestations into pass/fail/needs-review signals.

Main inputs: integrations, policy approvals, uploads, review events.

Outputs: test status, remediation prompts, rollups into controls and framework readiness.

### Reports

Purpose: read-only management and audit visibility.

Likely behavior: summarize framework progress, open work, stale evidence, and audit readiness.

Relationship: aggregate layer over source modules.

### Controls

Purpose: reusable operational requirements that connect high-level programs to concrete validation and evidence.

Likely behavior: each control is linked to one or more frameworks, one or more tests, and one or more proof requirements.

Likely outputs: control status, owner, gaps, supporting evidence, linked tasks.

### Policies

Purpose: governed documents plus approval and acknowledgment workflow.

The roadmap shows policy creation embedded into implementation, and Vanta's help content says policies and acceptance can directly satisfy tests. That means policies are not passive documents; they are workflow-enabled evidence objects.

### Documents

Purpose: reusable evidence and artifact store.

Likely behavior: hold uploaded proofs, generated policy files, reports, and audit-ready attachments with metadata and review state.

Relationship: used by controls, tests, policies, and audits.

### Audits

Purpose: scoped review and evidence packaging layer.

The roadmap includes auditor onboarding and a defined audit window, suggesting audits are formal engagements driven by the same underlying compliance objects.

Likely outputs: requests, findings, completion state, and auditor-facing access.

### Integrations

Purpose: automation backbone.

Direct observation: roadmap contains Connect Entra (Office 365) and collaboration notifications setup. That indicates integrations feed user/system data, automated evidence, and workflow reminders.

### My Work / My Security Tasks

Purpose: role-specific action queues.

Behavior likely differs by audience: operators and program owners in My Work, end users or employees in My security tasks.

Relationship: downstream from all modules that generate assignments or approvals.

### Risk / Vendors / Assets / Personnel / Customer trust

Direct observation is limited to nav presence.

Reasonable assumption: these are supporting registries that enrich scope, ownership, and evidence models across the system. For SWiSH, analogous modules would likely be sites, brands, departments, suppliers, store assets, and roles rather than the exact same categories.

## 5. End-To-End User Flows

### Onboarding / Setup Flow

The roadmap page makes the onboarding journey explicit. A user starts with a selected program, answers scoping questions, assembles contributors, connects source systems, configures notifications, begins auditor setup, and creates foundational policies. This is a guided adoption funnel designed to get a workspace from zero to operational readiness.

### Create-To-Execute Flow

A typical item flow likely looks like this:

1. A framework or policy requirement creates a needed control or task.
2. The system assigns or leaves it unassigned pending triage.
3. The user opens the action from roadmap, work queue, or module page.
4. They connect a system, upload proof, approve content, attest completion, or create a document.
5. Status updates locally and then rolls up to milestone, test, control, and framework metrics.

### Review-To-Closure Flow

Manual work such as Meet with your auditor can be marked complete, while structured work like policies or integrations likely closes when the underlying record reaches a valid state. That implies a mixed workflow engine: some objects are closed by rules, others by humans, and some by review or approval.

### Issue-To-Remediation Flow

Direct observation is partial, but Test remediation as a roadmap phase strongly suggests that failed validation results become a visible remediation queue. Reasonable assumption: a failed or missing test creates follow-up work, which then changes control state, which then changes framework readiness.

### Dashboard-To-Action Flow

The framework and roadmap pages both appear to support drill-down behavior from summary to action. A user sees low completion or off-track status, enters the underlying milestone or module, acts on a task, and returns to updated rollups. That is a key product loop worth reusing in SWiSH.

## 6. Trigger and State Logic

The product appears to use layered state rather than one universal status field. Observed states include Active, Upcoming audit, Off track, Not started, Completed, and fractional progress like 0 of 3 complete.

A likely trigger-action-response pattern is:

- User clicks an action, such as Connect or Create policy, which opens a targeted setup flow or editor.
- User completes or configures the record.
- The record's status changes locally.
- Related counters and rollups update elsewhere, such as milestone completion, completed tests, evidence completion, or framework health.

Another likely pattern:

- System detects missing or failed proof through integration or review logic.
- The associated test or requirement becomes incomplete.
- A task or remediation item appears in work queues or roadmap.
- Notifications or reminders are triggered via configured collaboration channels.
- Once resolved, control and framework rollups improve.

This layered state model matters because it supports local clarity and global visibility at the same time. For SWiSH, your policy -> implementation -> audit -> CAPA -> verification chain should use the same idea: each object owns its own state, and higher-level programs compute rollups rather than relying on manual summary entry.

## 7. Likely Data and Architecture Model

The most plausible architecture is a shared object model with specialized modules acting as views and workflow surfaces over common records. The pages observed strongly suggest the following core entities:

- Workspace or organization.
- User, team, role, permission scope.
- Framework catalog item and framework instance.
- Requirement, clause, or applicability rule.
- Control.
- Test, monitor, or review item.
- Evidence object.
- Policy and policy version.
- Document, attachment, or artifact.
- Milestone or roadmap phase.
- Task template and task instance.
- Integration connector and sync result.
- Audit engagement and request or finding objects.
- Notification event or reminder rule.
- Activity log or comments stream.

Likely relationships include:

- Framework instances map to requirements.
- Requirements map to reusable controls.
- Controls map to tests, documents, and policies.
- Tasks can attach to controls, policies, milestones, audits, or integrations.
- Evidence can satisfy multiple controls and frameworks.
- Rollup services compute framework completion, milestone completion, and dashboard metrics from lower-level records.

Architecturally, this suggests:

- Shared domain services.
- A reusable workflow/task engine.
- A rollup/metrics service.
- An event or rule engine for status updates and reminders.
- Extensible framework templates and mappings.

That is exactly the kind of architecture SWiSH should aim for, with your own domain objects such as sites, SOPs, audits, findings, CAPA plans, and KPI reviews replacing Vanta's more security-centric registries.

## 8. UX and Interaction Insights

Several UX decisions appear especially strong.

First, the product separates portfolio visibility from actionable workflow. Frameworks provides summary status; roadmap provides staged work; task-oriented modules likely provide queue execution. This avoids making executives wade through task lists or forcing operators to navigate through abstract program summaries.

Second, the roadmap uses milestone grouping with durations, assignees, and compact task cards. That is a powerful adoption pattern because it reduces startup ambiguity and makes the product feel like a guided operating system rather than a blank database.

Third, the product appears to use repeated, scalable UI conventions:

- Status chips and completion counters.
- List or table summaries for portfolio records.
- Grouped task cards inside phases.
- Explicit action buttons attached to each work item.
- Search and command affordances, suggested by the global command bar and page-level search areas.

These patterns matter because compliance products fail when users cannot tell what to do next, what changed, or who owns a gap. Vanta's visible UI seems designed to minimize those failures by always pairing summary state with a next action.

## 9. What SWiSH Should Reuse

- Shared control and evidence model across multiple programs and audits.
- A phased roadmap that turns a broad operating goal into manageable work.
- Separate surfaces for portfolio visibility, operational execution, and source records.
- Explicit ownership and visible unassigned states.
- Rollup metrics that update automatically from lower-level records.
- Combination of manual and automated workflow steps in one engine.
- Integration-first thinking for real-time or near-real-time updates.
- Auditor or reviewer-specific access models rather than exposing the whole workspace.
- Reusable templates that instantiate tasks, milestones, and control mappings from a program type.
- Strong drill-down loop from dashboard -> issue -> action -> updated dashboard.

For QSR, these ideas translate well to SOP rollout, location compliance, operational audits, evidence freshness, and CAPA ownership.

## 10. What SWiSH Should Ignore or Redesign

- Broad, market-facing modules like Trust Center may be low priority for an internal QSR platform.
- Security-tool integration depth can be replaced by operational integrations more relevant to QSR, such as POS, HR, learning systems, maintenance, quality checks, and document repositories; the architecture pattern matters more than Vanta's specific connectors.
- Huge framework catalogs and recommendation engines may be unnecessary early on unless SWiSH plans to manage many standards in one UI.
- Some Vanta onboarding and educational content appears product-led-growth oriented; SWiSH may need operational guidance tied to stores, brands, or departments instead.

The key point is to borrow the system design, not the security-centric product surface.

## 11. SWiSH Product Translation

For SWiSH, the same product logic can be reoriented around QSR operations.

- SOPs: treat each SOP as a governed record with versions, approvals, activation scope, required acknowledgments, linked controls, and review cadence.
- Controls: use reusable operational controls such as food safety, cleanliness, opening/closing, cash handling, equipment checks, training compliance, and supplier controls, mapped across brands, sites, and internal programs rather than tied to one framework only.
- Implementation tasks: instantiate work from SOP releases, audits, findings, site readiness programs, or KPI exceptions, with clear owners and due dates.
- Audits: treat audits as scoped engagements over locations, processes, and control sets, consuming existing evidence and producing findings.
- Findings: create first-class issue records linked back to audits, controls, sites, and owners.
- CAPA: build corrective and preventive action workflows as child objects of findings with verification steps and closure evidence.
- Evidence: centralize photos, checklists, signed forms, reports, training records, and approvals as reusable proof objects.
- Dashboards: show brand, site, region, process, and owner rollups for overdue actions, audit scores, open CAPA, stale evidence, and SOP implementation status.
- KPI review: combine compliance state with operational KPIs so management reviews can connect control failures to business outcomes.

A strong SWiSH end-to-end workflow would be:

SOP published -> scope applied to sites and roles -> implementation tasks generated -> evidence collected -> site audit performed -> finding created -> CAPA assigned -> verification completed -> management dashboard updated.

## 12. Recommended SWiSH Architecture Direction

Build SWiSH around a modular but shared architecture.

### Module Structure

- Programs or Standards.
- SOPs and Policies.
- Controls.
- Evidence and Documents.
- Tasks and Work Queues.
- Audits.
- Findings and CAPA.
- Dashboards and Reviews.
- Supporting registries: Sites, Brands, People, Vendors, Assets, KPIs.

This mirrors Vanta's separation of portfolio, workflow, compliance objects, and supporting registries, but adapted to QSR operations.

### Shared Object Model

Core shared objects should include:

- Site, brand, or department.
- User, role, team, or scope.
- SOP, policy, version, or approval.
- Control, requirement, or checklist rule.
- Evidence object.
- Task template or task instance.
- Audit, finding, CAPA, or verification.
- KPI measure or management review record.
- Notification, activity log, or comment.
- Program instance or operating initiative.

This lets every module reference the same underlying reality instead of duplicating records across pages.

### Workflow Engine Patterns

- Template-driven task generation from SOP publication, audit findings, recurring reviews, and KPI exceptions.
- State machines per object type: draft, active, due, overdue, in review, closed, verified.
- Event-driven rollups so changes in low-level records update dashboards and parent objects automatically.
- Reminder and escalation rules by due date, severity, and owner inactivity.

### Ownership and Permissions

Use layered permissions:

- Platform admins.
- Program owners.
- Regional managers.
- Site managers.
- Auditors or reviewers.
- Task assignees.
- Read-only executives.

Support scope filtering by brand, site, department, process, and audit cycle, because internal usability will depend on narrowing work to the right operational slice.

### Dashboard Strategy

Create at least three dashboard layers:

- Executive: overall readiness, top risks, overdue CAPA, site or region comparisons.
- Manager: tasks due, audit schedules, implementation progress, stale evidence.
- Operator: my tasks, required uploads, pending approvals, recent findings.

Every chart or summary should drill into the exact records driving the metric, because that action loop is one of the clearest strengths visible in Vanta's product model.

### Scalability Approach

To scale well across brands and locations:

- Keep controls reusable and scoped, not duplicated.
- Store evidence once and relate it to many records.
- Use template libraries for SOPs, audits, CAPA, and recurring reviews.
- Build a consistent status model and reusable UI components.
- Treat dashboards as computed views, not manually maintained reports.

That architecture gives SWiSH the same core advantage Vanta appears to have: one system where program design, daily work, proof management, and leadership visibility all run on the same underlying compliance engine.