import CalendarPopover from "./CalendarPopover";
import { useRef, useState } from "react";
import { CalendarDays } from "lucide-react";

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${month}/${day}/${year}` : "";
}

function parseDate(value) {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const [, month, day, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date > new Date()
  ) {
    return null;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export default function DateOfBirthField({ value, onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatDate(value));
  const [error, setError] = useState("");
  function commitInput() {
    if (!inputValue.trim()) {
      onChange("");
      setError("");
      return;
    }

    const parsed = parseDate(inputValue);
    if (!parsed) {
      setError("Use a valid date in MM/DD/YYYY format.");
      return;
    }

    onChange(parsed);
    setInputValue(formatDate(parsed));
    setError("");
  }

  function selectDate(isoDate) {
    onChange(isoDate);
    inputRef.current?.setCustomValidity("");
    setInputValue(formatDate(isoDate));
    setError("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  const today = new Date();

  return (
    <div className="relative">
      <div className="vista-birth-date flex items-center bg-white" style={{ height: "46px" }}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setError("");
            const text = event.target.value.trim();
            event.target.setCustomValidity(
              text && !parseDate(text) ? "Use a valid birth date in MM/DD/YYYY format." : "",
            );
          }}
          onBlur={commitInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitInput();
            }
          }}
          placeholder="Birth date (MM/DD/YYYY)"
          aria-label="Birth date"
          aria-describedby={error ? "birth-date-error" : undefined}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          className="min-w-0 flex-1 rounded-l-full bg-transparent font-inter text-[14px] text-gray-900 placeholder:text-gray-400 outline-none disabled:cursor-not-allowed"
          style={{ height: "46px", padding: "0 0 0 20px" }}
        />
        <button data-ui="icon"
          type="button"
          onClick={() => setIsOpen(open => !open)}
          disabled={disabled}
          aria-label="Choose birth date from calendar"
          aria-expanded={isOpen}
          className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1f5cae] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <p id="birth-date-error" role="alert" className="mt-1 text-xs" style={{ color: "var(--ui-danger)", marginTop: "6px" }}>
          {error}
        </p>
      )}

      {isOpen && <CalendarPopover label="Birth date calendar" value={value} max={`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`} startYear={1920} endYear={today.getFullYear()} onSelect={selectDate} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
