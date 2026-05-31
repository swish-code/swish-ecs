import { executeCommand, queryFirst, queryMany } from "@/lib/snowflake/query";
import type {
  CorrectiveActionRecord,
  CreateCorrectiveActionInput,
  UpdateCorrectiveActionInput,
} from "@/features/capa/types";

type CapaRow = {
  ACTION_ID: number;
  SOURCE_TYPE: string;
  SOURCE_ID: number | null;
  TITLE: string;
  DESCRIPTION: string | null;
  BRAND_ID: number | null;
  DEPARTMENT_ID: number | null;
  LOCATION_ID: number | null;
  ASSIGNED_TO: number;
  ASSIGNED_TO_NAME: string;
  SEVERITY: CorrectiveActionRecord["severity"];
  STATUS: CorrectiveActionRecord["status"];
  DUE_DATE: string;
  SUBMITTED_BY: number | null;
  SUBMITTED_AT: string | null;
  VERIFIED_BY: number | null;
  VERIFIED_AT: string | null;
  CLOSED_AT: string | null;
  REMARKS: string | null;
  BRAND_NAME: string | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_NAME: string | null;
  CREATED_AT: string;
};

const SELECT_CAPA = `
  SELECT
    ca.ACTION_ID,
    ca.SOURCE_TYPE,
    ca.SOURCE_ID,
    ca.TITLE,
    ca.DESCRIPTION,
    ca.BRAND_ID,
    ca.DEPARTMENT_ID,
    ca.LOCATION_ID,
    ca.ASSIGNED_TO,
    u.DISPLAY_NAME AS ASSIGNED_TO_NAME,
    ca.SEVERITY,
    ca.STATUS,
    ca.DUE_DATE,
    ca.SUBMITTED_BY,
    ca.SUBMITTED_AT,
    ca.VERIFIED_BY,
    ca.VERIFIED_AT,
    ca.CLOSED_AT,
    ca.REMARKS,
    b.BRAND_NAME,
    d.DEPARTMENT_NAME,
    l.LOCATION_NAME,
    ca.CREATED_AT
  FROM CORRECTIVE_ACTIONS ca
  LEFT JOIN USERS u ON u.USER_ID = ca.ASSIGNED_TO
  LEFT JOIN BRANDS b ON b.BRAND_ID = ca.BRAND_ID
  LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = ca.DEPARTMENT_ID
  LEFT JOIN LOCATIONS l ON l.LOCATION_ID = ca.LOCATION_ID
`;

function mapRow(row: CapaRow): CorrectiveActionRecord {
  return {
    actionId: row.ACTION_ID,
    sourceType: row.SOURCE_TYPE,
    sourceId: row.SOURCE_ID,
    title: row.TITLE,
    description: row.DESCRIPTION,
    brandId: row.BRAND_ID,
    departmentId: row.DEPARTMENT_ID,
    locationId: row.LOCATION_ID,
    assignedTo: row.ASSIGNED_TO,
    assignedToName: row.ASSIGNED_TO_NAME,
    severity: row.SEVERITY,
    status: row.STATUS,
    dueDate: row.DUE_DATE,
    submittedBy: row.SUBMITTED_BY,
    submittedAt: row.SUBMITTED_AT,
    verifiedBy: row.VERIFIED_BY,
    verifiedAt: row.VERIFIED_AT,
    closedAt: row.CLOSED_AT,
    remarks: row.REMARKS,
    brandName: row.BRAND_NAME,
    departmentName: row.DEPARTMENT_NAME,
    locationName: row.LOCATION_NAME,
    createdAt: row.CREATED_AT,
  };
}

export async function listCorrectiveActions(): Promise<CorrectiveActionRecord[]> {
  const rows = await queryMany<CapaRow>(`${SELECT_CAPA} ORDER BY ca.CREATED_AT DESC`);
  return rows.map(mapRow);
}

export async function getCorrectiveActionById(actionId: number): Promise<CorrectiveActionRecord | null> {
  const row = await queryFirst<CapaRow>(`${SELECT_CAPA} WHERE ca.ACTION_ID = ?`, [actionId]);
  return row ? mapRow(row) : null;
}

export async function createCorrectiveAction(
  input: CreateCorrectiveActionInput,
  createdBy: number,
): Promise<void> {
  await executeCommand(
    `
      INSERT INTO CORRECTIVE_ACTIONS (
        SOURCE_TYPE, SOURCE_ID, TITLE, DESCRIPTION,
        BRAND_ID, DEPARTMENT_ID, LOCATION_ID,
        ASSIGNED_TO, SEVERITY, STATUS, DUE_DATE,
        REMARKS, CREATED_BY
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.sourceType,
      input.sourceId ?? null,
      input.title,
      input.description ?? null,
      input.brandId ?? null,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.assignedTo,
      input.severity,
      input.status,
      input.dueDate,
      input.remarks ?? null,
      createdBy,
    ],
  );
}

export async function updateCorrectiveAction(
  input: UpdateCorrectiveActionInput,
  updatedBy: number,
): Promise<void> {
  await executeCommand(
    `
      UPDATE CORRECTIVE_ACTIONS
      SET
        STATUS = ?,
        ASSIGNED_TO = ?,
        DUE_DATE = ?,
        REMARKS = ?,
        SUBMITTED_AT = IFF(? = 'Submitted' AND SUBMITTED_AT IS NULL, CURRENT_TIMESTAMP(), SUBMITTED_AT),
        SUBMITTED_BY = IFF(? = 'Submitted' AND SUBMITTED_BY IS NULL, ?, SUBMITTED_BY),
        VERIFIED_AT = IFF(? = 'Verified' AND VERIFIED_AT IS NULL, CURRENT_TIMESTAMP(), VERIFIED_AT),
        VERIFIED_BY = IFF(? = 'Verified' AND VERIFIED_BY IS NULL, ?, VERIFIED_BY),
        CLOSED_AT = IFF(? = 'Closed' AND CLOSED_AT IS NULL, CURRENT_TIMESTAMP(), CLOSED_AT),
        UPDATED_BY = ?,
        UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE ACTION_ID = ?
    `,
    [
      input.status,
      input.assignedTo,
      input.dueDate,
      input.remarks ?? null,
      input.status,
      input.status,
      updatedBy,
      input.status,
      input.status,
      updatedBy,
      input.status,
      updatedBy,
      input.actionId,
    ],
  );
}
