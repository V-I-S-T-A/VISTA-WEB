import VistaSelect from "./VistaSelect";
import { useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const initialDate = selectedDate && selectedDate <= new Date() ? selectedDate : new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatDate(value));
  const [error, setError] = useState("");
  const [viewDate, setViewDate] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1919 }, (_, index) => currentYear - index);
  }, []);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
      index < firstWeekday ? null : index - firstWeekday + 1,
    );
  }, [viewDate]);

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

  function selectDate(day) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const selected = new Date(year, month, day);
    if (selected > new Date()) return;

    const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(isoDate);
    inputRef.current?.setCustomValidity("");
    setInputValue(formatDate(isoDate));
    setError("");
    setIsOpen(false);
  }

  const today = new Date();
  const selectedIso = value;

  return (
    <div className="relative">
      <div className="flex items-center rounded-full bg-white" style={{ height: "46px" }}>
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
          disabled={disabled}
          className="min-w-0 flex-1 rounded-l-full bg-transparent font-inter text-[14px] text-gray-900 placeholder:text-gray-400 outline-none disabled:cursor-not-allowed"
          style={{ height: "46px", padding: "0 0 0 20px" }}
        />
        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              const baseDate = selectedDate && selectedDate <= today ? selectedDate : today;
              setViewDate(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
            }
            setIsOpen((open) => !open);
          }}
          disabled={disabled}
          aria-label="Choose birth date from calendar"
          aria-expanded={isOpen}
          className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1f5cae] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <p id="birth-date-error" className="absolute left-2 top-full mt-1 text-xs text-red-100">
          {error}
        </p>
      )}

      {isOpen && (
        <div
          className="absolute left-0 z-20 mt-2 w-[290px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
          role="dialog"
          aria-label="Birth date calendar"
        >
          <div className="mb-3 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
              aria-label="Previous month"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <VistaSelect
              value={viewDate.getMonth()}
              onChange={(event) => setViewDate((date) => new Date(date.getFullYear(), Number(event.target.value), 1))}
              aria-label="Month"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#1f5cae]"
            >
              {MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
            </VistaSelect>
            <VistaSelect
              value={viewDate.getFullYear()}
              onChange={(event) => setViewDate((date) => new Date(Number(event.target.value), date.getMonth(), 1))}
              aria-label="Year"
              className="w-[76px] rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#1f5cae]"
            >
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </VistaSelect>
            <button
              type="button"
              onClick={() => setViewDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
              aria-label="Next month"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">
            {WEEKDAYS.map((day) => <span key={day} className="py-1">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const isoDate = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const futureDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day) > today;
              const isSelected = isoDate === selectedIso;
              return (
                <button
                  key={isoDate}
                  type="button"
                  onClick={() => selectDate(day)}
                  disabled={futureDate}
                  aria-label={new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                  className={`h-8 rounded-lg text-sm transition ${isSelected ? "bg-[#1f5cae] font-bold text-white" : "text-gray-700 hover:bg-blue-50"} disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
