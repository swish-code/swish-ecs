import type { SopStatus } from "@/types/domain";

export type SopRecord = {
  sopId: number;
  documentNo: string;
  documentType: string;
  title: string;
  brandId: number | null;
  brandName: string | null;
  departmentId: number | null;
  departmentName: string | null;
  locationId: number | null;
  locationName: string | null;
  complianceArea: string;
  ownerUserId: number | null;
  ownerDisplayName: string | null;
  versionNo: string;
  status: SopStatus;
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  storageProvider: string | null;
  storageDriveId: string | null;
  storageItemId: string | null;
  storagePath: string | null;
  submittedBy: number | null;
  submittedAt: string | null;
  approvedBy: number | null;
  approvedAt: string | null;
  approvalRemarks: string | null;
  activeFrom: string | null;
  nextReviewDate: string | null;
  remarks: string | null;
  controlLinkCount: number;
};

export type SopVersionRecord = {
  sopVersionId: number;
  sopId: number;
  versionNo: string;
  status: SopStatus;
  fileName: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  activeFrom: string | null;
  approvalRemarks: string | null;
  remarks: string | null;
  createdAt: string;
  isCurrent: boolean;
};

export type CreateSopInput = {
  documentNo: string;
  documentType: string;
  title: string;
  brandId: number;
  brandName?: string;
  departmentId?: number;
  departmentName?: string;
  locationId?: number;
  locationName?: string;
  complianceArea: string;
  ownerUserId?: number;
  versionNo: string;
  status: SopStatus;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  storageProvider?: string;
  storageDriveId?: string;
  storageItemId?: string;
  storagePath?: string;
  remarks?: string;
};

export type UpdateSopInput = CreateSopInput & {
  sopId: number;
};

export type SopApprovalInput = {
  sopId: number;
  status: Extract<SopStatus, "Submitted" | "Approved" | "Rejected" | "Active" | "Archived">;
  approvalRemarks?: string;
};
