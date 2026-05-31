import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";
import type { CreateControlInput } from "@/features/controls/types";
import { controlStatuses } from "@/features/controls/validators";

type ControlFormProps = {
  title: string;
  description: string;
  action: (formData: FormData) => Promise<void>;
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  users: UserRecord[];
  initialValues?: Partial<CreateControlInput>;
  submitLabel: string;
};

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function ControlForm({
  title,
  description,
  action,
  brands,
  departments,
  locations,
  users,
  initialValues,
  submitLabel,
}: ControlFormProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Control code</span>
          <input
            name="controlCode"
            required
            defaultValue={valueOrEmpty(initialValues?.controlCode)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Status</span>
          <select
            name="status"
            required
            defaultValue={valueOrEmpty(initialValues?.status ?? "Draft")}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            {controlStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Control name</span>
          <input
            name="controlName"
            required
            defaultValue={valueOrEmpty(initialValues?.controlName)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Category</span>
          <input
            name="controlCategory"
            defaultValue={valueOrEmpty(initialValues?.controlCategory)}
            placeholder="Operations / Food Safety / Security"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Type</span>
          <input
            name="controlType"
            defaultValue={valueOrEmpty(initialValues?.controlType)}
            placeholder="Manual / Preventive / Detective"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Brand</span>
          <select
            name="brandId"
            defaultValue={valueOrEmpty(initialValues?.brandId)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Global</option>
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
            defaultValue={valueOrEmpty(initialValues?.departmentId)}
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
            defaultValue={valueOrEmpty(initialValues?.locationId)}
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
          <span className="font-medium">Owner</span>
          <select
            name="ownerUserId"
            defaultValue={valueOrEmpty(initialValues?.ownerUserId)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={valueOrEmpty(initialValues?.description)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Review frequency (days)</span>
          <input
            name="reviewFrequencyDays"
            type="number"
            min="1"
            max="3650"
            defaultValue={valueOrEmpty(initialValues?.reviewFrequencyDays)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}