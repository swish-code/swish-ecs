type MasterRecordFormProps = {
  title: string;
  description: string;
  codeLabel: string;
  nameLabel: string;
  codeName: string;
  nameName: string;
  action: (formData: FormData) => Promise<void>;
};

export function MasterRecordForm({
  title,
  description,
  codeLabel,
  nameLabel,
  codeName,
  nameName,
  action,
}: MasterRecordFormProps) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(29,42,36,0.06)]">
      <div className="mb-5 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="grid gap-4 md:grid-cols-[0.9fr_1.4fr_auto] md:items-end">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--foreground)]">{codeLabel}</span>
          <input
            name={codeName}
            required
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--foreground)]">{nameLabel}</span>
          <input
            name={nameName}
            required
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-strong)]"
        >
          Save
        </button>
      </form>
    </section>
  );
}
