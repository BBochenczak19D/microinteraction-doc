import { useState } from 'react';

/** Wartość sterowana z zewnątrz albo trzymana w środku — jak w Select i MenuButton. */
export function useControllable<T>(controlled: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = useState(initial);
  const value = controlled !== undefined ? controlled : uncontrolled;
  const setValue = (next: T) => {
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
  };
  return [value, setValue] as const;
}
