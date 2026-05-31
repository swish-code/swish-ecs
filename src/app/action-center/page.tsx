import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { ActionCenterQueue } from "@/features/action-center/queue";
import { getActionCenterItems } from "@/features/action-center/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ActionCenterPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const session = await requireCurrentSession();
  const { items, summary } = await getActionCenterItems(session.user);

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]} session={session}>
      <ActionCenterQueue items={items} summary={summary} />
    </ProtectedAppShell>
  );
}