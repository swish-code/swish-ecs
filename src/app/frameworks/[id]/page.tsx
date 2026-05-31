import Link from "next/link";
import { notFound } from "next/navigation";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { listAuditRecords } from "@/features/audits/service";
import { listCheckRecords } from "@/features/checks/service";
import { listControlRecords } from "@/features/controls/service";
import { getDashboardKpis } from "@/features/dashboard/service";
import { listDocumentRecords } from "@/features/evidence/service";
import { listSopRecords } from "@/features/sops/service";
import { requireCurrentSession } from "@/lib/auth/session";
import { hasSnowflakeConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

const ACTIVE_FRAMEWORK_ID = "phase-1";

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export default async function FrameworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;

  if (id !== ACTIVE_FRAMEWORK_ID) {
    notFound();
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
  const controlsWithDocuments = controls.filter((row) => row.documentLinkCount > 0).length;
  const policiesAwaitingDecision = kpis.submittedSops + kpis.approvedSops;
  const documentsNeedingReview = documents.filter((row) => row.reviewDate || row.expiryDate).length;

  return (
    <ProtectedAppShell
      allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"]}
      session={session}
    >
      <section className="space-y-6">
        <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">SWiSH Phase 1</p>
              <h1 className="text-3xl font-semibold tracking-tight">Operational Compliance Framework</h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
                Computed framework detail for the current rollout. This view brings together the program-level readiness signals that already exist across policies, controls, documents, tests, audits, roadmap work, and reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
              <Link href="/roadmap" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]">
                Open roadmap
              </Link>
              <Link href="/frameworks" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]">
                Back to frameworks
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Roadmap completion" value={`${kpis.implementationPercent}%`} />
            <Metric label="Active policies" value={kpis.activeSops} />
            <Metric label="Controls" value={controls.length} />
            <Metric label="Documents" value={documents.length} />
            <Metric label="Tests needing attention" value={testsNeedingAttention} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Framework coverage</h2>
              <p className="text-sm leading-7 text-[var(--muted)]">
                These modules currently define the active framework. The next implementation slices should project more of their state directly into this page instead of relying on manual interpretation.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: "Policies awaiting decision", value: policiesAwaitingDecision, href: "/sops" },
                { label: "Controls linked to documents", value: controlsWithDocuments, href: "/controls" },
                { label: "Documents with review dates", value: documentsNeedingReview, href: "/documents" },
                { label: "Tests", value: checks.length, href: "/tests" },
                { label: "Audits", value: audits.length, href: "/audits" },
                { label: "Reports", value: "Live", href: "/reports" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-4 transition hover:bg-[var(--surface)]">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Primary actions</h2>
              <p className="text-sm leading-7 text-[var(--muted)]">
                Until framework persistence exists, the active program is driven through the underlying source modules.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { href: "/controls/new", label: "Add control", detail: "Extend the reusable control set for this framework." },
                { href: "/documents/new", label: "Add document", detail: "Create a governed document and initial file version." },
                { href: "/sops/new", label: "Add policy", detail: "Draft a new policy or SOP for framework coverage." },
                { href: "/roadmap", label: "Review roadmap", detail: "Open staged rollout work and completion status." },
                { href: "/reports", label: "Open reports", detail: "Review the rolled-up management view." },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-2xl border border-[var(--line)] bg-white px-4 py-4 transition hover:bg-[var(--surface)]">
                  <p className="font-semibold text-[var(--foreground)]">{item.label}</p>
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