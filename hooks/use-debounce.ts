import { useState, useEffect, useCallback, useRef } from "react";

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottleCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const lastRan = useRef(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      if (now - lastRan.current >= delay) {
        callbackRef.current(...args);
        lastRan.current = now;
      }
    },
    [delay],
  );
}
