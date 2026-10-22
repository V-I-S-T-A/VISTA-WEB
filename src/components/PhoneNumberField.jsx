import { useId } from "react";
import { formatPhoneNumber } from "../utils/phoneNumber";
import "./ProfileFields.css";

export default function PhoneNumberField({ value, onChange, disabled = false }) {
  const id = useId();
  return (
    <div className="profile-field">
      <label htmlFor={id} className="profile-field-label">Mobile number <span>Optional</span></label>
      <div className="profile-field-control">
        <span className="profile-phone-prefix"><small>PH</small> +63</span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={formatPhoneNumber(value)}
          onChange={(event) => {
            event.target.setCustomValidity("");
            onChange(formatPhoneNumber(event.target.value));
          }}
          onInvalid={(event) => event.target.setCustomValidity("Enter 10 digits starting with 9, like 912-345-6789.")}
          pattern="9[0-9]{2}-[0-9]{3}-[0-9]{4}"
          title="10 digits starting with 9, like 912-345-6789"
          placeholder="9XX-XXX-XXXX"
          aria-describedby={`${id}-help`}
          disabled={disabled}
          className="profile-field-input"
        />
      </div>
      <p id={`${id}-help`} className="profile-field-help">Enter <strong>10 digits</strong> after +63, e.g. <strong>912-345-6789</strong>. You can also paste a number starting with 09 or +63.</p>
    </div>
  );
}
