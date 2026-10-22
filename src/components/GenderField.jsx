import { useId, useState } from "react";
import { ChevronDown, UserRound } from "lucide-react";

import "./ProfileFields.css";

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
    <div className="profile-field">
      <label htmlFor={id} className="profile-field-label">
        Gender <span>Optional</span>
      </label>
      <div className="profile-field-control">
        <UserRound size={17} className="profile-field-icon profile-gender-icon" aria-hidden="true" />
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
          className="profile-gender-select"
        >
          <option value="">Select gender</option>
          {OPTIONS.map(([option, label]) => <option key={option} value={option}>{label}</option>)}
          <option value="self-describe">Let me describe</option>
        </select>
        <ChevronDown size={16} className="profile-gender-chevron" aria-hidden="true" />
      </div>
      {custom && (
        <div className="profile-self-description">
          <label htmlFor={`${id}-custom`} className="profile-field-label">Your gender, in your words</label>
          <div className="profile-field-control">
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
              className="profile-field-input"
            />
          </div>
        </div>
      )}
      <p id={`${id}-help`} className="profile-field-help">Choose what fits you, describe it in your own words, or leave this blank.</p>
    </div>
  );
}
