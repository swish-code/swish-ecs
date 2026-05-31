"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAssignmentRecord, updateAssignmentRecord } from "@/features/assignments/service";
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

  return value;
}

export async function createAssignmentFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();

  await createAssignmentRecord(
    {
      sopId: Number(formData.get("sopId") ?? 0),
      brandId: Number(formData.get("brandId") ?? 0),
      brandName: toOptionalString(formData.get("brandName") ?? undefined),
      departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
      departmentName: toOptionalString(formData.get("departmentName") ?? undefined),
      locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
      locationName: toOptionalString(formData.get("locationName") ?? undefined),
      ownerUserId: toOptionalNumber(formData.get("ownerUserId") ?? undefined),
      status: String(formData.get("status") ?? "Not Started") as Parameters<typeof createAssignmentRecord>[0]["status"],
      targetDate: toOptionalString(formData.get("targetDate") ?? undefined),
      remarks: toOptionalString(formData.get("remarks") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/assignments");
  revalidateTag("assignments:list", "max");
}

export async function updateAssignmentFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const assignmentId = Number(formData.get("assignmentId") ?? 0);

  await updateAssignmentRecord(
    {
      assignmentId,
      status: String(formData.get("status") ?? "Not Started") as Parameters<typeof updateAssignmentRecord>[0]["status"],
      targetDate: toOptionalString(formData.get("targetDate") ?? undefined),
      remarks: toOptionalString(formData.get("remarks") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  revalidateTag("assignments:list", "max");
}