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
import { createControlFormAction } from "@/features/controls/actions";
import { ControlForm } from "@/features/controls/form";
import { requireCurrentSession } from "@/lib/auth/session";
import { hasSnowflakeConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function NewControlPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
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

  return (
    <ProtectedAppShell
      allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}
      session={session}
    >
      <ControlForm
        title="New Control"
        description="Create a reusable control that can later connect frameworks, policies, documents, tests, findings, and remediation work."
        action={createControlFormAction}
        brands={filterBrandRecords(brands, session.user)}
        departments={filterDepartmentRecords(departments, session.user)}
        locations={filterLocationRecords(locations, session.user)}
        users={filterUserRecords(users, session.user)}
        submitLabel="Create control"
      />
    </ProtectedAppShell>
  );
}