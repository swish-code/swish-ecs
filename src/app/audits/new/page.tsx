import { SetupState } from "@/features/admin/setup-state";
import {
  filterBrandRecords,
  filterDepartmentRecords,
  filterLocationRecords,
  getBrandRecords,
  getDepartmentRecords,
  getLocationRecords,
} from "@/features/admin/service";
import { ScopeAccessSummary } from "@/features/admin/scope-access-summary";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { createAuditFormAction } from "@/features/audits/actions";
import { AuditForm } from "@/features/audits/form";
import { listAuditTemplateRecords } from "@/features/audits/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewAuditPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const [templates, brands, departments, locations] = await Promise.all([
    listAuditTemplateRecords(),
    getBrandRecords(),
    getDepartmentRecords(),
    getLocationRecords(),
  ]);

  const scopedBrands = filterBrandRecords(brands, session.user);
  const scopedDepartments = filterDepartmentRecords(departments, session.user);
  const scopedLocations = filterLocationRecords(locations, session.user);

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"]}>
      <div className="space-y-6">
        <ScopeAccessSummary
          user={session.user}
          brands={scopedBrands}
          departments={scopedDepartments}
          locations={scopedLocations}
        />
        <AuditForm
          action={createAuditFormAction}
          templates={templates}
          brands={scopedBrands}
          departments={scopedDepartments}
          locations={scopedLocations}
        />
      </div>
    </ProtectedAppShell>
  );
}