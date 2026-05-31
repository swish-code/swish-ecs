import Link from "next/link";
import type { AuditRecord } from "@/features/audits/types";
import { formatKuwaitDateTime } from "@/lib/time/kuwait";

function formatOptionalDateTime(value: string | null): string {
  return value ? formatKuwaitDateTime(value) : "-";
}

function formatOptionalScore(value: number | null): string {
  return value === null ? "-" : `${value}%`;
}

export function AuditListTable({ rows }: { rows: AuditRecord[] }) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audits</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Manage audit execution, evidence review, scope-level oversight, and the preparation flow that feeds readiness and remediation.
          </p>
        </div>
        <Link
          href="/audits/new"
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
        >
          New Audit
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {[
                "Template",
                "Brand",
                "Department",
                "Location",
                "Compliance Area",
                "Status",
                "Performed By",
                "Started",
                "Completed",
                "Score",
              ].map((heading) => (
                <th key={heading} className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-[var(--muted)]">
                  No audits yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.auditId} className="hover:bg-[var(--surface-hover,#f7faf8)]">
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">
                    <Link
                      href={`/audits/${row.auditId}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {row.templateName}
                    </Link>
                  </td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.brandName ?? "-"}</td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.departmentName ?? "-"}</td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.locationName ?? "-"}</td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.complianceArea}</td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.status}</td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.performedByName}</td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{formatKuwaitDateTime(row.startedAt)}</td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{formatOptionalDateTime(row.completedAt)}</td>
                  <td className="border-b border-[var(--line)]/60 px-4 py-3">{formatOptionalScore(row.scorePercent)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}