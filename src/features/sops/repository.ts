import { executeCommand, queryFirst, queryMany } from "@/lib/snowflake/query";
import type { CreateSopInput, SopApprovalInput, SopRecord, SopVersionRecord, UpdateSopInput } from "@/features/sops/types";

type SopRow = {
  SOP_ID: number;
  DOCUMENT_NO: string;
  DOCUMENT_TYPE: string;
  TITLE: string;
  BRAND_ID: number | null;
  BRAND_NAME: string | null;
  DEPARTMENT_ID: number | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_ID: number | null;
  LOCATION_NAME: string | null;
  COMPLIANCE_AREA: string;
  OWNER_USER_ID: number | null;
  OWNER_DISPLAY_NAME: string | null;
  VERSION_NO: string;
  STATUS: SopRecord["status"];
  FILE_NAME: string | null;
  FILE_URL: string | null;
  FILE_SIZE: number | null;
  MIME_TYPE: string | null;
  STORAGE_PROVIDER: string | null;
  STORAGE_DRIVE_ID: string | null;
  STORAGE_ITEM_ID: string | null;
  STORAGE_PATH: string | null;
  SUBMITTED_BY: number | null;
  SUBMITTED_AT: string | null;
  APPROVED_BY: number | null;
  APPROVED_AT: string | null;
  APPROVAL_REMARKS: string | null;
  ACTIVE_FROM: string | null;
  NEXT_REVIEW_DATE: string | null;
  REMARKS: string | null;
  CONTROL_LINK_COUNT: number | null;
};

type SopVersionPointerRow = {
  CURRENT_VERSION_ID: number | null;
};

type SopVersionIdRow = {
  SOP_VERSION_ID: number;
};

type SopParentSnapshotRow = {
  CURRENT_VERSION_ID: number | null;
  VERSION_NO: string;
  STATUS: SopRecord["status"];
  FILE_NAME: string | null;
  FILE_URL: string | null;
  FILE_SIZE: number | null;
  MIME_TYPE: string | null;
  SUBMITTED_BY: number | null;
  SUBMITTED_AT: string | null;
  APPROVED_BY: number | null;
  APPROVED_AT: string | null;
  APPROVAL_REMARKS: string | null;
  ACTIVE_FROM: string | null;
  NEXT_REVIEW_DATE: string | null;
  REMARKS: string | null;
  CREATED_BY: number;
  UPDATED_BY: number | null;
};

type UpdateSopOptions = {
  createNewVersion?: boolean;
};

type SopVersionRow = {
  SOP_VERSION_ID: number;
  SOP_ID: number;
  VERSION_NO: string;
  STATUS: SopVersionRecord["status"];
  FILE_NAME: string | null;
  SUBMITTED_AT: string | null;
  APPROVED_AT: string | null;
  ACTIVE_FROM: string | null;
  APPROVAL_REMARKS: string | null;
  REMARKS: string | null;
  CREATED_AT: string;
  IS_CURRENT: boolean;
};

const sopVersionJoin = `
  LEFT JOIN SOP_VERSIONS v
    ON v.SOP_ID = s.SOP_ID
   AND (
      v.SOP_VERSION_ID = s.CURRENT_VERSION_ID
      OR (s.CURRENT_VERSION_ID IS NULL AND v.VERSION_NO = s.VERSION_NO)
   )
`;

const resolvedCurrentVersionSelect = `
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.VERSION_NO ELSE v.VERSION_NO END AS VERSION_NO,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.STATUS ELSE v.STATUS END AS STATUS,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.FILE_NAME ELSE v.FILE_NAME END AS FILE_NAME,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.FILE_URL ELSE v.FILE_URL END AS FILE_URL,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.FILE_SIZE ELSE v.FILE_SIZE END AS FILE_SIZE,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.MIME_TYPE ELSE v.MIME_TYPE END AS MIME_TYPE,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.SUBMITTED_BY ELSE v.SUBMITTED_BY END AS SUBMITTED_BY,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.SUBMITTED_AT ELSE v.SUBMITTED_AT END AS SUBMITTED_AT,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.APPROVED_BY ELSE v.APPROVED_BY END AS APPROVED_BY,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.APPROVED_AT ELSE v.APPROVED_AT END AS APPROVED_AT,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.APPROVAL_REMARKS ELSE v.DECISION_REMARKS END AS APPROVAL_REMARKS,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.ACTIVE_FROM ELSE v.EFFECTIVE_FROM END AS ACTIVE_FROM,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.NEXT_REVIEW_DATE ELSE v.NEXT_REVIEW_DATE END AS NEXT_REVIEW_DATE,
    CASE WHEN v.SOP_VERSION_ID IS NULL THEN s.REMARKS ELSE v.REMARKS END AS REMARKS,
`;

function getContentMode(fileName: string | null, fileUrl: string | null): string {
  return fileName || fileUrl ? "FILE" : "TEXT";
}

function mapRecordStatus(status: SopRecord["status"]): string {
  if (status === "Active" || status === "Approved") {
    return "ACTIVE";
  }

  if (status === "Archived") {
    return "ARCHIVED";
  }

  return "OPEN";
}

async function getCurrentVersionId(sopId: number): Promise<number | null> {
  const row = await queryFirst<SopVersionPointerRow>(`SELECT CURRENT_VERSION_ID FROM SOPS WHERE SOP_ID = ?`, [sopId]);
  return row?.CURRENT_VERSION_ID ?? null;
}

async function findVersionId(sopId: number, versionNo: string): Promise<number | null> {
  const row = await queryFirst<SopVersionIdRow>(
    `
      SELECT SOP_VERSION_ID
      FROM SOP_VERSIONS
      WHERE SOP_ID = ?
        AND VERSION_NO = ?
      ORDER BY CREATED_AT DESC
      LIMIT 1
    `,
    [sopId, versionNo],
  );

  return row?.SOP_VERSION_ID ?? null;
}

async function syncCurrentVersionLink(sopId: number, versionId: number, status: SopRecord["status"]): Promise<void> {
  await executeCommand(
    `
      UPDATE SOPS
      SET CURRENT_VERSION_ID = ?,
          VERSION_NO = (
            SELECT VERSION_NO
            FROM SOP_VERSIONS
            WHERE SOP_VERSION_ID = ?
          ),
          STATUS = (
            SELECT STATUS
            FROM SOP_VERSIONS
            WHERE SOP_VERSION_ID = ?
          ),
          RECORD_STATUS = ?,
          UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE SOP_ID = ?
    `,
    [versionId, versionId, versionId, mapRecordStatus(status), sopId],
  );
}

async function syncParentFields(input: UpdateSopInput, updatedBy: number): Promise<void> {
  await executeCommand(
    `
      UPDATE SOPS
      SET DOCUMENT_NO = ?,
          DOCUMENT_TYPE = ?,
          TITLE = ?,
          BRAND_ID = ?,
          DEPARTMENT_ID = ?,
          LOCATION_ID = ?,
          COMPLIANCE_AREA = ?,
          OWNER_USER_ID = ?,
          STORAGE_PROVIDER = ?,
          STORAGE_DRIVE_ID = ?,
          STORAGE_ITEM_ID = ?,
          STORAGE_PATH = ?,
          UPDATED_BY = ?,
          UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE SOP_ID = ?
    `,
    [
      input.documentNo,
      input.documentType,
      input.title,
      input.brandId,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.complianceArea,
      input.ownerUserId ?? null,
      input.storageProvider ?? null,
      input.storageDriveId ?? null,
      input.storageItemId ?? null,
      input.storagePath ?? null,
      updatedBy,
      input.sopId,
    ],
  );
}

async function ensureCurrentVersionId(sopId: number, actorId: number): Promise<number> {
  const existingVersionId = await getCurrentVersionId(sopId);

  if (existingVersionId) {
    return existingVersionId;
  }

  const snapshot = await queryFirst<SopParentSnapshotRow>(
    `
      SELECT
        CURRENT_VERSION_ID,
        VERSION_NO,
        STATUS,
        FILE_NAME,
        FILE_URL,
        FILE_SIZE,
        MIME_TYPE,
        SUBMITTED_BY,
        SUBMITTED_AT,
        APPROVED_BY,
        APPROVED_AT,
        APPROVAL_REMARKS,
        ACTIVE_FROM,
        NEXT_REVIEW_DATE,
        REMARKS,
        CREATED_BY,
        UPDATED_BY
      FROM SOPS
      WHERE SOP_ID = ?
    `,
    [sopId],
  );

  if (!snapshot) {
    throw new Error("SOP record was not found.");
  }

  await executeCommand(
    `
      INSERT INTO SOP_VERSIONS (
        SOP_ID,
        VERSION_NO,
        CONTENT_MODE,
        FILE_NAME,
        FILE_URL,
        FILE_SIZE,
        MIME_TYPE,
        STATUS,
        SUBMITTED_BY,
        SUBMITTED_AT,
        APPROVER_USER_ID,
        APPROVED_BY,
        APPROVED_AT,
        DECISION_REMARKS,
        EFFECTIVE_FROM,
        NEXT_REVIEW_DATE,
        REMARKS,
        CREATED_BY,
        UPDATED_BY
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      sopId,
      snapshot.VERSION_NO,
      getContentMode(snapshot.FILE_NAME, snapshot.FILE_URL),
      snapshot.FILE_NAME,
      snapshot.FILE_URL,
      snapshot.FILE_SIZE,
      snapshot.MIME_TYPE,
      snapshot.STATUS,
      snapshot.SUBMITTED_BY,
      snapshot.SUBMITTED_AT,
      snapshot.APPROVED_BY,
      snapshot.APPROVED_BY,
      snapshot.APPROVED_AT,
      snapshot.APPROVAL_REMARKS,
      snapshot.ACTIVE_FROM,
      snapshot.NEXT_REVIEW_DATE,
      snapshot.REMARKS,
      snapshot.UPDATED_BY ?? snapshot.CREATED_BY ?? actorId,
      snapshot.UPDATED_BY,
    ],
  );

  const versionId = await findVersionId(sopId, snapshot.VERSION_NO);

  if (!versionId) {
    throw new Error("Unable to link the current SOP version.");
  }

  await syncCurrentVersionLink(sopId, versionId, snapshot.STATUS);
  return versionId;
}

async function syncEditableVersionFields(input: UpdateSopInput, updatedBy: number): Promise<void> {
  const versionId = await ensureCurrentVersionId(input.sopId, updatedBy);

  await executeCommand(
    `
      UPDATE SOP_VERSIONS
      SET VERSION_NO = ?,
          CONTENT_MODE = ?,
          FILE_NAME = ?,
          FILE_URL = ?,
          FILE_SIZE = ?,
          MIME_TYPE = ?,
          STATUS = ?,
          REMARKS = ?,
          UPDATED_BY = ?,
          UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE SOP_VERSION_ID = ?
    `,
    [
      input.versionNo,
      getContentMode(input.fileName ?? null, input.fileUrl ?? null),
      input.fileName ?? null,
      input.fileUrl ?? null,
      input.fileSize ?? null,
      input.mimeType ?? null,
      input.status,
      input.remarks ?? null,
      updatedBy,
      versionId,
    ],
  );

  await syncCurrentVersionLink(input.sopId, versionId, input.status);
}

async function createVersionFromInput(input: UpdateSopInput, createdBy: number): Promise<number> {
  const existingVersionId = await findVersionId(input.sopId, input.versionNo);

  if (existingVersionId) {
    throw new Error(`SOP version ${input.versionNo} already exists for this record.`);
  }

  await executeCommand(
    `
      INSERT INTO SOP_VERSIONS (
        SOP_ID,
        VERSION_NO,
        CONTENT_MODE,
        FILE_NAME,
        FILE_URL,
        FILE_SIZE,
        MIME_TYPE,
        STATUS,
        REMARKS,
        CREATED_BY
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.sopId,
      input.versionNo,
      getContentMode(input.fileName ?? null, input.fileUrl ?? null),
      input.fileName ?? null,
      input.fileUrl ?? null,
      input.fileSize ?? null,
      input.mimeType ?? null,
      input.status,
      input.remarks ?? null,
      createdBy,
    ],
  );

  const versionId = await findVersionId(input.sopId, input.versionNo);

  if (!versionId) {
    throw new Error("Unable to create the new SOP version.");
  }

  return versionId;
}

async function resetParentWorkflowFields(sopId: number, status: SopRecord["status"], updatedBy: number): Promise<void> {
  await executeCommand(
    `
      UPDATE SOPS
      SET STATUS = ?,
          SUBMITTED_BY = NULL,
          SUBMITTED_AT = NULL,
          APPROVED_BY = NULL,
          APPROVED_AT = NULL,
          APPROVAL_REMARKS = NULL,
          ACTIVE_FROM = NULL,
          UPDATED_BY = ?,
          UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE SOP_ID = ?
    `,
    [status, updatedBy, sopId],
  );
}

async function syncWorkflowVersionFields(input: SopApprovalInput, updatedBy: number): Promise<void> {
  const versionId = await ensureCurrentVersionId(input.sopId, updatedBy);
  const approvalRemarks = input.approvalRemarks ?? null;

  if (input.status === "Submitted") {
    await executeCommand(
      `
        UPDATE SOP_VERSIONS
        SET STATUS = ?,
            SUBMITTED_BY = ?,
            SUBMITTED_AT = CURRENT_TIMESTAMP(),
            UPDATED_BY = ?,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE SOP_VERSION_ID = ?
      `,
      [input.status, updatedBy, updatedBy, versionId],
    );

    await syncCurrentVersionLink(input.sopId, versionId, input.status);
    return;
  }

  if (input.status === "Approved") {
    await executeCommand(
      `
        UPDATE SOP_VERSIONS
        SET STATUS = ?,
            APPROVER_USER_ID = ?,
            APPROVED_BY = ?,
            APPROVED_AT = CURRENT_TIMESTAMP(),
            DECISION_REMARKS = ?,
            REJECTED_BY = NULL,
            REJECTED_AT = NULL,
            UPDATED_BY = ?,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE SOP_VERSION_ID = ?
      `,
      [input.status, updatedBy, updatedBy, approvalRemarks, updatedBy, versionId],
    );

    await syncCurrentVersionLink(input.sopId, versionId, input.status);
    return;
  }

  if (input.status === "Rejected") {
    await executeCommand(
      `
        UPDATE SOP_VERSIONS
        SET STATUS = ?,
            REJECTED_BY = ?,
            REJECTED_AT = CURRENT_TIMESTAMP(),
            DECISION_REMARKS = ?,
            UPDATED_BY = ?,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE SOP_VERSION_ID = ?
      `,
      [input.status, updatedBy, approvalRemarks, updatedBy, versionId],
    );

    await syncCurrentVersionLink(input.sopId, versionId, input.status);
    return;
  }

  if (input.status === "Active") {
    await executeCommand(
      `
        UPDATE SOP_VERSIONS
        SET STATUS = ?,
            EFFECTIVE_FROM = COALESCE(EFFECTIVE_FROM, CURRENT_DATE()),
            UPDATED_BY = ?,
            UPDATED_AT = CURRENT_TIMESTAMP()
        WHERE SOP_VERSION_ID = ?
      `,
      [input.status, updatedBy, versionId],
    );

    await syncCurrentVersionLink(input.sopId, versionId, input.status);
    return;
  }

  await executeCommand(
    `
      UPDATE SOP_VERSIONS
      SET STATUS = ?,
          DECISION_REMARKS = COALESCE(?, DECISION_REMARKS),
          UPDATED_BY = ?,
          UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE SOP_VERSION_ID = ?
    `,
    [input.status, approvalRemarks, updatedBy, versionId],
  );

  await syncCurrentVersionLink(input.sopId, versionId, input.status);
}

function mapSopRow(row: SopRow): SopRecord {
  return {
    sopId: row.SOP_ID,
    documentNo: row.DOCUMENT_NO,
    documentType: row.DOCUMENT_TYPE,
    title: row.TITLE,
    brandId: row.BRAND_ID,
    brandName: row.BRAND_NAME,
    departmentId: row.DEPARTMENT_ID,
    departmentName: row.DEPARTMENT_NAME,
    locationId: row.LOCATION_ID,
    locationName: row.LOCATION_NAME,
    complianceArea: row.COMPLIANCE_AREA,
    ownerUserId: row.OWNER_USER_ID,
    ownerDisplayName: row.OWNER_DISPLAY_NAME,
    versionNo: row.VERSION_NO,
    status: row.STATUS,
    fileName: row.FILE_NAME,
    fileUrl: row.FILE_URL,
    fileSize: row.FILE_SIZE,
    mimeType: row.MIME_TYPE,
    storageProvider: row.STORAGE_PROVIDER,
    storageDriveId: row.STORAGE_DRIVE_ID,
    storageItemId: row.STORAGE_ITEM_ID,
    storagePath: row.STORAGE_PATH,
    submittedBy: row.SUBMITTED_BY,
    submittedAt: row.SUBMITTED_AT,
    approvedBy: row.APPROVED_BY,
    approvedAt: row.APPROVED_AT,
    approvalRemarks: row.APPROVAL_REMARKS,
    activeFrom: row.ACTIVE_FROM,
    nextReviewDate: row.NEXT_REVIEW_DATE,
    remarks: row.REMARKS,
    controlLinkCount: row.CONTROL_LINK_COUNT ?? 0,
  };
}

function mapSopVersionRow(row: SopVersionRow): SopVersionRecord {
  return {
    sopVersionId: row.SOP_VERSION_ID,
    sopId: row.SOP_ID,
    versionNo: row.VERSION_NO,
    status: row.STATUS,
    fileName: row.FILE_NAME,
    submittedAt: row.SUBMITTED_AT,
    approvedAt: row.APPROVED_AT,
    activeFrom: row.ACTIVE_FROM,
    approvalRemarks: row.APPROVAL_REMARKS,
    remarks: row.REMARKS,
    createdAt: row.CREATED_AT,
    isCurrent: row.IS_CURRENT,
  };
}

export async function listSops(): Promise<SopRecord[]> {
  const rows = await queryMany<SopRow>(`
    SELECT
      s.SOP_ID,
      s.DOCUMENT_NO,
      s.DOCUMENT_TYPE,
      s.TITLE,
      s.BRAND_ID,
      b.BRAND_NAME,
      s.DEPARTMENT_ID,
      d.DEPARTMENT_NAME,
      s.LOCATION_ID,
      ${resolvedCurrentVersionSelect}
      COALESCE(v.FILE_NAME, s.FILE_NAME) AS FILE_NAME,
      COALESCE(v.FILE_URL, s.FILE_URL) AS FILE_URL,
      COALESCE(v.FILE_SIZE, s.FILE_SIZE) AS FILE_SIZE,
      COALESCE(v.MIME_TYPE, s.MIME_TYPE) AS MIME_TYPE,
      COALESCE(v.DECISION_REMARKS, s.APPROVAL_REMARKS) AS APPROVAL_REMARKS,
      COALESCE(v.EFFECTIVE_FROM, s.ACTIVE_FROM) AS ACTIVE_FROM,
      COALESCE(v.NEXT_REVIEW_DATE, s.NEXT_REVIEW_DATE) AS NEXT_REVIEW_DATE,
      COALESCE(v.REMARKS, s.REMARKS) AS REMARKS,
      counts.CONTROL_LINK_COUNT
    FROM SOPS s
    LEFT JOIN (
      SELECT ENTITY_ID, COUNT(*) AS CONTROL_LINK_COUNT
      FROM CONTROL_LINKS
      WHERE UPPER(ENTITY_TYPE) IN ('SOP', 'SOPS')
      GROUP BY ENTITY_ID
    ) counts ON counts.ENTITY_ID = s.SOP_ID
    ${sopVersionJoin}
    LEFT JOIN BRANDS b ON b.BRAND_ID = s.BRAND_ID
    LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = s.DEPARTMENT_ID
    LEFT JOIN LOCATIONS l ON l.LOCATION_ID = s.LOCATION_ID
    LEFT JOIN USERS u ON u.USER_ID = s.OWNER_USER_ID
    ORDER BY s.CREATED_AT DESC
  `);

  return rows.map(mapSopRow);
}

export async function getSopById(sopId: number): Promise<SopRecord | null> {
  const row = await queryFirst<SopRow>(
    `
      SELECT
        s.SOP_ID,
        s.DOCUMENT_NO,
        s.DOCUMENT_TYPE,
        s.TITLE,
        s.BRAND_ID,
        b.BRAND_NAME,
        s.DEPARTMENT_ID,
        d.DEPARTMENT_NAME,
        s.LOCATION_ID,
        ${resolvedCurrentVersionSelect}
        COALESCE(v.FILE_NAME, s.FILE_NAME) AS FILE_NAME,
        COALESCE(v.FILE_URL, s.FILE_URL) AS FILE_URL,
        COALESCE(v.FILE_SIZE, s.FILE_SIZE) AS FILE_SIZE,
        COALESCE(v.MIME_TYPE, s.MIME_TYPE) AS MIME_TYPE,
        COALESCE(v.DECISION_REMARKS, s.APPROVAL_REMARKS) AS APPROVAL_REMARKS,
        COALESCE(v.EFFECTIVE_FROM, s.ACTIVE_FROM) AS ACTIVE_FROM,
        COALESCE(v.NEXT_REVIEW_DATE, s.NEXT_REVIEW_DATE) AS NEXT_REVIEW_DATE,
        COALESCE(v.REMARKS, s.REMARKS) AS REMARKS,
        counts.CONTROL_LINK_COUNT
      FROM SOPS s
      LEFT JOIN (
        SELECT ENTITY_ID, COUNT(*) AS CONTROL_LINK_COUNT
        FROM CONTROL_LINKS
        WHERE UPPER(ENTITY_TYPE) IN ('SOP', 'SOPS')
        GROUP BY ENTITY_ID
      ) counts ON counts.ENTITY_ID = s.SOP_ID
      ${sopVersionJoin}
      LEFT JOIN BRANDS b ON b.BRAND_ID = s.BRAND_ID
      LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = s.DEPARTMENT_ID
      LEFT JOIN LOCATIONS l ON l.LOCATION_ID = s.LOCATION_ID
      LEFT JOIN USERS u ON u.USER_ID = s.OWNER_USER_ID
      WHERE s.SOP_ID = ?
    `,
    [sopId],
  );

  return row ? mapSopRow(row) : null;
}

export async function listSopVersions(sopId: number): Promise<SopVersionRecord[]> {
  const rows = await queryMany<SopVersionRow>(
    `
      SELECT
        v.SOP_VERSION_ID,
        v.SOP_ID,
        v.VERSION_NO,
        v.STATUS,
        v.FILE_NAME,
        v.SUBMITTED_AT,
        v.APPROVED_AT,
        v.EFFECTIVE_FROM AS ACTIVE_FROM,
        v.DECISION_REMARKS AS APPROVAL_REMARKS,
        v.REMARKS,
        v.CREATED_AT,
        CASE
          WHEN v.SOP_VERSION_ID = s.CURRENT_VERSION_ID THEN TRUE
          WHEN s.CURRENT_VERSION_ID IS NULL AND v.VERSION_NO = s.VERSION_NO THEN TRUE
          ELSE FALSE
        END AS IS_CURRENT
      FROM SOP_VERSIONS v
      INNER JOIN SOPS s ON s.SOP_ID = v.SOP_ID
      WHERE v.SOP_ID = ?
      ORDER BY
        CASE WHEN v.SOP_VERSION_ID = s.CURRENT_VERSION_ID THEN 0 ELSE 1 END,
        v.CREATED_AT DESC,
        v.SOP_VERSION_ID DESC
    `,
    [sopId],
  );

  return rows.map(mapSopVersionRow);
}

export async function createSop(input: CreateSopInput, createdBy: number): Promise<void> {
  await executeCommand(
    `
      INSERT INTO SOPS (
        DOCUMENT_NO,
        DOCUMENT_TYPE,
        TITLE,
        BRAND_ID,
        DEPARTMENT_ID,
        LOCATION_ID,
        COMPLIANCE_AREA,
        OWNER_USER_ID,
        VERSION_NO,
        STATUS,
        FILE_NAME,
        FILE_URL,
        FILE_SIZE,
        MIME_TYPE,
        STORAGE_PROVIDER,
        STORAGE_DRIVE_ID,
        STORAGE_ITEM_ID,
        STORAGE_PATH,
        REMARKS,
        CREATED_BY
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.documentNo,
      input.documentType,
      input.title,
      input.brandId,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.complianceArea,
      input.ownerUserId ?? null,
      input.versionNo,
      input.status,
      input.fileName ?? null,
      input.fileUrl ?? null,
      input.fileSize ?? null,
      input.mimeType ?? null,
      input.storageProvider ?? null,
      input.storageDriveId ?? null,
      input.storageItemId ?? null,
      input.storagePath ?? null,
      input.remarks ?? null,
      createdBy,
    ],
  );

  const sopRow = await queryFirst<{ SOP_ID: number }>(`SELECT SOP_ID FROM SOPS WHERE DOCUMENT_NO = ?`, [input.documentNo]);

  if (!sopRow) {
    throw new Error("Unable to create the SOP record.");
  }

  await ensureCurrentVersionId(sopRow.SOP_ID, createdBy);
}

export async function updateSop(input: UpdateSopInput, updatedBy: number, options: UpdateSopOptions = {}): Promise<void> {
  await syncParentFields(input, updatedBy);

  if (options.createNewVersion) {
    await resetParentWorkflowFields(input.sopId, input.status, updatedBy);
    const versionId = await createVersionFromInput(input, updatedBy);
    await syncCurrentVersionLink(input.sopId, versionId, input.status);
    return;
  }

  await syncEditableVersionFields(input, updatedBy);
}

export async function updateSopApprovalStatus(input: SopApprovalInput, updatedBy: number): Promise<void> {
  await executeCommand(
    `
      UPDATE SOPS
      SET STATUS = ?,
          UPDATED_BY = ?,
          UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE SOP_ID = ?
    `,
    [input.status, updatedBy, input.sopId],
  );

  await syncWorkflowVersionFields(input, updatedBy);
}
