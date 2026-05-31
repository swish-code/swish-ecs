import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { SetupState } from "@/features/admin/setup-state";
import { MasterDataTable } from "@/features/admin/master-data-table";
import { getRoleRecords } from "@/features/admin/service";
import { hasSnowflakeConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const rows = await getRoleRecords();

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <MasterDataTable
        title="Roles"
        description="Application role definitions used for access control and document security rules."
        columns={[
          { key: "roleKey", label: "Key" },
          { key: "roleName", label: "Name" },
          { key: "isActive", label: "Status" },
        ]}
        rows={rows}
      />
    </ProtectedAppShell>
  );
}
