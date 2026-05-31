import type { ReactNode } from "react";

type Column<T> = {
  key?: keyof T;
  label: string;
  render?: (row: T) => ReactNode;
};

type MasterDataTableProps<T extends Record<string, unknown>> = {
  title: string;
  description: string;
  columns: Column<T>[];
  rows: T[];
  action?: ReactNode;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Active" : "Inactive";
  }

  return String(value);
}

export function MasterDataTable<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  rows,
  action,
}: MasterDataTableProps<T>) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm leading-7 text-[var(--muted)]">{description}</p>
        </div>
        {action}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="border-b border-[var(--line)] px-4 py-3 font-medium text-[var(--muted)]"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-[var(--muted)]"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td
                      key={column.key ? String(column.key) : column.label}
                      className="border-b border-[var(--line)]/60 px-4 py-3 align-top text-[var(--foreground)]"
                    >
                      {column.render ? column.render(row) : formatValue(row[column.key as keyof T])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
