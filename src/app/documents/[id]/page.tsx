import { notFound } from "next/navigation";
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
import { linkControlToDocumentFormAction } from "@/features/controls/actions";
import { transitionDocumentVersionFormAction, updateDocumentFormAction } from "@/features/evidence/actions";
import { listControlRecords, listRelatedControlRecords } from "@/features/controls/service";
import { DocumentDetailPanel } from "@/features/evidence/detail-panel";
import { getDocumentAuditUsageRecord, getDocumentRecord, listDocumentVersionRecords } from "@/features/evidence/service";
import { requireCurrentSession } from "@/lib/auth/session";
import { hasSnowflakeConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isFinite(documentId) || documentId <= 0) {
    notFound();
  }

  const session = await requireCurrentSession();
  const [record, controls, availableControls, versions, brands, departments, locations, users] = await Promise.all([
    getDocumentRecord(documentId, session.user),
    listRelatedControlRecords("DOCUMENT", documentId, session.user),
    listControlRecords(session.user),
    listDocumentVersionRecords(documentId, session.user),
    getBrandRecords(),
    getDepartmentRecords(),
    getLocationRecords(),
    getUserRecords(),
  ]);

  if (!record) {
    notFound();
  }

  const auditUsage = await getDocumentAuditUsageRecord(record, controls, session.user);

  const scopedBrands = filterBrandRecords(brands, session.user);
  const scopedDepartments = filterDepartmentRecords(departments, session.user);
  const scopedLocations = filterLocationRecords(locations, session.user);
  const scopedUsers = filterUserRecords(users, session.user);
  const linkedControlIds = new Set(controls.map((control) => control.controlId));

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
        <DocumentDetailPanel
          record={record}
          versions={versions}
          auditUsage={auditUsage}
          controls={controls}
          brands={scopedBrands}
          departments={scopedDepartments}
          locations={scopedLocations}
          users={scopedUsers}
          action={updateDocumentFormAction}
          transitionAction={transitionDocumentVersionFormAction}
          availableControls={availableControls
            .filter((control) => !linkedControlIds.has(control.controlId))
            .map((control) => ({
              controlId: control.controlId,
              controlCode: control.controlCode,
              controlName: control.controlName,
            }))}
          linkAction={linkControlToDocumentFormAction}
        />
      </div>
    </ProtectedAppShell>
  );
}