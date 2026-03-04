import { useState, useCallback } from "react";

export function useToggle(initialValue = true) {
  const [isOpen, setIsOpen] = useState(initialValue);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  return { isOpen, toggle } as const;
}
