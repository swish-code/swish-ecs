import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import Link from "next/link";

const adminLinks = [
  { href: "/admin/brands", title: "Brands", text: "Manage brand master records and brand codes.", actionLabel: "Open brands" },
  { href: "/admin/departments", title: "Departments", text: "Manage organizational departments used by compliance flows.", actionLabel: "Open departments" },
  { href: "/admin/locations", title: "Locations", text: "Manage branch and store locations for scoped compliance records.", actionLabel: "Open locations" },
  { href: "/admin/users", title: "Users", text: "Create application users, connect Microsoft identities, and assign organizational scope.", actionLabel: "Manage users" },
  { href: "/admin/roles", title: "Roles", text: "Review application role definitions used for access control.", actionLabel: "Review roles" },
];

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <ProtectedAppShell allowedRoles={["ADMIN", "BUSINESS_EXCELLENCE"]}>
      <div className="space-y-8">
        <header className="space-y-3 rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">Admin home</p>
          <h1 className="text-3xl font-semibold tracking-tight">Foundation data and access control</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Keeping administration under one hub reduces navigation clutter and makes the operating modules easier to scan. Use this area for master data, Microsoft user onboarding, and access-role maintenance.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_12px_40px_rgba(29,42,36,0.06)] transition hover:border-[var(--accent)] hover:shadow-[0_18px_44px_rgba(29,42,36,0.09)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {item.actionLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
            </Link>
          ))}
        </section>
      </div>
    </ProtectedAppShell>
  );
}
