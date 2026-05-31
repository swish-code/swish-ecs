import { executeCommand, queryFirst, queryMany } from "@/lib/snowflake/query";
import type { AssignmentRecord, CreateAssignmentInput, UpdateAssignmentInput } from "@/features/assignments/types";

type AssignmentRow = {
  ASSIGNMENT_ID: number;
  SOP_ID: number;
  BRAND_ID: number | null;
  DEPARTMENT_ID: number | null;
  LOCATION_ID: number | null;
  OWNER_USER_ID: number | null;
  DOCUMENT_NO: string;
  SOP_TITLE: string;
  BRAND_NAME: string | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_NAME: string | null;
  OWNER_DISPLAY_NAME: string | null;
  STATUS: AssignmentRecord["status"];
  TARGET_DATE: string | null;
  COMPLETED_AT: string | null;
  REMARKS: string | null;
};

export async function listAssignments(): Promise<AssignmentRecord[]> {
  const rows = await queryMany<AssignmentRow>(`
    SELECT
      sa.ASSIGNMENT_ID,
      sa.SOP_ID,
      sa.BRAND_ID,
      sa.DEPARTMENT_ID,
      sa.LOCATION_ID,
      sa.OWNER_USER_ID,
      s.DOCUMENT_NO,
      s.TITLE AS SOP_TITLE,
      b.BRAND_NAME,
      d.DEPARTMENT_NAME,
      l.LOCATION_NAME,
      u.DISPLAY_NAME AS OWNER_DISPLAY_NAME,
      sa.STATUS,
      sa.TARGET_DATE,
      sa.COMPLETED_AT,
      sa.REMARKS
    FROM SOP_ASSIGNMENTS sa
    INNER JOIN SOPS s ON s.SOP_ID = sa.SOP_ID
    LEFT JOIN BRANDS b ON b.BRAND_ID = sa.BRAND_ID
    LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = sa.DEPARTMENT_ID
    LEFT JOIN LOCATIONS l ON l.LOCATION_ID = sa.LOCATION_ID
    LEFT JOIN USERS u ON u.USER_ID = sa.OWNER_USER_ID
    ORDER BY sa.CREATED_AT DESC
  `);

  return rows.map((row) => ({
    assignmentId: row.ASSIGNMENT_ID,
    sopId: row.SOP_ID,
    brandId: row.BRAND_ID,
    departmentId: row.DEPARTMENT_ID,
    locationId: row.LOCATION_ID,
    ownerUserId: row.OWNER_USER_ID,
    documentNo: row.DOCUMENT_NO,
    sopTitle: row.SOP_TITLE,
    brandName: row.BRAND_NAME,
    departmentName: row.DEPARTMENT_NAME,
    locationName: row.LOCATION_NAME,
    ownerDisplayName: row.OWNER_DISPLAY_NAME,
    status: row.STATUS,
    targetDate: row.TARGET_DATE,
    completedAt: row.COMPLETED_AT,
    remarks: row.REMARKS,
  }));
}

export async function createAssignment(input: CreateAssignmentInput, createdBy: number): Promise<void> {
  await executeCommand(
    `
      INSERT INTO SOP_ASSIGNMENTS (
        SOP_ID,
        BRAND_ID,
        DEPARTMENT_ID,
        LOCATION_ID,
        OWNER_USER_ID,
        STATUS,
        TARGET_DATE,
        REMARKS,
        CREATED_BY
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.sopId,
      input.brandId,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.ownerUserId ?? null,
      input.status,
      input.targetDate ?? null,
      input.remarks ?? null,
      createdBy,
    ],
  );
}

export async function getAssignmentById(assignmentId: number): Promise<AssignmentRecord | null> {
  const rows = await queryFirst<AssignmentRow>(
    `
      SELECT
        sa.ASSIGNMENT_ID,
        sa.SOP_ID,
        sa.BRAND_ID,
        sa.DEPARTMENT_ID,
        sa.LOCATION_ID,
        sa.OWNER_USER_ID,
        s.DOCUMENT_NO,
        s.TITLE AS SOP_TITLE,
        b.BRAND_NAME,
        d.DEPARTMENT_NAME,
        l.LOCATION_NAME,
        u.DISPLAY_NAME AS OWNER_DISPLAY_NAME,
        sa.STATUS,
        sa.TARGET_DATE,
        sa.COMPLETED_AT,
        sa.REMARKS
      FROM SOP_ASSIGNMENTS sa
      INNER JOIN SOPS s ON s.SOP_ID = sa.SOP_ID
      LEFT JOIN BRANDS b ON b.BRAND_ID = sa.BRAND_ID
      LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = sa.DEPARTMENT_ID
      LEFT JOIN LOCATIONS l ON l.LOCATION_ID = sa.LOCATION_ID
      LEFT JOIN USERS u ON u.USER_ID = sa.OWNER_USER_ID
      WHERE sa.ASSIGNMENT_ID = ?
    `,
    [assignmentId],
  );

  if (!rows) {
    return null;
  }

  return {
    assignmentId: rows.ASSIGNMENT_ID,
    sopId: rows.SOP_ID,
    brandId: rows.BRAND_ID,
    departmentId: rows.DEPARTMENT_ID,
    locationId: rows.LOCATION_ID,
    ownerUserId: rows.OWNER_USER_ID,
    documentNo: rows.DOCUMENT_NO,
    sopTitle: rows.SOP_TITLE,
    brandName: rows.BRAND_NAME,
    departmentName: rows.DEPARTMENT_NAME,
    locationName: rows.LOCATION_NAME,
    ownerDisplayName: rows.OWNER_DISPLAY_NAME,
    status: rows.STATUS,
    targetDate: rows.TARGET_DATE,
    completedAt: rows.COMPLETED_AT,
    remarks: rows.REMARKS,
  };
}

export async function updateAssignment(input: UpdateAssignmentInput, updatedBy: number): Promise<void> {
  await executeCommand(
    `
      UPDATE SOP_ASSIGNMENTS
      SET
        STATUS = ?,
        TARGET_DATE = ?,
        COMPLETED_AT = CASE
          WHEN ? IN ('Implemented', 'Verified') THEN COALESCE(COMPLETED_AT, CURRENT_TIMESTAMP())
          ELSE NULL
        END,
        REMARKS = ?,
        UPDATED_BY = ?,
        UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE ASSIGNMENT_ID = ?
    `,
    [
      input.status,
      input.targetDate ?? null,
      input.status,
      input.remarks ?? null,
      updatedBy,
      input.assignmentId,
    ],
  );
}