"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createCapaRecord, updateCapaRecord } from "@/features/capa/service";
import { requireCurrentSession } from "@/lib/auth/session";
import type { CorrectiveActionStatus, SeverityLevel } from "@/types/domain";

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

export async function createCapaFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();

  await createCapaRecord(
    {
      sourceType: String(formData.get("sourceType") ?? "Manual"),
      sourceId: toOptionalNumber(formData.get("sourceId") ?? undefined),
      title: String(formData.get("title") ?? ""),
      description: toOptionalString(formData.get("description") ?? undefined),
      brandId: toOptionalNumber(formData.get("brandId") ?? undefined),
      departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
      locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
      assignedTo: Number(formData.get("assignedTo") ?? 0),
      severity: String(formData.get("severity") ?? "Medium") as SeverityLevel,
      status: String(formData.get("status") ?? "Open") as CorrectiveActionStatus,
      dueDate: String(formData.get("dueDate") ?? ""),
      remarks: toOptionalString(formData.get("remarks") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/capa");
  revalidateTag("capa:list", "max");
}

export async function updateCapaFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const actionId = Number(formData.get("actionId") ?? 0);

  await updateCapaRecord(
    {
      actionId,
      status: String(formData.get("status") ?? "Open") as CorrectiveActionStatus,
      assignedTo: Number(formData.get("assignedTo") ?? 0),
      dueDate: String(formData.get("dueDate") ?? ""),
      remarks: toOptionalString(formData.get("remarks") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/capa");
  revalidatePath(`/capa/${actionId}`);
  revalidateTag("capa:list", "max");
}

export async function raiseCapaFromAuditAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const auditId = Number(formData.get("auditId") ?? 0);

  await createCapaRecord(
    {
      sourceType: "Audit",
      sourceId: auditId,
      title: String(formData.get("title") ?? ""),
      description: toOptionalString(formData.get("description") ?? undefined),
      brandId: toOptionalNumber(formData.get("brandId") ?? undefined),
      departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
      locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
      assignedTo: Number(formData.get("assignedTo") ?? 0),
      severity: String(formData.get("severity") ?? "Medium") as SeverityLevel,
      status: "Open",
      dueDate: String(formData.get("dueDate") ?? ""),
      remarks: toOptionalString(formData.get("remarks") ?? undefined),
    },
    session.user,
  );

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/capa");
  revalidateTag("capa:list", "max");
}
