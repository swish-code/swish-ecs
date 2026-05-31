# ECS-04 System Design

## Purpose
Build a practical internal compliance web application for Swish that tracks SOP governance, approvals, implementation, audits, corrective actions, evidence, and KPI visibility.

## MVP principles
- Keep the first version simple and usable.
- Focus on Business Excellence users first.
- Use Snowflake for structured application and reporting data.
- Use SharePoint or OneDrive for actual file storage.
- Report primarily by brand + department.

## Primary users
- Admin
- Business Excellence
- Department Owner
- Auditor
- Executive Viewer

## Core modules
1. Dashboard
2. SOP Register
3. SOP Assignment / Implementation Tracker
4. Audit / Checklist
5. Corrective Actions
6. Evidence Tracking
7. KPI Tracking
8. Reports / Exports
9. Audit Trail
10. Admin Setup

## High-level architecture
UI
→ server actions / route handlers
→ service layer
→ repository layer
→ Snowflake

## Core entities
- SOPs: register, file metadata, approval state, lifecycle state
- SOP assignments: brand + department implementation tracking
- checklist templates and items
- audits and audit responses
- corrective actions
- evidence files
- KPI definitions and results
- audit log

## Status model
### SOP
- Draft
- Submitted
- Approved
- Rejected
- Active
- Archived

### Assignment
- Not Started
- In Progress
- Implemented
- Verified
- Delayed
- Not Applicable

### Corrective action
- Open
- In Progress
- Submitted
- Verified
- Closed

### Audit response
- Pass
- Fail
- Not Applicable

### KPI
- Green
- Amber
- Red

## Key business rules
- Main SOP file upload is required before submission.
- IBE Manager is the approver for Business Excellence SOP approval.
- Only approved or active SOPs can be assigned.
- One assignment row exists per SOP + brand + department.
- Verification and closure steps require evidence or remarks.
- Important state changes must write to the audit log.

## Reporting direction
Use Snowflake views for dashboard cards and exports. A wider combined reporting view can be added after the main workflow is stable.
