import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { getActionCenterItems } from "@/features/action-center/service";
import { SetupState } from "@/features/admin/setup-state";
import { getDashboardKpis } from "@/features/dashboard/service";
import type { ActionCenterItem } from "@/features/action-center/types";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";
import { formatKuwaitDate } from "@/lib/time/kuwait";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ─── severity helpers ────────────────────────────────────────────────────────

function severityClasses(severity: string): string {
  if (severity === "Critical") return "bg-red-100 text-red-800 border border-red-200";
  if (severity === "High") return "bg-red-50 text-red-700 border border-red-200";
  if (severity === "Medium") return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
}

function statusClasses(status: string): string {
  if (status === "Closed" || status === "Verified") return "bg-emerald-50 text-emerald-700";
  if (status === "In Progress") return "bg-blue-50 text-blue-700";
  if (status === "Submitted") return "bg-purple-50 text-purple-700";
  return "bg-amber-50 text-amber-700";
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  href,
  warnSub,
}: {
  label: string;
  value: string | number;
  sub: string;
  href: string;
  warnSub?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_8px_32px_rgba(29,42,36,0.06)] transition hover:border-[var(--accent)] hover:shadow-lg"
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className={`mt-1.5 text-xs ${warnSub ? "font-medium text-red-600" : "text-[var(--muted)]"}`}>{sub}</p>
    </Link>
  );
}

function SopStage({
  label,
  count,
  accent,
}: {
  label: string;
  count: number;
  accent?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 rounded-[14px] border p-4 ${accent ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--line)] bg-[var(--surface-strong)]/40"}`}>
      <span className={`text-2xl font-semibold ${accent ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
        {count}
      </span>
      <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
    </div>
  );
}

function ActionItemCard({ item }: { item: ActionCenterItem }) {
  return (
    <Link
      href={item.href}
      className="group flex flex-col gap-2.5 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${severityClasses(item.severity)}`}>
          {item.queueGroup}
        </span>
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${statusClasses(item.status)}`}>
          {item.status}
        </span>
      </div>
      <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--foreground)] group-hover:text-[var(--accent)]">
        {item.title}
      </p>
      <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
        <span>{item.ownerName}</span>
        <span className={item.dueDate && item.isOverdue ? "font-semibold text-red-600" : ""}>
          {item.dueDate ? `Due ${formatKuwaitDate(item.dueDate)}` : item.priority}
        </span>
      </div>
    </Link>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell
        allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"]}
      >
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const [kpis, actionCenter] = await Promise.all([getDashboardKpis(), getActionCenterItems(session.user)]);

  const firstName = session.user.displayName?.split(" ")[0] ?? "there";
  const priorityActions = actionCenter.items.slice(0, 5);

  const sopPipelineTotal = kpis.draftSops + kpis.submittedSops + kpis.approvedSops + kpis.activeSops;

  return (
    <ProtectedAppShell
      allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"]}
      session={session}
    >
      <div className="space-y-8">
        {/* ── Header ── */}
        <header className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
            Welcome back, {firstName}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Compliance overview</h1>
          <p className="text-sm text-[var(--muted)]">
            Live metrics across SOPs, assignments, audits, and corrective actions.
          </p>
        </header>

        {/* ── KPI stat cards ── */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="Total SOPs"
            value={kpis.totalSops}
            sub={`${kpis.activeSops} active · ${kpis.draftSops} draft`}
            href="/sops"
          />
          <StatCard
            label="Implementation"
            value={`${kpis.implementationPercent}%`}
            sub={`${kpis.totalAssignments} assignment${kpis.totalAssignments !== 1 ? "s" : ""} tracked`}
            href="/assignments"
          />
          <StatCard
            label="Audits"
            value={kpis.ongoingAudits + kpis.completedAudits}
            sub={`${kpis.ongoingAudits} in progress · ${kpis.completedAudits} completed`}
            href="/audits"
          />
          <StatCard
            label="Action Center"
            value={actionCenter.summary.totalItems}
            sub={actionCenter.summary.overdueItems > 0 ? `${actionCenter.summary.overdueItems} overdue actions` : "No overdue actions"}
            href="/action-center"
            warnSub={actionCenter.summary.overdueItems > 0}
          />
        </section>

        {/* ── Main content ── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: SOP pipeline + audit summary */}
          <div className="space-y-4 lg:col-span-2">
            {/* SOP Lifecycle */}
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_8px_32px_rgba(29,42,36,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-[var(--foreground)]">SOP Lifecycle</h2>
                <Link href="/sops" className="text-xs font-medium text-[var(--accent)] hover:underline">
                  View register →
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <SopStage label="Draft" count={kpis.draftSops} />
                <SopStage label="Pending Approval" count={kpis.submittedSops + kpis.approvedSops} accent={kpis.submittedSops + kpis.approvedSops > 0} />
                <SopStage label="Active" count={kpis.activeSops} accent={kpis.activeSops > 0} />
                <SopStage label="Total" count={sopPipelineTotal} />
              </div>

              {kpis.submittedSops + kpis.approvedSops > 0 && (
                <p className="mt-4 rounded-[10px] bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
                  {kpis.submittedSops + kpis.approvedSops} SOP{kpis.submittedSops + kpis.approvedSops !== 1 ? "s" : ""} awaiting approval — review in the SOP Register.
                </p>
              )}
            </div>

            {/* Audit + Assignment summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_8px_32px_rgba(29,42,36,0.06)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-[var(--foreground)]">Audit Center</h2>
                  <Link href="/audits" className="text-xs font-medium text-[var(--accent)] hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-[10px] border border-[var(--line)] px-4 py-3">
                    <span className="text-sm text-[var(--muted)]">In progress</span>
                    <span className="text-lg font-semibold text-[var(--foreground)]">{kpis.ongoingAudits}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[10px] border border-[var(--line)] px-4 py-3">
                    <span className="text-sm text-[var(--muted)]">Completed</span>
                    <span className="text-lg font-semibold text-[var(--foreground)]">{kpis.completedAudits}</span>
                  </div>
                </div>
                <Link
                  href="/audits"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--background)]"
                >
                  Go to Audit Center
                </Link>
              </div>

              <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_8px_32px_rgba(29,42,36,0.06)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-[var(--foreground)]">Assignments</h2>
                  <Link href="/assignments" className="text-xs font-medium text-[var(--accent)] hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-[10px] border border-[var(--line)] px-4 py-3">
                    <span className="text-sm text-[var(--muted)]">Total tracked</span>
                    <span className="text-lg font-semibold text-[var(--foreground)]">{kpis.totalAssignments}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[10px] border border-[var(--line)] px-4 py-3">
                    <span className="text-sm text-[var(--muted)]">Implemented</span>
                    <span className="text-lg font-semibold text-[var(--accent)]">{kpis.implementationPercent}%</span>
                  </div>
                </div>
                {kpis.totalAssignments > 0 && (
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-strong)]">
                      <div
                        className="h-2 rounded-full bg-[var(--accent)] transition-all"
                        style={{ width: `${kpis.implementationPercent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-[11px] text-[var(--muted)]">{kpis.implementationPercent}% complete</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Priority actions */}
          <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_8px_32px_rgba(29,42,36,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">Priority actions</h2>
              <Link href="/action-center" className="text-xs font-medium text-[var(--accent)] hover:underline">
                Open queue →
              </Link>
            </div>

            {priorityActions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-medium text-[var(--foreground)]">All clear</p>
                <p className="mt-1 text-xs text-[var(--muted)]">No urgent work is currently pending in your queue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {priorityActions.map((item) => (
                  <ActionItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {actionCenter.summary.totalItems > priorityActions.length && (
              <Link
                href="/action-center"
                className="mt-4 block text-center text-xs font-medium text-[var(--accent)] hover:underline"
              >
                +{actionCenter.summary.totalItems - priorityActions.length} more queue items
              </Link>
            )}
          </div>
        </section>
      </div>
    </ProtectedAppShell>
  );
}

