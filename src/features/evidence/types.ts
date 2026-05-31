export type DocumentRecord = {
  documentId: number;
  documentCode: string | null;
  documentName: string;
  documentType: string;
  category: string | null;
  brandId: number | null;
  brandName: string | null;
  departmentId: number | null;
  departmentName: string | null;
  locationId: number | null;
  locationName: string | null;
  ownerUserId: number | null;
  ownerDisplayName: string | null;
  status: string;
  currentEvidenceId: number | null;
  fileName: string | null;
  fileUrl: string | null;
  versionNo: string | null;
  versionStatus: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  reviewDate: string | null;
  sourceType: string | null;
  remarks: string | null;
  controlLinkCount: number;
};

export type DocumentVersionRecord = {
  evidenceId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  versionNo: string | null;
  versionStatus: string | null;
  storageProvider: string | null;
  storageDriveId: string | null;
  storageItemId: string | null;
  storagePath: string | null;
  remarks: string | null;
  createdBy: number | null;
  createdByName: string | null;
  createdAt: string;
  approvedBy: number | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectedBy: number | null;
  rejectedByName: string | null;
  rejectedAt: string | null;
  isCurrent: boolean;
};

export type DocumentVersionWorkflowStatus = "Pending Review" | "Approved" | "Rejected" | "Flagged" | "Ready For Audit";

export type CreateDocumentInput = {
  documentCode?: string;
  documentName: string;
  documentType: string;
  category?: string;
  brandId?: number;
  departmentId?: number;
  locationId?: number;
  ownerUserId?: number;
  status: string;
  issueDate?: string;
  expiryDate?: string;
  reviewDate?: string;
  sourceType?: string;
  remarks?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  versionNo?: string;
  versionStatus?: string;
  storageProvider?: string;
  storageDriveId?: string;
  storageItemId?: string;
  storagePath?: string;
};

export type UpdateDocumentInput = CreateDocumentInput & {
  documentId: number;
};

export type DocumentVersionTransitionInput = {
  documentId: number;
  status: DocumentVersionWorkflowStatus;
};

export type DocumentAuditUsageCheckRecord = {
  checkId: number;
  controlId: number;
  controlCode: string;
  controlName: string;
  checkName: string;
  checkType: string;
  severity: string;
  latestStatus: string | null;
  ownerDisplayName: string | null;
  sourceEntityType: string | null;
  sourceEntityId: number | null;
  lastEvaluatedAt: string | null;
  nextEvaluationAt: string | null;
  isDirectDocumentCheck: boolean;
};

export type DocumentAuditUsageAuditRecord = {
  auditId: number;
  templateName: string;
  complianceArea: string;
  status: string;
  performedByName: string;
  startedAt: string;
  completedAt: string | null;
  scorePercent: number | null;
  brandName: string | null;
  departmentName: string | null;
  locationName: string | null;
};

export type DocumentAuditUsageRecord = {
  linkedControlCount: number;
  directCheckCount: number;
  scopeAuditCount: number;
  isAuditReady: boolean;
  checks: DocumentAuditUsageCheckRecord[];
  audits: DocumentAuditUsageAuditRecord[];
};