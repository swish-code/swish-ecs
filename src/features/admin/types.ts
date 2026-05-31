export type BrandRecord = {
  brandId: number;
  brandCode: string;
  brandName: string;
  isActive: boolean;
};

export type DepartmentRecord = {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  isActive: boolean;
};

export type LocationRecord = {
  locationId: number;
  locationCode: string;
  locationName: string;
  isActive: boolean;
};

export type RoleRecord = {
  roleId: number;
  roleKey: string;
  roleName: string;
  isActive: boolean;
};

export type UserRecord = {
  userId: number;
  email: string;
  displayName: string;
  brandId: number | null;
  brandIds: number[];
  hasAllBrands: boolean;
  brandName: string | null;
  departmentId: number | null;
  departmentIds: number[];
  hasAllDepartments: boolean;
  departmentName: string | null;
  locationId: number | null;
  locationIds: number[];
  hasAllLocations: boolean;
  locationName: string | null;
  roleNames: string | null;
  roleIds: number[];
  isActive: boolean;
};

export type CreateUserRecordInput = {
  email: string;
  displayName: string;
  brandId?: number;
  brandIds?: number[];
  hasAllBrands?: boolean;
  brandName?: string;
  departmentId?: number;
  departmentIds?: number[];
  hasAllDepartments?: boolean;
  departmentName?: string;
  locationId?: number;
  locationIds?: number[];
  hasAllLocations?: boolean;
  locationName?: string;
  roleIds: number[];
};

export type UpdateUserRecordInput = CreateUserRecordInput & {
  userId: number;
};
