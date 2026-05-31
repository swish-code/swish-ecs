import { executeCommand, queryFirst, queryMany } from "@/lib/snowflake/query";
import type {
  AddChecklistItemInput,
  AuditRecord,
  AuditResponseRecord,
  AuditTemplateRecord,
  ChecklistItemRecord,
  CreateAuditInput,
  CreateAuditTemplateInput,
  SaveAuditResponsesInput,
} from "@/features/audits/types";

type AuditTemplateRow = {
  TEMPLATE_ID: number;
  TEMPLATE_NAME: string;
  COMPLIANCE_AREA: string;
  IS_ACTIVE: boolean;
};

type AuditRow = {
  AUDIT_ID: number;
  TEMPLATE_ID: number;
  BRAND_ID: number | null;
  DEPARTMENT_ID: number | null;
  LOCATION_ID: number | null;
  PERFORMED_BY: number | null;
  TEMPLATE_NAME: string;
  BRAND_NAME: string | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_NAME: string | null;
  COMPLIANCE_AREA: string;
  STATUS: AuditRecord["status"];
  PERFORMED_BY_NAME: string;
  STARTED_AT: string;
  COMPLETED_AT: string | null;
  SCORE_PERCENT: number | null;
  REMARKS: string | null;
};

export async function listAuditTemplates(): Promise<AuditTemplateRecord[]> {
  const rows = await queryMany<AuditTemplateRow>(`
    SELECT TEMPLATE_ID, TEMPLATE_NAME, COMPLIANCE_AREA, IS_ACTIVE
    FROM CHECKLIST_TEMPLATES
    ORDER BY TEMPLATE_NAME
  `);

  return rows.map((row) => ({
    templateId: row.TEMPLATE_ID,
    templateName: row.TEMPLATE_NAME,
    complianceArea: row.COMPLIANCE_AREA,
    isActive: row.IS_ACTIVE,
  }));
}

export async function createAuditTemplate(input: CreateAuditTemplateInput, createdBy: number): Promise<void> {
  await executeCommand(
    `
      INSERT INTO CHECKLIST_TEMPLATES (TEMPLATE_NAME, COMPLIANCE_AREA, CREATED_BY)
      VALUES (?, ?, ?)
    `,
    [input.templateName, input.complianceArea, createdBy],
  );
}

export async function listAudits(): Promise<AuditRecord[]> {
  const rows = await queryMany<AuditRow>(`
    SELECT
      a.AUDIT_ID,
      a.TEMPLATE_ID,
      a.BRAND_ID,
      a.DEPARTMENT_ID,
      a.LOCATION_ID,
      a.PERFORMED_BY,
      t.TEMPLATE_NAME,
      b.BRAND_NAME,
      d.DEPARTMENT_NAME,
      l.LOCATION_NAME,
      a.COMPLIANCE_AREA,
      a.STATUS,
      u.DISPLAY_NAME AS PERFORMED_BY_NAME,
      a.STARTED_AT,
      a.COMPLETED_AT,
      a.SCORE_PERCENT,
      a.REMARKS
    FROM AUDITS a
    INNER JOIN CHECKLIST_TEMPLATES t ON t.TEMPLATE_ID = a.TEMPLATE_ID
    LEFT JOIN BRANDS b ON b.BRAND_ID = a.BRAND_ID
    LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = a.DEPARTMENT_ID
    LEFT JOIN LOCATIONS l ON l.LOCATION_ID = a.LOCATION_ID
    INNER JOIN USERS u ON u.USER_ID = a.PERFORMED_BY
    ORDER BY a.STARTED_AT DESC
  `);

  return rows.map((row) => ({
    auditId: row.AUDIT_ID,
    templateId: row.TEMPLATE_ID,
    brandId: row.BRAND_ID,
    departmentId: row.DEPARTMENT_ID,
    locationId: row.LOCATION_ID,
    performedByUserId: row.PERFORMED_BY,
    templateName: row.TEMPLATE_NAME,
    brandName: row.BRAND_NAME,
    departmentName: row.DEPARTMENT_NAME,
    locationName: row.LOCATION_NAME,
    complianceArea: row.COMPLIANCE_AREA,
    status: row.STATUS,
    performedByName: row.PERFORMED_BY_NAME,
    startedAt: row.STARTED_AT,
    completedAt: row.COMPLETED_AT,
    scorePercent: row.SCORE_PERCENT,
    remarks: row.REMARKS,
  }));
}

export async function createAudit(input: CreateAuditInput, performedBy: number): Promise<void> {
  await executeCommand(
    `
      INSERT INTO AUDITS (
        TEMPLATE_ID,
        BRAND_ID,
        DEPARTMENT_ID,
        LOCATION_ID,
        COMPLIANCE_AREA,
        STATUS,
        PERFORMED_BY,
        REMARKS
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.templateId,
      input.brandId,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.complianceArea,
      input.status,
      performedBy,
      input.remarks ?? null,
    ],
  );
}

const AUDIT_SELECT = `
  SELECT
    a.AUDIT_ID,
    a.TEMPLATE_ID,
    a.BRAND_ID,
    a.DEPARTMENT_ID,
    a.LOCATION_ID,
    a.PERFORMED_BY,
    t.TEMPLATE_NAME,
    b.BRAND_NAME,
    d.DEPARTMENT_NAME,
    l.LOCATION_NAME,
    a.COMPLIANCE_AREA,
    a.STATUS,
    u.DISPLAY_NAME AS PERFORMED_BY_NAME,
    a.STARTED_AT,
    a.COMPLETED_AT,
    a.SCORE_PERCENT,
    a.REMARKS
  FROM AUDITS a
  INNER JOIN CHECKLIST_TEMPLATES t ON t.TEMPLATE_ID = a.TEMPLATE_ID
  LEFT JOIN BRANDS b ON b.BRAND_ID = a.BRAND_ID
  LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = a.DEPARTMENT_ID
  LEFT JOIN LOCATIONS l ON l.LOCATION_ID = a.LOCATION_ID
  INNER JOIN USERS u ON u.USER_ID = a.PERFORMED_BY
`;

function mapAuditRow(row: AuditRow): AuditRecord {
  return {
    auditId: row.AUDIT_ID,
    templateId: row.TEMPLATE_ID,
    brandId: row.BRAND_ID,
    departmentId: row.DEPARTMENT_ID,
    locationId: row.LOCATION_ID,
    performedByUserId: row.PERFORMED_BY,
    templateName: row.TEMPLATE_NAME,
    brandName: row.BRAND_NAME,
    departmentName: row.DEPARTMENT_NAME,
    locationName: row.LOCATION_NAME,
    complianceArea: row.COMPLIANCE_AREA,
    status: row.STATUS,
    performedByName: row.PERFORMED_BY_NAME,
    startedAt: row.STARTED_AT,
    completedAt: row.COMPLETED_AT,
    scorePercent: row.SCORE_PERCENT,
    remarks: row.REMARKS,
  };
}

export async function getAuditById(auditId: number): Promise<AuditRecord | null> {
  const row = await queryFirst<AuditRow>(`${AUDIT_SELECT} WHERE a.AUDIT_ID = ?`, [auditId]);
  return row ? mapAuditRow(row) : null;
}

type ChecklistItemRow = {
  ITEM_ID: number;
  TEMPLATE_ID: number;
  SECTION_NAME: string | null;
  ITEM_TEXT: string;
  WEIGHT: number;
  SORT_ORDER: number;
};

export async function listChecklistItemsByTemplate(templateId: number): Promise<ChecklistItemRecord[]> {
  const rows = await queryMany<ChecklistItemRow>(
    `
      SELECT ITEM_ID, TEMPLATE_ID, SECTION_NAME, ITEM_TEXT, WEIGHT, SORT_ORDER
      FROM CHECKLIST_ITEMS
      WHERE TEMPLATE_ID = ? AND IS_ACTIVE = TRUE
      ORDER BY SORT_ORDER, ITEM_ID
    `,
    [templateId],
  );

  return rows.map((row) => ({
    itemId: row.ITEM_ID,
    templateId: row.TEMPLATE_ID,
    sectionName: row.SECTION_NAME,
    itemText: row.ITEM_TEXT,
    weight: row.WEIGHT,
    sortOrder: row.SORT_ORDER,
  }));
}

export async function addChecklistItem(input: AddChecklistItemInput): Promise<void> {
  await executeCommand(
    `
      INSERT INTO CHECKLIST_ITEMS (TEMPLATE_ID, SECTION_NAME, ITEM_TEXT, WEIGHT, SORT_ORDER)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      input.templateId,
      input.sectionName ?? null,
      input.itemText,
      input.weight ?? 1,
      input.sortOrder ?? 0,
    ],
  );
}

type AuditResponseRow = {
  RESPONSE_ID: number;
  AUDIT_ID: number;
  ITEM_ID: number;
  RESULT: AuditResponseRecord["result"];
  COMMENTS: string | null;
};

export async function listAuditResponses(auditId: number): Promise<AuditResponseRecord[]> {
  const rows = await queryMany<AuditResponseRow>(
    `
      SELECT RESPONSE_ID, AUDIT_ID, ITEM_ID, RESULT, COMMENTS
      FROM AUDIT_RESPONSES
      WHERE AUDIT_ID = ?
    `,
    [auditId],
  );

  return rows.map((row) => ({
    responseId: row.RESPONSE_ID,
    auditId: row.AUDIT_ID,
    itemId: row.ITEM_ID,
    result: row.RESULT,
    comments: row.COMMENTS,
  }));
}

export async function saveAuditResponses(input: SaveAuditResponsesInput, items: ChecklistItemRecord[]): Promise<void> {
  // Replace all responses for this audit
  await executeCommand(`DELETE FROM AUDIT_RESPONSES WHERE AUDIT_ID = ?`, [input.auditId]);

  for (const response of input.responses) {
    await executeCommand(
      `INSERT INTO AUDIT_RESPONSES (AUDIT_ID, ITEM_ID, RESULT, COMMENTS) VALUES (?, ?, ?, ?)`,
      [input.auditId, response.itemId, response.result, response.comments ?? null],
    );
  }

  if (input.complete) {
    // Calculate weighted score (exclude N/A items)
    let passWeight = 0;
    let totalWeight = 0;

    for (const response of input.responses) {
      if (response.result === "Not Applicable") {
        continue;
      }

      const item = items.find((i) => i.itemId === response.itemId);
      const weight = item?.weight ?? 1;
      totalWeight += weight;

      if (response.result === "Pass") {
        passWeight += weight;
      }
    }

    const scorePercent = totalWeight > 0 ? Math.round((passWeight / totalWeight) * 10000) / 100 : null;

    await executeCommand(
      `
        UPDATE AUDITS
        SET STATUS = 'Completed', COMPLETED_AT = CURRENT_TIMESTAMP(), SCORE_PERCENT = ?
        WHERE AUDIT_ID = ?
      `,
      [scorePercent, input.auditId],
    );
  }
}