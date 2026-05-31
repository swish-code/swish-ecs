export const appRoles = [
  "ADMIN",
  "BUSINESS_EXCELLENCE",
  "DEPARTMENT_OWNER",
  "AUDITOR",
  "EXECUTIVE_VIEWER",
] as const;

export type AppRole = (typeof appRoles)[number];

export const sopStatuses = [
  "Draft",
  "Submitted",
  "Approved",
  "Rejected",
  "Active",
  "Archived",
] as const;

export type SopStatus = (typeof sopStatuses)[number];

export const assignmentStatuses = [
  "Not Started",
  "In Progress",
  "Implemented",
  "Verified",
  "Delayed",
  "Not Applicable",
] as const;

export type AssignmentStatus = (typeof assignmentStatuses)[number];

export const auditStatuses = ["Draft", "Completed"] as const;
export type AuditStatus = (typeof auditStatuses)[number];

export const auditResults = ["Pass", "Fail", "Not Applicable"] as const;
export type AuditResult = (typeof auditResults)[number];

export const correctiveActionStatuses = [
  "Open",
  "In Progress",
  "Submitted",
  "Verified",
  "Closed",
] as const;

export type CorrectiveActionStatus = (typeof correctiveActionStatuses)[number];

export const severityLevels = ["Low", "Medium", "High", "Critical"] as const;
export type SeverityLevel = (typeof severityLevels)[number];

export const kpiStatuses = ["Green", "Amber", "Red"] as const;
export type KpiStatus = (typeof kpiStatuses)[number];
