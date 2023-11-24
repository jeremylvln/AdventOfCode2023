import { day } from './lib';
import { arrayMax, arrayMin } from './utils';

type Point3D = [x: number, y: number, z: number];
type CuboidProjection = Map<string, boolean>;

const FACES_POSITIONS: readonly Point3D[] = [
  [-1, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, -1],
  [0, 0, 1],
];

const createCuboidProjection = (
  points: readonly Point3D[],
): [CuboidProjection, Point3D] => {
  const minX = arrayMin(points.map(([x]) => x)) - 1;
  const minY = arrayMin(points.map(([_, y]) => y)) - 1;
  const minZ = arrayMin(points.map(([_, __, z]) => z)) - 1;
  const maxX = arrayMax(points.map(([x]) => x)) + 1;
  const maxY = arrayMax(points.map(([_, y]) => y)) + 1;
  const maxZ = arrayMax(points.map(([_, __, z]) => z)) + 1;
  const projection = new Map();

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        projection.set(
          `${x};${y};${z}`,
          points.findIndex(
            ([px, py, pz]) => px === x && py === y && pz === z,
          ) !== -1,
        );
      }
    }
  }

  const origin: Point3D = [minX, minY, minZ];
  return [projection, origin];
};

const deleteOutsidePoints = (
  projection: CuboidProjection,
  origin: Point3D,
): void => {
  const queue: Point3D[] = [origin];

  while (queue.length > 0) {
    const [x, y, z] = queue.shift()!;
    if (projection.get(`${x};${y};${z}`) === false) {
      projection.delete(`${x};${y};${z}`);
      queue.push(
        ...FACES_POSITIONS.map(
          ([fx, fy, fz]): Point3D => [x + fx, y + fy, z + fz],
        ),
      );
    }
  }
};

const countExposedFaces = (
  projection: CuboidProjection,
  [x, y, z]: Point3D,
  countMissingPoint: boolean,
): number =>
  FACES_POSITIONS.map(([fx, fy, fz]) => {
    const content = projection.get(`${x + fx};${y + fy};${z + fz}`);
    return content === undefined || (countMissingPoint && content === false);
  }).reduce((acc, exposed) => acc + (exposed ? 1 : 0), 0);

day(18, (input, part) => {
  const points: readonly Point3D[] = input.map(
    (line) => line.split(',').map(Number) as Point3D,
  );

  const [projection, origin] = createCuboidProjection(points);
  deleteOutsidePoints(projection, origin);

  part(1, () =>
    points.reduce(
      (acc, [x, y, z]) => acc + countExposedFaces(projection, [x, y, z], true),
      0,
    ),
  );

  part(2, () =>
    points.reduce(
      (acc, [x, y, z]) => acc + countExposedFaces(projection, [x, y, z], false),
      0,
    ),
  );
});
