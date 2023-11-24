import { day } from './lib';
import { arrayMin, Readonly2DArray } from './utils';

const ALTITUDE_VALUES = 'abcdefghijklmnopqrstuvwxyz';

type Node = {
  readonly x: number;
  readonly y: number;
  readonly altitude: number;
  readonly specialAttribute: 'start' | 'end' | null;
  readonly links: Node[];
  readonly parent: null;
};

type ProcessedNode = Omit<Node, 'links' | 'parent'> & {
  readonly links: readonly ProcessedNode[];
  parent: ProcessedNode | null;
};

type GridGraph = [
  start: ProcessedNode,
  allLowest: ProcessedNode[],
  allNodes: Readonly2DArray<ProcessedNode>,
];

const isLinkable = (currentAltitude: number, targetAltitude: number): boolean =>
  targetAltitude <= currentAltitude || targetAltitude === currentAltitude + 1;

const createGridGraph = (rawGrid: Readonly2DArray<string>): GridGraph => {
  const allNodes: Readonly2DArray<Node> = rawGrid.map((line, y) =>
    line.reduce(
      (acc, tile, x) => [
        ...acc,
        {
          x,
          y,
          altitude: ALTITUDE_VALUES.indexOf(
            tile === 'S' ? 'a' : tile === 'E' ? 'z' : tile,
          ),
          specialAttribute:
            tile === 'S' ? 'start' : tile === 'E' ? 'end' : null,
          links: [],
          parent: null,
        },
      ],
      [] as Node[],
    ),
  );

  const maxX = allNodes[0]!.length;
  const maxY = allNodes.length;

  // eslint-disable-next-line sonarjs/cognitive-complexity
  allNodes.forEach((line, y) =>
    line.forEach((node, x) => {
      const top = y > 0 ? allNodes[y - 1]![x]! : null;
      const right = x < maxX - 1 ? allNodes[y]![x + 1]! : null;
      const bottom = y < maxY - 1 ? allNodes[y + 1]![x]! : null;
      const left = x > 0 ? allNodes[y]![x - 1]! : null;

      if (top && isLinkable(node.altitude, top.altitude)) node.links.push(top);
      if (right && isLinkable(node.altitude, right.altitude))
        node.links.push(right);
      if (bottom && isLinkable(node.altitude, bottom.altitude))
        node.links.push(bottom);
      if (left && isLinkable(node.altitude, left.altitude))
        node.links.push(left);
    }),
  );

  const start = allNodes
    .map((line) => line.find((node) => node.specialAttribute === 'start'))
    .find((node) => typeof node !== 'undefined')!;
  const allLowest = allNodes.flatMap((line) =>
    line.filter((node) => node.altitude === 0),
  );

  return [start, allLowest, allNodes];
};

const bfs = (start: ProcessedNode): ProcessedNode | null => {
  const queue: ProcessedNode[] = [start];
  const explored: ProcessedNode[] = [start];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node.specialAttribute === 'end') return node;

    const linksToExplore = node.links.filter(
      (link) => !explored.includes(link),
    );

    explored.push(...linksToExplore);
    linksToExplore.forEach((link) => (link.parent = node));
    queue.push(...linksToExplore);
  }

  return null;
};

const countStepsUntilStart = (node: ProcessedNode): number => {
  if (node.parent === null) return 0;
  return countStepsUntilStart(node.parent!) + 1;
};

day(12, (input, part) => {
  const rawGrid: Readonly2DArray<string> = input.map((line) => line.split(''));

  part(1, () => {
    const [startingNode] = createGridGraph(rawGrid);
    const foundExit = bfs(startingNode)!;
    return countStepsUntilStart(foundExit);
  });
  part(2, () => {
    const [_, allLowest, allNodes] = createGridGraph(rawGrid);
    const scores = allLowest.map((startingNode) => {
      allNodes.forEach((line) => line.forEach((node) => (node.parent = null)));
      const foundExit = bfs(startingNode);
      if (!foundExit) return Number.MAX_SAFE_INTEGER;
      return countStepsUntilStart(foundExit);
    });

    return arrayMin(scores);
  });
});
