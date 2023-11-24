import { match } from 'ts-pattern';

import { day } from './lib';
import { impossible } from './utils';

type MoveLetter = 'U' | 'R' | 'D' | 'L';
type Step = [MoveLetter, number];

type Position = [x: number, y: number];

type Grid = {
  readonly uniqueTailPositions: Set<string>;
  applyStep: (step: Step) => void;
};

const subPosition = (p1: Position, p2: Position): Position => [
  p1[0] - p2[0],
  p1[1] - p2[1],
];

const getNewPositionFromDelta = (
  pos: Position,
  dx: number,
  dy: number,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): Position => {
  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return pos;
  else if (dx === 0 && dy > 0) return [pos[0], pos[1] + dy - 1];
  else if (dx === 0 && dy < 0) return [pos[0], pos[1] + dy + 1];
  else if (dx > 0 && dy === 0) return [pos[0] + dx - 1, pos[1]];
  else if (dx < 0 && dy === 0) return [pos[0] + dx + 1, pos[1]];
  else if (dx > 0 && dy > 0) return [pos[0] + 1, pos[1] + 1];
  else if (dx > 0 && dy < 0) return [pos[0] + 1, pos[1] - 1];
  else if (dx < 0 && dy > 0) return [pos[0] - 1, pos[1] + 1];
  else if (dx < 0 && dy < 0) return [pos[0] - 1, pos[1] - 1];
  return impossible();
};

const createGrid = (partSymbols: string[]): Grid => {
  const partPositions: Position[] = partSymbols.map(() => [0, 0]);
  const uniqueTailPositions = new Set<string>();
  uniqueTailPositions.add(partPositions[partPositions.length - 1]!.toString());

  const movePart = (index: number) => {
    const ahead = partPositions[index - 1]!;
    const part = partPositions[index]!;
    const [dx, dy] = subPosition(ahead, part);

    partPositions[index] = getNewPositionFromDelta(part, dx, dy);

    if (index === partPositions.length - 1)
      uniqueTailPositions.add(part.toString());
  };

  const applyStep = ([move, nb]: Step): void => {
    Array.from({ length: nb }).forEach(() => {
      const head = partPositions[0]!;
      partPositions[0] = match(move)
        .with('U', () => [head[0], head[1] + 1] as Position)
        .with('R', () => [head[0] + 1, head[1]] as Position)
        .with('D', () => [head[0], head[1] - 1] as Position)
        .with('L', () => [head[0] - 1, head[1]] as Position)
        .exhaustive();

      partPositions.slice(1).forEach((_, i) => movePart(i + 1));
    });
  };

  return {
    uniqueTailPositions,
    applyStep,
  };
};

day(9, (input, part) => {
  const steps: Step[] = input.map((line) => [
    line.split(' ')[0] as MoveLetter,
    Number(line.split(' ')[1]),
  ]);

  part(1, () => {
    const grid = createGrid(['H', 'T']);
    steps.forEach((step) => grid.applyStep(step));
    return grid.uniqueTailPositions.size;
  });

  part(2, () => {
    const grid = createGrid(['H', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    steps.forEach((step) => grid.applyStep(step));
    return grid.uniqueTailPositions.size;
  });
});
