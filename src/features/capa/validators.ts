import { z } from "zod";
import { correctiveActionStatuses, severityLevels } from "@/types/domain";

export const capaFormSchema = z.object({
  sourceType: z.string().min(1).max(30),
  sourceId: z.coerce.number().int().positive().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  brandId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  locationId: z.coerce.number().int().positive().optional(),
  assignedTo: z.coerce.number().int().positive(),
  severity: z.enum(severityLevels),
  status: z.enum(correctiveActionStatuses),
  dueDate: z.string().date(),
  remarks: z.string().max(2000).optional(),
});

export const updateCapaFormSchema = z.object({
  actionId: z.coerce.number().int().positive(),
  status: z.enum(correctiveActionStatuses),
  assignedTo: z.coerce.number().int().positive(),
  dueDate: z.string().date(),
  remarks: z.string().max(2000).optional(),
});
