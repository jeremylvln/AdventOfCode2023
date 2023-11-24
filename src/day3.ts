import { day } from './lib';
import { chunkArray } from './utils';

const LETTER_PRIORITIES =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

day(3, (input, part) => {
  part(1, () => {
    const compartments = input.map(
      (line) =>
        [line.slice(0, line.length / 2), line.slice(line.length / 2)] as [
          string,
          string,
        ],
    );

    const bothCompartmentsLetters = compartments.map(
      ([first, second]) =>
        first.split('').find((char) => second.includes(char)) as string,
    );

    return bothCompartmentsLetters.reduce(
      (acc, letter) => acc + LETTER_PRIORITIES.indexOf(letter) + 1,
      0,
    );
  });

  part(2, () => {
    const groups = chunkArray(input, 3) as [string, string, string][];
    const badges = groups.map(
      ([first, second, third]) =>
        first
          .split('')
          .find(
            (char) => second?.includes(char) && third?.includes(char),
          ) as string,
    );

    return badges.reduce(
      (acc, letter) => acc + LETTER_PRIORITIES.indexOf(letter) + 1,
      0,
    );
  });
});
