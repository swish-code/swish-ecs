import Link from "next/link";
import type { ControlRecord } from "@/features/controls/types";

const controlStatusTone: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-600",
  Planned: "bg-blue-50 text-blue-700",
  Archived: "bg-[var(--surface-strong)] text-[var(--muted)]",
  Inactive: "bg-red-50 text-red-700",
};

export function ControlListTable({ rows }: { rows: ControlRecord[] }) {
  const activeCount = rows.filter((row) => row.status.toUpperCase() === "ACTIVE").length;
  const documentLinked = rows.filter((row) => row.documentLinkCount > 0).length;
  const sopLinked = rows.filter((row) => row.sopLinkCount > 0).length;

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Controls</h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Shared control register that connects SOPs, documents, checks, audits, findings, and remediation work into one reusable compliance model.
            </p>
          </div>

          <Link href="/controls/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]">
            New control
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total controls", value: rows.length },
            { label: "Active", value: activeCount },
            { label: "Linked to SOPs", value: sopLinked },
            { label: "Linked to documents", value: documentLinked },
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
                {["Control", "Category", "Scope", "Owner", "Review", "Links", "Status"].map((heading) => (
                  <th key={heading} className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                    No controls available yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const scope = [row.brandName, row.departmentName, row.locationName].filter(Boolean).join(" / ");

                  return (
                    <tr key={row.controlId} className="hover:bg-[var(--surface-hover,#f7faf8)]">
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <Link href={`/controls/${row.controlId}`} className="font-medium text-[var(--accent)] hover:underline">
                          {row.controlCode}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--muted)]">{row.controlName}</p>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <div>
                          <p>{row.controlCategory ?? "General"}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{row.controlType ?? "Operational"}</p>
                        </div>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{scope || "Global"}</td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.ownerDisplayName ?? "Unassigned"}</td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        {row.reviewFrequencyDays ? `${row.reviewFrequencyDays} days` : "Not set"}
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                          <span className="rounded-full border border-[var(--line)] px-2 py-0.5">SOPs {row.sopLinkCount}</span>
                          <span className="rounded-full border border-[var(--line)] px-2 py-0.5">Docs {row.documentLinkCount}</span>
                          <span className="rounded-full border border-[var(--line)] px-2 py-0.5">Checks {row.checkLinkCount}</span>
                        </div>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${controlStatusTone[row.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {row.status}
                        </span>
                      </td>
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