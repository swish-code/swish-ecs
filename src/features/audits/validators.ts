import { z } from "zod";
import { auditResults, auditStatuses } from "@/types/domain";

export const auditTemplateFormSchema = z.object({
  templateName: z.string().min(1).max(200),
  complianceArea: z.string().min(1).max(100),
});

export const addChecklistItemSchema = z.object({
  templateId: z.coerce.number().int().positive(),
  sectionName: z.string().max(200).optional(),
  itemText: z.string().min(1).max(1000),
  weight: z.coerce.number().positive().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const auditFormSchema = z
  .object({
    templateId: z.coerce.number().int().positive(),
    brandId: z.coerce.number().int().positive(),
    departmentId: z.coerce.number().int().positive().optional(),
    locationId: z.coerce.number().int().positive().optional(),
    complianceArea: z.string().min(1).max(100),
    status: z.enum(auditStatuses),
    remarks: z.string().max(2000).optional(),
  })
  .superRefine((value, context) => {
    if (!value.departmentId && !value.locationId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["departmentId"],
        message: "At least one scope target is required: department or location.",
      });
    }
  });

export const saveAuditResponsesSchema = z.object({
  auditId: z.coerce.number().int().positive(),
  complete: z.boolean(),
  responses: z.array(
    z.object({
      itemId: z.coerce.number().int().positive(),
      result: z.enum(auditResults),
      comments: z.string().max(2000).optional(),
    }),
  ),
});