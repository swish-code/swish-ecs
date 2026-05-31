import Link from "next/link";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { listAuditRecords } from "@/features/audits/service";
import { listCheckRecords } from "@/features/checks/service";
import { listControlRecords } from "@/features/controls/service";
import { getDashboardKpis } from "@/features/dashboard/service";
import { listDocumentRecords } from "@/features/evidence/service";
import { listSopRecords } from "@/features/sops/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export default async function FrameworksPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const [kpis, controls, policies, documents, checks, audits] = await Promise.all([
    getDashboardKpis(),
    listControlRecords(session.user),
    listSopRecords(session.user),
    listDocumentRecords(session.user),
    listCheckRecords(session.user),
    listAuditRecords(session.user),
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Frameworks</h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
                Current framework workspace for the SWiSH Phase 1 operating model. This page organizes the active compliance scope through linked policies, controls, documents, tests, and audits in a Vanta-style top-level entry point.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Policies" value={policies.length} />
            <Metric label="Controls" value={controls.length} />
            <Metric label="Documents" value={documents.length} />
            <Metric label="Tests" value={checks.length} />
            <Metric label="Audits" value={audits.length} />
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Active framework</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                The current application scope is centered on one active internal framework: governed policies, linked controls, governed documents, persistent tests, and audit execution.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/frameworks/phase-1" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]">
                View details
              </Link>
              <Link href="/roadmap" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]">
                Open roadmap
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-[var(--line)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">SWiSH Phase 1</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">Operational Compliance Framework</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">Single active framework for current rollout, audit readiness, and governed compliance execution.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">Active</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">Operations</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Active policies" value={kpis.activeSops} />
              <Metric label="Pending decisions" value={kpis.submittedSops + kpis.approvedSops} />
              <Metric label="Roadmap completion" value={`${kpis.implementationPercent}%`} />
              <Metric label="Tests needing attention" value={testsNeedingAttention} />
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Coverage surfaces</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Policies", "Controls", "Documents", "Tests", "Audits"].map((label) => (
                    <span key={label} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">{label}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Open this framework through</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { href: "/controls", label: "Controls" },
                    { href: "/sops", label: "Policies" },
                    { href: "/documents", label: "Documents" },
                    { href: "/tests", label: "Tests" },
                    { href: "/audits", label: "Audits" },
                    { href: "/frameworks/phase-1", label: "Framework detail" },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--line)]">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ProtectedAppShell>
  );
}