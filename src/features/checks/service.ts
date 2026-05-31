import { unstable_cache } from "next/cache";
import { createCheckResult, getCheckById, listCheckResults, listChecks } from "@/features/checks/repository";
import type { CheckRecord, CheckResultRecord, CreateCheckResultInput } from "@/features/checks/types";
import { createCheckResultSchema } from "@/features/checks/validators";
import { canReadScope, hasRole, type SessionUser } from "@/lib/auth/rbac";

const listCheckRecordsCached = unstable_cache(listChecks, ["checks-list"], { tags: ["checks:list"] });

function filterCheckRecords(records: CheckRecord[], user?: SessionUser): CheckRecord[] {
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

function filterCheckResultRecords(records: CheckResultRecord[], check: CheckRecord, user?: SessionUser): CheckResultRecord[] {
  if (!user) {
    return records;
  }

  return records.filter((record) =>
    canReadScope(user, {
      brandId: record.brandId ?? check.brandId,
      departmentId: record.departmentId ?? check.departmentId,
      locationId: record.locationId ?? check.locationId,
      assignedTo: check.ownerUserId,
    }),
  );
}

export async function listCheckRecords(user?: SessionUser): Promise<CheckRecord[]> {
  return filterCheckRecords(await listCheckRecordsCached(), user);
}

export async function getCheckRecord(checkId: number, user?: SessionUser): Promise<CheckRecord | null> {
  const record = await getCheckById(checkId);

  if (!record) {
    return null;
  }

  return filterCheckRecords([record], user)[0] ?? null;
}

export async function listCheckResultRecords(checkId: number, user?: SessionUser): Promise<CheckResultRecord[]> {
  const check = await getCheckById(checkId);

  if (!check) {
    return [];
  }

  if (!filterCheckRecords([check], user)[0]) {
    return [];
  }

  return filterCheckResultRecords(await listCheckResults(checkId), check, user);
}

function ensureCheckAccess(user: SessionUser, record: Pick<CheckRecord, "brandId" | "departmentId" | "locationId" | "ownerUserId">): void {
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

  throw new Error("You do not have permission to record results for this check.");
}

function normalizeTimestamp(value: string | undefined, fieldLabel: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} must be a valid date and time.`);
  }

  return parsed.toISOString();
}

export async function createCheckResultRecord(input: CreateCheckResultInput, actor: SessionUser): Promise<void> {
  const parsed = createCheckResultSchema.parse(input);
  const check = await getCheckById(parsed.checkId);

  if (!check) {
    throw new Error("Check record was not found.");
  }

  ensureCheckAccess(actor, check);

  const targetEntityType = parsed.targetEntityType ?? check.sourceEntityType ?? undefined;
  const targetEntityId = parsed.targetEntityId ?? check.sourceEntityId ?? undefined;

  if (targetEntityId && !targetEntityType) {
    throw new Error("Target entity type is required when a target entity id is provided.");
  }

  await createCheckResult(
    {
      checkId: parsed.checkId,
      status: parsed.status,
      targetEntityType,
      targetEntityId,
      lastEvaluatedAt: normalizeTimestamp(parsed.lastEvaluatedAt, "Last evaluated"),
      nextEvaluationAt: normalizeTimestamp(parsed.nextEvaluationAt, "Next evaluation"),
      detailsText: parsed.detailsText,
    },
    {
      brandId: check.brandId,
      departmentId: check.departmentId,
      locationId: check.locationId,
    },
  );
}