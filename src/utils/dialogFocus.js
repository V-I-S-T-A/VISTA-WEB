// Shared DOM behavior for existing modal surfaces, including nested dialogs.
const layers = [];
let previousOverflow = '';
const focusable = 'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';

export function registerDialog(root, { onDismiss, canDismiss = () => true, document: doc = document }) {
  const returnFocus = doc.activeElement;
  if (!layers.length) {
    previousOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';
  }
  const layer = { root };
  layers.push(layer);
  const controls = () => [...root.querySelectorAll(focusable)].filter(el => el.getClientRects().length && !el.closest('[inert]'));
  const focusFirst = () => (root.querySelector('[autofocus]') || controls()[0] || root).focus({ preventScroll: true });
  focusFirst();
  const keydown = event => {
    if (layers.at(-1) !== layer || event.defaultPrevented) return;
    const nativeDialog = event.target.closest?.('dialog[open]');
    // A parent layer must leave a nested native dialog alone. When the native
    // dialog itself is registered, keep Tab cycling inside it; its onCancel
    // still owns Escape and the caller's pending-operation guard.
    if (nativeDialog && nativeDialog !== root) return;
    if (event.key === 'Escape' && root.tagName === 'DIALOG') return;
    if (event.target.closest?.('.vista-anchored-popover')) return;
    // Comboboxes own Escape/Tab until their portaled options have closed.
    if (event.key === 'Escape' && doc.querySelector('.vista-select-panel')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (canDismiss()) onDismiss?.();
    } else if (event.key === 'Tab') {
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (!first) { event.preventDefault(); root.focus(); }
      else if (event.shiftKey && (doc.activeElement === first || !root.contains(doc.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (doc.activeElement === last || !root.contains(doc.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
  };
  doc.addEventListener('keydown', keydown);
  return () => {
    doc.removeEventListener('keydown', keydown);
    const index = layers.indexOf(layer);
    const wasTop = index === layers.length - 1;
    if (index >= 0) layers.splice(index, 1);
    if (!layers.length) doc.body.style.overflow = previousOverflow;
    if (wasTop && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  };
}
