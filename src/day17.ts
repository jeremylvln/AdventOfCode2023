import { day } from './lib';

type JetMove = '<' | '>';
type GridLine = string;
type Grid = GridLine[];

type Shape = readonly string[];

const SHAPES: readonly Shape[] = [
  ['####'],
  ['.#.', '###', '.#.'],
  ['..#', '..#', '###'],
  ['#', '#', '#', '#'],
  ['##', '##'],
];

const canPlaceShapeAt = (
  grid: Grid,
  shape: Shape,
  y: number,
  x: number,
): boolean => {
  const shapeH = shape.length;
  const shapeW = shape[0]!.length;

  for (let sy = 0; sy < shapeH; sy += 1) {
    const projectedY = y - shapeH + sy + 1;
    const shapeLine = shape[shapeH - 1 - sy]!;
    const gridLine = grid[projectedY]!;

    for (let sx = 0; sx < shapeW; sx += 1) {
      const projectedX = x + sx;
      if (shapeLine.charAt(sx) === '#' && gridLine.charAt(projectedX) === '#')
        return false;
    }
  }

  return true;
};

const placeShapeAt = (grid: Grid, shape: Shape, y: number, x: number) => {
  const shapeH = shape.length;
  const shapeW = shape[0]!.length;

  for (let sy = 0; sy < shapeH; sy += 1) {
    const projectedY = y - shapeH + sy + 1;
    const shapeLine = shape[shapeH - 1 - sy]!;
    const gridLine = grid[projectedY]!;

    let mergedSlice = '';

    for (let sx = 0; sx < shapeW; sx += 1) {
      const projectedX = x + sx;
      if (gridLine[projectedX] === '#' || shapeLine[sx] === '#')
        mergedSlice += '#';
      else mergedSlice += '.';
    }

    const newGridLine = grid[projectedY]!.split('');
    newGridLine.splice(x, mergedSlice.length, mergedSlice);
    grid[projectedY] = newGridLine.join('');
  }

  while (grid[grid.length - 1] === '.......') grid.pop();
};

const simulateShape = (
  grid: Grid,
  shape: Shape,
  jetMoves: readonly JetMove[],
  jetMoveIndex: number,
): number => {
  grid.push('.......', '.......', '.......');
  shape.forEach(() => grid.push('.......'));

  const shapeH = shape.length;
  const shapeW = shape[0]!.length;
  let shapeX = 2;
  let shapeY = grid.length - 1;

  const moveJet = (): boolean => {
    const jetMove = jetMoves[jetMoveIndex]!;
    jetMoveIndex = (jetMoveIndex + 1) % jetMoves.length;

    if (
      (jetMove === '<' && shapeX === 0) ||
      (jetMove === '>' && shapeX + shapeW >= grid[0]!.length)
    ) {
      return false;
    }

    const dx = jetMove === '<' ? -1 : 1;
    if (!canPlaceShapeAt(grid, shape, shapeY, shapeX + dx)) return false;
    shapeX += dx;
    return true;
  };

  const moveDown = (): boolean => {
    if (
      shapeY - shapeH === -1 ||
      !canPlaceShapeAt(grid, shape, shapeY - 1, shapeX)
    )
      return false;
    shapeY -= 1;
    return true;
  };

  while (true) {
    moveJet();
    const movedDown = moveDown();
    if (!movedDown) break;
  }

  placeShapeAt(grid, shape, shapeY, shapeX);
  return jetMoveIndex;
};

const createRememberKey = (
  grid: Grid,
  shapeIndex: number,
  jetMoveIndex: number,
): string => {
  const rows = Array.from(
    { length: Math.min(10, grid.length) },
    (_, y) => grid[grid.length - 1 - y]!,
  ).flatMap((row) => row);
  return `${shapeIndex}-${jetMoveIndex}-${rows}`;
};

const runSimulation = (nb: number, jetMoves: readonly JetMove[]): number => {
  const grid: Grid = [];
  const rememberedHeights: Record<string, [i: number, h: number]> = {};
  let shapeIndex = 0;
  let jetMoveIndex = 0;
  let trimmedHeight = 0;

  for (let i = 0; i < nb; i += 1) {
    const shape = SHAPES[shapeIndex]!;
    const rememberKey = createRememberKey(grid, shapeIndex, jetMoveIndex);

    jetMoveIndex = simulateShape(grid, shape, jetMoves, jetMoveIndex);
    shapeIndex = (shapeIndex + 1) % SHAPES.length;

    if (rememberKey in rememberedHeights) {
      const [rememberedIndex, rememberedHeight] =
        rememberedHeights[rememberKey]!;

      const deltaIndex = i - rememberedIndex;
      const deltaHeight = grid.length - rememberedHeight;

      const cycleAmount = Math.floor((nb - rememberedIndex) / deltaIndex) - 1;
      trimmedHeight += cycleAmount * deltaHeight;
      i += cycleAmount * deltaIndex;
    } else {
      rememberedHeights[rememberKey] = [i, grid.length];
    }
  }

  return trimmedHeight + grid.length;
};

day(17, (input, part) => {
  const jetMoves: readonly JetMove[] = input[0]!.split('') as JetMove[];

  part(1, () => runSimulation(2022, jetMoves));
  part(2, () => runSimulation(1000000000000, jetMoves));
});
