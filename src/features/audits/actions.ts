"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  addChecklistItemRecord,
  createAuditRecord,
  createAuditTemplateRecord,
  saveAuditResponsesRecord,
} from "@/features/audits/service";
import { requireCurrentSession } from "@/lib/auth/session";
import type { AuditResult } from "@/types/domain";

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

export async function createAuditTemplateFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();

  await createAuditTemplateRecord(
    {
      templateName: String(formData.get("templateName") ?? ""),
      complianceArea: String(formData.get("complianceArea") ?? ""),
    },
    session.user.id,
  );

  revalidatePath("/audits");
  revalidateTag("audits:templates", "max");
}

export async function addChecklistItemFormAction(formData: FormData): Promise<void> {
  const templateId = Number(formData.get("templateId") ?? 0);

  await addChecklistItemRecord({
    templateId,
    sectionName: toOptionalString(formData.get("sectionName") ?? undefined),
    itemText: String(formData.get("itemText") ?? ""),
    weight: toOptionalNumber(formData.get("weight") ?? undefined),
    sortOrder: toOptionalNumber(formData.get("sortOrder") ?? undefined),
  });

  revalidatePath(`/audits/templates/${templateId}`);
  revalidateTag("audits:templates", "max");
}

export async function createAuditFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();

  await createAuditRecord(
    {
      templateId: Number(formData.get("templateId") ?? 0),
      brandId: Number(formData.get("brandId") ?? 0),
      departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
      locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
      complianceArea: String(formData.get("complianceArea") ?? ""),
      status: String(formData.get("status") ?? "Draft") as "Draft" | "Completed",
      remarks: toOptionalString(formData.get("remarks") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/audits");
  revalidateTag("audits:list", "max");
}

export async function saveAuditResponsesFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const auditId = Number(formData.get("auditId") ?? 0);
  const complete = formData.get("complete") === "1";

  // Parse all response fields: result_{itemId} and comments_{itemId}
  const responses: Array<{ itemId: number; result: AuditResult; comments?: string }> = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("result_")) {
      const itemId = Number(key.replace("result_", ""));
      const result = String(value) as AuditResult;
      const comments = toOptionalString(formData.get(`comments_${itemId}`) ?? undefined);
      responses.push({ itemId, result, comments });
    }
  }

  await saveAuditResponsesRecord({ auditId, complete, responses }, session.user);

  revalidatePath("/audits");
  revalidatePath(`/audits/${auditId}`);
  revalidateTag("audits:list", "max");
}