export type Predicate<T> = (input: T) => boolean;
export type Readonly2DArray<T> = readonly (readonly T[])[];

export const impossible = (): never => {
  throw new Error('Impossible');
};

export const chunkArray = <T>(
  array: readonly T[],
  size: number,
): readonly T[][] =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, index * size + size),
  );

export const arrayReverse = <T>(array: readonly T[]): readonly T[] =>
  Array.from(
    { length: array.length },
    (_, index) => array[array.length - 1 - index]!,
  );

export const memoize = <I extends string | number | symbol, O>(
  function_: (input: I) => O,
) => {
  const cache: Partial<Record<I, O>> = {};

  return (input: I) => {
    if (input in cache) {
      return cache[input];
    } else {
      const output = function_(input);
      cache[input] = output;
      return output;
    }
  };
};

export class AABB {
  constructor(
    readonly minX: number,
    readonly minY: number,
    readonly maxX: number,
    readonly maxY: number,
  ) {}

  readonly doesCollideWith = (other: AABB): boolean =>
    this.minX <= other.maxX &&
    this.maxX >= other.minX &&
    this.minY <= other.maxY &&
    this.maxY >= other.minY;
}

export const createPipeline =
  <T>(functions: readonly ((input: T) => T)[]) =>
  (input: T): T =>
    functions.reduce(
      (previous, mappingFunction) => mappingFunction(previous),
      input,
    );

export const lcm = (a: number, b: number): number => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  return (a * b) / gcd(a, b);
};

export const lcmOfArray = (array: readonly number[]): number =>
  array.reduce((previous, current) => lcm(previous, current), 1);
