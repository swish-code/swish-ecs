export type ControlRecord = {
  controlId: number;
  controlCode: string;
  controlName: string;
  controlCategory: string | null;
  controlType: string | null;
  brandId: number | null;
  brandName: string | null;
  departmentId: number | null;
  departmentName: string | null;
  locationId: number | null;
  locationName: string | null;
  ownerUserId: number | null;
  ownerDisplayName: string | null;
  status: string;
  reviewFrequencyDays: number | null;
  description: string | null;
  sopLinkCount: number;
  documentLinkCount: number;
  checkLinkCount: number;
  taskLinkCount: number;
};

export type CreateControlInput = {
  controlCode: string;
  controlName: string;
  controlCategory?: string;
  controlType?: string;
  brandId?: number;
  departmentId?: number;
  locationId?: number;
  ownerUserId?: number;
  status: string;
  reviewFrequencyDays?: number;
  description?: string;
};

export type UpdateControlInput = CreateControlInput & {
  controlId: number;
};

export type ControlLinkRecord = {
  linkId: number;
  controlId: number;
  entityType: string;
  entityId: number;
  linkRole: string;
  isPrimary: boolean;
  displayName: string;
  href: string | null;
};

export type RelatedControlRecord = {
  controlId: number;
  controlCode: string;
  controlName: string;
  status: string;
  brandId: number | null;
  departmentId: number | null;
  locationId: number | null;
  ownerUserId: number | null;
  linkRole: string;
  isPrimary: boolean;
};