import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { registerDialog } from '../utils/dialogFocus';

// Presentation wrapper only. Existing callers retain validation, save handlers,
// pending guards and the decision whether backdrop dismissal is permitted.
export default function DialogLayer({ children, label, onDismiss, dismissDisabled = false,
  className = '', style, ref: externalRef, ...props }) {
  const root = useRef(null);
  const callbacks = useRef({ onDismiss, dismissDisabled });
  useEffect(() => { callbacks.current = { onDismiss, dismissDisabled }; }, [onDismiss, dismissDisabled]);
  useEffect(() => registerDialog(root.current, {
    onDismiss: () => callbacks.current.onDismiss?.(),
    canDismiss: () => !callbacks.current.dismissDisabled,
  }), []);

  return createPortal(<div {...props} ref={element => {
    root.current = element;
    if (typeof externalRef === 'function') externalRef(element);
    else if (externalRef) externalRef.current = element;
  }} className={`vista-dialog-layer ${className}`} role="dialog" aria-modal="true"
    aria-label={props['aria-labelledby'] ? undefined : label} tabIndex={-1}
    style={{ ...style, zIndex: 'var(--layer-dialog)' }}>
    {children}
  </div>, document.body);
}
