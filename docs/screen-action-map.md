# Screen Action Map

This document defines the Vanta-aligned SWiSH workspace contract for the current app structure.

The last shell pass aligned top-level navigation, but it did not yet encode the full feature model inside each tab. This file closes that gap by defining the expected actions, drill-downs, workflows, and cross-module effects for each screen.

## Operating Model

- `My Work` is the personal execution queue for compliance operators.
- `Roadmap` is the staged program plan for onboarding and rollout.
- `Tests` is the validation and remediation surface.
- `Reports` is the read-only rollup and export layer.
- `Frameworks`, `Controls`, `Policies`, `Documents`, and `Audits` are the governed source-of-truth compliance modules.
- `Admin Home` is the configuration and reference-data surface.

## Cross-Screen Rules

- Lists are read models. Mutations should happen through explicit commands, not inline ad hoc field edits.
- Every major detail screen should expose four things clearly: current state, allowed next actions, linked objects, and immutable activity history.
- Creation actions must be available from both list pages and related detail tabs where the user naturally discovers missing records.
- Policy, document, test, audit, and remediation changes must update downstream queues and rollups in `My Work`, `Roadmap`, `Frameworks`, and `Reports`.
- All major screens should follow the `RACE` pattern from the execution blueprint: render the current projection, expose allowed actions, execute explicit commands, and project resulting events into other views.

## Workspace Tabs

### My Work

- Routes: `/my-work`, compatibility alias `/action-center`
- Purpose: personal queue for approvals, overdue work, missing evidence, manual attestations, review requests, and remediation tasks.
- Key actions:
	- open assigned item
	- claim or reassign unowned work
	- approve or reject pending reviews
	- upload or replace missing evidence
	- mark manual task complete
	- push blocked work back for revision
- Required groupings and filters:
	- by due date
	- by source module
	- by status
	- by assignee
	- by scope
	- by priority
- Row types that should appear here:
	- policy approval
	- policy renewal
	- document review
	- stale or expired document follow-up
	- failed test remediation
	- roadmap milestone task
	- audit evidence request
	- finding or CAPA follow-up
- Drill-down behavior:
	- each row opens the underlying source record, not a duplicate queue-only record
	- queue actions should use focused drawers or modals only for quick actions such as claim, approve, reject, or upload
	- full work should continue in the source detail page
- Downstream effects:
	- completion updates the source object first
	- source object change recalculates roadmap progress, test status, control health, and framework readiness

### Roadmap

- Routes: `/roadmap`, compatibility alias `/assignments`
- Purpose: staged implementation plan for one selected framework or program instance.
- Key actions:
	- start framework rollout
	- assign milestone owners
	- set due dates and dependencies
	- complete manual onboarding steps
	- launch policy creation from milestone tasks
	- launch integration setup from milestone tasks
	- launch audit preparation from milestone tasks
- Required sections:
	- framework or program selector
	- milestone groups
	- progress counters
	- on-track or off-track health
	- blocked work summary
	- upcoming due items
- Milestone categories for Phase 1:
	- initial setup
	- scope and ownership
	- policies and documents
	- tests and remediation
	- audit preparation
	- audit execution and follow-up
- Assignment detail requirements:
	- owner
	- due date
	- dependency list
	- completion criteria
	- linked source record
	- comments
	- activity history
- Workflow rule:
	- roadmap tasks should close from the linked object reaching the required state whenever possible, not from a separate manual checkbox
- Downstream effects:
	- milestone completion feeds framework readiness and reports
	- blocked or overdue tasks feed My Work and off-track indicators

### Tests

- Routes: `/tests`, compatibility alias `/checks`, existing detail `/checks/[id]`
- Purpose: monitor whether controls are actually satisfied through automation, approvals, review, or manual evidence.
- Key actions:
	- add manual test
	- rerun automated test
	- request missing evidence
	- review test result
	- mark false positive or accepted exception
	- create remediation task
	- link or unlink control, document, or policy inputs
- Required filters:
	- failed
	- needs review
	- passing
	- manual
	- automated
	- by framework
	- by control owner
	- by evidence freshness
- Test detail tabs:
	- `Overview`
	- `Evidence Inputs`
	- `Linked Controls`
	- `Remediation`
	- `History`
	- `Activity`
- Status model:
	- Not Started
	- Pending Evidence
	- Pending Review
	- Passing
	- Failing
	- Accepted Risk
	- Archived
- Workflow rules:
	- policy approval and acknowledgment can satisfy policy tests
	- document review, replacement, expiry, or audit flagging can change document-backed tests
	- failed tests create remediation tasks and affect control health
- Downstream effects:
	- test status updates control status
	- control status updates framework readiness
	- failed or stale tests appear in My Work, Roadmap, and Reports

### Reports

- Routes: `/reports`, legacy summary route `/dashboard`
- Purpose: computed read-only rollups for leadership, program owners, and auditors.
- Key actions:
	- drill from aggregate metrics into source lists
	- export filtered results
	- switch between operational and management views
	- review trends and overdue concentrations
- Required report families:
	- framework readiness
	- control health
	- test outcomes
	- document freshness
	- policy approval and acknowledgment
	- audit readiness
	- open findings and CAPA
	- overdue work by owner or scope
- Required drill-down behavior:
	- every KPI card links to the filtered source register or queue
	- reports never become the source of truth for edits
- Export requirements:
	- CSV export for filtered tables
	- print-friendly management summary
	- audit packet export is a later extension but should reuse the same source objects

### Frameworks

- Routes: `/frameworks`, planned detail route `/frameworks/[id]`
- Purpose: portfolio and program layer that shows which compliance programs exist, their scope, and current readiness.
- Key actions:
	- add framework
	- activate framework for a scope
	- archive or deactivate framework
	- answer scoping questions
	- assign framework owner
	- review recommendations
	- open roadmap
	- open linked controls, tests, documents, and audits
- List requirements:
	- available frameworks
	- active frameworks
	- readiness percentage
	- control completion
	- evidence completion
	- next audit or review date
	- off-track indicator
- Framework detail tabs:
	- `Overview`
	- `Scope`
	- `Controls`
	- `Roadmap`
	- `Tests`
	- `Documents`
	- `Audits`
	- `Activity`
- Workflow rules:
	- activating a framework creates or links the expected controls, tests, and roadmap phases for the selected scope
	- framework status is derived from linked controls, tests, audits, and overdue tasks, not manually edited
- Downstream effects:
	- framework activation seeds roadmap work
	- framework health appears in Reports

### Controls

- Routes: `/controls`, existing detail `/controls/[id]`, planned create route `/controls/new`
- Purpose: reusable compliance requirements that connect frameworks to policies, documents, tests, audits, findings, and remediation.
- Key actions:
	- add control
	- edit control statement and guidance
	- assign owner and review cadence
	- link framework
	- link policy
	- link document
	- link test
	- create remediation task
	- archive inactive control
- List requirements:
	- control code and title
	- category and type
	- owner
	- scope
	- review cadence
	- counts of linked policies, documents, and tests
	- current status
- Control detail tabs:
	- `Overview`
	- `Guidance`
	- `Frameworks`
	- `Policies`
	- `Documents`
	- `Tests`
	- `Findings And CAPA`
	- `Activity`
- Status model:
	- Draft
	- Active
	- Needs Review
	- At Risk
	- Inactive
	- Archived
- Workflow rules:
	- controls do not become healthy just because they exist
	- control health should be derived from linked test results, review freshness, open findings, and required evidence state
- Downstream effects:
	- control health rolls into framework readiness and reports
	- missing mappings surface roadmap tasks or setup warnings

### Policies

- Routes: `/sops`, `/sops/new`, existing detail `/sops/[id]`
- Purpose: governed policy and SOP workflow with drafting, approval, activation, versioning, and acknowledgment.
- Key actions:
	- add policy
	- import policy content
	- draft or revise content
	- submit for approval
	- approve or reject version
	- activate approved version
	- renew policy
	- assign audience
	- link or unlink controls
	- archive policy
- List requirements:
	- policy code and title
	- owner
	- approver
	- current status
	- active version
	- next review date
	- acknowledgment completion
	- linked controls
- Policy detail tabs:
	- `Overview`
	- `Content`
	- `Versions`
	- `Approvals`
	- `Audience`
	- `Controls`
	- `Evidence Use`
	- `Activity`
- Status model:
	- Drafting
	- In Review
	- Active
	- Renewal Due
	- Superseded
	- Archived
- Workflow rules:
	- approval changes the active policy version state
	- approved policy versions should become available in Documents where relevant
	- policy approval and acknowledgment can satisfy linked tests
	- renewal may require reapproval and re-acknowledgment
- Downstream effects:
	- approval tasks appear in My Work
	- audience acknowledgment tasks appear in the employee task queue later
	- policy status affects tests, controls, framework rollups, and reports

### Documents

- Routes: `/documents`, existing detail `/documents/[id]`, planned create route `/documents/new`
- Purpose: governed document and evidence register for files, structured records, reviews, freshness tracking, and audit reuse.
- Key actions:
	- add document
	- upload initial file
	- replace current version
	- edit metadata
	- submit for review
	- approve or reject version
	- flag stale or expired content
	- resubmit flagged evidence
	- link controls, tests, policies, audits, findings, and CAPA
	- archive document
- List requirements:
	- document title and code
	- type and category
	- owner
	- scope
	- version
	- linked controls count
	- freshness state
	- review or expiry date
	- current status
- Document detail tabs:
	- `Overview`
	- `Preview`
	- `Versions`
	- `Links`
	- `Approvals And Reviews`
	- `Audit Usage`
	- `Activity`
- Status model:
	- Draft
	- In Review
	- Approved
	- Stale
	- Expired
	- Flagged
	- Archived
- Workflow rules:
	- replacing or approving a version changes freshness and may resolve stale tests
	- audit-flagged evidence must be routed back to the linked document or test for correction and resubmission
- Downstream effects:
	- document review tasks appear in My Work
	- freshness issues appear in Tests, Reports, and framework readiness

### Audits

- Routes: `/audits`, `/audits/new`, existing detail `/audits/[id]`, supporting routes `/audits/templates`, `/audits/templates/[id]`
- Purpose: formal evidence collection, testing, finding capture, and audit package management.
- Key actions:
	- create audit
	- pick scope and framework
	- request evidence
	- review submitted evidence
	- flag deficient evidence
	- raise finding
	- create CAPA from finding
	- track auditor requests
	- close audit
- Audit list requirements:
	- audit name
	- framework
	- scope
	- owner
	- audit window
	- status
	- open findings count
	- outstanding requests count
- Audit detail tabs:
	- `Overview`
	- `Evidence Requests`
	- `Findings`
	- `CAPA`
	- `Timeline`
	- `Activity`
- Status model:
	- Planning
	- In Fieldwork
	- Awaiting Evidence
	- Under Review
	- Closed
	- Archived
- Workflow rules:
	- evidence requests should link to existing documents where possible instead of duplicating files
	- flagged evidence should route users back to the source document or test for update and resubmission
	- findings should trace back to controls and create remediation tasks when needed
- Downstream effects:
	- open audit work appears in My Work
	- findings and CAPA affect controls, framework health, and reports

### Admin Home

- Routes: `/admin` plus reference-data routes under `/admin/*`
- Purpose: configure the workspace, not to run day-to-day compliance work.
- Key actions:
	- review setup completeness
	- manage users and role access
	- manage brands, locations, and departments
	- manage role mappings and ownership defaults
	- configure notifications and reminders
	- configure framework availability and scoping defaults
- Required sections:
	- setup status
	- reference data shortcuts
	- user and access management
	- notification settings
	- data quality warnings

## Cross-Module Workflows

### Framework Activation

1. User adds or activates a framework for the chosen scope.
2. System creates or links expected controls, tests, and roadmap phases.
3. Owners are assigned.
4. Missing setup work appears in Roadmap and My Work.
5. Framework readiness starts from actual downstream status, not a manual percent field.

### Control Setup And Validation

1. User adds a control or links an existing control into a framework.
2. User links policies, documents, and tests.
3. Tests run or await evidence.
4. Test outcomes change control health.
5. Control health changes framework readiness and report summaries.

### Policy Approval And Acknowledgment

1. User adds a policy and drafts or imports content.
2. Policy is submitted for approval.
3. Approver reviews and approves or rejects.
4. Approved version becomes active and available for linked compliance use.
5. Audience acknowledgment tasks are issued where required.
6. Linked tests update when approval and acknowledgment criteria are met.

### Document Review And Audit Reuse

1. User adds a document and uploads or replaces the active file.
2. Document moves through review or approval.
3. Tests and controls use the approved document as evidence.
4. Audit requests reuse the same document rather than create duplicate evidence records.
5. If auditors flag the evidence, the document or linked test is updated and resubmitted.

### Failed Test To Remediation

1. Test fails or becomes stale.
2. System creates or suggests remediation work.
3. Task appears in My Work and, when relevant, in Roadmap.
4. User updates the linked policy, document, control mapping, or manual attestation.
5. Test reruns or is re-reviewed.
6. Control and framework rollups update automatically.

### Audit Finding To CAPA

1. Auditor or internal reviewer raises a finding.
2. Finding links to one or more controls and evidence gaps.
3. CAPA or remediation task is created and assigned.
4. Assignee updates corrective action with evidence.
5. Reviewer verifies and closes the action.
6. Finding, control, framework, and report projections update.

## Implemented Now

The following slices are now live in code and no longer belong in the delivery gap:

- Vanta-aligned top-level navigation with `Admin Home` as the only extra tab
- shared app-shell session reuse and improved internal navigation responsiveness
- compatibility alias routes for `My Work`, `Roadmap`, and `Tests` with valid local route config
- full tab-by-tab interaction contract for the current workspace model
- computed framework portfolio page and active framework detail route at `/frameworks/phase-1`
- control create flow, list CTA, editable control detail settings, and link-management surface
- document create flow, list CTA, editable document detail settings, governed-file append-only versioning, and visible version history
- My Work projection for control follow-up and document governance gaps
- Tests workflow-signal projection from controls and documents
- Roadmap blocker projection plus derived recommended next actions from controls, documents, and assignments

## Current Delivery Gap

The current app now reflects the correct top-level tab structure and core source-module editing flows, but several deeper product slices are still only partially implemented in code.

The most important missing product slices are:

- persistent `add framework` flow and multi-framework activation model
- richer `Tests` detail state, result authoring, and remediation interactions
- framework-driven roadmap seeding and milestone status derivation in stored records
- broader My Work and Reports projection for every major command path
- richer document review, compare, approval, and rollback workflow

This file should be treated as the implementation contract for those next slices.
