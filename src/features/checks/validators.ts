import { z } from "zod";
import { checkResultStatuses } from "@/features/checks/types";

function emptyStringToUndefined(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export const createCheckResultSchema = z.object({
  checkId: z.coerce.number().int().positive(),
  status: z.enum(checkResultStatuses),
  targetEntityType: z.preprocess(emptyStringToUndefined, z.string().max(50).optional()),
  targetEntityId: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.coerce.number().int().positive().optional()),
  lastEvaluatedAt: z.preprocess(emptyStringToUndefined, z.string().max(100).optional()),
  nextEvaluationAt: z.preprocess(emptyStringToUndefined, z.string().max(100).optional()),
  detailsText: z.preprocess(emptyStringToUndefined, z.string().max(5000).optional()),
});
