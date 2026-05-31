"use client";

import type { AuditResponseRecord, ChecklistItemRecord } from "@/features/audits/types";
import type { AuditResult } from "@/types/domain";

type ChecklistExecutionProps = {
  auditId: number;
  items: ChecklistItemRecord[];
  existingResponses: AuditResponseRecord[];
  action: (formData: FormData) => Promise<void>;
  isCompleted: boolean;
};

const resultOptions: AuditResult[] = ["Pass", "Fail", "Not Applicable"];

const resultStyle: Record<AuditResult, string> = {
  Pass: "border-emerald-400 bg-emerald-50 text-emerald-700",
  Fail: "border-red-400 bg-red-50 text-red-700",
  "Not Applicable": "border-gray-300 bg-gray-50 text-gray-500",
};

const resultStyleSelected: Record<AuditResult, string> = {
  Pass: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-100 text-emerald-800 font-semibold",
  Fail: "ring-2 ring-red-500 border-red-500 bg-red-100 text-red-800 font-semibold",
  "Not Applicable": "ring-2 ring-gray-400 border-gray-400 bg-gray-100 text-gray-600 font-semibold",
};

function groupBySection(items: ChecklistItemRecord[]): Map<string, ChecklistItemRecord[]> {
  const grouped = new Map<string, ChecklistItemRecord[]>();

  for (const item of items) {
    const section = item.sectionName ?? "General";
    const existing = grouped.get(section) ?? [];
    existing.push(item);
    grouped.set(section, existing);
  }

  return grouped;
}

export function ChecklistExecution({
  auditId,
  items,
  existingResponses,
  action,
  isCompleted,
}: ChecklistExecutionProps) {
  const responseMap = new Map(existingResponses.map((r) => [r.itemId, r]));
  const grouped = groupBySection(items);

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <p className="text-[var(--muted)]">
          This template has no checklist items yet. Add items from the{" "}
          <a href="/audits/templates" className="text-[var(--accent)] hover:underline">
            template management page
          </a>{" "}
          before executing audits.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isCompleted ? "Audit responses (read-only)" : "Checklist execution"}
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          {isCompleted
            ? "This audit is completed. Responses are shown below."
            : "Record a response for each item. You can save your progress or complete the audit when all items are answered."}
        </p>
      </div>

      <form action={action}>
        <input type="hidden" name="auditId" value={auditId} />

        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([section, sectionItems]) => (
            <div key={section}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{section}</p>
              <div className="space-y-4">
                {sectionItems.map((item) => {
                  const existing = responseMap.get(item.itemId);

                  return (
                    <div
                      key={item.itemId}
                      className="rounded-2xl border border-[var(--line)] bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="flex-1 text-sm leading-6 text-[var(--foreground)]">
                          {item.itemText}
                          {item.weight !== 1 ? (
                            <span className="ml-2 text-xs text-[var(--muted)]">(weight: {item.weight})</span>
                          ) : null}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {resultOptions.map((option) => {
                          const isSelected = existing?.result === option;

                          return (
                            <label
                              key={option}
                              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                                isSelected
                                  ? resultStyleSelected[option]
                                  : resultStyle[option]
                              } ${isCompleted ? "pointer-events-none" : ""}`}
                            >
                              <input
                                type="radio"
                                name={`result_${item.itemId}`}
                                value={option}
                                defaultChecked={isSelected}
                                disabled={isCompleted}
                                className="sr-only"
                              />
                              {option}
                            </label>
                          );
                        })}
                      </div>

                      <div className="mt-3">
                        <input
                          type="text"
                          name={`comments_${item.itemId}`}
                          defaultValue={existing?.comments ?? ""}
                          disabled={isCompleted}
                          placeholder="Optional comments for this item"
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] disabled:bg-gray-50 disabled:text-[var(--muted)]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!isCompleted ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              name="complete"
              value="0"
              formAction={action}
              className="rounded-full border border-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--background)]"
            >
              Save progress
            </button>
            <button
              type="submit"
              name="complete"
              value="1"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
            >
              Complete audit
            </button>
            <p className="text-xs text-[var(--muted)]">
              Completing the audit will calculate the score and lock responses.
            </p>
          </div>
        ) : null}
      </form>
    </section>
  );
}
