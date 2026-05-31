import { notFound } from "next/navigation";
import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { createCheckResultFormAction } from "@/features/checks/actions";
import { CheckDetailPanel } from "@/features/checks/detail-panel";
import { getCheckRecord, listCheckResultRecords } from "@/features/checks/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;
  const checkId = Number(id);

  if (!Number.isFinite(checkId) || checkId <= 0) {
    notFound();
  }

  const session = await requireCurrentSession();
  const [record, results] = await Promise.all([
    getCheckRecord(checkId, session.user),
    listCheckResultRecords(checkId, session.user),
  ]);

  if (!record) {
    notFound();
  }

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
      <CheckDetailPanel record={record} results={results} action={createCheckResultFormAction} />
    </ProtectedAppShell>
  );
}