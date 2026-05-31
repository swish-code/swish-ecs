import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import {
  filterBrandRecords,
  filterDepartmentRecords,
  filterLocationRecords,
  filterUserRecords,
  getBrandRecords,
  getDepartmentRecords,
  getLocationRecords,
  getUserRecords,
} from "@/features/admin/service";
import { ScopeAccessSummary } from "@/features/admin/scope-access-summary";
import { SopForm } from "@/features/sops/form";
import { createSopFormAction } from "@/features/sops/actions";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewSopPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();

  const [brands, departments, locations, users] = await Promise.all([
    getBrandRecords(),
    getDepartmentRecords(),
    getLocationRecords(),
    getUserRecords(),
  ]);

  const scopedBrands = filterBrandRecords(brands, session.user);
  const scopedDepartments = filterDepartmentRecords(departments, session.user);
  const scopedLocations = filterLocationRecords(locations, session.user);
  const scopedUsers = filterUserRecords(users, session.user);

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <div className="space-y-6">
        <ScopeAccessSummary
          user={session.user}
          brands={scopedBrands}
          departments={scopedDepartments}
          locations={scopedLocations}
          users={scopedUsers}
        />
        <SopForm
          title="Create SOP"
          description="Create a new SOP or controlled document and define its compliance scope, ownership, status, and SharePoint storage metadata."
          action={createSopFormAction}
          brands={scopedBrands}
          departments={scopedDepartments}
          locations={scopedLocations}
          users={scopedUsers}
          submitLabel="Create SOP"
        />
      </div>
    </ProtectedAppShell>
  );
}
