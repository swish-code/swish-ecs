"use client";

import { useState } from "react";

type ScopeOption = {
  id: number;
  name: string;
};

type UserScopeSelectorProps = {
  defaultLabel: string;
  defaultName: string;
  defaultValue: string;
  defaultEmptyLabel: string;
  createLabel: string;
  createName: string;
  createPlaceholder: string;
  accessLabel: string;
  allName: string;
  allLabel: string;
  itemName: string;
  selectedIds: number[];
  allSelected: boolean;
  options: ScopeOption[];
  columnsClassName?: string;
};

export function UserScopeSelector({
  defaultLabel,
  defaultName,
  defaultValue,
  defaultEmptyLabel,
  createLabel,
  createName,
  createPlaceholder,
  accessLabel,
  allName,
  allLabel,
  itemName,
  selectedIds,
  allSelected,
  options,
  columnsClassName = "sm:grid-cols-2",
}: UserScopeSelectorProps) {
  const [isAllSelected, setIsAllSelected] = useState(allSelected);

  return (
    <div className="grid gap-3 text-sm">
      <label className="grid gap-2">
        <span className="font-medium text-[var(--foreground)]">{defaultLabel}</span>
        <select
          name={defaultName}
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          defaultValue={defaultValue}
        >
          <option value="">{defaultEmptyLabel}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">{createLabel}</span>
        <input
          name={createName}
          placeholder={createPlaceholder}
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <fieldset className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
        <legend className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">{accessLabel}</legend>
        <label className="mb-3 flex items-center gap-3 rounded-2xl border border-[var(--line)]/70 bg-[var(--surface)] px-4 py-3 text-sm">
          <input
            type="checkbox"
            name={allName}
            value="true"
            defaultChecked={allSelected}
            onChange={(event) => setIsAllSelected(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="font-medium text-[var(--foreground)]">{allLabel}</span>
        </label>

        <div className={`grid gap-3 ${columnsClassName}`}>
          {options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 rounded-2xl border border-[var(--line)]/70 px-4 py-3 text-sm transition ${
                isAllSelected ? "cursor-not-allowed bg-[rgba(240,236,224,0.7)] opacity-60" : "bg-[var(--surface)]"
              }`}
            >
              <input
                type="checkbox"
                name={itemName}
                value={option.id}
                defaultChecked={selectedIds.includes(option.id)}
                disabled={isAllSelected}
                className="h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="font-medium text-[var(--foreground)]">{option.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}