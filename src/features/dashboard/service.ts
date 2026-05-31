import { queryMany, queryFirst } from "@/lib/snowflake/query";

type SopStatusRow = {
  STATUS: string;
  SOP_COUNT: number;
};

type ImplSummaryRow = {
  TOTAL_ASSIGNMENTS: number;
  IMPLEMENTED_PERCENT: number | null;
};

type CapaSummaryRow = {
  STATUS: string;
  ACTION_COUNT: number;
};

type AuditCountRow = {
  STATUS: string;
  AUDIT_COUNT: number;
};

type OverdueRow = {
  OVERDUE_COUNT: number;
};

type OpenCapaRow = {
  ACTION_ID: number;
  TITLE: string;
  SEVERITY: string;
  STATUS: string;
  DUE_DATE: string;
  ASSIGNED_TO_NAME: string;
};

export type OpenCapaItem = {
  actionId: number;
  title: string;
  severity: string;
  status: string;
  dueDate: string;
  assignedToName: string;
};

export type DashboardKpis = {
  totalSops: number;
  activeSops: number;
  submittedSops: number;
  approvedSops: number;
  draftSops: number;
  implementationPercent: number;
  totalAssignments: number;
  openCapa: number;
  overdueCapaCount: number;
  ongoingAudits: number;
  completedAudits: number;
  openCapaItems: OpenCapaItem[];
};

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [sopRows, implRow, capaRows, auditRows, overdueRow, capaItems] = await Promise.all([
    queryMany<SopStatusRow>(`SELECT STATUS, SOP_COUNT FROM VW_SOP_STATUS_SUMMARY`),
    queryFirst<ImplSummaryRow>(`SELECT TOTAL_ASSIGNMENTS, IMPLEMENTED_PERCENT FROM VW_SOP_IMPLEMENTATION_SUMMARY`),
    queryMany<CapaSummaryRow>(`SELECT STATUS, ACTION_COUNT FROM VW_CORRECTIVE_ACTION_SUMMARY`),
    queryMany<AuditCountRow>(`SELECT STATUS, COUNT(*) AS AUDIT_COUNT FROM AUDITS GROUP BY STATUS`),
    queryFirst<OverdueRow>(
      `SELECT COUNT(*) AS OVERDUE_COUNT FROM CORRECTIVE_ACTIONS WHERE STATUS NOT IN ('Verified', 'Closed') AND DUE_DATE < CURRENT_DATE()`,
    ),
    queryMany<OpenCapaRow>(
      `SELECT ca.ACTION_ID, ca.TITLE, ca.SEVERITY, ca.STATUS, ca.DUE_DATE,
              COALESCE(u.DISPLAY_NAME, 'Unassigned') AS ASSIGNED_TO_NAME
       FROM CORRECTIVE_ACTIONS ca
       LEFT JOIN USERS u ON u.USER_ID = ca.ASSIGNED_TO
       WHERE ca.STATUS NOT IN ('Verified', 'Closed')
       ORDER BY ca.DUE_DATE ASC
       LIMIT 5`,
    ),
  ]);

  const totalSops = sopRows.reduce((sum, row) => sum + (row.SOP_COUNT ?? 0), 0);
  const activeSops = sopRows.find((r) => r.STATUS === "Active")?.SOP_COUNT ?? 0;
  const submittedSops = sopRows.find((r) => r.STATUS === "Submitted")?.SOP_COUNT ?? 0;
  const approvedSops = sopRows.find((r) => r.STATUS === "Approved")?.SOP_COUNT ?? 0;
  const draftSops = sopRows.find((r) => r.STATUS === "Draft")?.SOP_COUNT ?? 0;
  const implementationPercent = Math.round(implRow?.IMPLEMENTED_PERCENT ?? 0);
  const totalAssignments = implRow?.TOTAL_ASSIGNMENTS ?? 0;
  const openCapa = capaRows
    .filter((r) => !["Verified", "Closed"].includes(r.STATUS))
    .reduce((sum, r) => sum + (r.ACTION_COUNT ?? 0), 0);
  const overdueCapaCount = overdueRow?.OVERDUE_COUNT ?? 0;
  const ongoingAudits = auditRows.find((r) => r.STATUS === "Draft")?.AUDIT_COUNT ?? 0;
  const completedAudits = auditRows.find((r) => r.STATUS === "Completed")?.AUDIT_COUNT ?? 0;

  return {
    totalSops,
    activeSops,
    submittedSops,
    approvedSops,
    draftSops,
    implementationPercent,
    totalAssignments,
    openCapa,
    overdueCapaCount,
    ongoingAudits,
    completedAudits,
    openCapaItems: capaItems.map((r) => ({
      actionId: r.ACTION_ID,
      title: r.TITLE,
      severity: r.SEVERITY,
      status: r.STATUS,
      dueDate: r.DUE_DATE,
      assignedToName: r.ASSIGNED_TO_NAME,
    })),
  };
}
