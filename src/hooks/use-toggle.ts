import { useState, useCallback } from "react";

export function useToggle(initialValue = true) {
  const [isOpen, setIsOpen] = useState(initialValue);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  return { isOpen, toggle, open } as const;
}
