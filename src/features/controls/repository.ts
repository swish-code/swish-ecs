import { executeCommand, queryFirst, queryMany } from "@/lib/snowflake/query";
import type { ControlLinkRecord, ControlRecord, CreateControlInput, RelatedControlRecord, UpdateControlInput } from "@/features/controls/types";

type ControlRow = {
  CONTROL_ID: number;
  CONTROL_CODE: string;
  CONTROL_NAME: string;
  CONTROL_CATEGORY: string | null;
  CONTROL_TYPE: string | null;
  BRAND_ID: number | null;
  BRAND_NAME: string | null;
  DEPARTMENT_ID: number | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_ID: number | null;
  LOCATION_NAME: string | null;
  OWNER_USER_ID: number | null;
  OWNER_DISPLAY_NAME: string | null;
  STATUS: string;
  REVIEW_FREQUENCY_DAYS: number | null;
  DESCRIPTION: string | null;
  SOP_LINK_COUNT: number | null;
  DOCUMENT_LINK_COUNT: number | null;
  CHECK_LINK_COUNT: number | null;
  TASK_LINK_COUNT: number | null;
};

type ControlLinkRow = {
  LINK_ID: number;
  CONTROL_ID: number;
  ENTITY_TYPE: string;
  ENTITY_ID: number;
  LINK_ROLE: string;
  IS_PRIMARY: boolean;
  DISPLAY_NAME: string;
  HREF: string | null;
};

type RelatedControlRow = {
  CONTROL_ID: number;
  CONTROL_CODE: string;
  CONTROL_NAME: string;
  STATUS: string;
  BRAND_ID: number | null;
  DEPARTMENT_ID: number | null;
  LOCATION_ID: number | null;
  OWNER_USER_ID: number | null;
  LINK_ROLE: string;
  IS_PRIMARY: boolean;
};

type ExistingControlLinkRow = {
  LINK_ID: number;
};

type ExistingControlRow = {
  CONTROL_ID: number;
};

function mapControlRow(row: ControlRow): ControlRecord {
  return {
    controlId: row.CONTROL_ID,
    controlCode: row.CONTROL_CODE,
    controlName: row.CONTROL_NAME,
    controlCategory: row.CONTROL_CATEGORY,
    controlType: row.CONTROL_TYPE,
    brandId: row.BRAND_ID,
    brandName: row.BRAND_NAME,
    departmentId: row.DEPARTMENT_ID,
    departmentName: row.DEPARTMENT_NAME,
    locationId: row.LOCATION_ID,
    locationName: row.LOCATION_NAME,
    ownerUserId: row.OWNER_USER_ID,
    ownerDisplayName: row.OWNER_DISPLAY_NAME,
    status: row.STATUS,
    reviewFrequencyDays: row.REVIEW_FREQUENCY_DAYS,
    description: row.DESCRIPTION,
    sopLinkCount: row.SOP_LINK_COUNT ?? 0,
    documentLinkCount: row.DOCUMENT_LINK_COUNT ?? 0,
    checkLinkCount: row.CHECK_LINK_COUNT ?? 0,
    taskLinkCount: row.TASK_LINK_COUNT ?? 0,
  };
}

function mapControlLinkRow(row: ControlLinkRow): ControlLinkRecord {
  return {
    linkId: row.LINK_ID,
    controlId: row.CONTROL_ID,
    entityType: row.ENTITY_TYPE,
    entityId: row.ENTITY_ID,
    linkRole: row.LINK_ROLE,
    isPrimary: row.IS_PRIMARY,
    displayName: row.DISPLAY_NAME,
    href: row.HREF,
  };
}

function mapRelatedControlRow(row: RelatedControlRow): RelatedControlRecord {
  return {
    controlId: row.CONTROL_ID,
    controlCode: row.CONTROL_CODE,
    controlName: row.CONTROL_NAME,
    status: row.STATUS,
    brandId: row.BRAND_ID,
    departmentId: row.DEPARTMENT_ID,
    locationId: row.LOCATION_ID,
    ownerUserId: row.OWNER_USER_ID,
    linkRole: row.LINK_ROLE,
    isPrimary: row.IS_PRIMARY,
  };
}

const controlLinkCountsSql = `
  SELECT
    CONTROL_ID,
    SUM(CASE WHEN UPPER(ENTITY_TYPE) IN ('SOP', 'SOPS') THEN 1 ELSE 0 END) AS SOP_LINK_COUNT,
    SUM(CASE WHEN UPPER(ENTITY_TYPE) IN ('DOCUMENT', 'DOCUMENTS') THEN 1 ELSE 0 END) AS DOCUMENT_LINK_COUNT,
    SUM(CASE WHEN UPPER(ENTITY_TYPE) IN ('TASK', 'TASKS') THEN 1 ELSE 0 END) AS TASK_LINK_COUNT
  FROM CONTROL_LINKS
  GROUP BY CONTROL_ID
`;

const checkCountsSql = `
  SELECT CONTROL_ID, COUNT(*) AS CHECK_LINK_COUNT
  FROM CHECKS
  GROUP BY CONTROL_ID
`;

export async function listControls(): Promise<ControlRecord[]> {
  const rows = await queryMany<ControlRow>(`
    SELECT
      c.CONTROL_ID,
      c.CONTROL_CODE,
      c.CONTROL_NAME,
      c.CONTROL_CATEGORY,
      c.CONTROL_TYPE,
      c.BRAND_ID,
      b.BRAND_NAME,
      c.DEPARTMENT_ID,
      d.DEPARTMENT_NAME,
      c.LOCATION_ID,
      l.LOCATION_NAME,
      c.OWNER_USER_ID,
      u.DISPLAY_NAME AS OWNER_DISPLAY_NAME,
      c.STATUS,
      c.REVIEW_FREQUENCY_DAYS,
      c.DESCRIPTION,
      counts.SOP_LINK_COUNT,
      counts.DOCUMENT_LINK_COUNT,
      check_counts.CHECK_LINK_COUNT,
      counts.TASK_LINK_COUNT
    FROM CONTROLS c
    LEFT JOIN (${controlLinkCountsSql}) counts ON counts.CONTROL_ID = c.CONTROL_ID
    LEFT JOIN (${checkCountsSql}) check_counts ON check_counts.CONTROL_ID = c.CONTROL_ID
    LEFT JOIN BRANDS b ON b.BRAND_ID = c.BRAND_ID
    LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = c.DEPARTMENT_ID
    LEFT JOIN LOCATIONS l ON l.LOCATION_ID = c.LOCATION_ID
    LEFT JOIN USERS u ON u.USER_ID = c.OWNER_USER_ID
    ORDER BY c.UPDATED_AT DESC NULLS LAST, c.CREATED_AT DESC, c.CONTROL_ID DESC
  `);

  return rows.map(mapControlRow);
}

export async function getControlById(controlId: number): Promise<ControlRecord | null> {
  const row = await queryFirst<ControlRow>(
    `
      SELECT
        c.CONTROL_ID,
        c.CONTROL_CODE,
        c.CONTROL_NAME,
        c.CONTROL_CATEGORY,
        c.CONTROL_TYPE,
        c.BRAND_ID,
        b.BRAND_NAME,
        c.DEPARTMENT_ID,
        d.DEPARTMENT_NAME,
        c.LOCATION_ID,
        l.LOCATION_NAME,
        c.OWNER_USER_ID,
        u.DISPLAY_NAME AS OWNER_DISPLAY_NAME,
        c.STATUS,
        c.REVIEW_FREQUENCY_DAYS,
        c.DESCRIPTION,
        counts.SOP_LINK_COUNT,
        counts.DOCUMENT_LINK_COUNT,
        check_counts.CHECK_LINK_COUNT,
        counts.TASK_LINK_COUNT
      FROM CONTROLS c
      LEFT JOIN (${controlLinkCountsSql}) counts ON counts.CONTROL_ID = c.CONTROL_ID
      LEFT JOIN (${checkCountsSql}) check_counts ON check_counts.CONTROL_ID = c.CONTROL_ID
      LEFT JOIN BRANDS b ON b.BRAND_ID = c.BRAND_ID
      LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = c.DEPARTMENT_ID
      LEFT JOIN LOCATIONS l ON l.LOCATION_ID = c.LOCATION_ID
      LEFT JOIN USERS u ON u.USER_ID = c.OWNER_USER_ID
      WHERE c.CONTROL_ID = ?
    `,
    [controlId],
  );

  return row ? mapControlRow(row) : null;
}

export async function listControlLinks(controlId: number): Promise<ControlLinkRecord[]> {
  const rows = await queryMany<ControlLinkRow>(
    `
      SELECT *
      FROM (
        SELECT
          cl.LINK_ID,
          cl.CONTROL_ID,
          cl.ENTITY_TYPE,
          cl.ENTITY_ID,
          cl.LINK_ROLE,
          cl.IS_PRIMARY,
          CASE
            WHEN UPPER(cl.ENTITY_TYPE) IN ('SOP', 'SOPS') THEN COALESCE(CONCAT(s.DOCUMENT_NO, ' - ', s.TITLE), CONCAT('SOP #', TO_VARCHAR(cl.ENTITY_ID)))
            WHEN UPPER(cl.ENTITY_TYPE) IN ('DOCUMENT', 'DOCUMENTS') THEN COALESCE(d.DOCUMENT_NAME, CONCAT('Document #', TO_VARCHAR(cl.ENTITY_ID)))
            WHEN UPPER(cl.ENTITY_TYPE) IN ('TASK', 'TASKS') THEN CONCAT('Task #', TO_VARCHAR(cl.ENTITY_ID))
            ELSE CONCAT(cl.ENTITY_TYPE, ' #', TO_VARCHAR(cl.ENTITY_ID))
          END AS DISPLAY_NAME,
          CASE
            WHEN UPPER(cl.ENTITY_TYPE) IN ('SOP', 'SOPS') THEN CONCAT('/sops/', TO_VARCHAR(cl.ENTITY_ID))
            WHEN UPPER(cl.ENTITY_TYPE) IN ('DOCUMENT', 'DOCUMENTS') THEN CONCAT('/documents/', TO_VARCHAR(cl.ENTITY_ID))
            ELSE NULL
          END AS HREF
        FROM CONTROL_LINKS cl
        LEFT JOIN SOPS s
          ON UPPER(cl.ENTITY_TYPE) IN ('SOP', 'SOPS')
         AND s.SOP_ID = cl.ENTITY_ID
        LEFT JOIN DOCUMENTS d
          ON UPPER(cl.ENTITY_TYPE) IN ('DOCUMENT', 'DOCUMENTS')
         AND d.DOCUMENT_ID = cl.ENTITY_ID
        WHERE cl.CONTROL_ID = ?

        UNION ALL

        SELECT
          -chk.CHECK_ID AS LINK_ID,
          chk.CONTROL_ID,
          'CHECK' AS ENTITY_TYPE,
          chk.CHECK_ID AS ENTITY_ID,
          'VALIDATES' AS LINK_ROLE,
          FALSE AS IS_PRIMARY,
          chk.CHECK_NAME AS DISPLAY_NAME,
          CONCAT('/checks/', TO_VARCHAR(chk.CHECK_ID)) AS HREF
        FROM CHECKS chk
        WHERE chk.CONTROL_ID = ?
      ) links
      ORDER BY links.IS_PRIMARY DESC, links.ENTITY_TYPE, links.LINK_ID DESC
    `,
    [controlId, controlId],
  );

  return rows.map(mapControlLinkRow);
}

export async function listControlsForEntity(entityType: string, entityId: number): Promise<RelatedControlRecord[]> {
  const normalizedType = entityType.toUpperCase();
  const entityTypes = normalizedType === "SOP"
    ? ["SOP", "SOPS"]
    : normalizedType === "DOCUMENT"
      ? ["DOCUMENT", "DOCUMENTS"]
      : [normalizedType];
  const placeholders = entityTypes.map(() => "?").join(", ");

  const rows = await queryMany<RelatedControlRow>(
    `
      SELECT
        c.CONTROL_ID,
        c.CONTROL_CODE,
        c.CONTROL_NAME,
        c.STATUS,
        c.BRAND_ID,
        c.DEPARTMENT_ID,
        c.LOCATION_ID,
        c.OWNER_USER_ID,
        cl.LINK_ROLE,
        cl.IS_PRIMARY
      FROM CONTROL_LINKS cl
      INNER JOIN CONTROLS c ON c.CONTROL_ID = cl.CONTROL_ID
      WHERE UPPER(cl.ENTITY_TYPE) IN (${placeholders})
        AND cl.ENTITY_ID = ?
      ORDER BY cl.IS_PRIMARY DESC, c.CONTROL_CODE, c.CONTROL_ID
    `,
    [...entityTypes, entityId],
  );

  return rows.map(mapRelatedControlRow);
}

export async function upsertControlLink(input: {
  controlId: number;
  entityType: string;
  entityId: number;
  linkRole: string;
  isPrimary: boolean;
}): Promise<void> {
  const entityType = input.entityType.toUpperCase();

  if (input.isPrimary) {
    await executeCommand(
      `
        UPDATE CONTROL_LINKS
        SET IS_PRIMARY = FALSE
        WHERE UPPER(ENTITY_TYPE) = ?
          AND ENTITY_ID = ?
      `,
      [entityType, input.entityId],
    );
  }

  const existingLink = await queryFirst<ExistingControlLinkRow>(
    `
      SELECT LINK_ID
      FROM CONTROL_LINKS
      WHERE CONTROL_ID = ?
        AND UPPER(ENTITY_TYPE) = ?
        AND ENTITY_ID = ?
      LIMIT 1
    `,
    [input.controlId, entityType, input.entityId],
  );

  if (existingLink) {
    await executeCommand(
      `
        UPDATE CONTROL_LINKS
        SET LINK_ROLE = ?,
            IS_PRIMARY = ?
        WHERE LINK_ID = ?
      `,
      [input.linkRole, input.isPrimary, existingLink.LINK_ID],
    );

    return;
  }

  await executeCommand(
    `
      INSERT INTO CONTROL_LINKS (
        CONTROL_ID,
        ENTITY_TYPE,
        ENTITY_ID,
        LINK_ROLE,
        IS_PRIMARY
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [input.controlId, entityType, input.entityId, input.linkRole, input.isPrimary],
  );
}

export async function createControl(input: CreateControlInput, createdBy: number): Promise<void> {
  const existing = await queryFirst<ExistingControlRow>(
    `
      SELECT CONTROL_ID
      FROM CONTROLS
      WHERE UPPER(CONTROL_CODE) = UPPER(?)
      LIMIT 1
    `,
    [input.controlCode],
  );

  if (existing) {
    throw new Error("A control with this code already exists.");
  }

  await executeCommand(
    `
      INSERT INTO CONTROLS (
        CONTROL_CODE,
        CONTROL_NAME,
        CONTROL_CATEGORY,
        CONTROL_TYPE,
        BRAND_ID,
        DEPARTMENT_ID,
        LOCATION_ID,
        OWNER_USER_ID,
        STATUS,
        REVIEW_FREQUENCY_DAYS,
        DESCRIPTION,
        CREATED_BY
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.controlCode,
      input.controlName,
      input.controlCategory ?? null,
      input.controlType ?? null,
      input.brandId ?? null,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.ownerUserId ?? null,
      input.status,
      input.reviewFrequencyDays ?? null,
      input.description ?? null,
      createdBy,
    ],
  );
}

export async function updateControl(input: UpdateControlInput, updatedBy: number): Promise<void> {
  const existing = await queryFirst<ExistingControlRow>(
    `
      SELECT CONTROL_ID
      FROM CONTROLS
      WHERE UPPER(CONTROL_CODE) = UPPER(?)
        AND CONTROL_ID <> ?
      LIMIT 1
    `,
    [input.controlCode, input.controlId],
  );

  if (existing) {
    throw new Error("A control with this code already exists.");
  }

  await executeCommand(
    `
      UPDATE CONTROLS
      SET
        CONTROL_CODE = ?,
        CONTROL_NAME = ?,
        CONTROL_CATEGORY = ?,
        CONTROL_TYPE = ?,
        BRAND_ID = ?,
        DEPARTMENT_ID = ?,
        LOCATION_ID = ?,
        OWNER_USER_ID = ?,
        STATUS = ?,
        REVIEW_FREQUENCY_DAYS = ?,
        DESCRIPTION = ?,
        UPDATED_BY = ?,
        UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE CONTROL_ID = ?
    `,
    [
      input.controlCode,
      input.controlName,
      input.controlCategory ?? null,
      input.controlType ?? null,
      input.brandId ?? null,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.ownerUserId ?? null,
      input.status,
      input.reviewFrequencyDays ?? null,
      input.description ?? null,
      updatedBy,
      input.controlId,
    ],
  );
}