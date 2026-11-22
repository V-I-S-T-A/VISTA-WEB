import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Retains the caller's opening/closing and selection handlers. Geometry is
// measured from its existing trigger; rendering in body avoids card clipping.
export default function AnchoredPopover({ children, ref: externalRef, className = '', style = {}, onDismiss, ...props }) {
  const marker = useRef(null);
  const panel = useRef(null);
  const dismiss = useRef(onDismiss);
  useEffect(() => { dismiss.current = onDismiss; }, [onDismiss]);
  useLayoutEffect(() => {
    const anchor = marker.current?.parentElement;
    const element = panel.current;
    if (!anchor || !element) return;
    const trigger = anchor.querySelector('button') || anchor;
    const position = () => {
      const box = trigger.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) { dismiss.current?.(); return; }
      const width = Math.min(Number.parseFloat(style.width) || 288, window.innerWidth - 24);
      const below = window.innerHeight - box.bottom - 18;
      const above = box.top - 18;
      const up = below < Math.min(element.scrollHeight, 320) && above > below;
      const height = Math.max(48, Math.min(window.innerHeight - 24, up ? above : below));
      Object.assign(element.style, {
        position: 'fixed', width: `${width}px`, maxWidth: 'calc(100vw - 24px)',
        maxHeight: `${height}px`, overflowY: 'auto', marginTop: '0',
        left: `${Math.max(12, Math.min(box.right - width, window.innerWidth - width - 12))}px`,
        top: up ? 'auto' : `${box.bottom + 6}px`,
        bottom: up ? `${window.innerHeight - box.top + 6}px` : 'auto',
        right: 'auto', visibility: 'visible', zIndex: style.zIndex ?? 'var(--layer-popover)',
      });
    };
    const escape = event => {
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('.vista-select-panel')) return;
      if (element.contains(event.target) || anchor.contains(event.target)) {
        event.preventDefault(); event.stopImmediatePropagation();
        dismiss.current?.(); trigger.focus();
      }
    };
    const outside = event => {
      if (!element.contains(event.target) && !anchor.contains(event.target) && !event.target.closest('.vista-select-panel,.vista-calendar-popover')) dismiss.current?.();
    };
    position();
    (element.querySelector('input[aria-autocomplete],button:not(:disabled),input:not(:disabled),[tabindex="0"]'))?.focus({ preventScroll: true });
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', outside);
      if (element.contains(document.activeElement) && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [style.width, style.zIndex]);
  return <><span hidden ref={marker} />{createPortal(<div {...props}
    ref={element => {
      panel.current = element;
      if (typeof externalRef === 'function') externalRef(element);
      else if (externalRef) externalRef.current = element;
    }} className={`vista-anchored-popover ${className}`} style={{ ...style, position: 'fixed', visibility: 'hidden' }}>
    {children}
  </div>, document.body)}</>;
}
