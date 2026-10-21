import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

const OPTIONS = [
  ["Female", "Woman"],
  ["Male", "Man"],
  ["Non-binary", "Non-binary"],
  ["Agender", "Agender"],
  ["Genderfluid", "Genderfluid"],
  ["Prefer not to say", "Prefer not to say"],
];

export default function GenderField({ value, onChange, disabled = false }) {
  const id = useId();
  const [selfDescribe, setSelfDescribe] = useState(false);
  const knownValue = OPTIONS.some(([option]) => option === value);
  const custom = selfDescribe || (!knownValue && Boolean(value));

  return (
    <div className="min-w-0 font-inter">
      <label htmlFor={id} className="mb-1.5 block px-2 text-xs font-semibold text-white">
        Gender <span className="font-normal text-white/80">(optional)</span>
      </label>
      <div className="relative">
        <select
          id={id}
          value={custom ? "self-describe" : value}
          disabled={disabled}
          aria-describedby={`${id}-help`}
          onChange={(event) => {
            const selected = event.target.value;
            setSelfDescribe(selected === "self-describe");
            onChange(selected === "self-describe" ? "" : selected);
          }}
          className="h-[46px] w-full appearance-none rounded-full border-0 bg-white py-0 pl-5 pr-10 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:opacity-60"
        >
          <option value="">Select gender</option>
          {OPTIONS.map(([option, label]) => <option key={option} value={option}>{label}</option>)}
          <option value="self-describe">Let me describe</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-[#1f5cae]" aria-hidden="true" />
      </div>
      {custom && (
        <div className="mt-2">
          <label htmlFor={`${id}-custom`} className="mb-1 block px-2 text-xs text-white">Your gender, in your words</label>
          <input
            id={`${id}-custom`}
            type="text"
            value={value}
            onChange={(event) => {
              setSelfDescribe(true);
              onChange(event.target.value);
            }}
            disabled={disabled}
            maxLength={100}
            placeholder="Describe your gender"
            className="h-[46px] w-full rounded-full border-0 bg-white px-5 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
          />
        </div>
      )}
      <p id={`${id}-help`} className="mt-1.5 px-2 text-xs leading-relaxed text-white/85">Share only what feels right for you.</p>
    </div>
  );
}
