import { z } from "zod";

function withStringDefault(defaultValue: string) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return defaultValue;
    }

    const normalized = value.trim();
    return normalized === "" ? defaultValue : normalized;
  }, z.string().default(defaultValue));
}

function withNumberDefault(defaultValue: number) {
  return z.preprocess((value) => {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim();

      if (normalized === "") {
        return defaultValue;
      }

      return Number(normalized);
    }

    return defaultValue;
  }, z.number().int().positive().default(defaultValue));
}

function authModeDefault() {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return "mock";
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "entra" ? "entra" : "mock";
  }, z.enum(["mock", "entra"]).default("mock"));
}

function withBooleanDefault(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();

      if (normalized === "") {
        return defaultValue;
      }

      if (["true", "1", "yes", "on"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "no", "off"].includes(normalized)) {
        return false;
      }
    }

    return value;
  }, z.boolean().default(defaultValue));
}

function optionalNonEmptyString() {
  return z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.string().min(1).optional());
}

function optionalUrl() {
  return z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.string().url().optional());
}

function optionalEmail() {
  return z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.string().email().optional());
}

const envSchema = z.object({
  AUTH_MODE: authModeDefault(),
  NEXTAUTH_URL: optionalUrl(),
  NEXTAUTH_SECRET: optionalNonEmptyString(),
  NEXT_PUBLIC_AZURE_REDIRECT_URI: optionalUrl(),
  SNOWFLAKE_ACCOUNT: optionalNonEmptyString(),
  SNOWFLAKE_USERNAME: optionalNonEmptyString(),
  SNOWFLAKE_PASSWORD: optionalNonEmptyString(),
  SNOWFLAKE_DATABASE: optionalNonEmptyString(),
  SNOWFLAKE_SCHEMA: optionalNonEmptyString(),
  SNOWFLAKE_WAREHOUSE: optionalNonEmptyString(),
  SNOWFLAKE_ROLE: optionalNonEmptyString(),
  AZURE_TENANT_ID: optionalNonEmptyString(),
  AZURE_CLIENT_ID: optionalNonEmptyString(),
  AZURE_CLIENT_SECRET: optionalNonEmptyString(),
  SHAREPOINT_SITE_URL: optionalUrl(),
  SHAREPOINT_DOCUMENT_LIBRARY: optionalNonEmptyString(),
  SHAREPOINT_SITE_ID: optionalNonEmptyString(),
  EMAIL_NOTIFICATIONS_ENABLED: withBooleanDefault(false),
  OUTLOOK_SENDER_EMAIL: optionalEmail(),
  DEV_SESSION_USER_ID: withNumberDefault(1),
  DEV_SESSION_DISPLAY_NAME: withStringDefault("Local Business Excellence User"),
  DEV_SESSION_EMAIL: optionalEmail().default("local.user@swishhh.net"),
  DEV_SESSION_ROLE_KEYS: withStringDefault("BUSINESS_EXCELLENCE"),
  DEV_SESSION_BRAND_ID: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.coerce.number().int().positive().optional()),
  DEV_SESSION_DEPARTMENT_ID: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, z.coerce.number().int().positive().optional()),
});

export const env = envSchema.parse(process.env);

export function hasSnowflakeConfig(): boolean {
  return Boolean(
    env.SNOWFLAKE_ACCOUNT &&
      env.SNOWFLAKE_USERNAME &&
      env.SNOWFLAKE_PASSWORD &&
      env.SNOWFLAKE_DATABASE &&
      env.SNOWFLAKE_SCHEMA &&
      env.SNOWFLAKE_WAREHOUSE,
  );
}

export function isEmailNotificationsEnabled(): boolean {
  return env.EMAIL_NOTIFICATIONS_ENABLED;
}

export function hasMicrosoftAuthConfig(): boolean {
  return Boolean(env.AZURE_TENANT_ID && env.AZURE_CLIENT_ID && env.AZURE_CLIENT_SECRET);
}
