# Vanta Policy And Document Workflow Analysis For SWiSH

This document captures the validated product and workflow insights gathered from Vanta about policies, SOP-like records, controlled documents, approvals, acknowledgments, versioning, and evidence relationships.

The goal is to extract the parts SWiSH should reuse in a simplified QSR-focused internal compliance platform for Kuwait, not to clone Vanta exactly.

## 1. Validated Observations

Vanta's policy workflow is directly confirmed to start from `Compliance -> Policies -> + Add policy`, where the user enters a title and description, then drafts content in an editor, uploads a file, or syncs content from Confluence, SharePoint, or Google Drive. A policy can then be submitted for approval, with the approver selected from users who have Admin or Editor status, and once approved the policy version moves from `Pending Approval` to `Approved` on the Policies page.

A policy detail experience clearly exists because Vanta help instructs users to open a custom policy and use its `Controls` tab to add or remove mapped controls. The help content also distinguishes a `Draft section` inside the policy from the whole policy record, and separate three-dot menus exist for deleting the draft versus deleting the entire policy. That strongly validates a split between record-level actions and version or draft-level actions.

Vanta has a guided `Policy Builder` flow with questions on the left and a live preview on the right, and sections become complete as fields are filled in. That confirms a dedicated drafting experience with preview behavior rather than only a plain upload screen.

Policy acknowledgment is directly confirmed to happen through `My Security Tasks`, where employees log in, see policies requiring acceptance, and accept them there. Group-based assignment is supported through onboarding group settings or group-specific settings, and pending tasks can trigger reminders based on configured cadence, with manual reminders available from the People page.

When a policy is approved, Vanta marks the related policy test as `OK`, and the approved policy document becomes visible in both `Monitors` and `Documents` views. Custom policies also create tests to monitor annual approval status and employee acceptance, confirming that policy approval and acknowledgment are first-class compliance events tied to tests.

Vanta directly supports policy renewals. Users can open a policy from the Policies page, choose the renewal model, assign an approver, and continue; the system also supports reacceptance when updates require employees to reaccept the policy. This validates renewal, reapproval, and optional re-acknowledgment behaviors.

For documents, Vanta's help center confirms a dedicated `Documents` module with `required documents` and `uploaded documents`, and it supports a document approval workflow that can include up to three approval steps. Audit evidence help confirms that evidence can be flagged during audits and then taken back to the linked document or test for update and resubmission, after which the evidence state can become `Ready for audit`.

Roadmap directly surfaces policy work such as policy creation inside milestone phases, which confirms Roadmap is tied to policy and document workflow and is not only a static onboarding page. The selected live pages also show that work items carry assignee states, completion states, and direct CTA buttons, which validates the presence of a shared task-oriented interaction model across at least Roadmap and likely other workflow surfaces.

## 2. Confirmed Workflow Behaviors

### Confirmed Policy Flow

1. Create or import a policy from Policies.
2. Draft content in the editor or Policy Builder, or sync or upload external content.
3. Submit the policy for approval and choose an approver with Admin or Editor status.
4. Once approved, policy status changes from `Pending Approval` to `Approved`.
5. The approved policy version becomes visible in Documents and Monitors, and related policy tests update accordingly.
6. Assigned employees acknowledge the policy through My Security Tasks, which updates policy acceptance tests to `OK`.
7. On renewal or update, the policy can be sent back through approval and optionally re-acknowledgment.

### Confirmed Document And Evidence Flow

1. A required or uploaded document exists in the Documents module.
2. Documents can participate in an approval workflow with multiple approvers.
3. Documents can be used as audit evidence, and auditors can flag issues with that evidence.
4. Users can navigate to the linked document or test, update it, and resubmit the evidence for review, which changes audit evidence status to `Ready for audit` once accepted.

### Confirmed Cross-Module Behaviors

- Policy approval affects tests and document visibility.
- Policy acknowledgment affects test status.
- Policy-to-control mapping exists directly from the policy detail page.
- Roadmap creates or at least points users into policy work.
- My Security Tasks is the actual employee-facing queue for acknowledgments.
- Audit workflows consume the same evidence objects already managed through documents and tests.

The confirmed difference between My Work and My Security Tasks is only partially validated. My Security Tasks is explicitly the end-user queue for policy acceptance. My Work is visible in navigation and likely serves operator or compliance-user work, but this has not yet been directly confirmed from a live page in the current tenant.

## 3. Remaining Assumptions

A number of important details are still not directly validated from the live UI.

For policy detail view, it is validated that a Controls tab exists, but the exact presence of separate tabs for Content, Metadata, Approvals, Audience, Versions, and Activity is still inferred rather than confirmed. It is highly likely these sections exist in some form because the workflow requires owner, approver, status, version, assignment, and control mappings, but the exact tab structure remains an assumption.

Policy rejection is not explicitly confirmed in the retrieved Vanta help content. Rejection, revision comments, and resubmission are highly likely because approval workflows generally require them, but these specifics remain assumptions until a live approval screen or help article confirms them.

Policy version history is strongly implied by language such as `new policy version`, renewal flow, and historical approver/date import, but a visible version history UI has not yet been directly confirmed. Likewise, whether users can compare older versions side by side is unconfirmed.

For documents, a document detail page almost certainly exists, but exact visible fields such as expiry date, review cadence, freshness state, linked controls/tests/audits, and approval history have not yet been directly confirmed on a live page or in retrieved full-text documentation.

It is also still unconfirmed whether policy approvals, document approvals, renewals, and flagged evidence updates appear in `My Work` specifically, though they almost certainly surface somewhere for operators. Right now, only the end-user acknowledgment queue in My Security Tasks is directly confirmed.

Control detail linkage is partly confirmed only from the policy side, where policies can map to controls through a Controls tab. The reverse view, whether control detail visibly lists linked policies, linked documents, and linked tests, is still inferred.

Audit evidence linkage is confirmed at the evidence level, but whether specific policy or document versions are shown to auditors as version-labeled references is still an assumption.

## 4. SWiSH-Ready Page Structure

### SWiSH SOP Detail Tabs

Based on what is validated and what is required for a workable internal QSR system, a SWiSH SOP or policy detail page should have these exact tabs:

- `Overview`: code, title, category, owner, approver, status, active version, scope, effective date, next review date, linked program, linked control count
- `Content`: structured SOP content editor or file preview, with current active version clearly labeled
- `Versions`: version list with status, created by, approved by, approval date, effective date, re-acknowledgment flag, and ability to open prior versions
- `Approvals`: approval chain, decisions, timestamps, comments, pending approver, and resubmission actions
- `Audience`: applicable roles, brands, sites, departments, assigned users or groups, acknowledgment completion
- `Controls`: linked controls and linked checks, with add or remove mapping
- `Evidence Use`: where this SOP or version is being used in audits, checks, or findings
- `Activity`: immutable timeline of create, edit, submit, approve, reject, activate, acknowledge, renew, and archive events
- `Comments`: optional collaboration thread if SWiSH wants discussion separate from immutable history

### SWiSH Document And Evidence Detail Tabs

A SWiSH document or evidence detail page should have:

- `Overview`: document title, type, category, owner, source, status, active version, freshness state, issue or expiry dates, linked site or brand
- `File / Preview`: preview current file, image, PDF, or attachment bundle
- `Versions`: file replacement history with uploader, upload date, approval status, freshness state, and ability to view prior versions
- `Links`: linked controls, checks, audits, findings, CAPA, and SOP attachments
- `Approvals / Reviews`: reviewers, approvers, review timestamps, comments, resubmission state
- `Audit Usage`: where this evidence has been requested, flagged, accepted, or resubmitted
- `Activity`: upload, replace, edit metadata, submit, approve, reject, flag, resubmit, archive
- `Comments`: optional collaboration thread

## 5. SWiSH-Ready State Model

### SOP Or Policy Parent Record

- Drafting
- In Review
- Active
- Renewal Due
- Superseded
- Archived

### SOP Or Policy Version

- Draft
- Pending Approval
- Approved
- Active
- Rejected
- Superseded
- Archived

### Document Parent Record

- Draft / Unsubmitted
- In Review
- Approved / Accepted
- Stale
- Expired
- Replaced
- Archived

### Document Version

- Uploaded
- Pending Review
- Approved
- Rejected
- Flagged
- Ready For Audit
- Superseded
- Archived

### Approval

- Not Started
- Pending
- Approved
- Rejected
- Withdrawn
- Expired

### Acknowledgment

- Not Assigned
- Assigned
- Viewed
- Acknowledged
- Overdue
- Waived

## 6. SWiSH-Ready Task And Trigger Model

### Actions On List Pages

For SOPs and Policies:

- Create SOP
- Import SOP
- Filter and search
- Open detail
- Submit for approval
- Renew
- Archive
- Bulk assign audience
- Bulk export active list

For Documents:

- Upload document
- Create evidence record
- Filter and search
- Open detail
- Replace file
- Submit for review
- Mark stale or archive
- Bulk export or bulk assign category

### Actions On Detail Pages

For SOPs:

- Edit draft
- Preview active version
- Submit for approval
- Approve / reject
- Activate
- Renew
- Request re-acknowledgment
- Map / unmap controls
- Change owner / approver
- Archive

For Documents:

- Edit metadata
- Replace file
- Submit for review
- Approve / reject
- Link / unlink controls, checks, and audits
- Mark ready for audit
- Archive

### Actions In Task Queues

- Approve SOP
- Review revised SOP
- Acknowledge SOP
- Upload evidence
- Replace flagged evidence
- Review document
- Verify CAPA evidence
- Complete implementation action
- Send reminder or escalate

### Trigger Model

Notifications should trigger on:

- submission for approval
- approval assigned or changed
- rejection or change request
- policy or SOP activation
- new acknowledgment assignment
- reminder cadence for pending acknowledgments
- renewal due
- evidence flagged during audit
- document nearing expiry or becoming stale

New tasks should trigger on:

- SOP submitted -> approval task
- SOP approved -> acknowledgment and implementation tasks
- new version with reaccept required -> fresh acknowledgment tasks
- document flagged in audit -> evidence update task
- renewal due -> review or update task
- failed check -> remediation task
- audit request -> evidence submission task

Reapproval should trigger on:

- any approved SOP content update
- significant document replacement
- renewal cycle start
- change to critical metadata such as scope or governing requirement

Re-acknowledgment should trigger on:

- new SOP version marked as requiring reacceptance
- scope expansion to new roles or sites
- major content change classification

Check recalculation should trigger on:

- SOP approval
- user acknowledgment
- document upload or replacement
- review or expiry date crossing thresholds
- audit evidence resubmission

Audit evidence updates should trigger on:

- evidence linked to an active audit is replaced or approved
- a flagged document or test is resubmitted
- a policy version referenced in an audit is superseded

## 7. SWiSH-Ready Permissions Model

A practical SWiSH permissions model should be:

- `Admin`: full create, edit, approve, archive rights across all modules and global settings
- `Compliance Owner`: create and edit SOPs, submit and approve governance records, map controls, view full history, manage audits and evidence
- `Regional Manager`: approve region-scoped SOPs, review site evidence, monitor acknowledgments and actions for assigned region
- `Site Manager`: acknowledge SOPs, upload and replace site evidence, complete implementation tasks, respond to audit requests for assigned sites
- `Auditor / Reviewer`: read-only access to active versions and linked evidence, plus ability to flag evidence, comment, or request resubmission in scoped audits
- `Executive`: read-only dashboards, reports, and approved active records

Specific rights should be:

- create policies or SOPs: Admin, Compliance Owner, optionally Regional Manager for scoped local SOPs
- edit draft policies or SOPs: record owner, assigned editor, Admin, Compliance Owner
- approve policies or SOPs: designated approver, Admin, Compliance Owner, optionally Regional Manager for local SOPs
- upload or replace documents: Admin, Compliance Owner, Site Manager, assigned evidence owner
- see old versions: Admin, Compliance Owner, Auditor / Reviewer, and possibly Regional Manager for scoped records
- acknowledge policies: targeted end users based on scope and audience rules

The difference between editor and approver rights should be explicit in the UI. Editors can modify draft content and metadata; approvers can only review, comment, approve, or reject unless they also hold editor rights.

## 8. Final Design Recommendations

Build SWiSH's SOP and document system as a governed workflow layer, not a file cabinet. Vanta's strongest validated behavior is that approval, acknowledgment, tests, evidence visibility, and audit reuse all connect through shared records and trigger downstream system updates.

The most important design decisions to adopt are:

- separate parent records from immutable versions
- protect active approved content from direct overwrite
- treat approvals and acknowledgments as auditable workflow objects, not booleans
- link SOPs and documents to controls, and let controls connect them to checks, audits, findings, and dashboards
- use dedicated user queues: employee-facing acknowledgment queue and operator-facing work queue
- let one approved SOP or one evidence document serve multiple controls and audits
- preserve full activity history for every important state change

For Phase 1, keep the UX simple:

- list pages with strong filters and search
- detail pages with tabbed structure
- top-right primary CTAs
- clear status chips
- inline metadata editing but protected content revision flow
- task-driven approvals, acknowledgments, and evidence updates

For QSR specifically, adapt the model to operational realities:

- SOP scopes by brand, site, department, and role
- evidence types include photos, temperature logs, cleaning checklists, training certificates, supplier documents, maintenance records, and signed forms
- regional managers and site managers become key roles in approval, acknowledgment, and evidence submission
- audits should feed findings and CAPA directly, with linked SOP or document failures reopening related checks and tasks

## 9. Remaining Validation Gap

The remaining gap is mostly UI-specific, not conceptual. The main open questions are:

- the exact Policies list layout and detail-page tabs in the live tenant
- whether approval rejection and comment handling are explicitly shown in the interface
- the exact document metadata fields exposed in the Documents page
- whether document version history is visibly exposed like policy version history likely is
- whether My Work, not just My Security Tasks, directly carries policy approval or document review tasks
- the exact control detail experience showing linked policies and documents
- the exact audit detail page for linking specific policy or document versions
- whether acknowledgment supports defer, comment, or only accept
- whether there are bulk actions, saved views, or advanced filters in Policies and Documents