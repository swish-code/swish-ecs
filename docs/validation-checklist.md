# Validation Checklist

## Global
- status must be in the allowed status list
- required audit fields must be set on create and update
- verification and closure require evidence or remarks

## SOPs
- document_no required
- document_type required
- title required
- department_id required
- version_no required
- status required
- file_name and file_url required before submission
- approved_at required when status becomes Approved or Active

## SOP assignments
- unique per sop_id + brand_id + department_id
- status required
- verified_at and verified_by required when status becomes Verified

## Audits
- template_id required
- brand_id required
- department_id required
- all items need a response before completion
- score should exclude Not Applicable items

## Corrective actions
- source_type required
- title required
- assigned_to required
- severity required
- status required
- due_date required
- verified_at required when status becomes Verified
- closed_at required when status becomes Closed

## KPIs
- reporting_month required
- actual_value required
- status must be Green, Amber, or Red if provided
