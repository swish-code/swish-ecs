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
import { createDocumentFormAction } from "@/features/evidence/actions";
import { DocumentForm } from "@/features/evidence/form";
import { requireCurrentSession } from "@/lib/auth/session";
import { hasSnowflakeConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage() {
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
      <DocumentForm
        title="New Document"
        description="Create a governed document record and optionally attach its initial controlled file so the document is ready for control linkage, freshness tracking, and later audit reuse."
        action={createDocumentFormAction}
        brands={filterBrandRecords(brands, session.user)}
        departments={filterDepartmentRecords(departments, session.user)}
        locations={filterLocationRecords(locations, session.user)}
        users={filterUserRecords(users, session.user)}
        submitLabel="Create document"
      />
    </ProtectedAppShell>
  );
}