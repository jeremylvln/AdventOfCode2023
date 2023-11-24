import { day } from './lib';
import { arrayMax, arrayReverse } from './utils';

type GridArray = readonly (readonly number[])[];
type Grid = {
  readonly size: number;
  readonly array: GridArray;
  sliceRow: (row: number, from: number, to: number) => readonly number[];
  sliceColumn: (column: number, from: number, to: number) => readonly number[];
  innerPositions: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => readonly [number, number][];
};

const createGrid = (array: GridArray): Grid => {
  const size = array[0]!.length;

  const sliceRow = (row: number, from: number, to: number): readonly number[] =>
    array[row]!.slice(from, to);

  const sliceColumn = (
    column: number,
    from: number,
    to: number,
  ): readonly number[] => array.map((row) => row[column]!).slice(from, to);

  const innerPositions = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): readonly [number, number][] => {
    const positions: [number, number][] = [];

    for (let x = x1; x < x2; x += 1)
      for (let y = y1; y < y2; y += 1) positions.push([x, y]);

    return positions;
  };

  return {
    size,
    array,
    sliceRow,
    sliceColumn,
    innerPositions,
  };
};

const isPositionVisible = (grid: Grid, x: number, y: number): boolean => {
  const value = grid.array[y]![x]!;

  const maxTop = arrayMax(grid.sliceColumn(x, 0, y));
  const maxRight = arrayMax(grid.sliceRow(y, x + 1, grid.size));
  const maxBottom = arrayMax(grid.sliceColumn(x, y + 1, grid.size));
  const maxLeft = arrayMax(grid.sliceRow(y, 0, x));

  return [maxTop, maxRight, maxBottom, maxLeft].some((max) => max < value);
};

const getVisibleNumberForRow = (
  row: readonly number[],
  value: number,
): number => {
  if (row.length === 0) return 0;
  const trees = row.findIndex((v) => v >= value) + 1;
  return trees === 0 ? row.length : trees;
};

const getScenicScoreOfPosition = (grid: Grid, x: number, y: number): number => {
  const value = grid.array[y]![x]!;

  const visibleTop = getVisibleNumberForRow(
    arrayReverse(grid.sliceColumn(x, 0, y)),
    value,
  );
  const visibleRight = getVisibleNumberForRow(
    grid.sliceRow(y, x + 1, grid.size),
    value,
  );
  const visibleBottom = getVisibleNumberForRow(
    grid.sliceColumn(x, y + 1, grid.size),
    value,
  );
  const visibleLeft = getVisibleNumberForRow(
    arrayReverse(grid.sliceRow(y, 0, x)),
    value,
  );

  return visibleTop * visibleRight * visibleBottom * visibleLeft;
};

day(8, (input, part) => {
  const grid = createGrid(input.map((line) => line.split('').map(Number)));

  part(1, () => {
    const outer = (grid.size + grid.size - 2) * 2;
    const inner = grid
      .innerPositions(1, 1, grid.size - 1, grid.size - 1)
      .map(([x, y]) => isPositionVisible(grid, x, y))
      .filter((visible) => visible).length;

    return outer + inner;
  });

  part(2, () =>
    arrayMax(
      grid
        .innerPositions(1, 1, grid.size - 1, grid.size - 1)
        .map(([x, y]) => getScenicScoreOfPosition(grid, x, y)),
    ),
  );
});
