import { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnchoredPopover from "./AnchoredPopover";
import VistaSelect from "./VistaSelect";
import "./CalendarPopover.css";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function CalendarPopover({ value, onSelect, onClose, label = "Choose date", max, min, startYear = 1900, endYear = new Date().getFullYear() + 20, allowClear = false }) {
  const today = iso(new Date());
  const base = value || (max && today > max ? max : min && today < min ? min : today);
  const [view, setView] = useState(() => new Date(`${base}T00:00:00`));
  const [focusDate, setFocusDate] = useState(null);
  const panel = useRef(null);
  const allowed = date => (!min || date >= min) && (!max || date <= max);
  const first = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const minYear = Math.min(startYear, view.getFullYear());
  const maxYear = Math.max(endYear, view.getFullYear());
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  useLayoutEffect(() => {
    if (focusDate) panel.current?.querySelector(`[data-date="${focusDate}"]`)?.focus();
  }, [focusDate, view]);

  function navigateDay(event, date) {
    const directions = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(event.key in directions) && !["Home", "End", "PageUp", "PageDown"].includes(event.key)) return;
    event.preventDefault();
    const next = new Date(`${date}T00:00:00`);
    if (event.key === "PageUp" || event.key === "PageDown") {
      const day = next.getDate();
      next.setDate(1);
      next.setMonth(next.getMonth() + (event.key === "PageUp" ? -1 : 1));
      next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
    } else next.setDate(next.getDate() + (event.key === "Home" ? -next.getDay() : event.key === "End" ? 6 - next.getDay() : directions[event.key]));
    if (!allowed(iso(next))) return;
    setView(new Date(next.getFullYear(), next.getMonth(), 1));
    setFocusDate(iso(next));
  }

  return <AnchoredPopover ref={panel} onDismiss={onClose} role="dialog" aria-label={label}
    className="vista-calendar-popover" style={{ width: "304px", zIndex: "calc(var(--layer-popover) + 10)" }}>
    <p className="vista-calendar-title">{label}</p>
    <div className="vista-calendar-heading">
      <button data-ui="icon" type="button" aria-label="Previous month" onClick={() => setView(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ChevronLeft size={17} aria-hidden="true" /></button>
      <VistaSelect aria-label="Month" value={view.getMonth()} onChange={event => setView(date => new Date(date.getFullYear(), Number(event.target.value), 1))}>
        {MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
      </VistaSelect>
      <VistaSelect aria-label="Year" value={view.getFullYear()} onChange={event => setView(date => new Date(Number(event.target.value), date.getMonth(), 1))}>
        {years.map(year => <option key={year} value={year}>{year}</option>)}
      </VistaSelect>
      <button data-ui="icon" type="button" aria-label="Next month" onClick={() => setView(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ChevronRight size={17} aria-hidden="true" /></button>
    </div>
    <div className="vista-calendar-weekdays" aria-hidden="true">{WEEKDAYS.map(day => <span key={day}>{day}</span>)}</div>
    <div className="vista-calendar-days" role="group" aria-label={`${MONTHS[view.getMonth()]} ${view.getFullYear()}`}>
      {Array.from({ length: 42 }, (_, index) => {
        const day = index - first + 1;
        if (day < 1 || day > count) return <span key={index} />;
        const date = new Date(view.getFullYear(), view.getMonth(), day), dateIso = iso(date);
        return <button data-ui="toggle" key={dateIso} type="button" data-date={dateIso} disabled={!allowed(dateIso)}
          aria-label={date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          aria-pressed={dateIso === value} aria-current={dateIso === today ? "date" : undefined}
          onKeyDown={event => navigateDay(event, dateIso)} onClick={() => onSelect(dateIso)}>{day}</button>;
      })}
    </div>
    <div className="vista-calendar-footer">
      {allowClear && <button data-ui="tertiary" type="button" onClick={() => onSelect("")}>Clear date</button>}
      <button data-ui="tertiary" type="button" disabled={!allowed(today)} onClick={() => onSelect(today)}>Today</button>
      <button data-ui="tertiary" type="button" onClick={onClose}>Close</button>
    </div>
  </AnchoredPopover>;
}
