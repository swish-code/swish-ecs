import Link from "next/link";
import { formatKuwaitDateTime } from "@/lib/time/kuwait";
import type { CheckRecord } from "@/features/checks/types";
import type { ControlRecord } from "@/features/controls/types";
import type { DocumentRecord } from "@/features/evidence/types";

function statusTone(status: string | null): string {
  switch ((status ?? "").toUpperCase()) {
    case "PASS":
    case "PASSING":
    case "OK":
      return "bg-emerald-50 text-emerald-700";
    case "FAIL":
    case "FAILING":
      return "bg-red-50 text-red-700";
    case "NEEDS REVIEW":
    case "OVERDUE":
    case "PENDING REVIEW":
    case "PENDING EVIDENCE":
      return "bg-amber-50 text-amber-700";
    case "ACCEPTED RISK":
      return "bg-sky-50 text-sky-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function severityTone(severity: string): string {
  switch (severity) {
    case "Critical":
      return "bg-red-100 text-red-800";
    case "High":
      return "bg-red-50 text-red-700";
    case "Medium":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function isAttentionStatus(status: string | null): boolean {
  return ["FAIL", "FAILING", "NEEDS REVIEW", "OVERDUE", "PENDING REVIEW", "PENDING EVIDENCE"].includes((status ?? "").toUpperCase());
}

function isPast(dateValue: string | null): boolean {
  if (!dateValue) {
    return false;
  }

  const value = new Date(dateValue);
  if (Number.isNaN(value.getTime())) {
    return false;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return value < now;
}

export function CheckListTable({ rows, controls, documents }: { rows: CheckRecord[]; controls: ControlRecord[]; documents: DocumentRecord[] }) {
  const activeChecks = rows.filter((row) => row.isActive).length;
  const attentionChecks = rows.filter((row) => isAttentionStatus(row.latestStatus)).length;
  const unevaluatedChecks = rows.filter((row) => row.latestStatus === null).length;
  const activeControlsWithoutChecks = controls.filter((row) => row.status.toUpperCase() === "ACTIVE" && row.checkLinkCount === 0);
  const activeControlsWithoutEvidenceLinks = controls.filter(
    (row) => row.status.toUpperCase() === "ACTIVE" && row.documentLinkCount === 0 && row.sopLinkCount === 0,
  );
  const documentsWithoutGovernedFiles = documents.filter(
    (row) => ["ACTIVE", "APPROVED"].includes(row.status.toUpperCase()) && row.currentEvidenceId === null,
  );
  const staleDocuments = documents.filter((row) => isPast(row.reviewDate) || isPast(row.expiryDate));

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Tests</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Control-linked validation register for freshness, approvals, rollout readiness, and evidence health across the current compliance model.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total checks", value: rows.length },
            { label: "Active", value: activeChecks },
            { label: "Need attention", value: attentionChecks },
            { label: "No results yet", value: unevaluatedChecks },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Workflow signals</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Tests should react to control and document governance state, not only stored check results. These signals highlight missing validation coverage and evidence gaps that should feed future test projection logic.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Active controls without tests", value: activeControlsWithoutChecks.length },
            { label: "Active controls without evidence links", value: activeControlsWithoutEvidenceLinks.length },
            { label: "Active docs missing governed files", value: documentsWithoutGovernedFiles.length },
            { label: "Stale docs affecting readiness", value: staleDocuments.length },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Controls needing validation setup</h3>
            {activeControlsWithoutChecks.length === 0 && activeControlsWithoutEvidenceLinks.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">No active control setup gaps are currently visible.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {[...activeControlsWithoutChecks, ...activeControlsWithoutEvidenceLinks]
                  .slice(0, 6)
                  .map((control) => (
                    <Link key={`${control.controlId}-${control.checkLinkCount}-${control.documentLinkCount}`} href={`/controls/${control.controlId}`} className="block rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition hover:bg-white">
                      <p className="font-medium text-[var(--accent)]">{control.controlCode}</p>
                      <p className="mt-1 text-sm text-[var(--foreground)]">{control.controlName}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {control.checkLinkCount === 0 ? "No linked tests" : "Needs policy or document evidence links"}
                      </p>
                    </Link>
                  ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Document governance blockers</h3>
            {documentsWithoutGovernedFiles.length === 0 && staleDocuments.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">No document blockers are currently affecting test readiness.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {[...documentsWithoutGovernedFiles, ...staleDocuments].slice(0, 6).map((document) => (
                  <Link key={`${document.documentId}-${document.currentEvidenceId}-${document.reviewDate}-${document.expiryDate}`} href={`/documents/${document.documentId}`} className="block rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition hover:bg-white">
                    <p className="font-medium text-[var(--accent)]">{document.documentName}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{document.fileName ?? document.documentType}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {document.currentEvidenceId === null
                        ? "No governed file attached"
                        : isPast(document.expiryDate)
                          ? "Expired evidence"
                          : "Review date overdue"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                {["Check", "Control", "Scope", "Source", "Severity", "Latest result", "Last evaluated", "Next evaluation"].map((heading) => (
                  <th key={heading} className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted)]">
                    No checks are available yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const scope = [row.brandName, row.departmentName, row.locationName].filter(Boolean).join(" / ");

                  return (
                    <tr key={row.checkId} className="hover:bg-[var(--surface-hover,#f7faf8)]">
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <div>
                          <Link href={`/checks/${row.checkId}`} className="font-medium text-[var(--foreground)] hover:text-[var(--accent)] hover:underline">
                            {row.checkName}
                          </Link>
                          <p className="mt-1 text-xs text-[var(--muted)]">{row.checkType} {row.isActive ? "· Active" : "· Inactive"}</p>
                        </div>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <Link href={`/controls/${row.controlId}`} className="font-medium text-[var(--accent)] hover:underline">
                          {row.controlCode}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--muted)]">{row.controlName}</p>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{scope || "Global"}</td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        {row.sourceEntityType ? `${row.sourceEntityType}${row.sourceEntityId ? ` #${row.sourceEntityId}` : ""}` : "Control health"}
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${severityTone(row.severity)}`}>{row.severity}</span>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone(row.latestStatus)}`}>
                          {row.latestStatus ?? "No result"}
                        </span>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.lastEvaluatedAt ? formatKuwaitDateTime(row.lastEvaluatedAt) : "-"}</td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.nextEvaluationAt ? formatKuwaitDateTime(row.nextEvaluationAt) : "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}