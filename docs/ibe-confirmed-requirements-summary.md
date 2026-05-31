# IBE Confirmed Requirements Summary

This document captures the business decisions confirmed by the Business Excellence team and serves as the current source of truth for product direction.

## 1. Strategic Position

- The platform is a governance system across the entire organization.
- The business goal is visibility, accountability, and enforceability.
- The platform remains one centralized enterprise system for SOP, compliance, audit, and KPI workflows.

## 2. Primary Business Priorities

### Immediate problem to solve

- track the implementation of all SOPs
- track the effectiveness of SOP implementation
- manage SOP creation through a well-defined workflow
- track individual KPIs through accurate data

### Highest phase-1 priority

- Compliance Audit

### What success means for IBE

- compliance audit on SOPs is performed in an automated way
- audit results are validated through company data and internal systems

## 3. Scope And Rollout

### Scope to cover first

- all major compliance areas are in scope
- food safety and H&S are the top priorities inside that scope

### Rollout approach

- first rollout should cover the whole company
- pilot users should start with IBE, OPEX, and Procurement
- legal compliance and IPO readiness can be deferred to later phases

## 4. Users And Governance

### Main user group

- compliance team under the IBE umbrella

### Business ownership

- SOP creation and maintenance: Compliance and OPEX team
- SOP approval: IBE Director, DCEO, CEO
- implementation monitoring: Compliance Specialist
- audits: Compliance Specialist and Internal Auditors
- KPI validation: Compliance Specialist
- company-wide visibility: IBE Director, DCEO, CEO

## 5. SOP Workflow Decisions

### Lifecycle

- expected lifecycle duration: 15 working days
- mandatory steps: Create, Review, Validate, Approve, Publish

### Access

- all employees should be able to view active SOPs
- draft and under-review SOPs must remain restricted

### Review cycle

- quarterly
- biannual
- annual

### Required SOP content visibility

Each SOP should clearly show:

- scope
- roles and responsibilities
- KPIs
- exceptions and escalations
- RACI matrix

## 6. Implementation Workflow Decisions

### Rollout model

- approved SOPs must be communicated to internal departments or cross-functional teams

### Confirmation ownership

- Compliance Specialist with the department head confirms implementation

### Tracking model

- implementation should be tracked through a mix of department, location, and employee context

### Accepted implementation evidence

- data
- forms
- reports
- trackers

### Failure or delay response

- CAPA is required
- disciplinary process may follow

## 7. Audit And Corrective Action Decisions

### Audit types to support first

- SOP implementation audit
- ISO audit
- HACCP audit
- legal audit
- finance audit

### Current business reference point

- food safety and restaurant operations audits are currently done through the OPEX app
- the current pattern is checklist-based with predefined queries and grading

### Finding escalation rule

- audit findings must be escalated based on severity and recurrence

### Corrective action handling

- corrective actions are assigned to the department head
- assignment is treated as formal communication
- target closure window is 48 hours to close the gap

### Management audit reporting needs

- number of audits
- audit area
- audit score
- audit performance over time

## 8. KPI Decisions

### Strategic importance

- KPI is important but can come in second phase
- KPI tracking is the module expected to be strongest at launch to build business trust

### Assignment model

- KPI ownership is both employee-level and manager-level
- employees are accountable for individual KPIs
- managers are accountable for department KPIs

### Update and validation ownership

- KPI progress is managed through the Compliance Specialist according to current business expectation

### Escalation rule

- missing, late, or unclear KPI updates escalate to Compliance Specialist and IBE Director

### Scoring model

- scoring should be percentage-based versus target percentage

## 9. Communication Workflow Decisions

### KPI follow-up behavior

- when IBE asks why a KPI is not updated, the system should trigger a focused interaction with the concerned department head

### Communication history

- full conversation history must be retained

### Communication scope

- the same communication style should be used for both KPI validation and audit / corrective-action discussions

### Business-critical reminders and escalations

- compliance gaps
- critical audit findings
- non-compliance to SOP

## 10. Visibility And Governance Decisions

### What each employee should see

- his or her own area of responsibility in compliance and governance
- his or her audit results
- compliance percentage against SOP
- access to view all active SOPs

### What only IBE or managers should see

- high-level reports across all system areas

### Restricted records

- all SOPs in progress from creation through approval must remain restricted

### Most important governance priority

- enforcement

## 11. Reporting Expectations

### Required management dashboards

- Compliance Dashboard
- KPI Dashboard
- Audit Dashboard

### IBE manager operating view

The manager wants regular visibility into:

- audits performed
- compliance checks made
- repeated gaps
- critical findings
- CAPA status

### Leadership metrics that matter most

- Compliance %
- KPI performance %
- number of SOPs approved
- number of SOPs implemented
- Audit Score %

### What makes the system useful for decisions

- integration with the group database and internal systems

## 12. Confirmed Risks

The business sees the biggest design risks as:

- high business risk in local compliance and regulatory obligations
- high business loss risk
- high reputational risk

## 13. Implications For System Design

These confirmed decisions change the design priorities in important ways.

### Implication 1

Audit must move earlier in delivery priority because phase-1 success is defined through compliance audit automation.

### Implication 2

KPI cannot be ignored in the launch narrative because business trust is strongly tied to KPI tracking visibility, even if the full KPI workflow is phased after the audit core.

### Implication 3

The platform needs a formal communication-thread capability, not just comments, because IBE expects history and follow-up across KPI and audit workflows.

### Implication 4

Employee access rules are now clearer:

- active SOPs: broad view access
- in-progress SOPs: restricted access

### Implication 5

The system must be designed around enforcement, not only visibility and record keeping.

## 14. Recommended Immediate Next Step

The next step should be to revise the implementation roadmap and system design around these confirmed business decisions before building deeper modules.

The most practical next execution order is:

1. finalize revised functional design for audit, CAPA, KPI communication, and access rules
2. implement authentication and RBAC foundation
3. build audit module next
4. build corrective action workflow immediately after audit
5. continue KPI design and then build the KPI module in the second phase