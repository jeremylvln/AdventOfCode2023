export type Readonly2DArray<T> = readonly (readonly T[])[];

export const impossible = (): never => {
  throw new Error('Impossible');
};

export const chunkArray = <T>(
  array: readonly T[],
  size: number,
): readonly T[][] =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );

export const arrayMax = (array: readonly number[]): number =>
  array.reduce((prev, nb) => (nb > prev ? nb : prev), -Number.MAX_SAFE_INTEGER);

export const arrayMin = (array: readonly number[]): number =>
  array.reduce((prev, nb) => (nb < prev ? nb : prev), Number.MAX_SAFE_INTEGER);

export const arrayReverse = <T>(array: readonly T[]): readonly T[] =>
  Array.from({ length: array.length }, (_, i) => array[array.length - 1 - i]!);

export const memoize = <I extends string | number | symbol, O>(
  fn: (input: I) => O,
) => {
  const cache: Partial<Record<I, O>> = {};

  return (input: I) => {
    if (input in cache) {
      return cache[input];
    } else {
      const output = fn(input);
      cache[input] = output;
      return output;
    }
  };
};
