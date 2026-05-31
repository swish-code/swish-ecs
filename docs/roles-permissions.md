# Roles & Permissions (MVP)

Keep access simple: page-level access plus server-side row filtering by brand + department.

## Roles
### Admin
- Manage users, roles, brands, departments
- Full access to the application

### Business Excellence
- Full access to SOPs, implementation, audits, corrective actions, evidence, KPIs, and reports
- Can submit SOPs for approval
- Can approve, activate, verify, and close records when authorized

### Department Owner
- Update assigned SOP implementations
- Update corrective actions assigned to them
- Add supporting evidence

### Auditor
- Create audits
- Complete checklists
- Create corrective actions from failed responses

### Executive Viewer
- View dashboard and reports only

## MVP practical access
- SOP Register: Admin and Business Excellence full access; Executive Viewer read-only
- Implementation: Department Owner can update assigned records; Business Excellence can verify
- Audits: Auditor and Business Excellence can create and complete
- Corrective actions: assignee can update; Business Excellence can verify and close
- Evidence: users can upload evidence for records they can edit
- KPIs: Business Excellence defines and records KPI results

## Row filtering rule
If the user is not Admin or Business Excellence, filter by:
- matching `brand_id`
- matching `department_id`
- or matching assignee user id
