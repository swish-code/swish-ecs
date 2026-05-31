const workflowSteps = [
  {
    title: "1. Draft SOP",
    detail: "Business Excellence creates the SOP, assigns brand and scope, and stores the working file metadata.",
    chips: ["UI form", "Snowflake save", "Draft status"],
  },
  {
    title: "2. Submit For Review",
    detail: "The owner submits the SOP once the controlled file is attached and ready for approval.",
    chips: ["Validation check", "Submission timestamp", "Email trigger"],
  },
  {
    title: "3. Manager Approval",
    detail: "Approver reviews the SOP, adds remarks, and either approves or rejects it in the workflow panel.",
    chips: ["Approve / Reject", "Remarks", "Audit trail"],
  },
  {
    title: "4. Activate And Assign",
    detail: "Approved SOPs become active and are assigned to the relevant brand, department, and location teams.",
    chips: ["Active date", "Assignments", "Notification"],
  },
  {
    title: "5. Implementation Tracking",
    detail: "Departments confirm rollout, upload evidence, and track implementation progress against due dates.",
    chips: ["Evidence files", "Progress status", "Reminder email"],
  },
  {
    title: "6. Audit And CAPA",
    detail: "Audits validate implementation and open corrective actions when gaps are found.",
    chips: ["Audit scores", "CAPA", "Escalation"],
  },
  {
    title: "7. KPI Dashboard",
    detail: "Snowflake views summarize SOP status, overdue actions, implementation, and KPI performance.",
    chips: ["Dashboard", "Reports", "Manager visibility"],
  },
];

const interactions = [
  "User action -> Next.js server action -> service validation -> Snowflake save",
  "Status change -> workflow metadata update -> revalidation of UI",
  "Submission / approval / due-date event -> Outlook email trigger",
  "Active SOP -> assignment rollout -> evidence upload -> audit readiness",
  "Audit findings -> corrective actions -> KPI and dashboard reporting",
];

export function WorkflowBlueprint() {
  return (
    <section className="rounded-[32px] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_20px_80px_rgba(29,42,36,0.08)] lg:p-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">System Blueprint</p>
        <h2 className="text-3xl font-semibold tracking-tight">Manager-ready workflow for the compliance system</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          This shows the end-to-end operating flow we are building, including core user actions, database updates,
          approval movement, email notifications, evidence handling, audits, and reporting outputs.
        </p>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-4">
        {workflowSteps.map((step, index) => (
          <div key={step.title} className="relative rounded-[26px] border border-[var(--line)] bg-white p-5 shadow-[0_10px_30px_rgba(29,42,36,0.05)] xl:min-h-[230px]">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{step.title}</h3>
              <p className="text-sm leading-7 text-[var(--muted)]">{step.detail}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {step.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]"
                >
                  {chip}
                </span>
              ))}
            </div>
            {index < workflowSteps.length - 1 ? (
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)] xl:absolute xl:-right-3 xl:top-1/2 xl:mt-0 xl:-translate-y-1/2 xl:rounded-full xl:bg-[var(--background)] xl:px-2">
                -&gt;
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] bg-[#1f2d28] p-6 text-white">
          <p className="text-sm uppercase tracking-[0.18em] text-white/60">Interaction Map</p>
          <div className="mt-5 space-y-3">
            {interactions.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white/90">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">Core System Blocks</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)]">
            <div className="rounded-2xl bg-white px-4 py-3">Web UI {"->"} forms, register, approval panel, dashboard.</div>
            <div className="rounded-2xl bg-white px-4 py-3">Server actions {"->"} validation, business rules, workflow transitions.</div>
            <div className="rounded-2xl bg-white px-4 py-3">Snowflake {"->"} master data, SOPs, assignments, audits, CAPA, KPIs, reporting views.</div>
            <div className="rounded-2xl bg-white px-4 py-3">Outlook {"->"} notification triggers for submission, approval, reminders, escalations.</div>
            <div className="rounded-2xl bg-white px-4 py-3">SharePoint {"->"} controlled document storage and evidence files once IT shares credentials.</div>
          </div>
        </div>
      </div>
    </section>
  );
}