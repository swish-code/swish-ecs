import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { CapaForm } from "@/features/capa/form";
import { createCapaFormAction } from "@/features/capa/actions";
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
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewCapaPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"]}>
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
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"]}>
      <CapaForm
        action={createCapaFormAction}
        brands={scopedBrands}
        departments={scopedDepartments}
        locations={scopedLocations}
        users={scopedUsers}
      />
    </ProtectedAppShell>
  );
}
