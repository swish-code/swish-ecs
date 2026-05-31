# Snowflake SQL (MVP)

## Files
- `001_schema_mvp.sql` — lean MVP tables for the pilot
- `010_views_mvp.sql` — reporting views for dashboard + exports
- `020_seed_reference_data.sql` — starter roles and brand master data
- `021_seed_departments.sql` — starter department master data
- `022_seed_locations.sql` — starter location master data
- `023_seed_brand_locations.sql` — brand and location mapping data
- `030_enterprise_location_extension.sql` — enterprise scope extension for location support
- `031_document_security_extension.sql` — SharePoint-oriented document security extension
- `032_user_scope_mappings.sql` — multi-scope user access foundation
- `033_phase_1_lean_extension.sql` — Phase 1 shared compliance tables and compatibility columns
- `034_phase_1_backfill.sql` — rerunnable Phase 1 SOP/document backfill and validation queries

## Notes
- The current scripts target `SWISH_DOCUMENTS.ECS_MVP` directly.
- The base MVP schema starts with `brand + department`, and the enterprise extension adds location-level support.
- Constraints in Snowflake are informational; enforce critical rules in application logic.
- Store timestamps as `TIMESTAMP_TZ`.
- Use `DATE` for due dates/target dates/reporting month.
- Use `npm run snowflake:sql -- <path-to-sql>` for a dry run that shows parsed statements.
- Use `npm run snowflake:phase1:ddl` and `npm run snowflake:phase1:backfill` to apply the new Phase 1 scripts with the configured Snowflake connection.

## Run Order
1. `001_schema_mvp.sql`
2. `030_enterprise_location_extension.sql`
3. `020_seed_reference_data.sql`
4. `021_seed_departments.sql`
5. `022_seed_locations.sql`
6. `023_seed_brand_locations.sql`
7. `031_document_security_extension.sql`
8. `032_user_scope_mappings.sql`
9. `033_phase_1_lean_extension.sql`
10. `034_phase_1_backfill.sql`
11. `010_views_mvp.sql`
