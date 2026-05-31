import Image from "next/image";
import Link from "next/link";
import { MicrosoftSignInButton } from "@/features/auth/microsoft-sign-in-button";
import { getCurrentSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>> | undefined;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getAuthErrorMessage(errorCode: string | undefined) {
  if (!errorCode) {
    return null;
  }

  switch (errorCode) {
    case "AccessDenied":
      return "Your Microsoft account is authenticated, but it is not registered in the Swish Compliance access list yet.";
    case "azure-ad":
    case "OAuthSignin":
    case "OAuthCallback":
    case "Callback":
      return "Microsoft sign-in could not be completed. Please try again. If it persists, verify the Entra application redirect URI and client credentials.";
    default:
      return "Sign-in could not be completed. Please try again.";
  }
}

type HomeProps = {
  searchParams?: SearchParams;
};

export default async function Home({ searchParams }: HomeProps) {
  const isEntraMode = env.AUTH_MODE === "entra";
  const session = await getCurrentSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorMessage = getAuthErrorMessage(getSingleValue(resolvedSearchParams.error));
  const primaryLabel = isEntraMode ? "Continue with Microsoft" : "Enter local workspace";

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative h-[100svh] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(24,78,63,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(190,176,134,0.11),transparent_28%),linear-gradient(180deg,#fbf8f1_0%,#f6f1e8_100%)] px-4 py-3 lg:px-7 lg:py-4">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.28)_48%,transparent_100%)] opacity-70" />
      <div className="absolute left-[-7rem] top-[18%] h-64 w-64 rounded-full border border-[rgba(29,107,87,0.1)]" />
      <div className="absolute right-[-5rem] top-[-2rem] h-56 w-56 rounded-full border border-[rgba(29,107,87,0.06)]" />

      <section className="relative mx-auto grid h-full w-full max-w-[84rem] gap-5 rounded-[40px] border border-[rgba(255,255,255,0.55)] bg-[linear-gradient(145deg,rgba(255,253,248,0.66),rgba(255,251,244,0.42))] p-5 shadow-[0_28px_90px_rgba(27,43,36,0.12)] backdrop-blur-xl lg:grid-cols-[1.16fr_0.84fr] lg:items-center lg:p-7">
        <div className="relative flex flex-col justify-center gap-5 overflow-hidden rounded-[32px] border border-[rgba(29,107,87,0.07)] bg-[linear-gradient(180deg,rgba(255,253,248,0.4),rgba(255,253,248,0.22))] p-6 lg:p-7">
          <div className="absolute inset-y-0 right-[-7rem] hidden w-56 rounded-full border border-[rgba(29,107,87,0.08)] lg:block" />
          <div className="absolute bottom-[-4rem] left-[62%] hidden h-56 w-56 -translate-x-1/2 rounded-full border border-[rgba(29,107,87,0.08)] lg:block" />

          <div className="relative h-16 w-60 max-w-full overflow-hidden">
            <Image
              src="/brands/SwishLogo.jpg"
              alt="Swish company logo"
              width={240}
              height={64}
              className="h-full w-auto object-contain object-left"
              priority
            />
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-[rgba(29,107,87,0.14)] bg-[rgba(255,255,255,0.62)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Compliance System
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-[var(--foreground)] sm:text-5xl lg:text-[4.3rem] lg:leading-[1.02]">
              Compliance with confidence. Operations with clarity.
            </h1>
            <p className="max-w-xl text-base leading-7 text-[var(--muted)] lg:text-lg">
              A focused internal system for policy control, audit execution, and operational accountability across the Swish organization.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-3 text-center sm:text-left">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(29,107,87,0.08)] text-[var(--accent)] sm:mx-0">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3 19 6V11C19 15.5 16 19.4 12 21 8 19.4 5 15.5 5 11V6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m9.5 11.8 1.7 1.7 3.4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">Govern with trust</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Policy assurance and role-based access to protect your organization.</p>
              </div>
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(29,107,87,0.08)] text-[var(--accent)] sm:mx-0">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 4H16L19 7V18A2 2 0 0 1 17 20H7A2 2 0 0 1 5 18V6A2 2 0 0 1 7 4H8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M9 16H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">Execute with confidence</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Structured workflows and audit readiness across every operating area.</p>
              </div>
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(29,107,87,0.08)] text-[var(--accent)] sm:mx-0">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 19H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M7 16V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 16V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M17 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">Operate with clarity</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Clean visibility into compliance progress, ownership, and accountability.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-[rgba(29,107,87,0.08)] bg-[rgba(255,255,255,0.44)] px-5 py-3.5">
            <p className="text-sm font-semibold text-[var(--accent)]">Enterprise-grade security. Built for accountability.</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Your data is protected with enterprise security standards and governed access controls.</p>
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[30rem] rounded-[34px] border border-[rgba(29,107,87,0.08)] bg-[linear-gradient(180deg,rgba(253,251,246,0.76),rgba(249,246,238,0.6))] p-6 shadow-[0_30px_80px_rgba(29,42,36,0.1)] backdrop-blur-xl sm:p-7">
            <div className="space-y-5">
              <div className="flex items-center justify-center">
                <div className="flex h-18 w-18 items-center justify-center rounded-full bg-[rgba(29,107,87,0.07)] p-4 ring-1 ring-[rgba(29,107,87,0.1)]">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]" aria-hidden="true">
                    <path d="M12 12A4 4 0 1 0 12 4A4 4 0 0 0 12 12Z" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M5 20C5.8 16.9 8.45 15 12 15C15.55 15 18.2 16.9 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              <div className="space-y-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Welcome</p>
                <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-[2.8rem] sm:leading-[1.02]">
                  Sign in to SWiSH Compliance System
                </h2>
                <div className="mx-auto h-1 w-12 rounded-full bg-[linear-gradient(90deg,var(--accent),rgba(29,107,87,0.2))]" />
                <p className="mx-auto max-w-md text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {isEntraMode
                    ? "Access compliance workflows, policies, and reports securely using your company Microsoft account."
                    : "Local developer mode is active. Continue using the configured workspace session."}
                </p>
              </div>

              {errorMessage ? (
                <div className="rounded-[22px] border border-[#dcc1a0] bg-[linear-gradient(180deg,#fff9f1_0%,#fff1e2_100%)] px-4 py-3 text-sm leading-6 text-[#7a5423]">
                  {errorMessage}
                </div>
              ) : null}

              <div className="space-y-4">
                {isEntraMode ? (
                  <MicrosoftSignInButton className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#0f8f57_0%,#166a4a_100%)] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(15,143,87,0.24)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_50px_rgba(15,143,87,0.28)] disabled:cursor-wait disabled:opacity-80" />
                ) : (
                  <Link
                    href="/dashboard"
                    prefetch={false}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f8f57_0%,#166a4a_100%)] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(15,143,87,0.24)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_50px_rgba(15,143,87,0.28)]"
                  >
                    {primaryLabel}
                  </Link>
                )}

                <div className="rounded-[22px] border border-[rgba(29,107,87,0.08)] bg-[rgba(244,248,242,0.56)] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[var(--accent)]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 2L4 6V11C4 16 7.4 20.4 12 22C16.6 20.4 20 16 20 11V6L12 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-sm leading-7 text-[var(--muted)]">Your Microsoft email must match a registered internal user before access is granted.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[rgba(29,42,36,0.08)] pt-5 text-center text-sm text-[var(--muted)]">
                Need help?{" "}
                <a href="mailto:m.alfadi@swishhh.net" className="font-semibold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
                  Contact Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
