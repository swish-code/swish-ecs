import {
  createBrand,
  createDepartment,
  createLocation,
  createUser,
  getOrCreateBrandId,
  getOrCreateDepartmentId,
  getOrCreateLocationId,
  listBrands,
  listDepartments,
  listLocations,
  listRoles,
  listUsers,
  updateUser,
} from "@/features/admin/repository";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import {
  brandFormSchema,
  departmentFormSchema,
  locationFormSchema,
  userFormSchema,
} from "@/features/admin/validators";
import {
  getAccessibleBrandIds,
  getAccessibleDepartmentIds,
  getAccessibleLocationIds,
  hasBrandAccess,
  hasDepartmentAccess,
  hasLocationAccess,
  hasRole,
  type SessionUser,
} from "@/lib/auth/rbac";
import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";

function uniqueScopeIds(ids: Array<number | undefined>): number[] {
  return [...new Set(ids.filter((value): value is number => typeof value === "number" && value > 0))];
}

const getBrandRecordsCached = unstable_cache(listBrands, ["admin-brands"], { tags: ["admin:brands"] });
const getDepartmentRecordsCached = unstable_cache(listDepartments, ["admin-departments"], { tags: ["admin:departments"] });
const getLocationRecordsCached = unstable_cache(listLocations, ["admin-locations"], { tags: ["admin:locations"] });
const getRoleRecordsCached = unstable_cache(listRoles, ["admin-roles"], { tags: ["admin:roles"] });
const getUserRecordsCached = unstable_cache(listUsers, ["admin-users"], { tags: ["admin:users"] });

export const getBrandRecords = getBrandRecordsCached;
export const getDepartmentRecords = getDepartmentRecordsCached;
export const getLocationRecords = getLocationRecordsCached;
export const getRoleRecords = getRoleRecordsCached;
export const getUserRecords = getUserRecordsCached;

export function filterBrandRecords(records: BrandRecord[], user: SessionUser): BrandRecord[] {
  if (hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    return records;
  }

  if (user.hasAllBrands) {
    return records;
  }

  const accessibleBrandIds = getAccessibleBrandIds(user);

  if (accessibleBrandIds.length === 0) {
    return [];
  }

  return records.filter((record) => accessibleBrandIds.includes(record.brandId));
}

export function filterDepartmentRecords(records: DepartmentRecord[], user: SessionUser): DepartmentRecord[] {
  if (hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    return records;
  }

  if (user.hasAllDepartments) {
    return records;
  }

  const accessibleDepartmentIds = getAccessibleDepartmentIds(user);

  if (accessibleDepartmentIds.length === 0) {
    return [];
  }

  return records.filter((record) => accessibleDepartmentIds.includes(record.departmentId));
}

export function filterLocationRecords(records: LocationRecord[], user: SessionUser): LocationRecord[] {
  if (hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    return records;
  }

  if (user.hasAllLocations) {
    return records;
  }

  const accessibleLocationIds = getAccessibleLocationIds(user);

  if (accessibleLocationIds.length === 0) {
    return [];
  }

  return records.filter((record) => accessibleLocationIds.includes(record.locationId));
}

export function filterUserRecords(records: UserRecord[], user: SessionUser): UserRecord[] {
  if (hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    return records;
  }

  return records.filter((record) => {
    if (record.userId === user.id) {
      return true;
    }

    if (hasLocationAccess(user, record.locationId)) {
      return true;
    }

    if (hasDepartmentAccess(user, record.departmentId)) {
      return true;
    }

    if (hasBrandAccess(user, record.brandId)) {
      return true;
    }

    return false;
  });
}

export async function createBrandRecord(input: unknown): Promise<void> {
  const parsed = brandFormSchema.parse(input);
  await createBrand(parsed.brandCode.toUpperCase(), parsed.brandName.toUpperCase());
}

export async function createDepartmentRecord(input: unknown): Promise<void> {
  const parsed = departmentFormSchema.parse(input);
  await createDepartment(parsed.departmentCode.toUpperCase(), parsed.departmentName.toUpperCase());
}

export async function createLocationRecord(input: unknown): Promise<void> {
  const parsed = locationFormSchema.parse(input);
  await createLocation(parsed.locationCode.toUpperCase(), parsed.locationName.toUpperCase());
}

export async function createUserRecord(input: unknown): Promise<void> {
  const parsed = userFormSchema.parse(input);

  const brandId = parsed.brandName ? await getOrCreateBrandId(parsed.brandName) : parsed.brandId;
  const departmentId = parsed.departmentName ? await getOrCreateDepartmentId(parsed.departmentName) : parsed.departmentId;
  const locationId = parsed.locationName ? await getOrCreateLocationId(parsed.locationName) : parsed.locationId;
  const brandIds = uniqueScopeIds([brandId, ...(parsed.brandIds ?? [])]);
  const departmentIds = uniqueScopeIds([departmentId, ...(parsed.departmentIds ?? [])]);
  const locationIds = uniqueScopeIds([locationId, ...(parsed.locationIds ?? [])]);

  await createUser({
    email: parsed.email.toLowerCase(),
    displayName: parsed.displayName,
    brandId,
    brandIds,
    hasAllBrands: parsed.hasAllBrands,
    brandName: parsed.brandName,
    departmentId,
    departmentIds,
    hasAllDepartments: parsed.hasAllDepartments,
    departmentName: parsed.departmentName,
    locationId,
    locationIds,
    hasAllLocations: parsed.hasAllLocations,
    locationName: parsed.locationName,
    roleIds: parsed.roleIds,
  });
}

export async function updateUserRecord(input: unknown): Promise<void> {
  const parsed = userFormSchema.extend({
    userId: z.number().int().positive(),
  }).parse(input);

  const brandId = parsed.brandName ? await getOrCreateBrandId(parsed.brandName) : parsed.brandId;
  const departmentId = parsed.departmentName ? await getOrCreateDepartmentId(parsed.departmentName) : parsed.departmentId;
  const locationId = parsed.locationName ? await getOrCreateLocationId(parsed.locationName) : parsed.locationId;
  const brandIds = uniqueScopeIds([brandId, ...(parsed.brandIds ?? [])]);
  const departmentIds = uniqueScopeIds([departmentId, ...(parsed.departmentIds ?? [])]);
  const locationIds = uniqueScopeIds([locationId, ...(parsed.locationIds ?? [])]);

  await updateUser({
    userId: parsed.userId,
    email: parsed.email.toLowerCase(),
    displayName: parsed.displayName,
    brandId,
    brandIds,
    hasAllBrands: parsed.hasAllBrands,
    brandName: parsed.brandName,
    departmentId,
    departmentIds,
    hasAllDepartments: parsed.hasAllDepartments,
    departmentName: parsed.departmentName,
    locationId,
    locationIds,
    hasAllLocations: parsed.hasAllLocations,
    locationName: parsed.locationName,
    roleIds: parsed.roleIds,
  });
}
