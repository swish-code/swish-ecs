"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { SignOutButton } from "@/features/auth/sign-out-button";
import type { AppRole } from "@/types/domain";

type NavItem = {
  href: string;
  label: string;
  roles?: AppRole[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { href: "/my-work", label: "My Work", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"] },
      { href: "/roadmap", label: "Roadmap", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"] },
      { href: "/tests", label: "Tests", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"] },
      { href: "/reports", label: "Reports", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"] },
    ],
  },
  {
    title: "Compliance",
    items: [
      { href: "/frameworks", label: "Frameworks", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "EXECUTIVE_VIEWER", "AUDITOR", "DEPARTMENT_OWNER"] },
      { href: "/controls", label: "Controls", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"] },
      { href: "/sops", label: "Policies", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"] },
      { href: "/documents", label: "Documents", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR", "DEPARTMENT_OWNER"] },
      { href: "/audits", label: "Audits", roles: ["ADMIN", "BUSINESS_EXCELLENCE", "AUDITOR"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin", label: "Admin Home", roles: ["ADMIN", "BUSINESS_EXCELLENCE"] },
    ],
  },
];

const exactMatchRoutes = new Set(["/admin", "/audits", "/controls", "/documents", "/frameworks", "/my-work", "/reports", "/roadmap", "/sops", "/tests"]);

function canAccessRoute(userRoles: AppRole[], allowedRoles?: AppRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.some((role) => userRoles.includes(role));
}

function isActive(pathname: string, href: string): boolean {
  if (exactMatchRoutes.has(href)) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppShellProps = {
  children: ReactNode;
  session: {
    authMode: "mock" | "entra";
    displayName: string;
    roleKeys: AppRole[];
  };
};

export function AppShell({ children, session }: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessRoute(session.roleKeys, item.roles)),
    }))
    .filter((group) => group.items.length > 0);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const areaDescription =
    pathname.startsWith("/my-work") || pathname.startsWith("/action-center")
      ? "Personal work queue for approvals, reviews, rollout work, and remediation"
      : pathname.startsWith("/roadmap") || pathname.startsWith("/assignments")
        ? "Program roadmap and milestone execution across the current rollout scope"
      : pathname.startsWith("/tests") || pathname.startsWith("/checks")
        ? "Validation register and result history across the control hub"
      : pathname.startsWith("/reports") || pathname.startsWith("/dashboard")
        ? "Management reporting and cross-module compliance visibility"
      : pathname.startsWith("/frameworks")
        ? "Framework portfolio and current program readiness across the active scope"
      : pathname.startsWith("/sops")
        ? "Governed policy register, approval workflow, and linked control coverage"
        : pathname.startsWith("/controls")
          ? "Shared compliance controls, linked records, and reusable governance anchors"
        : pathname.startsWith("/documents")
          ? "Governed documents, evidence freshness, and reusable proof records"
          : pathname.startsWith("/audits")
            ? "Audit workspace for evidence review, execution, and readiness oversight"
              : "Master data and access foundations";

  return (
    <div className="min-h-screen lg:pl-[240px]">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-[#13201c]/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[240px] overflow-y-auto border-r border-[var(--line)] bg-[#1f2d28] text-white shadow-[0_18px_50px_rgba(11,19,16,0.22)] transition-transform duration-200 lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-full flex-col px-4 py-5">
          <Link href="/frameworks" className="rounded-[20px] border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-20 overflow-hidden rounded-lg bg-white">
                <Image
                  src="/brands/SwishLogo.jpg"
                  alt="Swish company logo"
                  width={96}
                  height={40}
                  className="h-full w-auto object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Swish</p>
                <p className="text-sm font-semibold text-white">Compliance App</p>
              </div>
            </div>
          </Link>

          <nav className="mt-6 space-y-5">
            {visibleNavGroups.map((group) => (
              <div key={group.title}>
                <p className="px-2 text-[10px] uppercase tracking-[0.22em] text-white/40">{group.title}</p>
                <div className="mt-2.5 space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                          active
                            ? "bg-[var(--accent)] text-[var(--background)] shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                            : "text-white/85 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <span className={active ? "text-white" : "text-white/85"}>{item.label}</span>
                        {active ? <span className="text-white">•</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-2">
              <SignOutButton
                authMode={session.authMode}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm text-white/88 transition hover:bg-white/8 hover:text-white disabled:cursor-wait disabled:opacity-70"
              />
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-[var(--line)]/80 bg-[rgba(250,249,246,0.92)] backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-[0_10px_24px_rgba(29,42,36,0.06)]"
              onClick={() => setMobileNavOpen(true)}
            >
              Menu
            </button>
            <div className="min-w-0 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Swish Compliance</p>
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{areaDescription}</p>
            </div>
          </div>
        </header>

        <div className="border-b border-[var(--line)]/70 bg-[rgba(255,255,255,0.72)] backdrop-blur lg:sticky lg:top-0 lg:z-20">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Workspace</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{areaDescription}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {session.authMode === "mock" ? "Local Session" : "Signed In"}
              </p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{session.displayName}</p>
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}