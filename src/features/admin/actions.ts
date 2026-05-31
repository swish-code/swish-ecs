"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  createBrandRecord,
  createDepartmentRecord,
  createLocationRecord,
  createUserRecord,
  updateUserRecord,
} from "@/features/admin/service";
import { requireCurrentSession } from "@/lib/auth/session";

function toObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function toOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  return Number(value);
}

function toOptionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

function toNumberList(values: FormDataEntryValue[]): number[] {
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function toBoolean(value: FormDataEntryValue | null): boolean {
  return value === "true";
}

export async function createBrandAction(formData: FormData): Promise<void> {
  await requireCurrentSession();
  await createBrandRecord(toObject(formData));
  revalidatePath("/admin/brands");
  revalidateTag("admin:brands", "max");
}

export async function createDepartmentAction(formData: FormData): Promise<void> {
  await requireCurrentSession();
  await createDepartmentRecord(toObject(formData));
  revalidatePath("/admin/departments");
  revalidateTag("admin:departments", "max");
}

export async function createLocationAction(formData: FormData): Promise<void> {
  await requireCurrentSession();
  await createLocationRecord(toObject(formData));
  revalidatePath("/admin/locations");
  revalidateTag("admin:locations", "max");
}

export async function createUserAction(formData: FormData): Promise<void> {
  await requireCurrentSession();

  await createUserRecord({
    email: String(formData.get("email") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    brandId: toOptionalNumber(formData.get("brandId")),
    brandIds: toNumberList(formData.getAll("brandIds")),
    hasAllBrands: toBoolean(formData.get("hasAllBrands")),
    brandName: toOptionalString(formData.get("brandName")),
    departmentId: toOptionalNumber(formData.get("departmentId")),
    departmentIds: toNumberList(formData.getAll("departmentIds")),
    hasAllDepartments: toBoolean(formData.get("hasAllDepartments")),
    departmentName: toOptionalString(formData.get("departmentName")),
    locationId: toOptionalNumber(formData.get("locationId")),
    locationIds: toNumberList(formData.getAll("locationIds")),
    hasAllLocations: toBoolean(formData.get("hasAllLocations")),
    locationName: toOptionalString(formData.get("locationName")),
    roleIds: toNumberList(formData.getAll("roleIds")),
  });

  revalidatePath("/admin/users");
  revalidateTag("admin:users", "max");
  revalidateTag("admin:brands", "max");
  revalidateTag("admin:departments", "max");
  revalidateTag("admin:locations", "max");
}

export async function updateUserAction(formData: FormData): Promise<void> {
  await requireCurrentSession();

  await updateUserRecord({
    userId: Number(formData.get("userId") ?? 0),
    email: String(formData.get("email") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    brandId: toOptionalNumber(formData.get("brandId")),
    brandIds: toNumberList(formData.getAll("brandIds")),
    hasAllBrands: toBoolean(formData.get("hasAllBrands")),
    brandName: toOptionalString(formData.get("brandName")),
    departmentId: toOptionalNumber(formData.get("departmentId")),
    departmentIds: toNumberList(formData.getAll("departmentIds")),
    hasAllDepartments: toBoolean(formData.get("hasAllDepartments")),
    departmentName: toOptionalString(formData.get("departmentName")),
    locationId: toOptionalNumber(formData.get("locationId")),
    locationIds: toNumberList(formData.getAll("locationIds")),
    hasAllLocations: toBoolean(formData.get("hasAllLocations")),
    locationName: toOptionalString(formData.get("locationName")),
    roleIds: toNumberList(formData.getAll("roleIds")),
  });

  revalidatePath("/admin/users");
  revalidateTag("admin:users", "max");
  revalidateTag("admin:brands", "max");
  revalidateTag("admin:departments", "max");
  revalidateTag("admin:locations", "max");
}
