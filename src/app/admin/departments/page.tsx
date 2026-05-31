import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { createDepartmentAction } from "@/features/admin/actions";
import { MasterRecordForm } from "@/features/admin/master-record-form";
import { SetupState } from "@/features/admin/setup-state";
import { MasterDataTable } from "@/features/admin/master-data-table";
import { getDepartmentRecords } from "@/features/admin/service";
import { hasSnowflakeConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const rows = await getDepartmentRecords();

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <div className="space-y-6">
        <MasterRecordForm
          title="Add department"
          description="Create a department master record used across approvals, assignments, audits, and KPI tracking."
          codeLabel="Department code"
          nameLabel="Department name"
          codeName="departmentCode"
          nameName="departmentName"
          action={createDepartmentAction}
        />
        <MasterDataTable
          title="Departments"
          description="Department master data used for approval scope, SOP ownership, assignment routing, and KPI reporting."
          columns={[
            { key: "departmentCode", label: "Code" },
            { key: "departmentName", label: "Name" },
            { key: "isActive", label: "Status" },
          ]}
          rows={rows}
        />
      </div>
    </ProtectedAppShell>
  );
}
