import { day } from './lib';
import { arrayMax, arrayMin } from './utils';

type Point = [x: number, y: number];
type RockWall = readonly Point[];

type GridArray = ('.' | '#' | '+' | 'o')[][];
type Grid = {
  readonly array: GridArray;
  readonly fixedSandStart: Point;
  sandCount: number;
};

const SAND_START: Point = [500, 0];

// const displayGrid = (grid: Grid): void => {
//   grid.array.forEach((line) => console.log(line.join('')));
// };

const readRockWalls = (input: readonly string[]): readonly RockWall[] =>
  input.map((line) =>
    line.split(' -> ').map((point) => point.split(',').map(Number) as Point),
  );

const drawLineInArray = (gridArray: GridArray, p1: Point, p2: Point) => {
  const minX = p1[0] < p2[0] ? p1[0] : p2[0];
  const minY = p1[1] < p2[1] ? p1[1] : p2[1];
  const maxX = p1[0] > p2[0] ? p1[0] : p2[0];
  const maxY = p1[1] > p2[1] ? p1[1] : p2[1];

  for (let y = minY; y <= maxY; y += 1)
    for (let x = minX; x <= maxX; x += 1) gridArray[y]![x] = '#';
};

const createGrid = (
  rockWalls: readonly RockWall[],
  infiniteGround: boolean,
): Grid => {
  const allPoints = [...rockWalls.flat(1), SAND_START];
  const minX = arrayMin(allPoints.map(([x]) => x));
  const minY = arrayMin(allPoints.map(([_, y]) => y));
  const maxX = arrayMax(allPoints.map(([x]) => x));
  const maxY = arrayMax(allPoints.map(([_, y]) => y));
  const lengthX = maxX - minX;
  const lengthY = maxY - minY;

  if (infiniteGround) {
    return createGrid(
      [
        ...rockWalls,
        [
          [minX - lengthY - 1, maxY + 2],
          [maxX + lengthY + 1, maxY + 2],
        ],
      ],
      false,
    );
  }

  const array: GridArray = Array.from({ length: lengthY + 1 }, () =>
    Array.from({ length: lengthX + 1 }, () => '.' as const),
  );

  const fixedSandStart: Point = [SAND_START[0] - minX, SAND_START[1] - minY];
  array[fixedSandStart[1]]![fixedSandStart[0]] = '+';

  rockWalls.forEach((points) => {
    const fixedPoints = points.map(([x, y]) => [x - minX, y - minY] as Point);
    for (let i = 1; i < fixedPoints.length; i += 1)
      drawLineInArray(array, fixedPoints[i - 1]!, fixedPoints[i]!);
  });

  return {
    array,
    fixedSandStart,
    sandCount: 0,
  };
};

const moveSand = (grid: Grid, pos: Point): [Point, boolean] => {
  const [x, y] = pos;

  if (y >= grid.array.length - 1 || x === 0 || x === grid.array[0]!.length - 1)
    return [pos, false];

  if (grid.array[y + 1]![x] === '.') {
    return moveSand(grid, [x, y + 1]);
  } else if (x > 0 && grid.array[y + 1]![x - 1] === '.') {
    return moveSand(grid, [x - 1, y + 1]);
  } else if (
    x < grid.array[0]!.length - 1 &&
    grid.array[y + 1]![x + 1] === '.'
  ) {
    return moveSand(grid, [x + 1, y + 1]);
  }

  return [pos, true];
};

const simulateSand = (grid: Grid): boolean => {
  const sand = grid.fixedSandStart;
  const [newPos, canContinue] = moveSand(grid, sand);
  grid.array[newPos[1]]![newPos[0]] = 'o';
  if (canContinue) grid.sandCount += 1;
  return canContinue;
};

const runSimulation = (
  rockWalls: readonly RockWall[],
  infiniteGround: boolean,
): number => {
  const grid = createGrid(rockWalls, infiniteGround);

  while (
    simulateSand(grid) &&
    grid.array[grid.fixedSandStart[1]]![grid.fixedSandStart[0]] !== 'o'
  );

  return grid.sandCount;
};

day(14, (input, part) => {
  const rockWalls = readRockWalls(input);

  part(1, () => runSimulation(rockWalls, false));
  part(2, () => runSimulation(rockWalls, true));
});
