import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { notFound } from "next/navigation";
import { SetupState } from "@/features/admin/setup-state";
import {
  filterBrandRecords,
  filterDepartmentRecords,
  filterLocationRecords,
  filterUserRecords,
  getBrandRecords,
  getDepartmentRecords,
  getLocationRecords,
  getUserRecords,
} from "@/features/admin/service";
import { updateControlFormAction } from "@/features/controls/actions";
import { ControlDetailPanel } from "@/features/controls/detail-panel";
import { getControlRecord, listControlLinkRecords } from "@/features/controls/service";
import { hasSnowflakeConfig } from "@/lib/env";
import { requireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ControlDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSnowflakeConfig()) {
    return (
      <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]}>
        <SetupState />
      </ProtectedAppShell>
    );
  }

  const { id } = await params;
  const controlId = Number(id);
  const session = await requireCurrentSession();
  const [record, links, brands, departments, locations, users] = await Promise.all([
    getControlRecord(controlId, session.user),
    listControlLinkRecords(controlId, session.user),
    getBrandRecords(),
    getDepartmentRecords(),
    getLocationRecords(),
    getUserRecords(),
  ]);

  if (!record) {
    notFound();
  }

  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"]} session={session}>
      <ControlDetailPanel
        record={record}
        links={links}
        brands={filterBrandRecords(brands, session.user)}
        departments={filterDepartmentRecords(departments, session.user)}
        locations={filterLocationRecords(locations, session.user)}
        users={filterUserRecords(users, session.user)}
        action={updateControlFormAction}
      />
    </ProtectedAppShell>
  );
}