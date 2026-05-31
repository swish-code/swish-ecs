import { z } from "zod";

export const controlStatuses = ["Draft", "Active", "Planned", "Inactive", "Archived"] as const;

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().min(1).optional());

export const controlFormSchema = z.object({
  controlCode: z.string().trim().min(1).max(50),
  controlName: z.string().trim().min(1).max(300),
  controlCategory: optionalTrimmedString,
  controlType: optionalTrimmedString,
  brandId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  locationId: z.coerce.number().int().positive().optional(),
  ownerUserId: z.coerce.number().int().positive().optional(),
  status: z.enum(controlStatuses),
  reviewFrequencyDays: z.coerce.number().int().positive().max(3650).optional(),
  description: z.string().trim().max(4000).optional(),
});