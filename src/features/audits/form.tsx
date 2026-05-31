import type { BrandRecord, DepartmentRecord, LocationRecord } from "@/features/admin/types";
import type { AuditTemplateRecord } from "@/features/audits/types";
import { auditStatuses } from "@/types/domain";

type AuditFormProps = {
  action: (formData: FormData) => Promise<void>;
  templates: AuditTemplateRecord[];
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
};

export function AuditForm({ action, templates, brands, departments, locations }: AuditFormProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Create Audit</h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Start an audit header record with its template, scope, and compliance area. Checklist execution and scoring will extend from this foundation.
        </p>
      </div>

      <form action={action} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Audit Template</span>
          <select
            name="templateId"
            required
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Select template</option>
            {templates.map((template) => (
              <option key={template.templateId} value={template.templateId}>
                {template.templateName} - {template.complianceArea}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Brand</span>
          <select
            name="brandId"
            required
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Select brand</option>
            {brands.map((brand) => (
              <option key={brand.brandId} value={brand.brandId}>
                {brand.brandName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Compliance Area</span>
          <input
            name="complianceArea"
            required
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Department</span>
          <select
            name="departmentId"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Optional</option>
            {departments.map((department) => (
              <option key={department.departmentId} value={department.departmentId}>
                {department.departmentName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Location</span>
          <select
            name="locationId"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Optional</option>
            {locations.map((location) => (
              <option key={location.locationId} value={location.locationId}>
                {location.locationName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Status</span>
          <select
            name="status"
            defaultValue="Draft"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            {auditStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Remarks</span>
          <textarea
            name="remarks"
            rows={4}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
          >
            Create Audit
          </button>
        </div>
      </form>
    </section>
  );
}