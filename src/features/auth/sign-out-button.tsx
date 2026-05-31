"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

type SignOutButtonProps = {
  authMode: "mock" | "entra";
  className?: string;
};

export function SignOutButton({ authMode, className }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          if (authMode === "entra") {
            await signOut({ callbackUrl: "/" });
            return;
          }

          router.push("/");
          router.refresh();
        });
      }}
    >
      <span>{isPending ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}