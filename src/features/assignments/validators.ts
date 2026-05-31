import { z } from "zod";
import { assignmentStatuses } from "@/types/domain";

export const updateAssignmentFormSchema = z.object({
  assignmentId: z.coerce.number().int().positive(),
  status: z.enum(assignmentStatuses),
  targetDate: z.string().date().optional(),
  remarks: z.string().max(2000).optional(),
});

const optionalNameField = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().min(1).max(200).optional());

export const assignmentFormSchema = z
  .object({
    sopId: z.coerce.number().int().positive(),
    brandId: z.coerce.number().int().positive(),
    brandName: optionalNameField,
    departmentId: z.coerce.number().int().positive().optional(),
    departmentName: optionalNameField,
    locationId: z.coerce.number().int().positive().optional(),
    locationName: optionalNameField,
    ownerUserId: z.coerce.number().int().positive().optional(),
    status: z.enum(assignmentStatuses),
    targetDate: z.string().date().optional(),
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