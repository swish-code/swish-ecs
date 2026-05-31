import Link from "next/link";
import { formatKuwaitDate } from "@/lib/time/kuwait";
import type { ActionCenterItem, ActionCenterSummary } from "@/features/action-center/types";

const priorityTone: Record<string, string> = {
  Critical: "bg-red-100 text-red-800 border border-red-200",
  High: "bg-red-50 text-red-700 border border-red-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  Low: "bg-slate-100 text-slate-600 border border-slate-200",
};

const groupTone: Record<ActionCenterItem["queueGroup"], string> = {
  Approvals: "bg-blue-50 text-blue-700",
  Implementation: "bg-amber-50 text-amber-700",
  Controls: "bg-cyan-50 text-cyan-700",
  Documents: "bg-emerald-50 text-emerald-700",
  Audits: "bg-violet-50 text-violet-700",
  Remediation: "bg-rose-50 text-rose-700",
};

function SummaryCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${tone ?? "text-[var(--foreground)]"}`}>{value}</p>
    </div>
  );
}

export function ActionCenterQueue({ items, summary }: { items: ActionCenterItem[]; summary: ActionCenterSummary }) {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">My Work</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Unified queue for approvals, rollout work, control follow-up, document governance, audits, and remediation. This is the primary execution surface for day-to-day work while Frameworks, Reports, and the Compliance registers remain focused on visibility and governance.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total actions" value={summary.totalItems} />
          <SummaryCard label="Overdue" value={summary.overdueItems} tone={summary.overdueItems > 0 ? "text-red-700" : undefined} />
          <SummaryCard label="Pending approvals" value={summary.approvalItems} />
          <SummaryCard label="Open remediation" value={summary.remediationItems} />
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                {["Queue", "Task", "Source", "Owner", "Scope", "Due", "Priority", "Status"].map((heading) => (
                  <th key={heading} className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted)]">
                    No action items are currently pending in your scope.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-hover,#f7faf8)]">
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${groupTone[item.queueGroup]}`}>
                        {item.queueGroup}
                      </span>
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <Link href={item.href} className="font-medium text-[var(--accent)] hover:underline">
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--muted)]">{item.taskType} · {item.detail}</p>
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <div>
                        <p>{item.sourceModule}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{item.detail}</p>
                      </div>
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{item.ownerName}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{item.scopeLabel}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      {item.dueDate ? (
                        <span className={item.isOverdue ? "font-semibold text-red-600" : undefined}>{formatKuwaitDate(item.dueDate)}</span>
                      ) : (
                        <span className="text-[var(--muted)]">No date</span>
                      )}
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityTone[item.priority] ?? priorityTone.Low}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{item.status}</td>
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