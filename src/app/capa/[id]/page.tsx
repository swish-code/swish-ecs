import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { notFound } from "next/navigation";
import { SetupState } from "@/features/admin/setup-state";
import { CapaDetailPanel } from "@/features/capa/detail-panel";
import { updateCapaFormAction } from "@/features/capa/actions";
import { getCapaRecord } from "@/features/capa/service";
import { filterUserRecords, getUserRecords } from "@/features/admin/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CapaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;
  const actionId = Number(id);
  const session = await requireCurrentSession();
  const [record, users] = await Promise.all([getCapaRecord(actionId, session.user), getUserRecords()]);

  if (!record) {
    notFound();
  }

  const scopedUsers = filterUserRecords(users, session.user);

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
      <CapaDetailPanel record={record} users={scopedUsers} action={updateCapaFormAction} />
    </ProtectedAppShell>
  );
}
