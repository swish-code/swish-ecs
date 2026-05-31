import { SetupState } from "@/features/admin/setup-state";
import { listAssignmentRecords } from "@/features/assignments/service";
import { AssignmentListTable } from "@/features/assignments/list-table";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { listControlRecords } from "@/features/controls/service";
import { listDocumentRecords } from "@/features/evidence/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const [rows, controls, documents] = await Promise.all([
    listAssignmentRecords(session.user),
    listControlRecords(session.user),
    listDocumentRecords(session.user),
  ]);

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "DEPARTMENT_OWNER"]} session={session}>
      <AssignmentListTable rows={rows} controls={controls} documents={documents} />
    </ProtectedAppShell>
  );
}