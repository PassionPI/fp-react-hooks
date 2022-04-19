import { useState } from "react";
import { useFn } from "./useFn";

interface Either {
  <A extends unknown[], R>(fn: (...args: A) => R): <E = unknown>(
    ...args: A
  ) => Promise<[E, R extends Promise<infer U> ? U : R]>;
}

//* promise结果的二元错误处理。返回 -> [错误, 结果]
const either: Either = (fn) =>
  new Proxy(fn, {
    apply: (...args) =>
      new Promise((resolve) => resolve(Reflect.apply(...args))).then(
        (val) => [null, val] as const,
        (err) => [err, null] as const
      ),
  }) as any;

function useAsync<A extends unknown[], R, E = unknown>(
  fn: (...args: A) => Promise<R>
) {
  const [result, setResult] = useState<{
    data: R | undefined;
    error: E | null;
    loading: boolean;
  }>({
    data: undefined,
    error: null,
    loading: false,
  });

  const task = useFn(async (...args: A): Promise<[E, R]> => {
    setResult(({ data }) => ({
      data,
      error: null,
      loading: true,
    }));

    const [error, data] = await either(fn)<E>(...args);

    setResult({
      data,
      error,
      loading: false,
    });

    return [error, data];
  });

  return {
    task,
    ...result,
  };
}

export { useAsync };
