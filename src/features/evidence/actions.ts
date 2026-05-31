"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createDocumentRecord, transitionDocumentVersionRecord, updateDocumentRecord } from "@/features/evidence/service";
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

export async function createDocumentFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();

  await createDocumentRecord(
    {
      documentCode: toOptionalString(formData.get("documentCode") ?? undefined),
      documentName: String(formData.get("documentName") ?? ""),
      documentType: String(formData.get("documentType") ?? ""),
      category: toOptionalString(formData.get("category") ?? undefined),
      brandId: toOptionalNumber(formData.get("brandId") ?? undefined),
      departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
      locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
      ownerUserId: toOptionalNumber(formData.get("ownerUserId") ?? undefined),
      status: String(formData.get("status") ?? "Draft"),
      issueDate: toOptionalString(formData.get("issueDate") ?? undefined),
      expiryDate: toOptionalString(formData.get("expiryDate") ?? undefined),
      reviewDate: toOptionalString(formData.get("reviewDate") ?? undefined),
      sourceType: toOptionalString(formData.get("sourceType") ?? undefined),
      remarks: toOptionalString(formData.get("remarks") ?? undefined),
      fileName: toOptionalString(formData.get("fileName") ?? undefined),
      fileUrl: toOptionalString(formData.get("fileUrl") ?? undefined),
      fileSize: toOptionalNumber(formData.get("fileSize") ?? undefined),
      mimeType: toOptionalString(formData.get("mimeType") ?? undefined),
      versionNo: toOptionalString(formData.get("versionNo") ?? undefined),
      versionStatus: toOptionalString(formData.get("versionStatus") ?? undefined),
      storageProvider: toOptionalString(formData.get("storageProvider") ?? undefined),
      storageDriveId: toOptionalString(formData.get("storageDriveId") ?? undefined),
      storageItemId: toOptionalString(formData.get("storageItemId") ?? undefined),
      storagePath: toOptionalString(formData.get("storagePath") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/documents");
  revalidateTag("documents:list", "max");
  redirect("/documents");
}

export async function updateDocumentFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const documentId = Number(formData.get("documentId") ?? 0);

  await updateDocumentRecord(
    {
      documentId,
      documentCode: toOptionalString(formData.get("documentCode") ?? undefined),
      documentName: String(formData.get("documentName") ?? ""),
      documentType: String(formData.get("documentType") ?? ""),
      category: toOptionalString(formData.get("category") ?? undefined),
      brandId: toOptionalNumber(formData.get("brandId") ?? undefined),
      departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
      locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
      ownerUserId: toOptionalNumber(formData.get("ownerUserId") ?? undefined),
      status: String(formData.get("status") ?? "Draft"),
      issueDate: toOptionalString(formData.get("issueDate") ?? undefined),
      expiryDate: toOptionalString(formData.get("expiryDate") ?? undefined),
      reviewDate: toOptionalString(formData.get("reviewDate") ?? undefined),
      sourceType: toOptionalString(formData.get("sourceType") ?? undefined),
      remarks: toOptionalString(formData.get("remarks") ?? undefined),
      fileName: toOptionalString(formData.get("fileName") ?? undefined),
      fileUrl: toOptionalString(formData.get("fileUrl") ?? undefined),
      fileSize: toOptionalNumber(formData.get("fileSize") ?? undefined),
      mimeType: toOptionalString(formData.get("mimeType") ?? undefined),
      versionNo: toOptionalString(formData.get("versionNo") ?? undefined),
      versionStatus: toOptionalString(formData.get("versionStatus") ?? undefined),
      storageProvider: toOptionalString(formData.get("storageProvider") ?? undefined),
      storageDriveId: toOptionalString(formData.get("storageDriveId") ?? undefined),
      storageItemId: toOptionalString(formData.get("storageItemId") ?? undefined),
      storagePath: toOptionalString(formData.get("storagePath") ?? undefined),
    },
    session.user,
  );

  revalidatePath("/documents");
  revalidatePath(`/documents/${documentId}`);
  revalidateTag("documents:list", "max");
}

export async function transitionDocumentVersionFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  const documentId = Number(formData.get("documentId") ?? 0);

  await transitionDocumentVersionRecord(
    {
      documentId,
      status: String(formData.get("status") ?? "") as Parameters<typeof transitionDocumentVersionRecord>[0]["status"],
    },
    session.user,
  );

  revalidatePath("/documents");
  revalidatePath(`/documents/${documentId}`);
  revalidateTag("documents:list", "max");
}