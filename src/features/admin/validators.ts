import { z } from "zod";

const optionalNameField = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().min(1).max(200).optional());

export const brandFormSchema = z.object({
  brandCode: z.string().trim().min(1).max(50),
  brandName: z.string().trim().min(1).max(200),
});

export const departmentFormSchema = z.object({
  departmentCode: z.string().trim().min(1).max(50),
  departmentName: z.string().trim().min(1).max(200),
});

export const locationFormSchema = z.object({
  locationCode: z.string().trim().min(1).max(50),
  locationName: z.string().trim().min(1).max(200),
});

export const userFormSchema = z.object({
  email: z.string().trim().email().max(320),
  displayName: z.string().trim().min(1).max(200),
  brandId: z.number().int().positive().optional(),
  brandIds: z.array(z.number().int().positive()).optional().default([]),
  hasAllBrands: z.boolean().optional().default(false),
  brandName: optionalNameField,
  departmentId: z.number().int().positive().optional(),
  departmentIds: z.array(z.number().int().positive()).optional().default([]),
  hasAllDepartments: z.boolean().optional().default(false),
  departmentName: optionalNameField,
  locationId: z.number().int().positive().optional(),
  locationIds: z.array(z.number().int().positive()).optional().default([]),
  hasAllLocations: z.boolean().optional().default(false),
  locationName: optionalNameField,
  roleIds: z.array(z.number().int().positive()).min(1, "At least one role is required."),
});
