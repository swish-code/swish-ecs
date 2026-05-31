import Link from "next/link";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { getActionCenterItems } from "@/features/action-center/service";
import { listCheckRecords } from "@/features/checks/service";
import { getDashboardKpis } from "@/features/dashboard/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function ReportCard({
  title,
  value,
  detail,
  href,
}: {
  title: string;
  value: string | number;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_8px_32px_rgba(29,42,36,0.06)] transition hover:border-[var(--accent)]"
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">{title}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-1.5 text-xs text-[var(--muted)]">{detail}</p>
    </Link>
  );
}

export default async function ReportsPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const [kpis, actionCenter, checks] = await Promise.all([
    getDashboardKpis(),
    getActionCenterItems(session.user),
    listCheckRecords(session.user),
  ]);

  const testsNeedingAttention = checks.filter((row) =>
    ["FAIL", "FAILING", "NEEDS REVIEW", "OVERDUE"].includes((row.latestStatus ?? "").toUpperCase()),
  ).length;

  return (
    <ProtectedAppShell
      allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"]}
      session={session}
    >
      <section className="space-y-6">
        <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Management visibility across current policies, roadmap execution, audits, tests, and open work. This page is the reporting surface, not the day-to-day execution queue.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportCard
              title="Policies"
              value={kpis.totalSops}
              detail={`${kpis.activeSops} active · ${kpis.submittedSops + kpis.approvedSops} awaiting decision`}
              href="/sops"
            />
            <ReportCard
              title="Roadmap completion"
              value={`${kpis.implementationPercent}%`}
              detail={`${kpis.totalAssignments} rollout items tracked`}
              href="/roadmap"
            />
            <ReportCard
              title="Audits"
              value={kpis.ongoingAudits + kpis.completedAudits}
              detail={`${kpis.ongoingAudits} in progress · ${kpis.completedAudits} completed`}
              href="/audits"
            />
            <ReportCard
              title="Open work"
              value={actionCenter.summary.totalItems}
              detail={`${testsNeedingAttention} tests need attention`}
              href="/my-work"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Program readiness snapshot</h2>
              <Link href="/frameworks" className="text-sm font-medium text-[var(--accent)] hover:underline">
                Open frameworks
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Submitted policies</p>
                <p className="mt-3 text-2xl font-semibold">{kpis.submittedSops}</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Overdue work</p>
                <p className="mt-3 text-2xl font-semibold">{actionCenter.summary.overdueItems}</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Open remediation</p>
                <p className="mt-3 text-2xl font-semibold">{actionCenter.summary.remediationItems}</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Tests needing attention</p>
                <p className="mt-3 text-2xl font-semibold">{testsNeedingAttention}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Drill-down surfaces</h2>
              <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Current scope</span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { href: "/my-work", label: "My Work", detail: "Approvals, reviews, and remediation tasks" },
                { href: "/roadmap", label: "Roadmap", detail: "Guided rollout and milestone execution" },
                { href: "/tests", label: "Tests", detail: "Validation outcomes and latest results" },
                { href: "/documents", label: "Documents", detail: "Governed evidence and freshness tracking" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-2xl border border-[var(--line)] bg-white px-4 py-4 transition hover:bg-[var(--surface)]">
                  <p className="font-medium text-[var(--foreground)]">{item.label}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ProtectedAppShell>
  );
}