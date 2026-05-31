# Practical Issues and Mitigations

## Scope creep
Risk: too many compliance areas modeled deeply in MVP.
Mitigation: keep the pilot centered on SOPs, audits, CAPA, evidence, and KPIs.

## Approval bottleneck
Risk: approval queue stalls with one approver.
Mitigation: keep IBE Manager as the formal approver, but show a clear pending queue on the dashboard.

## Evidence quality
Risk: users close work without proof.
Mitigation: require evidence or remarks for verification and closure actions.

## File storage complexity
Risk: app upload flow becomes blocked by storage setup.
Mitigation: keep Snowflake for metadata only and use SharePoint or OneDrive for files.

## Access control
Risk: users see the wrong brand or department data.
Mitigation: enforce filtering on the server side.

## Reporting trust
Risk: dashboard numbers are challenged.
Mitigation: keep metric definitions fixed and backed by Snowflake views.
