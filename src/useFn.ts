import { useCallback, useRef } from "react";

export function useFn<A extends unknown[], R>(
  fn: (...args: A) => R
): (...args: A) => R {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback((...args) => fnRef.current(...args), []);
}
