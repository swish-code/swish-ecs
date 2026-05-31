import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";
import { correctiveActionStatuses, severityLevels } from "@/types/domain";

type CapaFormProps = {
  action: (formData: FormData) => Promise<void>;
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  users: UserRecord[];
  sourceType?: string;
  sourceId?: number;
};

export function CapaForm({
  action,
  brands,
  departments,
  locations,
  users,
  sourceType = "Manual",
  sourceId,
}: CapaFormProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">CAPA</p>
        <h1 className="text-3xl font-semibold tracking-tight">Create Corrective Action</h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Record a corrective action linked to an audit finding or raised manually. Assign it to the responsible person
          and set a due date for closure.
        </p>
      </div>

      <form action={action} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="sourceType" value={sourceType} />
        {sourceId ? <input type="hidden" name="sourceId" value={sourceId} /> : null}

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Title</span>
          <input
            name="title"
            required
            placeholder="Brief description of the corrective action"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Description</span>
          <textarea
            name="description"
            rows={3}
            placeholder="Detailed description of the gap or finding and what needs to be corrected"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Severity</span>
          <select
            name="severity"
            required
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            {severityLevels.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Status</span>
          <select
            name="status"
            defaultValue="Open"
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
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Select responsible person</option>
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
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Brand</span>
          <select
            name="brandId"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Optional</option>
            {brands.map((brand) => (
              <option key={brand.brandId} value={brand.brandId}>
                {brand.brandName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Department</span>
          <select
            name="departmentId"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Optional</option>
            {departments.map((dept) => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.departmentName}
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
            {locations.map((loc) => (
              <option key={loc.locationId} value={loc.locationId}>
                {loc.locationName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Remarks</span>
          <textarea
            name="remarks"
            rows={2}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
          >
            Create Action
          </button>
        </div>
      </form>
    </section>
  );
}
