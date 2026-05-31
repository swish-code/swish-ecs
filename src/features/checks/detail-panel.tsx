import Link from "next/link";
import { formatKuwaitDateTime } from "@/lib/time/kuwait";
import { checkResultStatuses, type CheckRecord, type CheckResultRecord } from "@/features/checks/types";

function statusTone(status: string | null): string {
  switch ((status ?? "").toUpperCase()) {
    case "PASS":
    case "PASSING":
    case "OK":
    case "PASSING":
      return "bg-emerald-50 text-emerald-700";
    case "FAIL":
    case "FAILING":
    case "FAILING":
      return "bg-red-50 text-red-700";
    case "NEEDS REVIEW":
    case "OVERDUE":
    case "PENDING REVIEW":
    case "PENDING EVIDENCE":
      return "bg-amber-50 text-amber-700";
    case "ACCEPTED RISK":
      return "bg-sky-50 text-sky-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export function CheckDetailPanel({
  record,
  results,
  action,
}: {
  record: CheckRecord;
  results: CheckResultRecord[];
  action: (formData: FormData) => Promise<void>;
}) {
  const scope = [record.brandName, record.departmentName, record.locationName].filter(Boolean).join(" / ") || "Global";

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">{record.checkType}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(record.latestStatus)}`}>
                {record.latestStatus ?? "No result"}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{record.checkName}</h1>
            <p className="text-sm text-[var(--muted)]">{scope}</p>
          </div>
          <Link href="/checks" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]">
            Back to checks
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetaCard label="Control" value={`${record.controlCode} · ${record.controlName}`} />
          <MetaCard label="Owner" value={record.ownerDisplayName ?? "Unassigned"} />
          <MetaCard label="Latest result" value={record.latestStatus ?? "No result"} />
          <MetaCard label="Next evaluation" value={record.nextEvaluationAt ? formatKuwaitDateTime(record.nextEvaluationAt) : "Not scheduled"} />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Definition</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Source entity</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">
                  {record.sourceEntityType ? `${record.sourceEntityType}${record.sourceEntityId ? ` #${record.sourceEntityId}` : ""}` : "Control-driven"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Severity</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">{record.severity}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Last evaluated</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">{record.lastEvaluatedAt ? formatKuwaitDateTime(record.lastEvaluatedAt) : "Not evaluated yet"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Activation</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">{record.isActive ? "Active" : "Inactive"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Related control</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Checks should remain subordinate to the control hub. Use the control detail page to review all related SOPs, documents, and other governance links around this validation.
            </p>
            <Link href={`/controls/${record.controlId}`} className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]">
              Open control
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Result history</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Latest evaluations are stored as reusable results so controls, action queues, and later reports can roll up from one source of truth.
          </p>
        </div>

        <form action={action} className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-5 md:grid-cols-2">
          <input type="hidden" name="checkId" value={record.checkId} />

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Result status</span>
            <select
              name="status"
              defaultValue={record.latestStatus && checkResultStatuses.includes(record.latestStatus as (typeof checkResultStatuses)[number]) ? record.latestStatus : "Pending Review"}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              {checkResultStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Next evaluation</span>
            <input
              type="datetime-local"
              name="nextEvaluationAt"
              defaultValue={record.nextEvaluationAt ? String(record.nextEvaluationAt).slice(0, 16) : ""}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Target entity type</span>
            <input
              name="targetEntityType"
              defaultValue={record.sourceEntityType ?? ""}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Target entity id</span>
            <input
              type="number"
              min={1}
              name="targetEntityId"
              defaultValue={record.sourceEntityId ?? ""}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Evaluation notes</span>
            <textarea
              name="detailsText"
              rows={5}
              placeholder="Capture evidence reviewed, reasoning, exceptions, or follow-up needed."
              className="rounded-3xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">Submitting creates a new immutable result entry. Leave the evaluation time blank to stamp the result at submission time.</p>
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
            >
              Record result
            </button>
          </div>
        </form>

        {results.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">No check results have been recorded yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {results.map((result) => {
              const resultScope = [result.brandName, result.departmentName, result.locationName].filter(Boolean).join(" / ") || "Global";

              return (
                <article key={result.checkResultId} className="rounded-3xl border border-[var(--line)] bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone(result.status)}`}>{result.status}</span>
                      <p className="text-sm text-[var(--muted)]">
                        {result.targetEntityType ? `${result.targetEntityType}${result.targetEntityId ? ` #${result.targetEntityId}` : ""}` : "No target entity"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-[var(--muted)]">
                      <p>{result.lastEvaluatedAt ? formatKuwaitDateTime(result.lastEvaluatedAt) : "Not evaluated"}</p>
                      <p className="mt-1">Next {result.nextEvaluationAt ? formatKuwaitDateTime(result.nextEvaluationAt) : "not scheduled"}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-[var(--foreground)]">{resultScope}</p>

                  {result.detailsText ? (
                    <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-xs leading-6 text-[var(--foreground)]">
                      {result.detailsText}
                    </pre>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}