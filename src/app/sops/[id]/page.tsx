import Link from "next/link";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { notFound } from "next/navigation";
import { formatKuwaitDate, formatKuwaitDateTime } from "@/lib/time/kuwait";
import { SetupState } from "@/features/admin/setup-state";
import {
  filterBrandRecords,
  filterDepartmentRecords,
  filterLocationRecords,
  filterUserRecords,
  getBrandRecords,
  getDepartmentRecords,
  getLocationRecords,
  getUserRecords,
} from "@/features/admin/service";
import { ScopeAccessSummary } from "@/features/admin/scope-access-summary";
import { linkControlToSopFormAction } from "@/features/controls/actions";
import { listRelatedControlRecords } from "@/features/controls/service";
import { listControlRecords } from "@/features/controls/service";
import { SopApprovalPanel } from "@/features/sops/approval-panel";
import { SopForm } from "@/features/sops/form";
import { createSopVersionDraftFormAction, transitionSopFormAction, updateSopFormAction } from "@/features/sops/actions";
import { getSopRecord, listSopVersionRecords } from "@/features/sops/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";
import type { SopRecord, SopVersionRecord } from "@/features/sops/types";

export const dynamic = "force-dynamic";

const sopStatusColour: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Submitted: "bg-blue-50 text-blue-700",
  Approved: "bg-amber-50 text-amber-700",
  Active: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Archived: "bg-[var(--surface-strong)] text-[var(--muted)]",
};

const lifecycleOrder = ["Draft", "Submitted", "Approved", "Active", "Archived"] as const;
const stageIndex: Record<string, number> = {
  Draft: 0,
  Submitted: 1,
  Rejected: 1,
  Approved: 2,
  Active: 3,
  Archived: 4,
};

function MetaPill({ label }: { label: string }) {
  return (
    <span className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-2.5 py-1 text-xs text-[var(--foreground)]">
      {label}
    </span>
  );
}

function VersionMetadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function formatVersionMoment(value: string | null, fallback: string): string {
  return value ? formatKuwaitDateTime(value) : fallback;
}

function SopVersionPanel({ record, versions }: { record: SopRecord; versions: SopVersionRecord[] }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Create new draft version</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Start a new SOP draft without overwriting the approved history. The new version inherits the current metadata and file references, then opens as a draft for updates.
          </p>
        </div>

        <form action={createSopVersionDraftFormAction} className="mt-6 grid gap-4">
          <input type="hidden" name="sopId" value={record.sopId} />

          <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">New version number</span>
              <input
                name="versionNo"
                required
                placeholder="e.g. 2.0"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Draft remarks</span>
              <input
                name="remarks"
                defaultValue={record.remarks ?? ""}
                placeholder="Optional note for what is changing in this version"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3">
            <p className="text-sm text-[var(--muted)]">
              Current linked version: <span className="font-semibold text-[var(--foreground)]">v{record.versionNo}</span>. The parent SOP stays stable while the new draft opens as the next editable version.
            </p>
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
            >
              Create draft version
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Version history</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">
              Review the timeline of draft, approval, and activation events for this SOP.
            </p>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            {versions.length} version{versions.length === 1 ? "" : "s"}
          </span>
        </div>

        {versions.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">No version history is available yet for this SOP.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {versions.map((version) => (
              <article key={version.sopVersionId} className="rounded-3xl border border-[var(--line)] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">v{version.versionNo}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sopStatusColour[version.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {version.status}
                      </span>
                      {version.isCurrent ? (
                        <span className="rounded-full bg-[var(--accent)]/12 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                          Current version
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {version.fileName ? `Attached file: ${version.fileName}` : "No primary file attached yet"}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    Created {formatKuwaitDateTime(version.createdAt)}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <VersionMetadata label="Submitted" value={formatVersionMoment(version.submittedAt, "Not submitted")} />
                  <VersionMetadata label="Approved" value={formatVersionMoment(version.approvedAt, "Not approved")} />
                  <VersionMetadata label="Active from" value={version.activeFrom ? formatKuwaitDate(version.activeFrom) : "Not active"} />
                  <VersionMetadata label="Decision note" value={version.approvalRemarks ?? "No workflow note"} />
                </div>

                {version.remarks ? (
                  <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]">
                    {version.remarks}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LinkedControlsPanel({
  sopId,
  controls,
  availableControls,
}: {
  sopId: number;
  controls: Awaited<ReturnType<typeof listRelatedControlRecords>>;
  availableControls: Array<{ controlId: number; controlCode: string; controlName: string }>;
}) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Linked controls</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Controls are the shared compliance hub for this SOP. They will later drive checks, audit readiness, findings, and remediation rollups.
          </p>
        </div>
        <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
          {controls.length} linked
        </span>
      </div>

      <form action={linkControlToSopFormAction} className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-5">
        <input type="hidden" name="sopId" value={sopId} />

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_auto]">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Control</span>
            <select
              name="controlId"
              required
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="">Select control</option>
              {availableControls.map((control) => (
                <option key={control.controlId} value={control.controlId}>
                  {control.controlCode} - {control.controlName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Link role</span>
            <input
              name="linkRole"
              defaultValue="COVERS"
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="flex items-end gap-2 text-sm">
            <input type="checkbox" name="isPrimary" value="true" className="h-4 w-4 rounded border-[var(--line)]" />
            <span className="pb-3 font-medium">Primary</span>
          </label>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">Link this SOP to the shared control hub so checks, audits, and remediation can roll up correctly.</p>
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
          >
            Link control
          </button>
        </div>
      </form>

      {controls.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">No controls are linked to this SOP yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {controls.map((control) => (
            <Link
              key={control.controlId}
              href={`/controls/${control.controlId}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 transition hover:bg-[var(--surface)]"
            >
              <div>
                <p className="font-medium text-[var(--accent)]">{control.controlCode}</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">{control.controlName}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="rounded-full border border-[var(--line)] px-2 py-0.5">{control.linkRole}</span>
                {control.isPrimary ? <span className="rounded-full bg-[var(--accent)]/12 px-2 py-0.5 font-semibold text-[var(--accent)]">Primary</span> : null}
                <span className={`rounded-full px-2 py-0.5 font-medium ${sopStatusColour[control.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {control.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function SopDetailHeader({ record }: { record: SopRecord }) {
  const currentIdx = stageIndex[record.status] ?? 0;
  const isRejected = record.status === "Rejected";

  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--accent)]">{record.documentNo}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sopStatusColour[record.status] ?? "bg-slate-100 text-slate-600"}`}>
              {record.status}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{record.title}</h1>
        </div>
        <Link href="/sops" className="mt-1 shrink-0 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          ← All SOPs
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <MetaPill label={record.documentType} />
        <MetaPill label={record.complianceArea} />
        <MetaPill label={`v${record.versionNo}`} />
        {record.brandName && <MetaPill label={record.brandName} />}
        {record.departmentName && <MetaPill label={record.departmentName} />}
        {record.locationName && <MetaPill label={record.locationName} />}
        {record.ownerDisplayName && <MetaPill label={`Owner: ${record.ownerDisplayName}`} />}
      </div>

      <div className="mt-6">
        <div className="flex items-center">
          {lifecycleOrder.flatMap((stage, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isCurrentRejected = isRejected && stage === "Submitted";
            const dotActive = isCompleted || isCurrent;
            const lineActive = idx > 0 && idx <= currentIdx;

            const dot = (
              <div key={stage} className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full border-2 transition-colors ${
                    isCurrentRejected
                      ? "border-red-500 bg-red-500"
                      : dotActive
                        ? "border-[var(--accent)] bg-[var(--accent)]"
                        : "border-[var(--line)] bg-white"
                  }`}
                />
                <span
                  className={`whitespace-nowrap text-[10px] uppercase tracking-[0.08em] ${
                    isCurrentRejected
                      ? "font-semibold text-red-600"
                      : isCurrent
                        ? "font-semibold text-[var(--accent)]"
                        : isCompleted
                          ? "text-[var(--accent)]"
                          : "text-[var(--muted)]"
                  }`}
                >
                  {isCurrentRejected ? "Rejected" : stage}
                </span>
              </div>
            );

            if (idx === 0) return [dot];
            const line = (
              <div
                key={`line-${stage}`}
                className={`mb-4 h-px flex-1 transition-colors ${lineActive ? "bg-[var(--accent)]" : "bg-[var(--line)]"}`}
              />
            );
            return [line, dot];
          })}
        </div>
      </div>
    </div>
  );
}

export default async function SopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;
  const sopId = Number(id);
  const session = await requireCurrentSession();
  const [record, versions, relatedControls, allControls] = await Promise.all([
    getSopRecord(sopId, session.user),
    listSopVersionRecords(sopId, session.user),
    listRelatedControlRecords("SOP", sopId, session.user),
    listControlRecords(session.user),
  ]);

  if (!record) {
    notFound();
  }

  const [brands, departments, locations, users] = await Promise.all([
    getBrandRecords(),
    getDepartmentRecords(),
    getLocationRecords(),
    getUserRecords(),
  ]);

  const scopedBrands = filterBrandRecords(brands, session.user);
  const scopedDepartments = filterDepartmentRecords(departments, session.user);
  const scopedLocations = filterLocationRecords(locations, session.user);
  const scopedUsers = filterUserRecords(users, session.user);
  const availableControls = allControls.filter((control) => !relatedControls.some((item) => item.controlId === control.controlId));

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
      <div className="space-y-6">
        <SopDetailHeader record={record} />
        <ScopeAccessSummary
          user={session.user}
          brands={scopedBrands}
          departments={scopedDepartments}
          locations={scopedLocations}
          users={scopedUsers}
        />
        <LinkedControlsPanel sopId={sopId} controls={relatedControls} availableControls={availableControls} />
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.9fr)]">
          <SopForm
            title="Edit SOP"
            description="Update the SOP register entry and the currently linked version. Scope, ownership, and SharePoint storage stay on the parent SOP record; status, file metadata, and remarks resolve from the current version. To create a new version history entry, use the dedicated draft version panel instead of editing the current version number here."
            action={updateSopFormAction}
            brands={scopedBrands}
            departments={scopedDepartments}
            locations={scopedLocations}
            users={scopedUsers}
            initialValues={record}
            submitLabel="Save changes"
          />
          <div className="space-y-6">
            <SopApprovalPanel record={record} action={transitionSopFormAction} />
            <SopVersionPanel record={record} versions={versions} />
          </div>
        </div>
      </div>
    </ProtectedAppShell>
  );
}
