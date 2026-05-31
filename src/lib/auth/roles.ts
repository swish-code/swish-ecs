import type { AppRole } from "@/types/domain";

export const defaultMvpRoles: AppRole[] = [
  "ADMIN",
  "BUSINESS_EXCELLENCE",
  "EXECUTIVE_VIEWER",
];

export const approverRole: AppRole = "BUSINESS_EXCELLENCE";
export const approverTitle = "IBE Manager";
