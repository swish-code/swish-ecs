import { executeCommand, queryFirst, queryMany } from "@/lib/snowflake/query";
import type {
  CreateDocumentInput,
  DocumentRecord,
  DocumentVersionRecord,
  DocumentVersionTransitionInput,
  UpdateDocumentInput,
} from "@/features/evidence/types";

type DocumentRow = {
  DOCUMENT_ID: number;
  DOCUMENT_CODE: string | null;
  DOCUMENT_NAME: string;
  DOCUMENT_TYPE: string;
  CATEGORY: string | null;
  BRAND_ID: number | null;
  BRAND_NAME: string | null;
  DEPARTMENT_ID: number | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_ID: number | null;
  LOCATION_NAME: string | null;
  OWNER_USER_ID: number | null;
  OWNER_DISPLAY_NAME: string | null;
  STATUS: string;
  CURRENT_EVIDENCE_ID: number | null;
  FILE_NAME: string | null;
  FILE_URL: string | null;
  VERSION_NO: string | null;
  VERSION_STATUS: string | null;
  ISSUE_DATE: string | null;
  EXPIRY_DATE: string | null;
  REVIEW_DATE: string | null;
  SOURCE_TYPE: string | null;
  REMARKS: string | null;
  CONTROL_LINK_COUNT: number | null;
};

type CreatedDocumentRow = {
  DOCUMENT_ID: number;
};

type CreatedEvidenceRow = {
  EVIDENCE_ID: number;
};

type EvidenceDocumentLinkRow = {
  DOCUMENT_ID: number | null;
  ENTITY_ID: number | null;
};

type DocumentWorkflowRow = {
  CURRENT_EVIDENCE_ID: number | null;
  STATUS: string;
  VERSION_STATUS: string | null;
};

type DocumentVersionRow = {
  EVIDENCE_ID: number;
  FILE_NAME: string;
  FILE_URL: string;
  FILE_SIZE: number | null;
  MIME_TYPE: string | null;
  VERSION_NO: string | null;
  VERSION_STATUS: string | null;
  STORAGE_PROVIDER: string | null;
  STORAGE_DRIVE_ID: string | null;
  STORAGE_ITEM_ID: string | null;
  STORAGE_PATH: string | null;
  REMARKS: string | null;
  CREATED_BY: number | null;
  CREATED_BY_NAME: string | null;
  CREATED_AT: string;
  APPROVED_BY: number | null;
  APPROVED_BY_NAME: string | null;
  APPROVED_AT: string | null;
  REJECTED_BY: number | null;
  REJECTED_BY_NAME: string | null;
  REJECTED_AT: string | null;
  IS_CURRENT: boolean;
};

function mapDocumentRow(row: DocumentRow): DocumentRecord {
  return {
    documentId: row.DOCUMENT_ID,
    documentCode: row.DOCUMENT_CODE,
    documentName: row.DOCUMENT_NAME,
    documentType: row.DOCUMENT_TYPE,
    category: row.CATEGORY,
    brandId: row.BRAND_ID,
    brandName: row.BRAND_NAME,
    departmentId: row.DEPARTMENT_ID,
    departmentName: row.DEPARTMENT_NAME,
    locationId: row.LOCATION_ID,
    locationName: row.LOCATION_NAME,
    ownerUserId: row.OWNER_USER_ID,
    ownerDisplayName: row.OWNER_DISPLAY_NAME,
    status: row.STATUS,
    currentEvidenceId: row.CURRENT_EVIDENCE_ID,
    fileName: row.FILE_NAME,
    fileUrl: row.FILE_URL,
    versionNo: row.VERSION_NO,
    versionStatus: row.VERSION_STATUS,
    issueDate: row.ISSUE_DATE,
    expiryDate: row.EXPIRY_DATE,
    reviewDate: row.REVIEW_DATE,
    sourceType: row.SOURCE_TYPE,
    remarks: row.REMARKS,
    controlLinkCount: row.CONTROL_LINK_COUNT ?? 0,
  };
}

function mapDocumentVersionRow(row: DocumentVersionRow): DocumentVersionRecord {
  return {
    evidenceId: row.EVIDENCE_ID,
    fileName: row.FILE_NAME,
    fileUrl: row.FILE_URL,
    fileSize: row.FILE_SIZE,
    mimeType: row.MIME_TYPE,
    versionNo: row.VERSION_NO,
    versionStatus: row.VERSION_STATUS,
    storageProvider: row.STORAGE_PROVIDER,
    storageDriveId: row.STORAGE_DRIVE_ID,
    storageItemId: row.STORAGE_ITEM_ID,
    storagePath: row.STORAGE_PATH,
    remarks: row.REMARKS,
    createdBy: row.CREATED_BY,
    createdByName: row.CREATED_BY_NAME,
    createdAt: row.CREATED_AT,
    approvedBy: row.APPROVED_BY,
    approvedByName: row.APPROVED_BY_NAME,
    approvedAt: row.APPROVED_AT,
    rejectedBy: row.REJECTED_BY,
    rejectedByName: row.REJECTED_BY_NAME,
    rejectedAt: row.REJECTED_AT,
    isCurrent: row.IS_CURRENT,
  };
}

function mapParentDocumentStatus(versionStatus: DocumentVersionTransitionInput["status"]): string {
  switch (versionStatus) {
    case "Pending Review":
      return "In Review";
    case "Approved":
    case "Ready For Audit":
      return "Approved";
    case "Flagged":
      return "Flagged";
    case "Rejected":
      return "Draft";
  }
}

const documentBaseSelect = `
  SELECT
    d.DOCUMENT_ID,
    d.DOCUMENT_CODE,
    d.DOCUMENT_NAME,
    d.DOCUMENT_TYPE,
    d.CATEGORY,
    d.BRAND_ID,
    b.BRAND_NAME,
    d.DEPARTMENT_ID,
    dept.DEPARTMENT_NAME,
    d.LOCATION_ID,
    l.LOCATION_NAME,
    d.OWNER_USER_ID,
    u.DISPLAY_NAME AS OWNER_DISPLAY_NAME,
    d.STATUS,
    d.CURRENT_EVIDENCE_ID,
    e.FILE_NAME,
    e.FILE_URL,
    e.VERSION_NO,
    e.VERSION_STATUS,
    d.ISSUE_DATE,
    d.EXPIRY_DATE,
    d.REVIEW_DATE,
    d.SOURCE_TYPE,
    d.REMARKS,
    counts.CONTROL_LINK_COUNT
  FROM DOCUMENTS d
  LEFT JOIN (
    SELECT ENTITY_ID, COUNT(*) AS CONTROL_LINK_COUNT
    FROM CONTROL_LINKS
    WHERE UPPER(ENTITY_TYPE) IN ('DOCUMENT', 'DOCUMENTS')
    GROUP BY ENTITY_ID
  ) counts ON counts.ENTITY_ID = d.DOCUMENT_ID
  LEFT JOIN EVIDENCE_FILES e ON e.EVIDENCE_ID = d.CURRENT_EVIDENCE_ID
  LEFT JOIN BRANDS b ON b.BRAND_ID = d.BRAND_ID
  LEFT JOIN DEPARTMENTS dept ON dept.DEPARTMENT_ID = d.DEPARTMENT_ID
  LEFT JOIN LOCATIONS l ON l.LOCATION_ID = d.LOCATION_ID
  LEFT JOIN USERS u ON u.USER_ID = d.OWNER_USER_ID
`;

export async function listDocuments(): Promise<DocumentRecord[]> {
  const rows = await queryMany<DocumentRow>(`
    ${documentBaseSelect}
    ORDER BY d.UPDATED_AT DESC NULLS LAST, d.CREATED_AT DESC, d.DOCUMENT_ID DESC
  `);

  return rows.map(mapDocumentRow);
}

export async function getDocumentById(documentId: number): Promise<DocumentRecord | null> {
  const rows = await queryMany<DocumentRow>(`
    ${documentBaseSelect}
    WHERE d.DOCUMENT_ID = ?
    LIMIT 1
  `, [documentId]);

  return rows[0] ? mapDocumentRow(rows[0]) : null;
}

export async function listDocumentVersions(documentId: number): Promise<DocumentVersionRecord[]> {
  const rows = await queryMany<DocumentVersionRow>(
    `
      SELECT
        e.EVIDENCE_ID,
        e.FILE_NAME,
        e.FILE_URL,
        e.FILE_SIZE,
        e.MIME_TYPE,
        e.VERSION_NO,
        e.VERSION_STATUS,
        e.STORAGE_PROVIDER,
        e.STORAGE_DRIVE_ID,
        e.STORAGE_ITEM_ID,
        e.STORAGE_PATH,
        e.REMARKS,
        e.CREATED_BY,
        created_user.DISPLAY_NAME AS CREATED_BY_NAME,
        e.CREATED_AT,
        e.APPROVED_BY,
        approved_user.DISPLAY_NAME AS APPROVED_BY_NAME,
        e.APPROVED_AT,
        e.REJECTED_BY,
        rejected_user.DISPLAY_NAME AS REJECTED_BY_NAME,
        e.REJECTED_AT,
        IFF(d.CURRENT_EVIDENCE_ID = e.EVIDENCE_ID OR COALESCE(e.IS_CURRENT, FALSE), TRUE, FALSE) AS IS_CURRENT
      FROM EVIDENCE_FILES e
      INNER JOIN DOCUMENTS d ON d.DOCUMENT_ID = e.DOCUMENT_ID
      LEFT JOIN USERS created_user ON created_user.USER_ID = e.CREATED_BY
      LEFT JOIN USERS approved_user ON approved_user.USER_ID = e.APPROVED_BY
      LEFT JOIN USERS rejected_user ON rejected_user.USER_ID = e.REJECTED_BY
      WHERE e.DOCUMENT_ID = ?
      ORDER BY
        IFF(d.CURRENT_EVIDENCE_ID = e.EVIDENCE_ID OR COALESCE(e.IS_CURRENT, FALSE), 0, 1),
        e.CREATED_AT DESC,
        e.EVIDENCE_ID DESC
    `,
    [documentId],
  );

  return rows.map(mapDocumentVersionRow);
}

async function resolveDocumentLinkEntity(documentId: number): Promise<{ entityType: string; entityId: number } | null> {
  const row = await queryFirst<EvidenceDocumentLinkRow & { CATEGORY: string | null }>(
    `
      SELECT
        COALESCE(
          (
            SELECT legacy.ENTITY_ID
            FROM EVIDENCE_FILES legacy
            WHERE legacy.DOCUMENT_ID = d.DOCUMENT_ID
              AND legacy.ENTITY_ID IS NOT NULL
              AND UPPER(COALESCE(legacy.ENTITY_TYPE, '')) <> 'DOCUMENT'
            ORDER BY COALESCE(legacy.IS_CURRENT, FALSE) DESC, legacy.CREATED_AT DESC, legacy.EVIDENCE_ID DESC
            LIMIT 1
          ),
          d.DOCUMENT_ID
        ) AS ENTITY_ID,
        COALESCE(
          (
            SELECT legacy.ENTITY_TYPE
            FROM EVIDENCE_FILES legacy
            WHERE legacy.DOCUMENT_ID = d.DOCUMENT_ID
              AND legacy.ENTITY_ID IS NOT NULL
              AND UPPER(COALESCE(legacy.ENTITY_TYPE, '')) <> 'DOCUMENT'
            ORDER BY COALESCE(legacy.IS_CURRENT, FALSE) DESC, legacy.CREATED_AT DESC, legacy.EVIDENCE_ID DESC
            LIMIT 1
          ),
          'DOCUMENT'
        ) AS CATEGORY,
        d.DOCUMENT_ID
      FROM DOCUMENTS d
      WHERE d.DOCUMENT_ID = ?
    `,
    [documentId],
  );

  if (!row?.DOCUMENT_ID) {
    return null;
  }

  return {
    entityType: row.CATEGORY ?? "DOCUMENT",
    entityId: Number(row.ENTITY_ID),
  };
}

async function linkCurrentEvidence(documentId: number, evidenceId: number, updatedBy: number, previousEvidenceId?: number | null): Promise<void> {
  if (previousEvidenceId) {
    await executeCommand(
      `
        UPDATE EVIDENCE_FILES
        SET IS_CURRENT = FALSE
        WHERE EVIDENCE_ID = ?
      `,
      [previousEvidenceId],
    );
  }

  await executeCommand(
    `
      UPDATE EVIDENCE_FILES
      SET DOCUMENT_ID = ?,
          IS_CURRENT = TRUE,
          ISSUE_DATE = COALESCE(ISSUE_DATE, (SELECT ISSUE_DATE FROM DOCUMENTS WHERE DOCUMENT_ID = ?)),
          REVIEW_DATE = COALESCE(REVIEW_DATE, (SELECT REVIEW_DATE FROM DOCUMENTS WHERE DOCUMENT_ID = ?)),
          EXPIRY_DATE = COALESCE(EXPIRY_DATE, (SELECT EXPIRY_DATE FROM DOCUMENTS WHERE DOCUMENT_ID = ?))
      WHERE EVIDENCE_ID = ?
    `,
    [documentId, documentId, documentId, documentId, evidenceId],
  );

  await executeCommand(
    `
      UPDATE EVIDENCE_FILES
      SET IS_CURRENT = FALSE,
          DOCUMENT_ID = ?
      WHERE DOCUMENT_ID = ?
        AND EVIDENCE_ID <> ?
        AND COALESCE(IS_CURRENT, FALSE) = TRUE
    `,
    [documentId, documentId, evidenceId],
  );

  await executeCommand(
    `
      UPDATE DOCUMENTS
      SET CURRENT_EVIDENCE_ID = ?, UPDATED_BY = ?, UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE DOCUMENT_ID = ?
    `,
    [evidenceId, updatedBy, documentId],
  );
}

export async function createDocument(input: CreateDocumentInput, createdBy: number): Promise<void> {
  await executeCommand(
    `
      INSERT INTO DOCUMENTS (
        DOCUMENT_CODE,
        DOCUMENT_NAME,
        DOCUMENT_TYPE,
        CATEGORY,
        BRAND_ID,
        DEPARTMENT_ID,
        LOCATION_ID,
        OWNER_USER_ID,
        STATUS,
        ISSUE_DATE,
        EXPIRY_DATE,
        REVIEW_DATE,
        SOURCE_TYPE,
        REMARKS,
        CREATED_BY
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.documentCode ?? null,
      input.documentName,
      input.documentType,
      input.category ?? null,
      input.brandId ?? null,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.ownerUserId ?? null,
      input.status,
      input.issueDate ?? null,
      input.expiryDate ?? null,
      input.reviewDate ?? null,
      input.sourceType ?? null,
      input.remarks ?? null,
      createdBy,
    ],
  );

  if (!input.fileName || !input.fileUrl) {
    return;
  }

  const createdDocument = await queryFirst<CreatedDocumentRow>(
    `
      SELECT DOCUMENT_ID
      FROM DOCUMENTS
      WHERE DOCUMENT_NAME = ?
        AND COALESCE(DOCUMENT_CODE, '') = COALESCE(?, '')
        AND CREATED_BY = ?
      ORDER BY DOCUMENT_ID DESC
      LIMIT 1
    `,
    [input.documentName, input.documentCode ?? null, createdBy],
  );

  if (!createdDocument) {
    throw new Error("The document record was created but could not be reloaded for file linkage.");
  }

  const linkEntity = await resolveDocumentLinkEntity(createdDocument.DOCUMENT_ID);

  await executeCommand(
    `
      INSERT INTO EVIDENCE_FILES (
        DOCUMENT_ID,
        ENTITY_TYPE,
        ENTITY_ID,
        FILE_NAME,
        FILE_URL,
        FILE_SIZE,
        MIME_TYPE,
        VERSION_NO,
        VERSION_STATUS,
        STORAGE_PROVIDER,
        STORAGE_DRIVE_ID,
        STORAGE_ITEM_ID,
        STORAGE_PATH,
        REMARKS,
        IS_CURRENT,
        ISSUE_DATE,
        REVIEW_DATE,
        EXPIRY_DATE,
        CREATED_BY
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      createdDocument.DOCUMENT_ID,
      linkEntity?.entityType ?? "DOCUMENT",
      linkEntity?.entityId ?? createdDocument.DOCUMENT_ID,
      input.fileName,
      input.fileUrl,
      input.fileSize ?? null,
      input.mimeType ?? null,
      input.versionNo ?? null,
      input.versionStatus ?? null,
      input.storageProvider ?? null,
      input.storageDriveId ?? null,
      input.storageItemId ?? null,
      input.storagePath ?? null,
      input.remarks ?? null,
      true,
      input.issueDate ?? null,
      input.reviewDate ?? null,
      input.expiryDate ?? null,
      createdBy,
    ],
  );

  const createdEvidence = await queryFirst<CreatedEvidenceRow>(
    `
      SELECT EVIDENCE_ID
      FROM EVIDENCE_FILES
      WHERE DOCUMENT_ID = ?
        AND FILE_NAME = ?
        AND CREATED_BY = ?
      ORDER BY EVIDENCE_ID DESC
      LIMIT 1
    `,
    [createdDocument.DOCUMENT_ID, input.fileName, createdBy],
  );

  if (!createdEvidence) {
    throw new Error("The initial governed file was created but could not be linked back to the document.");
  }

  await linkCurrentEvidence(createdDocument.DOCUMENT_ID, createdEvidence.EVIDENCE_ID, createdBy);
}

export async function updateDocument(input: UpdateDocumentInput, updatedBy: number, currentEvidenceId?: number | null): Promise<void> {
  await executeCommand(
    `
      UPDATE DOCUMENTS
      SET
        DOCUMENT_CODE = ?,
        DOCUMENT_NAME = ?,
        DOCUMENT_TYPE = ?,
        CATEGORY = ?,
        BRAND_ID = ?,
        DEPARTMENT_ID = ?,
        LOCATION_ID = ?,
        OWNER_USER_ID = ?,
        STATUS = ?,
        ISSUE_DATE = ?,
        EXPIRY_DATE = ?,
        REVIEW_DATE = ?,
        SOURCE_TYPE = ?,
        REMARKS = ?,
        UPDATED_BY = ?,
        UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE DOCUMENT_ID = ?
    `,
    [
      input.documentCode ?? null,
      input.documentName,
      input.documentType,
      input.category ?? null,
      input.brandId ?? null,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.ownerUserId ?? null,
      input.status,
      input.issueDate ?? null,
      input.expiryDate ?? null,
      input.reviewDate ?? null,
      input.sourceType ?? null,
      input.remarks ?? null,
      updatedBy,
      input.documentId,
    ],
  );

  if (!input.fileName || !input.fileUrl) {
    return;
  }

  const linkEntity = await resolveDocumentLinkEntity(input.documentId);

  await executeCommand(
    `
      INSERT INTO EVIDENCE_FILES (
        DOCUMENT_ID,
        ENTITY_TYPE,
        ENTITY_ID,
        FILE_NAME,
        FILE_URL,
        FILE_SIZE,
        MIME_TYPE,
        VERSION_NO,
        VERSION_STATUS,
        STORAGE_PROVIDER,
        STORAGE_DRIVE_ID,
        STORAGE_ITEM_ID,
        STORAGE_PATH,
        REMARKS,
        IS_CURRENT,
        ISSUE_DATE,
        REVIEW_DATE,
        EXPIRY_DATE,
        CREATED_BY
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.documentId,
      linkEntity?.entityType ?? "DOCUMENT",
      linkEntity?.entityId ?? input.documentId,
      input.fileName,
      input.fileUrl,
      input.fileSize ?? null,
      input.mimeType ?? null,
      input.versionNo ?? null,
      input.versionStatus ?? null,
      input.storageProvider ?? null,
      input.storageDriveId ?? null,
      input.storageItemId ?? null,
      input.storagePath ?? null,
      input.remarks ?? null,
      true,
      input.issueDate ?? null,
      input.reviewDate ?? null,
      input.expiryDate ?? null,
      updatedBy,
    ],
  );

  const createdEvidence = await queryFirst<CreatedEvidenceRow>(
    `
      SELECT EVIDENCE_ID
      FROM EVIDENCE_FILES
      WHERE DOCUMENT_ID = ?
        AND FILE_NAME = ?
        AND CREATED_BY = ?
      ORDER BY EVIDENCE_ID DESC
      LIMIT 1
    `,
    [input.documentId, input.fileName, updatedBy],
  );

  if (!createdEvidence) {
    throw new Error("The new governed file was created but could not be linked back to the document.");
  }

  await linkCurrentEvidence(input.documentId, createdEvidence.EVIDENCE_ID, updatedBy, currentEvidenceId);
}

export async function transitionCurrentDocumentVersion(input: DocumentVersionTransitionInput, updatedBy: number): Promise<void> {
  const workflow = await queryFirst<DocumentWorkflowRow>(
    `
      SELECT
        d.CURRENT_EVIDENCE_ID,
        d.STATUS,
        e.VERSION_STATUS
      FROM DOCUMENTS d
      LEFT JOIN EVIDENCE_FILES e ON e.EVIDENCE_ID = d.CURRENT_EVIDENCE_ID
      WHERE d.DOCUMENT_ID = ?
    `,
    [input.documentId],
  );

  if (!workflow?.CURRENT_EVIDENCE_ID) {
    throw new Error("A current governed file is required before this document can move through review.");
  }

  if (input.status === "Approved") {
    await executeCommand(
      `
        UPDATE EVIDENCE_FILES
        SET VERSION_STATUS = ?,
            APPROVED_BY = ?,
            APPROVED_AT = CURRENT_TIMESTAMP(),
            REJECTED_BY = NULL,
            REJECTED_AT = NULL
        WHERE EVIDENCE_ID = ?
      `,
      [input.status, updatedBy, workflow.CURRENT_EVIDENCE_ID],
    );
  } else if (input.status === "Rejected") {
    await executeCommand(
      `
        UPDATE EVIDENCE_FILES
        SET VERSION_STATUS = ?,
            REJECTED_BY = ?,
            REJECTED_AT = CURRENT_TIMESTAMP()
        WHERE EVIDENCE_ID = ?
      `,
      [input.status, updatedBy, workflow.CURRENT_EVIDENCE_ID],
    );
  } else {
    await executeCommand(
      `
        UPDATE EVIDENCE_FILES
        SET VERSION_STATUS = ?,
            REJECTED_BY = NULL,
            REJECTED_AT = NULL
        WHERE EVIDENCE_ID = ?
      `,
      [input.status, workflow.CURRENT_EVIDENCE_ID],
    );
  }

  await executeCommand(
    `
      UPDATE DOCUMENTS
      SET STATUS = ?,
          UPDATED_BY = ?,
          UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE DOCUMENT_ID = ?
    `,
    [mapParentDocumentStatus(input.status), updatedBy, input.documentId],
  );
}