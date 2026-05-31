import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";
import type { SopRecord } from "@/features/sops/types";
import { sopStatuses } from "@/types/domain";

type SopFormProps = {
  title: string;
  description: string;
  action: (formData: FormData) => Promise<void>;
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  users: UserRecord[];
  initialValues?: SopRecord;
  submitLabel: string;
};

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function SopForm({
  title,
  description,
  action,
  brands,
  departments,
  locations,
  users,
  initialValues,
  submitLabel,
}: SopFormProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="grid gap-4 md:grid-cols-2">
        {initialValues ? <input type="hidden" name="sopId" value={initialValues.sopId} /> : null}

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Document No</span>
          <input
            name="documentNo"
            required
            defaultValue={valueOrEmpty(initialValues?.documentNo)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Document Type</span>
          <input
            name="documentType"
            required
            defaultValue={valueOrEmpty(initialValues?.documentType)}
            placeholder="SOP / Policy / Procedure"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Title</span>
          <input
            name="title"
            required
            defaultValue={valueOrEmpty(initialValues?.title)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Brand</span>
          <select
            name="brandId"
            required
            defaultValue={valueOrEmpty(initialValues?.brandId)}
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
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Add new location</span>
          <input
            name="locationName"
            placeholder="Optional: create a new location"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Owner</span>
          <select
            name="ownerUserId"
            defaultValue={valueOrEmpty(initialValues?.ownerUserId)}
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
          <span className="font-medium">Compliance Area</span>
          <input
            name="complianceArea"
            required
            defaultValue={valueOrEmpty(initialValues?.complianceArea)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Version</span>
          <input
            name="versionNo"
            required
            defaultValue={valueOrEmpty(initialValues?.versionNo)}
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
            {sopStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">File Name</span>
          <input
            name="fileName"
            defaultValue={valueOrEmpty(initialValues?.fileName)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">File URL</span>
          <input
            name="fileUrl"
            defaultValue={valueOrEmpty(initialValues?.fileUrl)}
            placeholder="https://..."
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">File Size</span>
          <input
            name="fileSize"
            type="number"
            min="0"
            defaultValue={valueOrEmpty(initialValues?.fileSize)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Mime Type</span>
          <input
            name="mimeType"
            defaultValue={valueOrEmpty(initialValues?.mimeType)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Storage Provider</span>
          <input
            name="storageProvider"
            defaultValue={valueOrEmpty(initialValues?.storageProvider)}
            placeholder="SHAREPOINT"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Storage Drive ID</span>
          <input
            name="storageDriveId"
            defaultValue={valueOrEmpty(initialValues?.storageDriveId)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Storage Item ID</span>
          <input
            name="storageItemId"
            defaultValue={valueOrEmpty(initialValues?.storageItemId)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Storage Path</span>
          <input
            name="storagePath"
            defaultValue={valueOrEmpty(initialValues?.storagePath)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Remarks</span>
          <textarea
            name="remarks"
            defaultValue={valueOrEmpty(initialValues?.remarks)}
            rows={4}
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
