import {
  addChecklistItem,
  createAudit,
  createAuditTemplate,
  getAuditById,
  listAuditResponses,
  listAudits,
  listAuditTemplates,
  listChecklistItemsByTemplate,
  saveAuditResponses,
} from "@/features/audits/repository";
import { unstable_cache } from "next/cache";
import type {
  AddChecklistItemInput,
  AuditRecord,
  AuditResponseRecord,
  AuditTemplateRecord,
  ChecklistItemRecord,
  CreateAuditInput,
  CreateAuditTemplateInput,
  SaveAuditResponsesInput,
} from "@/features/audits/types";
import {
  addChecklistItemSchema,
  auditFormSchema,
  auditTemplateFormSchema,
  saveAuditResponsesSchema,
} from "@/features/audits/validators";
import { canReadScope, hasRole, type SessionUser } from "@/lib/auth/rbac";

const listAuditRecordsCached = unstable_cache(listAudits, ["audits-list"], { tags: ["audits:list"] });
const listAuditTemplateRecordsCached = unstable_cache(listAuditTemplates, ["audit-templates-list"], {
  tags: ["audits:templates"],
});

function filterAuditRecords(records: AuditRecord[], user?: SessionUser): AuditRecord[] {
  if (!user) {
    return records;
  }

  return records.filter((record) =>
    canReadScope(user, {
      brandId: record.brandId,
      departmentId: record.departmentId,
      locationId: record.locationId,
      assignedTo: record.performedByUserId,
    }),
  );
}

export async function listAuditRecords(user?: SessionUser): Promise<AuditRecord[]> {
  return filterAuditRecords(await listAuditRecordsCached(), user);
}

export async function listAuditTemplateRecords(): Promise<AuditTemplateRecord[]> {
  return listAuditTemplateRecordsCached();
}

export async function createAuditTemplateRecord(input: CreateAuditTemplateInput, createdBy: number): Promise<void> {
  const parsed = auditTemplateFormSchema.parse(input);
  await createAuditTemplate(parsed, createdBy);
}

function ensureAuditScope(user: SessionUser, scope: { brandId?: number; departmentId?: number; locationId?: number }): void {
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

  throw new Error("The selected audit scope is outside your permitted access range.");
}

export async function createAuditRecord(input: CreateAuditInput, actor: SessionUser): Promise<void> {
  const parsed = auditFormSchema.parse(input);
  ensureAuditScope(actor, {
    brandId: parsed.brandId,
    departmentId: parsed.departmentId,
    locationId: parsed.locationId,
  });

  await createAudit(parsed, actor.id);
}

export async function getAuditRecord(auditId: number, user?: SessionUser): Promise<AuditRecord | null> {
  const record = await getAuditById(auditId);

  if (!record) {
    return null;
  }

  return filterAuditRecords([record], user)[0] ?? null;
}

export async function getChecklistItems(templateId: number): Promise<ChecklistItemRecord[]> {
  return listChecklistItemsByTemplate(templateId);
}

export async function getAuditResponses(auditId: number): Promise<AuditResponseRecord[]> {
  return listAuditResponses(auditId);
}

export async function saveAuditResponsesRecord(input: SaveAuditResponsesInput, actor: SessionUser): Promise<void> {
  const parsed = saveAuditResponsesSchema.parse(input);
  const audit = await getAuditById(parsed.auditId);

  if (!audit) {
    throw new Error("Audit was not found.");
  }

  if (audit.status === "Completed") {
    throw new Error("This audit is already completed and cannot be modified.");
  }

  if (!hasRole(actor, ["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"])) {
    ensureAuditScope(actor, {
      brandId: audit.brandId ?? undefined,
      departmentId: audit.departmentId ?? undefined,
      locationId: audit.locationId ?? undefined,
    });
  }

  const items = await listChecklistItemsByTemplate(audit.templateId);
  await saveAuditResponses(parsed, items);
}

export async function addChecklistItemRecord(input: AddChecklistItemInput): Promise<void> {
  const parsed = addChecklistItemSchema.parse(input);
  await addChecklistItem(parsed);
}