import { createUserAction, updateUserAction } from "@/features/admin/actions";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { MasterDataTable } from "@/features/admin/master-data-table";
import { getBrandRecords, getDepartmentRecords, getLocationRecords, getRoleRecords, getUserRecords } from "@/features/admin/service";
import { UserRecordForm } from "@/features/admin/user-record-form";
import { hasSnowflakeConfig } from "@/lib/env";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type UsersPageProps = {
  searchParams?: Promise<{
    mode?: string;
    edit?: string;
  }>;
};

function summarizeScopeAccess(options: {
  ids: number[];
  hasAll: boolean;
  records: Array<{ id: number; name: string }>;
  allLabel: string;
  emptyLabel: string;
}): ReactNode {
  if (options.hasAll) {
    return options.allLabel;
  }

  const names = options.records
    .filter((record) => options.ids.includes(record.id))
    .map((record) => record.name);

  if (names.length === 0) {
    return options.emptyLabel;
  }

  if (names.length <= 2) {
    return names.join(", ");
  }

  const visibleNames = names.slice(0, 2);

  return (
    <div className="space-y-1">
      <div>{visibleNames.join(", ")}</div>
      <details className="group rounded-xl border border-[var(--line)]/70 bg-[rgba(255,255,255,0.84)] px-3 py-2">
        <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)] marker:hidden">
          Show all {names.length}
        </summary>
        <div className="mt-2 max-h-32 space-y-1 overflow-y-auto border-t border-[var(--line)]/60 pt-2 text-sm text-[var(--foreground)]">
          {names.map((name, index) => (
            <div key={`${name}-${index}`}>{name}</div>
          ))}
        </div>
      </details>
    </div>
  );
}

function summarizeDefaultScope(label: string, value: string | null): string {
  return `${label}: ${value ?? "-"}`;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const mode = resolvedSearchParams?.mode;
  const editUserId = Number(resolvedSearchParams?.edit ?? 0);

  const [rows, brands, departments, locations, roles] = await Promise.all([
    getUserRecords(),
    getBrandRecords(),
    getDepartmentRecords(),
    getLocationRecords(),
    getRoleRecords(),
  ]);

  const userToEdit = rows.find((user) => user.userId === editUserId);
  const showCreateForm = mode === "create";
  const showEditForm = Boolean(userToEdit);
  const brandOptions = brands.map((brand) => ({ id: brand.brandId, name: brand.brandName }));
  const departmentOptions = departments.map((department) => ({ id: department.departmentId, name: department.departmentName }));
  const locationOptions = locations.map((location) => ({ id: location.locationId, name: location.locationName }));

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_10px_24px_rgba(29,42,36,0.05)]">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Default scope</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                The default Brand, Department, and Location are the user&apos;s primary working scope.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Access scope</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Access scope is the full list the user can work across, including multi-select access and any `All` flags.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Editing flow</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Use `+ Add User` for new users or `Edit` in the row to open the same-page form without leaving the register.
              </p>
            </div>
          </div>
        </section>

        {showCreateForm ? (
          <UserRecordForm
            brands={brands}
            departments={departments}
            locations={locations}
            roles={roles}
            action={createUserAction}
            cancelHref="/admin/users"
          />
        ) : null}

        {showEditForm && userToEdit ? (
          <UserRecordForm
            brands={brands}
            departments={departments}
            locations={locations}
            roles={roles}
            action={updateUserAction}
            initialValues={userToEdit}
            cancelHref="/admin/users"
          />
        ) : null}

        <MasterDataTable
          title="Users"
          description="Manage registered users, their default scope, and their assigned roles. Choose Edit to update an existing user on this same page."
          action={
            <Link
              href="/admin/users?mode=create#user-form"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              + Add User
            </Link>
          }
          columns={[
            { key: "displayName", label: "Display name" },
            { key: "email", label: "Email" },
            {
              label: "Default scope",
              render: (row) => (
                <div className="space-y-1">
                  <div>{summarizeDefaultScope("Brand", row.brandName)}</div>
                  <div>{summarizeDefaultScope("Department", row.departmentName)}</div>
                  <div>{summarizeDefaultScope("Location", row.locationName)}</div>
                </div>
              ),
            },
            {
              label: "Access scope",
              render: (row) => (
                <div className="space-y-1">
                  <div>
                    Brands: {summarizeScopeAccess({ ids: row.brandIds, hasAll: row.hasAllBrands, records: brandOptions, allLabel: "All brands", emptyLabel: "None" })}
                  </div>
                  <div>
                    Departments: {summarizeScopeAccess({ ids: row.departmentIds, hasAll: row.hasAllDepartments, records: departmentOptions, allLabel: "All departments", emptyLabel: "None" })}
                  </div>
                  <div>
                    Locations: {summarizeScopeAccess({ ids: row.locationIds, hasAll: row.hasAllLocations, records: locationOptions, allLabel: "All locations", emptyLabel: "None" })}
                  </div>
                </div>
              ),
            },
            { key: "roleNames", label: "Roles" },
            { key: "isActive", label: "Status" },
            {
              label: "Actions",
              render: (row) => (
                <Link
                  href={`/admin/users?edit=${row.userId}#user-form`}
                  className="font-semibold text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
                >
                  Edit
                </Link>
              ),
            },
          ]}
          rows={rows}
        />
      </div>
    </ProtectedAppShell>
  );
}
