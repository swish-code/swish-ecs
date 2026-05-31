# Screens / Pages and Workflows (MVP)

## Navigation
- Dashboard
- SOP Register
- Implementation
- Audits
- Corrective Actions
- Evidence
- KPIs
- Reports
- Admin

## Routes
### Dashboard
- `/dashboard` — summary cards, approval queue, overdue items, needs-attention lists

### SOP Register
- `/sops` — list/search/filter
- `/sops/new` — create SOP
- `/sops/[id]` — view/edit SOP
- `/sops/[id]/approve` — submit, approve, reject, activate, archive
- `/sops/[id]/assign` — assign to brand + department

### Implementation
- `/implementation` — assignment list
- `/implementation/[id]` — update implementation status, target date, verification, remarks

### Audits / Checklists
- `/checklists/templates` — list templates
- `/checklists/templates/new` — create template
- `/checklists/templates/[id]` — edit template/items
- `/audits` — list audits
- `/audits/new` — create audit for a brand + department
- `/audits/[id]` — execute checklist and complete audit

### Corrective Actions
- `/capa` — list corrective actions
- `/capa/new` — create manual action
- `/capa/[id]` — update assignment, status, evidence, verification, closure

### Evidence
- `/evidence` — list evidence files
- `/evidence/new` — upload/attach file metadata to an entity

### KPIs
- `/kpis/definitions` — KPI definition list
- `/kpis/definitions/new` — create KPI
- `/kpis/results` — monthly KPI results
- `/kpis/results/new` — add KPI result

### Reports
- `/reports` — exports and downloadable summaries

### Admin
- `/admin/brands`
- `/admin/departments`
- `/admin/users`
- `/admin/roles`

## Core workflow
### SOP to implementation
1. Create SOP in Draft
2. Upload main document file
3. Submit to IBE Manager
4. Approve or reject
5. Activate approved SOP
6. Assign to brand + department
7. Update implementation status
8. Verify implementation

### Audit to corrective action
1. Create checklist template and items
2. Create audit for brand + department
3. Record Pass/Fail/Not Applicable responses
4. Calculate audit score
5. Create corrective action from failed response when needed
6. Track action to closure with evidence

### KPI reporting
1. Define KPI by brand/department if applicable
2. Record monthly actual value
3. Set or compute RAG status
4. Show results on dashboard
