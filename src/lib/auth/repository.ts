import "server-only";

import { queryFirst, queryMany } from "@/lib/snowflake/query";
import type { AppRole } from "@/types/domain";

type AppUserRow = {
  USER_ID: number;
  EMAIL: string;
  DISPLAY_NAME: string;
  BRAND_ID: number | null;
  DEPARTMENT_ID: number | null;
  LOCATION_ID: number | null;
  ROLE_KEYS: string | null;
  HAS_ALL_BRANDS?: boolean;
  HAS_ALL_DEPARTMENTS?: boolean;
  HAS_ALL_LOCATIONS?: boolean;
};

type UserBrandScopeRow = {
  BRAND_ID: number;
};

type UserDepartmentScopeRow = {
  DEPARTMENT_ID: number;
};

type UserLocationScopeRow = {
  LOCATION_ID: number;
};

export type AuthenticatedAppUser = {
  id: number;
  email: string;
  displayName: string;
  brandId: number | null;
  brandIds: number[];
  hasAllBrands: boolean;
  departmentId: number | null;
  departmentIds: number[];
  hasAllDepartments: boolean;
  locationId: number | null;
  locationIds: number[];
  hasAllLocations: boolean;
  roleKeys: AppRole[];
};

function toScopeIds(id: number | null): number[] {
  return typeof id === "number" && id > 0 ? [id] : [];
}

function mergeScopeIds(primaryId: number | null, ids: number[]): number[] {
  return [...new Set([...toScopeIds(primaryId), ...ids.filter((value) => value > 0)])];
}

function parseRoleKeys(rawRoleKeys: string | null): AppRole[] {
  if (!rawRoleKeys) {
    return [];
  }

  return rawRoleKeys
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(
      (value, index, values): value is AppRole =>
        values.indexOf(value) === index && ["ADMIN", "BUSINESS_EXCELLENCE", "DEPARTMENT_OWNER", "AUDITOR", "EXECUTIVE_VIEWER"].includes(value),
    ) as AppRole[];
}

export async function findAuthenticatedAppUserByEmail(email: string): Promise<AuthenticatedAppUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const row = await queryFirst<AppUserRow>(
    `
      SELECT
        u.USER_ID,
        u.EMAIL,
        u.DISPLAY_NAME,
        u.BRAND_ID,
        u.DEPARTMENT_ID,
        u.LOCATION_ID,
        COALESCE(u.HAS_ALL_BRANDS, FALSE) AS HAS_ALL_BRANDS,
        COALESCE(u.HAS_ALL_DEPARTMENTS, FALSE) AS HAS_ALL_DEPARTMENTS,
        COALESCE(u.HAS_ALL_LOCATIONS, FALSE) AS HAS_ALL_LOCATIONS,
        LISTAGG(r.ROLE_KEY, ',') WITHIN GROUP (ORDER BY r.ROLE_KEY) AS ROLE_KEYS
      FROM USERS u
      LEFT JOIN USER_ROLES ur ON ur.USER_ID = u.USER_ID
      LEFT JOIN ROLES r ON r.ROLE_ID = ur.ROLE_ID AND r.IS_ACTIVE
      WHERE u.IS_ACTIVE AND LOWER(u.EMAIL) = ?
      GROUP BY
        u.USER_ID,
        u.EMAIL,
        u.DISPLAY_NAME,
        u.BRAND_ID,
        u.DEPARTMENT_ID,
        u.LOCATION_ID,
        u.HAS_ALL_BRANDS,
        u.HAS_ALL_DEPARTMENTS,
        u.HAS_ALL_LOCATIONS
    `,
    [normalizedEmail],
  );

  if (!row) {
    return null;
  }

  let brandIds = toScopeIds(row.BRAND_ID);
  let departmentIds = toScopeIds(row.DEPARTMENT_ID);
  let locationIds = toScopeIds(row.LOCATION_ID);

  try {
    const [brandRows, departmentRows, locationRows] = await Promise.all([
      queryMany<UserBrandScopeRow>(
        `
          SELECT BRAND_ID
          FROM USER_BRANDS
          WHERE USER_ID = ?
          ORDER BY BRAND_ID
        `,
        [row.USER_ID],
      ),
      queryMany<UserDepartmentScopeRow>(
        `
          SELECT DEPARTMENT_ID
          FROM USER_DEPARTMENTS
          WHERE USER_ID = ?
          ORDER BY DEPARTMENT_ID
        `,
        [row.USER_ID],
      ),
      queryMany<UserLocationScopeRow>(
        `
          SELECT LOCATION_ID
          FROM USER_LOCATIONS
          WHERE USER_ID = ?
          ORDER BY LOCATION_ID
        `,
        [row.USER_ID],
      ),
    ]);

    brandIds = mergeScopeIds(row.BRAND_ID, brandRows.map((item) => item.BRAND_ID));
    departmentIds = mergeScopeIds(row.DEPARTMENT_ID, departmentRows.map((item) => item.DEPARTMENT_ID));
    locationIds = mergeScopeIds(row.LOCATION_ID, locationRows.map((item) => item.LOCATION_ID));
  } catch {
    // Keep backward-compatible single-scope behavior if the mapping tables are unavailable.
  }

  return {
    id: row.USER_ID,
    email: row.EMAIL,
    displayName: row.DISPLAY_NAME,
    brandId: row.BRAND_ID,
    brandIds,
    hasAllBrands: row.HAS_ALL_BRANDS ?? false,
    departmentId: row.DEPARTMENT_ID,
    departmentIds,
    hasAllDepartments: row.HAS_ALL_DEPARTMENTS ?? false,
    locationId: row.LOCATION_ID,
    locationIds,
    hasAllLocations: row.HAS_ALL_LOCATIONS ?? false,
    roleKeys: parseRoleKeys(row.ROLE_KEYS),
  };
}