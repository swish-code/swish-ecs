import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { notFound } from "next/navigation";
import { SetupState } from "@/features/admin/setup-state";
import { ChecklistExecution } from "@/features/audits/checklist-execution";
import { saveAuditResponsesFormAction } from "@/features/audits/actions";
import { raiseCapaFromAuditAction } from "@/features/capa/actions";
import {
  getAuditRecord,
  getAuditResponses,
  getChecklistItems,
} from "@/features/audits/service";
import { getUserRecords, filterUserRecords } from "@/features/admin/service";
import { severityLevels } from "@/types/domain";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";
import { formatKuwaitDate, formatKuwaitDateTime } from "@/lib/time/kuwait";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;
  const auditId = Number(id);
  const session = await requireCurrentSession();
  const audit = await getAuditRecord(auditId, session.user);

  if (!audit) {
    notFound();
  }

  const [items, responses, allUsers] = await Promise.all([
    getChecklistItems(audit.templateId),
    getAuditResponses(auditId),
    getUserRecords(),
  ]);

  const users = filterUserRecords(allUsers, session.user);
  const isCompleted = audit.status === "Completed";

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"]}>
      <div className="space-y-6">
        {/* Audit header */}
        <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                {audit.complianceArea}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">{audit.templateName}</h1>
              <p className="text-sm text-[var(--muted)]">
                {[audit.brandName, audit.departmentName, audit.locationName].filter(Boolean).join(" · ")}
                {audit.performedByName ? ` · ${audit.performedByName}` : ""}
              </p>
            </div>
            <Link
              href="/audits"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]"
            >
              Back to list
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Status", value: audit.status },
              { label: "Started", value: formatKuwaitDateTime(audit.startedAt) },
              {
                label: "Completed",
                value: audit.completedAt ? formatKuwaitDateTime(audit.completedAt) : "In progress",
              },
              {
                label: "Score",
                value: audit.scorePercent !== null ? `${audit.scorePercent}%` : "—",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{item.value}</p>
              </div>
            ))}
          </div>

          {audit.remarks ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              <span className="font-medium">Remarks:</span> {audit.remarks}
            </p>
          ) : null}
        </section>

        {/* Checklist */}
        <ChecklistExecution
          auditId={auditId}
          items={items}
          existingResponses={responses}
          action={saveAuditResponsesFormAction}
          isCompleted={isCompleted}
        />

        {/* Score breakdown for completed audits */}
        {isCompleted && responses.length > 0 ? (() => {
          const passCount = responses.filter((r) => r.result === "Pass").length;
          const failCount = responses.filter((r) => r.result === "Fail").length;
          const naCount = responses.filter((r) => r.result === "Not Applicable").length;
          const scored = passCount + failCount;
          const pct = audit.scorePercent ?? (scored > 0 ? Math.round((passCount / scored) * 100) : 0);
          const scoreColour = pct >= 80 ? "text-emerald-700" : pct >= 60 ? "text-amber-600" : "text-red-600";
          const barColour = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";

          return (
            <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
              <h2 className="mb-5 text-xl font-semibold tracking-tight">Score summary</h2>
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex flex-col items-center">
                  <span className={`text-5xl font-bold tabular-nums ${scoreColour}`}>{pct}%</span>
                  <span className="mt-1.5 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Compliance score</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-[var(--surface-strong)]">
                    <div className={`h-full rounded-full transition-all ${barColour}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {([
                      { label: "Pass", count: passCount, colour: "text-emerald-700" },
                      { label: "Fail", count: failCount, colour: "text-red-600" },
                      { label: "N/A", count: naCount, colour: "text-[var(--muted)]" },
                    ] as const).map(({ label, count, colour }) => (
                      <div key={label} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
                        <p className={`mt-2 text-2xl font-semibold ${colour}`}>{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })() : null}

        {/* Raise CAPA from audit findings */}
        {isCompleted ? (
          <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
            <div className="mb-5 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">Raise a corrective action</h2>
              <p className="text-sm text-[var(--muted)]">
                Log a CAPA linked to this audit. The action will appear in the Corrective Actions register with source reference <span className="font-medium text-[var(--foreground)]">Audit #{auditId}</span>.
              </p>
            </div>

            <form action={raiseCapaFromAuditAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="auditId" value={auditId} />
              {audit.brandId != null && <input type="hidden" name="brandId" value={audit.brandId} />}
              {audit.departmentId != null && <input type="hidden" name="departmentId" value={audit.departmentId} />}
              {audit.locationId != null && <input type="hidden" name="locationId" value={audit.locationId} />}

              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium">Title <span className="text-red-500">*</span></span>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Temperature log not maintained for cold storage"
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium">Description</span>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Describe the finding in detail"
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Severity <span className="text-red-500">*</span></span>
                <select
                  name="severity"
                  defaultValue="Medium"
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                >
                  {severityLevels.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Assigned To <span className="text-red-500">*</span></span>
                <select
                  name="assignedTo"
                  required
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                >
                  <option value="">— select owner —</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>{u.displayName}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Due Date <span className="text-red-500">*</span></span>
                <input
                  type="date"
                  name="dueDate"
                  required
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Remarks</span>
                <input
                  type="text"
                  name="remarks"
                  placeholder="Optional additional notes"
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
                >
                  Raise CAPA
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </ProtectedAppShell>
  );
}
