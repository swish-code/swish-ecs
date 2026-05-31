import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { notFound } from "next/navigation";
import { SetupState } from "@/features/admin/setup-state";
import { addChecklistItemFormAction } from "@/features/audits/actions";
import { getChecklistItems, listAuditTemplateRecords } from "@/features/audits/service";
import { hasSnowflakeConfig } from "@/lib/env";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AuditTemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;
  const templateId = Number(id);
  const [templates, items] = await Promise.all([listAuditTemplateRecords(), getChecklistItems(templateId)]);
  const template = templates.find((t) => t.templateId === templateId);

  if (!template) {
    notFound();
  }

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                {template.complianceArea}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">{template.templateName}</h1>
              <p className="text-sm text-[var(--muted)]">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>
            <Link
              href="/audits/templates"
              className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]"
            >
              Back to templates
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--muted)]">No items yet. Add items below.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.itemId}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-4"
                >
                  <span className="mt-0.5 min-w-[24px] text-xs font-medium text-[var(--muted)]">{index + 1}.</span>
                  <div className="flex-1">
                    {item.sectionName ? (
                      <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
                        {item.sectionName}
                      </p>
                    ) : null}
                    <p className="text-sm text-[var(--foreground)]">{item.itemText}</p>
                  </div>
                  <span className="text-xs text-[var(--muted)]">Weight: {item.weight}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Add checklist item</h2>
          <form action={addChecklistItemFormAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="templateId" value={templateId} />

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Item text</span>
              <textarea
                name="itemText"
                required
                rows={2}
                placeholder="Describe what the auditor needs to check or verify"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Section (optional)</span>
              <input
                name="sectionName"
                placeholder="e.g. Food Handling, Storage, Labelling"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Weight</span>
              <input
                type="number"
                name="weight"
                defaultValue="1"
                min="0.1"
                step="0.1"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
              >
                Add item
              </button>
            </div>
          </form>
        </section>
      </div>
    </ProtectedAppShell>
  );
}
