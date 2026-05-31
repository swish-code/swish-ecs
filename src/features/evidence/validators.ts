import { z } from "zod";

export const documentStatuses = ["Draft", "In Review", "Active", "Approved", "Flagged", "Expired", "Archived"] as const;
export const documentVersionStatuses = ["Draft", "Pending Review", "Approved", "Rejected", "Flagged", "Ready For Audit"] as const;

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().min(1).optional());

const optionalDateString = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional());

export const documentFormSchema = z.object({
  documentCode: optionalTrimmedString,
  documentName: z.string().trim().min(1).max(300),
  documentType: z.string().trim().min(1).max(100),
  category: optionalTrimmedString,
  brandId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  locationId: z.coerce.number().int().positive().optional(),
  ownerUserId: z.coerce.number().int().positive().optional(),
  status: z.enum(documentStatuses),
  issueDate: optionalDateString,
  expiryDate: optionalDateString,
  reviewDate: optionalDateString,
  sourceType: optionalTrimmedString,
  remarks: z.string().trim().max(2000).optional(),
  fileName: optionalTrimmedString,
  fileUrl: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.string().url().optional()),
  fileSize: z.coerce.number().int().nonnegative().optional(),
  mimeType: optionalTrimmedString,
  versionNo: optionalTrimmedString,
  versionStatus: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.enum(documentVersionStatuses).optional()),
  storageProvider: optionalTrimmedString,
  storageDriveId: optionalTrimmedString,
  storageItemId: optionalTrimmedString,
  storagePath: optionalTrimmedString,
}).superRefine((value, context) => {
  if ((value.fileName && !value.fileUrl) || (!value.fileName && value.fileUrl)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "File name and file URL must be provided together.",
      path: [value.fileName ? "fileUrl" : "fileName"],
    });
  }

  if (value.fileUrl && !value.versionNo) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Version number is required when creating an initial governed file.",
      path: ["versionNo"],
    });
  }

  if (value.fileUrl && !value.versionStatus) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Version status is required when creating an initial governed file.",
      path: ["versionStatus"],
    });
  }
});

export const documentVersionTransitionSchema = z.object({
  documentId: z.coerce.number().int().positive(),
  status: z.enum(["Pending Review", "Approved", "Rejected", "Flagged", "Ready For Audit"]),
});