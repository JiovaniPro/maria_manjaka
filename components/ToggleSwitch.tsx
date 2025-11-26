"use client";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      {label && <span className="text-sm font-semibold text-black">{label}</span>}
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-all duration-200 ${
          checked ? "bg-emerald-500" : "bg-black/20"
        }`}
      >
        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </div>
      <span className={`text-sm font-medium ${checked ? "text-emerald-600" : "text-black/40"}`}>
        {checked ? "Actif" : "Inactif"}
      </span>
    </label>
  );
}