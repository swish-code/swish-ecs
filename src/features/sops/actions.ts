"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createSopRecord, getSopRecord, transitionSopRecord, updateSopRecord } from "@/features/sops/service";
import type { CreateSopInput, SopApprovalInput, UpdateSopInput } from "@/features/sops/types";
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

function mapFormDataToSopInput(formData: FormData): CreateSopInput {
  return {
    documentNo: String(formData.get("documentNo") ?? ""),
    documentType: String(formData.get("documentType") ?? ""),
    title: String(formData.get("title") ?? ""),
    brandId: Number(formData.get("brandId") ?? 0),
    brandName: toOptionalString(formData.get("brandName") ?? undefined),
    departmentId: toOptionalNumber(formData.get("departmentId") ?? undefined),
    departmentName: toOptionalString(formData.get("departmentName") ?? undefined),
    locationId: toOptionalNumber(formData.get("locationId") ?? undefined),
    locationName: toOptionalString(formData.get("locationName") ?? undefined),
    complianceArea: String(formData.get("complianceArea") ?? ""),
    ownerUserId: toOptionalNumber(formData.get("ownerUserId") ?? undefined),
    versionNo: String(formData.get("versionNo") ?? ""),
    status: String(formData.get("status") ?? "Draft") as CreateSopInput["status"],
    fileName: toOptionalString(formData.get("fileName") ?? undefined),
    fileUrl: toOptionalString(formData.get("fileUrl") ?? undefined),
    fileSize: toOptionalNumber(formData.get("fileSize") ?? undefined),
    mimeType: toOptionalString(formData.get("mimeType") ?? undefined),
    storageProvider: toOptionalString(formData.get("storageProvider") ?? undefined),
    storageDriveId: toOptionalString(formData.get("storageDriveId") ?? undefined),
    storageItemId: toOptionalString(formData.get("storageItemId") ?? undefined),
    storagePath: toOptionalString(formData.get("storagePath") ?? undefined),
    remarks: toOptionalString(formData.get("remarks") ?? undefined),
  };
}

export async function createSopAction(input: CreateSopInput): Promise<void> {
  const session = await requireCurrentSession();
  await createSopRecord(input, session.user);
  revalidatePath("/sops");
  revalidateTag("sops:list", "max");
}

export async function updateSopAction(input: UpdateSopInput): Promise<void> {
  const session = await requireCurrentSession();
  await updateSopRecord(input, session.user);
  revalidatePath("/sops");
  revalidatePath(`/sops/${input.sopId}`);
  revalidateTag("sops:list", "max");
}

export async function createSopFormAction(formData: FormData): Promise<void> {
  const session = await requireCurrentSession();
  await createSopRecord(mapFormDataToSopInput(formData), session.user);
  revalidatePath("/sops");
  revalidateTag("sops:list", "max");
}

export async function updateSopFormAction(formData: FormData): Promise<void> {
  const sopId = Number(formData.get("sopId") ?? 0);
  const session = await requireCurrentSession();

  await updateSopRecord(
    {
      ...mapFormDataToSopInput(formData),
      sopId,
    },
    session.user,
  );

  revalidatePath("/sops");
  revalidatePath(`/sops/${sopId}`);
  revalidateTag("sops:list", "max");
}

export async function createSopVersionDraftFormAction(formData: FormData): Promise<void> {
  const sopId = Number(formData.get("sopId") ?? 0);
  const versionNo = String(formData.get("versionNo") ?? "");
  const remarks = toOptionalString(formData.get("remarks") ?? undefined);
  const session = await requireCurrentSession();
  const record = await getSopRecord(sopId, session.user);

  if (!record) {
    throw new Error("SOP record was not found.");
  }

  if (!record.brandId) {
    throw new Error("SOP record is missing a brand scope.");
  }

  await updateSopRecord(
    {
      sopId,
      documentNo: record.documentNo,
      documentType: record.documentType,
      title: record.title,
      brandId: record.brandId,
      departmentId: record.departmentId ?? undefined,
      locationId: record.locationId ?? undefined,
      complianceArea: record.complianceArea,
      ownerUserId: record.ownerUserId ?? undefined,
      versionNo,
      status: "Draft",
      fileName: record.fileName ?? undefined,
      fileUrl: record.fileUrl ?? undefined,
      fileSize: record.fileSize ?? undefined,
      mimeType: record.mimeType ?? undefined,
      storageProvider: record.storageProvider ?? undefined,
      storageDriveId: record.storageDriveId ?? undefined,
      storageItemId: record.storageItemId ?? undefined,
      storagePath: record.storagePath ?? undefined,
      remarks: remarks ?? record.remarks ?? undefined,
    },
    session.user,
  );

  revalidatePath("/sops");
  revalidatePath(`/sops/${sopId}`);
  revalidateTag("sops:list", "max");
}

export async function transitionSopAction(input: SopApprovalInput): Promise<void> {
  const session = await requireCurrentSession();
  await transitionSopRecord(input, session.user);
  revalidatePath("/sops");
  revalidatePath(`/sops/${input.sopId}`);
  revalidateTag("sops:list", "max");
}

export async function transitionSopFormAction(formData: FormData): Promise<void> {
  const sopId = Number(formData.get("sopId") ?? 0);
  const status = String(formData.get("status") ?? "") as SopApprovalInput["status"];
  const approvalRemarks = toOptionalString(formData.get("approvalRemarks") ?? undefined);
  const session = await requireCurrentSession();

  await transitionSopRecord(
    {
      sopId,
      status,
      approvalRemarks,
    },
    session.user,
  );

  revalidatePath("/sops");
  revalidatePath(`/sops/${sopId}`);
  revalidateTag("sops:list", "max");
}
