import {
  createSop,
  getSopById,
  listSopVersions,
  listSops,
  updateSop,
  updateSopApprovalStatus,
} from "@/features/sops/repository";
import { filterUserRecords, getUserRecords } from "@/features/admin/service";
import { getOrCreateBrandId, getOrCreateDepartmentId, getOrCreateLocationId } from "@/features/admin/repository";
import { unstable_cache } from "next/cache";
import { sendWorkflowNotification } from "@/features/notifications/service";
import type { CreateSopInput, SopApprovalInput, SopRecord, SopVersionRecord, UpdateSopInput } from "@/features/sops/types";
import { sopApprovalSchema, sopFormSchema } from "@/features/sops/validators";
import { canReadScope, hasRole, type SessionUser } from "@/lib/auth/rbac";

const listSopRecordsCached = unstable_cache(listSops, ["sops-list"], { tags: ["sops:list"] });

const allowedTransitions: Record<SopRecord["status"], SopApprovalInput["status"][]> = {
  Draft: ["Submitted", "Archived"],
  Submitted: ["Approved", "Rejected", "Archived"],
  Approved: ["Active", "Archived"],
  Rejected: ["Submitted", "Archived"],
  Active: ["Archived"],
  Archived: [],
};

function filterSopRecords(records: SopRecord[], user?: SessionUser): SopRecord[] {
  if (!user) {
    return records;
  }

  return records.filter((record) =>
    canReadScope(user, {
      brandId: record.brandId,
      departmentId: record.departmentId,
      locationId: record.locationId,
      assignedTo: record.ownerUserId,
    }),
  );
}

export async function listSopRecords(user?: SessionUser): Promise<SopRecord[]> {
  return filterSopRecords(await listSopRecordsCached(), user);
}

export async function getSopRecord(sopId: number, user?: SessionUser): Promise<SopRecord | null> {
  const record = await getSopById(sopId);

  if (!record) {
    return null;
  }

  return filterSopRecords([record], user)[0] ?? null;
}

export async function listSopVersionRecords(sopId: number, user?: SessionUser): Promise<SopVersionRecord[]> {
  const record = await getSopById(sopId);

  if (!record) {
    return [];
  }

  if (!filterSopRecords([record], user)[0]) {
    return [];
  }

  return listSopVersions(sopId);
}

function ensureSopAccess(user: SessionUser, record: SopRecord): void {
  if (hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    return;
  }

  if (
    canReadScope(user, {
      brandId: record.brandId,
      departmentId: record.departmentId,
      locationId: record.locationId,
      assignedTo: record.ownerUserId,
    })
  ) {
    return;
  }

  throw new Error("You do not have permission to access this SOP record.");
}

function ensureScopeSelection(user: SessionUser, scope: { brandId: number; departmentId?: number; locationId?: number }): void {
  if (hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    return;
  }

  if (
    canReadScope(user, {
      brandId: scope.brandId,
      departmentId: scope.departmentId,
      locationId: scope.locationId,
    })
  ) {
    return;
  }

  throw new Error("The selected scope is outside your permitted access range.");
}

async function ensureOwnerSelection(user: SessionUser, ownerUserId?: number): Promise<void> {
  if (!ownerUserId) {
    return;
  }

  const scopedUsers = filterUserRecords(await getUserRecords(), user);

  if (!scopedUsers.some((record) => record.userId === ownerUserId)) {
    throw new Error("The selected owner is outside your permitted access range.");
  }
}

export async function updateSopRecord(input: UpdateSopInput, actor: SessionUser): Promise<void> {
  const parsed = sopFormSchema.parse(input);
  const existingRecord = await getSopById(input.sopId);

  if (!existingRecord) {
    throw new Error("SOP record was not found.");
  }

  ensureSopAccess(actor, existingRecord);
  ensureScopeSelection(actor, {
    brandId: parsed.brandId,
    departmentId: parsed.departmentId,
    locationId: parsed.locationId,
  });
  await ensureOwnerSelection(actor, parsed.ownerUserId);

  if (parsed.status === "Submitted" && (!parsed.fileName || !parsed.fileUrl)) {
    throw new Error("A main file is required before submitting an SOP.");
  }

  if (parsed.fileUrl && parsed.storageProvider?.toUpperCase() !== "SHAREPOINT") {
    throw new Error("SharePoint should be used as the storage provider for managed SOP files.");
  }

  const createNewVersion = parsed.versionNo !== existingRecord.versionNo;
  const nextRecord = createNewVersion
    ? {
        ...parsed,
        status: "Draft" as const,
      }
    : parsed;

  await updateSop({ ...nextRecord, sopId: input.sopId }, actor.id, { createNewVersion });
}

export async function transitionSopRecord(input: SopApprovalInput, actor: SessionUser): Promise<void> {
  const parsed = sopApprovalSchema.parse(input);
  const record = await getSopById(parsed.sopId);

  if (!record) {
    throw new Error("SOP record was not found.");
  }

  ensureSopAccess(actor, record);

  if (!allowedTransitions[record.status].includes(parsed.status)) {
    throw new Error(`Invalid SOP transition from ${record.status} to ${parsed.status}.`);
  }

  if (parsed.status === "Submitted" && (!record.fileName || !record.fileUrl)) {
    throw new Error("A main file is required before submitting an SOP.");
  }

  await updateSopApprovalStatus(parsed, actor.id);

  if (["Submitted", "Approved", "Rejected", "Active", "Archived"].includes(parsed.status)) {
    await sendWorkflowNotification({
      event: parsed.status,
      entityType: "SOP",
      entityId: parsed.sopId,
      title: record.title,
      remarks: parsed.approvalRemarks,
    });
  }
}

export async function createSopRecord(input: CreateSopInput, actor: SessionUser): Promise<void> {
  const parsed = sopFormSchema.parse(input);
  const brandId = parsed.brandName ? await getOrCreateBrandId(parsed.brandName) : parsed.brandId;
  const departmentId = parsed.departmentName ? await getOrCreateDepartmentId(parsed.departmentName) : parsed.departmentId;
  const locationId = parsed.locationName ? await getOrCreateLocationId(parsed.locationName) : parsed.locationId;

  if (parsed.status === "Submitted" && (!parsed.fileName || !parsed.fileUrl)) {
    throw new Error("A main file is required before submitting an SOP.");
  }

  if (parsed.fileUrl && parsed.storageProvider?.toUpperCase() !== "SHAREPOINT") {
    throw new Error("SharePoint should be used as the storage provider for managed SOP files.");
  }

  ensureScopeSelection(actor, {
    brandId,
    departmentId,
    locationId,
  });
  await ensureOwnerSelection(actor, parsed.ownerUserId);

  await createSop(
    {
      ...parsed,
      brandId,
      departmentId,
      locationId,
    },
    actor.id,
  );
}
