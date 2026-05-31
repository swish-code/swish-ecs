import Link from "next/link";
import type { AssignmentRecord } from "@/features/assignments/types";
import type { ControlRecord } from "@/features/controls/types";
import type { DocumentRecord } from "@/features/evidence/types";
import { formatKuwaitDate, formatKuwaitDateTime } from "@/lib/time/kuwait";

type RolloutAction = {
  key: string;
  category: "Controls" | "Documents" | "Assignments";
  title: string;
  detail: string;
  href: string;
  priority: number;
};

function formatOptionalDateTime(value: string | null): string {
  return value ? formatKuwaitDateTime(value) : "-";
}

const assignmentStatusColour: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-600",
  "In Progress": "bg-amber-50 text-amber-700",
  Implemented: "bg-blue-50 text-blue-700",
  Verified: "bg-emerald-50 text-emerald-700",
  Delayed: "bg-red-50 text-red-700",
  "Not Applicable": "bg-[var(--surface-strong)] text-[var(--muted)]",
};

function AssignmentStatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${assignmentStatusColour[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function isPast(dateValue: string | null): boolean {
  if (!dateValue) {
    return false;
  }

  const value = new Date(dateValue);
  if (Number.isNaN(value.getTime())) {
    return false;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return value < now;
}

const summaryOrder: AssignmentRecord["status"][] = [
  "Not Started",
  "In Progress",
  "Implemented",
  "Verified",
  "Delayed",
  "Not Applicable",
];

function buildRolloutActions(rows: AssignmentRecord[], controls: ControlRecord[], documents: DocumentRecord[]): RolloutAction[] {
  const controlActions = controls.flatMap<RolloutAction>((control) => {
    const actions: RolloutAction[] = [];
    const status = control.status.toUpperCase();

    if (["DRAFT", "PLANNED", "INACTIVE"].includes(status)) {
      actions.push({
        key: `control-status-${control.controlId}`,
        category: "Controls",
        title: `Move ${control.controlCode} into active rollout`,
        detail: `${control.controlName} is still ${control.status.toLowerCase()}.`,
        href: `/controls/${control.controlId}`,
        priority: 10,
      });
    }

    if (status === "ACTIVE" && control.checkLinkCount === 0) {
      actions.push({
        key: `control-check-${control.controlId}`,
        category: "Controls",
        title: `Add a test for ${control.controlCode}`,
        detail: `${control.controlName} has no linked validation yet.`,
        href: `/controls/${control.controlId}`,
        priority: 20,
      });
    }

    if (status === "ACTIVE" && control.documentLinkCount === 0 && control.sopLinkCount === 0) {
      actions.push({
        key: `control-evidence-${control.controlId}`,
        category: "Controls",
        title: `Link evidence to ${control.controlCode}`,
        detail: `${control.controlName} is active but has no policy or document backing.`,
        href: `/controls/${control.controlId}`,
        priority: 30,
      });
    }

    return actions;
  });

  const documentActions = documents.flatMap<RolloutAction>((document) => {
    const actions: RolloutAction[] = [];
    const status = document.status.toUpperCase();

    if (status === "DRAFT") {
      actions.push({
        key: `document-draft-${document.documentId}`,
        category: "Documents",
        title: `Finalize ${document.documentName}`,
        detail: "Document is still in draft and not ready for governed rollout.",
        href: `/documents/${document.documentId}`,
        priority: 15,
      });
    }

    if (document.currentEvidenceId === null) {
      actions.push({
        key: `document-file-${document.documentId}`,
        category: "Documents",
        title: `Add governed version for ${document.documentName}`,
        detail: "This document has no active governed file attached.",
        href: `/documents/${document.documentId}`,
        priority: 25,
      });
    } else if (isPast(document.expiryDate)) {
      actions.push({
        key: `document-expiry-${document.documentId}`,
        category: "Documents",
        title: `Replace expired evidence for ${document.documentName}`,
        detail: "The current governed version is expired.",
        href: `/documents/${document.documentId}`,
        priority: 5,
      });
    } else if (isPast(document.reviewDate)) {
      actions.push({
        key: `document-review-${document.documentId}`,
        category: "Documents",
        title: `Review ${document.documentName}`,
        detail: "The current governed version is past its review date.",
        href: `/documents/${document.documentId}`,
        priority: 12,
      });
    }

    return actions;
  });

  const assignmentActions = rows.flatMap<RolloutAction>((row) => {
    if (row.status === "Delayed") {
      return [
        {
          key: `assignment-delayed-${row.assignmentId}`,
          category: "Assignments",
          title: `Recover delayed milestone ${row.documentNo}`,
          detail: `${row.sopTitle} is marked delayed and needs re-planning or completion evidence.`,
          href: `/assignments/${row.assignmentId}`,
          priority: 18,
        },
      ];
    }

    if (row.status === "Not Started") {
      return [
        {
          key: `assignment-start-${row.assignmentId}`,
          category: "Assignments",
          title: `Start milestone ${row.documentNo}`,
          detail: `${row.sopTitle} has not been started yet.`,
          href: `/assignments/${row.assignmentId}`,
          priority: 35,
        },
      ];
    }

    return [];
  });

  return [...controlActions, ...documentActions, ...assignmentActions]
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 8);
}

export function AssignmentListTable({ rows, controls, documents }: { rows: AssignmentRecord[]; controls: ControlRecord[]; documents: DocumentRecord[] }) {
  const statusCounts = summaryOrder.map((status) => ({
    status,
    count: rows.filter((row) => row.status === status).length,
  }));
  const controlsBlockingReadiness = controls.filter(
    (row) => ["DRAFT", "PLANNED", "INACTIVE"].includes(row.status.toUpperCase()) || (row.status.toUpperCase() === "ACTIVE" && row.checkLinkCount === 0),
  );
  const documentsBlockingReadiness = documents.filter(
    (row) => row.status.toUpperCase() === "DRAFT" || row.currentEvidenceId === null || isPast(row.reviewDate) || isPast(row.expiryDate),
  );
  const rolloutActions = buildRolloutActions(rows, controls, documents);
  const actionTone: Record<RolloutAction["category"], string> = {
    Controls: "bg-blue-50 text-blue-700",
    Documents: "bg-amber-50 text-amber-700",
    Assignments: "bg-emerald-50 text-emerald-700",
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Roadmap</h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Guided rollout register for current program work across approved policies, owners, due dates, completion state, and verification progress.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {statusCounts.map((item) => (
            <div key={item.status} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.status}</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Program blockers</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Roadmap should reflect readiness blockers from source-of-truth modules, not only assignment rows. These control and document gaps are the next candidates for roadmap seeding and automated milestone health.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Controls blocking rollout", value: controlsBlockingReadiness.length },
            { label: "Documents blocking rollout", value: documentsBlockingReadiness.length },
            { label: "Delayed assignments", value: rows.filter((row) => row.status === "Delayed").length },
            { label: "Unstarted assignments", value: rows.filter((row) => row.status === "Not Started").length },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Controls to finish</h3>
            {controlsBlockingReadiness.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">No control blockers are currently visible.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {controlsBlockingReadiness.slice(0, 6).map((control) => (
                  <Link key={control.controlId} href={`/controls/${control.controlId}`} className="block rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition hover:bg-white">
                    <p className="font-medium text-[var(--accent)]">{control.controlCode}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{control.controlName}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {["DRAFT", "PLANNED", "INACTIVE"].includes(control.status.toUpperCase()) ? `Status: ${control.status}` : "No linked tests yet"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Documents to govern</h3>
            {documentsBlockingReadiness.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">No document blockers are currently visible.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {documentsBlockingReadiness.slice(0, 6).map((document) => (
                  <Link key={document.documentId} href={`/documents/${document.documentId}`} className="block rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition hover:bg-white">
                    <p className="font-medium text-[var(--accent)]">{document.documentName}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{document.fileName ?? document.documentType}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {document.status.toUpperCase() === "DRAFT"
                        ? "Still in draft"
                        : document.currentEvidenceId === null
                          ? "Missing governed file"
                          : isPast(document.expiryDate)
                            ? "Expired document"
                            : "Review overdue"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Recommended next actions</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
            These rollout actions are derived from current source records so the roadmap shows what should happen next even before milestone auto-seeding exists.
          </p>
        </div>

        {rolloutActions.length === 0 ? (
          <p className="mt-5 text-sm text-[var(--muted)]">No immediate rollout actions are visible from current controls, documents, or assignments.</p>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {rolloutActions.map((action) => (
              <Link key={action.key} href={action.href} className="rounded-3xl border border-[var(--line)] bg-white p-5 transition hover:bg-[var(--surface)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[var(--foreground)]">{action.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{action.detail}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${actionTone[action.category]}`}>{action.category}</span>
                </div>
                <p className="mt-4 text-sm font-medium text-[var(--accent)]">Open source record</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                {[
                  "Document No",
                  "Title",
                  "Brand",
                  "Department",
                  "Location",
                  "Owner",
                  "Status",
                  "Target Date",
                  "Completed",
                ].map((heading) => (
                  <th key={heading} className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-[var(--muted)]">
                    No implementation assignments yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.assignmentId} className="hover:bg-[var(--surface-hover,#f7faf8)]">
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <Link
                        href={`/assignments/${row.assignmentId}`}
                        className="font-medium text-[var(--accent)] hover:underline"
                      >
                        {row.documentNo}
                      </Link>
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.sopTitle}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.brandName ?? "-"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.departmentName ?? "-"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.locationName ?? "-"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">{row.ownerDisplayName ?? "-"}</td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      <AssignmentStatusBadge status={row.status} />
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      {row.targetDate ? formatKuwaitDate(row.targetDate) : "-"}
                    </td>
                    <td className="border-b border-[var(--line)]/60 px-4 py-3">
                      {formatOptionalDateTime(row.completedAt)}
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