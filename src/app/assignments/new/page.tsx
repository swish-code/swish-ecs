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
import { createAssignmentFormAction } from "@/features/assignments/actions";
import { AssignmentForm } from "@/features/assignments/form";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { listSopRecords } from "@/features/sops/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewAssignmentPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();

  const [sops, brands, departments, locations, users] = await Promise.all([
    listSopRecords(session.user),
    getBrandRecords(),
    getDepartmentRecords(),
    getLocationRecords(),
    getUserRecords(),
  ]);

  const assignableSops = sops.filter((sop) => sop.status === "Approved" || sop.status === "Active");
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
        <AssignmentForm
          action={createAssignmentFormAction}
          sops={assignableSops}
          brands={scopedBrands}
          departments={scopedDepartments}
          locations={scopedLocations}
          users={scopedUsers}
        />
      </div>
    </ProtectedAppShell>
  );
}