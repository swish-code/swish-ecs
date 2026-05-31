# Snowflake Phase 1 Backfill Priority

This is the next step after creating the new Phase 1 tables.

The tables are only the structure. The immediate priority is to move current MVP records into the new shared model so the app can evolve without losing continuity.

Canonical repo artifacts:

- DDL: `src/sql/033_phase_1_lean_extension.sql`
- Backfill: `src/sql/034_phase_1_backfill.sql`
- Dry run any SQL file: `npm run snowflake:sql -- <path-to-sql>`
- Apply Phase 1 DDL: `npm run snowflake:phase1:ddl`
- Apply Phase 1 backfill: `npm run snowflake:phase1:backfill`

## Priority Order

### Priority 1: Backfill SOP parent-version structure

Run this first.

Why it is first:

- the current app already depends on `SOPS`
- `SOP_VERSIONS` is the most important compatibility layer added by the new schema
- `CURRENT_VERSION_ID` must be populated before the SOP service can move to parent/version reads safely

Deliverables:

- one `SOP_VERSIONS` row per current `SOPS` row
- `SOPS.CURRENT_VERSION_ID` populated
- `SOPS.RECORD_STATUS` normalized

### Priority 2: Backfill governed documents from current evidence

Run this second.

Why it is second:

- `DOCUMENTS` becomes the parent record above raw file metadata
- existing `EVIDENCE_FILES` need a stable `DOCUMENT_ID`
- later document workflows, checks, and control links depend on this identity layer

Deliverables:

- one conservative `DOCUMENTS` parent per current evidence file
- `EVIDENCE_FILES.DOCUMENT_ID` populated
- `EVIDENCE_FILES.VERSION_*` metadata initialized

### Priority 3: Seed programs and controls deliberately

Do this after product and compliance owners agree the first real operating model.

Why it is not automatic:

- program names, scope, ownership, and target dates are business decisions
- controls should not be auto-generated from noisy historical text fields
- bad seed data here creates more cleanup than value

### Priority 4: Start application refactor in this order

After the backfill is complete, the app build order should be:

1. move SOP services to parent/version reads
2. add `documents` service and list/detail screens
3. introduce `controls` as the shared hub
4. introduce `checks` and `check_results`
5. align audits to `findings`
6. move generic work queues onto `tasks`

## Paste-Ready Snowflake SQL

This script is written to be rerunnable and conservative.

It intentionally does not infer programs, controls, or findings from historical text because those mappings need business review.

```sql
-- SWiSH Phase 1 Backfill Script
-- Run this after the lean Phase 1 DDL has already been applied.

-- Example context:
-- USE DATABASE ECS_DB;
-- USE SCHEMA ECS_MVP;

/* =========================================================
   1. BACKFILL SOP_VERSIONS FROM EXISTING SOPS
   ========================================================= */

MERGE INTO SOP_VERSIONS AS target
USING (
  SELECT
    s.SOP_ID,
    s.VERSION_NO,
    CASE
      WHEN COALESCE(s.FILE_URL, s.FILE_NAME) IS NOT NULL THEN 'FILE'
      ELSE 'TEXT'
    END AS CONTENT_MODE,
    CAST(NULL AS VARCHAR) AS CONTENT_BODY,
    s.FILE_NAME,
    s.FILE_URL,
    s.FILE_SIZE,
    s.MIME_TYPE,
    s.STATUS,
    'MAJOR' AS CHANGE_TYPE,
    s.SUBMITTED_BY,
    s.SUBMITTED_AT,
    s.APPROVED_BY AS APPROVER_USER_ID,
    s.APPROVED_BY,
    s.APPROVED_AT,
    CAST(NULL AS NUMBER(38,0)) AS REJECTED_BY,
    CAST(NULL AS TIMESTAMP_TZ) AS REJECTED_AT,
    s.APPROVAL_REMARKS AS DECISION_REMARKS,
    s.ACTIVE_FROM AS EFFECTIVE_FROM,
    s.NEXT_REVIEW_DATE,
    FALSE AS ACK_REQUIRED,
    CAST(NULL AS VARCHAR(30)) AS ACK_SCOPE_TYPE,
    s.REMARKS,
    s.CREATED_BY,
    s.CREATED_AT,
    s.UPDATED_BY,
    s.UPDATED_AT
  FROM SOPS s
) AS source
ON target.SOP_ID = source.SOP_ID
AND target.VERSION_NO = source.VERSION_NO
WHEN NOT MATCHED THEN INSERT (
  SOP_ID,
  VERSION_NO,
  CONTENT_MODE,
  CONTENT_BODY,
  FILE_NAME,
  FILE_URL,
  FILE_SIZE,
  MIME_TYPE,
  STATUS,
  CHANGE_TYPE,
  SUBMITTED_BY,
  SUBMITTED_AT,
  APPROVER_USER_ID,
  APPROVED_BY,
  APPROVED_AT,
  REJECTED_BY,
  REJECTED_AT,
  DECISION_REMARKS,
  EFFECTIVE_FROM,
  NEXT_REVIEW_DATE,
  ACK_REQUIRED,
  ACK_SCOPE_TYPE,
  REMARKS,
  CREATED_BY,
  CREATED_AT,
  UPDATED_BY,
  UPDATED_AT
) VALUES (
  source.SOP_ID,
  source.VERSION_NO,
  source.CONTENT_MODE,
  source.CONTENT_BODY,
  source.FILE_NAME,
  source.FILE_URL,
  source.FILE_SIZE,
  source.MIME_TYPE,
  source.STATUS,
  source.CHANGE_TYPE,
  source.SUBMITTED_BY,
  source.SUBMITTED_AT,
  source.APPROVER_USER_ID,
  source.APPROVED_BY,
  source.APPROVED_AT,
  source.REJECTED_BY,
  source.REJECTED_AT,
  source.DECISION_REMARKS,
  source.EFFECTIVE_FROM,
  source.NEXT_REVIEW_DATE,
  source.ACK_REQUIRED,
  source.ACK_SCOPE_TYPE,
  source.REMARKS,
  source.CREATED_BY,
  source.CREATED_AT,
  source.UPDATED_BY,
  source.UPDATED_AT
);

UPDATE SOPS AS s
SET
  CURRENT_VERSION_ID = v.SOP_VERSION_ID,
  RECORD_STATUS = CASE
    WHEN UPPER(s.STATUS) IN ('ACTIVE', 'APPROVED') THEN 'ACTIVE'
    WHEN UPPER(s.STATUS) IN ('ARCHIVED', 'OBSOLETE') THEN 'ARCHIVED'
    ELSE 'OPEN'
  END
FROM SOP_VERSIONS AS v
WHERE v.SOP_ID = s.SOP_ID
  AND v.VERSION_NO = s.VERSION_NO
  AND (
    s.CURRENT_VERSION_ID IS NULL
    OR s.CURRENT_VERSION_ID <> v.SOP_VERSION_ID
    OR s.RECORD_STATUS IS NULL
  );

/* =========================================================
   2. BACKFILL DOCUMENTS FROM EXISTING EVIDENCE_FILES
   Conservative rule: one parent document per current evidence file.
   ========================================================= */

MERGE INTO DOCUMENTS AS target
USING (
  SELECT
    e.EVIDENCE_ID,
    CONCAT('DOC-', LPAD(TO_VARCHAR(e.EVIDENCE_ID), 6, '0')) AS DOCUMENT_CODE,
    e.FILE_NAME AS DOCUMENT_NAME,
    CASE
      WHEN UPPER(e.ENTITY_TYPE) = 'SOP' THEN 'SOP_ATTACHMENT'
      WHEN UPPER(e.ENTITY_TYPE) IN ('AUDIT', 'AUDITS') THEN 'AUDIT_EVIDENCE'
      WHEN UPPER(e.ENTITY_TYPE) IN ('CAPA', 'CORRECTIVE_ACTION', 'CORRECTIVE_ACTIONS') THEN 'CAPA_EVIDENCE'
      WHEN UPPER(e.ENTITY_TYPE) IN ('ASSIGNMENT', 'ASSIGNMENTS') THEN 'IMPLEMENTATION_EVIDENCE'
      ELSE 'EVIDENCE'
    END AS DOCUMENT_TYPE,
    e.ENTITY_TYPE AS CATEGORY,
    CASE
      WHEN UPPER(e.ENTITY_TYPE) = 'SOP' THEN s.BRAND_ID
      WHEN UPPER(e.ENTITY_TYPE) IN ('AUDIT', 'AUDITS') THEN a.BRAND_ID
      WHEN UPPER(e.ENTITY_TYPE) IN ('CAPA', 'CORRECTIVE_ACTION', 'CORRECTIVE_ACTIONS') THEN ca.BRAND_ID
      WHEN UPPER(e.ENTITY_TYPE) IN ('ASSIGNMENT', 'ASSIGNMENTS') THEN sa.BRAND_ID
      ELSE NULL
    END AS BRAND_ID,
    CASE
      WHEN UPPER(e.ENTITY_TYPE) = 'SOP' THEN s.DEPARTMENT_ID
      WHEN UPPER(e.ENTITY_TYPE) IN ('AUDIT', 'AUDITS') THEN a.DEPARTMENT_ID
      WHEN UPPER(e.ENTITY_TYPE) IN ('CAPA', 'CORRECTIVE_ACTION', 'CORRECTIVE_ACTIONS') THEN ca.DEPARTMENT_ID
      WHEN UPPER(e.ENTITY_TYPE) IN ('ASSIGNMENT', 'ASSIGNMENTS') THEN sa.DEPARTMENT_ID
      ELSE NULL
    END AS DEPARTMENT_ID,
    CAST(NULL AS NUMBER(38,0)) AS LOCATION_ID,
    CAST(NULL AS NUMBER(38,0)) AS OWNER_USER_ID,
    'ACTIVE' AS STATUS,
    e.EVIDENCE_ID AS CURRENT_EVIDENCE_ID,
    TO_DATE(e.CREATED_AT) AS ISSUE_DATE,
    CAST(NULL AS DATE) AS EXPIRY_DATE,
    CAST(NULL AS DATE) AS REVIEW_DATE,
    'BACKFILL' AS SOURCE_TYPE,
    e.REMARKS,
    e.CREATED_BY,
    e.CREATED_AT,
    CAST(NULL AS NUMBER(38,0)) AS UPDATED_BY,
    CAST(NULL AS TIMESTAMP_TZ) AS UPDATED_AT
  FROM EVIDENCE_FILES e
  LEFT JOIN SOPS s
    ON UPPER(e.ENTITY_TYPE) = 'SOP'
   AND s.SOP_ID = e.ENTITY_ID
  LEFT JOIN AUDITS a
    ON UPPER(e.ENTITY_TYPE) IN ('AUDIT', 'AUDITS')
   AND a.AUDIT_ID = e.ENTITY_ID
  LEFT JOIN CORRECTIVE_ACTIONS ca
    ON UPPER(e.ENTITY_TYPE) IN ('CAPA', 'CORRECTIVE_ACTION', 'CORRECTIVE_ACTIONS')
   AND ca.ACTION_ID = e.ENTITY_ID
  LEFT JOIN SOP_ASSIGNMENTS sa
    ON UPPER(e.ENTITY_TYPE) IN ('ASSIGNMENT', 'ASSIGNMENTS')
   AND sa.ASSIGNMENT_ID = e.ENTITY_ID
) AS source
ON target.CURRENT_EVIDENCE_ID = source.EVIDENCE_ID
WHEN NOT MATCHED THEN INSERT (
  DOCUMENT_CODE,
  DOCUMENT_NAME,
  DOCUMENT_TYPE,
  CATEGORY,
  BRAND_ID,
  DEPARTMENT_ID,
  LOCATION_ID,
  OWNER_USER_ID,
  STATUS,
  CURRENT_EVIDENCE_ID,
  ISSUE_DATE,
  EXPIRY_DATE,
  REVIEW_DATE,
  SOURCE_TYPE,
  REMARKS,
  CREATED_BY,
  CREATED_AT,
  UPDATED_BY,
  UPDATED_AT
) VALUES (
  source.DOCUMENT_CODE,
  source.DOCUMENT_NAME,
  source.DOCUMENT_TYPE,
  source.CATEGORY,
  source.BRAND_ID,
  source.DEPARTMENT_ID,
  source.LOCATION_ID,
  source.OWNER_USER_ID,
  source.STATUS,
  source.CURRENT_EVIDENCE_ID,
  source.ISSUE_DATE,
  source.EXPIRY_DATE,
  source.REVIEW_DATE,
  source.SOURCE_TYPE,
  source.REMARKS,
  source.CREATED_BY,
  source.CREATED_AT,
  source.UPDATED_BY,
  source.UPDATED_AT
);

UPDATE EVIDENCE_FILES AS e
SET
  DOCUMENT_ID = d.DOCUMENT_ID,
  VERSION_NO = COALESCE(e.VERSION_NO, '1.0'),
  VERSION_STATUS = COALESCE(e.VERSION_STATUS, 'CURRENT'),
  IS_CURRENT = TRUE,
  ISSUE_DATE = COALESCE(e.ISSUE_DATE, TO_DATE(e.CREATED_AT))
FROM DOCUMENTS AS d
WHERE d.CURRENT_EVIDENCE_ID = e.EVIDENCE_ID
  AND (
    e.DOCUMENT_ID IS NULL
    OR e.DOCUMENT_ID <> d.DOCUMENT_ID
    OR e.VERSION_NO IS NULL
    OR e.VERSION_STATUS IS NULL
    OR e.IS_CURRENT IS NULL
    OR e.ISSUE_DATE IS NULL
  );

/* =========================================================
   3. VALIDATION QUERIES
   ========================================================= */

SELECT 'SOPS missing CURRENT_VERSION_ID' AS CHECK_NAME, COUNT(*) AS ROW_COUNT
FROM SOPS
WHERE CURRENT_VERSION_ID IS NULL

UNION ALL

SELECT 'SOP_VERSIONS row count', COUNT(*)
FROM SOP_VERSIONS

UNION ALL

SELECT 'EVIDENCE_FILES missing DOCUMENT_ID', COUNT(*)
FROM EVIDENCE_FILES
WHERE DOCUMENT_ID IS NULL

UNION ALL

SELECT 'DOCUMENTS row count', COUNT(*)
FROM DOCUMENTS;
```

## What To Do Immediately After This Runs

1. switch the SOP read service to prefer `SOPS + SOP_VERSIONS`
2. add a documents repository/service using `DOCUMENTS` as the parent record
3. do not backfill `CONTROLS` automatically yet
4. do not infer historical `FINDINGS` until audit-response mapping rules are approved

## Recommended Next Build Ticket

After this database backfill is complete, the highest-value app task is:

`refactor SOP services and detail pages to read/write parent + current version instead of treating SOPS as a single mutable record`

That gives you the safest first Phase 1 app upgrade because it builds directly on real migrated data, not empty new modules.