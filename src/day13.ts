import { day } from './lib';
import { chunkArray } from './utils';

type Value = number | Value[];
type Tristate = true | false | null;

const FIRST_DIVIDER_RAW = '[[2]]';
const SECOND_DIVIDER_RAW = '[[6]]';

// eslint-disable-next-line sonarjs/cognitive-complexity
const sortComparator = (left: Value, right: Value): number => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  } else if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
      if (i === left.length) return -1;
      else if (i === right.length) return 1;
      const outcome = sortComparator(left[i]!, right[i]!);
      if (outcome !== 0) return outcome;
    }

    return 0;
  } else {
    return sortComparator(
      Array.isArray(left) ? left : [left],
      Array.isArray(right) ? right : [right],
    );
  }
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const comparePair = (left: Value, right: Value): Tristate => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left < right ? true : left > right ? false : null;
  } else if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
      if (i === left.length) return true;
      else if (i === right.length) return false;
      const outcome = comparePair(left[i]!, right[i]!);
      if (outcome !== null) return outcome;
    }

    return null;
  } else {
    return comparePair(
      Array.isArray(left) ? left : [left],
      Array.isArray(right) ? right : [right],
    );
  }
};

const parsePackets = (input: readonly string[]): readonly Value[] =>
  input.filter((line) => line !== '').map((line) => JSON.parse(line) as Value);

day(13, (input, part) => {
  const packets = parsePackets(input);
  const packetsWithDividers = [
    ...packets,
    JSON.parse(FIRST_DIVIDER_RAW) as Value,
    JSON.parse(SECOND_DIVIDER_RAW) as Value,
  ];

  part(1, () =>
    chunkArray(packets, 2)
      .map((pair) => pair as [Value[], Value[]])
      .map(([left, right]) => comparePair(left, right))
      .reduce((acc, outcome, i) => acc + (outcome === true ? i + 1 : 0), 0),
  );

  part(2, () => {
    const sortedPackets = packetsWithDividers.sort(sortComparator);
    const sortedPacketsStr = sortedPackets.map((packet) =>
      JSON.stringify(packet),
    );
    const firstDividerIndex =
      sortedPacketsStr.findIndex((value) => value === FIRST_DIVIDER_RAW) + 1;
    const secondDividerIndex =
      sortedPacketsStr.findIndex((value) => value === SECOND_DIVIDER_RAW) + 1;
    return firstDividerIndex * secondDividerIndex;
  });
});
