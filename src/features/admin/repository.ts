import { executeCommand, queryFirst, queryMany } from "@/lib/snowflake/query";
import type {
  BrandRecord,
  CreateUserRecordInput,
  DepartmentRecord,
  LocationRecord,
  RoleRecord,
  UpdateUserRecordInput,
  UserRecord,
} from "@/features/admin/types";

type BrandRow = {
  BRAND_ID: number;
  BRAND_CODE: string;
  BRAND_NAME: string;
  IS_ACTIVE: boolean;
};

type DepartmentRow = {
  DEPARTMENT_ID: number;
  DEPARTMENT_CODE: string;
  DEPARTMENT_NAME: string;
  IS_ACTIVE: boolean;
};

type LocationRow = {
  LOCATION_ID: number;
  LOCATION_CODE: string;
  LOCATION_NAME: string;
  IS_ACTIVE: boolean;
};

type RoleRow = {
  ROLE_ID: number;
  ROLE_KEY: string;
  ROLE_NAME: string;
  IS_ACTIVE: boolean;
};

type UserRow = {
  USER_ID: number;
  EMAIL: string;
  DISPLAY_NAME: string;
  BRAND_ID: number | null;
  BRAND_NAME: string | null;
  DEPARTMENT_ID: number | null;
  DEPARTMENT_NAME: string | null;
  LOCATION_ID: number | null;
  LOCATION_NAME: string | null;
  ROLE_NAMES: string | null;
  ROLE_IDS: string | null;
  IS_ACTIVE: boolean;
};

type UserScopeFlagsRow = {
  USER_ID: number;
  HAS_ALL_BRANDS: boolean;
  HAS_ALL_DEPARTMENTS: boolean;
  HAS_ALL_LOCATIONS: boolean;
};

type UserBrandScopeRow = {
  USER_ID: number;
  BRAND_ID: number;
};

type UserDepartmentScopeRow = {
  USER_ID: number;
  DEPARTMENT_ID: number;
};

type UserLocationScopeRow = {
  USER_ID: number;
  LOCATION_ID: number;
};

type MasterIdRow = {
  ID: number;
};

type MasterCodeRow = {
  CODE: string;
};

let userScopeMappingsSupported: boolean | undefined;

function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeLookupName(value: string): string {
  return normalizeDisplayName(value).toUpperCase();
}

function buildBaseCode(value: string, prefix: string): string {
  const normalized = normalizeDisplayName(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);

  return normalized || prefix;
}

function uniqueScopeIds(ids: Array<number | null | undefined>): number[] {
  return [...new Set(ids.filter((value): value is number => typeof value === "number" && value > 0))];
}

async function supportsUserScopeMappings(): Promise<boolean> {
  if (userScopeMappingsSupported !== undefined) {
    return userScopeMappingsSupported;
  }

  try {
    await queryMany<{ USER_ID: number }>(`
      SELECT USER_ID
      FROM USER_BRANDS
      LIMIT 1
    `);
    userScopeMappingsSupported = true;
  } catch {
    userScopeMappingsSupported = false;
  }

  return userScopeMappingsSupported;
}

async function findUserIdByEmail(email: string): Promise<number | undefined> {
  const row = await queryFirst<{ USER_ID: number }>(
    `
      SELECT USER_ID
      FROM USERS
      WHERE LOWER(EMAIL) = ?
      ORDER BY USER_ID DESC
      LIMIT 1
    `,
    [email.toLowerCase()],
  );

  return row?.USER_ID;
}

async function syncUserScopeMappings(userId: number, input: CreateUserRecordInput | UpdateUserRecordInput): Promise<void> {
  if (!(await supportsUserScopeMappings())) {
    return;
  }

  const brandIds = input.hasAllBrands ? [] : uniqueScopeIds([input.brandId, ...(input.brandIds ?? [])]);
  const departmentIds = input.hasAllDepartments ? [] : uniqueScopeIds([input.departmentId, ...(input.departmentIds ?? [])]);
  const locationIds = input.hasAllLocations ? [] : uniqueScopeIds([input.locationId, ...(input.locationIds ?? [])]);

  await executeCommand(
    `
      UPDATE USERS
      SET HAS_ALL_BRANDS = ?, HAS_ALL_DEPARTMENTS = ?, HAS_ALL_LOCATIONS = ?
      WHERE USER_ID = ?
    `,
    [input.hasAllBrands ?? false, input.hasAllDepartments ?? false, input.hasAllLocations ?? false, userId],
  );

  await executeCommand(`DELETE FROM USER_BRANDS WHERE USER_ID = ?`, [userId]);
  await executeCommand(`DELETE FROM USER_DEPARTMENTS WHERE USER_ID = ?`, [userId]);
  await executeCommand(`DELETE FROM USER_LOCATIONS WHERE USER_ID = ?`, [userId]);

  for (const brandId of brandIds) {
    await executeCommand(`INSERT INTO USER_BRANDS (USER_ID, BRAND_ID) VALUES (?, ?)`, [userId, brandId]);
  }

  for (const departmentId of departmentIds) {
    await executeCommand(`INSERT INTO USER_DEPARTMENTS (USER_ID, DEPARTMENT_ID) VALUES (?, ?)`, [userId, departmentId]);
  }

  for (const locationId of locationIds) {
    await executeCommand(`INSERT INTO USER_LOCATIONS (USER_ID, LOCATION_ID) VALUES (?, ?)`, [userId, locationId]);
  }
}

async function findMasterRecordIdByName(table: string, idColumn: string, nameColumn: string, name: string): Promise<number | undefined> {
  const row = await queryFirst<MasterIdRow>(
    `
      SELECT ${idColumn} AS ID
      FROM ${table}
      WHERE UPPER(TRIM(${nameColumn})) = ?
      ORDER BY ${idColumn} DESC
      LIMIT 1
    `,
    [normalizeLookupName(name)],
  );

  return row?.ID;
}

async function getNextMasterCode(table: string, codeColumn: string, baseCode: string): Promise<string> {
  const rows = await queryMany<MasterCodeRow>(
    `
      SELECT ${codeColumn} AS CODE
      FROM ${table}
      WHERE UPPER(${codeColumn}) = ? OR UPPER(${codeColumn}) LIKE ?
    `,
    [baseCode, `${baseCode}_%`],
  );

  const existingCodes = new Set(rows.map((row) => row.CODE.toUpperCase()));

  if (!existingCodes.has(baseCode)) {
    return baseCode;
  }

  let suffix = 2;

  while (existingCodes.has(`${baseCode}_${suffix}`)) {
    suffix += 1;
  }

  return `${baseCode}_${suffix}`;
}

async function getOrCreateMasterRecordId(options: {
  table: string;
  idColumn: string;
  codeColumn: string;
  nameColumn: string;
  codePrefix: string;
  name: string;
}): Promise<number> {
  const normalizedName = normalizeDisplayName(options.name);
  const existingId = await findMasterRecordIdByName(options.table, options.idColumn, options.nameColumn, normalizedName);

  if (existingId) {
    return existingId;
  }

  const code = await getNextMasterCode(options.table, options.codeColumn, buildBaseCode(normalizedName, options.codePrefix));

  await executeCommand(
    `
      INSERT INTO ${options.table} (${options.codeColumn}, ${options.nameColumn})
      VALUES (?, ?)
    `,
    [code, normalizeLookupName(normalizedName)],
  );

  const createdId = await findMasterRecordIdByName(options.table, options.idColumn, options.nameColumn, normalizedName);

  if (!createdId) {
    throw new Error(`Failed to create ${options.table.toLowerCase()} record.`);
  }

  return createdId;
}

export async function listBrands(): Promise<BrandRecord[]> {
  const rows = await queryMany<BrandRow>(`
    SELECT BRAND_ID, BRAND_CODE, BRAND_NAME, IS_ACTIVE
    FROM BRANDS
    ORDER BY BRAND_NAME
  `);

  return rows.map((row) => ({
    brandId: row.BRAND_ID,
    brandCode: row.BRAND_CODE,
    brandName: row.BRAND_NAME,
    isActive: row.IS_ACTIVE,
  }));
}

export async function createBrand(brandCode: string, brandName: string): Promise<void> {
  await executeCommand(
    `
      INSERT INTO BRANDS (BRAND_CODE, BRAND_NAME)
      VALUES (?, ?)
    `,
    [brandCode, brandName],
  );
}

export async function listDepartments(): Promise<DepartmentRecord[]> {
  const rows = await queryMany<DepartmentRow>(`
    SELECT DEPARTMENT_ID, DEPARTMENT_CODE, DEPARTMENT_NAME, IS_ACTIVE
    FROM DEPARTMENTS
    ORDER BY DEPARTMENT_NAME
  `);

  return rows.map((row) => ({
    departmentId: row.DEPARTMENT_ID,
    departmentCode: row.DEPARTMENT_CODE,
    departmentName: row.DEPARTMENT_NAME,
    isActive: row.IS_ACTIVE,
  }));
}

export async function createDepartment(departmentCode: string, departmentName: string): Promise<void> {
  await executeCommand(
    `
      INSERT INTO DEPARTMENTS (DEPARTMENT_CODE, DEPARTMENT_NAME)
      VALUES (?, ?)
    `,
    [departmentCode, departmentName],
  );
}

export async function listLocations(): Promise<LocationRecord[]> {
  const rows = await queryMany<LocationRow>(`
    SELECT LOCATION_ID, LOCATION_CODE, LOCATION_NAME, IS_ACTIVE
    FROM LOCATIONS
    ORDER BY LOCATION_NAME
  `);

  return rows.map((row) => ({
    locationId: row.LOCATION_ID,
    locationCode: row.LOCATION_CODE,
    locationName: row.LOCATION_NAME,
    isActive: row.IS_ACTIVE,
  }));
}

export async function createLocation(locationCode: string, locationName: string): Promise<void> {
  await executeCommand(
    `
      INSERT INTO LOCATIONS (LOCATION_CODE, LOCATION_NAME)
      VALUES (?, ?)
    `,
    [locationCode, locationName],
  );
}

export async function listRoles(): Promise<RoleRecord[]> {
  const rows = await queryMany<RoleRow>(`
    SELECT ROLE_ID, ROLE_KEY, ROLE_NAME, IS_ACTIVE
    FROM ROLES
    ORDER BY ROLE_NAME
  `);

  return rows.map((row) => ({
    roleId: row.ROLE_ID,
    roleKey: row.ROLE_KEY,
    roleName: row.ROLE_NAME,
    isActive: row.IS_ACTIVE,
  }));
}

export async function listUsers(): Promise<UserRecord[]> {
  const rows = await queryMany<UserRow>(`
    SELECT
      u.USER_ID,
      u.EMAIL,
      u.DISPLAY_NAME,
      u.BRAND_ID,
      b.BRAND_NAME,
      u.DEPARTMENT_ID,
      d.DEPARTMENT_NAME,
      u.LOCATION_ID,
      l.LOCATION_NAME,
      LISTAGG(r.ROLE_NAME, ', ') WITHIN GROUP (ORDER BY r.ROLE_NAME) AS ROLE_NAMES,
      LISTAGG(TO_VARCHAR(r.ROLE_ID), ',') WITHIN GROUP (ORDER BY r.ROLE_ID) AS ROLE_IDS,
      u.IS_ACTIVE
    FROM USERS u
    LEFT JOIN BRANDS b ON b.BRAND_ID = u.BRAND_ID
    LEFT JOIN DEPARTMENTS d ON d.DEPARTMENT_ID = u.DEPARTMENT_ID
    LEFT JOIN LOCATIONS l ON l.LOCATION_ID = u.LOCATION_ID
    LEFT JOIN USER_ROLES ur ON ur.USER_ID = u.USER_ID
    LEFT JOIN ROLES r ON r.ROLE_ID = ur.ROLE_ID
    GROUP BY
      u.USER_ID,
      u.EMAIL,
      u.DISPLAY_NAME,
      u.BRAND_ID,
      b.BRAND_NAME,
      u.DEPARTMENT_ID,
      d.DEPARTMENT_NAME,
      u.LOCATION_ID,
      l.LOCATION_NAME,
      u.IS_ACTIVE
    ORDER BY u.DISPLAY_NAME
  `);

  const baseRecords = rows.map((row) => ({
    userId: row.USER_ID,
    email: row.EMAIL,
    displayName: row.DISPLAY_NAME,
    brandId: row.BRAND_ID,
    brandIds: uniqueScopeIds([row.BRAND_ID]),
    hasAllBrands: false,
    brandName: row.BRAND_NAME,
    departmentId: row.DEPARTMENT_ID,
    departmentIds: uniqueScopeIds([row.DEPARTMENT_ID]),
    hasAllDepartments: false,
    departmentName: row.DEPARTMENT_NAME,
    locationId: row.LOCATION_ID,
    locationIds: uniqueScopeIds([row.LOCATION_ID]),
    hasAllLocations: false,
    locationName: row.LOCATION_NAME,
    roleNames: row.ROLE_NAMES,
    roleIds: (row.ROLE_IDS ?? "")
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0),
    isActive: row.IS_ACTIVE,
  }));

  if (!(await supportsUserScopeMappings()) || baseRecords.length === 0) {
    return baseRecords;
  }

  const [flagRows, brandScopeRows, departmentScopeRows, locationScopeRows] = await Promise.all([
    queryMany<UserScopeFlagsRow>(`
      SELECT USER_ID, HAS_ALL_BRANDS, HAS_ALL_DEPARTMENTS, HAS_ALL_LOCATIONS
      FROM USERS
    `),
    queryMany<UserBrandScopeRow>(`
      SELECT USER_ID, BRAND_ID
      FROM USER_BRANDS
    `),
    queryMany<UserDepartmentScopeRow>(`
      SELECT USER_ID, DEPARTMENT_ID
      FROM USER_DEPARTMENTS
    `),
    queryMany<UserLocationScopeRow>(`
      SELECT USER_ID, LOCATION_ID
      FROM USER_LOCATIONS
    `),
  ]);

  const flagMap = new Map(flagRows.map((row) => [row.USER_ID, row]));
  const brandMap = new Map<number, number[]>();
  const departmentMap = new Map<number, number[]>();
  const locationMap = new Map<number, number[]>();

  for (const row of brandScopeRows) {
    brandMap.set(row.USER_ID, [...(brandMap.get(row.USER_ID) ?? []), row.BRAND_ID]);
  }

  for (const row of departmentScopeRows) {
    departmentMap.set(row.USER_ID, [...(departmentMap.get(row.USER_ID) ?? []), row.DEPARTMENT_ID]);
  }

  for (const row of locationScopeRows) {
    locationMap.set(row.USER_ID, [...(locationMap.get(row.USER_ID) ?? []), row.LOCATION_ID]);
  }

  return baseRecords.map((record) => {
    const flags = flagMap.get(record.userId);

    return {
      ...record,
      brandIds: uniqueScopeIds([record.brandId, ...(brandMap.get(record.userId) ?? [])]),
      hasAllBrands: flags?.HAS_ALL_BRANDS ?? false,
      departmentIds: uniqueScopeIds([record.departmentId, ...(departmentMap.get(record.userId) ?? [])]),
      hasAllDepartments: flags?.HAS_ALL_DEPARTMENTS ?? false,
      locationIds: uniqueScopeIds([record.locationId, ...(locationMap.get(record.userId) ?? [])]),
      hasAllLocations: flags?.HAS_ALL_LOCATIONS ?? false,
    };
  });
}

export async function createUser(input: CreateUserRecordInput): Promise<void> {
  await executeCommand(
    `
      INSERT INTO USERS (EMAIL, DISPLAY_NAME, BRAND_ID, DEPARTMENT_ID, LOCATION_ID)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      input.email,
      input.displayName,
      input.brandId ?? null,
      input.departmentId ?? null,
      input.locationId ?? null,
    ],
  );

  for (const roleId of input.roleIds) {
    await executeCommand(
      `
        INSERT INTO USER_ROLES (USER_ID, ROLE_ID)
        SELECT USER_ID, ?
        FROM USERS
        WHERE LOWER(EMAIL) = ?
      `,
      [roleId, input.email.toLowerCase()],
    );
  }

  const userId = await findUserIdByEmail(input.email);

  if (userId) {
    await syncUserScopeMappings(userId, input);
  }
}

export async function updateUser(input: UpdateUserRecordInput): Promise<void> {
  await executeCommand(
    `
      UPDATE USERS
      SET EMAIL = ?, DISPLAY_NAME = ?, BRAND_ID = ?, DEPARTMENT_ID = ?, LOCATION_ID = ?
      WHERE USER_ID = ?
    `,
    [
      input.email,
      input.displayName,
      input.brandId ?? null,
      input.departmentId ?? null,
      input.locationId ?? null,
      input.userId,
    ],
  );

  await executeCommand(
    `
      DELETE FROM USER_ROLES
      WHERE USER_ID = ?
    `,
    [input.userId],
  );

  for (const roleId of input.roleIds) {
    await executeCommand(
      `
        INSERT INTO USER_ROLES (USER_ID, ROLE_ID)
        VALUES (?, ?)
      `,
      [input.userId, roleId],
    );
  }

  await syncUserScopeMappings(input.userId, input);
}

export async function getOrCreateBrandId(brandName: string): Promise<number> {
  return getOrCreateMasterRecordId({
    table: "BRANDS",
    idColumn: "BRAND_ID",
    codeColumn: "BRAND_CODE",
    nameColumn: "BRAND_NAME",
    codePrefix: "BRAND",
    name: brandName,
  });
}

export async function getOrCreateDepartmentId(departmentName: string): Promise<number> {
  return getOrCreateMasterRecordId({
    table: "DEPARTMENTS",
    idColumn: "DEPARTMENT_ID",
    codeColumn: "DEPARTMENT_CODE",
    nameColumn: "DEPARTMENT_NAME",
    codePrefix: "DEPARTMENT",
    name: departmentName,
  });
}

export async function getOrCreateLocationId(locationName: string): Promise<number> {
  return getOrCreateMasterRecordId({
    table: "LOCATIONS",
    idColumn: "LOCATION_ID",
    codeColumn: "LOCATION_CODE",
    nameColumn: "LOCATION_NAME",
    codePrefix: "LOCATION",
    name: locationName,
  });
}
