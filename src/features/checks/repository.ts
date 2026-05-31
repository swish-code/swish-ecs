import { executeCommand, queryFirst, queryMany } from "@/lib/snowflake/query";
import type { CheckRecord, CheckResultRecord, CreateCheckResultInput } from "@/features/checks/types";

type CheckRow = {
  CHECK_ID: number;
  CONTROL_ID: number;
  CONTROL_CODE: string;
  CONTROL_NAME: string;
  CHECK_NAME: string;
  CHECK_TYPE: string;
  SOURCE_ENTITY_TYPE: string | null;
  SOURCE_ENTITY_ID: number | null;
  SEVERITY: string | null;
  IS_ACTIVE: boolean;
  OWNER_USER_ID: number | null;
  OWNER_DISPLAY_NAME: string | null;
  BRAND_ID: number | null;
  BRAND_NAME: string | null;
  DEPARTMENT_ID: number | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_ID: number | null;
  LOCATION_NAME: string | null;
  LATEST_STATUS: string | null;
  LATEST_RESULT_ID: number | null;
  LAST_EVALUATED_AT: string | null;
  NEXT_EVALUATION_AT: string | null;
};

type CheckResultRow = {
  CHECK_RESULT_ID: number;
  CHECK_ID: number;
  BRAND_ID: number | null;
  BRAND_NAME: string | null;
  DEPARTMENT_ID: number | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_ID: number | null;
  LOCATION_NAME: string | null;
  TARGET_ENTITY_TYPE: string | null;
  TARGET_ENTITY_ID: number | null;
  STATUS: string;
  LAST_EVALUATED_AT: string | null;
  NEXT_EVALUATION_AT: string | null;
  DETAILS_TEXT: string | null;
};

function mapCheckRow(row: CheckRow): CheckRecord {
  return {
    checkId: row.CHECK_ID,
    controlId: row.CONTROL_ID,
    controlCode: row.CONTROL_CODE,
    controlName: row.CONTROL_NAME,
    checkName: row.CHECK_NAME,
    checkType: row.CHECK_TYPE,
    sourceEntityType: row.SOURCE_ENTITY_TYPE,
    sourceEntityId: row.SOURCE_ENTITY_ID,
    severity: row.SEVERITY ?? "Medium",
    isActive: row.IS_ACTIVE,
    ownerUserId: row.OWNER_USER_ID,
    ownerDisplayName: row.OWNER_DISPLAY_NAME,
    brandId: row.BRAND_ID,
    brandName: row.BRAND_NAME,
    departmentId: row.DEPARTMENT_ID,
    departmentName: row.DEPARTMENT_NAME,
    locationId: row.LOCATION_ID,
    locationName: row.LOCATION_NAME,
    latestStatus: row.LATEST_STATUS,
    latestResultId: row.LATEST_RESULT_ID,
    lastEvaluatedAt: row.LAST_EVALUATED_AT,
    nextEvaluationAt: row.NEXT_EVALUATION_AT,
  };
}

function mapCheckResultRow(row: CheckResultRow): CheckResultRecord {
  return {
    checkResultId: row.CHECK_RESULT_ID,
    checkId: row.CHECK_ID,
    brandId: row.BRAND_ID,
    brandName: row.BRAND_NAME,
    departmentId: row.DEPARTMENT_ID,
    departmentName: row.DEPARTMENT_NAME,
    locationId: row.LOCATION_ID,
    locationName: row.LOCATION_NAME,
    targetEntityType: row.TARGET_ENTITY_TYPE,
    targetEntityId: row.TARGET_ENTITY_ID,
    status: row.STATUS,
    lastEvaluatedAt: row.LAST_EVALUATED_AT,
    nextEvaluationAt: row.NEXT_EVALUATION_AT,
    detailsText: row.DETAILS_TEXT,
  };
}

const latestCheckResultJoin = `
  LEFT JOIN (
    SELECT
      CHECK_RESULT_ID,
      CHECK_ID,
      STATUS,
      LAST_EVALUATED_AT,
      NEXT_EVALUATION_AT,
      ROW_NUMBER() OVER (
        PARTITION BY CHECK_ID
        ORDER BY LAST_EVALUATED_AT DESC NULLS LAST, CHECK_RESULT_ID DESC
      ) AS RESULT_RANK
    FROM CHECK_RESULTS
  ) latest
    ON latest.CHECK_ID = chk.CHECK_ID
   AND latest.RESULT_RANK = 1
`;

const checkBaseSelect = `
  SELECT
    chk.CHECK_ID,
    chk.CONTROL_ID,
    c.CONTROL_CODE,
    c.CONTROL_NAME,
    chk.CHECK_NAME,
    chk.CHECK_TYPE,
    chk.SOURCE_ENTITY_TYPE,
    chk.SOURCE_ENTITY_ID,
    chk.SEVERITY,
    chk.IS_ACTIVE,
    chk.OWNER_USER_ID,
    u.DISPLAY_NAME AS OWNER_DISPLAY_NAME,
    c.BRAND_ID,
    b.BRAND_NAME,
    c.DEPARTMENT_ID,
    d.DEPARTMENT_NAME,
    c.LOCATION_ID,
    l.LOCATION_NAME,
    latest.STATUS AS LATEST_STATUS,
    latest.CHECK_RESULT_ID AS LATEST_RESULT_ID,
    latest.LAST_EVALUATED_AT,
    latest.NEXT_EVALUATION_AT
  FROM CHECKS chk
  INNER JOIN CONTROLS c ON c.CONTROL_ID = chk.CONTROL_ID
  LEFT JOIN USERS u ON u.USER_ID = chk.OWNER_USER_ID
  LEFT JOIN BRANDS b ON b.BRAND_ID = c.BRAND_ID
  LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = c.DEPARTMENT_ID
  LEFT JOIN LOCATIONS l ON l.LOCATION_ID = c.LOCATION_ID
  ${latestCheckResultJoin}
`;

export async function listChecks(): Promise<CheckRecord[]> {
  const rows = await queryMany<CheckRow>(`
    ${checkBaseSelect}
    ORDER BY
      CASE
        WHEN UPPER(COALESCE(latest.STATUS, '')) IN ('FAIL', 'FAILING', 'NEEDS REVIEW', 'OVERDUE', 'PENDING REVIEW', 'PENDING EVIDENCE') THEN 0
        WHEN UPPER(COALESCE(latest.STATUS, '')) = 'ACCEPTED RISK' THEN 1
        WHEN chk.IS_ACTIVE THEN 2
        ELSE 3
      END,
      latest.NEXT_EVALUATION_AT ASC NULLS LAST,
      chk.UPDATED_AT DESC NULLS LAST,
      chk.CHECK_ID DESC
  `);

  return rows.map(mapCheckRow);
}

export async function getCheckById(checkId: number): Promise<CheckRecord | null> {
  const row = await queryFirst<CheckRow>(`
    ${checkBaseSelect}
    WHERE chk.CHECK_ID = ?
  `, [checkId]);

  return row ? mapCheckRow(row) : null;
}

export async function listCheckResults(checkId: number): Promise<CheckResultRecord[]> {
  const rows = await queryMany<CheckResultRow>(`
    SELECT
      r.CHECK_RESULT_ID,
      r.CHECK_ID,
      r.BRAND_ID,
      b.BRAND_NAME,
      r.DEPARTMENT_ID,
      d.DEPARTMENT_NAME,
      r.LOCATION_ID,
      l.LOCATION_NAME,
      r.TARGET_ENTITY_TYPE,
      r.TARGET_ENTITY_ID,
      r.STATUS,
      r.LAST_EVALUATED_AT,
      r.NEXT_EVALUATION_AT,
      TO_VARCHAR(r.DETAILS) AS DETAILS_TEXT
    FROM CHECK_RESULTS r
    LEFT JOIN BRANDS b ON b.BRAND_ID = r.BRAND_ID
    LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = r.DEPARTMENT_ID
    LEFT JOIN LOCATIONS l ON l.LOCATION_ID = r.LOCATION_ID
    WHERE r.CHECK_ID = ?
    ORDER BY r.LAST_EVALUATED_AT DESC NULLS LAST, r.CHECK_RESULT_ID DESC
  `, [checkId]);

  return rows.map(mapCheckResultRow);
}

export async function createCheckResult(
  input: CreateCheckResultInput,
  scope: { brandId: number | null; departmentId: number | null; locationId: number | null },
): Promise<void> {
  await executeCommand(
    `
      INSERT INTO CHECK_RESULTS (
        CHECK_ID,
        BRAND_ID,
        DEPARTMENT_ID,
        LOCATION_ID,
        TARGET_ENTITY_TYPE,
        TARGET_ENTITY_ID,
        STATUS,
        LAST_EVALUATED_AT,
        NEXT_EVALUATION_AT,
        DETAILS
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, IFF(? IS NULL, NULL, TO_VARIANT(?)))
    `,
    [
      input.checkId,
      scope.brandId,
      scope.departmentId,
      scope.locationId,
      input.targetEntityType ?? null,
      input.targetEntityId ?? null,
      input.status,
      input.lastEvaluatedAt ?? new Date().toISOString(),
      input.nextEvaluationAt ?? null,
      input.detailsText ?? null,
      input.detailsText ?? null,
    ],
  );
}