import "server-only";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import type { AuthenticatedAppUser } from "@/lib/auth/repository";
import { authOptions } from "@/lib/auth/options";
import { env, hasMicrosoftAuthConfig } from "@/lib/env";
import type { SessionUser } from "@/lib/auth/rbac";
import { appRoles, type AppRole } from "@/types/domain";

export type AppSessionUser = SessionUser & {
  displayName: string;
  email: string;
};

export type AppSession = {
  user: AppSessionUser;
  mode: "mock" | "entra";
};

type MicrosoftSession = {
  user?: {
    email?: string | null;
  };
  appUser?: AuthenticatedAppUser;
};

function parseRoleKeys(rawRoleKeys: string | null | undefined, fallbackRoles: AppRole[] = []): AppRole[] {
  if (!rawRoleKeys) {
    return fallbackRoles;
  }

  const requestedRoles = rawRoleKeys
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter((value): value is AppRole => appRoles.includes(value as AppRole));

  return requestedRoles.length > 0 ? requestedRoles : fallbackRoles;
}

function buildMockSession(): AppSession {
  return {
    mode: "mock",
    user: {
      id: env.DEV_SESSION_USER_ID,
      displayName: env.DEV_SESSION_DISPLAY_NAME,
      email: env.DEV_SESSION_EMAIL,
      roleKeys: parseRoleKeys(env.DEV_SESSION_ROLE_KEYS, ["BUSINESS_EXCELLENCE"]),
      brandId: env.DEV_SESSION_BRAND_ID ?? null,
      brandIds: env.DEV_SESSION_BRAND_ID ? [env.DEV_SESSION_BRAND_ID] : [],
      hasAllBrands: false,
      departmentId: env.DEV_SESSION_DEPARTMENT_ID ?? null,
      departmentIds: env.DEV_SESSION_DEPARTMENT_ID ? [env.DEV_SESSION_DEPARTMENT_ID] : [],
      hasAllDepartments: false,
      locationId: null,
      locationIds: [],
      hasAllLocations: false,
    },
  };
}

async function buildEntraSession(): Promise<AppSession | null> {
  const microsoftSession = (await getServerSession(authOptions)) as MicrosoftSession | null;
  const appUser = microsoftSession?.appUser;

  if (!appUser) {
    return null;
  }

  return {
    mode: "entra",
    user: {
      id: appUser.id,
      displayName: appUser.displayName,
      email: appUser.email,
      roleKeys: appUser.roleKeys,
      brandId: appUser.brandId,
      brandIds: appUser.brandIds,
      hasAllBrands: appUser.hasAllBrands,
      departmentId: appUser.departmentId,
      departmentIds: appUser.departmentIds,
      hasAllDepartments: appUser.hasAllDepartments,
      locationId: appUser.locationId,
      locationIds: appUser.locationIds,
      hasAllLocations: appUser.hasAllLocations,
    },
  };
}

export async function getCurrentSession(): Promise<AppSession | null> {
  if (env.AUTH_MODE === "mock") {
    return buildMockSession();
  }

  if (!hasMicrosoftAuthConfig()) {
    return null;
  }

  return buildEntraSession();
}

export async function requireCurrentSession(): Promise<AppSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  return session;
}