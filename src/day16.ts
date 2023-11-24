import { day } from './lib';
import { arrayMax } from './utils';

const INPUT_LINE_REGEX =
  /Valve\s([A-Z]+)\shas\sflow\srate=(\d+);\stunnels?\sleads?\sto\svalves?\s(.+)/;

type Node = {
  readonly name: string;
  readonly pressure: number;
  readonly tunnels: readonly string[];
  readonly costs: Record<string, number>;
};

type Graph = {
  readonly notEmptyNodes: readonly Node[];
  readonly startNode: Node;
};

const parseInput = (input: readonly string[]): Graph => {
  const allNodes: readonly Node[] = input
    .map((line) => INPUT_LINE_REGEX.exec(line)!)
    .map(([_, name, pressure, tunnels]) => ({
      name: name!,
      pressure: Number(pressure!),
      tunnels: tunnels!.split(', '),
      costs: {},
      opened: false,
    }));

  const nodesByName: Record<string, Node> = allNodes.reduce(
    (acc, node) => ({ ...acc, [node.name]: node }),
    {},
  );

  Object.values(nodesByName)
    .filter((node) => node.name === 'AA' || node.pressure > 0)
    .forEach((node) => {
      node.costs[node.name] = 0;

      const queue: string[] = [node.name];
      const visited = new Set<string>().add(node.name);

      while (queue.length > 0) {
        const head = queue.shift()!;

        for (const subnode of nodesByName[head]!.tunnels) {
          if (!visited.has(subnode)) {
            visited.add(subnode);
            node.costs[subnode] = node.costs[head]! + 1;
            queue.push(subnode);
          }
        }
      }
    });

  return {
    notEmptyNodes: allNodes.filter((node) => node.pressure > 0),
    startNode: allNodes.find((node) => node.name === 'AA')!,
  };
};

const pathToPressure: Record<string, number> = {};
const getMaxPressure = (
  graph: Graph,
  currentNode: Node,
  timeLeft: number,
  visited: readonly string[] = [],
  pathPressure = 0,
): number => {
  const visitedKey = [...visited].sort().join('');
  pathToPressure[visitedKey] = Math.max(
    pathToPressure[visitedKey] ?? 0,
    pathPressure,
  );

  const possiblePressures = graph.notEmptyNodes
    .filter(
      (node) => node.name !== currentNode.name && !visited.includes(node.name),
    )
    .map((node) => {
      const timeLeftConsidered = timeLeft - currentNode.costs[node.name]! - 1;
      return timeLeftConsidered > 0
        ? getMaxPressure(
            graph,
            node,
            timeLeftConsidered,
            [node.name, ...visited],
            pathPressure + node.pressure * timeLeftConsidered,
          )
        : 0;
    });

  return possiblePressures.length > 0
    ? arrayMax(possiblePressures)
    : pathPressure;
};

const fillMissingPathsInBestMap = (nodeNames: string[]): number => {
  const pathKey = nodeNames.join('');
  if (pathKey in pathToPressure) return pathToPressure[pathKey]!;

  const maxPressure = arrayMax(
    nodeNames.map((nodeName) => {
      const rest = nodeNames.filter((entry) => entry !== nodeName);
      return fillMissingPathsInBestMap(rest);
    }),
  );

  pathToPressure[pathKey] = maxPressure;
  return maxPressure;
};

day(16, (input, part) => {
  const graph = parseInput(input);

  part(1, () => getMaxPressure(graph, graph.startNode, 30));

  // part(2, () => {
  //   pathToPressure = {};
  //   const nonEmptyNodesNamesExceptStart = graph.notEmptyNodes
  //     .map((node) => node.name)
  //     .filter((name) => name !== 'AA')
  //     .sort();

  //   getMaxPressure(graph, graph.startNode, 26);
  //   fillMissingPathsInBestMap(nonEmptyNodesNamesExceptStart);

  //   return arrayMax(
  //     Object.entries(pathToPressure).map(([playerPath, playerPressure]) => {
  //       const elephantPath = nonEmptyNodesNamesExceptStart.reduce(
  //         (acc, name) => acc + (!playerPath.includes(name) ? name : ''),
  //         '',
  //       );
  //       return playerPressure + pathToPressure[elephantPath]!;
  //     }),
  //   );
  // });
});
