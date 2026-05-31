import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { createLocationAction } from "@/features/admin/actions";
import { MasterRecordForm } from "@/features/admin/master-record-form";
import { SetupState } from "@/features/admin/setup-state";
import { MasterDataTable } from "@/features/admin/master-data-table";
import { getLocationRecords } from "@/features/admin/service";
import { hasSnowflakeConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const rows = await getLocationRecords();

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <div className="space-y-6">
        <MasterRecordForm
          title="Add location"
          description="Create a branch/store location used for brand-location mapping and location-aware compliance records."
          codeLabel="Location code"
          nameLabel="Location name"
          codeName="locationCode"
          nameName="locationName"
          action={createLocationAction}
        />
        <MasterDataTable
          title="Locations"
          description="Branch/store location master data used for location-aware compliance scope."
          columns={[
            { key: "locationCode", label: "Code" },
            { key: "locationName", label: "Name" },
            { key: "isActive", label: "Status" },
          ]}
          rows={rows}
        />
      </div>
    </ProtectedAppShell>
  );
}
