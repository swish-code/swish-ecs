import Link from "next/link";
import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";
import type { ControlLinkRecord, ControlRecord } from "@/features/controls/types";
import { controlStatuses } from "@/features/controls/validators";

const controlStatusTone: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-600",
  Planned: "bg-blue-50 text-blue-700",
  Archived: "bg-[var(--surface-strong)] text-[var(--muted)]",
  Inactive: "bg-red-50 text-red-700",
};

function MetadataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function ControlDetailPanel({
  record,
  links,
  brands,
  departments,
  locations,
  users,
  action,
}: {
  record: ControlRecord;
  links: ControlLinkRecord[];
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  users: UserRecord[];
  action: (formData: FormData) => Promise<void>;
}) {
  const scope = [record.brandName, record.departmentName, record.locationName].filter(Boolean).join(" / ");
  const groupedLinks = [
    { label: "SOPs", entityTypes: ["SOP", "SOPS"] },
    { label: "Documents", entityTypes: ["DOCUMENT", "DOCUMENTS"] },
    { label: "Checks", entityTypes: ["CHECK", "CHECKS"] },
    { label: "Tasks", entityTypes: ["TASK", "TASKS"] },
  ].map((group) => ({
    label: group.label,
    items: links.filter((link) => group.entityTypes.includes(link.entityType.toUpperCase())),
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">{record.controlCode}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{record.controlName}</h1>
            <p className="text-sm text-[var(--muted)]">
              {[record.controlCategory, record.controlType, scope || null].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${controlStatusTone[record.status] ?? "bg-slate-100 text-slate-600"}`}>
              {record.status}
            </span>
            <Link
              href="/controls"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]"
            >
              Back to list
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetadataCard label="Owner" value={record.ownerDisplayName ?? "Unassigned"} />
          <MetadataCard label="Review frequency" value={record.reviewFrequencyDays ? `${record.reviewFrequencyDays} days` : "Not set"} />
          <MetadataCard label="SOP links" value={String(record.sopLinkCount)} />
          <MetadataCard label="Document links" value={String(record.documentLinkCount)} />
        </div>

        {record.description ? (
          <div className="mt-5 rounded-2xl border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--foreground)]">
            {record.description}
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Control settings</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Update the control definition, scope, ownership, and lifecycle state from the source record itself.
          </p>
        </div>

        <form action={action} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="controlId" value={record.controlId} />

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Control code</span>
            <input
              name="controlCode"
              required
              defaultValue={record.controlCode}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Status</span>
            <select
              name="status"
              required
              defaultValue={record.status}
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
              defaultValue={record.controlName}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Category</span>
            <input
              name="controlCategory"
              defaultValue={valueOrEmpty(record.controlCategory)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Type</span>
            <input
              name="controlType"
              defaultValue={valueOrEmpty(record.controlType)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Brand</span>
            <select
              name="brandId"
              defaultValue={valueOrEmpty(record.brandId)}
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
              defaultValue={valueOrEmpty(record.departmentId)}
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
              defaultValue={valueOrEmpty(record.locationId)}
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
              defaultValue={valueOrEmpty(record.ownerUserId)}
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
            <span className="font-medium">Review frequency (days)</span>
            <input
              name="reviewFrequencyDays"
              type="number"
              min="1"
              max="3650"
              defaultValue={valueOrEmpty(record.reviewFrequencyDays)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium">Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={valueOrEmpty(record.description)}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
            >
              Save changes
            </button>
            <Link
              href="/controls"
              className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--line)]"
            >
              Back to list
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Linked records</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            This is the first shared-object view of the control hub. SOPs, documents, checks, and tasks should all converge here as the rest of Phase 1 lands.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {groupedLinks.map((group) => (
            <div key={group.label} className="rounded-3xl border border-[var(--line)] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{group.label}</h3>
                <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
                  {group.items.length}
                </span>
              </div>

              {group.items.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--muted)]">No linked {group.label.toLowerCase()} yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {group.items.map((link) => (
                    <div key={link.linkId} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {link.href ? (
                          <Link href={link.href} className="font-medium text-[var(--accent)] hover:underline">
                            {link.displayName}
                          </Link>
                        ) : (
                          <p className="font-medium text-[var(--foreground)]">{link.displayName}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                          <span className="rounded-full border border-[var(--line)] px-2 py-0.5">{link.linkRole}</span>
                          {link.isPrimary ? <span className="rounded-full bg-[var(--accent)]/12 px-2 py-0.5 font-semibold text-[var(--accent)]">Primary</span> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}