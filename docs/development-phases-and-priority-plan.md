# Development Phases And Priority Plan

This document defines the recommended build order for Swish Compliance so the platform can grow in a controlled, enterprise-ready way.

## Delivery Principle

Build the platform in layered phases:

1. secure the foundation
2. deliver audit-driven compliance control first
3. complete execution and enforcement workflows
4. add KPI workflow as a full business module
5. harden, report, and prepare for rollout

This avoids mixing everything at once and keeps the system maintainable.

## Phase 1: Foundation And Access Control

### Goal

Convert the current working prototype into a properly secured internal application foundation.

### Focus

- Microsoft Entra ID authentication
- user identity mapping
- role-based access control
- row and scope filtering
- route protection
- session handling
- environment separation and config hygiene

### Why This Phase First

- the platform is already multi-module
- enterprise access control is a prerequisite for real usage
- later modules should not be built on unsecured assumptions

### Target Outcome

- only authenticated users can access the internal app
- users see only the routes and records allowed for their role and scope
- the platform is ready for controlled pilot usage

## Phase 2: Compliance Audit Core

### Goal

Deliver the first business-critical compliance operating cycle with audit visibility at the center.

### Focus

- audit templates and checklist structure
- audit execution workflow
- audit scoring and findings capture
- compliance dashboard essentials
- finalize SOP create, edit, submit, approve, reject, activate, archive flow
- improve SOP status handling and business validation around the mandatory workflow
- enforce restricted access for in-progress SOPs and broad visibility for active SOPs

### Why This Phase Second

- the IBE team defined compliance audit as the highest phase-1 priority
- project success is tied to audit automation and validation through business data
- SOP governance still remains a core dependency, so it should be completed alongside audit-readiness

### Target Outcome

- the organization can manage controlled SOPs in one place
- audits can begin operating in a structured internal workflow
- management gets the first meaningful compliance visibility

## Phase 3: Implementation, CAPA, And Enforcement Workflow

### Goal

Make rollout, corrective action, and enforcement operational, not just visible.

### Focus

- assignment create, update, verify flow
- progress status transitions
- due dates and overdue logic
- assignment evidence workflow
- assignment detail pages and edit actions
- corrective action workflow
- escalation logic for repeated gaps and non-compliance
- 48-hour department-head closure model where applicable

### Why This Phase Third

- approved SOPs need real rollout ownership
- delayed implementation must lead into CAPA and enforcement
- this phase converts audit outputs into accountable follow-up actions

### Target Outcome

- department and location teams can be assigned work
- implementation status and verification become measurable
- corrective actions can be assigned, monitored, escalated, and closed

## Phase 4: KPI Operating Model Finalization

### Goal

Lock the KPI business design before building the KPI module deeply.

### Focus

- KPI assignment model
- KPI update cycle model
- KPI validation states
- KPI score logic
- KPI communication and challenge workflow
- manager and auditor review expectations
- conversation history behavior between IBE and department heads

### Why This Phase Must Be Explicit

- KPI is important but confirmed as a second-phase business workflow
- KPI trust at launch is still important, so its design must be explicit and correct
- unclear KPI workflow will create rework if built prematurely

### Target Outcome

- approved KPI business rules
- clear design for KPI module, validation, scoring, and communication behavior

## Phase 5: KPI Module Build

### Goal

Build KPI as a true workflow module, not only a results table.

### Focus

- KPI definitions and assignment records
- KPI periodic updates
- KPI validation flow
- score calculation
- discussion threads between IBE and users
- KPI dashboards and trends

### Target Outcome

- KPI management moves out of Excel into the platform
- validation and scoring become structured and auditable
- business trust improves through strong KPI visibility

## Phase 6: SharePoint And Notification Integration

### Goal

Complete the enterprise file and notification layer after access is available.

### Focus

- SharePoint document upload and controlled access
- evidence upload integration
- Outlook or Microsoft Graph notification delivery
- email templates and workflow triggers
- document metadata synchronization

### Why This Phase Is Sequenced Here

- it depends on IT access and app registration
- it should be layered onto stable workflows, not added before them

### Target Outcome

- files are managed through the chosen document platform
- notifications work in real business flows

## Phase 7: Reporting, Dashboards, And Hardening

### Goal

Finalize management visibility and operational readiness.

### Focus

- executive dashboard refinement
- reports and exports
- overdue and escalation reporting
- activity and audit visibility
- role-based dashboard views
- production readiness checks

### Target Outcome

- management can rely on the platform for oversight and reporting
- the platform is prepared for staged rollout and long-term use

## Immediate Coding Priority

Based on current progress, the next coding order should be:

1. Authentication and RBAC
2. Audit module
3. Corrective action module
4. Assignment update, verification, and evidence flow
5. KPI business-model finalization
6. KPI module build
7. SharePoint and notification integration
8. Reporting and dashboard refinement

## What We Already Have

- shared app shell
- admin master module
- SOP register
- SOP approval transitions
- implementation tracker
- assignment creation
- environment-controlled notification switch
- Snowflake schema and views foundation

## What Must Be Locked Before Deep KPI Build

- KPI assignment model
- KPI scoring rules
- KPI validation states
- conversation-thread model
- KPI visibility rules

## Recommended Working Style

- keep building one module slice at a time
- validate each slice with build and browser checks
- avoid mixing compliance core and KPI complexity too early
- use documents in `docs/` to lock business decisions before deeper build steps

## Practical Next Action

Start Phase 1 immediately:

- implement Microsoft authentication and RBAC scaffolding first
- then move directly into the audit workflow module
- then build corrective actions and complete enforcement-related rollout workflows