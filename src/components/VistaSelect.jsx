import { Children, isValidElement, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import "./VistaSelect.css";

export default function VistaSelect({ children, value, onChange, disabled = false, id, name, className = "", style, placeholder, ...props }) {
  const generatedId = useId();
  const listId = `${generatedId}-options`;
  const trigger = useRef(null);
  const panel = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState(null);
  const options = Children.toArray(children).filter(child => isValidElement(child) && child.type === "option").map(child => ({
    value: String(child.props.value ?? child.props.children),
    label: child.props.children,
    disabled: Boolean(child.props.disabled),
  }));
  const selectedIndex = options.findIndex(option => option.value === String(value ?? ""));
  const selected = options[selectedIndex];
  const firstEnabled = options.findIndex(option => !option.disabled);
  const label = props["aria-label"] || (!id ? name?.replaceAll("_", " ") || placeholder || "Select an option" : undefined);

  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const bounds = trigger.current?.getBoundingClientRect();
      if (!bounds) return;
      const maxHeight = Math.max(100, Math.min(280, window.innerHeight - 24));
      const menuHeight = Math.min(maxHeight, options.length * 38 + 10);
      const above = window.innerHeight - bounds.bottom < menuHeight && bounds.top > window.innerHeight - bounds.bottom;
      setPlacement({
        left: Math.max(12, Math.min(bounds.left, window.innerWidth - bounds.width - 12)),
        top: above ? Math.max(12, bounds.top - menuHeight - 6) : bounds.bottom + 6,
        width: Math.min(bounds.width, window.innerWidth - 24),
        maxHeight,
      });
    };
    const onOutside = event => {
      if (!trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) setOpen(false);
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open, options.length]);

  useLayoutEffect(() => {
    if (open && placement) panel.current?.querySelector(`[id="${listId}-${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId, open, placement]);

  function choose(index) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange?.({ target: { name, value: option.value, type: "select-one" } });
    setOpen(false);
    trigger.current?.focus();
  }

  function move(current, direction) {
    if (!options.length) return current;
    for (let offset = 1; offset <= options.length; offset++) {
      const next = (current + direction * offset + options.length * 2) % options.length;
      if (!options[next].disabled) return next;
    }
    return current;
  }

  function onKeyDown(event) {
    if (disabled) return;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(current => move(open ? current : selectedIndex >= 0 ? selectedIndex : direction > 0 ? -1 : 0, direction));
      setOpen(true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? firstEnabled : options.findLastIndex(option => !option.disabled);
      if (next >= 0) setActiveIndex(next);
      setOpen(true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(activeIndex);
      else {
        setActiveIndex(selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : Math.max(firstEnabled, 0));
        setOpen(true);
      }
    } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      const matchingIndex = options.findIndex(option => !option.disabled && String(option.label).toLowerCase().startsWith(event.key.toLowerCase()));
      if (matchingIndex >= 0) {
        event.preventDefault();
        setActiveIndex(matchingIndex);
        setOpen(true);
      }
    }
  }

  return <>
    <button {...props} ref={trigger} id={id} type="button" disabled={disabled} role="combobox"
      aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
      aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
      className={`vista-select-trigger ${className}`} style={style}
      onKeyDown={onKeyDown}
      onClick={() => {
        if (open) setOpen(false);
        else {
          setActiveIndex(selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : Math.max(firstEnabled, 0));
          setOpen(true);
        }
      }}>
      <span className={`vista-select-value${!value ? " is-placeholder" : ""}`}>{selected?.label ?? placeholder ?? "Select an option"}</span>
      <ChevronDown size={17} className={`vista-select-chevron${open ? " is-open" : ""}`} aria-hidden="true" />
    </button>
    {open && placement && createPortal(<div ref={panel} id={listId} role="listbox" aria-label={label || "Options"}
      className="vista-select-panel" style={placement}>
      {options.map((option, index) => <button type="button" role="option" tabIndex={-1}
        id={`${listId}-${index}`} key={`${option.value}-${index}`} disabled={option.disabled}
        aria-selected={index === selectedIndex} data-active={index === activeIndex}
        className="vista-select-option" onMouseEnter={() => setActiveIndex(index)}
        onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}>
        <span>{option.label}</span>{index === selectedIndex && <Check size={16} aria-hidden="true" />}
      </button>)}
    </div>, document.body)}
  </>;
}
