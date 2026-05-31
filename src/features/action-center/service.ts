import { listAssignmentRecords } from "@/features/assignments/service";
import { listAuditRecords } from "@/features/audits/service";
import { listCapaRecords } from "@/features/capa/service";
import { listControlRecords } from "@/features/controls/service";
import { listDocumentRecords } from "@/features/evidence/service";
import { listSopRecords } from "@/features/sops/service";
import { hasRole, type SessionUser } from "@/lib/auth/rbac";
import type { ActionCenterItem, ActionCenterSummary } from "@/features/action-center/types";

function buildScopeLabel(parts: Array<string | null>): string {
  return parts.filter(Boolean).join(" / ") || "Global";
}

function isPast(dateValue: string | null): boolean {
  if (!dateValue) {
    return false;
  }

  const value = new Date(dateValue);
  if (Number.isNaN(value.getTime())) {
    return false;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return value < now;
}

function comparePriority(priority: ActionCenterItem["priority"]): number {
  switch (priority) {
    case "Critical":
      return 0;
    case "High":
      return 1;
    case "Medium":
      return 2;
    default:
      return 3;
  }
}

function compareItems(left: ActionCenterItem, right: ActionCenterItem): number {
  if (left.isOverdue !== right.isOverdue) {
    return left.isOverdue ? -1 : 1;
  }

  const priorityComparison = comparePriority(left.priority) - comparePriority(right.priority);
  if (priorityComparison !== 0) {
    return priorityComparison;
  }

  if (left.dueDate && right.dueDate) {
    return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
  }

  if (left.dueDate) {
    return -1;
  }

  if (right.dueDate) {
    return 1;
  }

  return left.title.localeCompare(right.title);
}

export async function getActionCenterItems(user: SessionUser): Promise<{ items: ActionCenterItem[]; summary: ActionCenterSummary }> {
  const [sops, assignments, controls, documents, audits, capa] = await Promise.all([
    listSopRecords(user),
    listAssignmentRecords(user),
    listControlRecords(user),
    listDocumentRecords(user),
    listAuditRecords(user),
    listCapaRecords(user),
  ]);

  const approvalItems: ActionCenterItem[] = hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])
    ? sops
        .filter((record) => record.status === "Submitted" || record.status === "Approved")
        .map((record) => ({
          id: `sop-${record.sopId}`,
          queueGroup: "Approvals",
          taskType: record.status === "Submitted" ? "Policy approval" : "Policy activation",
          sourceModule: "SOPs",
          title: `${record.documentNo} requires ${record.status === "Submitted" ? "approval" : "activation"}`,
          detail: record.title,
          ownerName: record.ownerDisplayName ?? "Unassigned",
          status: record.status,
          priority: "High",
          severity: "High",
          dueDate: null,
          href: `/sops/${record.sopId}`,
          scopeLabel: buildScopeLabel([record.brandName, record.departmentName, record.locationName]),
          isOverdue: false,
        }))
    : [];

  const implementationItems: ActionCenterItem[] = assignments
    .filter((record) => ["Not Started", "In Progress", "Delayed"].includes(record.status))
    .map((record) => ({
      id: `assignment-${record.assignmentId}`,
      queueGroup: "Implementation",
      taskType: "Implementation task",
      sourceModule: "Assignments",
      title: record.documentNo,
      detail: record.sopTitle,
      ownerName: record.ownerDisplayName ?? "Unassigned",
      status: record.status,
      priority: record.status === "Delayed" || isPast(record.targetDate) ? "High" : "Medium",
      severity: record.status === "Delayed" || isPast(record.targetDate) ? "High" : "Medium",
      dueDate: record.targetDate,
      href: `/assignments/${record.assignmentId}`,
      scopeLabel: buildScopeLabel([record.brandName, record.departmentName, record.locationName]),
      isOverdue: isPast(record.targetDate),
    }));

  const controlItems: ActionCenterItem[] = controls.flatMap((record) => {
    const needsLifecycleAttention = ["DRAFT", "PLANNED", "INACTIVE"].includes(record.status.toUpperCase());
    const hasNoGovernedLinks = record.status.toUpperCase() === "ACTIVE"
      && record.sopLinkCount === 0
      && record.documentLinkCount === 0
      && record.checkLinkCount === 0;

    if (!needsLifecycleAttention && !hasNoGovernedLinks) {
      return [];
    }

    return [{
      id: `control-${record.controlId}`,
      queueGroup: "Controls" as const,
      taskType: hasNoGovernedLinks ? "Control linkage" : "Control setup",
      sourceModule: "Controls",
      title: record.controlCode,
      detail: hasNoGovernedLinks ? `${record.controlName} needs linked policies, documents, or tests` : record.controlName,
      ownerName: record.ownerDisplayName ?? "Unassigned",
      status: record.status,
      priority: hasNoGovernedLinks ? "High" : "Medium",
      severity: hasNoGovernedLinks ? "High" : "Medium",
      dueDate: null,
      href: `/controls/${record.controlId}`,
      scopeLabel: buildScopeLabel([record.brandName, record.departmentName, record.locationName]),
      isOverdue: false,
    }];
  });

  const documentItems: ActionCenterItem[] = documents.flatMap((record) => {
    const isExpired = isPast(record.expiryDate);
    const isReviewDue = isPast(record.reviewDate);
    const isDraft = record.status.toUpperCase() === "DRAFT";
    const isInReview = record.status.toUpperCase() === "IN REVIEW";
    const isFlagged = record.status.toUpperCase() === "FLAGGED";
    const isActiveWithoutFile = ["ACTIVE", "APPROVED"].includes(record.status.toUpperCase()) && record.currentEvidenceId === null;

    if (!isExpired && !isReviewDue && !isDraft && !isInReview && !isFlagged && !isActiveWithoutFile) {
      return [];
    }

    return [{
      id: `document-${record.documentId}`,
      queueGroup: "Documents" as const,
      taskType: isExpired
        ? "Document renewal"
        : isFlagged
          ? "Evidence resubmission"
          : isInReview
            ? "Document review"
        : isReviewDue
          ? "Document review"
          : isActiveWithoutFile
            ? "Attach governed file"
            : "Document draft completion",
      sourceModule: "Documents",
      title: record.documentName,
      detail: record.fileName ?? record.documentType,
      ownerName: record.ownerDisplayName ?? "Unassigned",
      status: record.status,
      priority: isExpired ? "Critical" : isFlagged || isReviewDue || isInReview || isActiveWithoutFile ? "High" : "Medium",
      severity: isExpired ? "Critical" : isFlagged || isReviewDue || isInReview || isActiveWithoutFile ? "High" : "Medium",
      dueDate: record.reviewDate ?? record.expiryDate,
      href: `/documents/${record.documentId}`,
      scopeLabel: buildScopeLabel([record.brandName, record.departmentName, record.locationName]),
      isOverdue: isReviewDue || isExpired || isFlagged,
    }];
  });

  const auditItems: ActionCenterItem[] = audits
    .filter((record) => record.status === "Draft")
    .map((record) => ({
      id: `audit-${record.auditId}`,
      queueGroup: "Audits",
      taskType: "Audit execution",
      sourceModule: "Audits",
      title: record.templateName,
      detail: record.complianceArea,
      ownerName: record.performedByName,
      status: record.status,
      priority: "Medium",
      severity: "Medium",
      dueDate: null,
      href: `/audits/${record.auditId}`,
      scopeLabel: buildScopeLabel([record.brandName, record.departmentName, record.locationName]),
      isOverdue: false,
    }));

  const remediationItems: ActionCenterItem[] = capa
    .filter((record) => !["Verified", "Closed"].includes(record.status))
    .map((record) => ({
      id: `capa-${record.actionId}`,
      queueGroup: "Remediation",
      taskType: "Corrective action",
      sourceModule: "CAPA",
      title: record.title,
      detail: record.description ?? record.sourceType,
      ownerName: record.assignedToName,
      status: record.status,
      priority: record.severity === "Critical" ? "Critical" : record.severity === "High" ? "High" : "Medium",
      severity: record.severity,
      dueDate: record.dueDate,
      href: `/capa/${record.actionId}`,
      scopeLabel: buildScopeLabel([record.brandName, record.departmentName, record.locationName]),
      isOverdue: isPast(record.dueDate),
    }));

  const items = [...approvalItems, ...implementationItems, ...controlItems, ...documentItems, ...auditItems, ...remediationItems].sort(compareItems);

  return {
    items,
    summary: {
      totalItems: items.length,
      overdueItems: items.filter((item) => item.isOverdue).length,
      approvalItems: approvalItems.length,
      remediationItems: remediationItems.length,
    },
  };
}