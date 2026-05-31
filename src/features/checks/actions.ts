"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createCheckResultRecord } from "@/features/checks/service";
import type { CreateCheckResultInput } from "@/features/checks/types";
import { requireCurrentSession } from "@/lib/auth/session";

function toOptionalNumber(value: FormDataEntryValue | undefined): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  return Number(value);
}

function toOptionalString(value: FormDataEntryValue | undefined): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  return value.trim();
}

export async function createCheckResultFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const checkId = Number(formData.get("checkId") ?? 0);

  await createCheckResultRecord(
    {
      checkId,
      status: String(formData.get("status") ?? "Pending Review") as CreateCheckResultInput["status"],
      targetEntityType: toOptionalString(formData.get("targetEntityType") ?? undefined),
      targetEntityId: toOptionalNumber(formData.get("targetEntityId") ?? undefined),
      lastEvaluatedAt: toOptionalString(formData.get("lastEvaluatedAt") ?? undefined),
      nextEvaluationAt: toOptionalString(formData.get("nextEvaluationAt") ?? undefined),
      detailsText: toOptionalString(formData.get("detailsText") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/checks");
  revalidatePath("/tests");
  revalidatePath(`/checks/${checkId}`);
  revalidateTag("checks:list", "max");
}
