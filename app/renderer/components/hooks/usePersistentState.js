import { useState, useEffect, useRef } from 'react';

export function usePersistentState(
  key,
  defaultValue,
  {
    version = 'v1',
    debounce = 0
  } = {}
) {
  const storageKey = `${key}_${version}`;

  // 🔥 lazy init (runs once)
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return defaultValue;

      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  });

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (debounce > 0) {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(state));
        } catch {}
      }, debounce);

      return () => clearTimeout(timeoutRef.current);
    }

    // 🔥 immediate write (default)
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state, storageKey, debounce]);

  return [state, setState];
}