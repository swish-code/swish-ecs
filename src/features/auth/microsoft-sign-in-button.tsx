"use client";

import { useTransition } from "react";
import { signIn } from "next-auth/react";
import { MicrosoftMark } from "@/features/auth/microsoft-mark";

type MicrosoftSignInButtonProps = {
  callbackUrl?: string;
  className?: string;
};

export function MicrosoftSignInButton({ callbackUrl = "/dashboard", className }: MicrosoftSignInButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await signIn("azure-ad", { callbackUrl });
        });
      }}
      disabled={isPending}
      className={className}
    >
      <MicrosoftMark />
      <span>{isPending ? "Connecting to Microsoft..." : "Continue with Microsoft"}</span>
    </button>
  );
}