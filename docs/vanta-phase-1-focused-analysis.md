# Vanta Phase 1 Focused Analysis For SWiSH

This document captures the narrowed interpretation of Vanta based on the current SWiSH Phase 1 scope. It intentionally focuses only on the modules approved for immediate study and replication:

- My Work
- Roadmap
- Tests
- Reports
- Compliance
- Frameworks
- Controls
- Policies
- Documents
- Audits

Excluded from this phase:

- Vanta Agent
- non-priority tabs unless they directly affect the selected modules

The goal is to convert the observed Vanta product patterns into a clear SWiSH-first implementation direction for a QSR-focused internal compliance platform.

## 1. Phase 1 Understanding

The most important conclusion from the selected Vanta modules is that these tabs are not isolated features. They appear to be different workflow surfaces over one connected compliance system.

At a high level, the system seems to work like this:

- Frameworks defines or activates the compliance program.
- Roadmap sequences implementation work for that program.
- Controls hold reusable compliance logic.
- Policies and Documents hold governed proof and required artifacts.
- Tests validate whether the expected state or evidence exists.
- My Work surfaces assigned actions across modules.
- Audits consume the same controls and evidence for formal review.
- Reports and Framework rollups summarize readiness and risk.

For SWiSH, the main takeaway is that Phase 1 should be built as one connected compliance engine, not as separate pages for SOPs, tasks, audits, and reporting.

## 2. Directly Useful Insights For SWiSH

### Shared architecture matters more than screen structure

The strongest reusable pattern is the shared object model behind the UI. Vanta appears to let multiple modules read and update the same compliance records. That is more valuable than copying the exact visible layout.

For SWiSH, this means:

- one source of truth for controls
- one source of truth for evidence
- one task engine used across workflows
- one rollup mechanism for dashboards and reports

### Roadmap and My Work serve different purposes

Roadmap appears to be a staged program implementation view.

My Work likely appears to be the personal execution queue.

This separation is useful and should be preserved in SWiSH:

- Program Plan tells the organization what must happen overall.
- Action Center tells each user what they personally need to do now.

### Controls are likely the real operational backbone

Frameworks appear to be the program layer, but controls likely hold the actual reusable compliance logic. This makes sense because controls can connect to tests, evidence, policies, audits, and program rollups.

For SWiSH, controls should become the bridge between:

- SOP or policy requirements
- implementation work
- audit validation
- findings and CAPA
- reporting and readiness status

### Policies and Documents should be workflow objects

The evidence indicates that policies are not just content pages and documents are not just uploads. They appear to be active workflow records with approval, acknowledgment, evidence, and audit relevance.

For SWiSH, this means:

- SOPs and policies should have lifecycle state, scope, approvals, and review cadence
- evidence and documents should be reusable records, not dead attachments

### Rollups should be computed, not manually maintained

Framework completion, evidence completion, control completion, test completion, milestone progress, and off-track signals all imply computed status.

For SWiSH, dashboards and summaries should be derived from underlying records, not manually edited summaries.

## 3. Working Model Of The Selected Modules

### Frameworks

Role in system:
top-level program portfolio and readiness lens

Likely function:
- activates a compliance initiative
- exposes program metrics
- shows readiness state
- links into deeper work and evidence

SWiSH translation:
Programs or Compliance Initiatives

### Roadmap

Role in system:
implementation orchestration layer

Likely function:
- breaks a program into phases
- groups work into milestones
- reveals blockers, assignees, and due dates
- launches actions in downstream modules

SWiSH translation:
Program Plan or Implementation Plan

### My Work

Role in system:
personal cross-module action queue

Likely function:
- consolidates assigned tasks
- surfaces pending approvals, reviews, remediation, or requests
- lets users act without navigating full module trees first

SWiSH translation:
Action Center or My Actions

### Tests

Role in system:
validation engine

Likely function:
- evaluates if controls are satisfied
- checks whether required proof is present or current
- produces pass/fail/incomplete type signals
- drives remediation and rollup changes

SWiSH translation:
Checks or Validations

### Reports

Role in system:
management visibility layer

Likely function:
- aggregates readiness and gaps
- supports executive and manager review
- summarizes operational state from source records

SWiSH translation:
Management Reports or Operational Reporting

### Controls

Role in system:
shared compliance logic layer

Likely function:
- maps requirements to real validation and proof
- connects policies, documents, tests, audits, and ownership
- supports reuse across multiple programs

SWiSH translation:
Operational Controls

### Policies

Role in system:
governed content plus workflow evidence

Likely function:
- handles approval and acknowledgment
- contributes to test and control completion
- acts as both governance record and evidence source

SWiSH translation:
Policies and SOPs

### Documents

Role in system:
evidence object and artifact store

Likely function:
- stores proof records
- supports reuse across controls and audits
- likely carries metadata, freshness, and linkage

SWiSH translation:
Evidence and Documents

### Audits

Role in system:
formal review and evidence-consumption layer

Likely function:
- packages scoped controls and proof into review activity
- surfaces findings or requests
- feeds readiness and downstream remediation

SWiSH translation:
Audits and Reviews

## 4. Suggested SWiSH Phase 1 Module Map

Recommended Phase 1 structure:

- Action Center
- Program Plan
- Checks
- Reports
- Compliance

Inside Compliance:

- Programs
- Controls
- Policies and SOPs
- Evidence and Documents
- Audits and Reviews

This keeps the structure close to the validated Vanta patterns while adapting the naming and meaning to QSR operations.

## 5. Suggested SWiSH Phase 1 Object Model

Recommended shared objects:

- `program`
- `program_scope`
- `program_phase`
- `control`
- `control_mapping`
- `check`
- `check_result`
- `policy`
- `policy_version`
- `approval_step`
- `acknowledgment`
- `document`
- `evidence_record`
- `audit`
- `audit_request`
- `finding`
- `capa_action`
- `task`
- `task_assignment`
- `site`
- `brand`
- `department`
- `user`
- `role`
- `comment`
- `activity_event`
- `notification`

Important relationships:

- one program has many phases, controls, audits, and reports
- one control can map to many programs
- one control can have many checks
- one policy can support many controls
- one evidence record can support many controls, checks, or audits
- one audit can contain many requests and findings
- one finding can create many CAPA actions
- tasks can attach to any source object and roll up by owner, site, or program

## 6. Suggested SWiSH Phase 1 Workflow Sequence

Recommended sequence:

1. create or activate a program
2. apply scope by brand, site, department, or process
3. load or map required controls
4. publish or update related policies and SOPs
5. trigger approvals and acknowledgments
6. generate implementation tasks into Action Center
7. collect evidence and run Checks
8. surface gaps and overdue items
9. conduct internal audit or review
10. create findings and CAPA
11. verify corrective action completion
12. roll results into reports and management review

This is the most useful Phase 1 adaptation of the selected Vanta flow.

## 7. Suggested SWiSH Dashboard Layers

Phase 1 should support three dashboard layers:

### Executive

- overall program health
- overdue CAPA
- audit schedule risk
- site or region comparison
- major control gaps
- policy and SOP rollout progress

### Manager

- open tasks
- overdue checks
- stale evidence
- pending approvals
- upcoming audits
- unassigned actions
- site readiness

### Operator

- my actions
- evidence requests
- pending acknowledgments
- assigned CAPA
- failed checks

Every metric should drill into the source records behind it.

## 8. Phase 1 Design Principles

SWiSH Phase 1 should adopt these principles:

- build one connected system, not disconnected modules
- treat controls as reusable shared objects
- treat evidence as a first-class reusable record
- keep Roadmap and Action Center separate
- compute rollups from source records automatically
- make every important object owner-based and status-based
- make audits reuse live controls and evidence
- let findings and CAPA feed back into control health and reports
- use scope filtering heavily by brand, site, department, and process

## 9. Risks And Unknowns Still Requiring Validation

The following areas remain inferred and should still be validated from live Vanta pages before SWiSH architecture is finalized:

- exact My Work filtering, grouping, and source-task model
- exact Tests state model and detail layout
- exact Reports drill-down structure
- exact Controls detail schema and owner/status behavior
- exact Policies lifecycle, versioning, and acknowledgment workflow
- exact Documents metadata and freshness handling
- exact Audits page flow, evidence request behavior, and finding lifecycle

These unknowns matter because they will affect whether SWiSH should implement:

- one generic task engine or partial module-specific task flows
- one generic evidence model or separate evidence subtypes
- one shared state approach or object-specific status exceptions

## 10. Practical Decision For SWiSH Right Now

Based on the current evidence, the best Phase 1 direction is:

- do not model the first release around Frameworks alone
- do not model the first release around SOPs alone
- model the first release around a shared compliance engine with these anchors:
  - programs
  - controls
  - policies and SOPs
  - evidence
  - tasks
  - checks
  - audits
  - findings and CAPA
  - reports

That gives SWiSH the same architectural advantage Vanta appears to have within the selected scope: one platform where program setup, day-to-day action, validation, proof, audit, and reporting all run on the same underlying workflow model.