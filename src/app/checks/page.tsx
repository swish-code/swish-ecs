import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { CheckListTable } from "@/features/checks/list-table";
import { listCheckRecords } from "@/features/checks/service";
import { listControlRecords } from "@/features/controls/service";
import { listDocumentRecords } from "@/features/evidence/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ChecksPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const [rows, controls, documents] = await Promise.all([
    listCheckRecords(session.user),
    listControlRecords(session.user),
    listDocumentRecords(session.user),
  ]);

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]} session={session}>
      <CheckListTable rows={rows} controls={controls} documents={documents} />
    </ProtectedAppShell>
  );
}