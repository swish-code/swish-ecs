import type { BrandRecord, DepartmentRecord, LocationRecord, RoleRecord, UserRecord } from "@/features/admin/types";
import { UserScopeSelector } from "@/features/admin/user-scope-selector";

type UserRecordFormProps = {
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  roles: RoleRecord[];
  action: (formData: FormData) => Promise<void>;
  initialValues?: UserRecord;
  cancelHref?: string;
};

function valueOrEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function UserRecordForm({ brands, departments, locations, roles, action, initialValues, cancelHref }: UserRecordFormProps) {
  return (
    <section id="user-form" className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Access setup</p>
          <h2 className="text-2xl font-semibold tracking-tight">{initialValues ? `Edit user ${initialValues.displayName}` : "Add user"}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
            {initialValues
              ? "Update the user profile, default scope, and assigned roles."
              : "Register a Microsoft user, assign default scope, and attach the roles needed for Phase 1 access control."}
          </p>
        </div>

        {cancelHref ? (
          <a
            href={cancelHref}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Close
          </a>
        ) : null}
      </div>

      <form action={action} className="grid gap-4 xl:grid-cols-2">
        {initialValues ? <input type="hidden" name="userId" value={initialValues.userId} /> : null}

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--foreground)]">Display name</span>
          <input
            name="displayName"
            required
            defaultValue={valueOrEmpty(initialValues?.displayName)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--foreground)]">Email</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={valueOrEmpty(initialValues?.email)}
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <UserScopeSelector
          defaultLabel="Default brand"
          defaultName="brandId"
          defaultValue={valueOrEmpty(initialValues?.brandId)}
          defaultEmptyLabel="No default brand"
          createLabel="Add new brand"
          createName="brandName"
          createPlaceholder="Optional: create a new brand"
          accessLabel="Accessible brands"
          allName="hasAllBrands"
          allLabel="All brands"
          itemName="brandIds"
          selectedIds={initialValues?.brandIds ?? []}
          allSelected={initialValues?.hasAllBrands ?? false}
          options={brands.map((brand) => ({ id: brand.brandId, name: brand.brandName }))}
        />

        <UserScopeSelector
          defaultLabel="Default department"
          defaultName="departmentId"
          defaultValue={valueOrEmpty(initialValues?.departmentId)}
          defaultEmptyLabel="No default department"
          createLabel="Add new department"
          createName="departmentName"
          createPlaceholder="Optional: create a new department"
          accessLabel="Accessible departments"
          allName="hasAllDepartments"
          allLabel="All departments"
          itemName="departmentIds"
          selectedIds={initialValues?.departmentIds ?? []}
          allSelected={initialValues?.hasAllDepartments ?? false}
          options={departments.map((department) => ({ id: department.departmentId, name: department.departmentName }))}
        />

        <div className="xl:col-span-2">
          <UserScopeSelector
            defaultLabel="Default location"
            defaultName="locationId"
            defaultValue={valueOrEmpty(initialValues?.locationId)}
            defaultEmptyLabel="No default location"
            createLabel="Add new location"
            createName="locationName"
            createPlaceholder="Optional: create a new location"
            accessLabel="Accessible locations"
            allName="hasAllLocations"
            allLabel="All locations"
            itemName="locationIds"
            selectedIds={initialValues?.locationIds ?? []}
            allSelected={initialValues?.hasAllLocations ?? false}
            options={locations.map((location) => ({ id: location.locationId, name: location.locationName }))}
            columnsClassName="md:grid-cols-2 xl:grid-cols-3"
          />
        </div>

        <fieldset className="xl:col-span-2 rounded-[24px] border border-[var(--line)] bg-white/70 p-4">
          <legend className="px-2 text-sm font-medium text-[var(--foreground)]">Roles</legend>
          <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <label key={role.roleId} className="flex items-center gap-3 rounded-2xl border border-[var(--line)]/70 bg-[var(--surface)] px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="roleIds"
                  value={role.roleId}
                  defaultChecked={initialValues?.roleIds.includes(role.roleId) ?? false}
                  className="h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span>
                  <span className="block font-medium text-[var(--foreground)]">{role.roleName}</span>
                  <span className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{role.roleKey}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-sm text-[var(--muted)]">Choose an existing scope from the dropdowns or enter a new value once to save it for future selections.</p>
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
          >
            {initialValues ? "Save user changes" : "+ Add User"}
          </button>
        </div>
      </form>
    </section>
  );
}