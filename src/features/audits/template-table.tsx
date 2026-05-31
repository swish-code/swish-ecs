import type { AuditTemplateRecord } from "@/features/audits/types";
import { MasterDataTable } from "@/features/admin/master-data-table";

export function AuditTemplateTable({ rows }: { rows: AuditTemplateRecord[] }) {
  return (
    <MasterDataTable
      title="Audit Templates"
      description="Template headers available for starting structured audits across different compliance areas."
      columns={[
        { key: "templateName", label: "Template Name" },
        { key: "complianceArea", label: "Compliance Area" },
        { key: "isActive", label: "Status" },
      ]}
      rows={rows}
    />
  );
}