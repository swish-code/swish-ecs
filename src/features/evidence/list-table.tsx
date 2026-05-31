import Link from "next/link";
import type { DocumentRecord } from "@/features/evidence/types";
import { formatKuwaitDate } from "@/lib/time/kuwait";

function getFreshnessLabel(row: DocumentRecord): { label: string; tone: string } {
  const lifecycleStatus = row.status.toUpperCase();

  if (lifecycleStatus === "FLAGGED") {
    return { label: "Flagged", tone: "bg-red-50 text-red-700" };
  }

  if (lifecycleStatus === "IN REVIEW") {
    return { label: "In Review", tone: "bg-blue-50 text-blue-700" };
  }

  const today = new Date();

  if (row.expiryDate) {
    const expiry = new Date(row.expiryDate);
    if (!Number.isNaN(expiry.getTime()) && expiry < today) {
      return { label: "Expired", tone: "bg-red-50 text-red-700" };
    }
  }

  if (row.reviewDate) {
    const review = new Date(row.reviewDate);
    if (!Number.isNaN(review.getTime()) && review < today) {
      return { label: "Review Due", tone: "bg-amber-50 text-amber-700" };
    }
  }

  return { label: "Current", tone: "bg-emerald-50 text-emerald-700" };
}

function uniqueCount(values: Array<string | null>): number {
  return new Set(values.filter(Boolean)).size;
}

export function DocumentListTable({ rows }: { rows: DocumentRecord[] }) {
  const activeCount = rows.filter((row) => ["ACTIVE", "APPROVED"].includes(row.status.toUpperCase())).length;
  const expiringCount = rows.filter((row) => getFreshnessLabel(row).label !== "Current").length;
  const documentTypes = uniqueCount(rows.map((row) => row.documentType));
  const governedFiles = rows.filter((row) => row.currentEvidenceId !== null).length;
  const controlLinked = rows.filter((row) => row.controlLinkCount > 0).length;

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Governed documents and reusable evidence records mapped into the new Phase 1 model. This view is the foundation for freshness tracking, control linkage, and audit-ready document governance.
            </p>
          </div>

          <Link href="/documents/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]">
            New document
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total documents", value: rows.length },
            { label: "Approved / active", value: activeCount },
            { label: "Review due or expired", value: expiringCount },
            { label: "Control-linked", value: controlLinked },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                {["Document", "Type", "Scope", "Owner", "Version", "Controls", "Freshness", "Review", "Status"].map((heading) => (
                  <th key={heading} className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[var(--muted)]">
                    No governed documents available yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const freshness = getFreshnessLabel(row);
                  const scope = [row.brandName, row.departmentName, row.locationName].filter(Boolean).join(" / ");

                  return (
                    <tr key={row.documentId} className="hover:bg-[var(--surface-hover,#f7faf8)]">
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <div>
                          <Link href={`/documents/${row.documentId}`} className="font-medium text-[var(--foreground)] hover:text-[var(--accent)] hover:underline">
                            {row.documentName}
                          </Link>
                          <p className="mt-1 text-xs text-[var(--muted)]">{row.documentCode ?? `Document #${row.documentId}`}</p>
                        </div>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <div>
                          <p>{row.documentType}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{row.category ?? row.sourceType ?? "General"}</p>
                        </div>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{scope || "Global"}</td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.ownerDisplayName ?? "Unassigned"}</td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <div>
                          <p>{row.versionNo ?? "-"}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{row.fileName ?? "No file metadata"}</p>
                        </div>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.controlLinkCount}</td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${freshness.tone}`}>{freshness.label}</span>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        {row.reviewDate ? formatKuwaitDate(row.reviewDate) : row.expiryDate ? formatKuwaitDate(row.expiryDate) : "-"}
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.status}</td>
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