export type CheckRecord = {
  checkId: number;
  controlId: number;
  controlCode: string;
  controlName: string;
  checkName: string;
  checkType: string;
  sourceEntityType: string | null;
  sourceEntityId: number | null;
  severity: string;
  isActive: boolean;
  ownerUserId: number | null;
  ownerDisplayName: string | null;
  brandId: number | null;
  brandName: string | null;
  departmentId: number | null;
  departmentName: string | null;
  locationId: number | null;
  locationName: string | null;
  latestStatus: string | null;
  latestResultId: number | null;
  lastEvaluatedAt: string | null;
  nextEvaluationAt: string | null;
};

export const checkResultStatuses = ["Pending Evidence", "Pending Review", "Passing", "Failing", "Accepted Risk"] as const;

export type CheckResultStatus = (typeof checkResultStatuses)[number];

export type CheckResultRecord = {
  checkResultId: number;
  checkId: number;
  brandId: number | null;
  brandName: string | null;
  departmentId: number | null;
  departmentName: string | null;
  locationId: number | null;
  locationName: string | null;
  targetEntityType: string | null;
  targetEntityId: number | null;
  status: string;
  lastEvaluatedAt: string | null;
  nextEvaluationAt: string | null;
  detailsText: string | null;
};

export type CreateCheckResultInput = {
  checkId: number;
  status: CheckResultStatus;
  targetEntityType?: string;
  targetEntityId?: number;
  lastEvaluatedAt?: string;
  nextEvaluationAt?: string;
  detailsText?: string;
};