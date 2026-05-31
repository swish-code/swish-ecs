import { ProtectedAppShell } from "@/features/auth/protected-app-shell";
import { WorkflowBlueprint } from "@/features/home/workflow-blueprint";

export default function RouteMapPage() {
  return (
    <ProtectedAppShell>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[36px] border border-[rgba(29,42,36,0.08)] bg-[rgba(255,252,246,0.78)] p-8 shadow-[0_30px_100px_rgba(29,42,36,0.08)] backdrop-blur-xl lg:p-10">
          <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_center,rgba(29,107,87,0.12),transparent_62%)] lg:block" />
          <div className="relative space-y-5">
            <div className="inline-flex items-center rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              Route Map
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                Operating blueprint for the Swish compliance workspace.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--muted)] lg:text-lg">
                Use this view inside the application to review the intended workflow, system blocks, and rollout sequence while Phase 1 foundations are being completed.
              </p>
            </div>
          </div>
        </section>

        <WorkflowBlueprint />
      </div>
    </ProtectedAppShell>
  );
}