"use client";

import { AVATARS } from "@/lib/avatars";

/** 12 sabit avatar; radyo grubu anlamında, klavyeyle de seçilebilir. */
export function AvatarPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (key: string) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Avatar seç" className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {AVATARS.map((a) => {
        const selected = a.key === value;
        return (
          <button
            key={a.key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={a.label}
            title={a.label}
            disabled={disabled}
            onClick={() => onChange(a.key)}
            className={`aspect-square rounded-2xl text-2xl flex items-center justify-center border transition disabled:opacity-60 ${
              selected
                ? "bg-rose-600/20 border-rose-500 ring-2 ring-rose-500/60"
                : "bg-[#070914] border-slate-800 hover:border-slate-600"
            }`}
          >
            <span aria-hidden="true">{a.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}
