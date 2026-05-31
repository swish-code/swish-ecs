import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { AuditTemplateTable } from "@/features/audits/template-table";
import { createAuditTemplateFormAction } from "@/features/audits/actions";
import { listAuditTemplateRecords } from "@/features/audits/service";
import { hasSnowflakeConfig } from "@/lib/env";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AuditTemplatesPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const templates = await listAuditTemplateRecords();

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">Audit Center</p>
              <h1 className="text-3xl font-semibold tracking-tight">Checklist Templates</h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
                Manage reusable audit templates with structured checklist items. Click a template to add or manage its
                items.
              </p>
            </div>
            <Link
              href="/audits"
              className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]"
            >
              Back to audits
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  {["Template Name", "Compliance Area", "Status", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-[var(--muted)]">
                      No templates yet. Create one below.
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.templateId}>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3 font-medium">
                        <Link
                          href={`/audits/templates/${template.templateId}`}
                          className="text-[var(--accent)] hover:underline"
                        >
                          {template.templateName}
                        </Link>
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">{template.complianceArea}</td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        {template.isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="border-b border-[var(--line)]/60 px-4 py-3">
                        <Link
                          href={`/audits/templates/${template.templateId}`}
                          className="text-sm text-[var(--accent)] hover:underline"
                        >
                          Manage items
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Create template</h2>
          <form action={createAuditTemplateFormAction} className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Template Name</span>
              <input
                name="templateName"
                required
                placeholder="e.g. food safety inspection"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Compliance Area</span>
              <input
                name="complianceArea"
                required
                placeholder="e.g. Food Safety"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
              >
                Create Template
              </button>
            </div>
          </form>
        </section>
      </div>
    </ProtectedAppShell>
  );
}
