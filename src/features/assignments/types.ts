import type { AssignmentStatus } from "@/types/domain";

export type AssignmentRecord = {
  assignmentId: number;
  sopId: number;
  brandId: number | null;
  departmentId: number | null;
  locationId: number | null;
  ownerUserId: number | null;
  documentNo: string;
  sopTitle: string;
  brandName: string | null;
  departmentName: string | null;
  locationName: string | null;
  ownerDisplayName: string | null;
  status: AssignmentStatus;
  targetDate: string | null;
  completedAt: string | null;
  remarks: string | null;
};

export type CreateAssignmentInput = {
  sopId: number;
  brandId: number;
  brandName?: string;
  departmentId?: number;
  departmentName?: string;
  locationId?: number;
  locationName?: string;
  ownerUserId?: number;
  status: AssignmentStatus;
  targetDate?: string;
  remarks?: string;
};

export type UpdateAssignmentInput = {
  assignmentId: number;
  status: AssignmentStatus;
  targetDate?: string;
  remarks?: string;
};