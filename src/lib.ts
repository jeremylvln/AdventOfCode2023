import * as fs from 'node:fs';
import * as path from 'node:path';

type DayNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25;

type PartNumber = 1 | 2;

type PartOutput = string | number;
type PartFn = (part: PartNumber, handler: () => PartOutput) => void;

const createPartFunction =
  (day: DayNumber): PartFn =>
  (part, handler) => {
    const output = handler();
    console.log(`Output of day ${day}-${part} is: ${output}`);
  };

export const day = (
  nb: DayNumber,
  handler: (input: readonly string[], part: PartFn) => void,
) => {
  const inputPath = path.join(__dirname, '..', 'inputs', `day${nb}.txt`);
  const input = fs.readFileSync(inputPath, 'utf8').split('\n');
  return handler(input, createPartFunction(nb));
};
