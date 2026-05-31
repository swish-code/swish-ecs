import type { ReactNode } from "react";
import { AppShell } from "@/features/shell/app-shell";
import { requireRole } from "@/lib/auth/rbac";
import { requireCurrentSession, type AppSession } from "@/lib/auth/session";
import type { AppRole } from "@/types/domain";

export async function ProtectedAppShell({
  children,
  allowedRoles,
  session,
}: {
  children: ReactNode;
  allowedRoles?: AppRole[];
  session?: AppSession;
}) {
  const resolvedSession = session ?? await requireCurrentSession();

  if (allowedRoles && allowedRoles.length > 0) {
    requireRole(resolvedSession.user, allowedRoles);
  }

  return (
    <AppShell
      session={{
        authMode: resolvedSession.mode,
        displayName: resolvedSession.user.displayName,
        roleKeys: resolvedSession.user.roleKeys,
      }}
    >
      {children}
    </AppShell>
  );
}