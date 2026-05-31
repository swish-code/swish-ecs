import { SetupState } from "@/features/admin/setup-state";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { AuditListTable } from "@/features/audits/list-table";
import { listAuditRecords } from "@/features/audits/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const audits = await listAuditRecords(session.user);

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"]} session={session}>
      <AuditListTable rows={audits} />
    </ProtectedAppShell>
  );
}