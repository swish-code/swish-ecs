import Link from "next/link";
import type { CorrectiveActionRecord } from "@/features/capa/types";
import type { UserRecord } from "@/features/admin/types";
import { correctiveActionStatuses } from "@/types/domain";
import { formatKuwaitDate, formatKuwaitDateTime } from "@/lib/time/kuwait";

type CapaDetailPanelProps = {
  record: CorrectiveActionRecord;
  users: UserRecord[];
  action: (formData: FormData) => Promise<void>;
};

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

const severityColour: Record<string, string> = {
  Low: "text-[var(--muted)]",
  Medium: "text-amber-600",
  High: "text-orange-600",
  Critical: "text-red-600",
};

type ChecklistStep = {
  label: string;
  detail: string | null;
  done: boolean;
  current: boolean;
};

function buildChecklist(record: CorrectiveActionRecord): ChecklistStep[] {
  const statusOrder = ["Open", "In Progress", "Submitted", "Verified", "Closed"];
  const currentIdx = statusOrder.indexOf(record.status);

  const steps: ChecklistStep[] = [
    {
      label: "CAPA raised",
      detail: `Created ${formatKuwaitDateTime(record.createdAt)}`,
      done: true,
      current: currentIdx === 0,
    },
    {
      label: "Assigned to owner",
      detail: record.assignedToName ? `Assigned to ${record.assignedToName}` : null,
      done: !!record.assignedTo,
      current: currentIdx === 0 && !record.assignedTo,
    },
    {
      label: "Action in progress",
      detail: null,
      done: currentIdx >= 1,
      current: currentIdx === 1,
    },
    {
      label: "Submitted for verification",
      detail: record.submittedAt ? formatKuwaitDateTime(record.submittedAt) : null,
      done: currentIdx >= 2,
      current: currentIdx === 2,
    },
    {
      label: "Verified by auditor",
      detail: record.verifiedAt ? formatKuwaitDateTime(record.verifiedAt) : null,
      done: currentIdx >= 3,
      current: currentIdx === 3,
    },
    {
      label: "Formally closed",
      detail: record.closedAt ? formatKuwaitDateTime(record.closedAt) : null,
      done: currentIdx >= 4,
      current: currentIdx === 4,
    },
  ];

  return steps;
}

export function CapaDetailPanel({ record, users, action }: CapaDetailPanelProps) {
  const checklist = buildChecklist(record);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.9fr)]">
        <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">Corrective Action</p>
            <h1 className="text-3xl font-semibold tracking-tight">{record.title}</h1>
            {record.description ? (
              <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{record.description}</p>
            ) : null}
          </div>

          <form action={action} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="actionId" value={record.actionId} />

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Status</span>
              <select
                name="status"
                defaultValue={record.status}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              >
                {correctiveActionStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Assigned To</span>
              <select
                name="assignedTo"
                required
                defaultValue={record.assignedTo}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              >
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.displayName}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Due Date</span>
              <input
                type="date"
                name="dueDate"
                required
                defaultValue={valueOrEmpty(record.dueDate ? String(record.dueDate).split("T")[0] : null)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Remarks</span>
              <textarea
                name="remarks"
                rows={3}
                defaultValue={valueOrEmpty(record.remarks)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <div className="flex items-center gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
              >
                Save changes
              </button>
              <Link
                href="/capa"
                className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]"
              >
                Back to list
              </Link>
            </div>
          </form>
        </section>

        <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Action details</h2>
          <dl className="space-y-3 text-sm">
            {[
              {
                label: "Severity",
                value: <span className={severityColour[record.severity] ?? ""}>{record.severity}</span>,
              },
              { label: "Source", value: `${record.sourceType}${record.sourceId ? ` #${record.sourceId}` : ""}` },
              { label: "Brand", value: record.brandName },
              { label: "Department", value: record.departmentName },
              { label: "Location", value: record.locationName },
              { label: "Due date", value: formatKuwaitDate(record.dueDate) },
              {
                label: "Submitted at",
                value: record.submittedAt ? formatKuwaitDateTime(record.submittedAt) : null,
              },
              {
                label: "Verified at",
                value: record.verifiedAt ? formatKuwaitDateTime(record.verifiedAt) : null,
              },
              {
                label: "Closed at",
                value: record.closedAt ? formatKuwaitDateTime(record.closedAt) : null,
              },
              { label: "Created", value: formatKuwaitDateTime(record.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="text-[var(--muted)]">{label}</dt>
                <dd className="font-medium">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <h2 className="mb-5 text-xl font-semibold tracking-tight">Resolution checklist</h2>
        <ol className="relative space-y-0 border-l border-[var(--line)] pl-6">
          {checklist.map((step, idx) => (
            <li key={idx} className="pb-6 last:pb-0">
              <div
                className={`absolute -left-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
                  step.done
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : step.current
                      ? "border-[var(--accent)] bg-white"
                      : "border-[var(--line)] bg-white"
                }`}
                style={{ marginTop: "2px" }}
              >
                {step.done && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {step.current && !step.done && (
                  <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                )}
              </div>
              <p className={`text-sm font-medium ${step.done ? "text-[var(--foreground)]" : step.current ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-xs text-[var(--muted)]">{step.detail}</p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
