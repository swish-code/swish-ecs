import { unstable_cache } from "next/cache";
import { filterUserRecords, getUserRecords } from "@/features/admin/service";
import { createControl, getControlById, listControlLinks, listControls, listControlsForEntity, updateControl, upsertControlLink } from "@/features/controls/repository";
import type { ControlLinkRecord, ControlRecord, CreateControlInput, RelatedControlRecord, UpdateControlInput } from "@/features/controls/types";
import { controlFormSchema } from "@/features/controls/validators";
import { canReadScope, hasRole, type SessionUser } from "@/lib/auth/rbac";
import { getSopById } from "@/features/sops/repository";
import { getDocumentById } from "@/features/evidence/repository";

const listControlRecordsCached = unstable_cache(listControls, ["controls-list"], { tags: ["controls:list"] });

function filterControlRecords(records: ControlRecord[], user?: SessionUser): ControlRecord[] {
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

export async function listControlRecords(user?: SessionUser): Promise<ControlRecord[]> {
  return filterControlRecords(await listControlRecordsCached(), user);
}

export async function getControlRecord(controlId: number, user?: SessionUser): Promise<ControlRecord | null> {
  const record = await getControlById(controlId);

  if (!record) {
    return null;
  }

  return filterControlRecords([record], user)[0] ?? null;
}

export async function listControlLinkRecords(controlId: number, user?: SessionUser): Promise<ControlLinkRecord[]> {
  const record = await getControlById(controlId);

  if (!record) {
    return [];
  }

  if (!filterControlRecords([record], user)[0]) {
    return [];
  }

  return listControlLinks(controlId);
}

export async function listRelatedControlRecords(entityType: string, entityId: number, user?: SessionUser): Promise<RelatedControlRecord[]> {
  const records = await listControlsForEntity(entityType, entityId);

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

function ensureControlAccess(user: SessionUser, record: Pick<ControlRecord, "brandId" | "departmentId" | "locationId" | "ownerUserId">): void {
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

  throw new Error("You do not have permission to manage this control link.");
}

function ensureScopeSelection(
  user: SessionUser,
  scope: { brandId?: number; departmentId?: number; locationId?: number; ownerUserId?: number },
): void {
  if (hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    return;
  }

  if (
    canReadScope(user, {
      brandId: scope.brandId,
      departmentId: scope.departmentId,
      locationId: scope.locationId,
      assignedTo: scope.ownerUserId,
    })
  ) {
    return;
  }

  throw new Error("The selected control scope is outside your permitted access range.");
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

export async function createControlRecord(input: CreateControlInput, actor: SessionUser): Promise<void> {
  const parsed = controlFormSchema.parse(input);

  ensureScopeSelection(actor, {
    brandId: parsed.brandId,
    departmentId: parsed.departmentId,
    locationId: parsed.locationId,
    ownerUserId: parsed.ownerUserId,
  });
  await ensureOwnerSelection(actor, parsed.ownerUserId);

  await createControl(parsed, actor.id);
}

export async function updateControlRecord(input: UpdateControlInput, actor: SessionUser): Promise<void> {
  const parsed = controlFormSchema.parse(input);
  const existing = await getControlById(input.controlId);

  if (!existing) {
    throw new Error("Control record was not found.");
  }

  ensureControlAccess(actor, existing);
  ensureScopeSelection(actor, {
    brandId: parsed.brandId,
    departmentId: parsed.departmentId,
    locationId: parsed.locationId,
    ownerUserId: parsed.ownerUserId,
  });
  await ensureOwnerSelection(actor, parsed.ownerUserId);

  await updateControl({ ...parsed, controlId: input.controlId }, actor.id);
}

export async function linkControlToSop(
  input: { sopId: number; controlId: number; linkRole: string; isPrimary: boolean },
  actor: SessionUser,
): Promise<void> {
  const [sop, control] = await Promise.all([getSopById(input.sopId), getControlById(input.controlId)]);

  if (!sop) {
    throw new Error("SOP record was not found.");
  }

  if (!control) {
    throw new Error("Control record was not found.");
  }

  ensureControlAccess(actor, control);

  if (
    !canReadScope(actor, {
      brandId: sop.brandId,
      departmentId: sop.departmentId,
      locationId: sop.locationId,
      assignedTo: sop.ownerUserId,
    }) && !hasRole(actor, ["ADMIN", "BUSINESS_EXCELLENCE"])
  ) {
    throw new Error("You do not have permission to manage this SOP control link.");
  }

  await upsertControlLink({
    controlId: input.controlId,
    entityType: "SOP",
    entityId: input.sopId,
    linkRole: input.linkRole,
    isPrimary: input.isPrimary,
  });
}

export async function linkControlToDocument(
  input: { documentId: number; controlId: number; linkRole: string; isPrimary: boolean },
  actor: SessionUser,
): Promise<void> {
  const [document, control] = await Promise.all([getDocumentById(input.documentId), getControlById(input.controlId)]);

  if (!document) {
    throw new Error("Document record was not found.");
  }

  if (!control) {
    throw new Error("Control record was not found.");
  }

  ensureControlAccess(actor, control);

  if (
    !canReadScope(actor, {
      brandId: document.brandId,
      departmentId: document.departmentId,
      locationId: document.locationId,
      assignedTo: document.ownerUserId,
    }) && !hasRole(actor, ["ADMIN", "BUSINESS_EXCELLENCE"])
  ) {
    throw new Error("You do not have permission to manage this document control link.");
  }

  await upsertControlLink({
    controlId: input.controlId,
    entityType: "DOCUMENT",
    entityId: input.documentId,
    linkRole: input.linkRole,
    isPrimary: input.isPrimary,
  });
}