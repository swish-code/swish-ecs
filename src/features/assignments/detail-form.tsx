import Link from "next/link";
import type { AssignmentRecord } from "@/features/assignments/types";
import { assignmentStatuses } from "@/types/domain";
import { formatKuwaitDate, formatKuwaitDateTime } from "@/lib/time/kuwait";

type AssignmentDetailFormProps = {
  record: AssignmentRecord;
  action: (formData: FormData) => Promise<void>;
};

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

const statusColour: Record<string, string> = {
  "Not Started": "bg-gray-100 text-gray-600",
  "In Progress": "bg-amber-50 text-amber-700",
  Implemented: "bg-blue-50 text-blue-700",
  Verified: "bg-emerald-50 text-emerald-700",
  Delayed: "bg-red-50 text-red-700",
  "Not Applicable": "bg-[var(--surface)] text-[var(--muted)]",
};

export function AssignmentDetailForm({ record, action }: AssignmentDetailFormProps) {
  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.9fr)]">
      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">Implementation Assignment</p>
          <h1 className="text-3xl font-semibold tracking-tight">{record.documentNo}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{record.sopTitle}</p>
        </div>

        <form action={action} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="assignmentId" value={record.assignmentId} />

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Status</span>
            <select
              name="status"
              defaultValue={record.status}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              {assignmentStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Target Date</span>
            <input
              type="date"
              name="targetDate"
              defaultValue={valueOrEmpty(record.targetDate ? String(record.targetDate).split("T")[0] : null)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <div className="hidden md:block" />

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
              href="/assignments"
              className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]"
            >
              Back to list
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Assignment details</h2>
        <dl className="space-y-3 text-sm">
          {[
            {
              label: "Source SOP",
              value: (
                <Link href={`/sops/${record.sopId}`} className="font-medium text-[var(--accent)] hover:underline">
                  {record.documentNo}
                </Link>
              ),
            },
            { label: "Brand", value: record.brandName },
            { label: "Department", value: record.departmentName },
            { label: "Location", value: record.locationName },
            { label: "Owner", value: record.ownerDisplayName },
            {
              label: "Status",
              value: (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColour[record.status] ?? ""}`}>
                  {record.status}
                </span>
              ),
            },
            { label: "Target date", value: record.targetDate ? formatKuwaitDate(record.targetDate) : null },
            { label: "Completed at", value: record.completedAt ? formatKuwaitDateTime(record.completedAt) : null },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-[var(--muted)]">{label}</dt>
              <dd className="font-medium">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
