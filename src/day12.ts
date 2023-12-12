import { Option } from '@swan-io/boxed';

import { day } from './lib.js';
import { sum } from './utils.js';

type RowChar = '.' | '#' | '?';
type Row = {
  chars: RowChar[];
  matches: number[];
};

const findNextFit = (
  chars: readonly RowChar[],
  delta: number,
  length: number,
): Option<number> => {
  for (let index = delta; index < chars.length - length + 1; index += 1) {
    // If the previous char is a #, we can't fit here
    if (index - 1 > 0 && chars[index - 1] === '#') {
      continue;
    }

    // If the next char is a #, we can't fit here
    if (index + length < chars.length && chars[index + length] === '#') {
      continue;
    }

    const slice = chars.slice(index, index + length);
    if (slice.every((c) => c === '#' || c === '?')) {
      return Option.Some(index);
    }
  }

  return Option.None();
};

const findAllMatches = (knownMatches: Set<string>, max: number) => {
  const inner = (
    chars: readonly RowChar[],
    delta: number,
    matchesRest: number[],
  ) => {
    const matchToFit = matchesRest[0]!;
    const maybeNextFit = findNextFit(chars, delta, matchToFit);

    // If we don't found a match, the suffix is impossible, we're done
    if (maybeNextFit.isNone()) {
      return;
    }

    const nextFit = maybeNextFit.value;
    const endFit = nextFit + matchToFit;

    const patchedChars = [...chars];
    for (let index = nextFit; index < endFit; index += 1) {
      patchedChars[index] = '#';
    }

    if (matchesRest.length === 1) {
      if (patchedChars.filter((c) => c === '#').length === max) {
        knownMatches.add(patchedChars.join(''));
      }

      return;
    }

    for (let nextStart = endFit + 1; nextStart < chars.length; nextStart += 1) {
      if (chars[nextStart] === '.') {
        continue;
      }

      inner(patchedChars, nextStart, matchesRest.slice(1));
    }

    return knownMatches;
  };

  return inner;
};

const countRowPossibilities = (row: Row): number => {
  const knownMatches = new Set<string>();
  const max = sum(row.matches);

  for (let index = 0; index < row.chars.length; index += 1) {
    findAllMatches(knownMatches, max)(row.chars, index, row.matches);
  }

  return knownMatches.size;
};

// const expandRow = (row: Row, factor: number): Row => {
//   const charsCopies = Array.from({ length: factor }, () => row.chars);
//   const matchesCopies = Array.from({ length: factor }, () => row.matches);

//   const charsAccumulator: RowChar[] = [];
//   for (const copy of charsCopies) {
//     charsAccumulator.push(...copy, '?');
//   }
//   charsAccumulator.pop();

//   const matchesAccumulator: number[] = [];
//   for (const copy of matchesCopies) {
//     matchesAccumulator.push(...copy);
//   }

//   return { chars: charsAccumulator, matches: matchesAccumulator };
// };

const parseRows = (lines: readonly string[]): Row[] =>
  lines.map((line) => {
    const [charsRaw, matchesRaw] = line.split(' ') as [string, string];
    return {
      chars: [...charsRaw] as RowChar[],
      matches: matchesRaw.split(',').map((s) => Number.parseInt(s)),
    };
  });

day(12, (input, part) => {
  const rows = parseRows(input);

  part(1, () => sum(rows.map((row) => countRowPossibilities(row))));

  // part(2, () =>
  //   sum(rows.map((row) => countRowPossibilities(expandRow(row, 5)))),
  // );
});
