import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { CapaListTable } from "@/features/capa/list-table";
import { listCapaRecords } from "@/features/capa/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";
import { ScopeAccessSummary } from "@/features/admin/scope-access-summary";
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

export const dynamic = "force-dynamic";

export default async function CapaPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const [rows, brands, departments, locations, users] = await Promise.all([
    listCapaRecords(session.user),
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
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]} session={session}>
      <div className="space-y-6">
        <ScopeAccessSummary
          user={session.user}
          brands={scopedBrands}
          departments={scopedDepartments}
          locations={scopedLocations}
          users={scopedUsers}
        />
        <CapaListTable rows={rows} />
      </div>
    </ProtectedAppShell>
  );
}
