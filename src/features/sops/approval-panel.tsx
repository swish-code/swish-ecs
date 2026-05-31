import { formatKuwaitDate, formatKuwaitDateTime } from "@/lib/time/kuwait";
import type { SopRecord } from "@/features/sops/types";

type ApprovalPanelProps = {
  record: SopRecord;
  action: (formData: FormData) => Promise<void>;
};

const transitionLabels: Record<SopRecord["status"], Array<{ status: string; label: string }>> = {
  Draft: [{ status: "Submitted", label: "Submit for approval" }],
  Submitted: [
    { status: "Approved", label: "Approve" },
    { status: "Rejected", label: "Reject" },
  ],
  Approved: [{ status: "Active", label: "Mark active" }],
  Rejected: [{ status: "Submitted", label: "Resubmit" }],
  Active: [{ status: "Archived", label: "Archive" }],
  Archived: [],
};

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="break-words text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm text-[var(--foreground)] break-words">{value}</p>
    </div>
  );
}

export function SopApprovalPanel({ record, action }: ApprovalPanelProps) {
  const transitions = transitionLabels[record.status];

  return (
    <section className="min-w-0 rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Approval workflow</h2>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Use this panel to move the SOP through the controlled lifecycle without manually changing timestamps or approval metadata.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetadataItem label="Current status" value={record.status} />
        <MetadataItem
          label="Submitted at"
          value={record.submittedAt ? formatKuwaitDateTime(record.submittedAt) : "Not submitted"}
        />
        <MetadataItem
          label="Approved at"
          value={record.approvedAt ? formatKuwaitDateTime(record.approvedAt) : "Not approved"}
        />
        <MetadataItem
          label="Active from"
          value={record.activeFrom ? formatKuwaitDate(record.activeFrom) : "Not active"}
        />
      </div>

      {transitions.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">This SOP is archived. No further workflow actions are available.</p>
      ) : (
        <form action={action} className="mt-6 grid gap-4">
          <input type="hidden" name="sopId" value={record.sopId} />

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Workflow remarks</span>
            <textarea
              name="approvalRemarks"
              defaultValue={record.approvalRemarks ?? ""}
              rows={4}
              placeholder="Optional note for approval, rejection, resubmission, or archival."
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            {transitions.map((transition) => (
              <button
                key={transition.status}
                type="submit"
                name="status"
                value={transition.status}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
              >
                {transition.label}
              </button>
            ))}
          </div>
        </form>
      )}
    </section>
  );
}