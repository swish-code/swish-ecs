import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";
import type { CreateDocumentInput } from "@/features/evidence/types";
import { documentStatuses, documentVersionStatuses } from "@/features/evidence/validators";

type DocumentFormProps = {
  title: string;
  description: string;
  action: (formData: FormData) => Promise<void>;
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  users: UserRecord[];
  initialValues?: Partial<CreateDocumentInput>;
  submitLabel: string;
};

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function DocumentForm({
  title,
  description,
  action,
  brands,
  departments,
  locations,
  users,
  initialValues,
  submitLabel,
}: DocumentFormProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Document code</span>
          <input
            name="documentCode"
            defaultValue={valueOrEmpty(initialValues?.documentCode)}
            placeholder="Optional internal code"
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
            {documentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Document name</span>
          <input
            name="documentName"
            required
            defaultValue={valueOrEmpty(initialValues?.documentName)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Document type</span>
          <input
            name="documentType"
            required
            defaultValue={valueOrEmpty(initialValues?.documentType)}
            placeholder="Policy / Certificate / License / Record"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Category</span>
          <input
            name="category"
            defaultValue={valueOrEmpty(initialValues?.category)}
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

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Issue date</span>
          <input
            name="issueDate"
            type="date"
            defaultValue={valueOrEmpty(initialValues?.issueDate)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Review date</span>
          <input
            name="reviewDate"
            type="date"
            defaultValue={valueOrEmpty(initialValues?.reviewDate)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Expiry date</span>
          <input
            name="expiryDate"
            type="date"
            defaultValue={valueOrEmpty(initialValues?.expiryDate)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Source type</span>
          <input
            name="sourceType"
            defaultValue={valueOrEmpty(initialValues?.sourceType)}
            placeholder="Managed internally / SharePoint / Vendor"
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Governance notes</span>
          <textarea
            name="remarks"
            rows={4}
            defaultValue={valueOrEmpty(initialValues?.remarks)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <div className="md:col-span-2 rounded-3xl border border-[var(--line)] bg-white p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Initial governed file</h2>
            <p className="text-sm leading-7 text-[var(--muted)]">Optional. If provided, the document will be created with an initial evidence version and linked as the current governed file.</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">File name</span>
              <input
                name="fileName"
                defaultValue={valueOrEmpty(initialValues?.fileName)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">File URL</span>
              <input
                name="fileUrl"
                defaultValue={valueOrEmpty(initialValues?.fileUrl)}
                placeholder="https://..."
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Version no</span>
              <input
                name="versionNo"
                defaultValue={valueOrEmpty(initialValues?.versionNo)}
                placeholder="1.0"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Version status</span>
              <select
                name="versionStatus"
                defaultValue={valueOrEmpty(initialValues?.versionStatus ?? "")}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              >
                <option value="">Optional</option>
                {documentVersionStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">File size</span>
              <input
                name="fileSize"
                type="number"
                min="0"
                defaultValue={valueOrEmpty(initialValues?.fileSize)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Mime type</span>
              <input
                name="mimeType"
                defaultValue={valueOrEmpty(initialValues?.mimeType)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Storage provider</span>
              <input
                name="storageProvider"
                defaultValue={valueOrEmpty(initialValues?.storageProvider)}
                placeholder="SHAREPOINT"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Storage drive ID</span>
              <input
                name="storageDriveId"
                defaultValue={valueOrEmpty(initialValues?.storageDriveId)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Storage item ID</span>
              <input
                name="storageItemId"
                defaultValue={valueOrEmpty(initialValues?.storageItemId)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Storage path</span>
              <input
                name="storagePath"
                defaultValue={valueOrEmpty(initialValues?.storagePath)}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
          </div>
        </div>

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