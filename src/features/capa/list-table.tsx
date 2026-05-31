import Link from "next/link";
import type { CorrectiveActionRecord } from "@/features/capa/types";
import { correctiveActionStatuses } from "@/types/domain";
import { formatKuwaitDate } from "@/lib/time/kuwait";

const severityColour: Record<string, string> = {
  Low: "text-[var(--muted)]",
  Medium: "text-amber-600",
  High: "text-orange-600",
  Critical: "text-red-600 font-semibold",
};

const statusColour: Record<string, string> = {
  Open: "bg-red-50 text-red-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Submitted: "bg-blue-50 text-blue-700",
  Verified: "bg-emerald-50 text-emerald-700",
  Closed: "bg-[var(--surface)] text-[var(--muted)]",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColour[status] ?? ""}`}>{status}</span>
  );
}

export function CapaListTable({ rows }: { rows: CorrectiveActionRecord[] }) {
  const statusCounts = correctiveActionStatuses.map((s) => ({
    status: s,
    count: rows.filter((r) => r.status === s).length,
  }));

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Corrective Actions</h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Track and close CAPA items linked to audit findings and compliance gaps. Each action must be assigned,
              verified, and formally closed.
            </p>
          </div>
          <Link
            href="/capa/new"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
          >
            New Action
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statusCounts.map((item) => (
            <div key={item.status} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.status}</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                {["Title", "Severity", "Status", "Brand", "Department", "Assigned To", "Due Date", "Source"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-[var(--muted)]">
                    No corrective actions yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.actionId} className="group cursor-pointer hover:bg-[var(--surface-hover,#f7faf8)]">
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <Link href={`/capa/${row.actionId}`} className="font-medium text-[var(--accent)] hover:underline">
                        {row.title}
                      </Link>
                    </td>
                    <td className={`border-b border-[var(--line)]/60 px-4 py-3 ${severityColour[row.severity] ?? ""}`}>
                      {row.severity}
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.brandName ?? "—"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.departmentName ?? "—"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.assignedToName}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{formatKuwaitDate(row.dueDate)}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3 text-[var(--muted)]">
                      {row.sourceType}
                      {row.sourceId ? ` #${row.sourceId}` : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
