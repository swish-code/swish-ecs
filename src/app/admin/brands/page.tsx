import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { createBrandAction } from "@/features/admin/actions";
import { MasterRecordForm } from "@/features/admin/master-record-form";
import { SetupState } from "@/features/admin/setup-state";
import { MasterDataTable } from "@/features/admin/master-data-table";
import { getBrandRecords } from "@/features/admin/service";
import { hasSnowflakeConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const rows = await getBrandRecords();

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <div className="space-y-6">
        <MasterRecordForm
          title="Add brand"
          description="Create a brand master record with its code and display name."
          codeLabel="Brand code"
          nameLabel="Brand name"
          codeName="brandCode"
          nameName="brandName"
          action={createBrandAction}
        />
        <MasterDataTable
          title="Brands"
          description="Brand master data used across SOPs, assignments, audits, KPIs, and location mapping."
          columns={[
            { key: "brandCode", label: "Code" },
            { key: "brandName", label: "Name" },
            { key: "isActive", label: "Status" },
          ]}
          rows={rows}
        />
      </div>
    </ProtectedAppShell>
  );
}
