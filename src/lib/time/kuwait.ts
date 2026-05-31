const kuwaitTimeZone = "Asia/Kuwait";

export function formatKuwaitDateTime(value: Date | string | number): string {
  return new Intl.DateTimeFormat("en-KW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: kuwaitTimeZone,
  }).format(new Date(value));
}

export function formatKuwaitDate(value: Date | string | number): string {
  return new Intl.DateTimeFormat("en-KW", {
    dateStyle: "medium",
    timeZone: kuwaitTimeZone,
  }).format(new Date(value));
}

export { kuwaitTimeZone };
