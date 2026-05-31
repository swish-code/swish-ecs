import type { AuditStatus } from "@/types/domain";

export type AuditTemplateRecord = {
  templateId: number;
  templateName: string;
  complianceArea: string;
  isActive: boolean;
};

export type AuditRecord = {
  auditId: number;
  templateId: number;
  brandId: number | null;
  departmentId: number | null;
  locationId: number | null;
  performedByUserId: number | null;
  templateName: string;
  brandName: string | null;
  departmentName: string | null;
  locationName: string | null;
  complianceArea: string;
  status: AuditStatus;
  performedByName: string;
  startedAt: string;
  completedAt: string | null;
  scorePercent: number | null;
  remarks: string | null;
};

export type ChecklistItemRecord = {
  itemId: number;
  templateId: number;
  sectionName: string | null;
  itemText: string;
  weight: number;
  sortOrder: number;
};

export type AuditResponseRecord = {
  responseId: number;
  auditId: number;
  itemId: number;
  result: "Pass" | "Fail" | "Not Applicable";
  comments: string | null;
};

export type CreateAuditTemplateInput = {
  templateName: string;
  complianceArea: string;
};

export type AddChecklistItemInput = {
  templateId: number;
  sectionName?: string;
  itemText: string;
  weight?: number;
  sortOrder?: number;
};

export type CreateAuditInput = {
  templateId: number;
  brandId: number;
  departmentId?: number;
  locationId?: number;
  complianceArea: string;
  status: AuditStatus;
  remarks?: string;
};

export type SaveAuditResponsesInput = {
  auditId: number;
  responses: Array<{
    itemId: number;
    result: "Pass" | "Fail" | "Not Applicable";
    comments?: string;
  }>;
  complete: boolean;
};