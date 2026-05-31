"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createControlRecord, linkControlToDocument, linkControlToSop, updateControlRecord } from "@/features/controls/service";
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

export async function createControlFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();

  await createControlRecord(
    {
      controlCode: String(formData.get("controlCode") ?? ""),
      controlName: String(formData.get("controlName") ?? ""),
      controlCategory: toOptionalString(formData.get("controlCategory") ?? undefined),
      controlType: toOptionalString(formData.get("controlType") ?? undefined),
      brandId: toOptionalNumber(formData.get("brandId") ?? undefined),
      departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
      locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
      ownerUserId: toOptionalNumber(formData.get("ownerUserId") ?? undefined),
      status: String(formData.get("status") ?? "Draft"),
      reviewFrequencyDays: toOptionalNumber(formData.get("reviewFrequencyDays") ?? undefined),
      description: toOptionalString(formData.get("description") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/controls");
  revalidateTag("controls:list", "max");
  redirect("/controls");
}

export async function updateControlFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const controlId = Number(formData.get("controlId") ?? 0);

  await updateControlRecord(
    {
      controlId,
      controlCode: String(formData.get("controlCode") ?? ""),
      controlName: String(formData.get("controlName") ?? ""),
      controlCategory: toOptionalString(formData.get("controlCategory") ?? undefined),
      controlType: toOptionalString(formData.get("controlType") ?? undefined),
      brandId: toOptionalNumber(formData.get("brandId") ?? undefined),
      departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
      locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
      ownerUserId: toOptionalNumber(formData.get("ownerUserId") ?? undefined),
      status: String(formData.get("status") ?? "Draft"),
      reviewFrequencyDays: toOptionalNumber(formData.get("reviewFrequencyDays") ?? undefined),
      description: toOptionalString(formData.get("description") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/controls");
  revalidatePath(`/controls/${controlId}`);
  revalidateTag("controls:list", "max");
}

export async function linkControlToSopFormAction(formData: FormData): Promise<void> {
  const sopId = Number(formData.get("sopId") ?? 0);
  const controlId = Number(formData.get("controlId") ?? 0);
  const linkRole = toOptionalString(formData.get("linkRole") ?? undefined) ?? "COVERS";
  const isPrimary = String(formData.get("isPrimary") ?? "false") === "true";
  const session = await requireCurrentSession();

  await linkControlToSop(
    {
      sopId,
      controlId,
      linkRole,
      isPrimary,
    },
    session.user,
  );

  revalidatePath("/controls");
  revalidatePath(`/sops/${sopId}`);
  revalidatePath(`/controls/${controlId}`);
  revalidateTag("controls:list", "max");
  revalidateTag("sops:list", "max");
}

export async function linkControlToDocumentFormAction(formData: FormData): Promise<void> {
  const documentId = Number(formData.get("documentId") ?? 0);
  const controlId = Number(formData.get("controlId") ?? 0);
  const linkRole = toOptionalString(formData.get("linkRole") ?? undefined) ?? "SUPPORTS";
  const isPrimary = String(formData.get("isPrimary") ?? "false") === "true";
  const session = await requireCurrentSession();

  await linkControlToDocument(
    {
      documentId,
      controlId,
      linkRole,
      isPrimary,
    },
    session.user,
  );

  revalidatePath("/controls");
  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");
  revalidatePath(`/controls/${controlId}`);
  revalidateTag("controls:list", "max");
  revalidateTag("documents:list", "max");
}