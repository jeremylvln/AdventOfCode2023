import { day } from './lib';
import { arrayMax, arrayMin } from './utils';

const INPUT_LINE_REGEX =
  /Sensor\sat\sx=(-?\d+),\sy=(-?\d+):\sclosest\sbeacon\sis\sat\sx=(-?\d+),\sy=(-?\d+)/;

// const PART1_LINE_TO_TEST = 10;
const PART1_LINE_TO_TEST = 2000000;

// const PART2_RECTANGLE_SIZE = 20;
const PART2_RECTANGLE_SIZE = 4000000;

type Point = readonly [number, number];
type SensorAndBeacon = readonly [
  sensor: Point,
  beacon: Point,
  distance: number,
];

const manhattanDistance = (p1: Point, p2: Point): number =>
  Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);

const parseInput = (input: readonly string[]): readonly SensorAndBeacon[] =>
  input.map((line) => {
    const res = INPUT_LINE_REGEX.exec(line)!;
    const sensorPos: Point = [Number(res[1]), Number(res[2])];
    const beaconPos: Point = [Number(res[3]), Number(res[4])];
    const distance = manhattanDistance(sensorPos, beaconPos);
    return [sensorPos, beaconPos, distance];
  });

const canContainABeacon = (
  sensors: readonly SensorAndBeacon[],
  [x, y]: Point,
  shouldPositionBeFree: boolean,
): boolean => {
  const isOnASensorOrBeacon = sensors.some(
    ([[sensorX, sensorY], [beaconX, beaconY]]) =>
      (x === sensorX && y === sensorY) || (x === beaconX && y === beaconY),
  );
  if (isOnASensorOrBeacon) return !shouldPositionBeFree;

  return !sensors.some(
    ([sensor, _, distance]) => manhattanDistance(sensor, [x, y]) <= distance,
  );
};

const listPointsForDistance = (
  [centerX, centerY]: Point,
  distance: number,
): readonly Point[] => {
  const points: Point[] = [];

  /**
   * If it is guaranteed that there is only one point possible
   * it is necessarily on the border of a cube. So to ease our
   * brute-forcing, we can only iterate on all the points located
   * around the shape, so all the points on a `distance + 1` with
   * the sensor as center.
   */

  for (let d = 0; d <= distance; d += 1) {
    /**
     *    1
     *   3 1
     *  2 c 1
     *   2 4
     *    2
     */

    // 1
    if (
      centerX + d >= 0 &&
      centerX + d <= PART2_RECTANGLE_SIZE &&
      centerY - distance + d >= 0 &&
      centerY - distance + d <= PART2_RECTANGLE_SIZE
    ) {
      points.push([centerX + d, centerY - distance + d]);
    }

    // 2
    if (
      centerX - distance + d >= 0 &&
      centerX - distance + d <= PART2_RECTANGLE_SIZE &&
      centerY + d >= 0 &&
      centerY + d <= PART2_RECTANGLE_SIZE
    ) {
      points.push([centerX - distance + d, centerY + d]);
    }

    // 3
    if (
      centerX - d >= 0 &&
      centerX - d <= PART2_RECTANGLE_SIZE &&
      centerY - distance + d >= 0 &&
      centerY - distance + d <= PART2_RECTANGLE_SIZE
    ) {
      points.push([centerX - d, centerY - distance + d]);
    }

    // 4
    if (
      centerX + distance - d >= 0 &&
      centerX + distance - d <= PART2_RECTANGLE_SIZE &&
      centerY + d >= 0 &&
      centerY + d <= PART2_RECTANGLE_SIZE
    ) {
      points.push([centerX + distance - d, centerY + d]);
    }
  }

  /**
   * The angles will be duplicated, so there will be 4 times
   * the 4 angles, but the filtering is not worth the complexity.
   */

  return points;
};

day(15, (input, part) => {
  const sensors = parseInput(input);
  const allX = sensors.flatMap(([[sensorX], [beaconX], distance]) => [
    sensorX,
    beaconX,
    sensorX - distance - 1,
    sensorX + distance + 1,
  ]);
  const minX = arrayMin(allX);
  const maxX = arrayMax(allX);
  const pointsPerLine = maxX - minX + 1;

  part(
    1,
    () =>
      Array.from(
        { length: pointsPerLine },
        (_, i): Point => [minX + i, PART1_LINE_TO_TEST],
      ).filter((point) => !canContainABeacon(sensors, point, false)).length,
  );

  part(2, () => {
    const [foundX, foundY]: Point = sensors.reduce(
      (found, [sensor, _, distance]) =>
        found ??
        listPointsForDistance(sensor, distance + 1).find(([x, y]) =>
          canContainABeacon(sensors, [x, y], true),
        ),
      undefined as Point | undefined,
    )!;

    return foundX * 4000000 + foundY;
  });
});
