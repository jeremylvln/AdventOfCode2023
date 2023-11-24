import { day } from './lib';

type Range = [number, number];
type RangePair = [Range, Range];

const doesRangePairOverlapStrict = ([first, second]: RangePair): boolean => {
  if (first[0] <= second[0] && first[1] >= second[1]) return true;
  return second[0] <= first[0] && second[1] >= first[1];
};

const doesRangePairOverlapLax = ([first, second]: RangePair): boolean => {
  if (first[0] <= second[0] && first[1] >= second[0]) return true;
  return second[0] <= first[0] && second[1] >= first[0];
};

day(4, (input, part) => {
  const rangePairs = input.map(
    (line) =>
      line
        .split(',')
        .map((range) => range.split('-').map(Number) as Range) as RangePair,
  );

  part(1, () => rangePairs.filter(doesRangePairOverlapStrict).length);
  part(2, () => rangePairs.filter(doesRangePairOverlapLax).length);
});
