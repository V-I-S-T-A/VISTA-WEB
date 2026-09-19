import { useState, useCallback } from "react";

/**
 * Encapsulates the open/close state for the mobile sidebar drawer.
 * Returns props to spread onto <Sidebar> and <Header> respectively.
 */
export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return { isOpen, open, close, toggle };
}
