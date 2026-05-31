import { unstable_cache } from "next/cache";
import { filterUserRecords, getUserRecords } from "@/features/admin/service";
import { listAuditRecords } from "@/features/audits/service";
import { listCheckRecords } from "@/features/checks/service";
import type { RelatedControlRecord } from "@/features/controls/types";
import {
  createDocument,
  getDocumentById,
  listDocuments,
  listDocumentVersions,
  transitionCurrentDocumentVersion,
  updateDocument,
} from "@/features/evidence/repository";
import type {
  CreateDocumentInput,
  DocumentAuditUsageRecord,
  DocumentRecord,
  DocumentVersionRecord,
  DocumentVersionTransitionInput,
  UpdateDocumentInput,
} from "@/features/evidence/types";
import { documentFormSchema, documentVersionTransitionSchema } from "@/features/evidence/validators";
import { canReadScope, hasRole, type SessionUser } from "@/lib/auth/rbac";

const listDocumentRecordsCached = unstable_cache(listDocuments, ["documents-list"], { tags: ["documents:list"] });

const allowedVersionTransitions: Record<string, DocumentVersionTransitionInput["status"][]> = {
  Draft: ["Pending Review"],
  "Pending Review": ["Approved", "Rejected", "Flagged"],
  Approved: ["Flagged", "Ready For Audit"],
  Rejected: ["Pending Review"],
  Flagged: ["Pending Review", "Ready For Audit"],
  "Ready For Audit": ["Approved", "Flagged"],
};

function filterDocumentRecords(records: DocumentRecord[], user?: SessionUser): DocumentRecord[] {
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

export async function listDocumentRecords(user?: SessionUser): Promise<DocumentRecord[]> {
  return filterDocumentRecords(await listDocumentRecordsCached(), user);
}

export async function getDocumentRecord(documentId: number, user?: SessionUser): Promise<DocumentRecord | null> {
  const record = await getDocumentById(documentId);

  if (!record) {
    return null;
  }

  return filterDocumentRecords([record], user)[0] ?? null;
}

export async function listDocumentVersionRecords(documentId: number, user?: SessionUser): Promise<DocumentVersionRecord[]> {
  const record = await getDocumentById(documentId);

  if (!record) {
    return [];
  }

  if (!filterDocumentRecords([record], user)[0]) {
    return [];
  }

  return listDocumentVersions(documentId);
}

function isDocumentScopedEntityMatch(documentId: number, entityType: string | null, entityId: number | null): boolean {
  return ["DOCUMENT", "DOCUMENTS"].includes((entityType ?? "").toUpperCase()) && entityId === documentId;
}

function isWithinDocumentScope(
  record: Pick<DocumentRecord, "brandId" | "departmentId" | "locationId">,
  target: { brandId: number | null; departmentId: number | null; locationId: number | null },
): boolean {
  if (record.brandId !== null && target.brandId !== record.brandId) {
    return false;
  }

  if (record.departmentId !== null && target.departmentId !== record.departmentId) {
    return false;
  }

  if (record.locationId !== null && target.locationId !== record.locationId) {
    return false;
  }

  return true;
}

function rankCheckUsage(status: string | null, isDirectDocumentCheck: boolean): number {
  if (isDirectDocumentCheck) {
    return 0;
  }

  switch ((status ?? "").toUpperCase()) {
    case "FAIL":
    case "FAILING":
    case "NEEDS REVIEW":
    case "OVERDUE":
    case "PENDING REVIEW":
    case "PENDING EVIDENCE":
      return 1;
    case "PASS":
    case "APPROVED":
    case "PASSING":
      return 2;
    case "ACCEPTED RISK":
      return 3;
    default:
      return 4;
  }
}

export async function getDocumentAuditUsageRecord(
  record: DocumentRecord,
  controls: RelatedControlRecord[],
  user?: SessionUser,
): Promise<DocumentAuditUsageRecord> {
  const [checks, audits] = await Promise.all([listCheckRecords(user), listAuditRecords(user)]);
  const controlIds = new Set(controls.map((control) => control.controlId));

  const checkUsages = checks
    .filter((check) => controlIds.has(check.controlId) || isDocumentScopedEntityMatch(record.documentId, check.sourceEntityType, check.sourceEntityId))
    .map((check) => ({
      checkId: check.checkId,
      controlId: check.controlId,
      controlCode: check.controlCode,
      controlName: check.controlName,
      checkName: check.checkName,
      checkType: check.checkType,
      severity: check.severity,
      latestStatus: check.latestStatus,
      ownerDisplayName: check.ownerDisplayName,
      sourceEntityType: check.sourceEntityType,
      sourceEntityId: check.sourceEntityId,
      lastEvaluatedAt: check.lastEvaluatedAt,
      nextEvaluationAt: check.nextEvaluationAt,
      isDirectDocumentCheck: isDocumentScopedEntityMatch(record.documentId, check.sourceEntityType, check.sourceEntityId),
    }))
    .sort((left, right) => {
      const rankDifference = rankCheckUsage(left.latestStatus, left.isDirectDocumentCheck) - rankCheckUsage(right.latestStatus, right.isDirectDocumentCheck);

      if (rankDifference !== 0) {
        return rankDifference;
      }

      return left.checkName.localeCompare(right.checkName);
    });

  const scopedAudits = audits
    .filter((audit) =>
      isWithinDocumentScope(record, {
        brandId: audit.brandId,
        departmentId: audit.departmentId,
        locationId: audit.locationId,
      }),
    )
    .map((audit) => ({
      auditId: audit.auditId,
      templateName: audit.templateName,
      complianceArea: audit.complianceArea,
      status: audit.status,
      performedByName: audit.performedByName,
      startedAt: audit.startedAt,
      completedAt: audit.completedAt,
      scorePercent: audit.scorePercent,
      brandName: audit.brandName,
      departmentName: audit.departmentName,
      locationName: audit.locationName,
    }))
    .sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime());

  return {
    linkedControlCount: controls.length,
    directCheckCount: checkUsages.filter((check) => check.isDirectDocumentCheck).length,
    scopeAuditCount: scopedAudits.length,
    isAuditReady: ["APPROVED", "READY FOR AUDIT"].includes((record.versionStatus ?? "").toUpperCase()),
    checks: checkUsages,
    audits: scopedAudits,
  };
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

  throw new Error("The selected document scope is outside your permitted access range.");
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

export async function createDocumentRecord(input: CreateDocumentInput, actor: SessionUser): Promise<void> {
  const parsed = documentFormSchema.parse(input);

  ensureScopeSelection(actor, {
    brandId: parsed.brandId,
    departmentId: parsed.departmentId,
    locationId: parsed.locationId,
    ownerUserId: parsed.ownerUserId,
  });
  await ensureOwnerSelection(actor, parsed.ownerUserId);

  await createDocument(parsed, actor.id);
}

export async function updateDocumentRecord(input: UpdateDocumentInput, actor: SessionUser): Promise<void> {
  const parsed = documentFormSchema.parse(input);
  const existing = await getDocumentById(input.documentId);

  if (!existing) {
    throw new Error("Document record was not found.");
  }

  if (!filterDocumentRecords([existing], actor)[0]) {
    throw new Error("You do not have permission to update this document record.");
  }

  ensureScopeSelection(actor, {
    brandId: parsed.brandId,
    departmentId: parsed.departmentId,
    locationId: parsed.locationId,
    ownerUserId: parsed.ownerUserId,
  });
  await ensureOwnerSelection(actor, parsed.ownerUserId);

  await updateDocument({ ...parsed, documentId: input.documentId }, actor.id, existing.currentEvidenceId);
}

export async function transitionDocumentVersionRecord(input: DocumentVersionTransitionInput, actor: SessionUser): Promise<void> {
  const parsed = documentVersionTransitionSchema.parse(input);
  const existing = await getDocumentById(parsed.documentId);

  if (!existing) {
    throw new Error("Document record was not found.");
  }

  if (!filterDocumentRecords([existing], actor)[0]) {
    throw new Error("You do not have permission to update this document record.");
  }

  if (!existing.currentEvidenceId) {
    throw new Error("A current governed file is required before this document can move through review.");
  }

  const currentVersionStatus = existing.versionStatus ?? "Draft";
  const allowedTransitions = allowedVersionTransitions[currentVersionStatus] ?? [];

  if (!allowedTransitions.includes(parsed.status)) {
    throw new Error(`Invalid document version transition from ${currentVersionStatus} to ${parsed.status}.`);
  }

  await transitionCurrentDocumentVersion(parsed, actor.id);
}