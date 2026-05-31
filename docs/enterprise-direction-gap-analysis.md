# Enterprise Direction And Gap Analysis

## Executive Position

This project should be treated as a single enterprise platform with multiple modules, not as a small standalone SOP tool and not as two completely separate systems.

Recommended direction:

- Keep one platform for SOP, compliance, audit, CAPA, KPI, and workflow communication.
- Do not build everything as one flat module.
- Structure it as one shared enterprise application with clear domain boundaries.

That means the right model is:

- One product
- Shared identity, security, audit trail, document access, notifications, reporting
- Separate functional modules inside the same platform

This is the best balance between control and complexity.

## Why One Platform Is Still The Right Approach

Combining SOP + Compliance + KPI in one platform is the right direction if the system is modular.

Reasons:

- The same users, departments, scope rules, and reporting hierarchy apply across these domains.
- KPI validation, audit findings, SOP implementation, and corrective actions are operationally connected.
- Executives need one source of truth, not several disconnected tools.
- Shared security, audit logging, workflow notifications, and master data are expensive to duplicate.

When it becomes dangerous:

- if all business logic is mixed into one oversized workflow
- if security is inconsistent across modules
- if KPI communication is designed as an afterthought
- if rollout starts before role, scope, and ownership rules are clear

Conclusion:

- One platform is correct.
- One monolithic feature set is not.

## Recommended Product Structure

Build the system as one enterprise application with these bounded modules:

### 1. Core Platform Layer

- Microsoft Entra ID authentication
- User profile and role mapping
- Brand / department / location scope rules
- Audit log
- Notifications
- File access policy
- Dashboard and shared reporting layer

### 2. SOP Governance Module

- SOP creation
- Review and approval
- Activation and version control
- Company-wide viewing of active SOPs
- Controlled document access

### 3. Implementation Module

- SOP assignments
- rollout ownership
- due dates
- implementation status
- evidence collection

### 4. Audit And CAPA Module

- audit templates
- audit execution
- findings
- corrective actions
- verification and closure

### 5. KPI Management Module

- KPI definitions
- KPI assignment per employee or department
- monthly or quarterly KPI updates
- validation workflow
- dynamic scoring
- KPI discussion threads

### 6. Communication Layer

- comment threads
- auditor questions
- user replies
- system reminders
- escalation history

The communication layer should be shared, not rebuilt separately inside each module.

## Current Project Position

### What Is Already In A Good State

- The scope model is already enterprise-aware: brand, department, location, and mixed scope combinations.
- The database foundation already covers most major domains.
- Reporting views have already been designed at the Snowflake level.
- The app now has a shared shell and working enterprise-style navigation.
- Admin master data pages are already available.
- SOP register is implemented at an initial working level.
- SOP approval transitions are implemented at an initial working level.
- Implementation tracking has started and now includes assignment creation.
- Environment-driven behavior is already in place for notifications.
- SharePoint-oriented document security has already been considered in the schema.

### What Is Already Modeled In The Database

The schema already includes:

- roles and user-role mapping
- brands, departments, locations, brand-locations
- SOPs and SOP assignments
- checklist templates and audit responses
- corrective actions
- evidence files
- KPI definitions and KPI results
- audit log
- file access rules

This means the project is not missing direction at the data-model level. The biggest gaps are in runtime enforcement and workflow completion.

## What Is Still Missing Or Not Clear Enough

### Identity And Security

- Entra ID authentication is not implemented yet.
- Runtime RBAC is not fully enforced yet.
- Row-level access needs to be turned into actual server-side authorization, not only documented rules.
- File access restrictions need final policy decisions.

### SOP Governance

- SharePoint upload and controlled-view integration are not implemented.
- Version history and review scheduling need more depth.
- Company-wide active SOP visibility rules need final confirmation.

### Implementation

- Assignment updates and verification workflow are still limited.
- Evidence attachment to assignments is not implemented in the app yet.

### Audit And CAPA

- Audit module UI is not implemented yet.
- Corrective action UI and lifecycle are not implemented yet.

### KPI Domain

- KPI data structures exist, but the actual KPI product workflow is not built.
- Employee-level KPI assignment logic needs to be designed explicitly.
- Dynamic scoring rules need a formal business definition.
- KPI discussion history is not modeled yet as a first-class feature.

### Communication / Conversation Layer

- Auditor-to-user discussion threads are not yet modeled in the current schema.
- The platform needs a reusable conversation model for KPI validations, audit queries, and follow-up discussions.

## Major Architectural Adjustment Needed

The biggest adjustment now is this:

Do not continue treating KPI as just another table-based reporting feature.

KPI in your project is actually a workflow domain, not only a reporting domain.

Because you described:

- KPI assignment per employee
- periodic updates
- auditor validation
- conversation history
- scoring impact

That means KPI needs:

- KPI assignment records
- KPI submission cycles
- validation workflow
- comment thread or message thread support
- scoring engine or scoring rules

Without those, KPI remains incomplete even if definitions and results tables exist.

## Recommended New Data Concepts

To support the business correctly, these entities should be added or refined later:

### KPI_ASSIGNMENTS

- assigns KPI to employee / department / period
- carries owner, due date, target, and scope

### KPI_VALIDATIONS

- stores auditor review, status, score impact, remarks, timestamps

### THREADS

- generic discussion thread header
- reusable for KPI, audit, CAPA, SOP, assignment

### THREAD_MESSAGES

- actual conversation messages between auditor and user
- sender, message text, timestamps, read status

### NOTIFICATION_QUEUE or equivalent workflow event model

- if email and reminders become more complex later

This would let you support both KPI discussion and audit discussion using one shared communication engine.

## Security Reality Check

### All employees can view SOPs

This is realistic if the policy is narrowed to:

- all employees can view active and published SOPs
- only authorized roles can create, edit, submit, approve, archive, or access drafts

That is a sensible enterprise rule.

### Preventing downloads or screenshots

Practical reality:

- download restriction: partially feasible
- screenshot prevention in browser: not reliably enforceable

Best realistic control set:

- enforce view-only where possible
- hide download actions where possible
- rely on SharePoint / Microsoft file permissions
- watermark documents where needed
- log access and actions
- limit draft access strictly

This expectation should be aligned with management early.

## Delivery Recommendation Aligned To ECS Milestones

### ECS-04 To ECS-06: Pilot Foundation

Focus:

- admin masters
- authentication
- RBAC
- SOP register
- approval workflow
- assignment workflow

Target outcome:

- first usable compliance pilot

### ECS-08 Validation Stage

Focus:

- validate compliance software workflow
- validate SOP workflow
- validate audit standard structure
- validate KPI operating model before full KPI build

Important:

- KPI should be validated as a business workflow first, not only as screens and tables

### ECS-09 / ECS-10 Rollout Stages

Focus:

- phase 1: food safety compliance and core audit workflows
- phase 2: group SOP compliance and implementation tracking

### ECS-11 Rollout Stage

Focus:

- KPI tracking
- KPI validation workflow
- KPI conversation threads
- scoring and reporting

This rollout order reduces risk.

## Recommended Build Sequence From Here

### Short-Term Next

1. Finish authentication and role enforcement.
2. Complete assignment update workflow.
3. Build audit module.
4. Build corrective action module.

### Before Full KPI Build

1. Define KPI assignment rules.
2. Define KPI scoring rules.
3. Define KPI validation states.
4. Define conversation-thread behavior.

### Then Build KPI Module

1. KPI definitions
2. KPI assignments
3. KPI updates
4. KPI validation
5. KPI discussion threads
6. KPI score reporting

## Confidence Guidance

The project is large, but it is not out of control.

What should give confidence:

- the core direction is correct
- the schema already covers most major business areas
- the app foundation is working
- the project can be phased

What must be avoided:

- trying to finish KPI, audit, SOP, CAPA, and communications together without module boundaries
- delaying security decisions until the end
- treating KPI workflow as only a data-entry feature

## Final Recommendation

### Strategic answer

Yes, SOP + Compliance + KPI should remain in one enterprise platform.

### Architectural answer

The platform must be modular, with shared foundation services and separate domain workflows.

### Management answer

This is a multi-phase enterprise initiative, not a single MVP screen-building exercise.

### Delivery answer

Complete the compliance core first, then add KPI as a structured workflow module with a shared communication engine.

## Immediate Decisions To Lock Next

1. Active SOP visibility rule for all employees.
2. Final scope of draft/document access restrictions.
3. KPI assignment and scoring logic.
4. Conversation model for KPI and audit validation.
5. Rollout order confirmation for compliance first, KPI second.