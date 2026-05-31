export type ActionCenterItem = {
  id: string;
  queueGroup: "Approvals" | "Implementation" | "Controls" | "Documents" | "Audits" | "Remediation";
  taskType: string;
  sourceModule: string;
  title: string;
  detail: string;
  ownerName: string;
  status: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  severity: "Critical" | "High" | "Medium" | "Low";
  dueDate: string | null;
  href: string;
  scopeLabel: string;
  isOverdue: boolean;
};

export type ActionCenterSummary = {
  totalItems: number;
  overdueItems: number;
  approvalItems: number;
  remediationItems: number;
};