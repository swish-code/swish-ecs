import { createAssignment, getAssignmentById, listAssignments, updateAssignment } from "@/features/assignments/repository";
import { filterUserRecords, getUserRecords } from "@/features/admin/service";
import { getOrCreateBrandId, getOrCreateDepartmentId, getOrCreateLocationId } from "@/features/admin/repository";
import { unstable_cache } from "next/cache";
import type { AssignmentRecord, CreateAssignmentInput, UpdateAssignmentInput } from "@/features/assignments/types";
import { getSopRecord } from "@/features/sops/service";
import { assignmentFormSchema, updateAssignmentFormSchema } from "@/features/assignments/validators";
import { canReadScope, hasRole, type SessionUser } from "@/lib/auth/rbac";

const listAssignmentRecordsCached = unstable_cache(listAssignments, ["assignments-list"], { tags: ["assignments:list"] });

function filterAssignmentRecords(records: AssignmentRecord[], user?: SessionUser): AssignmentRecord[] {
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

export async function listAssignmentRecords(user?: SessionUser): Promise<AssignmentRecord[]> {
  return filterAssignmentRecords(await listAssignmentRecordsCached(), user);
}

function ensureAssignmentScope(user: SessionUser, scope: { brandId: number; departmentId?: number; locationId?: number }): void {
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

  throw new Error("The selected assignment scope is outside your permitted access range.");
}

async function ensureAssignmentOwner(user: SessionUser, ownerUserId?: number): Promise<void> {
  if (!ownerUserId) {
    return;
  }

  const scopedUsers = filterUserRecords(await getUserRecords(), user);

  if (!scopedUsers.some((record) => record.userId === ownerUserId)) {
    throw new Error("The selected assignment owner is outside your permitted access range.");
  }
}

export async function createAssignmentRecord(input: CreateAssignmentInput, actor: SessionUser): Promise<void> {
  const parsed = assignmentFormSchema.parse(input);
  const brandId = parsed.brandName ? await getOrCreateBrandId(parsed.brandName) : parsed.brandId;
  const departmentId = parsed.departmentName ? await getOrCreateDepartmentId(parsed.departmentName) : parsed.departmentId;
  const locationId = parsed.locationName ? await getOrCreateLocationId(parsed.locationName) : parsed.locationId;
  const sop = await getSopRecord(parsed.sopId, actor);

  if (!sop) {
    throw new Error("The selected SOP was not found.");
  }

  if (!["Approved", "Active"].includes(sop.status)) {
    throw new Error("Only approved or active SOPs can be assigned for implementation.");
  }

  ensureAssignmentScope(actor, {
    brandId,
    departmentId,
    locationId,
  });
  await ensureAssignmentOwner(actor, parsed.ownerUserId);

  await createAssignment(
    {
      ...parsed,
      brandId,
      departmentId,
      locationId,
    },
    actor.id,
  );
}

export async function getAssignmentRecord(assignmentId: number, user?: SessionUser): Promise<AssignmentRecord | null> {
  const record = await getAssignmentById(assignmentId);

  if (!record) {
    return null;
  }

  return filterAssignmentRecords([record], user)[0] ?? null;
}

export async function updateAssignmentRecord(input: UpdateAssignmentInput, actor: SessionUser): Promise<void> {
  const parsed = updateAssignmentFormSchema.parse(input);
  const existing = await getAssignmentById(parsed.assignmentId);

  if (!existing) {
    throw new Error("Assignment was not found.");
  }

  if (!hasRole(actor, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    const accessible = filterAssignmentRecords([existing], actor);

    if (accessible.length === 0) {
      throw new Error("You do not have permission to update this assignment.");
    }
  }

  await updateAssignment(parsed, actor.id);
}