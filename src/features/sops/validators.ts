import { z } from "zod";
import { sopStatuses } from "@/types/domain";

const optionalNameField = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().min(1).max(200).optional());

export const sopFormSchema = z.object({
  documentNo: z.string().min(1).max(50),
  documentType: z.string().min(1).max(30),
  title: z.string().min(1).max(300),
  brandId: z.coerce.number().int().positive(),
  brandName: optionalNameField,
  departmentId: z.coerce.number().int().positive().optional(),
  departmentName: optionalNameField,
  locationId: z.coerce.number().int().positive().optional(),
  locationName: optionalNameField,
  complianceArea: z.string().min(1).max(100),
  ownerUserId: z.coerce.number().int().positive().optional(),
  versionNo: z.string().min(1).max(30),
  status: z.enum(sopStatuses),
  fileName: z.string().max(255).optional(),
  fileUrl: z.string().url().optional(),
  fileSize: z.coerce.number().int().nonnegative().optional(),
  mimeType: z.string().max(100).optional(),
  storageProvider: z.string().max(30).optional(),
  storageDriveId: z.string().max(255).optional(),
  storageItemId: z.string().max(255).optional(),
  storagePath: z.string().max(1000).optional(),
  remarks: z.string().max(2000).optional(),
}).superRefine((value, context) => {
  if (!value.departmentId && !value.locationId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one scope target is required: department or location.",
      path: ["departmentId"],
    });
  }

  if (value.fileUrl && !value.storageProvider) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Storage provider is required when a file URL is provided.",
      path: ["storageProvider"],
    });
  }
});

export const sopApprovalSchema = z.object({
  sopId: z.number().int().positive(),
  status: z.enum(["Submitted", "Approved", "Rejected", "Active", "Archived"]),
  approvalRemarks: z.string().max(2000).optional(),
});
