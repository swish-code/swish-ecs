import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";
import type { SopRecord } from "@/features/sops/types";
import { assignmentStatuses } from "@/types/domain";

type AssignmentFormProps = {
  action: (formData: FormData) => Promise<void>;
  sops: SopRecord[];
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  users: UserRecord[];
};

export function AssignmentForm({ action, sops, brands, departments, locations, users }: AssignmentFormProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Create Implementation Assignment</h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Assign an approved SOP to the relevant brand, department, and location team for rollout tracking.
        </p>
      </div>

      <form action={action} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">SOP</span>
          <select
            name="sopId"
            required
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Select approved or active SOP</option>
            {sops.map((sop) => (
              <option key={sop.sopId} value={sop.sopId}>
                {sop.documentNo} - {sop.title}
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
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Add new brand</span>
          <input
            name="brandName"
            placeholder="Optional: create a new brand"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Owner</span>
          <select
            name="ownerUserId"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Optional</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.displayName}
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
            {departments.map((department) => (
              <option key={department.departmentId} value={department.departmentId}>
                {department.departmentName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Add new department</span>
          <input
            name="departmentName"
            placeholder="Optional: create a new department"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
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
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Add new location</span>
          <input
            name="locationName"
            placeholder="Optional: create a new location"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Status</span>
          <select
            name="status"
            defaultValue="Not Started"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            {assignmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Target Date</span>
          <input
            name="targetDate"
            type="date"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
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
            Create Assignment
          </button>
        </div>
      </form>
    </section>
  );
}