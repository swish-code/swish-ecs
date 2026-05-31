import type { AppRole } from "@/types/domain";

export type AccessScope = {
  brandId?: number | null;
  departmentId?: number | null;
  locationId?: number | null;
  assignedTo?: number | null;
};

export type SessionUser = {
  id: number;
  roleKeys: AppRole[];
  brandId?: number | null;
  brandIds?: number[];
  hasAllBrands?: boolean;
  departmentId?: number | null;
  departmentIds?: number[];
  hasAllDepartments?: boolean;
  locationId?: number | null;
  locationIds?: number[];
  hasAllLocations?: boolean;
};

function uniqueScopeIds(ids: Array<number | null | undefined>): number[] {
  return [...new Set(ids.filter((value): value is number => typeof value === "number" && value > 0))];
}

export function getAccessibleBrandIds(user: SessionUser): number[] {
  return uniqueScopeIds([user.brandId, ...(user.brandIds ?? [])]);
}

export function getAccessibleDepartmentIds(user: SessionUser): number[] {
  return uniqueScopeIds([user.departmentId, ...(user.departmentIds ?? [])]);
}

export function getAccessibleLocationIds(user: SessionUser): number[] {
  return uniqueScopeIds([user.locationId, ...(user.locationIds ?? [])]);
}

export function hasBrandAccess(user: SessionUser, brandId?: number | null): boolean {
  if (!brandId) {
    return false;
  }

  if (user.hasAllBrands) {
    return true;
  }

  return getAccessibleBrandIds(user).includes(brandId);
}

export function hasDepartmentAccess(user: SessionUser, departmentId?: number | null): boolean {
  if (!departmentId) {
    return false;
  }

  if (user.hasAllDepartments) {
    return true;
  }

  return getAccessibleDepartmentIds(user).includes(departmentId);
}

export function hasLocationAccess(user: SessionUser, locationId?: number | null): boolean {
  if (!locationId) {
    return false;
  }

  if (user.hasAllLocations) {
    return true;
  }

  return getAccessibleLocationIds(user).includes(locationId);
}

export function hasRole(user: SessionUser, allowedRoles: AppRole[]): boolean {
  return allowedRoles.some((allowedRole) => user.roleKeys.includes(allowedRole));
}

export function requireRole(user: SessionUser, allowedRoles: AppRole[]): void {
  if (!hasRole(user, allowedRoles)) {
    throw new Error("You do not have permission to perform this action.");
  }
}

export function canReadScope(user: SessionUser, scope: AccessScope): boolean {
  if (hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"])) {
    return true;
  }

  if (scope.assignedTo && scope.assignedTo === user.id) {
    return true;
  }

  if (hasBrandAccess(user, scope.brandId)) {
    return true;
  }

  if (hasDepartmentAccess(user, scope.departmentId)) {
    return true;
  }

  if (hasLocationAccess(user, scope.locationId)) {
    return true;
  }

  return false;
}

export function canApproveSop(user: SessionUser): boolean {
  return hasRole(user, ["ADMIN", "BUSINESS_EXCELLENCE"]);
}
