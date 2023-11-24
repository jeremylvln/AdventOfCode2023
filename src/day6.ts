import { day } from './lib';

const onlyDifferentCharacters =
  (length: number) =>
  (input: string): boolean =>
    input.length === length && new Set(input).size === length;

const isStartOfPacketMarker = onlyDifferentCharacters(4);
const isStartOfMessageMarker = onlyDifferentCharacters(14);

day(6, (input, part) => {
  const line = input[0]!;

  part(1, () => {
    let index = 4;
    while (!isStartOfPacketMarker(line.slice(index - 4, index))) index += 1;
    return index;
  });

  part(2, () => {
    let index = 14;
    while (!isStartOfMessageMarker(line.slice(index - 14, index))) index += 1;
    return index;
  });
});
