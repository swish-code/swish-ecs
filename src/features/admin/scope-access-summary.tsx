import type { BrandRecord, DepartmentRecord, LocationRecord, UserRecord } from "@/features/admin/types";
import type { SessionUser } from "@/lib/auth/rbac";
import type { ReactNode } from "react";

type ScopeAccessSummaryProps = {
  user: SessionUser;
  brands: BrandRecord[];
  departments: DepartmentRecord[];
  locations: LocationRecord[];
  users?: UserRecord[];
  className?: string;
};

function renderScopeValue(names: string[]): ReactNode {
  const visibleNames = names.slice(0, 4);
  const hasHiddenNames = names.length > visibleNames.length;

  if (names.length === 0) {
    return "None";
  }

  if (names.length === 1) {
    return names[0];
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {visibleNames.map((name, index) => (
          <div key={`${name}-${index}`}>{name}</div>
        ))}
      </div>

      {hasHiddenNames ? (
        <details className="group rounded-xl border border-[var(--line)]/70 bg-[rgba(255,255,255,0.84)] px-3 py-2">
          <summary className="cursor-pointer list-none text-sm font-medium text-[var(--accent)] marker:hidden">
            Show all {names.length} items
          </summary>
          <div className="mt-2 max-h-44 space-y-1 overflow-y-auto border-t border-[var(--line)]/60 pt-2 pr-1 text-sm text-[var(--foreground)]">
            {names.map((name, index) => (
              <div key={`${name}-${index}`}>{name}</div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

export function ScopeAccessSummary({ user, brands, departments, locations, users, className }: ScopeAccessSummaryProps) {
  const brandSummary = user.hasAllBrands ? "All brands" : renderScopeValue(brands.map((brand) => brand.brandName));
  const departmentSummary = user.hasAllDepartments
    ? "All departments"
    : renderScopeValue(departments.map((department) => department.departmentName));
  const locationSummary = user.hasAllLocations
    ? "All locations"
    : renderScopeValue(locations.map((location) => location.locationName));
  const ownerSummary = users ? renderScopeValue(users.map((owner) => owner.displayName)) : "Not used here";

  return (
    <section className={`rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_10px_24px_rgba(29,42,36,0.05)] ${className ?? ""}`.trim()}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Scope access</p>
        <p className="text-sm leading-7 text-[var(--muted)]">
          The choices below are filtered to the current user&apos;s permitted scope.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">Brands</p>
          <div className="mt-2 text-sm text-[var(--foreground)] break-words">{brandSummary}</div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">Departments</p>
          <div className="mt-2 text-sm text-[var(--foreground)] break-words">{departmentSummary}</div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">Locations</p>
          <div className="mt-2 text-sm text-[var(--foreground)] break-words">{locationSummary}</div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">Owners</p>
          <div className="mt-2 text-sm text-[var(--foreground)] break-words">{ownerSummary}</div>
        </div>
      </div>
    </section>
  );
}