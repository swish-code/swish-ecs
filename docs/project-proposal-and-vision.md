# Swish Compliance Platform

## Project Proposal And Vision Document

## 1. Executive Summary

Swish Compliance Platform is intended to become a centralized enterprise application for managing SOP governance, implementation tracking, audits, corrective actions, KPI validation, and compliance communication across the company.

This is not a lightweight departmental tool. It is a cross-functional internal platform designed to support Business Excellence, department owners, auditors, management, and eventually all employees through a single operating model for compliance and performance control.

The system is being shaped under the ECS initiative: Establishing Compliance System. Its purpose is to create one governed environment where policies, procedures, SOPs, audit standards, KPI checks, and follow-up actions can be controlled, tracked, validated, and reported with proper enterprise structure.

The correct strategic direction is:

- one enterprise platform
- modular business domains
- shared security, audit, and reporting foundation
- phased rollout by priority and business value

## 2. Vision

### Platform Vision

Create a secure, scalable, company-wide compliance and performance governance platform that enables Swish to:

- standardize SOPs across departments and brands
- manage controlled document approval and publication
- track implementation of approved SOPs across the organization
- execute audits against structured standards and checklists
- manage corrective actions and evidence
- track KPI updates, validation, and scoring
- preserve business communication history between auditors and users
- provide leadership with real-time visibility into compliance and performance status

### Business Vision

The platform should help the company move from fragmented operational control, Excel tracking, and disconnected approvals into a single managed system that supports:

- stronger governance
- higher accountability
- better audit readiness
- improved KPI discipline
- improved reporting quality
- more transparent cross-department execution

### Long-Term Outcome

The target outcome is a durable internal system of record for compliance operations and KPI governance, not only an MVP interface.

## 3. Core Goals

### Business Goals

- establish one centralized compliance operating model
- standardize SOP ownership, approval, rollout, and review
- improve traceability of implementation, audits, and corrective actions
- move KPI validation and follow-up into a structured workflow
- reduce dependency on Excel and informal communication
- improve management visibility at brand, department, and location levels

### System Goals

- secure internal access with enterprise identity
- support brand, department, and location-aware scoping
- preserve a strong audit trail for critical changes and decisions
- support document and evidence access rules
- support future scale across the full company
- support phased rollout without re-architecting the platform

### Delivery Goals

- build a usable pilot aligned to ECS milestones
- validate the compliance-audit workflow first
- add KPI workflow after the compliance core is stable, while preserving KPI visibility as a trust-building launch factor
- maintain modularity to prevent uncontrolled complexity

## 4. Project Context

This project sits under ECS: Establishing Compliance System.

The project plan includes:

- definition of charter and deliverables
- compliance scope analysis across Food Safety, HSE, Legal, ISO, Catering and Logistics, Environmental and Waste, and related areas
- review and standardization of department SOPs
- creation of a group SOP master model
- design and pilot of a compliance software platform
- validation of compliance software, SOPs, audit standards, and KPI checks
- phased rollout across compliance areas and KPI validation stages

This means the system is expected to support a structured enterprise program, not just a technical demo.

## 5. Strategic Product Direction

### Recommended Direction

Combine SOP, compliance, audit, CAPA, and KPI inside one shared enterprise platform.

### Why One Platform Is Correct

- the same users, departments, brands, and locations exist across all domains
- the same leadership needs consolidated reporting
- the same identity, security, audit trail, and notification mechanisms should be reused
- KPI validation, audit findings, implementation tracking, and corrective actions are operationally connected

### What Must Be Avoided

- a single oversized monolithic workflow with mixed responsibilities
- weak separation between document governance and KPI process logic
- building KPI as only a reporting table without workflow and communication support
- adding enterprise security as a late-stage enhancement instead of a core design principle

### Final Direction

The right answer is:

- one platform
- multiple bounded modules
- one shared foundation layer

## 6. Platform Scope

The intended platform scope includes the following domains.

### 6.1 SOP Governance

- SOP creation
- review and validation step before approval
- approval workflow
- activation and publication
- version and review control
- company visibility rules
- controlled document access

### 6.2 Implementation Tracking

- assignment of approved SOPs
- rollout ownership by brand, department, and location
- target dates
- implementation progress
- verification status
- evidence association

### 6.3 Audit Management

- checklist templates
- checklist items
- audit execution
- score calculation
- compliance result tracking
- audit history

### 6.4 Corrective Actions

- action creation from findings
- assignee ownership
- severity and due dates
- submission and verification
- closure and tracking

### 6.5 KPI Management

- KPI definitions
- KPI assignments
- KPI result updates
- KPI validation
- score calculation
- KPI reporting by employee, department, and company level

### 6.6 Communication Layer

- auditor questions to users
- communication window to concerned department head when KPI or compliance updates are missing
- user replies
- history of comments or threaded messages
- communication linked to KPI and audit workflows
- reminder and escalation support

### 6.7 Dashboards And Reporting

- SOP status reporting
- implementation reporting
- overdue action monitoring
- audit performance views
- KPI performance and validation reporting
- executive-level oversight dashboards

## 7. Enterprise Architecture Direction

### Application Stack

- Next.js App Router application
- TypeScript-based frontend and server actions
- Snowflake as structured enterprise data store
- SharePoint as planned controlled document repository
- Microsoft Entra ID as planned identity provider
- Outlook / Microsoft integration as planned notification channel

### Architectural Pattern

Current implementation follows this flow:

- page and UI layer
- server action or route-level workflow action
- service layer for business rules and validation
- repository layer for Snowflake interaction
- Snowflake persistence and reporting views

This is the correct direction because it keeps UI, business logic, and data access separated.

### Enterprise Foundation Services

The platform should standardize these shared services across modules:

- authentication
- authorization
- scope filtering
- notifications
- audit logging
- file access control
- reference master data
- reporting models

## 8. Scope Model And Organizational Logic

The project has already been designed around organizational scope combinations.

Supported or intended scope patterns:

- brand
- brand + department
- brand + location
- brand + department + location

This is important because Swish operates with multiple brands and locations, and compliance controls may apply differently depending on business context.

The platform therefore must support:

- company-wide visibility where appropriate
- strict scoped access where required
- reporting aggregation across multiple scope layers

## 9. Modules In The Platform

The platform should ultimately be structured into these modules.

### Core Platform Module

- user identity
- roles and permissions
- master data
- configuration
- audit trail
- notification controls

### SOP Module

- SOP register
- create and edit
- approval actions
- activation and archival
- publication and access rules

### Implementation Module

- assignment tracker
- assignment creation
- rollout follow-up
- verification workflow

### Audit Module

- templates
- checklist execution
- scoring
- findings and evidence

### CAPA Module

- corrective actions
- due dates
- assignees
- verification and closure

### KPI Module

- KPI definitions
- KPI assignment per employee or department
- KPI updates per reporting cycle
- validation and scoring
- KPI communication threads

### Reporting Module

- operational dashboards
- executive summaries
- trend and status views
- exports and future scheduled reports

## 10. Security And Enterprise Expectations

This system must be treated as an enterprise application from the start.

### Security Expectations

- authenticated internal access
- role-based access control
- scope-based row filtering
- controlled access to documents and evidence
- audit trail for sensitive changes
- restricted access to drafts, approvals, and validation actions
- enforcement-oriented workflow control

### Document Security Expectations

The expected business requirement includes company-wide SOP visibility with possible restrictions on download and document control.

Practical security interpretation:

- active published SOPs may be broadly viewable
- drafts and in-progress records must be restricted
- evidence and working files must inherit stronger controls
- SharePoint integration should be used for document access governance

### Technical Reality

- preventing download may be partially feasible depending on SharePoint and Microsoft controls
- preventing screenshots in browser is not reliably enforceable
- the realistic strategy is controlled access, limited actions, watermarking where possible, and strong auditability

## 11. Business Rules Already Understood

The following core business points are already clear from project discussions.

- SOPs will be created and used across departments.
- This is a group-level compliance initiative.
- The system is expected to support company-wide usage.
- compliance audit is the highest phase-1 priority.
- KPI validation is part of the program, not a side feature.
- KPI can be phased after the compliance core, but remains strategically important.
- Auditor-to-user communication is expected in KPI and compliance follow-up.
- KPI data currently exists in Excel and should eventually be handled internally.
- This project is linked to Business Excellence governance and automation expectations.

## 12. Current Progress And Achievements

### Documentation Foundation

The project already has a substantial planning and documentation base, including:

- system design documentation
- role and permission summary
- database diagram and relationship summaries
- project blueprint and workflow views
- next-step checklists
- enterprise direction and gap analysis

### Database And Schema Progress

Snowflake schema work already includes:

- core master tables
- SOP tables
- implementation assignment tables
- audit-related tables
- corrective action tables
- KPI tables
- evidence tracking
- audit log
- file access rule support
- reporting views

### Application Progress

The application currently has:

- landing page and project vision surface
- enterprise-style application shell with left navigation
- admin master data pages
- SOP register list page
- SOP create page
- SOP edit and approval workflow page
- implementation tracker page
- create assignment page
- environment-controlled notification behavior

### Working Features Today

- brand, department, location, role, and user master-data viewing
- create flows for brand, department, and location masters
- SOP create and update
- SOP lifecycle transition handling
- implementation assignment listing
- implementation assignment creation
- responsive shell and basic mobile layout handling

## 13. Existing Database And Schema Structure

The platform schema already reflects a serious enterprise model.

### Core Reference Structures

- ROLES
- USERS
- USER_ROLES
- BRANDS
- DEPARTMENTS
- LOCATIONS
- BRAND_LOCATIONS

### SOP And Governance Structures

- SOPS
- SOP_ASSIGNMENTS
- FILE_ACCESS_RULES
- EVIDENCE_FILES
- AUDIT_LOG

### Audit Structures

- CHECKLIST_TEMPLATES
- CHECKLIST_ITEMS
- AUDITS
- AUDIT_RESPONSES

### Corrective Action Structures

- CORRECTIVE_ACTIONS

### KPI Structures

- KPI_DEFINITIONS
- KPI_RESULTS

### Reporting Structures

- Snowflake views for SOP, implementation, corrective action, KPI, audit, and dashboard summaries

Important note:

The current schema already supports a large amount of the intended domain. The biggest remaining challenge is not basic table design. It is turning the model into secured, validated, operational workflows.

## 14. What Is Working Well Right Now

Several things are already in a strong position.

### 14.1 Architectural Direction

- modular service and repository separation is in place
- enterprise app shell is established
- environment-driven configuration is established

### 14.2 Scope Design

- organizational scope is already modeled in a flexible way
- the platform is not locked into a simplistic single-site design

### 14.3 Practical Workflow Progress

- early SOP workflow is no longer theoretical
- assignment workflow has started with real UI and persistence
- navigation and working module structure are already consistent

### 14.4 Planning Maturity

- the project already has strategy documents, blueprint documents, and phased build logic
- large project concerns are already recognized rather than ignored

## 15. Current Challenges, Confusion Points, And Risks

### 15.1 Project Complexity Risk

The project combines document governance, compliance operations, audit workflows, KPI management, and communication history. That makes it inherently high-complexity.

### 15.2 KPI Domain Still Underdefined

The schema includes KPI definitions and KPI results, but the actual KPI operating workflow still needs deeper design.

Missing clarity includes:

- KPI assignment rules
- KPI validation states
- scoring rules
- communication thread model
- auditor-user interaction flow

### 15.3 Security Enforcement Gap

Security is planned correctly, but runtime enforcement is not complete yet.

Gaps include:

- Entra ID authentication not implemented
- full authorization and row filtering not enforced at runtime
- SharePoint document security not integrated into app behavior

### 15.4 Communication Model Gap

The platform needs a reusable conversation or thread mechanism for KPI and audit validation discussions.

This is currently a business requirement but not yet a completed technical design.

### 15.5 Enforcement Requirement

The business has explicitly prioritized enforcement above simple visibility and auditability. This means the system must actively support escalation, corrective actions, restricted drafts, and formal accountability flows.

### 15.6 Document Access Expectation Gap

The expectation of preventing screenshots is not technically realistic in a web browser. This requires early alignment with management to avoid misunderstanding.

### 15.7 Delivery Pressure Risk

This project is strategically important, high-visibility, and personally important to the project owner. That creates delivery pressure and increases the need for a tightly phased and well-governed implementation path.

## 16. Pending Decisions And Open Discussions

The following items still need explicit business decisions.

### Platform Strategy

- confirm that the platform remains one product with modular domains
- confirm that KPI is in the same platform, not a separate system

### Visibility And Access

- all employees should see active SOPs
- what exact document access restrictions are mandatory versus preferred?

### KPI Logic

- how are KPIs assigned?
- how are KPIs scored?
- what are the KPI validation states?
- who validates KPI submissions?
- what affects commission directly versus indirectly?

### Communication Model

- should the system support comment timelines or true chat-style threads?
- should one shared conversation engine serve KPI, audit, CAPA, and other workflows?

### Rollout Order

- compliance-audit workflow should lead phase 1
- KPI workflow should follow as a second-phase module
- what exact module combination is required for pilot validation?

## 17. Recommended End-To-End Implementation Approach

The safest and most scalable delivery path is phased modular implementation.

### Phase 1: Compliance Core

Deliver:

- authentication and access foundation
- admin masters
- SOP register
- approval workflow
- document structure
- assignment workflow

Outcome:

- a real pilot-ready compliance core

### Phase 2: Execution And Verification

Deliver:

- audit module
- checklist execution
- corrective actions
- evidence workflow
- implementation verification

Outcome:

- a true compliance operations system

### Phase 3: KPI Workflow

Deliver:

- KPI definitions
- KPI assignments
- KPI updates
- KPI validation
- KPI discussion threads
- KPI score reporting

Outcome:

- a structured internal KPI operating platform

### Phase 4: Hardening And Rollout

Deliver:

- SharePoint integration
- production-grade role enforcement
- document access refinement
- reporting polish
- rollout support
- governance handover

Outcome:

- enterprise-ready operational platform

## 18. Priority Order From Current State

Based on the current build state, the most practical next order is:

1. Authentication and RBAC
2. Assignment update and verification flow
3. Audit module
4. Corrective action module
5. KPI operating model design
6. KPI module implementation
7. SharePoint document flow and evidence refinement
8. Reporting and executive dashboards

## 19. Roadmap Aligned To ECS

### ECS-04 Design

- complete architecture direction
- lock security expectations
- define module boundaries

### ECS-06 Pilot

- deliver first usable compliance pilot
- include SOP and implementation core

### ECS-08 Validation

- validate software workflow
- validate SOP model
- validate audit standard model
- validate KPI approach before full KPI rollout

### ECS-09 To ECS-11 Rollout

- phase 1: compliance and food safety core
- phase 2: group SOP compliance
- phase 3: KPI tracking and validation

### ECS-12 Closeout

- hand over operational direction to the future compliance specialist or owner

## 20. Recommended Open Questions For Final Project Clarity

The project still needs final answers on:

- employee-level SOP visibility
- exact KPI scoring design
- KPI assignment logic
- conversation thread requirements
- download and document restriction expectations
- pilot success criteria
- rollout departments and sequence

## 21. Success Definition

The system should be considered successful when it achieves the following.

### Business Success

- SOP governance becomes standardized and traceable
- implementation ownership becomes visible
- audits and corrective actions become measurable
- KPI validation moves out of Excel into a structured workflow
- management gains trusted reporting visibility

### Technical Success

- secure identity and scope-aware access are enforced
- workflows are modular and maintainable
- data is structured and auditable
- the platform supports company-scale growth without redesign

### Delivery Success

- pilot is usable and credible
- validation phase proves real business value
- rollout can happen in controlled phases

## 22. Final Position

Swish Compliance Platform should be built as a serious internal enterprise system.

It should not be reduced to a simple SOP tool, and it should not be split into disconnected systems unless there is a very strong business reason later.

The correct direction is:

- one enterprise platform
- modular domains
- shared security and reporting foundation
- phased rollout
- compliance core first
- KPI workflow added as a full business module, not as a side feature

This document should serve as a central reference for:

- business alignment
- management discussion
- technical planning
- phased implementation
- AI collaboration and future module design