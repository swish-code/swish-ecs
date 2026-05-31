import Link from "next/link";
import { formatKuwaitDate, formatKuwaitDateTime } from "@/lib/time/kuwait";
import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";
import type { DocumentAuditUsageRecord, DocumentRecord, DocumentVersionRecord } from "@/features/evidence/types";
import type { RelatedControlRecord } from "@/features/controls/types";
import { documentStatuses, documentVersionStatuses } from "@/features/evidence/validators";

const documentStatusTone: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-slate-100 text-slate-600",
  "IN REVIEW": "bg-blue-50 text-blue-700",
  APPROVED: "bg-blue-50 text-blue-700",
  FLAGGED: "bg-red-50 text-red-700",
  EXPIRED: "bg-red-50 text-red-700",
  ARCHIVED: "bg-[var(--surface-strong)] text-[var(--muted)]",
};

const documentVersionTone: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  "PENDING REVIEW": "bg-blue-50 text-blue-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-amber-50 text-amber-700",
  FLAGGED: "bg-red-50 text-red-700",
  "READY FOR AUDIT": "bg-teal-50 text-teal-700",
};

type DocumentActivityItem = {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  badgeClass: string;
};

const auditUsageStatusTone: Record<string, string> = {
  PASS: "bg-emerald-50 text-emerald-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  PASSING: "bg-emerald-50 text-emerald-700",
  FAIL: "bg-red-50 text-red-700",
  FAILING: "bg-red-50 text-red-700",
  OVERDUE: "bg-amber-50 text-amber-700",
  "NEEDS REVIEW": "bg-amber-50 text-amber-700",
  "PENDING REVIEW": "bg-amber-50 text-amber-700",
  "PENDING EVIDENCE": "bg-amber-50 text-amber-700",
  "ACCEPTED RISK": "bg-sky-50 text-sky-700",
  DRAFT: "bg-slate-100 text-slate-600",
  "IN PROGRESS": "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
};

function getDocumentWorkflowActions(versionStatus: string | null): Array<{ label: string; status: string; detail: string }> {
  switch (versionStatus ?? "Draft") {
    case "Pending Review":
      return [
        { label: "Approve current version", status: "Approved", detail: "Accept this governed version for active compliance use." },
        { label: "Reject current version", status: "Rejected", detail: "Send this governed version back for revision." },
        { label: "Flag for correction", status: "Flagged", detail: "Mark the current evidence as needing correction or replacement." },
      ];
    case "Approved":
      return [
        { label: "Mark ready for audit", status: "Ready For Audit", detail: "Confirm this approved version is ready for audit reuse." },
        { label: "Flag for correction", status: "Flagged", detail: "Route this evidence back for update and resubmission." },
      ];
    case "Rejected":
      return [{ label: "Resubmit for review", status: "Pending Review", detail: "Resubmit the updated governed version for review." }];
    case "Flagged":
      return [
        { label: "Resubmit for review", status: "Pending Review", detail: "Submit the corrected evidence back into review." },
        { label: "Mark ready for audit", status: "Ready For Audit", detail: "Promote the corrected evidence back into audit-ready state." },
      ];
    case "Ready For Audit":
      return [{ label: "Flag for correction", status: "Flagged", detail: "Route this evidence back for correction if an audit issue is found." }];
    default:
      return [{ label: "Submit for review", status: "Pending Review", detail: "Move the current governed version into review." }];
  }
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function buildActorLabel(displayName: string | null, userId: number | null, fallback: string): string {
  if (displayName) {
    return displayName;
  }

  if (userId) {
    return `User #${userId}`;
  }

  return fallback;
}

function buildDocumentActivityItems(versions: DocumentVersionRecord[]): DocumentActivityItem[] {
  const items = versions.flatMap<DocumentActivityItem>((version) => {
    const versionLabel = version.versionNo ?? `Evidence #${version.evidenceId}`;
    const uploadedBy = buildActorLabel(version.createdByName, version.createdBy, "Unknown uploader");
    const events: DocumentActivityItem[] = [
      {
        id: `uploaded-${version.evidenceId}`,
        label: "Version uploaded",
        detail: `${versionLabel} was uploaded by ${uploadedBy}${version.isCurrent ? " and is the current governed version" : ""}.`,
        timestamp: version.createdAt,
        badgeClass: "bg-slate-100 text-slate-600",
      },
    ];

    if (version.approvedAt) {
      const approvedBy = buildActorLabel(version.approvedByName, version.approvedBy, "Unknown approver");
      events.push({
        id: `approved-${version.evidenceId}`,
        label: "Version approved",
        detail: `${versionLabel} was approved by ${approvedBy}.`,
        timestamp: version.approvedAt,
        badgeClass: "bg-emerald-50 text-emerald-700",
      });
    }

    if (version.rejectedAt) {
      const rejectedBy = buildActorLabel(version.rejectedByName, version.rejectedBy, "Unknown reviewer");
      events.push({
        id: `rejected-${version.evidenceId}`,
        label: "Version rejected",
        detail: `${versionLabel} was rejected by ${rejectedBy}.`,
        timestamp: version.rejectedAt,
        badgeClass: "bg-amber-50 text-amber-700",
      });
    }

    return events;
  });

  return items.sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
}

function ReviewHistoryPanel({ versions }: { versions: DocumentVersionRecord[] }) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Approvals and reviews</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Review decisions stay tied to the exact governed version that received them, so approval history remains auditable instead of being flattened into one current badge.
        </p>
      </div>

      {versions.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">No governed versions exist yet for review history.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {versions.map((version) => {
            const createdBy = buildActorLabel(version.createdByName, version.createdBy, "Unknown uploader");
            const approvedBy = buildActorLabel(version.approvedByName, version.approvedBy, "Not approved");
            const rejectedBy = buildActorLabel(version.rejectedByName, version.rejectedBy, "Not rejected");

            return (
              <article key={version.evidenceId} className="rounded-3xl border border-[var(--line)] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{version.versionNo ?? `Evidence #${version.evidenceId}`}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${documentVersionTone[(version.versionStatus ?? "Draft").toUpperCase()] ?? "bg-slate-100 text-slate-600"}`}>
                        {version.versionStatus ?? "Draft"}
                      </span>
                      {version.isCurrent ? (
                        <span className="rounded-full bg-[var(--accent)]/12 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">Current version</span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">{version.fileName}</p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Created {formatKuwaitDateTime(version.createdAt)}</p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetaCard label="Uploaded by" value={createdBy} />
                  <MetaCard label="Approved by" value={version.approvedAt ? approvedBy : "Not approved"} />
                  <MetaCard label="Approved at" value={version.approvedAt ? formatKuwaitDateTime(version.approvedAt) : "Not approved"} />
                  <MetaCard label="Rejected" value={version.rejectedAt ? `${rejectedBy} · ${formatKuwaitDateTime(version.rejectedAt)}` : "Not rejected"} />
                </div>

                {version.remarks ? (
                  <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
                    {version.remarks}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ActivityTimeline({ versions }: { versions: DocumentVersionRecord[] }) {
  const items = buildDocumentActivityItems(versions);

  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Activity</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Immutable timeline of upload and review events across this document&apos;s governed versions.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">No activity recorded yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--line)] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.badgeClass}`}>{item.label}</span>
                </div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{formatKuwaitDateTime(item.timestamp)}</p>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">{item.detail}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AuditUsagePanel({ record, auditUsage }: { record: DocumentRecord; auditUsage: DocumentAuditUsageRecord }) {
  const scope = [record.brandName, record.departmentName, record.locationName].filter(Boolean).join(" / ") || "Global";

  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Audit usage</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          This view shows where the document currently feeds control validation and which audits in the same scope can reuse the governed file. Direct audit attachments are not modeled yet, so audit rows are scope-matched reuse candidates rather than explicit evidence submissions.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetaCard label="Linked controls" value={String(auditUsage.linkedControlCount)} />
        <MetaCard label="Supporting checks" value={String(auditUsage.checks.length)} />
        <MetaCard label="Direct document checks" value={String(auditUsage.directCheckCount)} />
        <MetaCard label="Scope audits" value={String(auditUsage.scopeAuditCount)} />
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white px-4 py-4 text-sm text-[var(--muted)]">
        <p>
          Current scope: <span className="font-semibold text-[var(--foreground)]">{scope}</span>
        </p>
        <p className="mt-2">
          Audit readiness: <span className="font-semibold text-[var(--foreground)]">{auditUsage.isAuditReady ? "Ready for evidence reuse" : "Not yet audit-ready"}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Checks using this document chain</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Checks are included when they validate a linked control or reference this document directly as the source entity.
              </p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {auditUsage.checks.length} checks
            </span>
          </div>

          {auditUsage.checks.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">No checks currently consume this document through controls or direct document linkage.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {auditUsage.checks.map((check) => (
                <article key={check.checkId} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/checks/${check.checkId}`} className="font-semibold text-[var(--accent)] hover:underline">
                          {check.checkName}
                        </Link>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${auditUsageStatusTone[(check.latestStatus ?? "Draft").toUpperCase()] ?? "bg-slate-100 text-slate-600"}`}>
                          {check.latestStatus ?? "Not evaluated"}
                        </span>
                        {check.isDirectDocumentCheck ? (
                          <span className="rounded-full bg-[var(--accent)]/12 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">Direct document source</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {check.controlCode} · {check.controlName}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{check.checkType}</p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <MetaCard label="Severity" value={check.severity} />
                    <MetaCard label="Owner" value={check.ownerDisplayName ?? "Unassigned"} />
                    <MetaCard label="Next evaluation" value={check.nextEvaluationAt ? formatKuwaitDateTime(check.nextEvaluationAt) : "Not scheduled"} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Scope-matched audits</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Audits in the same document scope can reuse the approved or audit-ready governed version as evidence.
              </p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {auditUsage.audits.length} audits
            </span>
          </div>

          {auditUsage.audits.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">No audits currently match this document&apos;s scope.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {auditUsage.audits.map((audit) => {
                const auditScope = [audit.brandName, audit.departmentName, audit.locationName].filter(Boolean).join(" / ") || "Global";

                return (
                  <article key={audit.auditId} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/audits/${audit.auditId}`} className="font-semibold text-[var(--accent)] hover:underline">
                            {audit.templateName}
                          </Link>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${auditUsageStatusTone[audit.status.toUpperCase()] ?? "bg-slate-100 text-slate-600"}`}>
                            {audit.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[var(--muted)]">{audit.complianceArea} · {auditScope}</p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Started {formatKuwaitDateTime(audit.startedAt)}</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <MetaCard label="Performed by" value={audit.performedByName} />
                      <MetaCard label="Completed" value={audit.completedAt ? formatKuwaitDateTime(audit.completedAt) : "In progress"} />
                      <MetaCard label="Score" value={audit.scorePercent !== null ? `${audit.scorePercent}%` : "Not scored"} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function DocumentDetailPanel({
  record,
  versions,
  auditUsage,
  controls,
  availableControls,
  brands,
  departments,
  locations,
  users,
  action,
  linkAction,
  transitionAction,
}: {
  record: DocumentRecord;
  versions: DocumentVersionRecord[];
  auditUsage: DocumentAuditUsageRecord;
  controls: RelatedControlRecord[];
  availableControls: Array<{ controlId: number; controlCode: string; controlName: string }>;
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  users: UserRecord[];
  action: (formData: FormData) => Promise<void>;
  linkAction: (formData: FormData) => Promise<void>;
  transitionAction: (formData: FormData) => Promise<void>;
}) {
  const scope = [record.brandName, record.departmentName, record.locationName].filter(Boolean).join(" / ") || "Global";
  const reviewMoment = record.reviewDate ?? record.expiryDate;
  const issueDateValue = record.issueDate ? String(record.issueDate).split("T")[0] : "";
  const reviewDateValue = record.reviewDate ? String(record.reviewDate).split("T")[0] : "";
  const expiryDateValue = record.expiryDate ? String(record.expiryDate).split("T")[0] : "";
  const workflowActions = getDocumentWorkflowActions(record.versionStatus);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{record.documentCode ?? `Document #${record.documentId}`}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${documentStatusTone[record.status.toUpperCase()] ?? "bg-slate-100 text-slate-600"}`}>
                {record.status}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{record.documentName}</h1>
            <p className="text-sm text-[var(--muted)]">
              {[record.documentType, record.category, scope].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Link href="/documents" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]">
            Back to documents
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetaCard label="Owner" value={record.ownerDisplayName ?? "Unassigned"} />
          <MetaCard label="Current version" value={record.versionNo ?? "Not set"} />
          <MetaCard label="Linked controls" value={String(record.controlLinkCount)} />
          <MetaCard label="Next review" value={reviewMoment ? formatKuwaitDate(reviewMoment) : "Not scheduled"} />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Governance summary</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Current file</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">{record.fileName ?? "No governed file linked yet"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Source</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">{record.sourceType ?? "Managed internally"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Issue date</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">{record.issueDate ? formatKuwaitDate(record.issueDate) : "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Expiry date</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">{record.expiryDate ? formatKuwaitDate(record.expiryDate) : "No expiry"}</dd>
              </div>
            </dl>

            {record.remarks ? (
              <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-[var(--foreground)]">
                {record.remarks}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Document actions</h2>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <p>Use this record as the document-level governance surface for control linkage, freshness follow-up, and future audit evidence review.</p>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Current version workflow</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${documentVersionTone[(record.versionStatus ?? "Draft").toUpperCase()] ?? "bg-slate-100 text-slate-600"}`}>
                    {record.versionStatus ?? "Draft"}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{record.currentEvidenceId ? `Evidence #${record.currentEvidenceId}` : "No governed file yet"}</span>
                </div>

                {record.currentEvidenceId ? (
                  <form action={transitionAction} className="mt-4 space-y-3">
                    <input type="hidden" name="documentId" value={record.documentId} />
                    {workflowActions.map((item) => (
                      <button
                        key={item.status}
                        type="submit"
                        name="status"
                        value={item.status}
                        className="flex w-full items-start justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-left transition hover:bg-[var(--surface)]"
                      >
                        <span>
                          <span className="block text-sm font-semibold text-[var(--foreground)]">{item.label}</span>
                          <span className="mt-1 block text-xs text-[var(--muted)]">{item.detail}</span>
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{item.status}</span>
                      </button>
                    ))}
                  </form>
                ) : (
                  <p className="mt-3 text-xs text-[var(--muted)]">Add a governed version before using review and audit workflow actions.</p>
                )}
              </div>
              {record.fileUrl ? (
                <a
                  href={record.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-[var(--line)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface)]"
                >
                  Open current file
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <ReviewHistoryPanel versions={versions} />

      <AuditUsagePanel record={record} auditUsage={auditUsage} />

      <ActivityTimeline versions={versions} />

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Document settings</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Update governance metadata, lifecycle state, and the current controlled file from the source document record.
          </p>
        </div>

        <form action={action} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="documentId" value={record.documentId} />

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Document code</span>
            <input
              name="documentCode"
              defaultValue={valueOrEmpty(record.documentCode)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Status</span>
            <select
              name="status"
              defaultValue={record.status}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              {documentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Document name</span>
            <input
              name="documentName"
              required
              defaultValue={record.documentName}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Document type</span>
            <input
              name="documentType"
              required
              defaultValue={record.documentType}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Category</span>
            <input
              name="category"
              defaultValue={valueOrEmpty(record.category)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Brand</span>
            <select
              name="brandId"
              defaultValue={valueOrEmpty(record.brandId)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="">Global</option>
              {brands.map((brand) => (
                <option key={brand.brandId} value={brand.brandId}>
                  {brand.brandName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Department</span>
            <select
              name="departmentId"
              defaultValue={valueOrEmpty(record.departmentId)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="">Optional</option>
              {departments.map((department) => (
                <option key={department.departmentId} value={department.departmentId}>
                  {department.departmentName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Location</span>
            <select
              name="locationId"
              defaultValue={valueOrEmpty(record.locationId)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="">Optional</option>
              {locations.map((location) => (
                <option key={location.locationId} value={location.locationId}>
                  {location.locationName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Owner</span>
            <select
              name="ownerUserId"
              defaultValue={valueOrEmpty(record.ownerUserId)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Issue date</span>
            <input
              type="date"
              name="issueDate"
              defaultValue={issueDateValue}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Review date</span>
            <input
              type="date"
              name="reviewDate"
              defaultValue={reviewDateValue}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Expiry date</span>
            <input
              type="date"
              name="expiryDate"
              defaultValue={expiryDateValue}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Source type</span>
            <input
              name="sourceType"
              defaultValue={valueOrEmpty(record.sourceType)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Remarks</span>
            <textarea
              name="remarks"
              rows={3}
              defaultValue={valueOrEmpty(record.remarks)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <div className="md:col-span-2 rounded-3xl border border-[var(--line)] bg-white p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Add governed version</h3>
              <p className="text-sm leading-7 text-[var(--muted)]">
                Add a new governed file version for this document. Saving document metadata alone will no longer overwrite the current evidence row.
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">File name</span>
                <input
                  name="fileName"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">File URL</span>
                <input
                  name="fileUrl"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Version no</span>
                <input
                  name="versionNo"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Version status</span>
                <select
                  name="versionStatus"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Optional</option>
                  {documentVersionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">File size</span>
                <input
                  type="number"
                  min="0"
                  name="fileSize"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Mime type</span>
                <input
                  name="mimeType"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Storage provider</span>
                <input
                  name="storageProvider"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Storage drive ID</span>
                <input
                  name="storageDriveId"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Storage item ID</span>
                <input
                  name="storageItemId"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium">Storage path</span>
                <input
                  name="storagePath"
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
            >
              Save changes
            </button>
            <Link
              href="/documents"
              className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]"
            >
              Back to documents
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Version history</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              Every governed file should remain traceable. New uploads become new versions and the current governed file is tracked explicitly.
            </p>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            {versions.length} versions
          </span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                {["Version", "File", "Status", "Created", "Current"].map((heading) => (
                  <th key={heading} className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {versions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">
                    No governed versions recorded yet.
                  </td>
                </tr>
              ) : (
                versions.map((version) => (
                  <tr key={version.evidenceId} className="hover:bg-[var(--surface-hover,#f7faf8)]">
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{version.versionNo ?? `Evidence #${version.evidenceId}`}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <a href={version.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-[var(--accent)] hover:underline">
                        {version.fileName}
                      </a>
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${documentVersionTone[(version.versionStatus ?? "Draft").toUpperCase()] ?? "bg-slate-100 text-slate-600"}`}>
                        {version.versionStatus ?? "Draft"}
                      </span>
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{formatKuwaitDateTime(version.createdAt)}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      {version.isCurrent ? (
                        <span className="rounded-full bg-[var(--accent)]/12 px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">Current</span>
                      ) : (
                        <span className="text-[var(--muted)]">Historical</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Linked controls</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              Controls anchor this document into checks, audit readiness, and later findings or remediation. Document detail is now the write surface for that relationship.
            </p>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            {controls.length} linked
          </span>
        </div>

        <form action={linkAction} className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-5">
          <input type="hidden" name="documentId" value={record.documentId} />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_auto]">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Control</span>
              <select
                name="controlId"
                required
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              >
                <option value="">Select control</option>
                {availableControls.map((control) => (
                  <option key={control.controlId} value={control.controlId}>
                    {control.controlCode} - {control.controlName}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Link role</span>
              <input
                name="linkRole"
                defaultValue="SUPPORTS"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="flex items-end gap-2 text-sm">
              <input type="checkbox" name="isPrimary" value="true" className="h-4 w-4 rounded border-[var(--line)]" />
              <span className="pb-3 font-medium">Primary</span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">Link this governed document to the shared control hub so downstream checks and audit evidence flows can use it consistently.</p>
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
            >
              Link control
            </button>
          </div>
        </form>

        {controls.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">No controls are linked to this document yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {controls.map((control) => (
              <Link
                key={control.controlId}
                href={`/controls/${control.controlId}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 transition hover:bg-[var(--surface)]"
              >
                <div>
                  <p className="font-medium text-[var(--accent)]">{control.controlCode}</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]">{control.controlName}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <span className="rounded-full border border-[var(--line)] px-2 py-0.5">{control.linkRole}</span>
                  {control.isPrimary ? <span className="rounded-full bg-[var(--accent)]/12 px-2 py-0.5 font-semibold text-[var(--accent)]">Primary</span> : null}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{control.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}