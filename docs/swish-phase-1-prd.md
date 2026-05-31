# SWiSH Phase 1 Product Requirements Document

## Purpose

This document defines the Phase 1 product requirements for SWiSH's internal compliance platform.

Phase 1 is intentionally focused on the core compliance operating model validated through Vanta research and adapted for QSR operations in Kuwait.

This is not a full enterprise replica of Vanta. It is a SWiSH-specific first release designed to establish a scalable internal compliance engine for:

- SOP and policy governance
- controlled documents and evidence
- implementation planning and action tracking
- validations and checks
- audits and findings
- CAPA follow-up
- management reporting

## Product Goal

Build one connected compliance system where:

- programs define what must be achieved
- controls define what must be true
- SOPs and policies define the operating standard
- documents and evidence prove execution
- tasks assign responsibility
- checks validate status
- audits verify compliance
- findings and CAPA repair gaps
- dashboards summarize the full chain

## Phase 1 Scope

### In Scope

- Action Center
- Program Plan
- Checks
- Reports
- Compliance parent section
- Programs
- Controls
- Policies and SOPs
- Evidence and Documents
- Audits and Reviews
- Findings and CAPA linkage from audits
- role-based permissions and scoped visibility
- activity history and auditable workflow events

### Out Of Scope For Phase 1

- SWiSH Agent
- advanced AI workflow automation
- broad trust-center or external customer assurance modules
- large framework marketplace
- vendor risk, asset inventory, and non-core enterprise registries unless required as simple supporting records
- deep external integration coverage beyond the minimum needed for internal workflows

## Core Product Principles

1. One shared compliance engine, not disconnected modules.
2. Controls are the central operational object.
3. SOPs and policies are governed workflow records, not passive files.
4. Documents and evidence are reusable proof records, not one-off attachments.
5. Rollups are computed from source records, not manually maintained.
6. Every important record has status, owner, scope, and activity history.
7. Program-level planning and person-level action queues are separate surfaces.
8. Audits reuse live controls and evidence rather than creating isolated audit-only records.

## Primary User Roles

### Admin

- full configuration and governance access
- full workflow override rights
- full reporting visibility

### Compliance Owner

- create and manage programs, controls, SOPs, and evidence models
- submit and approve governance records
- manage audits and findings
- review rollups and intervene on gaps

### Regional Manager

- approve region-scoped SOPs where allowed
- monitor site completion and evidence submission
- oversee actions and acknowledgments in assigned region

### Site Manager

- acknowledge applicable SOPs
- complete assigned implementation tasks
- upload or replace site evidence
- respond to audit requests and CAPA tasks for scoped sites

### Auditor / Reviewer

- view scoped records and linked evidence
- perform audits
- flag evidence and raise findings
- request resubmission or clarification

### Executive

- read-only dashboards and management reports
- read-only access to active approved records where needed

## Main Modules

## 1. Action Center

Purpose:
single user-facing queue for assigned operational work.

Includes:

- approvals pending decision
- SOP acknowledgments
- evidence upload or replacement tasks
- overdue checks
- audit evidence requests
- CAPA follow-up tasks
- renewal and review tasks

Key behaviors:

- grouped by due, overdue, pending approval, pending acknowledgment, and audit-related work
- filtered by user scope and role
- linked back to source record detail pages

## 2. Program Plan

Purpose:
program-level implementation view that sequences work into phases and milestones.

Includes:

- program status
- target dates
- milestone groups
- counts of completed and pending work
- direct CTA links into policies, documents, audits, or setup tasks

Key behaviors:

- shows off-track, on-track, and blocked states
- rolls up milestone completion from linked tasks and records
- allows management to see program readiness without using personal task queues

## 3. Checks

Purpose:
validation engine that determines whether controls are satisfied.

Examples:

- SOP approval currentness
- SOP acknowledgment completion
- evidence freshness
- implementation completion
- audit-prep document readiness
- recurring review compliance

Key behaviors:

- pass/fail/incomplete/stale type outcomes
- linked to controls and source records
- create downstream tasks or degrade rollups when failing

## 4. Reports

Purpose:
management and executive visibility layer.

Includes:

- program completion
- control health
- acknowledgment completion
- stale evidence
- open findings
- overdue CAPA
- audit readiness
- site or region comparison

Key behaviors:

- always drill from summary to source records
- support executive, manager, and operator views

## 5. Compliance

Parent section containing the core source-of-truth modules.

### Programs

Programs represent internal compliance initiatives, standards, or operating readiness tracks.

### Controls

Controls are the central objects that connect:

- SOPs and policies
- documents and evidence
- checks
- audits
- findings
- CAPA
- reports

### Policies And SOPs

Governed operating records with:

- metadata
- scope
- content
- versioning
- approvals
- acknowledgment workflows
- linked controls

### Evidence And Documents

Reusable proof records such as:

- photos
- checklists
- signed forms
- training records
- certificates
- calibration and maintenance records
- supplier documents
- SOP attachments

### Audits And Reviews

Formal verification of scoped controls and evidence.

Outputs:

- findings
- evidence requests
- flagged proof
- follow-up work

## Required Workflows

## 1. SOP / Policy Lifecycle

1. Create SOP or policy from template, blank record, or import.
2. Enter metadata and scope.
3. Draft content in builder or upload content.
4. Map controls.
5. Select approver and audience.
6. Submit for approval.
7. Approver approves or rejects.
8. Approved version becomes active.
9. Acknowledgment tasks are created for scoped audience where required.
10. Related checks update.
11. Renewal cycle triggers review and possible reapproval.

## 2. Document / Evidence Lifecycle

1. Create or upload evidence record.
2. Enter metadata and link scope.
3. Link controls, checks, audits, or findings.
4. Submit for review if approval is required.
5. Evidence becomes approved or accepted.
6. Linked checks and audit readiness update.
7. Audit may flag evidence.
8. User updates and resubmits evidence.
9. Evidence state returns to ready when accepted.

## 3. Program Plan Flow

1. Create or activate a program.
2. Apply scope by brand, site, department, or process.
3. Load required controls.
4. Generate milestone tasks.
5. Route users into SOP, evidence, and audit-related work.
6. Roll completion upward into milestone and program state.

## 4. Check And Validation Flow

1. Check links to a control and one or more source records.
2. Source record changes trigger reevaluation.
3. Check result updates local status.
4. Failed or stale check creates follow-up work.
5. Control and reporting rollups recalculate.

## 5. Audit And Finding Flow

1. Create audit scoped to program, site, brand, process, or control set.
2. Review linked evidence and controls.
3. Flag missing, stale, or weak evidence.
4. Raise findings.
5. Create CAPA from finding.
6. Verify corrective evidence.
7. Recalculate control health and audit readiness.

## Required Page Structure

## Policies / SOPs List Page

Must include:

- search
- filters by status, owner, scope, review due, approver, category
- status chip
- active version
- owner
- approver
- effective date
- review date
- linked control count
- primary CTA: `New SOP` / `New Policy`

Supported actions:

- create
- import
- open detail
- submit for approval
- renew
- archive
- bulk export active list
- bulk assign audience where supported

## Policy / SOP Detail Page

Must include these tabs:

- Overview
- Content
- Versions
- Approvals
- Audience
- Controls
- Evidence Use
- Activity
- Comments (optional)

## Documents / Evidence List Page

Must include:

- search
- filters by status, type, site, owner, freshness, linked control, audit usage
- required vs uploaded grouping where relevant
- status / freshness chip
- owner
- issue date / expiry date / review date
- primary CTA: `Upload Document` / `Add Evidence`

Supported actions:

- upload
- open detail
- replace file
- submit for review
- archive
- bulk export

## Document / Evidence Detail Page

Must include these tabs:

- Overview
- File / Preview
- Versions
- Links
- Approvals / Reviews
- Audit Usage
- Activity
- Comments (optional)

## Action Center Page

Must include:

- my approvals
- my acknowledgments
- my evidence tasks
- my CAPA tasks
- overdue work
- filters by due date, status, type, source module

## Program Plan Page

Must include:

- program header
- readiness metrics
- milestone groups
- counts by status
- direct CTA links into source modules
- visible off-track or blocked indicators

## State Model

## Policy Parent Record

- Drafting
- In Review
- Active
- Renewal Due
- Superseded
- Archived

## Policy Version

- Draft
- Pending Approval
- Approved
- Active
- Rejected
- Superseded
- Archived

## Document Parent Record

- Draft / Unsubmitted
- In Review
- Approved / Accepted
- Stale
- Expired
- Replaced
- Archived

## Document Version

- Uploaded
- Pending Review
- Approved
- Rejected
- Flagged
- Ready For Audit
- Superseded
- Archived

## Approval State

- Not Started
- Pending
- Approved
- Rejected
- Withdrawn
- Expired

## Acknowledgment State

- Not Assigned
- Assigned
- Viewed
- Acknowledged
- Overdue
- Waived

## Required Triggers

## Notifications

Must trigger on:

- approval submission
- approver assignment or reassignment
- approval rejection
- SOP activation
- acknowledgment assignment
- acknowledgment reminder cadence
- renewal due
- evidence flagged in audit
- evidence nearing expiry or becoming stale

## Tasks

Must trigger on:

- policy submission -> approval task
- policy approval -> acknowledgment and implementation tasks where applicable
- new version with reaccept required -> new acknowledgment tasks
- flagged evidence -> evidence update task
- renewal due -> review or update task
- failed check -> remediation task
- audit request -> evidence submission task

## Recalculation Events

Must recalculate checks and rollups on:

- policy approval
- policy acknowledgment
- document upload
- document replacement
- review or expiry threshold crossing
- audit evidence resubmission
- finding closure and CAPA verification where linked

## Permissions Model

### Admin

- full rights across all records and settings

### Compliance Owner

- create, edit, submit, approve governance records
- map controls
- manage audits and evidence
- view full history

### Regional Manager

- approve scoped SOPs where allowed
- review site evidence
- monitor actions and acknowledgments in region

### Site Manager

- acknowledge SOPs
- upload and replace site evidence
- complete implementation tasks
- respond to audit requests in scoped sites

### Auditor / Reviewer

- read-only access to active versions and evidence in scope
- flag evidence
- request resubmission
- comment in audits

### Executive

- read-only dashboards and approved active records where needed

Important rule:

- editor rights and approver rights must be separate even if one user may hold both roles

## Core Data Model

Minimum Phase 1 entities:

- `program`
- `program_scope`
- `program_phase`
- `control`
- `control_mapping`
- `policy`
- `policy_version`
- `policy_assignment_rule`
- `policy_approval_step`
- `policy_approval_event`
- `policy_acknowledgment`
- `document`
- `document_version`
- `document_approval_step`
- `evidence_record`
- `check`
- `check_result`
- `audit`
- `audit_request`
- `finding`
- `capa_action`
- `task`
- `task_assignment`
- `activity_event`
- `comment`
- `notification_event`
- `site`
- `brand`
- `department`
- `user`
- `role`

## Success Criteria For Phase 1

Phase 1 is successful when SWiSH can:

- create and govern SOPs and policies with versioned approval flow
- assign acknowledgments by scoped audience
- manage reusable documents and evidence with reviewable versions
- connect SOPs and evidence to controls
- run checks from source record state
- execute audits against live controls and evidence
- raise findings and create CAPA from audits
- give each user a clear action queue
- give managers and executives rollup visibility from source data

## Immediate Build Order

1. finalize shared object and state model
2. implement policy / SOP parent and version flow
3. implement document / evidence parent and version flow
4. implement approval and acknowledgment task generation
5. implement control mapping layer
6. implement checks and recalculation hooks
7. implement Action Center
8. implement Program Plan rollups
9. implement audit -> finding -> CAPA linkage
10. implement reporting views

## Remaining Validation Gaps

Still useful but not blocking for Phase 1 architecture:

- exact Vanta policy detail tab structure
- exact Vanta document detail tab structure
- exact rejection UI behavior
- exact My Work operator-task content
- exact reverse linkage from control detail to policies and documents
- exact version references shown inside audit evidence views