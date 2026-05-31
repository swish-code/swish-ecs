import type { CorrectiveActionStatus, SeverityLevel } from "@/types/domain";

export type CorrectiveActionRecord = {
  actionId: number;
  sourceType: string;
  sourceId: number | null;
  title: string;
  description: string | null;
  brandId: number | null;
  departmentId: number | null;
  locationId: number | null;
  assignedTo: number;
  assignedToName: string;
  severity: SeverityLevel;
  status: CorrectiveActionStatus;
  dueDate: string;
  submittedBy: number | null;
  submittedAt: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  closedAt: string | null;
  remarks: string | null;
  brandName: string | null;
  departmentName: string | null;
  locationName: string | null;
  createdAt: string;
};

export type CreateCorrectiveActionInput = {
  sourceType: string;
  sourceId?: number;
  title: string;
  description?: string;
  brandId?: number;
  departmentId?: number;
  locationId?: number;
  assignedTo: number;
  severity: SeverityLevel;
  status: CorrectiveActionStatus;
  dueDate: string;
  remarks?: string;
};

export type UpdateCorrectiveActionInput = {
  actionId: number;
  status: CorrectiveActionStatus;
  assignedTo: number;
  dueDate: string;
  remarks?: string;
};
