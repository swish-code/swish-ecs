import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { notFound } from "next/navigation";
import { SetupState } from "@/features/admin/setup-state";
import { AssignmentDetailForm } from "@/features/assignments/detail-form";
import { updateAssignmentFormAction } from "@/features/assignments/actions";
import { getAssignmentRecord } from "@/features/assignments/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;
  const assignmentId = Number(id);
  const session = await requireCurrentSession();
  const record = await getAssignmentRecord(assignmentId, session.user);

  if (!record) {
    notFound();
  }

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "DEPARTMENT_OWNER"]}>
      <AssignmentDetailForm record={record} action={updateAssignmentFormAction} />
    </ProtectedAppShell>
  );
}
