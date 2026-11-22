import { cloneElement, isValidElement, useId } from 'react';

// Keeps the existing controlled field and validation rules; connects its visible
// label and error to the actual input, including custom select triggers.
export default function FormField({ label, error, children, htmlFor, labelStyle, errorStyle }) {
  const generated = useId();
  const child = isValidElement(children) ? children : null;
  const id = htmlFor || child?.props.id || `field-${generated}`;
  const errorId = `${id}-error`;
  const descriptions = [child?.props['aria-describedby'], error ? errorId : ''].filter(Boolean).join(' ');
  return <div className="vista-form-field">
    <label htmlFor={id} style={labelStyle}>{label}</label>
    {child ? cloneElement(child, { id, 'aria-invalid': Boolean(error), 'aria-describedby': descriptions || undefined }) : children}
    {error && <p id={errorId} role="alert" style={errorStyle}>{error}</p>}
  </div>;
}
