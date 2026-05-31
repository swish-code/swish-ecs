import Link from "next/link";
import type { SopRecord } from "@/features/sops/types";
import { sopStatuses } from "@/types/domain";

const sopStatusColour: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Submitted: "bg-blue-50 text-blue-700",
  Approved: "bg-amber-50 text-amber-700",
  Active: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Archived: "bg-[var(--surface-strong)] text-[var(--muted)]",
};

function SopStatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sopStatusColour[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export function SopListTable({ rows }: { rows: SopRecord[] }) {
  const statusCounts = sopStatuses.map((s) => ({
    status: s,
    count: rows.filter((r) => r.status === s).length,
  }));

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Policies</h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Governed policy register with scope, version, storage metadata, and approval status across the current compliance program.
            </p>
          </div>
          <Link
            href="/sops/new"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
          >
            New Policy
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
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
                {["Document No", "Title", "Type", "Brand", "Department", "Location", "Owner", "Version", "Status"].map(
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
                  <td colSpan={9} className="px-4 py-8 text-center text-[var(--muted)]">
                    No SOP records yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.sopId} className="hover:bg-[var(--surface-hover,#f7faf8)]">
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <Link
                        href={`/sops/${row.sopId}`}
                        className="font-medium text-[var(--accent)] hover:underline"
                      >
                        {row.documentNo}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.title}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.documentType}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.brandName ?? "-"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.departmentName ?? "-"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.locationName ?? "-"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.ownerDisplayName ?? "-"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.versionNo}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <SopStatusBadge status={row.status} />
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
