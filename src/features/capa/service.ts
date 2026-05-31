import {
  createCorrectiveAction,
  getCorrectiveActionById,
  listCorrectiveActions,
  updateCorrectiveAction,
} from "@/features/capa/repository";
import { unstable_cache } from "next/cache";
import type {
  CorrectiveActionRecord,
  CreateCorrectiveActionInput,
  UpdateCorrectiveActionInput,
} from "@/features/capa/types";
import { capaFormSchema, updateCapaFormSchema } from "@/features/capa/validators";
import { canReadScope, type SessionUser } from "@/lib/auth/rbac";

const listCapaRecordsCached = unstable_cache(listCorrectiveActions, ["capa-list"], { tags: ["capa:list"] });

function filterCapaRecords(records: CorrectiveActionRecord[], user?: SessionUser): CorrectiveActionRecord[] {
  if (!user) {
    return records;
  }

  return records.filter((record) =>
    canReadScope(user, {
      brandId: record.brandId,
      departmentId: record.departmentId,
      locationId: record.locationId,
      assignedTo: record.assignedTo,
    }),
  );
}

export async function listCapaRecords(user?: SessionUser): Promise<CorrectiveActionRecord[]> {
  return filterCapaRecords(await listCapaRecordsCached(), user);
}

export async function getCapaRecord(actionId: number, user?: SessionUser): Promise<CorrectiveActionRecord | null> {
  const record = await getCorrectiveActionById(actionId);

  if (!record) {
    return null;
  }

  return filterCapaRecords([record], user)[0] ?? null;
}

export async function createCapaRecord(input: CreateCorrectiveActionInput, actor: SessionUser): Promise<void> {
  const parsed = capaFormSchema.parse(input);
  await createCorrectiveAction(parsed, actor.id);
}

export async function updateCapaRecord(input: UpdateCorrectiveActionInput, actor: SessionUser): Promise<void> {
  const parsed = updateCapaFormSchema.parse(input);
  const existing = await getCorrectiveActionById(parsed.actionId);

  if (!existing) {
    throw new Error("Corrective action was not found.");
  }

  await updateCorrectiveAction(parsed, actor.id);
}
